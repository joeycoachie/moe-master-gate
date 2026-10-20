import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { TEAM_COOKIE_NAME, createTeamSessionToken, hashTeamCode, normalizeTeamCode } from '@/lib/teamSession';

// Team sign-in with the code the founder issued. Fails the same way for unknown, disabled and
// malformed codes, after a short delay, so codes can't be probed.
export async function POST(request: Request) {
  let body: { code?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const fail = async () => {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: 'Code not recognised.' }, { status: 401 });
  };
  const code = typeof body.code === 'string' ? normalizeTeamCode(body.code) : '';
  if (!code.startsWith('TEAM') || code.length < 12 || code.length > 30) return fail();

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('recup_partners')
      .select('id, active')
      .eq('code_hash', hashTeamCode(code))
      .maybeSingle();
    if (error || !data || !data.active) return fail();
    const session = createTeamSessionToken(data.id);
    (await cookies()).set(TEAM_COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: session.maxAge,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return fail();
  }
}
