import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { adminError, isArchitect, unauthorized } from '@/lib/architectGate';
import { EXTRA_SESSION_ID } from '@/lib/clientPortal';

// A session outside the programme (e.g. a bonus day while another coach is away). Stored like an
// arc session with protocol_id 'EXTRA': the title in the session note, one ticked station per movement.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  if (!(await isArchitect())) return unauthorized();
  const { clientId } = await params;
  if (!UUID.test(clientId)) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const date = typeof body.session_date === 'string' ? body.session_date : '';
  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 80) : '';
  const moves = Array.isArray(body.movements)
    ? body.movements.filter((m): m is string => typeof m === 'string' && !!m.trim()).map((m) => m.trim().slice(0, 120)).slice(0, 20)
    : [];
  const note = typeof body.coach_note === 'string' ? body.coach_note.slice(0, 2000) : '';
  if (!DATE.test(date) || !title || !moves.length) {
    return NextResponse.json({ error: 'Add a date, a title and at least one movement.' }, { status: 400 });
  }
  try {
    const db = getSupabaseAdmin();
    const { data: session, error } = await db
      .from('arc_sessions')
      .insert({ protocol_id: EXTRA_SESSION_ID, session_date: date, flow_format: '1-1', note: title })
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    const stations = Object.fromEntries(moves.map((m, i) => [`extra.M${i + 1}`, { done: true, movement: m, apparatus: '', note: '' }]));
    const { error: entryError } = await db
      .from('arc_session_entries')
      .insert({ session_id: session.id, client_id: clientId, stations, audit: note ? { notes: note } : null });
    if (entryError) {
      await db.from('arc_sessions').delete().eq('id', session.id);
      throw new Error(entryError.message);
    }
    return NextResponse.json({ ok: true, session_id: session.id });
  } catch (err) {
    return adminError(err);
  }
}
