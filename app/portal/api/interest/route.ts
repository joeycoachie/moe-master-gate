import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { currentClientId } from '@/lib/clientPortal';
import { FUEL_QA } from '@/lib/fuelQa';

// The signed-in client taps "I'm interested" on a pairing. Only keys that some approved
// pairing offers are accepted, so the table only ever holds real products.
const PAIRABLE = new Set(Object.values(FUEL_QA).flatMap((f) => f.pairs.map((p) => p.key)));

export async function POST(request: Request) {
  const clientId = await currentClientId();
  if (!clientId) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  let body: { key?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (typeof body.key !== 'string' || !PAIRABLE.has(body.key)) return NextResponse.json({ error: 'Unknown product.' }, { status: 400 });
  try {
    const { error } = await getSupabaseAdmin().from('client_requests').upsert({ client_id: clientId, item_key: body.key }, { onConflict: 'client_id,item_key' });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not send right now. Mention it at your next session.' }, { status: 503 });
  }
}
