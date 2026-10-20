import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  OPS_COOKIE_NAME,
  OPS_ARCHITECT_COOKIE_NAME,
  isValidOpsSessionToken,
  isValidOpsArchitectToken,
} from '@/lib/opsSession';

// /ops/api/outreach/report checks its own key (Vercel Cron's CRON_SECRET or the SYS.OP cookie).
// /ops/architect gates itself with the Architect code (which also grants an Ops
// session), so it must stay reachable without Danny's Ops passcode.
const PUBLIC_OPS_PATHS = new Set(['/ops/login', '/ops/api/login', '/ops/architect', '/ops/api/sync', '/ops/api/outreach/report']);

// The boundary: studio.theoperatorplaybook.com is the outside (public deck and Studio Guide);
// terminal.theoperatorplaybook.com is the inside, where everyone signs in. Team pages live inside only.
const INSIDE_ORIGIN = 'https://terminal.theoperatorplaybook.com';
const TEAM_PAGES = /^\/recup\/(login|team|log)(\/|$)/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (TEAM_PAGES.test(pathname) && request.headers.get('host')?.startsWith('studio.')) {
    return NextResponse.redirect(new URL(pathname, INSIDE_ORIGIN));
  }
  if (pathname.startsWith('/recup/')) return NextResponse.next();

  // studio.theoperatorplaybook.com is the public sales page; its root shows /studio.
  if (pathname === '/') {
    return request.headers.get('host')?.startsWith('studio.')
      ? NextResponse.rewrite(new URL('/studio', request.url))
      : NextResponse.next();
  }

  if (PUBLIC_OPS_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // The Armory, the Intelligence Archive and Founder Command are Architect-only: an Ops session alone isn't enough, and the way
  // in is the SYNC.OP gate on /ops/architect, not Danny's login.
  const architectArea = ['/ops/armory', '/ops/archive', '/ops/command', '/ops/clients', '/ops/outreach', '/ops/partners'].find(
    (base) => pathname === base || pathname.startsWith(`${base}/`),
  );
  if (architectArea) {
    if (!isValidOpsArchitectToken(request.cookies.get(OPS_ARCHITECT_COOKIE_NAME)?.value)) {
      return NextResponse.redirect(new URL(`/ops/architect?next=${architectArea}`, request.url));
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
  matcher: ['/', '/ops/:path*', '/recup/:path*'],
};
