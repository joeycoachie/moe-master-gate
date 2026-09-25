'use client';

import { useMemo } from 'react';

type RosterRow = {
  instructor_name: string;
  available_date: string;
  time_slot: 'AM' | 'PM';
  status: 'available' | 'booked';
};

type SlotStat = { booked: number; total: number };
type DayStats = { AM: SlotStat; PM: SlotStat };

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function emptySlot(): SlotStat {
  return { booked: 0, total: 0 };
}

// Sequential, single-hue ramp on the app's own "Confirmed" green — magnitude is
// carried by opacity alone (light = mostly open, dark = fully booked). A day/slot
// with zero submissions gets no tint at all, so "no data" never reads as "0% booked."
function utilizationFill(stat: SlotStat): string {
  if (stat.total === 0) return 'transparent';
  const ratio = stat.booked / stat.total;
  const opacity = 0.14 + ratio * 0.66;
  return `rgba(76, 175, 80, ${opacity.toFixed(2)})`;
}

export default function UtilizationHeatmap({
  rows,
  month,
  year,
}: {
  rows: RosterRow[] | null;
  month: number;
  year: number;
}) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  const dayStats = useMemo(() => {
    const map = new Map<number, DayStats>();
    for (let d = 1; d <= daysInMonth; d++) {
      map.set(d, { AM: emptySlot(), PM: emptySlot() });
    }
    for (const r of rows || []) {
      const day = Number(r.available_date.split('-')[2]);
      const stats = map.get(day);
      if (!stats) continue;
      const slot = stats[r.time_slot];
      slot.total += 1;
      if (r.status === 'booked') slot.booked += 1;
    }
    return map;
  }, [rows, daysInMonth]);

  const hasAnyData = (rows || []).length > 0;

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="border border-[#222] bg-[#111] p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="text-[10px] text-[#a855f7] uppercase tracking-widest">Capacity Read-Out</div>
          <h2 className="text-sm font-bold mt-1">Utilization Heatmap — Submitted vs. Confirmed</h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#aaa] uppercase tracking-widest">
          <span>Open</span>
          <span className="inline-block w-4 h-4 border border-[#333]" style={{ background: utilizationFill({ booked: 0, total: 1 }) }} />
          <span className="inline-block w-4 h-4 border border-[#333]" style={{ background: utilizationFill({ booked: 1, total: 2 }) }} />
          <span className="inline-block w-4 h-4 border border-[#333]" style={{ background: utilizationFill({ booked: 1, total: 1 }) }} />
          <span>Fully Booked</span>
        </div>
      </div>

      {!hasAnyData ? (
        <p className="text-xs text-[#555]">No submitted shifts yet this month — nothing to map.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-1 min-w-[560px]">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="text-[10px] text-[#888] uppercase tracking-widest text-center pb-1">
                {label}
              </div>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <div key={`pad-${i}`} />;
              const stats = dayStats.get(day)!;
              return (
                <div key={day} className="border border-[#222]">
                  <div className="text-[11px] text-[#999] px-1 pt-1">{day}</div>
                  <div className="flex flex-col gap-0.5 p-1 pt-0.5">
                    {(['AM', 'PM'] as const).map((slot) => {
                      const stat = stats[slot];
                      return (
                        <div
                          key={slot}
                          title={
                            stat.total === 0
                              ? `${slot} ${month}/${day} — no submissions`
                              : `${slot} ${month}/${day} — ${stat.booked}/${stat.total} confirmed`
                          }
                          className="flex items-center justify-between px-1.5 py-1 text-[11px] leading-tight"
                          style={{ background: utilizationFill(stat) }}
                        >
                          <span className="text-white/60">{slot}</span>
                          <span className="text-white font-semibold tabular-nums">
                            {stat.total ? `${stat.booked}/${stat.total}` : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[10px] text-[#555] mt-3">
        Each cell is confirmed ÷ submitted shifts for that day/slot — the exact rows in the table below, just read as capacity instead of a list.
      </p>
    </div>
  );
}
