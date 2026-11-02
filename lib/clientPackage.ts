import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import type { ClientPackage } from '@/lib/packageSummary';

// The client's active package (database/22). Null when none is set or the table isn't there yet.
export async function activePackage(clientId: string): Promise<ClientPackage | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('client_packages')
    .select('sessions_total, counts_from, price_rm, paid_on, payment_due, note, updated_at')
    .eq('client_id', clientId)
    .eq('active', true)
    .maybeSingle();
  if (error || !data) return null;
  return data as ClientPackage;
}

// Every session date logged for this client (arc and extra), for counting package use.
export async function clientSessionDates(clientId: string): Promise<string[]> {
  const { data } = await getSupabaseAdmin().from('arc_session_entries').select('arc_sessions(session_date)').eq('client_id', clientId);
  return (data ?? []).flatMap((e) => {
    const s = e.arc_sessions as unknown as { session_date: string } | null;
    return s ? [s.session_date] : [];
  });
}
