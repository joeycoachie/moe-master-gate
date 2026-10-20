'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TEAM_STAGES, TEAM_STAGE_LABEL, daysSince, needsTouch, type TeamStage, type TeamTarget } from '@/lib/recupTeam';
import SignOut from '../SignOut';

// A partner's own studios: claim before you message, tap what happened after each touch.
export default function MyStudios() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [targets, setTargets] = useState<TeamTarget[] | null>(null);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');
  const [row, setRow] = useState({ studio: '', area: '', contact: '' });

  const load = () =>
    fetch('/recup/api/log')
      .then(async (res) => {
        const body = await res.json();
        if (res.status === 401) return router.replace('/recup/login');
        if (!res.ok) return setError(body.error || 'Could not load your studios.');
        setName(body.name);
        setTargets(body.targets);
      })
      .catch(() => setError('Connection failed. Try again.'));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const act = async (payload: Record<string, unknown>, done: string) => {
    const res = await fetch('/recup/api/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const body = await res.json().catch(() => ({}));
    setFlash(res.ok ? done : body.error || 'Could not save.');
    setTimeout(() => setFlash(''), 3500);
    if (res.ok) await load();
    return res.ok;
  };

  const open = (targets ?? []).filter((t) => t.stage !== 'no' && t.stage !== 'held');
  const done = (targets ?? []).filter((t) => t.stage === 'no' || t.stage === 'held');

  return (
    <div className="wrap">
      <nav className="bar">
        <span>{name ? `Signed in as ${name.split(' ')[0]}` : ' '}</span>
        <Link href="/recup/team">← Team Guide</Link>
        <SignOut />
      </nav>
      <header className="stack">
        <p className="eyebrow">RECUP.STN · Team</p>
        <h1>My studios</h1>
        <p className="lede">Add a studio before you message it. After each touch, tap what happened. Joey sees this list.</p>
      </header>

      {error && <p className="err">{error}</p>}
      {flash && <p className="err" role="status">{flash}</p>}

      <form
        className="card"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await act({ action: 'add', ...row }, `${row.studio} is yours`)) setRow({ studio: '', area: '', contact: '' });
        }}
      >
        <b>Add a studio</b>
        <div className="grid2">
          <input id="studio" placeholder="Studio name" value={row.studio} onChange={(e) => setRow({ ...row, studio: e.target.value })} required />
          <input id="area" placeholder="Area" value={row.area} onChange={(e) => setRow({ ...row, area: e.target.value })} />
        </div>
        <input id="contact" placeholder="Contact: email, WhatsApp or @instagram" value={row.contact} onChange={(e) => setRow({ ...row, contact: e.target.value })} />
        <button className="btn" style={{ alignSelf: 'flex-start' }}>Claim this studio</button>
      </form>

      <section className="stack">
        <h2>In progress · {open.length}</h2>
        {targets && !open.length && <p className="note">Nothing yet. Claim your first studio above.</p>}
        {open.map((t) => <StudioCard key={t.id} t={t} act={act} />)}
      </section>

      {done.length > 0 && (
        <details>
          <summary className="note" style={{ cursor: 'pointer' }}>Finished · {done.length}</summary>
          <div className="stack" style={{ marginTop: 12 }}>
            {done.map((t) => <StudioCard key={t.id} t={t} act={act} />)}
          </div>
        </details>
      )}
    </div>
  );
}

function StudioCard({ t, act }: { t: TeamTarget; act: (p: Record<string, unknown>, done: string) => Promise<boolean> }) {
  const [draft, setDraft] = useState({ next_step: t.next_step, next_date: t.next_date ?? '', notes: t.notes, contact: t.contact });
  const idx = t.stage === 'no' ? -1 : TEAM_STAGES.indexOf(t.stage);
  const next = idx >= 0 && idx < TEAM_STAGES.length - 1 ? TEAM_STAGES[idx + 1] : null;
  const due = needsTouch(t);
  const days = daysSince(t);
  const [confirmRelease, setConfirmRelease] = useState(false);

  return (
    <article className={`card ${due ? 'due' : ''}`}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <b>{t.studio}</b>
        <span className="note">{TEAM_STAGE_LABEL[t.stage]} · {days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'} ago`}</span>
      </div>
      {t.area && <span className="note">{t.area}</span>}
      {due && <p className="err">{t.stage === 'found' ? 'Not messaged yet.' : 'Quiet for 3 working days. Time for the next touch.'}</p>}
      <div className="row">
        {TEAM_STAGES.map((s) => <span key={s} className={`pill ${t.stage_at[s] || t.stage === s ? 'on' : ''}`}>{TEAM_STAGE_LABEL[s]}</span>)}
      </div>
      <div className="row">
        {next && <button type="button" className="btn" onClick={() => act({ action: 'set_stage', id: t.id, stage: next }, `${t.studio}: ${TEAM_STAGE_LABEL[next]}`)}>Mark {TEAM_STAGE_LABEL[next].toLowerCase()}</button>}
        {t.stage === 'messaged' && <button type="button" className="btn ghost" onClick={() => act({ action: 'followup', id: t.id }, `${t.studio}: follow-up logged`)}>I followed up</button>}
        {t.stage !== 'no' && t.stage !== 'held' && <button type="button" className="btn ghost" onClick={() => act({ action: 'set_stage', id: t.id, stage: 'no' as TeamStage }, `${t.studio}: not now`)}>Not now</button>}
      </div>
      <input id={`contact-${t.id}`} placeholder="Contact" value={draft.contact} onChange={(e) => setDraft({ ...draft, contact: e.target.value })} />
      <div className="grid2">
        <input id={`next-${t.id}`} placeholder="Next step" value={draft.next_step} onChange={(e) => setDraft({ ...draft, next_step: e.target.value })} />
        <input id={`date-${t.id}`} type="date" value={draft.next_date} onChange={(e) => setDraft({ ...draft, next_date: e.target.value })} />
      </div>
      <textarea id={`notes-${t.id}`} rows={2} placeholder="What they said, in their words" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button type="button" className="btn ghost" onClick={() => act({ action: 'update', id: t.id, ...draft }, 'Saved')}>Save notes</button>
        {confirmRelease ? (
          <span className="row">
            <span className="note">Give this studio back?</span>
            <button type="button" className="linkbtn" onClick={() => act({ action: 'release', id: t.id }, `${t.studio} released`)}>Yes, release</button>
            <button type="button" className="linkbtn" onClick={() => setConfirmRelease(false)}>Keep</button>
          </span>
        ) : (
          <button type="button" className="linkbtn" onClick={() => setConfirmRelease(true)}>Release studio</button>
        )}
      </div>
    </article>
  );
}
