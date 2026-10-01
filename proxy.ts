import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  OPS_COOKIE_NAME,
  OPS_ARCHITECT_COOKIE_NAME,
  isValidOpsSessionToken,
  isValidOpsArchitectToken,
} from '@/lib/opsSession';

// /ops/architect gates itself with the Architect code (which also grants an Ops
// session), so it must stay reachable without Danny's Ops passcode.
const PUBLIC_OPS_PATHS = new Set(['/ops/login', '/ops/api/login', '/ops/architect', '/ops/api/sync']);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_OPS_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // The Armory is Architect-only: an Ops session alone isn't enough, and the way
  // in is the SYNC.OP gate on /ops/architect, not Danny's login.
  if (pathname === '/ops/armory' || pathname.startsWith('/ops/armory/')) {
    if (!isValidOpsArchitectToken(request.cookies.get(OPS_ARCHITECT_COOKIE_NAME)?.value)) {
      return NextResponse.redirect(new URL('/ops/architect?next=/ops/armory', request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(OPS_COOKIE_NAME)?.value;
  if (!isValidOpsSessionToken(token)) {
    if (pathname.startsWith('/ops/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/ops/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/ops/:path*'],
};
