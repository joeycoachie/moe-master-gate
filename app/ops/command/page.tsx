import { readFile } from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { OPS_ARCHITECT_COOKIE_NAME, isValidOpsArchitectToken } from '@/lib/opsSession';
import { markdownToHtml } from '@/lib/markdown';

export const metadata = {
  title: 'Command | M.O.E. Architect',
  robots: { index: false, follow: false },
};

const HUB = path.join(process.cwd(), 'hub');

// Founder Command: the roadmap plus the full change ledger, read straight from the hub
// files so this page never drifts from what every agent reads.
export default async function OpsCommandPage() {
  const cookieStore = await cookies();
  if (!isValidOpsArchitectToken(cookieStore.get(OPS_ARCHITECT_COOKIE_NAME)?.value)) {
    redirect('/ops/architect?next=/ops/command');
  }

  const [roadmap, ledger] = await Promise.all([
    readFile(path.join(HUB, 'ROADMAP.md'), 'utf8'),
    readFile(path.join(HUB, 'LEDGER.md'), 'utf8'),
  ]);

  // Ledger lines look like "- 2026-10-09 · Product · what changed · ref". Newest first.
  const entries = ledger
    .split('\n')
    .filter((l) => /^- \d{4}-\d{2}-\d{2} · /.test(l))
    .map((l) => {
      const [date, product, ...rest] = l.slice(2).split(' · ');
      return { date, product, text: rest.join(' · ') };
    })
    .reverse();

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-5 md:p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1">
        <header className="border-b border-[#222] pb-5 mb-6 flex justify-between items-center flex-wrap gap-3">
          <div>
            <div className="text-[10px] text-[#a855f7] tracking-[4px] uppercase">ARCHITECT — SYS.OP</div>
            <h1 className="text-2xl font-bold mt-1">Founder Command</h1>
          </div>
          <nav className="flex gap-2 text-xs">
            <a href="#roadmap" className="border border-[#333] px-3 py-2 text-[#888] hover:text-white">ROADMAP</a>
            <a href="#ledger" className="border border-[#333] px-3 py-2 text-[#888] hover:text-white">LEDGER</a>
            <a href="/terminal" className="border border-[#333] px-3 py-2 text-[#888] hover:text-white">TERMINAL</a>
          </nav>
        </header>

        <section id="roadmap" className="font-sans" dangerouslySetInnerHTML={{ __html: markdownToHtml(roadmap) }} />

        <section id="ledger" className="mt-14">
          <h2 className="text-lg font-bold text-white mb-1 border-b border-[#222] pb-2">Ledger · every change, newest first</h2>
          <p className="text-[11px] text-[#666] mb-4">Written by every product window after each push, deploy or decision. Source: hub/LEDGER.md</p>
          <ol className="space-y-2">
            {entries.map((e, i) => (
              <li key={i} className="border border-[#1a1a1a] bg-[#0a0a0a] p-3">
                <div className="flex gap-3 text-[10px] tracking-widest uppercase mb-1">
                  <span className="text-[#00e5ff]">{e.date}</span>
                  <span className="text-[#888]">{e.product}</span>
                </div>
                <p className="text-xs text-[#ccc] leading-relaxed font-sans">{e.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* ISOLATED ENTERPRISE FOOTER */}
      <div className="w-full max-w-4xl mx-auto pt-12 mt-auto">
        <footer className="w-full border-t border-[#222] pt-8 pb-4 text-center">
          <p className="text-[10px] text-[#4CAF50] tracking-[0.2em] uppercase mb-2">Cleared For Human Performance</p>
          <p className="text-[10px] text-[#555] tracking-[0.2em] uppercase">&copy; 2026 The M.O.E. Group. All Rights Reserved.</p>
        </footer>
      </div>
    </main>
  );
}
