'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  STAGES,
  STAGE_LABEL,
  buildPhases,
  fillMessage,
  sendLinks,
  funnel,
  overdueFollowUps,
  plainCheck,
  reached,
  sendStreak,
  variantScores,
  type OutreachEvent,
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

  const phases = useMemo(() => buildPhases(targets, variants, events), [targets, variants, events]);
  const f = funnel(targets);
  const allSteps = phases.flatMap((p) => p.steps);
  const doneSteps = allSteps.filter((s) => s.done).length;
  const cleared = phases.filter((p) => p.steps.every((s) => s.done));
  const rank = cleared.length ? cleared[cleared.length - 1].rank : 'E';
  const streak = sendStreak(events);
  const overdue = overdueFollowUps(targets);
  const scores = variantScores(variants, targets);
  const lessons = events.filter((e) => e.kind === 'lesson');
  const shown = targets.filter((t) => filter === 'all' || (t.stage !== 'signed' && t.stage !== 'no'));

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
            <div className="text-[10px] text-[#a855f7] tracking-[4px] uppercase">ARCHITECT — SYS.OP · BC3</div>
            <h1 className="text-2xl font-bold mt-1">Outreach Console</h1>
            <p className="text-xs text-[#888] font-sans mt-1">One signed 90-Day Setup closes BC3. The only number fully in your hands: messages sent.</p>
          </div>
          <nav className="flex gap-2 text-xs">
            <button onClick={sendReport} className="border border-[#a855f7] px-3 py-2 text-[#a855f7] hover:text-white">SEND REPORT NOW</button>
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
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 text-center">
                {[
                  ['Found', f.found],
                  ['Sent', f.messaged],
                  ['Replied', f.replied],
                  ['Calls', f.calls],
                  ['Plans', f.plans],
                  ['Signed', f.signed],
                ].map(([l, n]) => (
                  <div key={l} className="border border-[#222] py-2">
                    <div className="text-lg font-bold">{n}</div>
                    <div className="text-[10px] text-[#666] uppercase tracking-widest">{l}</div>
                  </div>
                ))}
              </div>
              {overdue.length > 0 && (
                <p className="text-xs text-[#ffb454] mt-3 font-sans">Follow up today: {overdue.map((t) => t.studio).join(', ')}</p>
              )}
            </section>

            {/* Phases, auto-ticked */}
            <section className="mb-8">
              <h2 className="text-sm text-[#888] tracking-widest mb-3">THE FOUR PHASES · ticked from your data</h2>
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
            </section>

            {/* Studio list */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h2 className="text-sm text-[#888] tracking-widest">STUDIOS</h2>
                <div className="ml-auto flex gap-1 text-[11px]">
                  {(['open', 'all'] as const).map((k) => (
                    <button key={k} onClick={() => setFilter(k)} className={`border px-2 py-1 ${filter === k ? 'border-[#00e5ff] text-[#00e5ff]' : 'border-[#333] text-[#666]'}`}>
                      {k === 'open' ? 'IN PLAY' : 'ALL'}
                    </button>
                  ))}
                </div>
              </div>
              <AddStudio variants={variants.filter((v) => v.status !== 'retired')} onAdd={(row) => act({ action: 'add_target', ...row }, 'Studio added')} />
              <div className="space-y-2 mt-3">
                {shown.map((t) => (
                  <StudioCard
                    key={t.id}
                    t={t}
                    variants={variants}
                    open={openId === t.id}
                    overdue={overdue.includes(t)}
                    onToggle={() => setOpenId(openId === t.id ? null : t.id)}
                    act={act}
                    flash={flash}
                  />
                ))}
                {!shown.length && <p className="text-xs text-[#555] font-sans">No studios in play. Add the first 10 that fit: results-minded, still on WhatsApp and spreadsheets.</p>}
              </div>
            </section>

            {/* Message tests */}
            <section className="mb-8">
              <h2 className="text-sm text-[#888] tracking-widest mb-1">MESSAGE TESTS · mini batches</h2>
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
              <AddVariant onAdd={(row) => act({ action: 'add_variant', ...row }, 'Message added')} nextCode={`V${variants.length + 1}`} />
            </section>

            {/* Lessons */}
            <section className="mb-8">
              <h2 className="text-sm text-[#888] tracking-widest mb-1">WHAT WE LEARNED</h2>
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
            </section>
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

function StudioCard({
  t, variants, open, overdue, onToggle, act, flash,
}: {
  t: Target;
  variants: Variant[];
  open: boolean;
  overdue: boolean;
  onToggle: () => void;
  act: (p: Record<string, unknown>, done?: string) => Promise<boolean>;
  flash: (m: string) => void;
}) {
  const v = variants.find((x) => x.id === t.variant_id);
  const [draft, setDraft] = useState({ friction: t.friction, next_step: t.next_step, next_date: t.next_date ?? '', fit_note: t.fit_note, contact: t.contact });
  const idx = t.stage === 'no' ? -1 : STAGES.indexOf(t.stage);
  const next = idx >= 0 && idx < STAGES.length - 1 ? STAGES[idx + 1] : null;

  const message = v ? fillMessage(v.body, t) : '';
  const links: ReturnType<typeof sendLinks> = v ? sendLinks(t.contact, message) : { mailto: undefined, wa: undefined };
  const copy = async () => {
    if (!v) return flash('Pick a message for this studio first');
    await navigator.clipboard.writeText(message);
    flash(`${v.code} copied for ${t.studio}`);
  };

  return (
    <div className={`border bg-[#0a0a0a] ${overdue ? 'border-[#ffb454]/60' : 'border-[#222]'}`}>
      <button onClick={onToggle} className="w-full text-left p-3 flex items-center gap-3 flex-wrap">
        <span className="font-bold font-sans">{t.studio}</span>
        <span className="text-[11px] text-[#666] font-sans">{[t.owner_name, t.area, t.batch].filter(Boolean).join(' · ')}</span>
        <span className="ml-auto text-[11px] flex gap-2 items-center">
          {v && <span className="text-[#00e5ff]">{v.code}</span>}
          {overdue && <span className="text-[#ffb454]">FOLLOW UP</span>}
          <span className={t.stage === 'signed' ? 'text-[#33e6a0]' : t.stage === 'no' ? 'text-[#555]' : 'text-white'}>{STAGE_LABEL[t.stage]}</span>
        </span>
      </button>
      {open && (
        <div className="border-t border-[#1a1a1a] p-3 space-y-3 font-sans">
          {/* Stage track */}
          <div className="flex flex-wrap gap-1 text-[10px] font-mono">
            {STAGES.map((s) => (
              <span key={s} className={`px-2 py-1 border ${reached(t, s) ? 'border-[#33e6a0]/60 text-[#33e6a0]' : 'border-[#222] text-[#444]'}`}>{STAGE_LABEL[s]}</span>
            ))}
          </div>
          {v && <p className="text-sm text-[#ccc] whitespace-pre-wrap border-l-2 border-[#00e5ff]/40 pl-3">{message}</p>}
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <button onClick={copy} className="border border-[#00e5ff] text-[#00e5ff] px-3 py-2">COPY MESSAGE</button>
            {links.mailto && <a href={links.mailto} className="border border-[#00e5ff] text-[#00e5ff] px-3 py-2">EMAIL</a>}
            {links.wa && <a href={links.wa} target="_blank" rel="noreferrer" className="border border-[#33e6a0] text-[#33e6a0] px-3 py-2">WHATSAPP</a>}
            {next && (
              <button onClick={() => act({ action: 'set_stage', id: t.id, stage: next }, `${t.studio}: ${STAGE_LABEL[next]}`)} className="border border-[#33e6a0] text-[#33e6a0] px-3 py-2">
                MARK {STAGE_LABEL[next].toUpperCase()}
              </button>
            )}
            {t.stage === 'messaged' && (
              <button onClick={() => act({ action: 'followup', id: t.id }, 'Follow-up logged')} className="border border-[#ffb454] text-[#ffb454] px-3 py-2">
                FOLLOWED UP ({t.followups})
              </button>
            )}
            {t.stage !== 'no' && t.stage !== 'signed' && (
              <button onClick={() => act({ action: 'set_stage', id: t.id, stage: 'no' as Stage }, 'Marked not now')} className="border border-[#333] text-[#666] px-3 py-2">NOT NOW</button>
            )}
          </div>
          <select
            className={input}
            value={t.variant_id ?? ''}
            onChange={(e) => act({ action: 'update_target', id: t.id, variant_id: e.target.value }, 'Message changed')}
          >
            <option value="">Message to send…</option>
            {variants.filter((x) => x.status !== 'retired' || x.id === t.variant_id).map((x) => (
              <option key={x.id} value={x.id}>{x.code} · {x.angle}</option>
            ))}
          </select>
          <input className={input} placeholder="Contact" value={draft.contact} onChange={(e) => setDraft({ ...draft, contact: e.target.value })} />
          <input className={input} placeholder="Detail from their page (fills {detail})" value={draft.fit_note} onChange={(e) => setDraft({ ...draft, fit_note: e.target.value })} />
          <textarea className={input} rows={3} placeholder="Their problem, in their words (from the call)" value={draft.friction} onChange={(e) => setDraft({ ...draft, friction: e.target.value })} />
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
  const [row, setRow] = useState({ code: '', body: '', angle: '' });
  const check = row.body ? plainCheck(row.body) : null;
  return (
    <form
      className="border border-dashed border-[#333] p-3 mt-3 space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await onAdd({ ...row, code: row.code || nextCode })) setRow({ code: '', body: '', angle: '' });
      }}
    >
      <div className="grid grid-cols-[80px_1fr] gap-2">
        <input className={input} placeholder={nextCode} value={row.code} onChange={(e) => setRow({ ...row, code: e.target.value })} />
        <input className={input} placeholder="What this one tests (one change only)" value={row.angle} onChange={(e) => setRow({ ...row, angle: e.target.value })} />
      </div>
      <textarea className={input} rows={4} placeholder="New message. Use {studio}, {name}, {detail}. First line 'Subject: …' for email. 3 lines, one ask." value={row.body} onChange={(e) => setRow({ ...row, body: e.target.value })} />
      {check && (
        <p className={`text-[11px] font-sans ${check.pass ? 'text-[#33e6a0]' : check.banned ? 'text-[#ff5c72]' : 'text-[#ffb454]'}`}>
          {check.pass ? 'Plain-language check: words pass.' : `Plain-language check: ${check.issues.join(' · ')}`}
        </p>
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
