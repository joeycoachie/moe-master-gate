'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type InstructorPerf = {
  instructor_id: string;
  instructor_name: string;
  sessionCount: number;
  avgScore: number;
};

// Same sequential green ramp as the Roster Export utilization heatmap, so a
// operator reading both pages learns one visual language, not two. Score is
// 1..10, so magnitude maps the same way: light = low, dark = high.
function scoreFill(score: number): string {
  const ratio = Math.max(0, Math.min(1, (score - 1) / 9));
  const opacity = 0.14 + ratio * 0.66;
  return `rgba(76, 175, 80, ${opacity.toFixed(2)})`;
}

export default function OpsDashboardPage() {
  const router = useRouter();
  const [instructors, setInstructors] = useState<InstructorPerf[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/ops/api/performance');
        if (res.status === 401) {
          router.push('/ops/login');
          return;
        }
        const body = await res.json();
        if (!res.ok) {
          setError(body.error || 'Failed to load performance data.');
          return;
        }
        setInstructors(body.instructors as InstructorPerf[]);
      } catch {
        setError('Connection failed while loading performance data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/ops/api/logout', { method: 'POST' });
    router.push('/ops/login');
  };

  const hasData = !!instructors && instructors.length > 0;

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-8 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1">
        <header className="border-b border-[#222] pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="text-[10px] text-[#a855f7] tracking-[4px] uppercase">GOD MODE TERMINAL — OPS DASHBOARD</div>
            <h1 className="text-3xl font-bold mt-1">Command Center</h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/ops/roster"
              className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white hover:border-[#a855f7] transition-colors"
            >
              ROSTER EXPORT
            </a>
            <button
              onClick={handleLogout}
              className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white transition-colors"
            >
              LOG OUT
            </button>
          </div>
        </header>

        {error && (
          <div className="border border-[#ff4444]/40 bg-[#ff4444]/10 text-[#ff4444] text-xs p-3 mb-6">
            {error}
          </div>
        )}

        {/* PILLAR 1 — PERFORMANCE TELEMETRY (live) */}
        <section className="border border-[#222] bg-[#111] p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <div className="text-[10px] text-[#a855f7] uppercase tracking-widest">Pillar 1 — Quality Baseline</div>
              <h2 className="text-sm font-bold mt-1">Instructor Performance Snapshot</h2>
            </div>
            <div className="text-[9px] text-[#555] uppercase tracking-widest">
              Source: session_logs_1on1.performance_score
            </div>
          </div>

          {loading && <p className="text-xs text-[#555]">Loading performance data…</p>}

          {!loading && !error && !hasData && (
            <p className="text-xs text-[#555]">No logged 1-1 sessions yet — nothing to score.</p>
          )}

          {!loading && hasData && (
            <div className="border border-[#222] overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-[#0a0a0a] text-[#888] text-[10px] uppercase tracking-widest">
                    <th className="px-4 py-3 border-b border-[#222]">Instructor</th>
                    <th className="px-4 py-3 border-b border-[#222]">Sessions Logged</th>
                    <th className="px-4 py-3 border-b border-[#222]">Avg Performance Score</th>
                  </tr>
                </thead>
                <tbody>
                  {instructors!.map((i) => (
                    <tr key={i.instructor_id} className="border-b border-[#1a1a1a] last:border-b-0">
                      <td className="px-4 py-3 text-white">{i.instructor_name}</td>
                      <td className="px-4 py-3 text-[#ccc] tabular-nums">{i.sessionCount}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-24 h-4 border border-[#333]"
                            style={{ background: scoreFill(i.avgScore) }}
                            title={`${i.avgScore.toFixed(1)} / 10`}
                          />
                          <span className="tabular-nums text-white">{i.avgScore.toFixed(1)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-[10px] text-[#555] mt-3">
            Completion rate and retention aren&apos;t tracked yet — no repeat-client data model exists.
            Percentile ranking and 1.5σ baseline-drift alerts need that history before they mean anything;
            this snapshot is the raw ingredient, not the finished metric.
          </p>
        </section>

        {/* PILLAR 2 — MARKET CLEARING & PRICING (locked) */}
        <section className="border border-[#222] bg-[#111] p-4 mb-6 opacity-60">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
            <div>
              <div className="text-[10px] text-[#a855f7] uppercase tracking-widest">Pillar 2 — Liquidity Layer</div>
              <h2 className="text-sm font-bold mt-1">Price Elasticity by Segment</h2>
            </div>
            <span className="text-[10px] text-[#eab308] uppercase tracking-widest border border-[#eab308]/40 px-2 py-1">
              Locked — no pricing data model
            </span>
          </div>
          <p className="text-[10px] text-[#555]">
            Utilization is already live on{' '}
            <a href="/ops/roster" className="text-[#a855f7] hover:underline">Roster Export</a>.
            Elasticity needs a bookings/price table that doesn&apos;t exist yet — nothing here is safe to fake.
          </p>
        </section>

        {/* PILLAR 3 — BEHAVIORAL BIASING (locked) */}
        <section className="border border-[#222] bg-[#111] p-4 opacity-60">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
            <div>
              <div className="text-[10px] text-[#a855f7] uppercase tracking-widest">Pillar 3 — Calibration Knobs</div>
              <h2 className="text-sm font-bold mt-1">Cohort Visibility &amp; Flash Incentives</h2>
            </div>
            <span className="text-[10px] text-[#eab308] uppercase tracking-widest border border-[#eab308]/40 px-2 py-1">
              Locked — no cohort model
            </span>
          </div>
          <p className="text-[10px] text-[#555]">
            No instructor cohort or discovery-weighting concept exists yet. Once Pillar 1 above defines a
            real score, cohorts (e.g. by percentile band) become definable — this panel is next after that,
            not before.
          </p>
        </section>
      </div>

      <div className="w-full max-w-5xl mx-auto pt-12 mt-auto">
        <footer className="w-full border-t border-[#222] pt-8 pb-4 text-center">
          <p className="text-[10px] text-[#4CAF50] tracking-[0.2em] uppercase mb-2">Cleared For Human Performance</p>
          <p className="text-[10px] text-[#555] tracking-[0.2em] uppercase">&copy; 2026 The M.O.E. Group. All Rights Reserved.</p>
        </footer>
      </div>
    </main>
  );
}
