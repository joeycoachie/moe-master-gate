import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// Daily check-ins a client taps in their portal (database/12_client_checkins_schema.sql).
export type Checkin = { day: string; energy: number | null; sleep: number | null; body: number | null; fuel_taken: boolean };

export const CHECKIN_DAYS = 14;

// The studio's calendar day, so a 1am check-in doesn't land on yesterday's UTC date.
export function studioToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }).format(now);
}

export function daysBack(today: string, n: number): string {
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

// Last CHECKIN_DAYS days, oldest first. Returns null when the table isn't set up yet, so the
// portal and the client file keep working before the SQL is run.
export async function recentCheckins(clientId: string): Promise<Checkin[] | null> {
  const today = studioToday();
  const { data, error } = await getSupabaseAdmin()
    .from('client_checkins')
    .select('day, energy, sleep, body, fuel_taken')
    .eq('client_id', clientId)
    .gte('day', daysBack(today, CHECKIN_DAYS - 1))
    .order('day', { ascending: true });
  if (error) return null;
  return data as Checkin[];
}
