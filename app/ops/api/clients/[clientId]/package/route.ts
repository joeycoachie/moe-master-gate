import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { adminError, isArchitect, unauthorized } from '@/lib/architectGate';
import { activePackage, clientSessionDates } from '@/lib/clientPackage';
import { summarizePackage } from '@/lib/packageSummary';

// The founder sets a client's session package (database/22): how many sessions, counted from
// which date, the price, when it was paid and when the next payment is due.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

async function readId(params: Promise<{ clientId: string }>) {
  const { clientId } = await params;
  return UUID.test(clientId) ? clientId : null;
}

async function current(clientId: string) {
  const [pkg, dates] = await Promise.all([activePackage(clientId), clientSessionDates(clientId)]);
  return { package: pkg, summary: pkg ? summarizePackage(pkg, dates) : null };
}

export async function GET(_request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  if (!(await isArchitect())) return unauthorized();
  const clientId = await readId(params);
  if (!clientId) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const { error } = await getSupabaseAdmin().from('client_packages').select('id').limit(1);
  if (error) return NextResponse.json({ error: 'Packages not set up yet: run database/22_client_packages.sql in Supabase.', setup: true }, { status: 503 });
  return NextResponse.json(await current(clientId));
}

// { sessions_total, counts_from, price_rm?, paid_on?, payment_due?, note? } replaces the active package.
// { end: true } closes it (kept for history).
export async function PUT(request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  if (!(await isArchitect())) return unauthorized();
  const clientId = await readId(params);
  if (!clientId) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  try {
    const db = getSupabaseAdmin();
    const close = await db.from('client_packages').update({ active: false, updated_at: new Date().toISOString() }).eq('client_id', clientId).eq('active', true);
    if (close.error) throw new Error(close.error.message);
    if (body.end === true) return NextResponse.json(await current(clientId));

    const total = Number(body.sessions_total);
    const from = typeof body.counts_from === 'string' ? body.counts_from : '';
    const optDate = (v: unknown) => (typeof v === 'string' && DATE.test(v) ? v : null);
    if (!Number.isInteger(total) || total < 1 || total > 200 || !DATE.test(from)) {
      return NextResponse.json({ error: 'Add the number of sessions and the date they count from.' }, { status: 400 });
    }
    const price = body.price_rm === '' || body.price_rm == null ? null : Number(body.price_rm);
    const { error } = await db.from('client_packages').insert({
      client_id: clientId,
      sessions_total: total,
      counts_from: from,
      price_rm: price != null && Number.isFinite(price) ? price : null,
      paid_on: optDate(body.paid_on),
      payment_due: optDate(body.payment_due),
      note: typeof body.note === 'string' ? body.note.slice(0, 300) : '',
    });
    if (error) throw new Error(error.message);
    return NextResponse.json(await current(clientId));
  } catch (err) {
    return adminError(err);
  }
}
