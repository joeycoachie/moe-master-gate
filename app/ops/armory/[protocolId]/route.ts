import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readFile } from 'fs/promises';
import path from 'path';
import { OPS_ARCHITECT_COOKIE_NAME, isValidOpsArchitectToken } from '@/lib/opsSession';
import { findProtocol, readProtocolHtml } from '@/lib/armory';

// Small fixed link back to the Armory index, injected at serve time so the
// protocol HTML in armory/protocols stays byte-identical to its source repo.
const RETURN_LINK = `<a href="/ops/armory" style="position:fixed;right:16px;bottom:72px;z-index:50;font:500 10px 'JetBrains Mono',monospace;letter-spacing:.15em;color:#a855f7;background:#050505;border:1px solid #a855f7;padding:6px 10px;text-decoration:none">&larr; ARMORY</a>`;

export async function GET(request: Request, { params }: { params: Promise<{ protocolId: string }> }) {
  // Defense in depth: proxy.ts already gates /ops/armory, but never assume it ran.
  const cookieStore = await cookies();
  if (!isValidOpsArchitectToken(cookieStore.get(OPS_ARCHITECT_COOKIE_NAME)?.value)) {
    return NextResponse.redirect(new URL('/ops/architect?next=/ops/armory', request.url));
  }

  const { protocolId } = await params;
  const protocol = findProtocol(protocolId);
  if (!protocol) {
    return NextResponse.json({ error: 'Protocol not found.' }, { status: 404 });
  }

  const html = await readProtocolHtml(protocol);
  // The Client Log bar (armory/client-bar.js) reads the arc's own PROTOCOL_DB, so it works
  // on every SYS-D022 V2 arc without touching the arc file.
  const clientBar = await readFile(path.join(process.cwd(), 'armory', 'client-bar.js'), 'utf8');
  const injected =
    RETURN_LINK +
    `<script>window.__MOE_PROTOCOL_ID=${JSON.stringify(protocol.id)};</script>` +
    `<script>${clientBar}</script>`;
  const end = html.lastIndexOf('</body>');
  const served = end === -1 ? html + injected : html.slice(0, end) + injected + html.slice(end);
  return new NextResponse(served, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
