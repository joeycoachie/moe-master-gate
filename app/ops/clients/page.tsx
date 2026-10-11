'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Client = {
  id: string;
  full_name: string;
  format: '1-1' | 'group';
  group_label: string | null;
  current_arc: string | null;
  status: string;
  last_session: { date: string; protocol: string } | null;
};

// Architect-only client list. Health data never touches the public Supabase key:
// everything goes through /ops/api/clients, which checks the SYS.OP cookie.
export default function OpsClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[] | null>(null);
  const [error, setError] = useState('');
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [name, setName] = useState('');
  const [format, setFormat] = useState<'1-1' | 'group'>('1-1');
  const [adding, setAdding] = useState(false);

  const load = () =>
    fetch('/ops/api/clients')
      .then(async (res) => {
        const body = await res.json();
        if (res.status === 401) {
          router.replace('/ops/architect?next=/ops/clients');
          return;
        }
        if (!res.ok) {
          setSetupNeeded(body.setup === true);
          setError(body.error || 'Failed to load clients.');
          return;
        }
        setError('');
        setClients(body.clients as Client[]);
      })
      .catch(() => setError('Connection failed while loading clients.'));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch('/ops/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, format }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || 'Could not add client.');
        return;
      }
      setName('');
      await load();
    } finally {
      setAdding(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-5 md:p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1">
        <header className="border-b border-[#222] pb-5 mb-6 flex justify-between items-center flex-wrap gap-3">
          <div>
            <div className="text-[10px] text-[#a855f7] tracking-[4px] uppercase">ARCHITECT — SYS.OP</div>
            <h1 className="text-2xl font-bold mt-1">Clients</h1>
            <p className="text-[11px] text-[#666] mt-1">Log sessions from inside any arc: Armory → arc → [ CLIENT LOG ]</p>
          </div>
          <nav className="flex gap-2 text-xs">
            <Link href="/ops/armory" className="border border-[#333] px-3 py-2 text-[#888] hover:text-white">ARMORY</Link>
            <Link href="/terminal" className="border border-[#333] px-3 py-2 text-[#888] hover:text-white">TERMINAL</Link>
          </nav>
        </header>

        {error && (
          <div className={`border p-4 mb-6 text-xs ${setupNeeded ? 'border-[#f59e0b]/50 bg-[#f59e0b]/10 text-[#f59e0b]' : 'border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444]'}`}>
            {error}
          </div>
        )}

        {clients === null && !error && <p className="text-xs text-[#555]">Loading…</p>}

        {clients && (
          <div className="grid gap-3 md:grid-cols-2 mb-10">
            {clients.map((c) => (
              <Link
                key={c.id}
                href={`/ops/clients/${c.id}`}
                className={`block border bg-[#0a0a0a] p-5 hover:border-[#00e5ff] transition-colors ${c.status === 'active' ? 'border-[#333]' : 'border-[#1a1a1a] opacity-60'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-[#00e5ff] tracking-widest uppercase">
                    {c.format === '1-1' ? '1-1' : c.group_label || 'Group'}
                  </span>
                  <span className="text-[10px] text-[#555] uppercase">{c.status}</span>
                </div>
                <div className="text-lg font-bold">{c.full_name}</div>
                <div className="text-[11px] text-[#888] mt-2">
                  Arc: {c.current_arc || '—'} · Last session:{' '}
                  {c.last_session ? `${c.last_session.date} (${c.last_session.protocol})` : 'none yet'}
                </div>
              </Link>
            ))}
          </div>
        )}

        {clients && (
          <form onSubmit={addClient} className="border border-[#222] bg-[#0a0a0a] p-5 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2">Add client</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-[#050505] border border-[#333] text-white text-sm py-2 px-3 outline-none focus:border-[#00e5ff]"
              />
            </div>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as '1-1' | 'group')}
              className="bg-[#050505] border border-[#333] text-white text-sm py-2 px-3 outline-none focus:border-[#00e5ff]"
            >
              <option value="1-1">1-1</option>
              <option value="group">Group</option>
            </select>
            <button
              type="submit"
              disabled={adding || !name.trim()}
              className="border border-[#00e5ff] text-[#00e5ff] px-4 py-2 text-xs tracking-widest hover:bg-[#00e5ff] hover:text-black transition-colors disabled:opacity-40"
            >
              {adding ? 'ADDING…' : 'ADD'}
            </button>
          </form>
        )}
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
