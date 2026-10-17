'use client';

import { useEffect, useState } from 'react';
import { BodyMap, Journey, RecoveryPanel, Ring, TrendChart, resultTone, streak, type Checkin, type Zone } from './visuals';
import { summarize } from '@/lib/recovery';

type Session = {
  date: string;
  extra: boolean;
  moves: string[];
  arc: string;
  week: number | null;
  title: string;
  done: number;
  total: number;
  gates: { name: string; result: string }[];
  felt: string[];
};
type Fuel = {
  key: string;
  title: string;
  group: string;
  tag: string;
  desc: string;
  benefits: string[];
  usage: string;
  dose: string;
  qa: { q: string; a: string }[];
  pairs: { key: string; title: string; brand: string; why: string }[];
  brand: string;
};

// Tap-to-open questions under a product, then what pairs with it. "I'm interested" tells the coach.
function FuelExtras({ fuel }: { fuel: Fuel }) {
  const [sent, setSent] = useState<Record<string, string>>({});
  const interested = async (key: string) => {
    setSent((s) => ({ ...s, [key]: 'Sending…' }));
    try {
      const res = await fetch('/portal/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const body = await res.json();
      setSent((s) => ({ ...s, [key]: res.ok ? 'Sent. Your coach will bring it up.' : body.error || 'Could not send.' }));
    } catch {
      setSent((s) => ({ ...s, [key]: 'Connection failed.' }));
    }
  };
  if (!fuel.qa.length && !fuel.pairs.length) return null;
  return (
    <div className="mt-4 border-t border-[#1a1a1a] pt-3 space-y-2">
      {fuel.qa.map((item) => (
        <details key={item.q} className="group border border-[#1a1a1a] bg-[#070707]">
          <summary className="cursor-pointer list-none flex justify-between items-center px-3 py-2.5 text-xs text-white">
            {item.q}
            <span className="text-[#00e5ff] text-sm group-open:rotate-45 transition-transform">+</span>
          </summary>
          <p className="px-3 pb-3 text-xs text-[#bbb] font-sans leading-relaxed">{item.a}</p>
        </details>
      ))}
      {fuel.pairs.length > 0 && (
        <div className="pt-3">
          <div className="text-[9px] text-[#666] uppercase tracking-widest mb-2">Goes well with</div>
          <div className="space-y-2">
            {fuel.pairs.map((p) => (
              <div key={p.key} className="border border-[#4CAF50]/30 bg-[#4CAF50]/5 p-3">
                <div className="text-xs text-white font-bold">{p.title}</div>
                {p.brand && <div className="text-[9px] text-[#4CAF50] tracking-widest uppercase mt-0.5">by {p.brand}</div>}
                <p className="text-[11px] text-[#aaa] font-sans leading-relaxed mt-1">{p.why}</p>
                {sent[p.key] ? (
                  <p className="text-[11px] text-[#4CAF50] mt-2">{sent[p.key]}</p>
                ) : (
                  <button onClick={() => interested(p.key)} className="mt-2 border border-[#4CAF50] text-[#4CAF50] px-3 py-1.5 text-[10px] tracking-widest hover:bg-[#4CAF50] hover:text-black transition-colors">
                    I&apos;M INTERESTED
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
type View = {
  firstName: string;
  arc: string | null;
  promise: string | null;
  focus: Zone[];
  journey: { week: number; title: string; done: boolean }[];
  sessions: Session[];
  fuel: Fuel[];
  recupLinked: boolean;
  checkins: Checkin[] | null;
  trackingFocus: string | null;
  today: string;
};

// 0-10 scales (database/13): discomfort is the standard pain score, sleep the single-item
// sleep quality scale. The first question names the client's own focus area when one is set.
const scalesFor = (focus: string | null) =>
  [
    { key: 'body', label: focus ? `${focus}: any discomfort today?` : 'Any discomfort in your body today?', low: '0 None', high: '10 Worst' },
    { key: 'sleep', label: 'How well did you sleep?', low: '0 Very poorly', high: '10 Very well' },
    { key: 'energy', label: 'Your energy today', low: '0 Exhausted', high: '10 Full of energy' },
  ] as const;
type ScaleKey = 'body' | 'sleep' | 'energy';

// Today's check-in: three taps and a fuel tick. Saving again the same day updates it.
function CheckinCard({ view, onSaved }: { view: View; onSaved: (c: Checkin[]) => void }) {
  const todays = view.checkins?.find((c) => c.day === view.today);
  const [vals, setVals] = useState<Record<ScaleKey, number | null>>({
    energy: todays?.energy ?? null,
    sleep: todays?.sleep ?? null,
    body: todays?.body ?? null,
  });
  const [fuel, setFuel] = useState(todays?.fuel_taken ?? false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(todays ? 'Saved for today. Change it any time.' : '');

  const save = async () => {
    setBusy(true);
    setNote('');
    try {
      const res = await fetch('/portal/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vals, fuel_taken: fuel }),
      });
      const body = await res.json();
      if (!res.ok) {
        setNote(body.error || 'Could not save.');
        return;
      }
      if (body.checkins) onSaved(body.checkins);
      setNote('Saved for today.');
    } catch {
      setNote('Connection failed.');
    } finally {
      setBusy(false);
    }
  };

  const scales = scalesFor(view.trackingFocus);
  const ready = scales.some((s) => vals[s.key] != null) || fuel;

  return (
    <div className="border border-[#222] bg-[#0a0a0a] p-5 space-y-5">
      {scales.map((s) => (
        <div key={s.key}>
          <div className="text-[11px] text-[#ccc] mb-2">{s.label}</div>
          <div className="grid grid-cols-11 gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
              const on = vals[s.key] === n;
              return (
                <button
                  key={n}
                  onClick={() => setVals((v) => ({ ...v, [s.key]: on ? null : n }))}
                  className={`h-10 border text-xs transition-colors ${on ? 'bg-[#00e5ff] border-[#00e5ff] text-black font-bold' : 'border-[#333] text-[#888] hover:border-[#00e5ff]/60'}`}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-[9px] text-[#555] mt-1">
            <span>{s.low}</span>
            <span>{s.high}</span>
          </div>
        </div>
      ))}
      {view.fuel.length > 0 && (
        <button
          onClick={() => setFuel((f) => !f)}
          className={`w-full h-12 border text-xs tracking-widest transition-colors ${fuel ? 'bg-[#4CAF50] border-[#4CAF50] text-black font-bold' : 'border-[#4CAF50]/50 text-[#4CAF50]'}`}
        >
          {fuel ? 'FUEL TAKEN TODAY' : 'TAP WHEN YOU TAKE YOUR FUEL'}
        </button>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={busy || !ready}
          className="border border-[#00e5ff] text-[#00e5ff] px-5 py-2 text-xs tracking-widest hover:bg-[#00e5ff] hover:text-black transition-colors disabled:opacity-40"
        >
          {busy ? 'SAVING…' : 'SAVE TODAY'}
        </button>
        {note && <span className="text-[11px] text-[#888]">{note}</span>}
      </div>
    </div>
  );
}

const SANS = { fontFamily: 'var(--font-portal-sans), Inter, sans-serif' };
const SERIF = { fontFamily: 'var(--font-portal-serif), "Playfair Display", serif' };
const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' };

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
        {state !== 'signin' && (
          <header className="border-b border-[#222] pb-5 mb-6 flex justify-between items-center gap-3">
            <div>
              <div className="text-[10px] text-[#00e5ff] tracking-[4px] uppercase">The M.O.E. Group · Client File</div>
              <h1 className="text-2xl font-bold mt-1">{view ? `${view.firstName}'s Architecture` : 'Your file'}</h1>
            </div>
            {state === 'ready' && (
              <button onClick={signOut} className="border border-[#333] px-3 py-2 text-[10px] tracking-widest text-[#888] hover:text-white">
                SIGN OUT
              </button>
            )}
          </header>
        )}

        {state === 'loading' && <p className="text-xs text-[#555]">Loading your file…</p>}

        {state === 'error' && <div className="border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444] text-xs p-4">{error}</div>}

        {state === 'signin' && (
          <form onSubmit={signIn} className="min-h-[80vh] flex flex-col justify-center max-w-sm mx-auto w-full py-8" style={SANS}>
            <div className="text-[10px] text-[#00e5ff] tracking-[4px] uppercase mb-5" style={MONO}>
              The M.O.E. Group · Private client file
            </div>
            <h1 className="text-4xl leading-tight" style={SERIF}>
              Welcome back.
            </h1>
            <p className="text-sm text-[#aaa] leading-relaxed mt-3">
              Your sessions, your progress and your fuel plan, in one place. Only you can open it.
            </p>

            <ul className="mt-6 space-y-2 text-[13px] text-[#ccc]">
              {['Every session you have done', 'Your programme, week by week', 'Your fuel plan and daily check-in'].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-[#00e5ff] shrink-0" />
                  {t}
                </li>
              ))}
            </ul>

            <label htmlFor="portal-code" className="block text-[10px] text-[#888] uppercase tracking-widest mt-10 mb-2" style={MONO}>
              Your personal code
            </label>
            <input
              id="portal-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="NAME-123456"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              disabled={busy}
              style={MONO}
              className="w-full bg-[#0a0a0a] border border-[#333] text-white text-lg px-4 py-4 outline-none tracking-[3px] focus:border-[#00e5ff] disabled:opacity-50 placeholder:text-[#444]"
            />
            {error && <p className="text-[12px] text-[#ef4444] mt-2">{error}</p>}
            <button
              type="submit"
              disabled={busy || !code.trim()}
              style={MONO}
              className="w-full mt-4 bg-[#00e5ff] text-black py-4 text-xs font-bold tracking-[0.2em] uppercase hover:bg-white transition-colors disabled:opacity-40"
            >
              {busy ? 'Opening…' : 'Open my file'}
            </button>

            <p className="text-[12px] text-[#666] mt-6 leading-relaxed">
              No code, or lost it? Ask your coach for a new one.
              <br />
              Tip: add this page to your home screen to open it in one tap.
            </p>
          </form>
        )}

        {state === 'ready' && view && (
          <div className="space-y-10">
            {/* What you're building: programme, where it works on the body, and the numbers so far. */}
            <section className="border border-[#222] bg-[#0a0a0a] p-5 border-l-4 border-l-[#00e5ff]">
              <div className="grid sm:grid-cols-[1fr_200px] gap-6 items-center">
                <div>
                  <div className="text-[10px] text-[#888] uppercase tracking-widest mb-1">Current programme</div>
                  <div className="text-lg font-bold">{view.arc ?? 'Being set by your coach'}</div>
                  {view.promise && <p className="text-xs text-[#ccc] font-sans leading-relaxed mt-2">{view.promise}</p>}
                  <div className="grid grid-cols-3 gap-2 mt-5">
                    {[
                      { n: view.sessions.length, label: view.sessions.length === 1 ? 'session' : 'sessions' },
                      { n: view.sessions.reduce((a, s) => a + s.done, 0), label: 'movements done' },
                      { n: view.checkins ? streak(view.checkins, view.today) : 0, label: 'day check-in streak' },
                    ].map((stat) => (
                      <div key={stat.label} className="border border-[#222] p-3 text-center">
                        <div className="text-2xl text-[#00e5ff]">{stat.n}</div>
                        <div className="text-[9px] text-[#888] uppercase tracking-widest mt-1 leading-tight">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <BodyMap focus={view.focus} />
              </div>
            </section>

            {view.journey.length > 0 && (
              <section>
                <h2 className="text-sm text-[#888] uppercase tracking-widest border-l-2 border-[#00e5ff] pl-3 mb-4">Your path</h2>
                <div className="border border-[#222] bg-[#0a0a0a] p-5">
                  <Journey weeks={view.journey} />
                </div>
              </section>
            )}

            {view.checkins && (
              <section>
                <h2 className="text-sm text-[#888] uppercase tracking-widest border-l-2 border-[#00e5ff] pl-3 mb-4">Today&apos;s check-in</h2>
                <CheckinCard view={view} onSaved={(checkins) => setView((v) => (v ? { ...v, checkins } : v))} />
                <div className="border border-[#222] bg-[#0a0a0a] p-5 mt-4">
                  <RecoveryPanel summary={summarize(view.checkins, view.today)} focus={view.trackingFocus} />
                  {view.checkins.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-[#1a1a1a]">
                      <div className="text-[10px] text-[#888] uppercase tracking-widest mb-3">Your last 28 days</div>
                      <TrendChart checkins={view.checkins} today={view.today} sessionDays={view.sessions.map((x) => x.date)} />
                    </div>
                  )}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-sm text-[#888] uppercase tracking-widest border-l-2 border-[#00e5ff] pl-3 mb-4">Your sessions</h2>
              {!view.sessions.length && <p className="text-xs text-[#555]">Your first session will appear here.</p>}
              <ol className="space-y-4">
                {view.sessions.map((s, i) => (
                  <li key={i} className="border border-[#222] bg-[#0a0a0a] p-5">
                    <div className="flex justify-between items-center gap-4 mb-3">
                      <div>
                        <div className="text-[#00e5ff] text-sm">{formatDate(s.date)}</div>
                        <div className="text-xs text-[#ccc] mt-1">
                          {s.extra && <span className="text-[9px] text-[#a78bfa] border border-[#a78bfa]/40 px-1.5 py-0.5 mr-2 tracking-widest uppercase">Extra</span>}
                          {s.week ? `Week ${s.week}: ` : ''}
                          {s.title}
                        </div>
                        {s.moves.length > 0 && (
                          <ul className="mt-2 space-y-0.5">
                            {s.moves.map((m, j) => (
                              <li key={j} className="text-[11px] text-[#aaa] font-sans">· {m}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <Ring done={s.done} total={s.total} />
                    </div>
                    {s.gates.length > 0 && (
                      <div className="border-t border-[#1a1a1a] pt-3">
                        <div className="text-[9px] text-[#666] uppercase tracking-widest mb-2">End-of-session check</div>
                        <div className="space-y-2">
                          {s.gates.map((g, j) => (
                            <div key={j} className="flex flex-wrap items-center gap-2">
                              <span className={`text-[9px] border px-1.5 py-0.5 tracking-widest uppercase ${resultTone(g.result)}`}>
                                {/^(passed|cleared|pass\b)/i.test(g.result.trim()) ? 'Passed' : 'Noted'}
                              </span>
                              <span className="text-[11px] text-[#ccc]">{g.name}</span>
                              <span className="text-[11px] text-[#666] w-full sm:w-auto">{g.result.replace(/^(passed|cleared)\s*/i, '')}</span>
                            </div>
                          ))}
                        </div>
                        {s.felt.length > 0 && (
                          <p className="text-[11px] text-[#aaa] mt-3">
                            <span className="text-[#666]">You felt:</span> {s.felt.join(' · ')}
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h2 className="text-sm text-[#888] uppercase tracking-widest border-l-2 border-[#4CAF50] pl-3 mb-4">Your fuel plan</h2>
              {!view.fuel.length && <p className="text-xs text-[#555]">Your coach will add your fuel plan here.</p>}
              <div className="space-y-4">
                {view.fuel.map((f) => (
                  <div key={f.key} className="border border-[#222] bg-[#0a0a0a] p-5">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <div>
                        <div className="text-base font-bold">{f.title}</div>
                        {f.brand && <div className="text-[9px] text-[#4CAF50] tracking-widest uppercase mt-0.5">by {f.brand}</div>}
                      </div>
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
                    <FuelExtras fuel={f} />
                  </div>
                ))}
              </div>
            </section>
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
