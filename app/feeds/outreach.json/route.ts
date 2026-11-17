import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { outreachFeedKey, timingSafeStringsEqual } from '@/lib/opsSession';

// The Outreach Console as read-only data for agents (Claude Code, Aria), so they read the cards and
// notes straight from the database instead of the founder pasting them. Same private key as the
// calendar feed (?key=, shown in Founder Command). Read-only: no way to change anything from here.
// Studio business data only; no client health data lives in these tables.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key') ?? '';
  if (!key || !timingSafeStringsEqual(key, outreachFeedKey())) return new Response('Not found.', { status: 404 });
  const days = Math.min(365, Math.max(1, Number(url.searchParams.get('days')) || 30));
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
    { headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' } },
  );
}
