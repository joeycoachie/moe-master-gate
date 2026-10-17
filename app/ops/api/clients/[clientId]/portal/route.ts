import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { adminError, isArchitect, unauthorized } from '@/lib/architectGate';
import { generatePortalCode, hashPortalCode } from '@/lib/clientSession';
import fuelCatalog from '@/lib/fuelCatalog.json';
import { allCheckins, clientRequests, studioToday, trackingFocus } from '@/lib/clientCheckins';

// Architect controls for one client's portal: code, access, unlocked fuel, RECUP.STN link.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PORTAL_FIELDS = 'portal_enabled, portal_code_set_at, fuel_unlocked, recup_member_code';
const PRODUCTS = (fuelCatalog as { products: Record<string, { title: string; group: string }> }).products;

function setupHint(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  if (/tracking_focus/.test(message) && /column|schema cache/i.test(message)) {
    return NextResponse.json({ error: 'Recovery focus not set up yet: run database/13_recovery_measures.sql in Supabase.', setup: true }, { status: 503 });
  }
  if (/portal_|fuel_unlocked|recup_member_code/.test(message) && /column|schema cache/i.test(message)) {
    return NextResponse.json({ error: 'Client portal not set up yet: run database/11_client_portal_schema.sql in Supabase.', setup: true }, { status: 503 });
  }
  return adminError(err);
}

async function readParams(params: Promise<{ clientId: string }>) {
  const { clientId } = await params;
  return UUID.test(clientId) ? clientId : null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  if (!(await isArchitect())) return unauthorized();
  const clientId = await readParams(params);
  if (!clientId) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  try {
    const { data, error } = await getSupabaseAdmin().from('clients').select(PORTAL_FIELDS).eq('id', clientId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    const catalog = Object.entries(PRODUCTS).map(([key, p]) => ({ key, title: p.title, group: p.group }));
    return NextResponse.json({ portal: data, catalog, checkins: await allCheckins(clientId), trackingFocus: await trackingFocus(clientId), requests: await clientRequests(clientId), today: studioToday() });
  } catch (err) {
    return setupHint(err);
  }
}

// { action: 'generate' } issues a new code (shown once; replaces any old code).
// { action: 'disable' } turns access off without deleting anything.
export async function POST(request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  if (!(await isArchitect())) return unauthorized();
  const clientId = await readParams(params);
  if (!clientId) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  let body: { action?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  try {
    const db = getSupabaseAdmin();
    if (body.action === 'disable') {
      const { error } = await db.from('clients').update({ portal_enabled: false }).eq('id', clientId);
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true });
    }
    if (body.action !== 'generate') return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
    const { data: who, error: whoError } = await db.from('clients').select('full_name').eq('id', clientId).maybeSingle();
    if (whoError) throw new Error(whoError.message);
    if (!who) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    const code = generatePortalCode(who.full_name);
    const { data, error } = await db
      .from('clients')
      .update({ portal_code_hash: hashPortalCode(code), portal_enabled: true, portal_code_set_at: new Date().toISOString() })
      .eq('id', clientId)
      .select('id')
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json({ code });
  } catch (err) {
    return setupHint(err);
  }
}

// { fuel_unlocked: [{ key, dose }], recup_member_code, tracking_focus }
export async function PATCH(request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  if (!(await isArchitect())) return unauthorized();
  const clientId = await readParams(params);
  if (!clientId) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const update: Record<string, unknown> = {};
  if ('fuel_unlocked' in body) {
    if (!Array.isArray(body.fuel_unlocked) || body.fuel_unlocked.length > 40) return NextResponse.json({ error: 'Invalid fuel list.' }, { status: 400 });
    const seen = new Set<string>();
    const list: { key: string; dose: string }[] = [];
    for (const f of body.fuel_unlocked) {
      const key = f && typeof f === 'object' ? (f as Record<string, unknown>).key : null;
      const dose = f && typeof f === 'object' ? (f as Record<string, unknown>).dose : '';
      if (typeof key !== 'string' || !PRODUCTS[key] || seen.has(key)) return NextResponse.json({ error: 'Unknown product in fuel list.' }, { status: 400 });
      seen.add(key);
      list.push({ key, dose: typeof dose === 'string' ? dose.slice(0, 300) : '' });
    }
    update.fuel_unlocked = list;
  }
  if ('recup_member_code' in body) {
    const v = body.recup_member_code;
    if (v !== null && typeof v !== 'string') return NextResponse.json({ error: 'Invalid member code.' }, { status: 400 });
    const code = typeof v === 'string' ? v.trim().toUpperCase() : '';
    if (code && !/^RS-[A-Z0-9]{3,12}$/.test(code)) return NextResponse.json({ error: 'Member code should look like RS-XXXX.' }, { status: 400 });
    update.recup_member_code = code || null;
  }
  if ('tracking_focus' in body) {
    const v = body.tracking_focus;
    if (v !== null && typeof v !== 'string') return NextResponse.json({ error: 'Invalid focus area.' }, { status: 400 });
    update.tracking_focus = typeof v === 'string' && v.trim() ? v.trim().slice(0, 40) : null;
  }
  if (!Object.keys(update).length) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  try {
    const { data, error } = await getSupabaseAdmin().from('clients').update(update).eq('id', clientId).select(PORTAL_FIELDS).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json({ portal: data, trackingFocus: await trackingFocus(clientId) });
  } catch (err) {
    return setupHint(err);
  }
}

// Reset what a client has logged in their portal, e.g. test taps before they really start.
// ?what=fuel     clears the "fuel taken" ticks (check-in scores stay)
// ?what=checkins deletes every daily check-in (restarts the Recovery Window)
// ?what=requests clears the "I'm interested" list
export async function DELETE(request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  if (!(await isArchitect())) return unauthorized();
  const clientId = await readParams(params);
  if (!clientId) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const what = new URL(request.url).searchParams.get('what');
  try {
    const db = getSupabaseAdmin();
    if (what === 'fuel') {
      const { error } = await db.from('client_checkins').update({ fuel_taken: false }).eq('client_id', clientId);
      if (error) throw new Error(error.message);
      // A day with nothing left on it is just noise in the chart.
      const { error: e2 } = await db.from('client_checkins').delete().eq('client_id', clientId).is('energy', null).is('sleep', null).is('body', null);
      if (e2) throw new Error(e2.message);
    } else if (what === 'checkins') {
      const { error } = await db.from('client_checkins').delete().eq('client_id', clientId);
      if (error) throw new Error(error.message);
    } else if (what === 'requests') {
      const { error } = await db.from('client_requests').delete().eq('client_id', clientId);
      if (error) throw new Error(error.message);
    } else {
      return NextResponse.json({ error: 'Unknown reset.' }, { status: 400 });
    }
    return NextResponse.json({ ok: true, checkins: await allCheckins(clientId), requests: await clientRequests(clientId) });
  } catch (err) {
    return adminError(err);
  }
}
