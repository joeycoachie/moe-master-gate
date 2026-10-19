import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { isArchitect } from '@/lib/architectGate';
import { notifyFounder } from '@/lib/notify';
import { buildReport, type OutreachEvent, type Target, type Variant } from '@/lib/outreach';

// The founder's outreach report, pushed to their phone (lib/notify.ts).
// Vercel Cron calls this every morning with `Authorization: Bearer $CRON_SECRET` (vercel.json).
// The console's "Send report now" button calls it with the SYS.OP cookie and ?force=1.
// It sends only when something is due, except on Fridays (Malaysia), when the weekly numbers always go.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const fromCron = Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`;
  if (!fromCron && !(await isArchitect())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getSupabaseAdmin();
    const [variants, targets, events] = await Promise.all([
      db.from('outreach_variants').select('*'),
      db.from('outreach_targets').select('*'),
      db.from('outreach_events').select('*').order('created_at', { ascending: false }).limit(1000),
    ]);
    for (const r of [variants, targets, events]) if (r.error) throw new Error(r.error.message);

    const report = buildReport(targets.data as Target[], variants.data as Variant[], events.data as OutreachEvent[]);
    const force = new URL(request.url).searchParams.get('force') === '1';
    const channels = Boolean(process.env.NTFY_TOPIC || (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID));
    const sent = channels && (force || report.worthSending);
    if (sent) await notifyFounder(report.title, report.body, 'https://terminal.theoperatorplaybook.com/ops/outreach');
    return NextResponse.json({ ...report, sent, channels });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
