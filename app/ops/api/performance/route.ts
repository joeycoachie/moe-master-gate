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
};

type FeedbackRow = {
  instructor_id: string | null;
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
    fetchAllRows<ProgrammingLogRow>('programming_logs', 'instructor_id, instructor_name, biomechanical_score'),
    fetchAllRows<FeedbackRow>('vae_feedback', 'instructor_id'),
  ]);

  if (logsResult.error) {
    return NextResponse.json({ error: logsResult.error }, { status: 502 });
  }
  if (feedbackResult.error) {
    return NextResponse.json({ error: feedbackResult.error }, { status: 502 });
  }

  const byInstructor = new Map<string, {
    instructor_name: string;
    sessionCount: number;
    scoreTotal: number;
    scoreCount: number;
    feedbackCount: number;
  }>();

  for (const log of logsResult.rows) {
    if (!log.instructor_id || !activeIds.has(log.instructor_id)) continue;
    const entry = byInstructor.get(log.instructor_id) ?? {
      instructor_name: log.instructor_name,
      sessionCount: 0,
      scoreTotal: 0,
      scoreCount: 0,
      feedbackCount: 0,
    };
    entry.sessionCount += 1;
    if (log.biomechanical_score != null) {
      entry.scoreTotal += log.biomechanical_score;
      entry.scoreCount += 1;
    }
    byInstructor.set(log.instructor_id, entry);
  }

  for (const fb of feedbackResult.rows) {
    if (!fb.instructor_id) continue;
    const entry = byInstructor.get(fb.instructor_id);
    if (entry) entry.feedbackCount += 1;
  }

  const instructors = Array.from(byInstructor.entries())
    .map(([instructor_id, v]) => ({
      instructor_id,
      instructor_name: v.instructor_name,
      sessionCount: v.sessionCount,
      avgBiomechanicalScore: v.scoreCount > 0 ? Math.round((v.scoreTotal / v.scoreCount) * 10) / 10 : null,
      feedbackCount: v.feedbackCount,
    }))
    .sort((a, b) => b.sessionCount - a.sessionCount);

  return NextResponse.json({ instructors });
}
