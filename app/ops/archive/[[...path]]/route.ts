import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readFile } from 'fs/promises';
import path from 'path';
import { OPS_ARCHITECT_COOKIE_NAME, isValidOpsArchitectToken } from '@/lib/opsSession';

// The Intelligence Archive (archive/ in this repo), served as-is behind SYS.OP so it
// can be opened from any device. Only the two viewer pages, the JSON under archive/data,
// the Brain Pack (/ops/archive/brain) and full-text docs are reachable; the rest stays private.
const ARCHIVE_ROOT = path.join(process.cwd(), 'archive');
const PAGES = new Set(['index.html', 'mandate.html']);
const DATA_PATH = /^data\/[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)?\.json$/;
// Full-text documents (archive/docs/<ID>.md), served as plain text.
const DOC_PATH = /^docs\/[A-Za-z0-9_.-]+\.md$/;

// Attached files (archive/files/<ID>/<name>), e.g. print files and QR codes.
const FILE_PATH = /^files\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\.(pdf|png|svg|html)$/;
const FILE_TYPES: Record<string, string> = { pdf: 'application/pdf', png: 'image/png', svg: 'image/svg+xml', html: 'text/html; charset=utf-8' };

const escapeHtml = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// The Brain Pack (archive/BRAIN.md, built by archive/scripts/brain.mjs) with one COPY button,
// so the founder can paste the same source of truth into any agent from a phone.
function brainPage(md: string) {
  const version = md.split('\n')[0].replace(/^# /, '');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Brain Pack</title>
<style>body{margin:0;background:#050505;color:#ddd;font:13px/1.55 ui-monospace,Menlo,monospace}header{position:sticky;top:0;background:#050505;border-bottom:1px solid #222;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
h1{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#a855f7;margin:0}button{background:#a855f7;color:#000;border:0;padding:10px 16px;font:700 11px ui-monospace,monospace;letter-spacing:.15em;cursor:pointer}
p{margin:6px 0 0;color:#888;font-size:11px}pre{white-space:pre-wrap;word-wrap:break-word;padding:16px;margin:0}</style></head><body>
<header><div><h1>${escapeHtml(version)}</h1><p>Paste into any agent at the start of a chat. Same pack for Claude, Gemini (KA-Alex) and ChatGPT.</p></div><button id="c">COPY BRAIN PACK</button></header>
<pre id="t">${escapeHtml(md)}</pre>
<script>document.getElementById('c').onclick=async()=>{const b=document.getElementById('c');try{await navigator.clipboard.writeText(document.getElementById('t').textContent);b.textContent='COPIED'}catch(e){b.textContent='SELECT ALL AND COPY'}setTimeout(()=>b.textContent='COPY BRAIN PACK',2500)}</script>
</body></html>`;
}

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

  if (rel === 'brain') {
    const md = await readFile(path.join(ARCHIVE_ROOT, 'BRAIN.md'), 'utf8');
    return new NextResponse(`${brainPage(md).replace(/<\/body>/i, `${RETURN_LINK}</body>`)}`, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...PRIVATE_HEADERS },
    });
  }

  if (rel === 'BRAIN.md') {
    const md = await readFile(path.join(ARCHIVE_ROOT, 'BRAIN.md'), 'utf8');
    return new NextResponse(md, { headers: { 'Content-Type': 'text/plain; charset=utf-8', ...PRIVATE_HEADERS } });
  }

  if (FILE_PATH.test(rel)) {
    try {
      const buf = await readFile(path.join(ARCHIVE_ROOT, rel));
      return new NextResponse(new Uint8Array(buf), { headers: { 'Content-Type': FILE_TYPES[rel.split('.').pop() as string], ...PRIVATE_HEADERS } });
    } catch {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }
  }

  if (DOC_PATH.test(rel)) {
    try {
      const md = await readFile(path.join(ARCHIVE_ROOT, rel), 'utf8');
      return new NextResponse(md, { headers: { 'Content-Type': 'text/plain; charset=utf-8', ...PRIVATE_HEADERS } });
    } catch {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }
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
