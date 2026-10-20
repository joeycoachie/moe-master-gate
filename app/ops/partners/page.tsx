'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TEAM_STAGE_LABEL, daysSince, needsTouch, type TeamTarget } from '@/lib/recupTeam';

type Partner = { id: string; full_name: string; phone: string; active: boolean; created_at: string };
type Row = TeamTarget & { clash: boolean };

// RECUP.STN team overview (founder only): who each partner has reached, and how long ago.
// Separate from the founder's own Outreach Console; a studio on both lists shows as CLASH.
export default function OpsPartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [targets, setTargets] = useState<Row[]>([]);
  const [error, setError] = useState('');
  const [newPartner, setNewPartner] = useState({ full_name: '', phone: '' });
  const [issued, setIssued] = useState<{ name: string; code: string } | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const load = () =>
    fetch('/ops/api/partners')
      .then(async (res) => {
        const body = await res.json();
        if (res.status === 401) return router.replace('/ops/architect?next=/ops/partners');
        if (!res.ok) return setError(body.error || 'Failed to load.');
        setError('');
        setPartners(body.partners);
        setTargets(body.targets);
      })
      .catch(() => setError('Connection failed.'));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const post = async (payload: Record<string, unknown>) => {
    const res = await fetch('/ops/api/partners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) setError(body.error || 'Save failed.');
    await load();
    return body;
  };

  const nameOf = (id: string) => partners.find((p) => p.id === id)?.full_name ?? '—';
  const shown = targets.filter((t) => filter === 'all' || t.partner_id === filter);
  const message = issued
    ? `Hi ${issued.name.split(' ')[0]}, welcome to the RECUP.STN team. Sign in at terminal.theoperatorplaybook.com with your team code: ${issued.code}\nYou'll find the Team Guide and your studio list there. Questions, message me anytime.`
    : '';

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-4 md:p-8 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1">
        <header className="border-b border-[#222] pb-5 mb-6 flex justify-between items-center flex-wrap gap-3">
          <div>
            <div className="text-[10px] text-[#a855f7] tracking-[4px] uppercase">ARCHITECT — SYS.OP · RECUP.STN</div>
            <h1 className="text-2xl font-bold mt-1">Team</h1>
            <p className="text-xs text-[#888] font-sans mt-1">Your partners’ studios, apart from your own Outreach list. One studio, one owner.</p>
          </div>
          <nav className="flex gap-2 text-xs">
            <Link href="/ops/outreach" className="border border-[#333] px-3 py-2 text-[#888] hover:text-white">MY OUTREACH</Link>
            <Link href="/terminal" className="border border-[#333] px-3 py-2 text-[#888] hover:text-white">TERMINAL</Link>
          </nav>
        </header>

        {error && <div className="border border-[#ff5c72]/60 bg-[#ff5c72]/10 p-4 mb-6 text-sm font-sans">{error}</div>}

        {/* Partners */}
        <section className="mb-8">
          <h2 className="text-sm text-[#888] tracking-widest mb-3">PARTNERS · {partners.length}</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {partners.map((p) => {
              const mine = targets.filter((t) => t.partner_id === p.id);
              const dueCount = mine.filter((t) => needsTouch(t)).length;
              return (
                <div key={p.id} className={`border p-3 bg-[#0a0a0a] font-sans ${p.active ? 'border-[#222]' : 'border-[#1a1a1a] opacity-50'}`}>
                  <div className="flex items-center gap-2">
                    <b>{p.full_name}</b>
                    {!p.active && <span className="text-[10px] font-mono text-[#ff5c72]">LOCKED</span>}
                    <span className="ml-auto text-xs text-[#888]">{mine.length} studios · {mine.filter((t) => t.stage_at.replied).length} replied · {mine.filter((t) => t.stage_at.held).length} tastings</span>
                  </div>
                  {dueCount > 0 && <p className="text-xs text-[#ffb454] mt-1">{dueCount} waiting on a touch</p>}
                  <div className="flex gap-2 mt-2 text-[11px] font-mono">
                    <button onClick={() => setFilter(p.id)} className="border border-[#333] px-2 py-1 text-[#888] hover:text-white">SHOW STUDIOS</button>
                    <button onClick={async () => { const b = await post({ action: 'new_code', id: p.id }); if (b.code) setIssued({ name: p.full_name, code: b.code }); }} className="border border-[#333] px-2 py-1 text-[#888] hover:text-white">NEW CODE</button>
                    <button onClick={() => post({ action: 'set_active', id: p.id, active: !p.active })} className="border border-[#333] px-2 py-1 text-[#888] hover:text-[#ff5c72]">{p.active ? 'LOCK' : 'UNLOCK'}</button>
                  </div>
                </div>
              );
            })}
          </div>

          <form
            className="border border-dashed border-[#333] p-3 mt-3 flex flex-wrap gap-2 font-sans"
            onSubmit={async (e) => {
              e.preventDefault();
              const b = await post({ action: 'add_partner', ...newPartner });
              if (b.code) {
                setIssued({ name: newPartner.full_name, code: b.code });
                setNewPartner({ full_name: '', phone: '' });
              }
            }}
          >
            <input id="pName" className="flex-1 min-w-[160px] bg-[#0a0a0a] border border-[#222] px-3 py-2 text-sm" placeholder="Partner’s full name" value={newPartner.full_name} onChange={(e) => setNewPartner({ ...newPartner, full_name: e.target.value })} required />
            <input id="pPhone" className="flex-1 min-w-[160px] bg-[#0a0a0a] border border-[#222] px-3 py-2 text-sm" placeholder="WhatsApp number" value={newPartner.phone} onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })} />
            <button className="border border-[#a855f7] text-[#a855f7] px-4 py-2 text-xs font-mono">+ ADD PARTNER</button>
          </form>

          {issued && (
            <div className="border border-[#33e6a0]/60 bg-[#33e6a0]/5 p-4 mt-3 font-sans text-sm space-y-2">
              <p><b>{issued.name}’s code:</b> <span className="font-mono select-all">{issued.code}</span> <span className="text-xs text-[#888]">Shown once. Any old code has stopped working.</span></p>
              <textarea readOnly rows={4} onFocus={(e) => e.currentTarget.select()} className="w-full bg-[#0a0a0a] border border-[#222] px-3 py-2 text-sm" value={message} />
              <button onClick={() => navigator.clipboard?.writeText(message).catch(() => null)} className="border border-[#33e6a0] text-[#33e6a0] px-3 py-1 text-xs font-mono">COPY WELCOME MESSAGE</button>
            </div>
          )}
        </section>

        {/* Studios */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <h2 className="text-sm text-[#888] tracking-widest">STUDIOS · {shown.length}</h2>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="ml-auto bg-[#0a0a0a] border border-[#222] px-2 py-1 text-xs">
              <option value="all">All partners</option>
              {partners.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm font-sans">
              <thead>
                <tr className="text-left text-[10px] font-mono tracking-widest text-[#666] border-b border-[#222]">
                  <th className="py-2 pr-2">PARTNER</th><th className="pr-2">STUDIO</th><th className="pr-2">STEP</th><th className="pr-2">LAST TOUCH</th><th className="pr-2">NEXT</th><th>NOTES</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((t) => {
                  const due = needsTouch(t);
                  const d = daysSince(t);
                  return (
                    <tr key={t.id} className="border-b border-[#1a1a1a] align-top">
                      <td className="py-2 pr-2 text-[#ccc]">{nameOf(t.partner_id).split(' ')[0]}</td>
                      <td className="pr-2">
                        <b>{t.studio}</b>
                        {t.clash && <span className="ml-2 text-[10px] font-mono text-[#ff5c72]">CLASH: ALSO ON YOUR LIST</span>}
                        <div className="text-[11px] text-[#666]">{t.area}</div>
                      </td>
                      <td className="pr-2">{TEAM_STAGE_LABEL[t.stage]}</td>
                      <td className={`pr-2 tabular-nums ${due ? 'text-[#ffb454]' : 'text-[#888]'}`}>{d === 0 ? 'today' : `${d}d ago`}{due ? ' · due' : ''}</td>
                      <td className="pr-2 text-[#888]">{t.next_step}{t.next_date ? ` · ${t.next_date}` : ''}</td>
                      <td className="text-[#888]">{t.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!shown.length && <p className="text-xs text-[#555] font-sans mt-3">No studios yet. Partners add them from their own page.</p>}
          </div>
        </section>
      </div>

      {/* ISOLATED ENTERPRISE FOOTER */}
      <div className="w-full max-w-5xl mx-auto pt-12 mt-auto">
        <footer className="w-full border-t border-[#222] pt-8 pb-4 text-center">
          <p className="text-[10px] text-[#4CAF50] tracking-[0.2em] uppercase mb-2">Cleared For Human Performance</p>
          <p className="text-[10px] text-[#555] tracking-[0.2em] uppercase">&copy; 2026 The M.O.E. Group. All Rights Reserved.</p>
        </footer>
      </div>
    </main>
  );
}
