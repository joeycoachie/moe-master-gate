// Recovery Window maths, shared by the client portal and the founder's client file.
// Measures are 0-10: body = discomfort in the focus area (lower is better), sleep and energy
// (higher is better). A discomfort drop counts as one people can feel when it is at least
// 2 points and 30% (the usual threshold for the 0-10 pain scale).

export type Checkin = { day: string; energy: number | null; sleep: number | null; body: number | null; fuel_taken: boolean };
export type Measure = 'body' | 'sleep' | 'energy';

export const WINDOW_DAYS = 28;
export const BASELINE_COUNT = 3;
export const UNLOCK_COUNT = 7;

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const vals = (cs: Checkin[], m: Measure) => cs.map((c) => c[m]).filter((v): v is number => v != null);

export function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

// 0-100, higher is better: low discomfort, good sleep, good energy. Our own index, so testimonials
// quote the underlying 0-10 measures, never this number alone.
export function recoveryScore(cs: Checkin[]): number | null {
  const parts = [avg(vals(cs, 'body')), avg(vals(cs, 'sleep')), avg(vals(cs, 'energy'))];
  const [body, sleep, energy] = parts;
  const xs = [body == null ? null : 10 - body, sleep, energy].filter((v): v is number => v != null);
  return xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) : null;
}

export type RecoverySummary = {
  count: number;
  day: number;
  toUnlock: number;
  ready: boolean;
  baselineScore: number | null;
  nowScore: number | null;
  measures: { key: Measure; before: number | null; now: number | null; change: number | null; pct: number | null; feelable: boolean }[];
};

export function summarize(checkins: Checkin[], today: string): RecoverySummary {
  const cs = [...checkins].sort((a, b) => a.day.localeCompare(b.day));
  const count = cs.length;
  const day = count ? Math.min(daysBetween(cs[0].day, today) + 1, 999) : 0;
  const baseline = cs.slice(0, BASELINE_COUNT);
  // "Now" is the last 7 days, never overlapping the baseline check-ins.
  const recent = cs.slice(BASELINE_COUNT).filter((c) => daysBetween(c.day, today) < 7);
  const ready = count >= UNLOCK_COUNT && recent.length >= 3;
  const measures = (['body', 'sleep', 'energy'] as Measure[]).map((key) => {
    const before = avg(vals(baseline, key));
    const now = ready ? avg(vals(recent, key)) : null;
    const change = before != null && now != null ? now - before : null;
    const pct = change != null && before ? (change / before) * 100 : null;
    const feelable = key === 'body' && change != null && pct != null && -change >= 2 && -pct >= 30;
    return { key, before, now, change, pct, feelable };
  });
  return {
    count,
    day,
    toUnlock: Math.max(0, UNLOCK_COUNT - count),
    ready,
    baselineScore: recoveryScore(baseline),
    nowScore: ready ? recoveryScore(recent) : null,
    measures,
  };
}

export const fmt = (n: number | null) => (n == null ? '–' : (Math.round(n * 10) / 10).toString());
