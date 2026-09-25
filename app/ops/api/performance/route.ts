import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { OPS_COOKIE_NAME, isValidOpsSessionToken } from '@/lib/opsSession';

// Supabase caps a single response at 1000 rows by default; page through so this
// never silently truncates once session volume grows.
const PAGE_SIZE = 1000;

type ProgrammingLogRow = {
  instructor_id: string | null;
  instructor_name: string;
  biomechanical_score: number | null;
  created_at: string;
};

type FeedbackRow = {
  instructor_id: string | null;
  mentor_name: string;
  category: string;
  validate_text: string;
  align_text: string;
  elevate_text: string;
  created_at: string;
};

type InstructorRow = { id: string };

async function fetchAllRows<T>(table: string, columns: string): Promise<{ rows: T[]; error: string | null }> {
  const rows: T[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + PAGE_SIZE - 1);

    if (error) return { rows: [], error: error.message };
    if (!data || data.length === 0) break;

    rows.push(...(data as T[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return { rows, error: null };
}

export async function GET() {
  // Defense in depth: proxy.ts already gates /ops/api/*, but a route handler
  // must never assume the proxy ran — verify the session here too.
  const cookieStore = await cookies();
  const token = cookieStore.get(OPS_COOKIE_NAME)?.value;
  if (!isValidOpsSessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only score instructors currently active on the roster — a departed or
  // admin-role account shouldn't surface stale numbers in this snapshot.
  const { data: activeInstructors, error: instructorsError } = await supabase
    .from('instructors')
    .select('id')
    .eq('status', 'active')
    .eq('role', 'instructor');

  if (instructorsError) {
    return NextResponse.json({ error: instructorsError.message }, { status: 502 });
  }

  const activeIds = new Set((activeInstructors as InstructorRow[] | null ?? []).map((i) => i.id));

  // The studio doesn't run 1-1 classes yet, so there's no 1-1 performance
  // score to measure against. Group classes are the only real data point:
  // programming_logs (Station 8) is the session log + programming structure
  // (Biomechanical Score), and vae_feedback is the mentor review layer on
  // top of it — together they're the closest thing to a quality baseline.
  const [logsResult, feedbackResult] = await Promise.all([
    fetchAllRows<ProgrammingLogRow>('programming_logs', 'instructor_id, instructor_name, biomechanical_score, created_at'),
    fetchAllRows<FeedbackRow>(
      'vae_feedback',
      'instructor_id, mentor_name, category, validate_text, align_text, elevate_text, created_at'
    ),
  ]);

  if (logsResult.error) {
    return NextResponse.json({ error: logsResult.error }, { status: 502 });
  }
  if (feedbackResult.error) {
    return NextResponse.json({ error: feedbackResult.error }, { status: 502 });
  }

  const byInstructor = new Map<string, {
    instructor_name: string;
    logTimes: string[];
    scoreTotal: number;
    scoreCount: number;
    latestAudit: FeedbackRow | null;
  }>();

  for (const log of logsResult.rows) {
    if (!log.instructor_id || !activeIds.has(log.instructor_id)) continue;
    const entry = byInstructor.get(log.instructor_id) ?? {
      instructor_name: log.instructor_name,
      logTimes: [],
      scoreTotal: 0,
      scoreCount: 0,
      latestAudit: null,
    };
    entry.logTimes.push(log.created_at);
    if (log.biomechanical_score != null) {
      entry.scoreTotal += log.biomechanical_score;
      entry.scoreCount += 1;
    }
    byInstructor.set(log.instructor_id, entry);
  }

  for (const fb of feedbackResult.rows) {
    if (!fb.instructor_id) continue;
    const entry = byInstructor.get(fb.instructor_id);
    if (entry && (!entry.latestAudit || fb.created_at > entry.latestAudit.created_at)) {
      entry.latestAudit = fb;
    }
  }

  const instructors = Array.from(byInstructor.entries())
    .map(([instructor_id, v]) => ({
      instructor_id,
      instructor_name: v.instructor_name,
      sessionCount: v.logTimes.length,
      avgBiomechanicalScore: v.scoreCount > 0 ? Math.round((v.scoreTotal / v.scoreCount) * 10) / 10 : null,
      // Audit cadence is measured in classes, not days: how many classes logged
      // since the most recent V.A.E. audit (or all of them, if never audited).
      classesSinceAudit: v.latestAudit
        ? v.logTimes.filter((t) => t > v.latestAudit!.created_at).length
        : v.logTimes.length,
      latestAudit: v.latestAudit
        ? {
            mentor_name: v.latestAudit.mentor_name,
            category: v.latestAudit.category,
            validate_text: v.latestAudit.validate_text,
            align_text: v.latestAudit.align_text,
            elevate_text: v.latestAudit.elevate_text,
            created_at: v.latestAudit.created_at,
          }
        : null,
    }))
    .sort((a, b) => b.sessionCount - a.sessionCount);

  return NextResponse.json({ instructors });
}
