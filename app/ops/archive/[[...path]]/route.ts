import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readFile } from 'fs/promises';
import path from 'path';
import { OPS_ARCHITECT_COOKIE_NAME, isValidOpsArchitectToken } from '@/lib/opsSession';

// The Intelligence Archive (archive/ in this repo), served as-is behind SYS.OP so it
// can be opened from any device. Only the two viewer pages and the JSON under
// archive/data are reachable; everything else in the folder stays private.
const ARCHIVE_ROOT = path.join(process.cwd(), 'archive');
const PAGES = new Set(['index.html', 'mandate.html']);
const DATA_PATH = /^data\/[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)?\.json$/;

const RETURN_LINK = `<a href="/terminal" style="position:fixed;right:16px;bottom:16px;z-index:50;font:500 10px 'JetBrains Mono',monospace;letter-spacing:.15em;color:#a855f7;background:#050505;border:1px solid #a855f7;padding:6px 10px;text-decoration:none">&larr; TERMINAL</a>`;

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
};

export async function GET(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  // Defense in depth: proxy.ts already gates /ops/archive, but never assume it ran.
  const cookieStore = await cookies();
  if (!isValidOpsArchitectToken(cookieStore.get(OPS_ARCHITECT_COOKIE_NAME)?.value)) {
    return NextResponse.redirect(new URL('/ops/architect?next=/ops/archive', request.url));
  }

  const rel = ((await params).path ?? []).join('/') || 'index.html';

  if (PAGES.has(rel)) {
    const html = await readFile(path.join(ARCHIVE_ROOT, rel), 'utf8');
    // <base> makes the pages' relative links (data/..., mandate.html) resolve under /ops/archive/.
    const served = html
      .replace(/<head>/i, '<head><base href="/ops/archive/">')
      .replace(/<\/body>/i, `${RETURN_LINK}</body>`);
    return new NextResponse(served, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...PRIVATE_HEADERS },
    });
  }

  if (DATA_PATH.test(rel)) {
    try {
      const json = await readFile(path.join(ARCHIVE_ROOT, rel), 'utf8');
      return new NextResponse(json, {
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...PRIVATE_HEADERS },
      });
    } catch {
      // fall through to 404
    }
  }

  return NextResponse.json({ error: 'Not found.' }, { status: 404 });
}
