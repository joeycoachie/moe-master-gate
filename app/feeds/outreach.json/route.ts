import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { outreachAgentKey, outreachFeedKey, timingSafeStringsEqual } from '@/lib/opsSession';

// The Outreach Console for agents (Claude Code on the founder's laptop), so the founder never pastes
// notes. GET reads every card + recent events (calendar key or agent key). POST logs to a card
// (agent key only): a note, a call/visit/follow-up, a next step, or a new card.
// Studio business data only; no client health data lives in these tables.
export const dynamic = 'force-dynamic';

const HEADERS = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };
const str = (v: unknown, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const keyOf = (request: Request) => new URL(request.url).searchParams.get('key') ?? request.headers.get('x-agent-key') ?? '';
const isAgent = (k: string) => Boolean(k) && timingSafeStringsEqual(k, outreachAgentKey());

export async function GET(request: Request) {
  const key = keyOf(request);
  if (!isAgent(key) && !(key && timingSafeStringsEqual(key, outreachFeedKey()))) return new Response('Not found.', { status: 404 });
  const days = Math.min(365, Math.max(1, Number(new URL(request.url).searchParams.get('days')) || 30));
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const db = getSupabaseAdmin();
  const [targets, events, variants] = await Promise.all([
    db.from('outreach_targets').select('*').order('updated_at', { ascending: false }),
    db.from('outreach_events').select('target_id, variant_id, kind, stage, body, created_at').gte('created_at', since).order('created_at', { ascending: false }),
    db.from('outreach_variants').select('id, code'),
  ]);
  const err = targets.error ?? events.error ?? variants.error;
  if (err) return NextResponse.json({ error: 'Feed unavailable.' }, { status: 503 });

  const code = new Map((variants.data ?? []).map((v) => [v.id, v.code]));
  const studio = new Map((targets.data ?? []).map((t) => [t.id, t.studio]));
  return NextResponse.json(
    {
      generated_at: new Date().toISOString(),
      events_since: since,
      targets: (targets.data ?? []).map((t) => ({ ...t, variant: code.get(t.variant_id) ?? null })),
      events: (events.data ?? []).map((e) => ({ ...e, studio: studio.get(e.target_id) ?? null, variant: code.get(e.variant_id) ?? null })),
    },
    { headers: HEADERS },
  );
}

// Body: { action: 'note' | 'touch' | 'update' | 'add', studio, ... }
//   note:   { body }                                  → a note on the card's history
//   touch:  { kind: 'followup'|'call'|'visit', body } → a rung of the no-reply ladder
//   update: { next_step?, next_date?, owner_name?, contact?, friction?, area? }
//   add:    { road: 'fuel'|'kinetic', owner_name?, contact?, area?, batch?, friction?, next_step?, next_date? }
export async function POST(request: Request) {
  if (!isAgent(keyOf(request))) return new Response('Not found.', { status: 404 });
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = str(b.action);
  const name = str(b.studio, 200);
  if (!name) return NextResponse.json({ error: 'studio is required.' }, { status: 400 });
  const db = getSupabaseAdmin();
  const now = new Date().toISOString();

  if (action === 'add') {
    const road = str(b.road) === 'kinetic' ? 'kinetic' : 'fuel';
    const { data, error } = await db
      .from('outreach_targets')
      .insert({
        studio: name, road, owner_name: str(b.owner_name, 200), contact: str(b.contact, 500), area: str(b.area, 200),
        batch: str(b.batch, 100), friction: str(b.friction), next_step: str(b.next_step, 500), next_date: str(b.next_date, 10) || null,
      })
      .select('id, studio, stage')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (str(b.body)) await db.from('outreach_events').insert({ target_id: data.id, kind: 'note', body: str(b.body) });
    return NextResponse.json({ ok: true, target: data }, { headers: HEADERS });
  }

  // Every other action needs exactly one card with this studio name.
  const { data: hits, error: findErr } = await db.from('outreach_targets').select('id, studio, variant_id, followups').ilike('studio', name);
  if (findErr) return NextResponse.json({ error: findErr.message }, { status: 503 });
  if (!hits?.length) return NextResponse.json({ error: `No card named "${name}".` }, { status: 404 });
  if (hits.length > 1) return NextResponse.json({ error: `${hits.length} cards match "${name}". Use the exact name.` }, { status: 409 });
  const t = hits[0];

  if (action === 'note') {
    const body = str(b.body);
    if (!body) return NextResponse.json({ error: 'body is required.' }, { status: 400 });
    const { error } = await db.from('outreach_events').insert({ target_id: t.id, variant_id: t.variant_id, kind: 'note', body });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else if (action === 'touch') {
    const kind = str(b.kind);
    if (!['followup', 'call', 'visit'].includes(kind)) return NextResponse.json({ error: 'kind must be followup, call or visit.' }, { status: 400 });
    const { error } = await db.from('outreach_events').insert({ target_id: t.id, variant_id: t.variant_id, kind, body: str(b.body) });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await db.from('outreach_targets').update({ followups: (t.followups as number) + 1, last_touch_at: now, updated_at: now }).eq('id', t.id);
  } else if (action === 'update') {
    const patch: Record<string, string | null> = { updated_at: now };
    for (const k of ['next_step', 'owner_name', 'contact', 'friction', 'area'] as const) if (typeof b[k] === 'string') patch[k] = str(b[k]);
    if (typeof b.next_date === 'string') patch.next_date = str(b.next_date, 10) || null;
    const { error } = await db.from('outreach_targets').update(patch).eq('id', t.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else {
    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  }
  return NextResponse.json({ ok: true, studio: t.studio }, { headers: HEADERS });
}
