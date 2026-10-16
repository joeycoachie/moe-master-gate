import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import type { Checkin } from '@/lib/recovery';

// Daily check-ins a client taps in their portal (database/12 and 13).
export type { Checkin };

// The studio's calendar day, so a 1am check-in doesn't land on yesterday's UTC date.
export function studioToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }).format(now);
}

// Every check-in, oldest first (the Recovery Window needs the baseline from day 1).
// Returns null when the table isn't set up yet, so the portal and client file keep working.
export async function allCheckins(clientId: string): Promise<Checkin[] | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('client_checkins')
    .select('day, energy, sleep, body, fuel_taken')
    .eq('client_id', clientId)
    .order('day', { ascending: true })
    .limit(400);
  if (error) return null;
  return data as Checkin[];
}

// The area this client tracks (e.g. "Right wrist"). Null until database/13 is run or it's set.
export async function trackingFocus(clientId: string): Promise<string | null> {
  const { data, error } = await getSupabaseAdmin().from('clients').select('tracking_focus').eq('id', clientId).maybeSingle();
  if (error || !data) return null;
  return (data as { tracking_focus: string | null }).tracking_focus || null;
}

// Products this client tapped "I'm interested" on (database/13). Null until the table exists.
export async function clientRequests(clientId: string): Promise<{ item_key: string; created_at: string }[] | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('client_requests')
    .select('item_key, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) return null;
  return data as { item_key: string; created_at: string }[];
}
