import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { ARC_REQUEST_PREFIX, CUSTOM_REQUEST_PREFIX, currentClientId, requestLabel } from '@/lib/clientPortal';
import { CLIENT_ARCS } from '@/lib/armory';
import { FUEL_QA } from '@/lib/fuelQa';
import { notifyFounder } from '@/lib/notify';
import fuelCatalog from '@/lib/fuelCatalog.json';

// The signed-in client taps "I'm interested" on a pairing. Only keys that some approved
// pairing offers are accepted, so the table only ever holds real products.
const PAIRABLE = new Set(Object.values(FUEL_QA).flatMap((f) => f.pairs.map((p) => p.key)));
// Programme requests: "arc:KIN-P019". Any programme on the menu (not load days).
const PROGRAMMES = new Set(Object.entries(CLIENT_ARCS).filter(([, a]) => !a.companion).map(([k]) => ARC_REQUEST_PREFIX + k));

export async function POST(request: Request) {
  const clientId = await currentClientId();
  if (!clientId) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  let body: { key?: unknown; detail?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  // "Something else in mind?": the client's own words, stored for the coach (database/23).
  if (body.key === 'custom') {
    const detail = typeof body.detail === 'string' ? body.detail.trim().slice(0, 1000) : '';
    if (detail.length < 3) return NextResponse.json({ error: 'Write a few words first.' }, { status: 400 });
    try {
      const db = getSupabaseAdmin();
      const { error } = await db.from('client_requests').insert({ client_id: clientId, item_key: CUSTOM_REQUEST_PREFIX + new Date().toISOString(), detail });
      if (error) throw new Error(error.message);
      const { data: who } = await db.from('clients').select('full_name').eq('id', clientId).maybeSingle();
      // The ping never carries their words: health detail stays inside the Terminal.
      await notifyFounder(
        `${who?.full_name.split(/\s+/)[0] ?? 'A client'} sent a programme request`,
        'Open their file to read it.',
        `https://terminal.theoperatorplaybook.com/ops/clients/${clientId}`,
      );
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ error: 'Could not send right now. Tell your coach at your next session.' }, { status: 503 });
    }
  }
  if (typeof body.key !== 'string' || !(PAIRABLE.has(body.key) || PROGRAMMES.has(body.key))) return NextResponse.json({ error: 'Unknown product.' }, { status: 400 });
  try {
    const db = getSupabaseAdmin();
    const { error } = await db.from('client_requests').upsert({ client_id: clientId, item_key: body.key }, { onConflict: 'client_id,item_key' });
    if (error) throw new Error(error.message);
    const { data: who } = await db.from('clients').select('full_name').eq('id', clientId).maybeSingle();
    const first = who?.full_name.split(/\s+/)[0] ?? 'A client';
    const isArc = body.key.startsWith(ARC_REQUEST_PREFIX);
    const product = requestLabel(body.key, (fuelCatalog as { products: Record<string, { title: string }> }).products[body.key]?.title.split(' (')[0]);
    await notifyFounder(
      isArc ? `${first} would like a new programme` : `${first} is interested`,
      `${product}. Bring it up at their next session.`,
      `https://terminal.theoperatorplaybook.com/ops/clients/${clientId}`,
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not send right now. Mention it at your next session.' }, { status: 503 });
  }
}
