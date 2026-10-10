'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import MutualAvailability, { ActiveInstructor } from '../roster/MutualAvailability';
import { PlannerRow } from '../roster/trainingPlanner';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Architect-only planning page. Deliberately not linked from anything Ops sees —
// Danny's lane is Roster Export + Dashboard; this is where training gets planned.
export default function OpsArchitectPage() {
  const now = useMemo(() => new Date(), []);

  const [unlocked, setUnlocked] = useState<boolean | null>(null); // null = checking
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [checkingCode, setCheckingCode] = useState(false);

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loadedPeriod, setLoadedPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [rows, setRows] = useState<PlannerRow[] | null>(null);
  const [activeInstructors, setActiveInstructors] = useState<ActiveInstructor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const yearOptions = useMemo(() => {
    const base = now.getFullYear();
    return [base - 1, base, base + 1, base + 2];
  }, [now]);

  const loadPlan = async (m: number, y: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/ops/api/roster?month=${m}&year=${y}`);
      if (res.status === 401) {
        setUnlocked(false);
        return;
      }
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || 'Failed to load availability.');
        return;
      }
      if (body.architect !== true) {
        // Ops session without the Architect unlock — show the gate, not the data.
        setUnlocked(false);
        return;
      }
      setUnlocked(true);
      setRows(body.rows as PlannerRow[]);
      setActiveInstructors((body.activeInstructors as ActiveInstructor[]) ?? []);
      setLoadedPeriod({ month: m, year: y });
    } catch {
      setError('Connection failed while loading availability.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan(month, year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckingCode(true);
    setCodeError('');
    try {
      const res = await fetch('/ops/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: code }),
      });
      if (!res.ok) {
        // 401 is a wrong code; anything else is the server failing, not the Architect.
        setCodeError(res.status === 401 ? 'ACCESS DENIED.' : `SERVER ERROR (${res.status}) — CODE NOT CHECKED.`);
        return;
      }
      setCode('');
      // Sent here from the Armory (or another Architect-only page) — go back there.
      const next = new URLSearchParams(window.location.search).get('next');
      if (next && ['/ops/armory', '/ops/archive', '/ops/command'].some((base) => next === base || next.startsWith(`${base}/`))) {
        window.location.href = next;
        return;
      }
      await loadPlan(month, year);
    } catch {
      setCodeError('CONNECTION FAILED.');
    } finally {
      setCheckingCode(false);
    }
  };

  const handleLock = async () => {
    await fetch('/ops/api/sync', { method: 'DELETE' });
    setUnlocked(false);
    setRows(null);
  };

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-8 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1">
        {unlocked === null ? (
          <p className="text-xs text-[#555]">Checking access…</p>
        ) : !unlocked ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <form onSubmit={handleUnlock} className="w-full max-w-md text-center space-y-8">
              <div className="text-[10px] text-[#555] tracking-[6px] uppercase">[SYNC.OP] — ARCHITECT ACCESS</div>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ENTER ARCHITECT CODE"
                autoComplete="off"
                autoFocus
                disabled={checkingCode}
                className="w-4/5 bg-transparent border-b border-[#333] text-white text-lg py-4 px-2 text-center outline-none tracking-[3px] focus:border-[#a855f7] disabled:opacity-50"
              />
              <div>
                <button
                  type="submit"
                  disabled={checkingCode || !code}
                  className="border border-[#333] px-6 py-2 text-xs text-[#888] hover:text-white hover:border-[#a855f7] transition-colors disabled:opacity-40"
                >
                  {checkingCode ? 'SYNCING…' : 'SYNC'}
                </button>
              </div>
              {codeError && <div className="text-[#ff4444] text-[11px] tracking-[1px]">{codeError}</div>}
            </form>
          </div>
        ) : (
          <>
            <header className="border-b border-[#222] pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
              <div>
                <div className="text-[10px] text-[#a855f7] tracking-[4px] uppercase">ARCHITECT — SYNC.OP</div>
                <h1 className="text-3xl font-bold mt-1">Training Command</h1>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/ops/armory"
                  title="Biomechanical Arcs — every SYS-D022 battle card"
                  className="border border-[#00e5ff]/60 px-4 py-2 text-xs text-[#00e5ff] hover:text-white hover:border-[#00e5ff] transition-colors"
                >
                  ARMORY
                </Link>
                <a
                  href="/terminal/programming-log"
                  title="Station 8 — open the 🔒 Architect View there for every instructor's programming"
                  className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white hover:border-[#a855f7] transition-colors"
                >
                  PROGRAMMING
                </a>
                <a
                  href="/ops/roster"
                  className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white hover:border-[#a855f7] transition-colors"
                >
                  ROSTER
                </a>
                <button
                  onClick={handleLock}
                  title="Lock Architect access"
                  className="border border-[#a855f7] text-[#a855f7] bg-[#a855f7]/10 px-4 py-2 text-xs tracking-widest"
                >
                  [SYNC.OP] ●
                </button>
              </div>
            </header>

            <section className="flex items-end gap-4 flex-wrap mb-6">
              <div>
                <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="bg-[#111] border border-[#333] text-white text-sm py-2 px-3 outline-none focus:border-[#a855f7]"
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option key={name} value={i + 1}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="bg-[#111] border border-[#333] text-white text-sm py-2 px-3 outline-none focus:border-[#a855f7]"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => loadPlan(month, year)}
                disabled={loading}
                className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white hover:border-[#a855f7] transition-colors disabled:opacity-40"
              >
                {loading ? 'LOADING…' : '↻ Load'}
              </button>
            </section>

            {error && (
              <div className="border border-[#ff4444]/40 bg-[#ff4444]/10 text-[#ff4444] text-xs p-3 mb-6">{error}</div>
            )}

            <MutualAvailability
              rows={rows}
              activeInstructors={activeInstructors}
              month={loadedPeriod.month}
              year={loadedPeriod.year}
            />
          </>
        )}
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
