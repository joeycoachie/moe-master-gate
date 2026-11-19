'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

// The Spearhead library (T-016 · P-029 · P-030). 15 seconds before a meeting: open the profile.
// After the meeting: tell Claude, who updates the profile on the operator's Outreach card.
type Profile = {
  target: { id: string; studio: string; owner_name: string; stage: string; area: string; next_step: string; next_date: string | null };
  latest: string;
  updated: string;
  versions: number;
};

const line = (text: string, label: string) => text.split('\n').find((l) => l.toUpperCase().includes(label))?.split(':').slice(1).join(':').trim() ?? '';

export default function SpearheadsPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    fetch('/ops/api/spearheads')
      .then(async (res) => {
        if (res.status === 401) return router.replace('/ops/architect?next=/ops/spearheads');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Could not load the Spearhead library.');
        setProfiles(json.profiles);
      })
      .catch((e) => setError(e.message));
  }, [router]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return profiles
      .filter((p) => !s || `${p.target.studio} ${p.target.owner_name} ${p.latest}`.toLowerCase().includes(s))
      .sort((a, b) => b.updated.localeCompare(a.updated));
  }, [profiles, q]);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#e5e5e5]">
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 font-sans">
        <header className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <div className="text-[10px] font-mono text-[#a855f7] tracking-[4px] uppercase">ARCHITECT · SYS.OP · T-016</div>
            <h1 className="text-2xl font-bold mt-1">Spearhead library</h1>
            <p className="text-sm text-[#aaa] mt-1">Every operator you&apos;ve met, one profile each. Read it 15 seconds before you meet them. Afterwards, tell Claude what happened and the profile updates.</p>
          </div>
          <nav className="flex gap-2 text-xs font-mono">
            <Link href="/ops/outreach" className="border border-[#333] px-3 py-2 text-[#aaa] hover:text-white">OUTREACH</Link>
            <Link href="/terminal" className="border border-[#333] px-3 py-2 text-[#aaa] hover:text-white">TERMINAL</Link>
          </nav>
        </header>

        <input
          className="w-full bg-[#0a0a0a] border border-[#333] px-3 py-2.5 text-[15px] mb-4"
          placeholder="Search a name, a business or a word (e.g. Pilates, MLM, missed)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {error && <p className="border border-[#ff5c72]/60 bg-[#ff5c72]/10 p-3 text-sm mb-4">{error}</p>}
        {!error && !profiles.length && <p className="text-sm text-[#888]">No profiles yet.</p>}

        <ul className="space-y-3">
          {shown.map((p) => {
            const isOpen = open === p.target.id;
            return (
              <li key={p.target.id} className="border border-[#222] bg-[#0a0a0a]">
                <button onClick={() => setOpen(isOpen ? null : p.target.id)} className="w-full text-left p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[16px] font-semibold text-white">{p.target.owner_name || p.target.studio}</span>
                    <span className="text-xs text-[#888]">updated {new Date(p.updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}{p.versions > 1 ? ` · ${p.versions} versions` : ''}</span>
                  </div>
                  <p className="text-sm text-[#aaa] mt-0.5">{p.target.studio} · {p.target.stage.replace('_', ' ')}</p>
                  <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[13px]">
                    <p><span className="text-[#888]">Archetype: </span>{line(p.latest, 'ARCHETYPE') || '—'}</p>
                    <p><span className="text-[#888]">Friction: </span>{line(p.latest, 'FRICTION') || '—'}</p>
                    <p className="sm:col-span-2"><span className="text-[#ffb454]">Next: </span>{line(p.latest, 'NEXT ACTION') || p.target.next_step || '—'}</p>
                  </div>
                </button>
                {isOpen && <pre className="whitespace-pre-wrap break-words border-t border-[#222] p-4 text-[14px] leading-relaxed text-[#ddd] font-sans">{p.latest}</pre>}
              </li>
            );
          })}
        </ul>
      </main>
      <footer className="mt-auto py-6 text-center">
        <p className="text-[10px] text-[#4CAF50] tracking-[0.2em] uppercase">Cleared For Human Performance</p>
      </footer>
    </div>
  );
}
