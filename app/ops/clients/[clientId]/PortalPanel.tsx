'use client';

import { useEffect, useState } from 'react';
import { TrendChart, streak, type Checkin } from '@/app/portal/visuals';

type Portal = { portal_enabled: boolean; portal_code_set_at: string | null; fuel_unlocked: { key: string; dose: string }[]; recup_member_code: string | null };
type CatalogItem = { key: string; title: string; group: string };

// Architect controls for one client's MOE-MASTER-GATE portal (Kinetic menu, Pillar 3):
// access code, which fuel products show in their file (with their personal dose), and the
// link to their RECUP.STN member code.
export default function PortalPanel({ clientId }: { clientId: string }) {
  const [portal, setPortal] = useState<Portal | null>(null);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [fuel, setFuel] = useState<Record<string, string>>({});
  const [recup, setRecup] = useState('');
  const [newCode, setNewCode] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [checkins, setCheckins] = useState<Checkin[] | null>(null);
  const [today, setToday] = useState('');

  const apply = (p: Portal) => {
    setPortal(p);
    setFuel(Object.fromEntries((p.fuel_unlocked ?? []).map((f) => [f.key, f.dose ?? ''])));
    setRecup(p.recup_member_code ?? '');
  };

  useEffect(() => {
    fetch(`/ops/api/clients/${clientId}/portal`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) {
          setError(body.error || 'Could not load portal settings.');
          return;
        }
        apply(body.portal);
        setCatalog(body.catalog);
        setCheckins(body.checkins ?? null);
        setToday(body.today ?? '');
      })
      .catch(() => setError('Connection failed.'));
  }, [clientId]);

  const call = async (method: 'POST' | 'PATCH', payload: unknown) => {
    setBusy(true);
    setNote('');
    try {
      const res = await fetch(`/ops/api/clients/${clientId}/portal`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        setNote(body.error || 'Failed.');
        return null;
      }
      return body;
    } finally {
      setBusy(false);
    }
  };

  const generate = async () => {
    if (portal?.portal_code_set_at && !window.confirm('Issue a new code? The old code stops working immediately.')) return;
    const body = await call('POST', { action: 'generate' });
    if (body?.code) {
      setNewCode(body.code);
      setPortal((p) => (p ? { ...p, portal_enabled: true, portal_code_set_at: new Date().toISOString() } : p));
    }
  };

  const disable = async () => {
    if (!window.confirm('Turn off portal access for this client? Their file stays; the code stops working.')) return;
    const body = await call('POST', { action: 'disable' });
    if (body) {
      setNewCode('');
      setPortal((p) => (p ? { ...p, portal_enabled: false } : p));
    }
  };

  const saveFuel = async () => {
    const body = await call('PATCH', {
      fuel_unlocked: Object.entries(fuel).map(([key, dose]) => ({ key, dose })),
      recup_member_code: recup.trim() || null,
    });
    if (body?.portal) {
      apply(body.portal);
      setNote('Saved.');
    }
  };

  const groups = catalog.reduce<Record<string, CatalogItem[]>>((acc, item) => {
    (acc[item.group || 'Other'] ??= []).push(item);
    return acc;
  }, {});

  if (error) {
    return (
      <section className="border border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#f59e0b] text-xs p-4 mb-10">
        Client portal: {error}
      </section>
    );
  }
  if (!portal) return null;

  const field = 'bg-[#050505] border border-[#333] text-white text-xs py-1.5 px-2 outline-none focus:border-[#00e5ff]';

  return (
    <section className="border border-[#222] bg-[#0a0a0a] p-5 mb-10 space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <div className="text-[10px] text-[#00e5ff] tracking-[4px] uppercase">Client portal · MOE-MASTER-GATE</div>
          <p className="text-[11px] text-[#888] mt-1">
            {portal.portal_enabled
              ? `Access ON · code issued ${portal.portal_code_set_at ? new Date(portal.portal_code_set_at).toLocaleDateString('en-GB') : ''}`
              : 'Access OFF'}
            . The client sees sessions, end-of-session checks and unlocked fuel, never your notes or conditions.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={generate} disabled={busy} className="border border-[#00e5ff] text-[#00e5ff] px-3 py-2 text-[10px] tracking-widest hover:bg-[#00e5ff] hover:text-black disabled:opacity-40">
            {portal.portal_code_set_at ? 'NEW CODE' : 'ISSUE CODE'}
          </button>
          {portal.portal_enabled && (
            <button onClick={disable} disabled={busy} className="border border-[#333] text-[#888] px-3 py-2 text-[10px] tracking-widest hover:text-white disabled:opacity-40">
              TURN OFF
            </button>
          )}
        </div>
      </div>

      {newCode && (
        <div className="border border-[#00e5ff] bg-[#05101a] p-4">
          <div className="text-[10px] text-[#888] uppercase tracking-widest mb-1">Send this code to the client · shown once</div>
          <div className="text-xl tracking-[4px] text-white select-all">{newCode}</div>
          <p className="text-[11px] text-[#888] mt-2">They open terminal.theoperatorplaybook.com and type it into the access box. Only a fingerprint of the code is stored; if it&apos;s lost, issue a new one.</p>
        </div>
      )}

      <div>
        <div className="text-[10px] text-[#888] uppercase tracking-widest mb-2">Fuel unlocked in their file (client-facing text from the Product Academy)</div>
        <div className="space-y-4">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              <div className="text-[9px] text-[#555] uppercase tracking-widest mb-1">{group}</div>
              <div className="space-y-1">
                {items.map((item) => {
                  const on = item.key in fuel;
                  return (
                    <div key={item.key} className="flex items-center gap-2 flex-wrap">
                      <label className="flex items-center gap-2 text-xs text-[#ccc] min-w-[220px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() =>
                            setFuel((f) => {
                              const next = { ...f };
                              if (on) delete next[item.key];
                              else next[item.key] = '';
                              return next;
                            })
                          }
                        />
                        {item.title}
                      </label>
                      {on && (
                        <input
                          value={fuel[item.key]}
                          onChange={(e) => setFuel((f) => ({ ...f, [item.key]: e.target.value }))}
                          placeholder="Their dose, e.g. 2 scoops in 300 ml cold water before bed"
                          className={`${field} flex-1 min-w-[220px]`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] text-[#888] uppercase tracking-widest mb-2">Their daily check-ins (last 14 days)</div>
        {checkins === null ? (
          <p className="text-[11px] text-[#f59e0b]">Check-ins not set up yet: run client_checkins_schema.sql in Supabase.</p>
        ) : checkins.length === 0 ? (
          <p className="text-[11px] text-[#555]">No check-ins yet.</p>
        ) : (
          <div className="max-w-md">
            <TrendChart checkins={checkins} today={today} />
            <p className="text-[10px] text-[#666] mt-2">
              {checkins.length} of 14 days · streak {streak(checkins, today)} · fuel taken {checkins.filter((c) => c.fuel_taken).length} days
            </p>
          </div>
        )}
      </div>

      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-1">RECUP.STN code · only if they are a member</label>
          <input value={recup} onChange={(e) => setRecup(e.target.value)} placeholder="RS-XXXX" className={field} />
        </div>
        <button onClick={saveFuel} disabled={busy} className="border border-[#00e5ff] text-[#00e5ff] px-4 py-2 text-[10px] tracking-widest hover:bg-[#00e5ff] hover:text-black disabled:opacity-40">
          {busy ? 'SAVING…' : 'SAVE FUEL & LINK'}
        </button>
        {note && <span className="text-[11px] text-[#888]">{note}</span>}
      </div>
    </section>
  );
}
