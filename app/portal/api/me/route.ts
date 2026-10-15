import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { buildClientView, currentClientId } from '@/lib/clientPortal';
import { recentCheckins, studioToday } from '@/lib/clientCheckins';

// The signed-in client's own file only. The client id comes from the signed cookie,
// never from the request, so one client can't read another's.
export async function GET() {
  const clientId = await currentClientId();
  if (!clientId) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  try {
    const db = getSupabaseAdmin();
    const { data: client, error } = await db
      .from('clients')
      .select('full_name, current_arc, status, portal_enabled, fuel_unlocked, recup_member_code')
      .eq('id', clientId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!client || !client.portal_enabled || client.status === 'archived') {
      return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
    }
    const { data: entries, error: entryError } = await db
      .from('arc_session_entries')
      .select('stations, audit, arc_sessions(session_date, protocol_id)')
      .eq('client_id', clientId);
    if (entryError) throw new Error(entryError.message);
    const flat = (entries ?? []).flatMap((e) => {
      const s = e.arc_sessions as unknown as { session_date: string; protocol_id: string } | null;
      return s ? [{ stations: e.stations, audit: e.audit, session_date: s.session_date, protocol_id: s.protocol_id }] : [];
    });
    const checkins = await recentCheckins(clientId);
    return NextResponse.json({ ...buildClientView(client, flat), checkins, today: studioToday() }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Your file is unavailable right now.' }, { status: 503 });
  }
}
