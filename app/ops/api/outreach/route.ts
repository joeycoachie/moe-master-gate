import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { adminError, isArchitect, unauthorized } from '@/lib/architectGate';
import { STAGES, plainCheck, type Stage } from '@/lib/outreach';

// Outreach Console data. Owner names and contacts go through the service key only, behind SYS.OP.

const TEXT_FIELDS = ['studio', 'owner_name', 'area', 'contact', 'fit_note', 'batch', 'friction', 'next_step'] as const;

function outreachError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  if (/relation .*outreach.* does not exist|Could not find the table 'public\.outreach/i.test(message)) {
    return NextResponse.json(
      { error: 'Outreach Console not set up yet: run database/14_outreach_console.sql in Supabase.', setup: true },
      { status: 503 },
    );
  }
  if (/column .*(road|use_when).* does not exist|Could not find the '(road|use_when)' column/i.test(message)) {
    return NextResponse.json(
      { error: 'Two roads not switched on yet: run database/16_outreach_two_roads.sql in Supabase.', setup: true },
      { status: 503 },
    );
  }
  return adminError(err);
}

const road = (v: unknown) => (v === 'fuel' || v === 'kinetic' ? v : undefined);

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

export async function GET() {
  if (!(await isArchitect())) return unauthorized();
  try {
    const db = getSupabaseAdmin();
    const [variants, targets, events] = await Promise.all([
      db.from('outreach_variants').select('*').order('code'),
      db.from('outreach_targets').select('*').order('created_at'),
      db.from('outreach_events').select('*').order('created_at', { ascending: false }).limit(500),
    ]);
    for (const r of [variants, targets, events]) if (r.error) throw new Error(r.error.message);
    return NextResponse.json({ variants: variants.data, targets: targets.data, events: events.data });
  } catch (err) {
    return outreachError(err);
  }
}

export async function POST(request: Request) {
  if (!(await isArchitect())) return unauthorized();
  let b: Record<string, unknown>;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const db = getSupabaseAdmin;
  const now = new Date().toISOString();
  const id = str(b.id);

  try {
    switch (b.action) {
      case 'add_target': {
        const studio = str(b.studio);
        if (!studio) return NextResponse.json({ error: 'Studio name is required.' }, { status: 400 });
        const row: Record<string, unknown> = { studio, variant_id: str(b.variant_id) || null };
        for (const k of TEXT_FIELDS) if (k !== 'studio') row[k] = str(b[k]);
        if (road(b.road)) row.road = road(b.road);
        // A studio can start part-way along (e.g. it already said yes on the Fuel road).
        const start = str(b.stage) as Stage;
        if (STAGES.includes(start as (typeof STAGES)[number]) && start !== 'found') {
          row.stage = start;
          row.stage_at = Object.fromEntries(STAGES.slice(1, STAGES.indexOf(start as (typeof STAGES)[number]) + 1).map((s) => [s, now]));
          row.last_touch_at = now;
        }
        const { error } = await db().from('outreach_targets').insert(row);
        if (error) throw new Error(error.message);
        break;
      }
      case 'update_target': {
        const patch: Record<string, unknown> = { updated_at: now };
        for (const k of TEXT_FIELDS) if (typeof b[k] === 'string') patch[k] = str(b[k]);
        if ('variant_id' in b) patch.variant_id = str(b.variant_id) || null;
        if (road(b.road)) patch.road = road(b.road);
        if ('next_date' in b) patch.next_date = str(b.next_date) || null;
        const { error } = await db().from('outreach_targets').update(patch).eq('id', id);
        if (error) throw new Error(error.message);
        break;
      }
      case 'set_stage': {
        const stage = str(b.stage) as Stage;
        if (![...STAGES, 'no'].includes(stage)) return NextResponse.json({ error: 'Unknown stage.' }, { status: 400 });
        const { data: t, error: readErr } = await db().from('outreach_targets').select('stage_at, variant_id').eq('id', id).single();
        if (readErr) throw new Error(readErr.message);
        // Keep the first time each stage was reached, and fill in skipped earlier stages
        // (e.g. marking "call booked" means they replied).
        const stageAt = { ...(t.stage_at as Record<string, string>) };
        if (stage !== 'no') for (const s of STAGES.slice(1, STAGES.indexOf(stage as (typeof STAGES)[number]) + 1)) stageAt[s] ??= now;
        else stageAt.no ??= now;
        const { error } = await db()
          .from('outreach_targets')
          .update({ stage, stage_at: stageAt, last_touch_at: now, updated_at: now })
          .eq('id', id);
        if (error) throw new Error(error.message);
        await db().from('outreach_events').insert({ target_id: id, variant_id: t.variant_id, kind: 'stage', stage, body: str(b.body) });
        break;
      }
      // A rung of the no-reply ladder: follow-up with a gift, cold call, studio visit.
      case 'touch': {
        const kind = str(b.kind);
        if (!['followup', 'call', 'visit'].includes(kind)) return NextResponse.json({ error: 'Unknown touch.' }, { status: 400 });
        const { data: t, error: readErr } = await db().from('outreach_targets').select('followups, variant_id').eq('id', id).single();
        if (readErr) throw new Error(readErr.message);
        const { error } = await db()
          .from('outreach_targets')
          .update({ followups: (t.followups as number) + 1, last_touch_at: now, updated_at: now })
          .eq('id', id);
        if (error) throw new Error(error.message);
        await db().from('outreach_events').insert({ target_id: id, variant_id: t.variant_id, kind, body: str(b.body) });
        break;
      }
      case 'delete_target': {
        const { error } = await db().from('outreach_targets').delete().eq('id', id);
        if (error) throw new Error(error.message);
        break;
      }
      case 'add_variant': {
        const code = str(b.code).toUpperCase();
        const body = str(b.body);
        if (!code || !body) return NextResponse.json({ error: 'Code and message are required.' }, { status: 400 });
        const check = plainCheck(body);
        if (check.banned) return NextResponse.json({ error: `Plain-language check: ${check.issues.join(' · ')}` }, { status: 400 });
        const row: Record<string, unknown> = { code, body, angle: str(b.angle) };
        if (road(b.road)) row.road = road(b.road);
        if (str(b.use_when)) row.use_when = str(b.use_when);
        const { error } = await db().from('outreach_variants').insert(row);
        if (error) throw new Error(error.code === '23505' ? `${code} already exists.` : error.message);
        break;
      }
      case 'set_variant_status': {
        const status = str(b.status);
        if (!['testing', 'winner', 'retired'].includes(status)) return NextResponse.json({ error: 'Unknown status.' }, { status: 400 });
        const { error } = await db().from('outreach_variants').update({ status }).eq('id', id);
        if (error) throw new Error(error.message);
        break;
      }
      case 'lesson': {
        const body = str(b.body);
        if (!body) return NextResponse.json({ error: 'Write the lesson first.' }, { status: 400 });
        const { error } = await db().from('outreach_events').insert({ kind: 'lesson', body, variant_id: str(b.variant_id) || null });
        if (error) throw new Error(error.message);
        break;
      }
      default:
        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return outreachError(err);
  }
}
