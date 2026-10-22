'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  CHANNELS,
  CHANNEL_LABEL,
  REPLY_GATES,
  SUGGESTED_TARGETS,
  ROADS,
  WHO_LABEL,
  ROAD_INFO,
  STAGES,
  buildPhases,
  defaultChannel,
  fillMessage,
  ctaCheck,
  formatFor,
  gateReply,
  funnel,
  openLink,
  roadOf,
  stageLabel,
  todayMY,
  dueMoves,
  nextMove,
  plainCheck,
  reached,
  sendStreak,
  variantScores,
  type Channel,
  type OutreachEvent,
  type Road,
  type Stage,
  type Target,
  type Variant,
} from '@/lib/outreach';

// Outreach Console: the Phase Action Protocol (gate G-25) on live data. Every tick comes from
// what was logged here, so the checklist is proof of work, not a promise.
export default function OutreachConsolePage() {
  const router = useRouter();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [events, setEvents] = useState<OutreachEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [setup, setSetup] = useState(false);
  const [toast, setToast] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const [road, setRoadState] = useState<Road>(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('outreach:road') === 'fuel' ? 'fuel' : 'kinetic';
    } catch {
      return 'kinetic';
    }
  });
  const setRoad = (r: Road) => {
    setRoadState(r);
    try {
      localStorage.setItem('outreach:road', r);
    } catch {}
  };

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2400);
  };

  const load = () =>
    fetch('/ops/api/outreach')
      .then(async (res) => {
        const body = await res.json();
        if (res.status === 401) return router.replace('/ops/architect?next=/ops/outreach');
        if (!res.ok) {
          setSetup(body.setup === true);
          return setError(body.error || 'Failed to load.');
        }
        setError('');
        setVariants(body.variants);
        setTargets(body.targets);
        setEvents(body.events);
        setLoaded(true);
      })
      .catch(() => setError('Connection failed.'));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const act = async (payload: Record<string, unknown>, done?: string) => {
    const res = await fetch('/ops/api/outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      flash(body.error || 'Save failed.');
      return false;
    }
    if (done) flash(done);
    await load();
    return true;
  };

  const phases = useMemo(() => buildPhases(targets, variants, events, road), [targets, variants, events, road]);
  const roadTargets = targets.filter((t) => roadOf(t) === road);
  const roadVariants = variants.filter((v) => roadOf(v) === road);
  const allSteps = phases.flatMap((p) => p.steps);
  const doneSteps = allSteps.filter((s) => s.done).length;
  const cleared = phases.filter((p) => p.steps.every((s) => s.done));
  const rank = cleared.length ? cleared[cleared.length - 1].rank : 'E';
  const streak = sendStreak(events);
  const due = dueMoves(targets, events);
  const overdue = due.map((x) => x.t);
  const scores = variantScores(roadVariants, roadTargets);
  const lessons = events.filter((e) => e.kind === 'lesson');
  // DO NOW: the only list you need each day. Overdue moves first, then due next steps, then studios not yet messaged.
  const doNow = [
    ...due.map((x) => ({ t: x.t, what: x.move.label })),
    ...targets
      .filter((t) => t.next_date && t.next_date <= todayMY() && !['signed', 'no'].includes(t.stage) && !due.some((x) => x.t.id === t.id))
      .map((t) => ({ t, what: t.next_step || 'Next step' })),
    ...targets.filter((t) => t.stage === 'found').map((t) => ({ t, what: 'Send the first message' })),
  ];
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try {
      return typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('outreach:dismissed') || '[]') : [];
    } catch {
      return [];
    }
  });
  const dismiss = (key: string) => {
    const next = [...dismissed, key];
    setDismissed(next);
    try {
      localStorage.setItem('outreach:dismissed', JSON.stringify(next));
    } catch {}
  };
  const suggestions = SUGGESTED_TARGETS.filter((x) => !dismissed.includes(x.key) && !targets.some((t) => t.studio === x.studio));
  const jump = (id: string) => {
    setOpenId(id);
    setTimeout(() => document.getElementById(`studio-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };
  // Every studio stays visible: the road being viewed first, the other road underneath.
  const inPlay = (t: Target) => filter === 'all' || (t.stage !== 'signed' && t.stage !== 'no');
  const groups = [road, ...ROADS.filter((r) => r !== road)].map((r) => ({ r, list: targets.filter((t) => roadOf(t) === r && inPlay(t)) }));

  const sendReport = async () => {
    const res = await fetch('/ops/api/outreach/report?force=1');
    const body = await res.json();
    if (!res.ok) return flash(body.error || 'Report failed.');
    flash(body.sent ? 'Report sent to your phone' : 'No phone channel set yet. Report shown below.');
    alert(`${body.title}\n\n${body.body}`);
  };

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-4 md:p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1">
        <header className="border-b border-[#222] pb-5 mb-6 flex justify-between items-center flex-wrap gap-3">
          <div>
            <div className="text-[10px] text-[#a855f7] tracking-[4px] uppercase">ARCHITECT — SYS.OP · BC3 · PHASE ACTION PROTOCOL</div>
            <h1 className="text-2xl font-bold mt-1">Outreach Console</h1>
            <p className="text-xs text-[#888] font-sans mt-1">Two roads, one method. Fuel opens the door, Kinetic signs the studio. The only number fully in your hands: messages sent.</p>
          </div>
          <nav className="flex gap-2 text-xs">
            <button onClick={sendReport} className="border border-[#a855f7] px-3 py-2 text-[#a855f7] hover:text-white">SEND REPORT NOW</button>
            <a href="/recup/deck" target="_blank" rel="noreferrer" className="border border-[#ffb454]/60 px-3 py-2 text-[#ffb454] hover:text-white">DECK</a>
            <Link href="/terminal" className="border border-[#333] px-3 py-2 text-[#888] hover:text-white">TERMINAL</Link>
          </nav>
        </header>

        {error && (
          <div className="border border-[#ff5c72]/60 bg-[#ff5c72]/10 p-4 mb-6 text-sm font-sans">
            {error}
            {setup && <p className="text-xs text-[#aaa] mt-2">Supabase → SQL Editor → paste the file → Run. Then reload this page.</p>}
          </div>
        )}

        {loaded && (
          <>
            {/* HUD */}
            <section className="border border-[#a855f7]/40 bg-[#0a0a12] p-4 mb-6">
              <div className="flex flex-wrap gap-6 items-end">
                <Stat label="RANK" value={rank} accent />
                <Stat label="STEPS" value={`${doneSteps}/${allSteps.length}`} />
                <Stat label="SEND STREAK" value={`${streak}d`} />
                <div className="flex-1 min-w-[200px]">
                  <div className="text-[10px] text-[#666] tracking-widest">PROOF OF WORK · {doneSteps * 25} / {allSteps.length * 25} XP</div>
                  <div className="h-2 bg-white/5 mt-2">
                    <div className="h-full bg-gradient-to-r from-[#00e5ff] to-[#a855f7]" style={{ width: `${(doneSteps / allSteps.length) * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 mt-4">
                {ROADS.map((r) => {
                  const g = funnel(targets.filter((t) => roadOf(t) === r));
                  const on = r === road;
                  return (
                    <button
                      key={r}
                      onClick={() => setRoad(r)}
                      className={`border p-2 text-left ${on ? '' : 'border-[#222] opacity-70 hover:opacity-100'}`}
                      style={on ? { borderColor: ROAD_INFO[r].colour } : undefined}
                    >
                      <div className="flex text-[10px] tracking-widest uppercase mb-2">
                        <span style={{ color: ROAD_INFO[r].colour }}>{ROAD_INFO[r].name}</span>
                        <span className="ml-auto text-[#555]">{on ? 'SHOWING' : 'TAP TO SHOW'}</span>
                      </div>
                      <div className="grid grid-cols-6 gap-1 text-center">
                        {[
                          ['Found', g.found],
                          ['Sent', g.messaged],
                          ['Replied', g.replied],
                          ['Talks', g.calls],
                          ['Plans', g.plans],
                          [r === 'fuel' ? 'Pop-ups' : 'Signed', g.signed],
                        ].map(([l, n]) => (
                          <div key={l}>
                            <div className="text-base font-bold">{n}</div>
                            <div className="text-[9px] text-[#666] uppercase">{l}</div>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* DO NOW */}
            <section className="border border-[#ffb454]/50 bg-[#ffb454]/5 p-4 mb-6">
              <h2 className="text-sm text-[#ffb454] tracking-widest mb-3">DO NOW · {doNow.length}</h2>
              {doNow.length ? (
                <ul className="space-y-2">
                  {doNow.slice(0, 8).map(({ t, what }, i) => (
                    <li key={`${t.id}-${i}`}>
                      <button onClick={() => jump(t.id)} className="w-full text-left flex items-center gap-3 border border-[#222] bg-[#0a0a0a] px-3 py-2 hover:border-[#ffb454]">
                        <span className="text-[10px]" style={{ color: ROAD_INFO[roadOf(t)].colour }}>{roadOf(t) === 'fuel' ? 'FUEL' : 'KINETIC'}</span>
                        <span className="font-sans font-bold text-sm">{t.studio}</span>
                        <span className="font-sans text-sm text-[#ccc]">{what}</span>
                        <span className="ml-auto text-xs text-[#ffb454]">OPEN →</span>
                      </button>
                    </li>
                  ))}
                  {doNow.length > 8 && <li className="text-[11px] text-[#666] font-sans">+{doNow.length - 8} more below</li>}
                </ul>
              ) : (
                <p className="text-sm font-sans text-[#888]">Nothing due. Add studios, or send to the next batch.</p>
              )}
            </section>

            {/* Phases, auto-ticked (folded) */}
            <details className="mb-8">
              <summary className="cursor-pointer text-sm tracking-widest mb-3" style={{ color: ROAD_INFO[road].colour }}>
                THE FOUR PHASES · {ROAD_INFO[road].name.toUpperCase()} · {doneSteps}/{allSteps.length} steps ticked from your data
              </summary>
              <div className="space-y-3">
                {phases.map((p) => {
                  const done = p.steps.every((s) => s.done);
                  return (
                    <div key={p.id} className={`border p-4 ${done ? 'border-[#33e6a0]/50' : 'border-[#222]'} bg-[#0a0a0a]`}>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] border border-current px-2 text-[#a855f7]">{p.rank}</span>
                        <span className="font-bold">Phase {p.id} · {p.title}</span>
                        <span className="ml-auto text-xs text-[#666]">{p.steps.filter((s) => s.done).length}/{p.steps.length}</span>
                      </div>
                      <p className="text-xs text-[#888] font-sans mt-2">{p.plain}</p>
                      <ul className="mt-3 space-y-2">
                        {p.steps.map((s) => (
                          <li key={s.label} className="flex gap-3 text-sm font-sans">
                            <span className={s.done ? 'text-[#33e6a0]' : 'text-[#444]'}>{s.done ? '■' : '□'}</span>
                            <div>
                              <div className={s.done ? 'text-[#ccc]' : 'text-white'}>{s.label}</div>
                              <div className="text-[11px] text-[#666]">
                                {s.href ? <a href={s.href} target="_blank" rel="noreferrer" className="underline hover:text-[#00e5ff]">{s.proof}</a> : s.proof}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="text-[10px] text-[#555] mt-3">{p.refs}</div>
                    </div>
                  );
                })}
              </div>
            </details>

            {/* Studio list */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h2 className="text-sm text-[#888] tracking-widest">STUDIOS · both roads</h2>
                <div className="ml-auto flex gap-1 text-[11px]">
                  {(['open', 'all'] as const).map((k) => (
                    <button key={k} onClick={() => setFilter(k)} className={`border px-2 py-1 ${filter === k ? 'border-[#00e5ff] text-[#00e5ff]' : 'border-[#333] text-[#666]'}`}>
                      {k === 'open' ? 'IN PLAY' : 'ALL'}
                    </button>
                  ))}
                </div>
              </div>
              <AddStudio variants={roadVariants.filter((v) => v.status !== 'retired')} onAdd={(row) => act({ action: 'add_target', road, ...row }, 'Studio added')} />
              {suggestions.length > 0 && (
                <div className="border border-dashed border-[#a855f7]/50 p-3 mt-3 space-y-2">
                  <div className="text-[10px] tracking-widest text-[#a855f7]">SUGGESTED · researched, contacts checked</div>
                  {suggestions.map((x) => (
                    <div key={x.key} className="flex flex-wrap items-center gap-2 text-sm font-sans">
                      <span className="text-[10px] font-mono" style={{ color: ROAD_INFO[x.road].colour }}>{x.road.toUpperCase()} · {x.variant_code}</span>
                      <b>{x.studio}</b>
                      <span className="text-xs text-[#888] w-full">{x.why}</span>
                      <button
                        onClick={() => {
                          const { key: _key, why: _why, variant_code, ...row } = x;
                          void _key;
                          void _why;
                          act({ action: 'add_target', ...row, variant_id: variants.find((v) => v.code === variant_code)?.id ?? '' }, `${x.studio} added`);
                        }}
                        className="border border-[#a855f7] text-[#a855f7] px-3 py-1 text-xs font-mono"
                      >
                        + ADD
                      </button>
                      <button onClick={() => dismiss(x.key)} className="border border-[#333] text-[#666] px-3 py-1 text-xs font-mono">NOT NOW</button>
                    </div>
                  ))}
                </div>
              )}
              {groups.map(({ r, list }) => (
                <div key={r} className="mt-4">
                  <div className="text-[11px] tracking-widest uppercase mb-2 flex gap-2" style={{ color: ROAD_INFO[r].colour }}>
                    <span>{ROAD_INFO[r].name}</span>
                    <span className="text-[#555]">· {list.length} studio{list.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="space-y-2" style={{ borderLeft: `2px solid ${ROAD_INFO[r].colour}55`, paddingLeft: 8 }}>
                    {list.map((t) => (
                      <StudioCard
                        key={t.id}
                        t={t}
                        variants={variants}
                        open={openId === t.id}
                        overdue={overdue.includes(t)}
                        move={nextMove(t, events)}
                        hasKineticTwin={targets.some((k) => roadOf(k) === 'kinetic' && k.studio === t.studio)}
                        onToggle={() => setOpenId(openId === t.id ? null : t.id)}
                        act={act}
                        flash={flash}
                      />
                    ))}
                    {!list.length && <p className="text-xs text-[#555] font-sans">None yet. Open a studio card and tap {r.toUpperCase()} to move it here, or add one.</p>}
                  </div>
                </div>
              ))}
            </section>

            {/* Message tests */}
            <details className="mb-8">
              <summary className="cursor-pointer text-sm text-[#888] tracking-widest mb-1">MESSAGE TESTS · {ROAD_INFO[road].name} · {scores.length} messages</summary>
              <p className="text-xs text-[#666] font-sans mb-3">Send each message to 5 studios. After 5 sends the reply rate counts. Change one thing at a time, keep the winner, write down why.</p>
              <div className="space-y-2">
                {scores.map(({ variant: v, sent, replied, calls, rate, enough }) => (
                  <div key={v.id} className={`border p-3 bg-[#0a0a0a] ${v.status === 'winner' ? 'border-[#33e6a0]/60' : v.status === 'retired' ? 'border-[#1a1a1a] opacity-50' : 'border-[#222]'}`}>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-[#00e5ff]">{v.code}</span>
                      <span className="text-xs text-[#888] font-sans">{v.angle}</span>
                      <span className="ml-auto text-xs">
                        {sent} sent · {replied} replied · {calls} calls · <b className={enough ? 'text-white' : 'text-[#555]'}>{Math.round(rate * 100)}%</b>
                        {!enough && <span className="text-[#555]"> (need 5)</span>}
                      </span>
                    </div>
                    {v.use_when && <p className="text-[11px] font-sans text-[#ffb454] mt-2">Use when: {v.use_when}</p>}
                    <p className="text-sm font-sans text-[#ccc] mt-2 whitespace-pre-wrap">{v.body}</p>
                    <div className="flex gap-2 mt-2 text-[11px]">
                      {(['testing', 'winner', 'retired'] as const).map((s) => (
                        <button key={s} onClick={() => act({ action: 'set_variant_status', id: v.id, status: s })} className={`border px-2 py-1 ${v.status === s ? 'border-[#a855f7] text-[#a855f7]' : 'border-[#333] text-[#666] hover:text-white'}`}>
                          {s.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <AddVariant onAdd={(row) => act({ action: 'add_variant', road, ...row }, 'Message added')} nextCode={`V${variants.length + 1}`} />
            </details>

            {/* Lessons */}
            <details className="mb-8">
              <summary className="cursor-pointer text-sm text-[#888] tracking-widest mb-1">WHAT WE LEARNED · {lessons.length}</summary>
              <p className="text-xs text-[#666] font-sans mb-3">The friction an owner names becomes the next message. Feeds P-010, the Friday ritual.</p>
              <AddLesson variants={variants} onAdd={(row) => act({ action: 'lesson', ...row }, 'Lesson saved')} />
              <ul className="space-y-2 mt-3">
                {lessons.map((e) => (
                  <li key={e.id} className="border border-[#1a1a1a] bg-[#0a0a0a] p-3 text-sm font-sans">
                    <div className="text-[10px] text-[#00e5ff] font-mono mb-1">
                      {new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {e.variant_id && ` · ${variants.find((v) => v.id === e.variant_id)?.code ?? ''}`}
                    </div>
                    {e.body}
                  </li>
                ))}
              </ul>
            </details>
          </>
        )}
      </div>

      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 border border-[#00e5ff] bg-[#0a0a12] px-4 py-2 text-xs z-50">{toast}</div>}

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

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] text-[#666] tracking-widest">{label}</div>
      <div className={`text-xl font-bold ${accent ? 'text-[#a855f7]' : ''}`}>{value}</div>
    </div>
  );
}

const input = 'w-full bg-[#0a0a0a] border border-[#222] px-3 py-2 text-sm font-sans focus:outline-none focus:border-[#00e5ff]';

function AddStudio({ variants, onAdd }: { variants: Variant[]; onAdd: (row: Record<string, string>) => Promise<boolean> }) {
  const empty = { studio: '', owner_name: '', area: '', contact: '', fit_note: '', batch: '', variant_id: '' };
  const [row, setRow] = useState(empty);
  const [open, setOpen] = useState(false);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setRow({ ...row, [k]: e.target.value });
  if (!open) return <button onClick={() => setOpen(true)} className="border border-dashed border-[#333] w-full py-2 text-xs text-[#888] hover:text-white">+ ADD A STUDIO</button>;
  return (
    <form
      className="border border-[#333] p-3 grid sm:grid-cols-2 gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await onAdd(row)) setRow({ ...empty, batch: row.batch, variant_id: row.variant_id });
      }}
    >
      <input className={input} placeholder="Studio name *" value={row.studio} onChange={set('studio')} required />
      <input className={input} placeholder="Owner's first name" value={row.owner_name} onChange={set('owner_name')} />
      <input className={input} placeholder="Area / postcode" value={row.area} onChange={set('area')} />
      <input className={input} placeholder="Instagram @ or email or WhatsApp" value={row.contact} onChange={set('contact')} />
      <input className={`${input} sm:col-span-2`} placeholder="One detail from their page (fills {detail}): you run PT alongside group classes" value={row.fit_note} onChange={set('fit_note')} />
      <input className={input} placeholder="Batch, e.g. B1 · 20 Oct" value={row.batch} onChange={set('batch')} />
      <select className={input} value={row.variant_id} onChange={set('variant_id')}>
        <option value="">Message to send…</option>
        {variants.map((v) => (
          <option key={v.id} value={v.id}>{v.code} · {v.angle}</option>
        ))}
      </select>
      <div className="sm:col-span-2 flex gap-2">
        <button className="border border-[#00e5ff] text-[#00e5ff] px-4 py-2 text-xs">SAVE (keeps batch + message for the next one)</button>
        <button type="button" onClick={() => setOpen(false)} className="border border-[#333] text-[#666] px-4 py-2 text-xs">CLOSE</button>
      </div>
    </form>
  );
}

// Clipboard with a fallback: some phones block navigator.clipboard, so try the old way too.
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {}
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {}
  ta.remove();
  return ok;
}

function StudioCard({
  t, variants, open, overdue, move, hasKineticTwin, onToggle, act, flash,
}: {
  t: Target;
  move: ReturnType<typeof nextMove>;
  hasKineticTwin: boolean;
  variants: Variant[];
  open: boolean;
  overdue: boolean;
  onToggle: () => void;
  act: (p: Record<string, unknown>, done?: string) => Promise<boolean>;
  flash: (m: string) => void;
}) {
  const road = roadOf(t);
  const v = variants.find((x) => x.id === t.variant_id);
  const [draft, setDraft] = useState({ friction: t.friction, next_step: t.next_step, next_date: t.next_date ?? '', fit_note: t.fit_note, contact: t.contact, owner_name: t.owner_name, referred_by: t.referred_by ?? '' });
  const idx = t.stage === 'no' ? -1 : STAGES.indexOf(t.stage);
  const next = idx >= 0 && idx < STAGES.length - 1 ? STAGES[idx + 1] : null;

  const message = v ? fillMessage(v.body, t) : '';
  const [picked, setPicked] = useState<Channel | null>(null);
  const [gateKey, setGateKey] = useState<string | null>(null);
  const gate = REPLY_GATES.find((g) => g.key === gateKey);
  const showGates = ['messaged', 'replied'].includes(t.stage);
  const channel = picked ?? defaultChannel(t.contact, v?.body ?? '');
  const packaged = formatFor(channel, message);
  const link = v ? openLink(channel, t.contact, message) : undefined;

  const copy = async () => {
    if (!v) return flash('Pick a message for this studio first');
    const text = channel === 'email' && packaged.subject ? `Subject: ${packaged.subject}\n\n${packaged.text}` : packaged.text;
    flash((await copyText(text)) ? `Copied for ${CHANNEL_LABEL[channel]}` : 'Copy blocked. Press and hold the message, then Select All');
  };

  return (
    <div id={`studio-${t.id}`} className={`border bg-[#0a0a0a] scroll-mt-4 ${overdue ? 'border-[#ffb454]/60' : 'border-[#222]'}`}>
      <button onClick={onToggle} className="w-full text-left p-3 flex items-center gap-3 flex-wrap">
        <span className="font-bold font-sans">{t.studio}</span>
        <span className="text-[11px] text-[#666] font-sans">{[t.owner_name, t.referred_by ? `via ${t.referred_by}` : '', t.area, t.batch].filter(Boolean).join(' · ')}</span>
        <span className="ml-auto text-[11px] flex gap-2 items-center">
          {v && <span style={{ color: ROAD_INFO[road].colour }}>{v.code}</span>}
          {move && move.key !== 'wait' && (
            <span className={overdue ? 'text-[#ffb454]' : 'text-[#555]'}>{overdue ? move.label.toUpperCase() : `${move.label} in ${move.inDays}d`}</span>
          )}
          <span className={t.stage === 'signed' ? 'text-[#33e6a0]' : t.stage === 'no' ? 'text-[#555]' : 'text-white'}>{stageLabel(road, t.stage)}</span>
        </span>
      </button>
      {open && (
        <div className="border-t border-[#1a1a1a] p-3 space-y-3 font-sans">
          {/* The next step, always on top */}
          {t.next_step && (
            <div className="border border-[#ffb454]/40 bg-[#ffb454]/5 px-3 py-2 text-sm">
              <span className="text-[10px] font-mono text-[#ffb454] mr-2">NEXT</span>
              {t.next_step}
              {t.next_date && <span className="text-[#888]"> · by {new Date(`${t.next_date}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })}</span>}
            </div>
          )}

          {/* Road */}
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-[#555]">ROAD</span>
            {(['kinetic', 'fuel'] as const).map((r) => (
              <button
                key={r}
                onClick={() => r !== road && act({ action: 'update_target', id: t.id, road: r, variant_id: '' }, `${t.studio} moved to ${ROAD_INFO[r].name}`)}
                className={`border px-2 py-1 ${r === road ? '' : 'border-[#333] text-[#666]'}`}
                style={r === road ? { borderColor: ROAD_INFO[r].colour, color: ROAD_INFO[r].colour } : undefined}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Stage track */}
          <div className="flex flex-wrap gap-1 text-[10px] font-mono">
            {STAGES.map((s) => (
              <span key={s} className={`px-2 py-1 border ${reached(t, s) ? 'border-[#33e6a0]/60 text-[#33e6a0]' : 'border-[#222] text-[#444]'}`}>{stageLabel(road, s)}</span>
            ))}
          </div>

          <select
            className={input}
            value={t.variant_id ?? ''}
            onChange={(e) => act({ action: 'update_target', id: t.id, variant_id: e.target.value }, 'Message changed')}
          >
            <option value="">Message to send…</option>
            {variants.filter((x) => roadOf(x) === road && (x.status !== 'retired' || x.id === t.variant_id)).map((x) => (
              <option key={x.id} value={x.id}>{x.code} · {x.angle}</option>
            ))}
          </select>

          {v && (
            <>
              {v.use_when && <p className="text-[11px] text-[#ffb454]">Use when: {v.use_when}</p>}
              {/* Same words, packaged for the channel */}
              <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                <span className="text-[#555] self-center mr-1">SEND BY</span>
                {CHANNELS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setPicked(c)}
                    className={`border px-2 py-1 ${c === channel ? 'border-white text-white' : 'border-[#333] text-[#666]'}`}
                  >
                    {CHANNEL_LABEL[c].toUpperCase()}
                  </button>
                ))}
              </div>
              {channel === 'email' && packaged.subject && <p className="text-xs text-[#888]">Subject: <span className="text-[#ccc]">{packaged.subject}</span></p>}
              <textarea
                readOnly
                rows={Math.min(10, packaged.text.split('\n').length + 1)}
                onFocus={(e) => e.currentTarget.select()}
                className={`${input} text-[#ccc] border-l-2`}
                style={{ borderLeftColor: ROAD_INFO[road].colour }}
                value={packaged.text}
              />
              <p className="text-[10px] text-[#555]">Before you send: a 7-year-old gets it (G1) · it starts with their problem (G2) · one small ask (G3)</p>
            </>
          )}

          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <button onClick={copy} className="border border-[#00e5ff] text-[#00e5ff] px-3 py-2">COPY</button>
            {link && (
              <a
                href={link}
                target={channel === 'email' ? undefined : '_blank'}
                rel="noreferrer"
                onClick={() => channel === 'instagram' && copyText(packaged.text)}
                className="border border-[#33e6a0] text-[#33e6a0] px-3 py-2"
              >
                {channel === 'instagram' ? 'COPY + OPEN INSTAGRAM' : `OPEN ${CHANNEL_LABEL[channel].toUpperCase()}`}
              </a>
            )}
            {next && (
              <button onClick={() => act({ action: 'set_stage', id: t.id, stage: next }, `${t.studio}: ${stageLabel(road, next)}`)} className="border border-[#33e6a0] text-[#33e6a0] px-3 py-2">
                MARK {stageLabel(road, next).toUpperCase()}
              </button>
            )}
            {move && move.key !== 'wait' && (
              <button
                onClick={() => act({ action: 'touch', id: t.id, kind: move.key }, `${t.studio}: ${move.label} logged`)}
                className={`border px-3 py-2 ${move.due ? 'border-[#ffb454] text-[#ffb454]' : 'border-[#333] text-[#888]'}`}
              >
                LOG: {move.label.toUpperCase()}{move.due ? '' : ` (due in ${move.inDays} working days)`}
              </button>
            )}
            {road === 'fuel' && t.stage === 'signed' && !hasKineticTwin && (
              <button
                onClick={() =>
                  act(
                    { action: 'add_target', road: 'kinetic', stage: 'replied', variant_id: variants.find((x) => x.code === 'V10')?.id ?? '', next_step: 'Send V10 with their tasting numbers, then book the 15 minutes', studio: t.studio, owner_name: t.owner_name, area: t.area, contact: t.contact, fit_note: t.fit_note, batch: t.batch, friction: t.friction },
                    `${t.studio} is now on the Kinetic road`,
                  )
                }
                className="border border-[#00e5ff] text-[#00e5ff] px-3 py-2"
              >
                OPEN KINETIC ROAD
              </button>
            )}
            {t.stage !== 'no' && t.stage !== 'signed' && (
              <button onClick={() => act({ action: 'set_stage', id: t.id, stage: 'no' as Stage }, 'Marked not now')} className="border border-[#333] text-[#666] px-3 py-2">NOT NOW</button>
            )}
          </div>

          {/* Reply gates */}
          {showGates && (
            <div className="border border-[#a855f7]/40 p-3 space-y-2">
              <div className="text-[10px] font-mono text-[#a855f7] tracking-widest">THEY REPLIED? TAP WHAT THEY SAID</div>
              {(['admin', 'owner', 'either'] as const).map((who) => (
                <div key={who}>
                  <div className="text-[10px] text-[#666] mb-1">{WHO_LABEL[who]}</div>
                  <div className="flex flex-wrap gap-1">
                    {REPLY_GATES.filter((g) => g.who === who).map((g) => (
                      <button
                        key={g.key}
                        onClick={() => setGateKey(g.key === gateKey ? null : g.key)}
                        className={`border px-2 py-1 text-xs text-left ${g.key === gateKey ? 'border-[#a855f7] text-white' : 'border-[#333] text-[#999]'}`}
                      >
                        {g.said}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {!gate && t.stage === 'messaged' && <p className="text-[11px] text-[#555]">No reply yet? Follow the LOG button above: gift, then call, then visit.</p>}
              {gate && (() => {
                const reply = formatFor(channel, gateReply(gate, road, t)).text;
                return (
                  <div className="space-y-2">
                    <textarea readOnly rows={Math.min(6, reply.split('\n').length + 2)} onFocus={(e) => e.currentTarget.select()} className={`${input} text-[#ccc]`} value={reply} />
                    <p className="text-[11px] text-[#ffb454]">Then: {gate.next}</p>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      <button
                        onClick={async () => flash((await copyText(reply)) ? 'Reply copied' : 'Copy blocked. Press and hold, then Select All')}
                        className="border border-[#00e5ff] text-[#00e5ff] px-3 py-2"
                      >
                        COPY REPLY
                      </button>
                      <button
                        onClick={async () => (await act({ action: 'reply', id: t.id, gate: gate.key }, `${t.studio}: reply logged, next step set`)) && setGateKey(null)}
                        className="border border-[#a855f7] text-[#a855f7] px-3 py-2"
                      >
                        I SENT IT · SET NEXT STEP
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* The gift follow-up, ready when it is due */}
          {move && move.key === 'followup' && (() => {
            const gv = variants.find((x) => x.code === (channel === 'instagram' ? 'V14' : 'V13'));
            if (!gv) return null;
            const gift = formatFor(channel, fillMessage(gv.body, t));
            return (
              <div className="border border-[#ffb454]/50 p-3 space-y-2">
                <div className="text-[10px] font-mono text-[#ffb454] tracking-widest">{move.due ? 'FOLLOW-UP DUE' : `FOLLOW-UP IN ${move.inDays} WORKING DAYS`} · {gv.code} · {CHANNEL_LABEL[channel].toUpperCase()}</div>
                {channel === 'email' && gift.subject && <p className="text-xs text-[#888]">Subject: <span className="text-[#ccc]">{gift.subject}</span></p>}
                <textarea readOnly rows={Math.min(7, gift.text.split('\n').length + 1)} onFocus={(e) => e.currentTarget.select()} className={`${input} text-[#ccc]`} value={gift.text} />
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <button
                    onClick={async () => flash((await copyText(channel === 'email' && gift.subject ? `Subject: ${gift.subject}\n\n${gift.text}` : gift.text)) ? 'Follow-up copied' : 'Copy blocked. Press and hold, then Select All')}
                    className="border border-[#00e5ff] text-[#00e5ff] px-3 py-2"
                  >
                    COPY FOLLOW-UP
                  </button>
                  <span className="text-[11px] text-[#666] self-center font-sans">Switch “Send by” to Instagram for the DM version. Then tap LOG above.</span>
                </div>
              </div>
            );
          })()}

          <div className="grid sm:grid-cols-2 gap-2">
            <input className={input} placeholder="Owner / person to write to" value={draft.owner_name} onChange={(e) => setDraft({ ...draft, owner_name: e.target.value })} />
            <input className={input} placeholder="Referred by (who gave us their name)" value={draft.referred_by} onChange={(e) => setDraft({ ...draft, referred_by: e.target.value })} />
          </div>
          <input className={input} placeholder="Contact: email · WhatsApp +60… · IG @handle" value={draft.contact} onChange={(e) => setDraft({ ...draft, contact: e.target.value })} />
          <input className={input} placeholder="Detail from their page (fills {detail})" value={draft.fit_note} onChange={(e) => setDraft({ ...draft, fit_note: e.target.value })} />
          <textarea className={input} rows={3} placeholder={road === 'fuel' ? 'What their members need, in their words' : 'Their problem, in their words (from the call)'} value={draft.friction} onChange={(e) => setDraft({ ...draft, friction: e.target.value })} />
          <div className="grid sm:grid-cols-[1fr_auto] gap-2">
            <input className={input} placeholder="Next step" value={draft.next_step} onChange={(e) => setDraft({ ...draft, next_step: e.target.value })} />
            <input className={input} type="date" value={draft.next_date} onChange={(e) => setDraft({ ...draft, next_date: e.target.value })} />
          </div>
          <div className="flex gap-2 text-xs font-mono">
            <button onClick={() => act({ action: 'update_target', id: t.id, ...draft }, 'Saved')} className="border border-[#00e5ff] text-[#00e5ff] px-3 py-2">SAVE NOTES</button>
            <button
              onClick={() => confirm(`Delete ${t.studio} and its history?`) && act({ action: 'delete_target', id: t.id }, 'Deleted')}
              className="ml-auto border border-[#333] text-[#555] px-3 py-2 hover:text-[#ff5c72]"
            >
              DELETE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddVariant({ onAdd, nextCode }: { onAdd: (row: Record<string, string>) => Promise<boolean>; nextCode: string }) {
  const [row, setRow] = useState({ code: '', body: '', angle: '', use_when: '' });
  const check = row.body ? plainCheck(row.body) : null;
  return (
    <form
      className="border border-dashed border-[#333] p-3 mt-3 space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await onAdd({ ...row, code: row.code || nextCode })) setRow({ code: '', body: '', angle: '', use_when: '' });
      }}
    >
      <div className="grid grid-cols-[80px_1fr] gap-2">
        <input className={input} placeholder={nextCode} value={row.code} onChange={(e) => setRow({ ...row, code: e.target.value })} />
        <input className={input} placeholder="What this one tests (one change only)" value={row.angle} onChange={(e) => setRow({ ...row, angle: e.target.value })} />
      </div>
      <input className={input} placeholder="Use when: who it's for and where they are (cold first touch / warm after a visit / …)" value={row.use_when} onChange={(e) => setRow({ ...row, use_when: e.target.value })} />
      <textarea className={input} rows={4} placeholder="New message. Use {studio}, {name}, {detail}. First line 'Subject: …' for email. 3 lines, one ask." value={row.body} onChange={(e) => setRow({ ...row, body: e.target.value })} />
      {check && (
        <p className={`text-[11px] font-sans ${check.pass ? 'text-[#33e6a0]' : check.banned ? 'text-[#ff5c72]' : 'text-[#ffb454]'}`}>
          {check.pass ? 'Plain-language check: words pass.' : `Plain-language check: ${check.issues.join(' · ')}`}
        </p>
      )}
      {row.body && !ctaCheck(row.body).pass && (
        <p className="text-[11px] font-sans text-[#ffb454]">No clear ask at the end. Finish on one line they can answer: a yes, a name, a day or a class.</p>
      )}
      <button className="border border-[#a855f7] text-[#a855f7] px-4 py-2 text-xs" disabled={!row.body}>+ ADD MESSAGE TO TEST</button>
    </form>
  );
}

function AddLesson({ variants, onAdd }: { variants: Variant[]; onAdd: (row: Record<string, string>) => Promise<boolean> }) {
  const [body, setBody] = useState('');
  const [variantId, setVariantId] = useState('');
  return (
    <form
      className="flex flex-col sm:flex-row gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await onAdd({ body, variant_id: variantId })) setBody('');
      }}
    >
      <input className={input} placeholder="e.g. Owners reply to questions, not statements" value={body} onChange={(e) => setBody(e.target.value)} />
      <select className={`${input} sm:w-40`} value={variantId} onChange={(e) => setVariantId(e.target.value)}>
        <option value="">About…</option>
        {variants.map((v) => (
          <option key={v.id} value={v.id}>{v.code}</option>
        ))}
      </select>
      <button className="border border-[#00e5ff] text-[#00e5ff] px-4 py-2 text-xs font-mono whitespace-nowrap">SAVE LESSON</button>
    </form>
  );
}
