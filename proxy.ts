import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { OPS_COOKIE_NAME, isValidOpsSessionToken } from '@/lib/opsSession';

const PUBLIC_OPS_PATHS = new Set(['/ops/login', '/ops/api/login']);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_OPS_PATHS.has(pathname)) {
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
