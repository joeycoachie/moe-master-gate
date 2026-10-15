'use client';

import { useEffect, useState } from 'react';

type Session = {
  date: string;
  arc: string;
  week: number | null;
  title: string;
  done: number;
  total: number;
  gates: { name: string; result: string }[];
  felt: string[];
};
type Fuel = { key: string; title: string; group: string; tag: string; desc: string; benefits: string[]; usage: string; dose: string };
type View = { firstName: string; arc: string | null; promise: string | null; sessions: Session[]; fuel: Fuel[]; recupLinked: boolean };

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// MOE-MASTER-GATE client portal (Kinetic menu, Pillar 3): a client's own file, read-only.
export default function ClientPortalPage() {
  const [view, setView] = useState<View | null>(null);
  const [state, setState] = useState<'loading' | 'signin' | 'ready' | 'error'>('loading');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () =>
    fetch('/portal/api/me', { cache: 'no-store' })
      .then(async (res) => {
        if (res.status === 401) {
          setState('signin');
          return;
        }
        const body = await res.json();
        if (!res.ok) {
          setError(body.error || 'Your file is unavailable right now.');
          setState('error');
          return;
        }
        setView(body);
        setState('ready');
      })
      .catch(() => {
        setError('Connection failed.');
        setState('error');
      });

  useEffect(() => {
    load();
  }, []);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/portal/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        setError('Code not recognised. Check it and try again.');
        return;
      }
      setCode('');
      setState('loading');
      await load();
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await fetch('/portal/api/logout', { method: 'POST' });
    setView(null);
    setState('signin');
  };

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 p-5 md:p-8">
        <header className="border-b border-[#222] pb-5 mb-6 flex justify-between items-center gap-3">
          <div>
            <div className="text-[10px] text-[#00e5ff] tracking-[4px] uppercase">The M.O.E. Group · Client File</div>
            <h1 className="text-2xl font-bold mt-1">{view ? `${view.firstName}'s Architecture` : 'MOE-MASTER-GATE'}</h1>
          </div>
          {state === 'ready' && (
            <button onClick={signOut} className="border border-[#333] px-3 py-2 text-[10px] tracking-widest text-[#888] hover:text-white">
              SIGN OUT
            </button>
          )}
        </header>

        {state === 'loading' && <p className="text-xs text-[#555]">Loading your file…</p>}

        {state === 'error' && <div className="border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444] text-xs p-4">{error}</div>}

        {state === 'signin' && (
          <form onSubmit={signIn} className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-6">
            <p className="text-xs text-[#888] max-w-sm">Enter the personal code your coach gave you to open your file.</p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. ELEINE-482917"
              autoComplete="off"
              autoCapitalize="characters"
              autoFocus
              disabled={busy}
              className="w-full max-w-xs bg-transparent border-b border-[#333] text-white text-lg py-3 text-center outline-none tracking-[3px] focus:border-[#00e5ff] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={busy || !code.trim()}
              className="border border-[#00e5ff] text-[#00e5ff] px-6 py-2 text-xs tracking-widest hover:bg-[#00e5ff] hover:text-black transition-colors disabled:opacity-40"
            >
              {busy ? 'OPENING…' : 'OPEN MY FILE'}
            </button>
            {error && <p className="text-[11px] text-[#ef4444]">{error}</p>}
          </form>
        )}

        {state === 'ready' && view && (
          <div className="space-y-10">
            <section className="border border-[#222] bg-[#0a0a0a] p-5 border-l-4 border-l-[#00e5ff]">
              <div className="text-[10px] text-[#888] uppercase tracking-widest mb-1">Current programme</div>
              <div className="text-lg font-bold">{view.arc ?? 'Being set by your coach'}</div>
              {view.promise && <p className="text-xs text-[#ccc] font-sans leading-relaxed mt-2">{view.promise}</p>}
              <div className="text-xs text-[#888] mt-2">
                {view.sessions.length} session{view.sessions.length === 1 ? '' : 's'} on record
                {view.fuel.length ? ` · ${view.fuel.length} fuel item${view.fuel.length === 1 ? '' : 's'} in your plan` : ''}
              </div>
            </section>

            <section>
              <h2 className="text-sm text-[#888] uppercase tracking-widest border-l-2 border-[#00e5ff] pl-3 mb-4">Your sessions</h2>
              {!view.sessions.length && <p className="text-xs text-[#555]">Your first session will appear here.</p>}
              <ol className="space-y-4">
                {view.sessions.map((s, i) => (
                  <li key={i} className="border border-[#222] bg-[#0a0a0a] p-5">
                    <div className="flex justify-between items-start gap-3 flex-wrap mb-3">
                      <div>
                        <div className="text-[#00e5ff] text-sm">{formatDate(s.date)}</div>
                        <div className="text-xs text-[#ccc] mt-1">
                          {s.arc}
                          {s.week ? ` · Week ${s.week}` : ''}: {s.title}
                        </div>
                      </div>
                      <span className="text-[10px] text-[#888] border border-[#333] px-2 py-0.5 whitespace-nowrap">
                        {s.done} of {s.total} movements
                      </span>
                    </div>
                    {s.gates.length > 0 && (
                      <div className="border-t border-[#1a1a1a] pt-3 space-y-1">
                        <div className="text-[9px] text-[#666] uppercase tracking-widest mb-1">End-of-session check</div>
                        {s.gates.map((g, j) => (
                          <p key={j} className="text-[11px] text-[#aaa]">
                            <span className="text-[#666]">{g.name}:</span> {g.result}
                          </p>
                        ))}
                        {s.felt.length > 0 && <p className="text-[11px] text-[#aaa]"><span className="text-[#666]">You felt:</span> {s.felt.join(' · ')}</p>}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            {view.fuel.length > 0 && (
              <section>
                <h2 className="text-sm text-[#888] uppercase tracking-widest border-l-2 border-[#4CAF50] pl-3 mb-4">Your fuel protocol</h2>
                <div className="space-y-4">
                  {view.fuel.map((f) => (
                    <div key={f.key} className="border border-[#222] bg-[#0a0a0a] p-5">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div className="text-base font-bold">{f.title}</div>
                        {f.tag && <span className="text-[9px] text-[#4CAF50] border border-[#4CAF50]/40 px-2 py-0.5 tracking-widest">{f.tag}</span>}
                      </div>
                      <p className="text-xs text-[#ccc] font-sans leading-relaxed">{f.desc}</p>
                      {f.benefits.length > 0 && (
                        <ul className="mt-3 space-y-1">
                          {f.benefits.map((b, j) => (
                            <li key={j} className="text-[11px] text-[#aaa] font-sans">· {b}</li>
                          ))}
                        </ul>
                      )}
                      <p className="mt-3 text-[11px] text-white border-t border-[#1a1a1a] pt-3">
                        <span className="text-[#666]">How to take it:</span> {f.dose || f.usage}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* ISOLATED ENTERPRISE FOOTER */}
      <div className="w-full max-w-2xl mx-auto pt-12 mt-auto px-5">
        <footer className="w-full border-t border-[#222] pt-8 pb-4 text-center">
          <p className="text-[10px] text-[#4CAF50] tracking-[0.2em] uppercase mb-2">Cleared For Human Performance</p>
          <p className="text-[10px] text-[#555] tracking-[0.2em] uppercase">&copy; 2026 The M.O.E. Group. All Rights Reserved.</p>
        </footer>
      </div>
    </main>
  );
}
