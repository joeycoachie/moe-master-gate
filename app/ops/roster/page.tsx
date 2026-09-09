'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type RosterRow = {
  instructor_name: string;
  available_date: string;
  time_slot: 'AM' | 'PM';
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Excel/Sheets treats a leading =, +, -, or @ as the start of a formula.
// Prefixing with a quote defuses it while leaving the visible text unchanged.
const FORMULA_INJECTION_PREFIX = /^[=+\-@]/;

function csvField(raw: string): string {
  const value = FORMULA_INJECTION_PREFIX.test(raw) ? `'${raw}` : raw;
  return `"${value.replace(/"/g, '""')}"`;
}

function toCsv(rows: RosterRow[]): string {
  const header = ['Instructor Name', 'Date', 'Shift'].map(csvField).join(',');
  const body = rows
    .map((r) => [r.instructor_name, r.available_date, r.time_slot].map(csvField).join(','))
    .join('\r\n');
  // UTF-8 BOM so Excel renders accented names correctly instead of mangling them.
  return `﻿${header}\r\n${body}`;
}

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function OpsRosterPage() {
  const router = useRouter();
  const now = useMemo(() => new Date(), []);

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [rows, setRows] = useState<RosterRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Always spans last year through two years out, so this page never goes
  // stale just because nobody thought to add a new year to a hardcoded list.
  const yearOptions = useMemo(() => {
    const base = now.getFullYear();
    return [base - 1, base, base + 1, base + 2];
  }, [now]);

  const loadRoster = async (m: number, y: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/ops/api/roster?month=${m}&year=${y}`);
      if (res.status === 401) {
        router.push('/ops/login');
        return;
      }
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || 'Failed to load roster.');
        setRows(null);
        return;
      }
      setRows(body.rows as RosterRow[]);
    } catch {
      setError('Connection failed while loading roster.');
      setRows(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoster(month, year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;
  const hasRows = !!rows && rows.length > 0;
  const showEmptyState = !loading && rows !== null && rows.length === 0;

  const handleExport = () => {
    if (!rows || rows.length === 0) return; // never produce an empty/broken download
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roster_${MONTH_NAMES[month - 1]}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await fetch('/ops/api/logout', { method: 'POST' });
    router.push('/ops/login');
  };

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-8 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1">
        <header className="border-b border-[#222] pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="text-[10px] text-[#a855f7] tracking-[4px] uppercase">GOD MODE TERMINAL — STATION 10 FEED</div>
            <h1 className="text-3xl font-bold mt-1">Confirmed Roster Export</h1>
          </div>
          <button
            onClick={handleLogout}
            className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white transition-colors"
          >
            LOG OUT
          </button>
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
            onClick={() => loadRoster(month, year)}
            disabled={loading}
            className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white hover:border-[#a855f7] transition-colors disabled:opacity-40"
          >
            {loading ? 'LOADING…' : 'LOAD ROSTER'}
          </button>

          <button
            onClick={handleExport}
            disabled={!hasRows || loading}
            title={!hasRows ? 'No booked shifts to export for this month' : undefined}
            className="border border-[#4CAF50] text-[#4CAF50] px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#4CAF50]/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            Export to CSV
          </button>
        </section>

        {error && (
          <div className="border border-[#ff4444]/40 bg-[#ff4444]/10 text-[#ff4444] text-xs p-3 mb-6">
            {error}
          </div>
        )}

        <p className="text-xs text-[#555] mb-4 uppercase tracking-widest">
          Showing confirmed (booked) shifts for {monthLabel}
        </p>

        <div className="border border-[#222] overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#111] text-[#888] text-[10px] uppercase tracking-widest">
                <th className="px-4 py-3 border-b border-[#222]">Instructor Name</th>
                <th className="px-4 py-3 border-b border-[#222]">Date</th>
                <th className="px-4 py-3 border-b border-[#222]">Shift</th>
              </tr>
            </thead>
            <tbody>
              {rows?.map((r, i) => (
                <tr key={`${r.instructor_name}-${r.available_date}-${r.time_slot}-${i}`} className="border-b border-[#1a1a1a] last:border-b-0">
                  <td className="px-4 py-3 text-white">{r.instructor_name}</td>
                  <td className="px-4 py-3 text-[#ccc]">{formatDisplayDate(r.available_date)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 border ${
                      r.time_slot === 'AM'
                        ? 'border-[#06b6d4] text-[#06b6d4]'
                        : 'border-[#eab308] text-[#eab308]'
                    }`}>
                      {r.time_slot}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && <p className="text-xs text-[#555] p-4">Loading roster…</p>}

          {showEmptyState && (
            <p className="text-xs text-[#555] p-4">
              No booked shifts found for {monthLabel}. Nothing to export.
            </p>
          )}
        </div>
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
