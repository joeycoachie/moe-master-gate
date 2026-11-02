'use client';

import { useEffect, useState } from 'react';
import { BodyMap, Journey, RecoveryPanel, Ring, TrendChart, resultTone, streak, type Checkin, type Zone } from './visuals';
import { summarize } from '@/lib/recovery';
import Readiness from './Readiness';

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
          <summary className="cursor-pointer list-none flex justify-between items-center px-3 py-2.5 text-sm text-white">
            {item.q}
            <span className="text-[#00e5ff] text-sm group-open:rotate-45 transition-transform">+</span>
          </summary>
          <p className="px-3 pb-3 text-sm text-[#dcdcdc] font-sans leading-relaxed">{item.a}</p>
        </details>
      ))}
      {fuel.pairs.length > 0 && (
        <div className="pt-3">
          <div className="text-[12px] text-[#a6a6a6] uppercase tracking-wide mb-2">Goes well with</div>
          <div className="space-y-2">
            {fuel.pairs.map((p) => (
              <div key={p.key} className="border border-[#4CAF50]/30 bg-[#4CAF50]/5 p-3">
                <div className="text-sm text-white font-bold">{p.title}</div>
                {p.brand && <div className="text-[12px] text-[#4CAF50] tracking-wide uppercase mt-0.5">by {p.brand}</div>}
                <p className="text-[14px] text-[#d4d4d4] font-sans leading-relaxed mt-1">{p.why}</p>
                {sent[p.key] ? (
                  <p className="text-[14px] text-[#4CAF50] mt-2">{sent[p.key]}</p>
                ) : (
                  <button onClick={() => interested(p.key)} className="mt-2 border border-[#4CAF50] text-[#4CAF50] px-3 py-1.5 text-[13px] tracking-wide hover:bg-[#4CAF50] hover:text-black transition-colors">
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
  readiness: Record<string, string> | null;
  package: {
    total: number;
    used: number;
    left: number;
    lastSession: string | null;
    updatedOn: string;
    paymentDue: string | null;
    renewSoon: boolean;
    note: string;
  } | null;
  programmes: { key: string; name: string; promise: string; weeks: number; current: boolean }[];
  requested: string[];
  today: string;
};

const shortDate = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

// The corner card: sessions left in their package, when the file last changed, payment due.
function PackageCorner({ p, today }: { p: NonNullable<View['package']>; today: string }) {
  const due = p.paymentDue;
  const overdue = !!due && due <= today;
  return (
    <div className={`border p-4 flex items-center gap-4 ${p.renewSoon || overdue ? 'border-[#f59e0b]/60 bg-[#f59e0b]/5' : 'border-[#222] bg-[#0a0a0a]'}`}>
      <div className="text-center shrink-0">
        <div className={`text-3xl leading-none ${p.renewSoon ? 'text-[#f59e0b]' : 'text-[#00e5ff]'}`}>{p.left}</div>
        <div className="text-[12px] text-[#bdbdbd] uppercase tracking-wide mt-1">of {p.total} left</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="h-1.5 bg-[#1a1a1a]">
          <div className={`h-full ${p.renewSoon ? 'bg-[#f59e0b]' : 'bg-[#00e5ff]'}`} style={{ width: `${Math.min(100, (p.used / p.total) * 100)}%` }} />
        </div>
        <div className="text-[14px] text-[#e8e8e8] mt-2">
          {p.note || 'Your sessions'}
          {p.lastSession ? ` · last session ${shortDate(p.lastSession)}` : ''}
        </div>
        <div className="text-[13px] text-[#a6a6a6] mt-0.5">Updated {shortDate(p.updatedOn)}</div>
        {due && (
          <div className={`text-[14px] mt-1 ${overdue ? 'text-[#f59e0b]' : 'text-[#d4d4d4]'}`}>
            {overdue ? 'Payment due now' : `Next payment due ${shortDate(due)}`}
          </div>
        )}
        {!due && p.renewSoon && <div className="text-[14px] mt-1 text-[#f59e0b]">{p.left === 0 ? 'Package used up. Ask your coach to renew.' : 'Almost done. Ask your coach about renewing.'}</div>}
      </div>
    </div>
  );
}

// "Choose your next programme": the client asks, the coach decides.
function ProgrammeMenu({ view }: { view: View }) {
  const [sent, setSent] = useState<Record<string, string>>({});
  const ask = async (key: string) => {
    setSent((s) => ({ ...s, [key]: 'Sending…' }));
    try {
      const res = await fetch('/portal/api/interest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) });
      const body = await res.json();
      setSent((s) => ({ ...s, [key]: res.ok ? 'Sent. Your coach will plan it with you.' : body.error || 'Could not send.' }));
    } catch {
      setSent((s) => ({ ...s, [key]: 'Connection failed.' }));
    }
  };
  return (
    <div className="space-y-3">
      {view.programmes.map((pr) => {
        const asked = view.requested.includes(pr.key);
        return (
          <div key={pr.key} className={`border p-4 ${pr.current ? 'border-[#00e5ff]/60 bg-[#05101a]' : 'border-[#222] bg-[#0a0a0a]'}`}>
            <div className="flex justify-between items-start gap-3">
              <div className="text-sm font-bold">{pr.name}</div>
              <span className="text-[12px] text-[#bdbdbd] border border-[#333] px-2 py-0.5 tracking-wide whitespace-nowrap">{pr.weeks} WEEKS</span>
            </div>
            <p className="text-sm text-[#d4d4d4] font-sans leading-relaxed mt-2">{pr.promise}</p>
            {(() => {
              // Her real record in this programme: weeks done and end-of-session checks passed.
              const mine = view.sessions.filter((x) => !x.extra && x.arc === pr.name);
              if (!mine.length) return null;
              const weeks = new Set(mine.map((x) => x.week).filter(Boolean)).size;
              const checks = mine.flatMap((x) => x.gates);
              const passed = checks.filter((g) => /^(passed|cleared|pass\b)/i.test(g.result.trim())).length;
              return (
                <p className="text-[14px] text-[#e8e8e8] mt-3 border-t border-[#1a1a1a] pt-2">
                  You so far: {weeks} of {pr.weeks} weeks · {mine.length} session{mine.length === 1 ? '' : 's'}
                  {checks.length ? ` · ${passed} of ${checks.length} checks passed` : ''}
                </p>
              );
            })()}
            {pr.current ? (
              <p className="text-[14px] text-[#00e5ff] mt-3">Your current programme</p>
            ) : sent[pr.key] || asked ? (
              <p className="text-[14px] text-[#4CAF50] mt-3">{sent[pr.key] || 'Asked. Your coach will plan it with you.'}</p>
            ) : (
              <button onClick={() => ask(pr.key)} className="mt-3 border border-[#00e5ff] text-[#00e5ff] px-3 py-1.5 text-[13px] tracking-wide hover:bg-[#00e5ff] hover:text-black transition-colors">
                I&apos;D LIKE THIS NEXT
              </button>
            )}
          </div>
        );
      })}
      <CustomRequest />
    </div>
  );
}

// "Something else in mind?": the client describes a pain, a stiffness or a goal in their own
// words. The coach reads it in their file and plans the next programme with them.
function CustomRequest() {
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const send = async () => {
    setBusy(true);
    setNote('');
    try {
      const res = await fetch('/portal/api/interest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'custom', detail: text }) });
      const body = await res.json();
      if (!res.ok) {
        setNote(body.error || 'Could not send.');
        return;
      }
      setDone(true);
    } catch {
      setNote('Connection failed.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="border border-[#222] bg-[#070707] p-4">
      <div className="text-sm font-bold">Something else in mind?</div>
      <p className="text-sm text-[#d4d4d4] font-sans leading-relaxed mt-1">
        Tell your coach what you want to work on next: a pain, a stiff spot or a goal. Your coach plans it with you.
      </p>
      {done ? (
        <p className="text-[14px] text-[#4CAF50] mt-3">Sent. Your coach will talk it through with you.</p>
      ) : (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="e.g. My right hip feels tight when I run, and I want to run 5 km without stopping."
            className="w-full mt-3 bg-[#0a0a0a] border border-[#333] text-white text-sm font-sans p-3 outline-none focus:border-[#00e5ff] resize-none"
          />
          <div className="flex items-center gap-3 mt-2">
            <button onClick={send} disabled={busy || text.trim().length < 3} className="border border-[#00e5ff] text-[#00e5ff] px-3 py-1.5 text-[13px] tracking-wide hover:bg-[#00e5ff] hover:text-black transition-colors disabled:opacity-40">
              {busy ? 'SENDING…' : 'SEND TO MY COACH'}
            </button>
            {note && <span className="text-[14px] text-[#ef4444]">{note}</span>}
          </div>
        </>
      )}
    </div>
  );
}

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
          <div className="text-[14px] text-[#e8e8e8] mb-2">{s.label}</div>
          <div className="grid grid-cols-11 gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
              const on = vals[s.key] === n;
              return (
                <button
                  key={n}
                  onClick={() => setVals((v) => ({ ...v, [s.key]: on ? null : n }))}
                  className={`h-10 border text-sm transition-colors ${on ? 'bg-[#00e5ff] border-[#00e5ff] text-black font-bold' : 'border-[#333] text-[#bdbdbd] hover:border-[#00e5ff]/60'}`}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-[12px] text-[#9b9b9b] mt-1">
            <span>{s.low}</span>
            <span>{s.high}</span>
          </div>
        </div>
      ))}
      {view.fuel.length > 0 && (
        <button
          onClick={() => setFuel((f) => !f)}
          className={`w-full h-12 border text-sm tracking-wide transition-colors ${fuel ? 'bg-[#4CAF50] border-[#4CAF50] text-black font-bold' : 'border-[#4CAF50]/50 text-[#4CAF50]'}`}
        >
          {fuel ? 'FUEL TAKEN TODAY' : 'TAP WHEN YOU TAKE YOUR FUEL'}
        </button>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={busy || !ready}
          className="border border-[#00e5ff] text-[#00e5ff] px-5 py-2 text-sm tracking-wide hover:bg-[#00e5ff] hover:text-black transition-colors disabled:opacity-40"
        >
          {busy ? 'SAVING…' : 'SAVE TODAY'}
        </button>
        {note && <span className="text-[14px] text-[#bdbdbd]">{note}</span>}
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
// One section at a time: a client opens the portal for one thing (log today, see progress,
// check their plan), so the tab bar replaces a long scroll.
type Tab = 'today' | 'programme' | 'sessions' | 'fuel' | 'profile';
const TABS: { key: Tab; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'programme', label: 'Programme' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'fuel', label: 'Fuel' },
  { key: 'profile', label: 'Profile' },
];

export default function ClientPortalPage() {
  const [view, setView] = useState<View | null>(null);
  // Opens on the tab in the link (e.g. /portal#sessions) so a coach can point to one section.
  const [tab, setTab] = useState<Tab>(() => {
    const h = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    return (TABS.some((t) => t.key === h) ? h : 'today') as Tab;
  });
  const [allSessions, setAllSessions] = useState(false);
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
    <main className="min-h-screen bg-[#050505] text-[#f2f2f2] font-sans flex flex-col text-[15px] leading-relaxed">
      <div className="max-w-2xl mx-auto w-full flex-1 p-5 md:p-8">
        {state !== 'signin' && (
          <header className="border-b border-[#222] pb-5 mb-6 flex justify-between items-center gap-3">
            <div>
              <div className="text-[13px] text-[#00e5ff] tracking-wide uppercase">The M.O.E. Group · Client File</div>
              <h1 className="text-2xl font-bold mt-1">{view ? `${view.firstName}'s progress` : 'Your file'}</h1>
            </div>
            {state === 'ready' && (
              <button onClick={signOut} className="border border-[#333] px-3 py-2 text-[13px] tracking-wide text-[#bdbdbd] hover:text-white">
                SIGN OUT
              </button>
            )}
          </header>
        )}

        {state === 'loading' && <p className="text-sm text-[#9b9b9b]">Loading your file…</p>}

        {state === 'error' && <div className="border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444] text-sm p-4">{error}</div>}

        {state === 'signin' && (
          <form onSubmit={signIn} className="min-h-[80vh] flex flex-col justify-center max-w-sm mx-auto w-full py-8" style={SANS}>
            <div className="text-[13px] text-[#00e5ff] tracking-wide uppercase mb-5" style={MONO}>
              The M.O.E. Group · Private client file
            </div>
            <h1 className="text-4xl leading-tight" style={SERIF}>
              Welcome back.
            </h1>
            <p className="text-sm text-[#d4d4d4] leading-relaxed mt-3">
              Your sessions, your progress and your fuel plan, in one place. Only you can open it.
            </p>

            <ul className="mt-6 space-y-2 text-[15px] text-[#e8e8e8]">
              {['Every session you have done', 'Your programme, week by week', 'Your fuel plan and daily check-in'].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-[#00e5ff] shrink-0" />
                  {t}
                </li>
              ))}
            </ul>

            <label htmlFor="portal-code" className="block text-[13px] text-[#bdbdbd] uppercase tracking-wide mt-10 mb-2" style={MONO}>
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
              className="w-full bg-[#0a0a0a] border border-[#333] text-white text-lg px-4 py-4 outline-none tracking-wide focus:border-[#00e5ff] disabled:opacity-50 placeholder:text-[#444]"
            />
            {error && <p className="text-[14px] text-[#ef4444] mt-2">{error}</p>}
            <button
              type="submit"
              disabled={busy || !code.trim()}
              style={MONO}
              className="w-full mt-4 bg-[#00e5ff] text-black py-4 text-sm font-bold tracking-[0.2em] uppercase hover:bg-white transition-colors disabled:opacity-40"
            >
              {busy ? 'Opening…' : 'Open my file'}
            </button>

            <p className="text-[14px] text-[#a6a6a6] mt-6 leading-relaxed">
              No code, or lost it? Ask your coach for a new one.
              <br />
              Tip: add this page to your home screen to open it in one tap.
            </p>
          </form>
        )}

        {state === 'ready' && view && (
          <div className="space-y-10">
            {view.package && <PackageCorner p={view.package} today={view.today} />}

            <nav className="sticky top-0 z-10 -mx-5 md:-mx-8 px-5 md:px-8 py-2 bg-[#050505]/95 backdrop-blur border-b border-[#222]">
              <div className="flex overflow-x-auto">
                {TABS.filter((t) => t.key !== 'profile' || view.readiness).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => { setTab(t.key); window.scrollTo({ top: 0 }); }}
                    className={`flex-1 px-1.5 py-2.5 text-[14px] whitespace-nowrap border-b-2 transition-colors ${tab === t.key ? 'border-[#00e5ff] text-white font-semibold' : 'border-transparent text-[#bdbdbd]'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </nav>

            {tab === 'today' && (
              <div className="space-y-10">
            {view.checkins && (
              <section>
                <h2 className="text-lg font-semibold text-white border-l-2 border-[#00e5ff] pl-3 mb-4">Today&apos;s check-in</h2>
                <CheckinCard view={view} onSaved={(checkins) => setView((v) => (v ? { ...v, checkins } : v))} />
                <div className="border border-[#222] bg-[#0a0a0a] p-5 mt-4">
                  <RecoveryPanel summary={summarize(view.checkins, view.today)} focus={view.trackingFocus} />
                  {view.checkins.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-[#1a1a1a]">
                      <div className="text-[13px] text-[#bdbdbd] uppercase tracking-wide mb-3">Your last 28 days</div>
                      <TrendChart checkins={view.checkins} today={view.today} sessionDays={view.sessions.map((x) => x.date)} />
                    </div>
                  )}
                </div>
              </section>
            )}
                {!view.checkins && <p className="text-sm text-[#bdbdbd]">Your daily check-in will appear here soon.</p>}
              </div>
            )}

            {tab === 'programme' && (
              <div className="space-y-10">
            {/* What you're building: programme, where it works on the body, and the numbers so far. */}
            <section className="border border-[#222] bg-[#0a0a0a] p-5 border-l-4 border-l-[#00e5ff]">
              <div className="grid sm:grid-cols-[1fr_200px] gap-6 items-center">
                <div>
                  <div className="text-[13px] text-[#bdbdbd] uppercase tracking-wide mb-1">Current programme</div>
                  <div className="text-lg font-bold">{view.arc ?? 'Being set by your coach'}</div>
                  {view.promise && <p className="text-sm text-[#e8e8e8] font-sans leading-relaxed mt-2">{view.promise}</p>}
                  <div className="grid grid-cols-3 gap-2 mt-5">
                    {[
                      { n: view.sessions.length, label: view.sessions.length === 1 ? 'session' : 'sessions' },
                      { n: view.sessions.reduce((a, s) => a + s.done, 0), label: 'movements done' },
                      { n: view.checkins ? streak(view.checkins, view.today) : 0, label: 'day check-in streak' },
                    ].map((stat) => (
                      <div key={stat.label} className="border border-[#222] p-3 text-center">
                        <div className="text-2xl text-[#00e5ff]">{stat.n}</div>
                        <div className="text-[12px] text-[#bdbdbd] uppercase tracking-wide mt-1 leading-tight">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <BodyMap focus={view.focus} />
              </div>
            </section>

            {view.journey.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white border-l-2 border-[#00e5ff] pl-3 mb-4">Your path · {view.arc}</h2>
                <div className="border border-[#222] bg-[#0a0a0a] p-5">
                  <Journey weeks={view.journey} />
                </div>
              </section>
            )}

            {view.programmes.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white border-l-2 border-[#00e5ff] pl-3 mb-4">Choose your next programme</h2>
                <ProgrammeMenu view={view} />
              </section>
            )}

              </div>
            )}

            {tab === 'sessions' && (
            <section>
              <h2 className="text-lg font-semibold text-white border-l-2 border-[#00e5ff] pl-3 mb-4">Your sessions</h2>
              {!view.sessions.length && <p className="text-sm text-[#9b9b9b]">Your first session will appear here.</p>}
              <ol className="space-y-4">
                {(allSessions ? view.sessions : view.sessions.slice(0, 3)).map((s, i) => (
                  <li key={i} className="border border-[#222] bg-[#0a0a0a] p-5">
                    <div className="flex justify-between items-center gap-4 mb-3">
                      <div>
                        <div className="text-[#00e5ff] text-sm">{formatDate(s.date)}</div>
                        <div className="text-sm text-[#e8e8e8] mt-1">
                          {s.extra && <span className="text-[12px] text-[#a78bfa] border border-[#a78bfa]/40 px-1.5 py-0.5 mr-2 tracking-wide uppercase">{s.arc === 'Extra session' ? 'Extra' : s.arc}</span>}
                          {s.week ? `Week ${s.week}: ` : ''}
                          {s.title}
                        </div>
                        {s.moves.length > 0 && (
                          <ul className="mt-2 space-y-0.5">
                            {s.moves.map((m, j) => (
                              <li key={j} className="text-[14px] text-[#d4d4d4] font-sans">· {m}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <Ring done={s.done} total={s.total} />
                    </div>
                    {s.gates.length > 0 && (
                      <div className="border-t border-[#1a1a1a] pt-3">
                        <div className="text-[12px] text-[#a6a6a6] uppercase tracking-wide mb-2">End-of-session check</div>
                        <div className="space-y-2">
                          {s.gates.map((g, j) => (
                            <div key={j} className="flex flex-wrap items-center gap-2">
                              <span className={`text-[12px] border px-1.5 py-0.5 tracking-wide uppercase ${resultTone(g.result)}`}>
                                {/^(passed|cleared|pass\b)/i.test(g.result.trim()) ? 'Passed' : 'Noted'}
                              </span>
                              <span className="text-[14px] text-[#e8e8e8]">{g.name}</span>
                              <span className="text-[14px] text-[#a6a6a6] w-full sm:w-auto">{g.result.replace(/^(passed|cleared)\s*/i, '')}</span>
                            </div>
                          ))}
                        </div>
                        {s.felt.length > 0 && (
                          <p className="text-[14px] text-[#d4d4d4] mt-3">
                            <span className="text-[#a6a6a6]">You felt:</span> {s.felt.join(' · ')}
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
              {view.sessions.length > 3 && !allSessions && (
                <button onClick={() => setAllSessions(true)} className="mt-4 w-full border border-[#333] py-3 text-sm text-[#e8e8e8] hover:border-[#00e5ff]">
                  Show all {view.sessions.length} sessions
                </button>
              )}
            </section>
            )}

            {tab === 'fuel' && (
            <section>
              <h2 className="text-lg font-semibold text-white border-l-2 border-[#4CAF50] pl-3 mb-4">Your fuel plan</h2>
              {!view.fuel.length && <p className="text-sm text-[#9b9b9b]">Your coach will add your fuel plan here.</p>}
              <div className="space-y-4">
                {view.fuel.map((f) => (
                  <div key={f.key} className="border border-[#222] bg-[#0a0a0a] p-5">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <div>
                        <div className="text-base font-bold">{f.title}</div>
                        {f.brand && <div className="text-[12px] text-[#4CAF50] tracking-wide uppercase mt-0.5">by {f.brand}</div>}
                      </div>
                      {f.tag && <span className="text-[12px] text-[#4CAF50] border border-[#4CAF50]/40 px-2 py-0.5 tracking-wide">{f.tag}</span>}
                    </div>
                    <p className="text-sm text-[#e8e8e8] font-sans leading-relaxed">{f.desc}</p>
                    {f.benefits.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {f.benefits.map((b, j) => (
                          <li key={j} className="text-[14px] text-[#d4d4d4] font-sans">· {b}</li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-3 text-[14px] text-white border-t border-[#1a1a1a] pt-3">
                      <span className="text-[#a6a6a6]">How to take it:</span> {f.dose || f.usage}
                    </p>
                    <FuelExtras fuel={f} />
                  </div>
                ))}
              </div>
            </section>
            )}

            {tab === 'profile' && view.readiness && (
              <section>
                <h2 className="text-lg font-semibold text-white border-l-2 border-[#00e5ff] pl-3 mb-4">Your profile</h2>
                <Readiness initial={view.readiness} />
              </section>
            )}
          </div>
        )}
      </div>

      {/* ISOLATED ENTERPRISE FOOTER */}
      <div className="w-full max-w-2xl mx-auto pt-12 mt-auto px-5">
        <footer className="w-full border-t border-[#222] pt-8 pb-4 text-center">
          <p className="text-[13px] text-[#4CAF50] tracking-[0.2em] uppercase mb-2">Cleared For Human Performance</p>
          <p className="text-[13px] text-[#9b9b9b] tracking-[0.2em] uppercase">&copy; 2026 The M.O.E. Group. All Rights Reserved.</p>
        </footer>
      </div>
    </main>
  );
}
