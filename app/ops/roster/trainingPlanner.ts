export type Slot = 'AM' | 'PM';
export type PlannerRow = { instructor_id: string; available_date: string; time_slot: Slot };
export type PlannerInstructor = { id: string; full_name: string };

// One concrete biweekly option: a weekday + slot, on two dates 14 days apart.
export type BiweeklyOption = {
  weekday: number;
  slot: Slot;
  days: [number, number];
  coveredIds: string[];
};

export type WeekdaySlotRank = {
  weekday: number;
  slot: Slot;
  freeAnyIds: string[]; // free on at least one occurrence of this weekday/slot
  best: BiweeklyOption | null; // pair of dates with the most instructors free on both
};

export type TrainingPlan = {
  ranking: WeekdaySlotRank[];
  sessions: BiweeklyOption[]; // fewest biweekly sessions that together cover every coverable instructor
  uncoverable: PlannerInstructor[]; // submitted, but free on no two dates 14 days apart
  missing: PlannerInstructor[]; // haven't submitted this month
  cautions: string[];
};

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MAX_EXACT_SESSIONS = 4;
// A submission that stops (or starts) this many days short of the month edge is
// more likely half-filled than a real schedule — worth a human check before
// a date gets locked around it.
const EDGE_GAP_DAYS = 10;

const mondayFirst = (weekday: number) => (weekday + 6) % 7;

function combinations<T>(items: T[], k: number, visit: (combo: T[]) => boolean): boolean {
  const combo: T[] = [];
  const walk = (start: number): boolean => {
    if (combo.length === k) return visit(combo);
    for (let i = start; i < items.length; i++) {
      combo.push(items[i]);
      if (walk(i + 1)) return true;
      combo.pop();
    }
    return false;
  };
  return walk(0);
}

export function planTraining(
  rows: PlannerRow[],
  instructors: PlannerInstructor[],
  year: number,
  month: number
): TrainingPlan {
  const daysInMonth = new Date(year, month, 0).getDate();
  const activeIds = new Set(instructors.map((i) => i.id));

  const free = new Map<string, Set<string>>();
  for (const r of rows) {
    if (!activeIds.has(r.instructor_id)) continue;
    const day = Number(r.available_date.split('-')[2]);
    const set = free.get(r.instructor_id) ?? new Set<string>();
    set.add(`${day}-${r.time_slot}`);
    free.set(r.instructor_id, set);
  }
  const isFree = (id: string, day: number, slot: Slot) => free.get(id)?.has(`${day}-${slot}`) ?? false;
  const submitted = instructors.filter((i) => free.has(i.id));
  const missing = instructors.filter((i) => !free.has(i.id));

  const ranking: WeekdaySlotRank[] = [];
  const allOptions: BiweeklyOption[] = [];

  for (let weekday = 0; weekday < 7; weekday++) {
    const occurrences: number[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      if (new Date(year, month - 1, d).getDay() === weekday) occurrences.push(d);
    }
    for (const slot of ['AM', 'PM'] as Slot[]) {
      const freeAnyIds = submitted.filter((i) => occurrences.some((d) => isFree(i.id, d, slot))).map((i) => i.id);
      if (freeAnyIds.length === 0) continue;

      let best: BiweeklyOption | null = null;
      for (const d of occurrences) {
        if (d + 14 > daysInMonth) continue;
        const coveredIds = submitted.filter((i) => isFree(i.id, d, slot) && isFree(i.id, d + 14, slot)).map((i) => i.id);
        if (coveredIds.length === 0) continue;
        const option: BiweeklyOption = { weekday, slot, days: [d, d + 14], coveredIds };
        allOptions.push(option);
        if (!best || coveredIds.length > best.coveredIds.length) best = option;
      }
      ranking.push({ weekday, slot, freeAnyIds, best });
    }
  }

  ranking.sort(
    (a, b) =>
      (b.best?.coveredIds.length ?? 0) - (a.best?.coveredIds.length ?? 0) ||
      b.freeAnyIds.length - a.freeAnyIds.length ||
      mondayFirst(a.weekday) - mondayFirst(b.weekday) ||
      a.slot.localeCompare(b.slot)
  );

  // Fewest sessions covering everyone who *can* be covered. Candidate count is tiny
  // (≤ 14 weekday/slots × 3 date pairs), so an exact search over small session counts
  // is cheap; greedy only kicks in past that, for an unusually fragmented month.
  const candidates = [...allOptions].sort((a, b) => b.coveredIds.length - a.coveredIds.length);
  const coverable = new Set(candidates.flatMap((o) => o.coveredIds));
  const uncoverable = submitted.filter((i) => !coverable.has(i.id));

  let sessions: BiweeklyOption[] = [];
  if (coverable.size > 0) {
    for (let k = 1; k <= Math.min(MAX_EXACT_SESSIONS, candidates.length) && sessions.length === 0; k++) {
      combinations(candidates, k, (combo) => {
        const covered = new Set(combo.flatMap((o) => o.coveredIds));
        if (covered.size === coverable.size) {
          sessions = [...combo];
          return true;
        }
        return false;
      });
    }
    if (sessions.length === 0) {
      const remaining = new Set(coverable);
      while (remaining.size > 0) {
        const pick = candidates.reduce((best, o) =>
          o.coveredIds.filter((id) => remaining.has(id)).length > best.coveredIds.filter((id) => remaining.has(id)).length
            ? o
            : best
        );
        pick.coveredIds.forEach((id) => remaining.delete(id));
        sessions.push(pick);
      }
    }
  }
  sessions.sort((a, b) => b.coveredIds.length - a.coveredIds.length);

  const monthShort = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'short' });
  const cautions: string[] = [];
  for (const i of submitted) {
    const days = Array.from(free.get(i.id)!).map((k) => Number(k.split('-')[0]));
    const first = Math.min(...days);
    const last = Math.max(...days);
    if (daysInMonth - last >= EDGE_GAP_DAYS) {
      cautions.push(`${i.full_name}'s availability stops after ${monthShort} ${last} — confirm it's complete before locking a date around it.`);
    }
    if (first > EDGE_GAP_DAYS) {
      cautions.push(`${i.full_name}'s availability only starts on ${monthShort} ${first} — confirm the first part of the month isn't just unfilled.`);
    }
  }
  for (const i of uncoverable) {
    cautions.push(`${i.full_name} isn't free on any weekday slot two weeks apart — needs a one-off or 1-1 session instead.`);
  }

  return { ranking, sessions, uncoverable, missing, cautions };
}
