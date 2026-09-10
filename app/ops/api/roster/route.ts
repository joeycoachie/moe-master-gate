import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { OPS_COOKIE_NAME, isValidOpsSessionToken } from '@/lib/opsSession';

// Supabase caps a single response at 1000 rows by default; page through in case
// one month/status combination ever exceeds that for a large roster.
const PAGE_SIZE = 1000;
const MIN_YEAR = 2020;
const MAX_YEAR = 2100;

type RosterRow = {
  instructor_name: string;
  available_date: string;
  time_slot: 'AM' | 'PM';
  status: 'available' | 'booked';
};

export async function GET(request: Request) {
  // Defense in depth: proxy.ts already gates /ops/api/*, but a route handler
  // must never assume the proxy ran — verify the session here too.
  const cookieStore = await cookies();
  const token = cookieStore.get(OPS_COOKIE_NAME)?.value;
  if (!isValidOpsSessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = Number(searchParams.get('month'));
  const year = Number(searchParams.get('year'));

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: 'Invalid month.' }, { status: 400 });
  }
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    return NextResponse.json({ error: 'Invalid year.' }, { status: 400 });
  }

  const cycleKey = `${year}-${String(month).padStart(2, '0')}`;
  const rows: RosterRow[] = [];
  let from = 0;

  // Filtering happens in the database query (eq/in/order below) — the frontend
  // never receives more than the one requested month's locked-in shifts.
  // 'available' = instructor confirmed their own submission (Station 10's
  // "Confirm & Lock In"); 'booked' = an Ops admin additionally locked it as a
  // final assignment. Both count as "on the schedule" for this export —
  // 'pending_ops_approval' (not live yet) and 'rejected' are excluded.
  while (true) {
    const { data, error } = await supabase
      .from('instructor_availability')
      .select('instructor_name, available_date, time_slot, status')
      .eq('schedule_cycle', cycleKey)
      .in('status', ['available', 'booked'])
      .order('available_date', { ascending: true })
      .order('time_slot', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    if (!data || data.length === 0) break;

    rows.push(...(data as RosterRow[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return NextResponse.json({ cycleKey, rows });
}
