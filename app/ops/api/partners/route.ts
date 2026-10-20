import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { adminError, isArchitect, unauthorized } from '@/lib/architectGate';
import { currentTeamCode, hashTeamCode, teamCodeFor } from '@/lib/teamSession';
import { studioKey } from '@/lib/recupTeam';

// Founder view of the RECUP.STN team: partners, their codes, and every studio they hold.
// Separate from the founder's own Outreach Console data; a studio on both lists is flagged.

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const db = getSupabaseAdmin;

function partnersError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  if (/recup_partner/.test(message) && /does not exist|Could not find the table/i.test(message)) {
    return NextResponse.json({ error: 'Team not set up yet: run database/18_recup_team.sql in Supabase.', setup: true }, { status: 503 });
  }
  return adminError(err);
}

export async function GET() {
  if (!(await isArchitect())) return unauthorized();
  try {
    const [partners, targets, founder] = await Promise.all([
      db().from('recup_partners').select('id, full_name, phone, active, created_at, code_hash').order('created_at'),
      db().from('recup_partner_targets').select('*').order('created_at'),
      db().from('outreach_targets').select('studio'),
    ]);
    if (partners.error) throw new Error(partners.error.message);
    if (targets.error) throw new Error(targets.error.message);
    const founderKeys = new Set((founder.data ?? []).map((t) => studioKey(t.studio as string)));
    return NextResponse.json({
      // Founder only: each partner's current code, so it is never lost. Hashes never leave the server.
      partners: (partners.data ?? []).map(({ code_hash, ...p }) => ({ ...p, code: currentTeamCode(p.full_name as string, p.id as string, code_hash as string | null)?.code ?? null })),
      targets: (targets.data ?? []).map((t) => ({ ...t, clash: founderKeys.has(t.studio_key as string) })),
    });
  } catch (err) {
    return partnersError(err);
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
  try {
    switch (b.action) {
      case 'add_partner': {
        const fullName = str(b.full_name);
        if (!fullName) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
        const { data: row, error } = await db().from('recup_partners').insert({ full_name: fullName, phone: str(b.phone) }).select('id').single();
        if (error) throw new Error(error.message);
        const code = teamCodeFor(fullName, row.id as string, 0);
        const { error: codeErr } = await db().from('recup_partners').update({ code_hash: hashTeamCode(code) }).eq('id', row.id);
        if (codeErr) throw new Error(codeErr.message);
        return NextResponse.json({ ok: true, code });
      }
      case 'new_code': {
        const { data: p, error: readErr } = await db().from('recup_partners').select('id, full_name, code_hash').eq('id', str(b.id)).single();
        if (readErr) throw new Error(readErr.message);
        const now = currentTeamCode(p.full_name as string, p.id as string, p.code_hash as string | null);
        const code = teamCodeFor(p.full_name as string, p.id as string, now ? now.n + 1 : 0);
        const { error } = await db().from('recup_partners').update({ code_hash: hashTeamCode(code), active: true }).eq('id', str(b.id));
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true, code }); // the old code stops working
      }
      case 'set_active': {
        const { error } = await db().from('recup_partners').update({ active: b.active === true }).eq('id', str(b.id));
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
    }
  } catch (err) {
    return partnersError(err);
  }
}
