import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { OPS_ARCHITECT_COOKIE_NAME, isValidOpsArchitectToken } from '@/lib/opsSession';
import { markdownToHtml } from '@/lib/markdown';

export const metadata = {
  title: 'Doctrine | M.O.E. Architect',
  robots: { index: false, follow: false },
};

const DIR = path.join(process.cwd(), 'armory', 'doctrine');
const NAME = /^[A-Za-z0-9._-]+\.md$/;

// The single source of truth for battle cards: SYS-D022 (newest version first) and every
// transmission to and from KA-Alex (newest first), read straight from armory/doctrine/.
export default async function OpsDoctrinePage({ searchParams }: { searchParams: Promise<{ doc?: string }> }) {
  const cookieStore = await cookies();
  if (!isValidOpsArchitectToken(cookieStore.get(OPS_ARCHITECT_COOKIE_NAME)?.value)) {
    redirect('/ops/architect?next=/ops/armory/doctrine');
  }

  const files = (await readdir(DIR)).filter((f) => NAME.test(f));
  const doctrine = files.filter((f) => f.startsWith('SYS-')).sort().reverse();
  const transmissions = files.filter((f) => f.startsWith('TRANSMISSION_')).sort().reverse();
  const { doc } = await searchParams;
  const current = doc && files.includes(doc) ? doc : doctrine[0];
  const html = current ? markdownToHtml(await readFile(path.join(DIR, current), 'utf8')) : '';
  const label = (f: string) => f.replace(/\.md$/, '').replace(/^TRANSMISSION_/, '').replace(/_/g, ' ');

  const link = (f: string) => (
    <a
      key={f}
      href={`/ops/armory/doctrine?doc=${encodeURIComponent(f)}`}
      className={`block px-3 py-2 text-xs border-l-2 ${f === current ? 'border-[#a855f7] text-white bg-[#111]' : 'border-transparent text-[#9b9b9b] hover:text-white'}`}
    >
      {label(f)}
    </a>
  );

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-5 md:p-8 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1">
        <header className="border-b border-[#222] pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="text-[10px] text-[#a855f7] tracking-[4px] uppercase">ARCHITECT — SINGLE SOURCE OF TRUTH</div>
            <h1 className="text-3xl font-bold mt-1">Card Doctrine</h1>
            <p className="text-xs text-[#9b9b9b] mt-2">The rules every battle card follows, and every message to and from KA-Alex.</p>
          </div>
          <a href="/ops/armory" className="border border-[#333] px-4 py-2 text-xs text-[#9b9b9b] hover:text-white hover:border-[#a855f7]">
            ← ARMORY
          </a>
        </header>

        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          <nav className="space-y-6">
            <div>
              <div className="text-[10px] text-[#9b9b9b] uppercase tracking-[3px] mb-2">Doctrine (newest first)</div>
              {doctrine.map(link)}
            </div>
            <div>
              <div className="text-[10px] text-[#9b9b9b] uppercase tracking-[3px] mb-2">Transmissions</div>
              {transmissions.map(link)}
            </div>
          </nav>
          <article className="font-sans text-[15px] leading-relaxed min-w-0" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto pt-12 mt-auto">
        <footer className="w-full border-t border-[#222] pt-8 pb-4 text-center">
          <p className="text-[10px] text-[#4CAF50] tracking-[0.2em] uppercase mb-2">Cleared For Human Performance</p>
          <p className="text-[10px] text-[#555] tracking-[0.2em] uppercase">&copy; 2026 The M.O.E. Group. All Rights Reserved.</p>
        </footer>
      </div>
    </main>
  );
}
