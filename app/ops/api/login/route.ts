import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { OPS_COOKIE_NAME, createOpsSessionToken, timingSafeStringsEqual } from '@/lib/opsSession';

export async function POST(request: Request) {
  const expectedPasscode = process.env.OPS_ROSTER_PASSCODE;
  if (!expectedPasscode) {
    return NextResponse.json({ error: 'Ops access is not configured.' }, { status: 500 });
  }

  let body: { passcode?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (typeof body.passcode !== 'string' || !timingSafeStringsEqual(body.passcode, expectedPasscode)) {
    return NextResponse.json({ error: 'Invalid access code.' }, { status: 401 });
  }

  const { token, maxAge } = createOpsSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(OPS_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });

  return NextResponse.json({ ok: true });
}
