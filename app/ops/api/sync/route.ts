import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  OPS_COOKIE_NAME,
  OPS_ARCHITECT_COOKIE_NAME,
  createOpsArchitectToken,
  createOpsSessionToken,
  isValidOpsArchitectToken,
  timingSafeStringsEqual,
} from '@/lib/opsSession';

// Server-side only, so the passcode never ships in the client bundle.
// OPS_ARCHITECT_PASSCODE overrides the default without a code change.
const DEFAULT_ARCHITECT_PASSCODE = 'srank';

// Lets pages outside /ops (e.g. the /terminal hub) ask whether SYS.OP is keyed in.
export async function GET() {
  const cookieStore = await cookies();
  const architect = isValidOpsArchitectToken(cookieStore.get(OPS_ARCHITECT_COOKIE_NAME)?.value);
  return NextResponse.json({ architect });
}

export async function POST(request: Request) {
  let body: { passcode?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const expected = process.env.OPS_ARCHITECT_PASSCODE || DEFAULT_ARCHITECT_PASSCODE;
  if (typeof body.passcode !== 'string' || !timingSafeStringsEqual(body.passcode, expected)) {
    return NextResponse.json({ error: 'Invalid code.' }, { status: 401 });
  }

  // The Architect outranks Ops, so the Architect code also grants the Ops session
  // the roster API needs — one code to get in, no need for Danny's passcode.
  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
  const ops = createOpsSessionToken();
  cookieStore.set(OPS_COOKIE_NAME, ops.token, { ...cookieOptions, maxAge: ops.maxAge });
  const architect = createOpsArchitectToken();
  cookieStore.set(OPS_ARCHITECT_COOKIE_NAME, architect.token, { ...cookieOptions, maxAge: architect.maxAge });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(OPS_ARCHITECT_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
