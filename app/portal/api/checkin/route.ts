import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { currentClientId } from '@/lib/clientPortal';
import { recentCheckins, studioToday } from '@/lib/clientCheckins';

const score = (v: unknown) => (typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 5 ? v : null);

// Today's check-in for the signed-in client. The client id comes from the signed cookie;
// a client can only write their own row, and only for today.
export async function POST(request: Request) {
  const clientId = await currentClientId();
  if (!clientId) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  try {
    const db = getSupabaseAdmin();
    const { data: client } = await db.from('clients').select('portal_enabled, status').eq('id', clientId).maybeSingle();
    if (!client || !client.portal_enabled || client.status === 'archived') {
      return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
    }
    const { error } = await db.from('client_checkins').upsert({
      client_id: clientId,
      day: studioToday(),
      energy: score(body.energy),
      sleep: score(body.sleep),
      body: score(body.body),
      fuel_taken: body.fuel_taken === true,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ checkins: await recentCheckins(clientId) });
  } catch {
    return NextResponse.json({ error: 'Check-in could not be saved right now.' }, { status: 503 });
  }
}
