'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type TimeSlot = 'AM' | 'PM';
type SlotStatus = 'available' | 'pending_ops_approval' | 'booked' | 'rejected';

type AvailabilityRow = {
  id: string;
  instructor_id: string;
  instructor_name: string;
  schedule_cycle: string;
  available_date: string;
  time_slot: TimeSlot;
  status: SlotStatus;
  submitted_at: string;
};

type ActiveInstructor = { id: string; full_name: string };

function getTargetCycle() {
  const now = new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth() + 1 > 11 ? 0 : now.getMonth() + 1;
  const targetYear = now.getMonth() + 1 > 11 ? year + 1 : year;
  const label = new Date(targetYear, monthIndex, 1)
    .toLocaleString('default', { month: 'long', year: 'numeric' })
    .toUpperCase();
  const cycleKey = `${targetYear}-${String(monthIndex + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(targetYear, monthIndex + 1, 0).getDate();
  return { cycleKey, label, year: targetYear, monthIndex, daysInMonth };
}

const STATUS_STYLE: Record<SlotStatus, string> = {
  available: 'border-[#4CAF50] text-[#4CAF50] bg-[#4CAF50]/10',
  pending_ops_approval: 'border-[#eab308] text-[#eab308] bg-[#eab308]/10',
  booked: 'border-[#06b6d4] text-[#06b6d4] bg-[#06b6d4]/10',
  rejected: 'border-[#ff4444] text-[#ff4444] bg-[#ff4444]/10',
};

const STATUS_LABEL: Record<SlotStatus, string> = {
  available: 'AVAILABLE',
  pending_ops_approval: 'PENDING',
  booked: '🔒 BOOKED',
  rejected: 'REJECTED',
};

export default function AvailabilityPage() {
  const [instructorId, setInstructorId] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [role, setRole] = useState<'instructor' | 'admin' | null>(null);

  const [allRows, setAllRows] = useState<AvailabilityRow[]>([]);
  const [activeInstructors, setActiveInstructors] = useState<ActiveInstructor[]>([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [selected, setSelected] = useState<AvailabilityRow | null>(null);

  const { cycleKey, label, year, monthIndex, daysInMonth } = useMemo(() => getTargetCycle(), []);
  const isPastDeadline = new Date().getDate() > 25;

  useEffect(() => {
    setInstructorId(localStorage.getItem('moe_active_user') || '');
    setInstructorName(localStorage.getItem('moe_active_name') || 'Operator');
  }, []);

  useEffect(() => {
    if (!instructorId) return;
    supabase
      .from('instructors')
      .select('role')
      .eq('id', instructorId)
      .single()
      .then(({ data }) => setRole((data?.role as 'instructor' | 'admin') || 'instructor'));
  }, [instructorId]);

  const loadRows = () => {
    supabase
      .from('instructor_availability')
      .select('*')
      .eq('schedule_cycle', cycleKey)
      .then(({ data }) => data && setAllRows(data as AvailabilityRow[]));
  };

  useEffect(() => {
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleKey]);

  useEffect(() => {
    if (role !== 'admin') return;
    supabase
      .from('instructors')
      .select('id, full_name')
      .eq('status', 'active')
      .eq('role', 'instructor')
      .then(({ data }) => data && setActiveInstructors(data as ActiveInstructor[]));
  }, [role]);

  const myRows = useMemo(
    () => allRows.filter((r) => r.instructor_id === instructorId),
    [allRows, instructorId]
  );

  const submittedInstructorIds = useMemo(
    () => new Set(allRows.map((r) => r.instructor_id)),
    [allRows]
  );
  const missingInstructors = useMemo(
    () => activeInstructors.filter((i) => !submittedInstructorIds.has(i.id)),
    [activeInstructors, submittedInstructorIds]
  );

  const dateKey = (day: number) => `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const rowFor = (rows: AvailabilityRow[], day: number, slot: TimeSlot) =>
    rows.find((r) => r.available_date === dateKey(day) && r.time_slot === slot);

  const toggleMySlot = async (day: number, slot: TimeSlot) => {
    if (!instructorId) return;
    const existing = rowFor(myRows, day, slot);
    setStatusMsg('');

    if (existing) {
      if (existing.status === 'booked') return; // locked — instructor cannot mutate
      const { error } = await supabase.from('instructor_availability').delete().eq('id', existing.id);
      if (error) return setStatusMsg('WRITE FAILED: ' + error.message);
      setAllRows((prev) => prev.filter((r) => r.id !== existing.id));
      return;
    }

    const status: SlotStatus = isPastDeadline ? 'pending_ops_approval' : 'available';
    const { data, error } = await supabase
      .from('instructor_availability')
      .insert([
        {
          instructor_id: instructorId,
          instructor_name: instructorName,
          schedule_cycle: cycleKey,
          available_date: dateKey(day),
          time_slot: slot,
          status,
        },
      ])
      .select()
      .single();

    if (error) return setStatusMsg('WRITE FAILED: ' + error.message);
    setAllRows((prev) => [...prev, data as AvailabilityRow]);
  };

  const applyAdminAction = async (row: AvailabilityRow, next: SlotStatus | 'delete') => {
    if (next === 'delete') {
      const { error } = await supabase.from('instructor_availability').delete().eq('id', row.id);
      if (error) return setStatusMsg('WRITE FAILED: ' + error.message);
      setAllRows((prev) => prev.filter((r) => r.id !== row.id));
      setSelected(null);
      return;
    }
    const { error } = await supabase.from('instructor_availability').update({ status: next }).eq('id', row.id);
    if (error) return setStatusMsg('WRITE FAILED: ' + error.message);
    setAllRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: next } : r)));
    setSelected((prev) => (prev && prev.id === row.id ? { ...prev, status: next } : prev));
  };

  const downloadCsv = () => {
    const header = 'Instructor,Date,Slot,Status\n';
    const body = allRows
      .map((r) => `${r.instructor_name},${r.available_date},${r.time_slot},${r.status}`)
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roster_${cycleKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-8 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1">
        <header className="border-b border-[#222] pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="text-[10px] text-[#4CAF50] tracking-[4px] uppercase">STATION 10 — ROSTER GOVERNANCE</div>
            <h1 className="text-3xl font-bold mt-1">Instructor Availability</h1>
          </div>
          <a href="/terminal" className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white transition-colors">
            BACK
          </a>
        </header>

        {statusMsg && <p className="text-xs text-[#ff4444] mb-4">{statusMsg}</p>}

        {/* Instructor submission grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h2 className="text-sm text-[#888] uppercase tracking-widest border-l-2 border-[#4CAF50] pl-3">
              Submitting availability for: {label}
            </h2>
            <span className="text-[10px] text-[#888]">{myRows.length} slot(s) submitted</span>
          </div>

          {isPastDeadline && (
            <div className="border border-[#eab308]/40 bg-[#eab308]/10 text-[#eab308] text-xs p-3 mb-4">
              Window closed (submit-by-25th passed). New toggles are submitted for Ops approval instead of going live
              immediately.
            </div>
          )}

          <div className="border border-[#222] max-h-[420px] overflow-y-auto">
            {days.map((day) => {
              const am = rowFor(myRows, day, 'AM');
              const pm = rowFor(myRows, day, 'PM');
              return (
                <div key={day} className="flex items-center gap-4 p-3 border-b border-[#1a1a1a] last:border-b-0">
                  <span className="text-xs text-[#888] w-24">
                    {new Date(year, monthIndex, day).toLocaleString('default', { weekday: 'short' })} {day}
                  </span>
                  {(['AM', 'PM'] as TimeSlot[]).map((slot) => {
                    const row = slot === 'AM' ? am : pm;
                    const locked = row?.status === 'booked';
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={locked}
                        onClick={() => toggleMySlot(day, slot)}
                        className={`flex-1 text-center py-2 text-[10px] uppercase tracking-widest border transition-colors ${
                          row ? STATUS_STYLE[row.status] : 'border-[#222] text-[#555] hover:text-white hover:border-[#444]'
                        } ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {slot} — {row ? STATUS_LABEL[row.status] : '—'}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>

        {/* Ops Governance dashboard — admin only */}
        {role === 'admin' && (
          <section>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h2 className="text-sm text-[#888] uppercase tracking-widest border-l-2 border-[#06b6d4] pl-3">
                Ops Governance — {label}
              </h2>
              <button
                type="button"
                onClick={downloadCsv}
                className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white transition-colors"
              >
                DOWNLOAD CSV
              </button>
            </div>

            <div className="border border-[#222] p-4 mb-6">
              <p className="text-xs text-[#888] uppercase tracking-widest mb-2">
                Roster Health: Instructors Submitted ({submittedInstructorIds.size}/{activeInstructors.length})
              </p>
              {missingInstructors.length > 0 ? (
                <p className="text-xs text-[#ff4444]">
                  Missing: {missingInstructors.map((i) => i.full_name).join(', ')}
                </p>
              ) : (
                <p className="text-xs text-[#4CAF50]">All active instructors have submitted.</p>
              )}
            </div>

            {selected && (
              <div className="border border-[#eab308] bg-[#eab308]/5 p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
                <p className="text-xs text-[#ccc]">
                  Selected: <span className="text-white">{selected.instructor_name}</span> — {selected.available_date}{' '}
                  {selected.time_slot} — <span className={STATUS_STYLE[selected.status]}>{STATUS_LABEL[selected.status]}</span>
                </p>
                <div className="flex gap-2">
                  {selected.status === 'pending_ops_approval' && (
                    <>
                      <button onClick={() => applyAdminAction(selected, 'available')} className="border border-[#4CAF50] text-[#4CAF50] px-3 py-1 text-[10px] uppercase tracking-widest">
                        Approve
                      </button>
                      <button onClick={() => applyAdminAction(selected, 'rejected')} className="border border-[#ff4444] text-[#ff4444] px-3 py-1 text-[10px] uppercase tracking-widest">
                        Reject
                      </button>
                    </>
                  )}
                  {selected.status === 'available' && (
                    <button onClick={() => applyAdminAction(selected, 'booked')} className="border border-[#06b6d4] text-[#06b6d4] px-3 py-1 text-[10px] uppercase tracking-widest">
                      Lock as Booked
                    </button>
                  )}
                  {selected.status === 'booked' && (
                    <button onClick={() => applyAdminAction(selected, 'available')} className="border border-[#888] text-[#888] px-3 py-1 text-[10px] uppercase tracking-widest">
                      Unlock
                    </button>
                  )}
                  {selected.status === 'rejected' && (
                    <button onClick={() => applyAdminAction(selected, 'available')} className="border border-[#4CAF50] text-[#4CAF50] px-3 py-1 text-[10px] uppercase tracking-widest">
                      Restore
                    </button>
                  )}
                  <button onClick={() => setSelected(null)} className="border border-[#333] text-[#888] px-3 py-1 text-[10px] uppercase tracking-widest">
                    Close
                  </button>
                </div>
              </div>
            )}

            <div className="border border-[#222] max-h-[500px] overflow-y-auto">
              {days.map((day) => {
                const am = allRows.filter((r) => r.available_date === dateKey(day) && r.time_slot === 'AM');
                const pm = allRows.filter((r) => r.available_date === dateKey(day) && r.time_slot === 'PM');
                if (am.length === 0 && pm.length === 0) return null;
                return (
                  <div key={day} className="flex items-start gap-4 p-3 border-b border-[#1a1a1a] last:border-b-0">
                    <span className="text-xs text-[#888] w-24 pt-1">
                      {new Date(year, monthIndex, day).toLocaleString('default', { weekday: 'short' })} {day}
                    </span>
                    {[
                      { slot: 'AM' as TimeSlot, rows: am },
                      { slot: 'PM' as TimeSlot, rows: pm },
                    ].map(({ slot, rows }) => (
                      <div key={slot} className="flex-1">
                        <span className="text-[9px] text-[#555] uppercase tracking-widest">{slot}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rows.map((r) => (
                            <button
                              key={r.id}
                              onClick={() => setSelected(r)}
                              className={`px-2 py-1 text-[10px] border ${STATUS_STYLE[r.status]}`}
                            >
                              {r.instructor_name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
              {allRows.length === 0 && <p className="text-xs text-[#555] p-4">No submissions yet for this cycle.</p>}
            </div>
          </section>
        )}
      </div>

      {/* ISOLATED ENTERPRISE FOOTER */}
      <div className="w-full max-w-6xl mx-auto pt-12 mt-auto">
        <footer className="w-full border-t border-[#222] pt-8 pb-4 text-center">
          <p className="text-[10px] text-[#4CAF50] tracking-[0.2em] uppercase mb-2">Cleared For Human Performance</p>
          <p className="text-[10px] text-[#555] tracking-[0.2em] uppercase">&copy; 2026 The M.O.E. Group. All Rights Reserved.</p>
        </footer>
      </div>
    </main>
  );
}
