'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PortalPanel from './PortalPanel';
import ExtraSessionForm from './ExtraSessionForm';

type Client = {
  id: string;
  full_name: string;
  format: '1-1' | 'group';
  group_label: string | null;
  history: string;
  conditions: string;
  avoid: string;
  current_arc: string | null;
  status: string;
};
type StationLog = { done: boolean; apparatus: string; movement: string; note: string };
type Audit = {
  gates?: { name: string; value: string; label: string }[];
  somatic?: { label: string; checked: boolean }[];
  notes?: string;
  verdict?: string;
};
type TimelineItem = {
  entry_id: string;
  protocol_id: string;
  session_date: string;
  flow_format: string | null;
  session_note: string;
  with: string[];
  stations: Record<string, StationLog>;
  audit: Audit | null;
};

const PHASE_ORDER = ['primer', 'anchor', 'crucible', 'unwind'];
const PHASE_LABEL: Record<string, string> = { primer: 'Primer', anchor: 'Anchor', crucible: 'Crucible', unwind: 'Unwind' };

function sortKeys(keys: string[]) {
  return [...keys].sort((a, b) => {
    const [pa, sa] = a.split('.');
    const [pb, sb] = b.split('.');
    const ia = PHASE_ORDER.indexOf(pa);
    const ib = PHASE_ORDER.indexOf(pb);
    return ia !== ib ? (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) : sa.localeCompare(sb);
  });
}

// One client: profile (editable) and their whole timeline across every arc.
export default function OpsClientPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [draft, setDraft] = useState<Client | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState('');

  useEffect(() => {
    fetch(`/ops/api/clients/${clientId}`)
      .then(async (res) => {
        const body = await res.json();
        if (res.status === 401) {
          router.replace('/ops/architect?next=/ops/clients');
          return;
        }
        if (!res.ok) {
          setError(body.error || 'Failed to load client.');
          return;
        }
        setClient(body.client);
        setDraft(body.client);
        setTimeline(body.timeline);
      })
      .catch(() => setError('Connection failed while loading client.'));
  }, [clientId, router]);

  const saveProfile = async () => {
    if (!draft) return;
    setSaving(true);
    setSavedNote('');
    try {
      const res = await fetch(`/ops/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: draft.full_name,
          format: draft.format,
          group_label: draft.group_label,
          history: draft.history,
          conditions: draft.conditions,
          avoid: draft.avoid,
          current_arc: draft.current_arc,
          status: draft.status,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setSavedNote(body.error || 'Save failed.');
        return;
      }
      setClient(body.client);
      setDraft(body.client);
      setSavedNote('Saved.');
    } finally {
      setSaving(false);
    }
  };

  const dirty = JSON.stringify(client) !== JSON.stringify(draft);
  const field = 'w-full bg-[#050505] border border-[#333] text-white text-sm py-2 px-3 outline-none focus:border-[#00e5ff]';

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-5 md:p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1">
        <header className="border-b border-[#222] pb-5 mb-6 flex justify-between items-center flex-wrap gap-3">
          <div>
            <div className="text-[10px] text-[#a855f7] tracking-[4px] uppercase">ARCHITECT — CLIENT FILE</div>
            <h1 className="text-2xl font-bold mt-1">{client?.full_name ?? '…'}</h1>
          </div>
          <Link href="/ops/clients" className="border border-[#333] px-3 py-2 text-xs text-[#888] hover:text-white">← CLIENTS</Link>
        </header>

        {error && <div className="border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444] text-xs p-4 mb-6">{error}</div>}

        {draft && (
          <section className="border border-[#222] bg-[#0a0a0a] p-5 mb-10 space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-1">Format</label>
                <select value={draft.format} onChange={(e) => setDraft({ ...draft, format: e.target.value as Client['format'] })} className={field}>
                  <option value="1-1">1-1</option>
                  <option value="group">Group</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-1">Group</label>
                <input value={draft.group_label ?? ''} onChange={(e) => setDraft({ ...draft, group_label: e.target.value })} className={field} />
              </div>
              <div>
                <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-1">Current arc</label>
                <input value={draft.current_arc ?? ''} onChange={(e) => setDraft({ ...draft, current_arc: e.target.value })} placeholder="e.g. KIN-P016" className={field} />
              </div>
              <div>
                <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-1">Status</label>
                <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className={field}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            {(['history', 'conditions', 'avoid'] as const).map((k) => (
              <div key={k}>
                <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-1">
                  {k === 'history' ? 'History' : k === 'conditions' ? 'Conditions / overrides (e.g. RA, knee, nerve)' : 'Avoid'}
                </label>
                <textarea value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} rows={k === 'history' ? 3 : 2} className={field} />
              </div>
            ))}
            <div className="flex items-center gap-3">
              <button
                onClick={saveProfile}
                disabled={saving || !dirty}
                className="border border-[#00e5ff] text-[#00e5ff] px-4 py-2 text-xs tracking-widest hover:bg-[#00e5ff] hover:text-black transition-colors disabled:opacity-40"
              >
                {saving ? 'SAVING…' : 'SAVE PROFILE'}
              </button>
              {savedNote && <span className="text-[11px] text-[#888]">{savedNote}</span>}
            </div>
          </section>
        )}

        {client && <PortalPanel clientId={client.id} clientFirstName={client.full_name.split(/\s+/)[0]} />}

        <h2 className="text-lg font-bold mb-1 border-b border-[#222] pb-2">Timeline · newest first</h2>
        <p className="text-[11px] text-[#666] mb-4">Every arc session this client was in, logged from the [ CLIENT LOG ] bar, plus extra sessions.</p>
        {client && (
          <ExtraSessionForm
            clientId={client.id}
            onSaved={() =>
              fetch(`/ops/api/clients/${clientId}`)
                .then((r) => r.json())
                .then((b) => b.timeline && setTimeline(b.timeline))
            }
          />
        )}
        {client && !timeline.length && <p className="text-xs text-[#555]">No sessions logged yet.</p>}

        <ol className="space-y-4">
          {timeline.map((t) => {
            const keys = sortKeys(Object.keys(t.stations));
            const done = keys.filter((k) => t.stations[k].done).length;
            const skipped = keys.filter((k) => !t.stations[k].done);
            const notes = keys.filter((k) => t.stations[k].note.trim());
            const flags = (t.audit?.somatic ?? []).filter((s) => s.checked);
            return (
              <li key={t.entry_id} className="border border-[#222] bg-[#0a0a0a] p-5">
                <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
                  <div>
                    <span className="text-[#00e5ff] text-sm">{t.session_date}</span>
                    <span className="text-[#888] text-xs"> · {t.protocol_id === 'EXTRA' ? `Extra session: ${t.session_note}` : t.protocol_id}</span>
                    {t.with.length > 0 && <span className="text-[#555] text-xs"> · with {t.with.join(', ')}</span>}
                  </div>
                  <span className="text-[10px] text-[#888] border border-[#333] px-2 py-0.5">{done}/{keys.length} stations</span>
                </div>
                {skipped.length > 0 && (
                  <p className="text-[11px] text-[#f59e0b] mb-2">
                    Skipped: {skipped.map((k) => `${PHASE_LABEL[k.split('.')[0]] ?? k.split('.')[0]} ${k.split('.')[1]}`).join(', ')}
                  </p>
                )}
                {notes.length > 0 && (
                  <ul className="space-y-1 mb-3">
                    {notes.map((k) => (
                      <li key={k} className="text-xs text-[#ccc]">
                        <span className="text-[#666]">{PHASE_LABEL[k.split('.')[0]] ?? k.split('.')[0]} {k.split('.')[1]} · {t.stations[k].movement} ({t.stations[k].apparatus}):</span>{' '}
                        {t.stations[k].note}
                      </li>
                    ))}
                  </ul>
                )}
                {t.audit && (
                  <div className="border-t border-[#1a1a1a] pt-3 mt-2 space-y-1">
                    {(t.audit.gates ?? []).map((g, i) => (
                      <p key={i} className="text-[11px] text-[#aaa]">
                        <span className="text-[#666]">{g.name}:</span> {g.label}
                      </p>
                    ))}
                    {flags.length > 0 && <p className="text-[11px] text-[#ef4444]">Body checks: {flags.map((f) => f.label).join(' · ')}</p>}
                    {t.audit.notes && <p className="text-[11px] text-[#ccc]">Notes: {t.audit.notes}</p>}
                    {t.audit.verdict && (
                      <details className="text-[11px] text-[#888]">
                        <summary className="cursor-pointer text-[#00e5ff]">Routing verdict</summary>
                        <p className="whitespace-pre-wrap mt-1">{t.audit.verdict}</p>
                      </details>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
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
