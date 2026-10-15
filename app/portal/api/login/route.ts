import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { CLIENT_COOKIE_NAME, createClientSessionToken, hashPortalCode, normalizePortalCode } from '@/lib/clientSession';

// Client portal sign-in with the personal code from the founder. Fails the same way for
// unknown, disabled and malformed codes, after a short delay, so codes can't be probed.
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
  if (typeof body.code !== 'string' || normalizePortalCode(body.code).length !== 13) return fail();

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('clients')
      .select('id, status')
      .eq('portal_code_hash', hashPortalCode(body.code))
      .eq('portal_enabled', true)
      .maybeSingle();
    if (error || !data || data.status === 'archived') return fail();

    const cookieStore = await cookies();
    const session = createClientSessionToken(data.id);
    cookieStore.set(CLIENT_COOKIE_NAME, session.token, {
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
