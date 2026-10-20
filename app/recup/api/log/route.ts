import { NextResponse } from 'next/server';
import { getSupabaseAdmin, AdminNotConfiguredError } from '@/lib/supabaseAdmin';
import { currentPartnerId } from '@/lib/teamSession';
import { TEAM_STAGES, studioKey, type TeamStage } from '@/lib/recupTeam';

// A partner's own studio log. Every read and write is scoped to the signed-in partner;
// a partner never sees anyone else's studios, only that a studio is already taken.

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const db = getSupabaseAdmin;

function teamError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  if (err instanceof AdminNotConfiguredError || /recup_partner/.test(message)) {
    return NextResponse.json({ error: 'The team log is not switched on yet. Ask Joey.' }, { status: 503 });
  }
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET() {
  const partnerId = await currentPartnerId();
  if (!partnerId) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  try {
    const [partner, targets] = await Promise.all([
      db().from('recup_partners').select('full_name, active').eq('id', partnerId).single(),
      db().from('recup_partner_targets').select('*').eq('partner_id', partnerId).order('created_at'),
    ]);
    if (partner.error) throw new Error(partner.error.message);
    if (!partner.data.active) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    if (targets.error) throw new Error(targets.error.message);
    return NextResponse.json({ name: partner.data.full_name, targets: targets.data });
  } catch (err) {
    return teamError(err);
  }
}

export async function POST(request: Request) {
  const partnerId = await currentPartnerId();
  if (!partnerId) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  let b: Record<string, unknown>;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const now = new Date().toISOString();
  const id = str(b.id);
  // Every change except "add" must be on this partner's own studio.
  const own = async () => {
    const { data } = await db().from('recup_partner_targets').select('id, stage, stage_at').eq('id', id).eq('partner_id', partnerId).maybeSingle();
    return data;
  };

  try {
    switch (b.action) {
      case 'add': {
        const studio = str(b.studio);
        const key = studioKey(studio);
        if (!key) return NextResponse.json({ error: 'Add the studio name.' }, { status: 400 });
        // One claim per studio, across every partner and the founder's own list.
        const { data: taken } = await db().from('recup_partner_targets').select('partner_id, recup_partners(full_name)').eq('studio_key', key).maybeSingle();
        if (taken) {
          const who = taken.partner_id === partnerId ? 'you' : ((taken.recup_partners as unknown as { full_name: string } | null)?.full_name.split(' ')[0] ?? 'another partner');
          return NextResponse.json({ error: `Already taken by ${who}. Ask Joey before contacting them.` }, { status: 409 });
        }
        const founder = await db().from('outreach_targets').select('studio');
        if (!founder.error && (founder.data ?? []).some((t) => studioKey(t.studio as string) === key)) {
          return NextResponse.json({ error: 'Joey is already in touch with this studio. Ask him before contacting them.' }, { status: 409 });
        }
        const { error } = await db().from('recup_partner_targets').insert({
          partner_id: partnerId, studio, studio_key: key, area: str(b.area), contact: str(b.contact), notes: str(b.notes),
        });
        if (error) throw new Error(error.code === '23505' ? 'Already taken. Ask Joey before contacting them.' : error.message);
        break;
      }
      case 'set_stage': {
        const t = await own();
        if (!t) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
        const stage = str(b.stage) as TeamStage;
        if (![...TEAM_STAGES, 'no'].includes(stage)) return NextResponse.json({ error: 'Unknown step.' }, { status: 400 });
        const stageAt = { ...(t.stage_at as Record<string, string>) };
        if (stage === 'no') stageAt.no ??= now;
        else for (const s of TEAM_STAGES.slice(1, TEAM_STAGES.indexOf(stage) + 1)) stageAt[s] ??= now;
        const { error } = await db().from('recup_partner_targets').update({ stage, stage_at: stageAt, last_touch_at: now, updated_at: now }).eq('id', id);
        if (error) throw new Error(error.message);
        await db().from('recup_partner_events').insert({ target_id: id, partner_id: partnerId, kind: 'stage', stage });
        break;
      }
      case 'followup': {
        if (!(await own())) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
        const { error } = await db().from('recup_partner_targets').update({ last_touch_at: now, updated_at: now }).eq('id', id);
        if (error) throw new Error(error.message);
        await db().from('recup_partner_events').insert({ target_id: id, partner_id: partnerId, kind: 'followup', body: str(b.body) });
        break;
      }
      case 'update': {
        if (!(await own())) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
        const patch: Record<string, unknown> = { updated_at: now };
        for (const k of ['contact', 'next_step', 'notes', 'area'] as const) if (typeof b[k] === 'string') patch[k] = str(b[k]);
        if ('next_date' in b) patch.next_date = str(b.next_date) || null;
        const { error } = await db().from('recup_partner_targets').update(patch).eq('id', id);
        if (error) throw new Error(error.message);
        break;
      }
      case 'release': {
        // Hands the studio back so someone else can take it. History goes with it.
        if (!(await own())) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
        const { error } = await db().from('recup_partner_targets').delete().eq('id', id);
        if (error) throw new Error(error.message);
        break;
      }
      default:
        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return teamError(err);
  }
}
