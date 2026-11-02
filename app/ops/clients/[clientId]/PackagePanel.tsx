'use client';

import { useEffect, useState } from 'react';
import type { ClientPackage, PackageSummary } from '@/lib/packageSummary';

const fmt = (d: string | null) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '–');

// The client's session package: what they bought, what's left, when the next payment is due.
// The client sees the same numbers in the corner of their portal.
export default function PackagePanel({ clientId }: { clientId: string }) {
  const [pkg, setPkg] = useState<ClientPackage | null>(null);
  const [sum, setSum] = useState<PackageSummary | null>(null);
  const [form, setForm] = useState({ sessions_total: '10', counts_from: '', price_rm: '', paid_on: '', payment_due: '', note: '' });
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const apply = (body: { package: ClientPackage | null; summary: PackageSummary | null }) => {
    setPkg(body.package);
    setSum(body.summary);
    if (body.package) {
      const p = body.package;
      setForm({ sessions_total: String(p.sessions_total), counts_from: p.counts_from, price_rm: p.price_rm == null ? '' : String(p.price_rm), paid_on: p.paid_on ?? '', payment_due: p.payment_due ?? '', note: p.note });
    }
  };

  useEffect(() => {
    fetch(`/ops/api/clients/${clientId}/package`)
      .then(async (r) => {
        const b = await r.json();
        if (!r.ok) setMsg(b.error || 'Could not load the package.');
        else apply(b);
      })
      .catch(() => setMsg('Connection failed.'));
  }, [clientId]);

  const save = async (payload: Record<string, unknown>) => {
    setBusy(true);
    setMsg('');
    try {
      const r = await fetch(`/ops/api/clients/${clientId}/package`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const b = await r.json();
      if (!r.ok) {
        setMsg(b.error || 'Could not save.');
        return;
      }
      apply(b);
      setEditing(false);
      setMsg('Saved. The client sees it in their portal now.');
    } finally {
      setBusy(false);
    }
  };

  const field = 'w-full bg-[#050505] border border-[#333] text-white text-xs py-2 px-2 outline-none focus:border-[#4CAF50]';
  const label = 'block text-[10px] text-[#888] uppercase tracking-widest mb-1';

  return (
    <section className="border border-[#222] bg-[#0a0a0a] p-5 mb-6 space-y-4">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div className="text-[10px] text-[#4CAF50] tracking-[4px] uppercase">Session package</div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="border border-[#4CAF50] text-[#4CAF50] px-3 py-1.5 text-[10px] tracking-widest hover:bg-[#4CAF50] hover:text-black">
            {pkg ? 'CHANGE' : 'SET A PACKAGE'}
          </button>
        )}
      </div>

      {sum && !editing && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { k: 'Left', v: `${sum.left} of ${sum.total}`, hot: sum.renewSoon },
            { k: 'Used', v: String(sum.used) },
            { k: 'Last session', v: fmt(sum.lastSession) },
            { k: 'Payment due', v: fmt(sum.paymentDue), hot: !!sum.paymentDue && sum.paymentDue <= new Date().toISOString().slice(0, 10) },
          ].map((x) => (
            <div key={x.k} className={`border p-3 ${x.hot ? 'border-[#f59e0b]' : 'border-[#222]'}`}>
              <div className="text-[9px] text-[#888] uppercase tracking-widest">{x.k}</div>
              <div className={`text-sm mt-1 ${x.hot ? 'text-[#f59e0b]' : 'text-white'}`}>{x.v}</div>
            </div>
          ))}
        </div>
      )}
      {sum && !editing && (
        <p className="text-[11px] text-[#666]">
          Counting sessions from {fmt(sum.countsFrom)}
          {pkg?.price_rm != null ? ` · RM ${pkg.price_rm}` : ''}
          {sum.paidOn ? ` · paid ${fmt(sum.paidOn)}` : ''}
          {pkg?.note ? ` · ${pkg.note}` : ''}
        </p>
      )}
      {!pkg && !editing && !msg && <p className="text-[11px] text-[#555]">No package set. The portal hides the package corner until you set one.</p>}

      {editing && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div><label className={label}>Sessions bought</label><input type="number" min={1} value={form.sessions_total} onChange={(e) => setForm({ ...form, sessions_total: e.target.value })} className={field} /></div>
            <div><label className={label}>Count from</label><input type="date" value={form.counts_from} onChange={(e) => setForm({ ...form, counts_from: e.target.value })} className={field} /></div>
            <div><label className={label}>Price (RM)</label><input type="number" value={form.price_rm} onChange={(e) => setForm({ ...form, price_rm: e.target.value })} placeholder="optional" className={field} /></div>
            <div><label className={label}>Paid on</label><input type="date" value={form.paid_on} onChange={(e) => setForm({ ...form, paid_on: e.target.value })} className={field} /></div>
            <div><label className={label}>Next payment due</label><input type="date" value={form.payment_due} onChange={(e) => setForm({ ...form, payment_due: e.target.value })} className={field} /></div>
            <div><label className={label}>Note (client sees it)</label><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. 10-session pack" className={field} /></div>
          </div>
          <p className="text-[11px] text-[#666]">Every session logged on or after the &quot;count from&quot; date uses one: arc weeks, load days and extra sessions.</p>
          <div className="flex gap-3 items-center flex-wrap">
            <button onClick={() => save(form)} disabled={busy} className="border border-[#4CAF50] text-[#4CAF50] px-4 py-2 text-[10px] tracking-widest hover:bg-[#4CAF50] hover:text-black disabled:opacity-40">{busy ? 'SAVING…' : 'SAVE PACKAGE'}</button>
            <button onClick={() => setEditing(false)} className="text-[10px] text-[#666] tracking-widest">CANCEL</button>
            {pkg && <button onClick={() => window.confirm('End this package? It stays in history; the portal corner disappears.') && save({ end: true })} className="ml-auto text-[10px] text-[#ef4444] tracking-widest">END PACKAGE</button>}
          </div>
        </div>
      )}
      {msg && <p className="text-[11px] text-[#888]">{msg}</p>}
    </section>
  );
}
