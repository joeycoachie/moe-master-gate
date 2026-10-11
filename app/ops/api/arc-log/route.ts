import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { adminError, isArchitect, unauthorized } from '@/lib/architectGate';
import { findProtocol } from '@/lib/armory';

// Session logs written from the client bar inside each Armory arc page.
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATION_KEY = /^[a-z]+\.M\d$/;
const MAX_TEXT = 2000;

type StationLog = { done: boolean; apparatus: string; movement: string; note: string };
type EntryIn = { client_id: string; stations: Record<string, StationLog>; audit: unknown };

// The sessions already logged for one arc on one date, so the bar can resume them.
export async function GET(request: Request) {
  if (!(await isArchitect())) return unauthorized();
  const { searchParams } = new URL(request.url);
  const protocol = searchParams.get('protocol') ?? '';
  const date = searchParams.get('date') ?? '';
  if (!findProtocol(protocol) || !DATE.test(date)) return NextResponse.json({ error: 'Invalid protocol or date.' }, { status: 400 });
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('arc_sessions')
      .select('id, protocol_id, session_date, flow_format, note, updated_at, arc_session_entries(client_id, stations, audit)')
      .eq('protocol_id', protocol)
      .eq('session_date', date)
      .order('created_at');
    if (error) throw new Error(error.message);
    return NextResponse.json({ sessions: data ?? [] });
  } catch (err) {
    return adminError(err);
  }
}

function clean(s: unknown): string {
  return typeof s === 'string' ? s.slice(0, MAX_TEXT) : '';
}

function parseEntries(raw: unknown): EntryIn[] | null {
  if (!Array.isArray(raw) || raw.length > 12) return null;
  const out: EntryIn[] = [];
  for (const e of raw) {
    if (!e || typeof e !== 'object') return null;
    const { client_id, stations, audit } = e as Record<string, unknown>;
    if (typeof client_id !== 'string' || !UUID.test(client_id)) return null;
    if (!stations || typeof stations !== 'object') return null;
    const st: Record<string, StationLog> = {};
    for (const [k, v] of Object.entries(stations as Record<string, unknown>)) {
      if (!STATION_KEY.test(k) || !v || typeof v !== 'object') return null;
      const sv = v as Record<string, unknown>;
      st[k] = { done: sv.done === true, apparatus: clean(sv.apparatus), movement: clean(sv.movement), note: clean(sv.note) };
    }
    const auditOk = audit === null || audit === undefined || (typeof audit === 'object' && JSON.stringify(audit).length < 20000);
    if (!auditOk) return null;
    out.push({ client_id, stations: st, audit: audit ?? null });
  }
  return out;
}

// Create or update one session and its per-client entries. Clients removed from the
// session in the bar are removed from it here too.
export async function POST(request: Request) {
  if (!(await isArchitect())) return unauthorized();
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const protocol = typeof body.protocol_id === 'string' ? body.protocol_id : '';
  const date = typeof body.session_date === 'string' ? body.session_date : '';
  const sessionId = typeof body.session_id === 'string' && UUID.test(body.session_id) ? body.session_id : null;
  const entries = parseEntries(body.entries);
  if (!findProtocol(protocol) || !DATE.test(date)) return NextResponse.json({ error: 'Invalid protocol or date.' }, { status: 400 });
  if (!entries || !entries.length) return NextResponse.json({ error: 'Pick at least one client.' }, { status: 400 });

  try {
    const db = getSupabaseAdmin();
    const now = new Date().toISOString();
    const sessionFields = { protocol_id: protocol, session_date: date, flow_format: clean(body.flow_format) || null, note: clean(body.note), updated_at: now };

    let id = sessionId;
    if (id) {
      const { data, error } = await db.from('arc_sessions').update(sessionFields).eq('id', id).select('id').maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) id = null; // deleted elsewhere: start a fresh one
    }
    if (!id) {
      const { data, error } = await db.from('arc_sessions').insert(sessionFields).select('id').single();
      if (error) throw new Error(error.message);
      id = data.id as string;
    }

    const { error: upsertError } = await db.from('arc_session_entries').upsert(
      entries.map((e) => ({ session_id: id, client_id: e.client_id, stations: e.stations, audit: e.audit, updated_at: now })),
      { onConflict: 'session_id,client_id' },
    );
    if (upsertError) throw new Error(upsertError.message);

    const keep = entries.map((e) => e.client_id);
    const { error: pruneError } = await db
      .from('arc_session_entries')
      .delete()
      .eq('session_id', id)
      .not('client_id', 'in', `(${keep.join(',')})`);
    if (pruneError) throw new Error(pruneError.message);

    return NextResponse.json({ ok: true, session_id: id, saved_at: now });
  } catch (err) {
    return adminError(err);
  }
}
