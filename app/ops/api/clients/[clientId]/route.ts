import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { adminError, isArchitect, unauthorized } from '@/lib/architectGate';

const CLIENT_FIELDS = 'id, full_name, format, group_label, history, conditions, avoid, current_arc, status, created_at, updated_at';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EDITABLE = ['full_name', 'format', 'group_label', 'history', 'conditions', 'avoid', 'current_arc', 'status'] as const;

// One client's profile plus their whole timeline (every arc session they were in).
export async function GET(_request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  if (!(await isArchitect())) return unauthorized();
  const { clientId } = await params;
  if (!UUID.test(clientId)) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  try {
    const db = getSupabaseAdmin();
    const { data: client, error } = await db.from('clients').select(CLIENT_FIELDS).eq('id', clientId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!client) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

    const { data: entries, error: entryError } = await db
      .from('arc_session_entries')
      .select('id, stations, audit, updated_at, arc_sessions(id, protocol_id, session_date, flow_format, note, arc_session_entries(clients(full_name)))')
      .eq('client_id', clientId);
    if (entryError) throw new Error(entryError.message);

    type SessionJoin = {
      id: string; protocol_id: string; session_date: string; flow_format: string | null; note: string;
      arc_session_entries: { clients: { full_name: string } | null }[];
    };
    const timeline = (entries ?? [])
      .map((e) => {
        const s = e.arc_sessions as unknown as SessionJoin | null;
        return {
          entry_id: e.id,
          stations: e.stations,
          audit: e.audit,
          session_id: s?.id ?? null,
          protocol_id: s?.protocol_id ?? '',
          session_date: s?.session_date ?? '',
          flow_format: s?.flow_format ?? null,
          session_note: s?.note ?? '',
          with: (s?.arc_session_entries ?? [])
            .map((x) => x.clients?.full_name)
            .filter((n): n is string => !!n && n !== client.full_name),
        };
      })
      .sort((a, b) => b.session_date.localeCompare(a.session_date));

    return NextResponse.json({ client, timeline });
  } catch (err) {
    return adminError(err);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  if (!(await isArchitect())) return unauthorized();
  const { clientId } = await params;
  if (!UUID.test(clientId)) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const update: Record<string, string | null> = {};
  for (const k of EDITABLE) {
    if (!(k in body)) continue;
    const v = body[k];
    if (v !== null && typeof v !== 'string') return NextResponse.json({ error: `Invalid ${k}.` }, { status: 400 });
    update[k] = typeof v === 'string' ? v.trim() : null;
  }
  if (update.full_name === '') return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  if (update.format && !['1-1', 'group'].includes(update.format)) return NextResponse.json({ error: 'Invalid format.' }, { status: 400 });
  if (update.status && !['active', 'paused', 'archived'].includes(update.status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  if (!Object.keys(update).length) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('clients')
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('id', clientId)
      .select(CLIENT_FIELDS)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json({ client: data });
  } catch (err) {
    return adminError(err);
  }
}
