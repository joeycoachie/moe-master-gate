import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { adminError, isArchitect, unauthorized } from '@/lib/architectGate';

const CLIENT_FIELDS = 'id, full_name, format, group_label, history, conditions, avoid, current_arc, status, created_at, updated_at';

export async function GET() {
  if (!(await isArchitect())) return unauthorized();
  try {
    const db = getSupabaseAdmin();
    const { data: clients, error } = await db.from('clients').select(CLIENT_FIELDS).order('full_name');
    if (error) throw new Error(error.message);

    // Last session date per client, for the list view.
    const { data: entries, error: entryError } = await db
      .from('arc_session_entries')
      .select('client_id, arc_sessions(session_date, protocol_id)');
    if (entryError) throw new Error(entryError.message);
    const last = new Map<string, { date: string; protocol: string }>();
    for (const e of entries ?? []) {
      const s = e.arc_sessions as unknown as { session_date: string; protocol_id: string } | null;
      if (!s) continue;
      const prev = last.get(e.client_id);
      if (!prev || s.session_date > prev.date) last.set(e.client_id, { date: s.session_date, protocol: s.protocol_id });
    }
    return NextResponse.json({
      clients: (clients ?? []).map((c) => ({ ...c, last_session: last.get(c.id) ?? null })),
    });
  } catch (err) {
    return adminError(err);
  }
}

export async function POST(request: Request) {
  if (!(await isArchitect())) return unauthorized();
  let body: { full_name?: unknown; format?: unknown; group_label?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : '';
  if (!fullName) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  const format = body.format === 'group' ? 'group' : '1-1';
  const groupLabel = typeof body.group_label === 'string' && body.group_label.trim() ? body.group_label.trim() : null;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('clients')
      .insert({ full_name: fullName, format, group_label: groupLabel })
      .select(CLIENT_FIELDS)
      .single();
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'A client with that name already exists.' }, { status: 409 });
      throw new Error(error.message);
    }
    return NextResponse.json({ client: data });
  } catch (err) {
    return adminError(err);
  }
}
