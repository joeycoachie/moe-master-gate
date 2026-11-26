import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { outreachFeedKey, timingSafeStringsEqual } from '@/lib/opsSession';

// The Outreach Console as a calendar feed. Google Calendar subscribes to it ("From URL") and
// refreshes it by itself, so every studio's next step shows on its date with no copying.
// Aria (the founder's envoy on claude.ai) reads the calendar, so she sees it too.
// Private: needs ?key= (shown in Founder Command). Shows studio names and next steps only.
export const dynamic = 'force-dynamic';

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
// Fold lines over 75 octets, as the calendar format requires.
const fold = (line: string) => {
  const out: string[] = [];
  let s = line;
  while (Buffer.byteLength(s) > 74) {
    let n = 74;
    while (Buffer.byteLength(s.slice(0, n)) > 74) n--;
    out.push(s.slice(0, n));
    s = ' ' + s.slice(n);
  }
  out.push(s);
  return out.join('\r\n');
};

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get('key') ?? '';
  if (!key || !timingSafeStringsEqual(key, outreachFeedKey())) return new Response('Not found.', { status: 404 });

  const { data, error } = await getSupabaseAdmin()
    .from('outreach_targets')
    .select('id, studio, stage, next_step, next_date, updated_at')
    .not('next_date', 'is', null);
  if (error) return new Response('Feed unavailable.', { status: 503 });

  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The M.O.E. Group//Outreach Console//EN',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:M.O.E. Outreach',
    'X-WR-TIMEZONE:Asia/Kuala_Lumpur',
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
  ];
  for (const t of data ?? []) {
    if (['signed', 'no'].includes(t.stage)) continue;
    const day = String(t.next_date).replace(/-/g, '');
    const next = new Date(`${t.next_date}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    const step = (t.next_step || 'Next step').trim();
    const first = step.split(/(?<=\.)\s/)[0].slice(0, 90);
    lines.push(
      'BEGIN:VEVENT',
      `UID:outreach-${t.id}@theoperatorplaybook.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day}`,
      `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replace(/-/g, '')}`,
      fold(`SUMMARY:${esc(`${t.studio}: ${first}`)}`),
      // This all-day chip is only the card's reminder. The questions and script live in the timed
      // event on the founder's main calendar (founder, 26 Nov: opened this chip before a visit and found no questions).
      fold(`DESCRIPTION:${esc(`${step}\n\n📋 QUESTIONS AND SCRIPT: open the timed event at the same time on your main calendar. This all-day chip is only a reminder.\n\nWho: ${t.owner_name || '—'}\nContact: ${t.contact || '—'}\nStage: ${t.stage}\nOpen the card: https://terminal.theoperatorplaybook.com/ops/outreach`)}`),
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }
  // Done trail: every call, visit, follow-up and stage move from the last 14 days shows as a ✅ on
  // the day it happened, so the calendar shows what got done as well as what's next. One per studio per day.
  const since = new Date(Date.now() - 14 * 86_400_000).toISOString();
  const { data: done } = await getSupabaseAdmin()
    .from('outreach_events')
    .select('id, target_id, kind, stage, created_at')
    .in('kind', ['followup', 'call', 'visit', 'stage'])
    .gte('created_at', since);
  const { data: names } = await getSupabaseAdmin().from('outreach_targets').select('id, studio');
  const studioOf = new Map((names ?? []).map((t) => [t.id, t.studio]));
  const WHAT: Record<string, string> = { followup: 'follow-up sent', call: 'call made', visit: 'visit done' };
  const byDay = new Map<string, { studio: string; day: string; what: Set<string> }>();
  for (const e of done ?? []) {
    const studio = studioOf.get(e.target_id);
    if (!studio) continue;
    const day = new Date(new Date(e.created_at).getTime() + 8 * 3_600_000).toISOString().slice(0, 10); // KL date
    const k = `${e.target_id}:${day}`;
    const row = byDay.get(k) ?? { studio, day, what: new Set<string>() };
    row.what.add(e.kind === 'stage' ? `moved to ${String(e.stage ?? '').replace('_', ' ')}` : WHAT[e.kind]);
    byDay.set(k, row);
  }
  for (const [k, row] of byDay) {
    const start = row.day.replace(/-/g, '');
    const end = new Date(`${row.day}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    lines.push(
      'BEGIN:VEVENT',
      `UID:outreach-done-${k.replace(':', '-')}@theoperatorplaybook.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end.toISOString().slice(0, 10).replace(/-/g, '')}`,
      fold(`SUMMARY:${esc(`✅ ${row.studio}: ${[...row.what].join(', ')}`)}`),
      fold(`DESCRIPTION:${esc('Logged on the Outreach card. Done.')}`),
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return new Response(lines.join('\r\n') + '\r\n', {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'private, no-store' },
  });
}
