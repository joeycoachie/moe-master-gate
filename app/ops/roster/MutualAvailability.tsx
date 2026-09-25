'use client';

import { useMemo } from 'react';
import { planTraining, PlannerRow, WEEKDAY_NAMES, BiweeklyOption } from './trainingPlanner';

export type ActiveInstructor = { id: string; full_name: string };

export default function MutualAvailability({
  rows,
  activeInstructors,
  month,
  year,
}: {
  rows: PlannerRow[] | null;
  activeInstructors: ActiveInstructor[];
  month: number;
  year: number;
}) {
  const total = activeInstructors.length;
  const plan = useMemo(
    () => (rows ? planTraining(rows, activeInstructors, year, month) : null),
    [rows, activeInstructors, year, month]
  );

  const monthShort = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'short' });
  const names = (ids: string[]) =>
    ids.map((id) => activeInstructors.find((i) => i.id === id)?.full_name ?? 'Unknown').join(', ');
  const slotLabel = (weekday: number, slot: string) => `${WEEKDAY_NAMES[weekday]} ${slot}`;
  const datesLabel = (o: BiweeklyOption) => `${monthShort} ${o.days[0]} & ${monthShort} ${o.days[1]}`;

  const submittedCount = plan ? total - plan.missing.length : 0;
  const allIn = total > 0 && plan !== null && plan.missing.length === 0;

  return (
    <section className="border border-[#222] bg-[#111] p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="text-[10px] text-[#a855f7] uppercase tracking-widest">Biweekly Training Planner</div>
          <h2 className="text-sm font-bold mt-1">Best Weekday Slots — Auto-Ranked Each Month</h2>
        </div>
        <span
          className={`text-[10px] uppercase tracking-widest border px-2 py-1 ${
            allIn ? 'border-[#4CAF50] text-[#4CAF50]' : 'border-[#eab308]/60 text-[#eab308]'
          }`}
        >
          {submittedCount} / {total} submitted
        </span>
      </div>

      {!plan ? (
        <p className="text-xs text-[#555]">Load a month to compute the plan.</p>
      ) : total === 0 ? (
        <p className="text-xs text-[#555]">No active instructors on the roster.</p>
      ) : (
        <div className="space-y-5">
          {(plan.missing.length > 0 || plan.cautions.length > 0) && (
            <div className="border border-[#eab308]/40 bg-[#eab308]/5 p-3 space-y-1">
              <div className="text-[10px] text-[#eab308] uppercase tracking-widest mb-1">Check before locking</div>
              {plan.missing.length > 0 && (
                <p className="text-xs text-[#e5e5e5]">
                  Waiting on {names(plan.missing.map((i) => i.id))} — the plan below will shift once they submit.
                </p>
              )}
              {plan.cautions.map((c) => (
                <p key={c} className="text-xs text-[#e5e5e5]">{c}</p>
              ))}
            </div>
          )}

          <div>
            <div className="text-[10px] text-[#888] uppercase tracking-widest mb-2">
              Recommended — {plan.sessions.length === 0 ? 'no plan yet' : `${plan.sessions.length} biweekly session${plan.sessions.length > 1 ? 's' : ''} cover${plan.sessions.length > 1 ? '' : 's'} everyone`}
            </div>
            {plan.sessions.length === 0 ? (
              <p className="text-xs text-[#555]">Not enough submitted availability to build a biweekly plan.</p>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {plan.sessions.map((s) => (
                  <div
                    key={`${s.weekday}-${s.slot}-${s.days[0]}`}
                    className="border border-[#4CAF50]/50 bg-[#4CAF50]/10 p-3"
                  >
                    <div className="text-sm text-white font-bold">{slotLabel(s.weekday, s.slot)} · biweekly</div>
                    <div className="text-xs text-[#4CAF50] mt-1">{datesLabel(s)}</div>
                    <div className="text-xs text-[#ccc] mt-1">
                      {names(s.coveredIds)}
                      {s.coveredIds.length === total && <span className="text-[#4CAF50]"> — everyone</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-[10px] text-[#888] uppercase tracking-widest mb-2">Weekday slot ranking</div>
            <div className="border border-[#222] overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#0a0a0a] text-[#888] text-[10px] uppercase tracking-widest">
                    <th className="px-3 py-2 border-b border-[#222]">Slot</th>
                    <th className="px-3 py-2 border-b border-[#222]">Biweekly-ready</th>
                    <th className="px-3 py-2 border-b border-[#222]">Best dates</th>
                    <th className="px-3 py-2 border-b border-[#222]">Free at least once</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.ranking.map((r) => (
                    <tr key={`${r.weekday}-${r.slot}`} className="border-b border-[#1a1a1a] last:border-b-0">
                      <td className="px-3 py-2 text-white whitespace-nowrap">{slotLabel(r.weekday, r.slot)}</td>
                      <td className="px-3 py-2">
                        {r.best ? (
                          <>
                            <span className="text-white tabular-nums">{r.best.coveredIds.length}/{total}</span>{' '}
                            <span className="text-[#888]">{names(r.best.coveredIds)}</span>
                          </>
                        ) : (
                          <span className="text-[#555]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-[#ccc] whitespace-nowrap">{r.best ? datesLabel(r.best) : '—'}</td>
                      <td className="px-3 py-2 text-[#888]">
                        <span className="tabular-nums text-[#ccc]">{r.freeAnyIds.length}/{total}</span> {names(r.freeAnyIds)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <p className="text-[10px] text-[#555] mt-4">
        &quot;Biweekly-ready&quot; = free on the same weekday slot two weeks apart. Counts Submitted and Confirmed slots;
        late submissions awaiting Ops approval aren&apos;t counted until approved. Reference only — you set the final
        training time.
      </p>
    </section>
  );
}
