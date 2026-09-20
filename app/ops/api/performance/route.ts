import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { OPS_COOKIE_NAME, isValidOpsSessionToken } from '@/lib/opsSession';

// Supabase caps a single response at 1000 rows by default; page through so this
// never silently truncates once session volume grows.
const PAGE_SIZE = 1000;

type SessionRow = {
  instructor_id: string | null;
  instructor_name: string;
  performance_score: number;
};

type InstructorRow = { id: string };

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

  const sessions: SessionRow[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('session_logs_1on1')
      .select('instructor_id, instructor_name, performance_score')
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    if (!data || data.length === 0) break;

    sessions.push(...(data as SessionRow[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  const byInstructor = new Map<string, { instructor_name: string; total: number; count: number }>();
  for (const s of sessions) {
    if (!s.instructor_id || !activeIds.has(s.instructor_id)) continue;
    const entry = byInstructor.get(s.instructor_id) ?? { instructor_name: s.instructor_name, total: 0, count: 0 };
    entry.total += s.performance_score;
    entry.count += 1;
    byInstructor.set(s.instructor_id, entry);
  }

  const instructors = Array.from(byInstructor.entries())
    .map(([instructor_id, v]) => ({
      instructor_id,
      instructor_name: v.instructor_name,
      sessionCount: v.count,
      avgScore: Math.round((v.total / v.count) * 10) / 10,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  return NextResponse.json({ instructors });
}
