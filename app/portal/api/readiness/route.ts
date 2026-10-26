import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { currentClientId } from '@/lib/clientPortal';
import { clientReadiness } from '@/lib/clientCheckins';
import { cleanAnswers, summarizeReadiness } from '@/lib/readiness';
import { notifyFounder } from '@/lib/notify';

// The signed-in client saves (part of) their readiness profile. Answers merge with what is saved,
// so each part can be saved on its own. The client id comes from the signed cookie.
export async function POST(request: Request) {
  const clientId = await currentClientId();
  if (!clientId) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  let body: { answers?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  try {
    const db = getSupabaseAdmin();
    const { data: client } = await db.from('clients').select('full_name, portal_enabled, status').eq('id', clientId).maybeSingle();
    if (!client || !client.portal_enabled || client.status === 'archived') return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
    const before = await clientReadiness(clientId);
    if (before === null) throw new Error('readiness table missing');
    const answers = { ...before.answers, ...cleanAnswers(body.answers) };
    const was = summarizeReadiness(before.answers);
    const now = summarizeReadiness(answers);
    const { error } = await db.from('client_readiness').upsert({
      client_id: clientId,
      answers,
      safety_flag: now.safetyFlag,
      score: now.score,
      parts_done: now.partsDone,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    // Ping the founder when a profile is completed or a safety answer needs a look (no health details).
    const first = client.full_name.split(/\s+/)[0];
    const link = `https://terminal.theoperatorplaybook.com/ops/clients/${clientId}`;
    if (now.safetyFlag && !was.safetyFlag) await notifyFounder(`${first}: check their safety answers`, 'One safety answer needs your look before harder work.', link);
    else if (now.partsDone === 3 && was.partsDone < 3) await notifyFounder(`${first} completed their profile`, `Readiness score ${now.score} (${now.band}).`, link);
    return NextResponse.json({ answers, ...now });
  } catch {
    return NextResponse.json({ error: 'Could not save right now.' }, { status: 503 });
  }
}
