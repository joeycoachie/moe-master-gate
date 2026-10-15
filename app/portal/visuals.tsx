'use client';

import { useState } from 'react';

// Visual pieces of the client portal, also reused in the founder's client file.
// Plain SVG, no chart library: the portal must stay fast on a phone.

export type Zone = 'neck' | 'shoulders' | 'upperBack' | 'core' | 'hips' | 'knees';
export type Checkin = { day: string; energy: number | null; sleep: number | null; body: number | null; fuel_taken: boolean };

const CYAN = '#00e5ff';
const VIOLET = '#a78bfa';
const GREEN = '#4CAF50';

const ZONE_LABEL: Record<Zone, string> = {
  neck: 'Neck',
  shoulders: 'Shoulders',
  upperBack: 'Upper back',
  core: 'Core',
  hips: 'Hips',
  knees: 'Knees',
};

// Where each zone sits on the figure (viewBox 0 0 100 210). The back view is the only
// place the upper back shows, so each view lists only the zones it can show.
const ZONE_SHAPES: Record<'front' | 'back', Partial<Record<Zone, { cx: number; cy: number; rx: number; ry: number }[]>>> = {
  front: {
    neck: [{ cx: 50, cy: 31, rx: 6, ry: 4 }],
    shoulders: [
      { cx: 33, cy: 41, rx: 8, ry: 6 },
      { cx: 67, cy: 41, rx: 8, ry: 6 },
    ],
    core: [{ cx: 50, cy: 78, rx: 12, ry: 12 }],
    hips: [{ cx: 50, cy: 102, rx: 17, ry: 8 }],
    knees: [
      { cx: 42, cy: 150, rx: 6, ry: 7 },
      { cx: 58, cy: 150, rx: 6, ry: 7 },
    ],
  },
  back: {
    neck: [{ cx: 50, cy: 31, rx: 6, ry: 4 }],
    shoulders: [
      { cx: 33, cy: 41, rx: 8, ry: 6 },
      { cx: 67, cy: 41, rx: 8, ry: 6 },
    ],
    upperBack: [{ cx: 50, cy: 55, rx: 15, ry: 11 }],
    hips: [{ cx: 50, cy: 102, rx: 17, ry: 8 }],
    knees: [
      { cx: 42, cy: 150, rx: 6, ry: 7 },
      { cx: 58, cy: 150, rx: 6, ry: 7 },
    ],
  },
};

function Figure({ view, focus }: { view: 'front' | 'back'; focus: Zone[] }) {
  const shapes = focus.flatMap((z) => ZONE_SHAPES[view][z] ?? []);
  return (
    <svg viewBox="0 0 100 210" className="w-full h-auto" aria-hidden="true">
      <g fill="#141414" stroke="#2a2a2a" strokeWidth="1">
        <circle cx="50" cy="16" r="10" />
        <rect x="45" y="25" width="10" height="8" rx="3" />
        <path d="M30 36 Q50 30 70 36 L68 92 Q50 98 32 92 Z" />
        <path d="M30 37 L20 80 L24 108 L29 107 L27 82 L35 50 Z" />
        <path d="M70 37 L80 80 L76 108 L71 107 L73 82 L65 50 Z" />
        <path d="M33 92 Q50 100 67 92 L66 108 L56 112 L50 108 L44 112 L34 108 Z" />
        <path d="M35 108 L48 110 L47 196 L39 198 Z" />
        <path d="M65 108 L52 110 L53 196 L61 198 Z" />
      </g>
      {view === 'back' && <line x1="50" y1="38" x2="50" y2="92" stroke="#2a2a2a" strokeWidth="1" />}
      {shapes.map((s, i) => (
        <g key={i}>
          <ellipse cx={s.cx} cy={s.cy} rx={s.rx + 3} ry={s.ry + 3} fill={CYAN} opacity="0.12">
            <animate attributeName="opacity" values="0.05;0.25;0.05" dur="2.4s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={CYAN} opacity="0.55" />
        </g>
      ))}
    </svg>
  );
}

export function BodyMap({ focus }: { focus: Zone[] }) {
  if (!focus.length) return null;
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 max-w-[220px] mx-auto">
        {(['front', 'back'] as const).map((v) => (
          <div key={v} className="text-center">
            <Figure view={v} focus={focus} />
            <div className="text-[9px] text-[#555] tracking-widest uppercase mt-1">{v}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-1.5 mt-3">
        {focus.map((z) => (
          <span key={z} className="text-[9px] tracking-widest uppercase text-[#00e5ff] border border-[#00e5ff]/40 px-2 py-0.5">
            {ZONE_LABEL[z]}
          </span>
        ))}
      </div>
    </div>
  );
}

// The programme as a path: finished weeks filled, the next week pulsing. Tap a week to read it.
export function Journey({ weeks }: { weeks: { week: number; title: string; done: boolean }[] }) {
  // Up next is the week after the furthest one done (a client may join an arc mid-way).
  const furthest = Math.max(0, ...weeks.filter((w) => w.done).map((w) => w.week));
  const next = weeks.find((w) => w.week > furthest && !w.done)?.week ?? null;
  const [picked, setPicked] = useState<number | null>(null);
  if (!weeks.length) return null;
  const shown = weeks.find((w) => w.week === (picked ?? next ?? weeks[weeks.length - 1].week));
  const doneCount = weeks.filter((w) => w.done).length;

  return (
    <div>
      <div className="flex items-center">
        {weeks.map((w, i) => {
          const isNext = w.week === next;
          const isPicked = shown?.week === w.week;
          return (
            <div key={w.week} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => setPicked(w.week)}
                aria-label={`Week ${w.week}`}
                className={`relative w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[11px] border transition-colors ${
                  w.done
                    ? 'bg-[#00e5ff] border-[#00e5ff] text-black font-bold'
                    : isNext
                      ? 'border-[#00e5ff] text-[#00e5ff]'
                      : 'border-[#333] text-[#555]'
                } ${isPicked ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-[#0a0a0a]' : ''}`}
              >
                {isNext && <span className="absolute inset-0 rounded-full border border-[#00e5ff] animate-ping opacity-40" />}
                {w.week}
              </button>
              {i < weeks.length - 1 && <div className={`h-px flex-1 mx-1 ${w.done ? 'bg-[#00e5ff]' : 'bg-[#333]'}`} />}
            </div>
          );
        })}
      </div>
      {shown && (
        <div className="mt-4 text-xs">
          <span className="text-[#888]">Week {shown.week}</span>
          <span className="text-[#555]"> · {shown.done ? 'done' : shown.week === next ? 'up next' : 'coming'}</span>
          {shown.title && <div className="text-white mt-1">{shown.title}</div>}
        </div>
      )}
      <div className="text-[10px] text-[#666] mt-3">
        {doneCount} of {weeks.length} weeks done
      </div>
    </div>
  );
}

export function Ring({ done, total, size = 56 }: { done: number; total: number; size?: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const pct = total ? done / total : 0;
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label={`${done} of ${total} movements`}>
      <circle cx="28" cy="28" r={r} fill="none" stroke="#222" strokeWidth="5" />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke={CYAN}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`}
        transform="rotate(-90 28 28)"
      />
      <text x="28" y="31" textAnchor="middle" fontSize="11" fill="#fff" fontFamily="monospace">
        {done}/{total}
      </text>
    </svg>
  );
}

const SERIES = [
  { key: 'energy', label: 'Energy', color: CYAN },
  { key: 'sleep', label: 'Sleep', color: VIOLET },
  { key: 'body', label: 'Body', color: GREEN },
] as const;

function lastDays(today: string, n: number): string[] {
  const out: string[] = [];
  const d = new Date(`${today}T00:00:00Z`);
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setUTCDate(d.getUTCDate() - i);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}

export function streak(checkins: Checkin[], today: string): number {
  const days = new Set(checkins.map((c) => c.day));
  const all = lastDays(today, 60).reverse();
  // Today not done yet doesn't break the streak; it starts counting from yesterday.
  let i = days.has(today) ? 0 : 1;
  let n = 0;
  while (i < all.length && days.has(all[i])) {
    n++;
    i++;
  }
  return n;
}

// 14 days of check-ins: three lines on a 1-5 scale and a fuel dot per day.
export function TrendChart({ checkins, today, days = 14 }: { checkins: Checkin[]; today: string; days?: number }) {
  const cols = lastDays(today, days);
  const byDay = new Map(checkins.map((c) => [c.day, c]));
  const W = 280;
  const H = 110;
  const pad = { l: 14, r: 6, t: 8, b: 30 };
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / (cols.length - 1);
  const y = (v: number) => pad.t + ((5 - v) * (H - pad.t - pad.b)) / 4;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Your last 14 days">
        {[1, 3, 5].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#1c1c1c" strokeWidth="1" />
            <text x="2" y={y(v) + 3} fontSize="7" fill="#555" fontFamily="monospace">
              {v}
            </text>
          </g>
        ))}
        {SERIES.map((s) => {
          const pts = cols.map((d, i) => ({ i, v: byDay.get(d)?.[s.key] ?? null }));
          // Break the line on missed days instead of drawing through them.
          const segments: string[] = [];
          let current = '';
          for (const p of pts) {
            if (p.v == null) {
              if (current) segments.push(current);
              current = '';
            } else current += `${current ? 'L' : 'M'}${x(p.i)},${y(p.v)} `;
          }
          if (current) segments.push(current);
          return (
            <g key={s.key}>
              {segments.map((d, k) => (
                <path key={k} d={d} fill="none" stroke={s.color} strokeWidth="1.6" strokeLinejoin="round" />
              ))}
              {pts.map((p) =>
                p.v == null ? null : <circle key={p.i} cx={x(p.i)} cy={y(p.v)} r="2" fill={s.color} />,
              )}
            </g>
          );
        })}
        {cols.map((d, i) => {
          const c = byDay.get(d);
          return (
            <g key={d}>
              <circle
                cx={x(i)}
                cy={H - 18}
                r="3"
                fill={c?.fuel_taken ? GREEN : 'none'}
                stroke={c?.fuel_taken ? GREEN : '#333'}
                strokeWidth="1"
              />
              {(i === 0 || i === cols.length - 1 || i % 7 === 0) && (
                <text
                  x={x(i)}
                  y={H - 4}
                  fontSize="7"
                  fill="#555"
                  textAnchor={i === 0 ? 'start' : i === cols.length - 1 ? 'end' : 'middle'}
                  fontFamily="monospace"
                >
                  {i === cols.length - 1 ? 'Today' : new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-4 mt-2 text-[10px] text-[#888]">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 inline-block" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: GREEN }} />
          Fuel taken
        </span>
      </div>
    </div>
  );
}

// A check result reads as a badge: green when it passed or cleared, amber otherwise.
export function resultTone(result: string) {
  return /^(passed|cleared|pass\b)/i.test(result.trim())
    ? 'text-[#4CAF50] border-[#4CAF50]/40'
    : 'text-[#f59e0b] border-[#f59e0b]/40';
}
