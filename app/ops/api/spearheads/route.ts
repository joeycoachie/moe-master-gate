import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { adminError, isArchitect, unauthorized } from '@/lib/architectGate';

// The Spearhead library (T-016): every operator's profile, newest version first.
// One home: each profile is a note on that operator's Outreach card whose text starts with
// "SPEARHEAD PROFILE". Nothing is stored twice; older versions stay as history.
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isArchitect())) return unauthorized();
  try {
    const db = getSupabaseAdmin();
    const [targets, notes] = await Promise.all([
      db.from('outreach_targets').select('id, studio, owner_name, stage, road, area, contact, next_step, next_date'),
      db.from('outreach_events').select('target_id, body, created_at').eq('kind', 'note').ilike('body', 'SPEARHEAD PROFILE%').order('created_at', { ascending: false }),
    ]);
    if (targets.error) throw new Error(targets.error.message);
    if (notes.error) throw new Error(notes.error.message);
    const byId = new Map((targets.data ?? []).map((t) => [t.id, t]));
    const profiles = new Map<string, { target: (typeof targets.data)[number]; latest: string; updated: string; versions: number }>();
    for (const n of notes.data ?? []) {
      const t = byId.get(n.target_id);
      if (!t) continue;
      const p = profiles.get(n.target_id);
      if (p) p.versions++;
      else profiles.set(n.target_id, { target: t, latest: n.body, updated: n.created_at, versions: 1 });
    }
    return NextResponse.json({ profiles: [...profiles.values()] });
  } catch (err) {
    return adminError(err);
  }
}
