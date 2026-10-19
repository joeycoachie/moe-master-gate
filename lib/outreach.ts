import lexicon from '@/archive/data/lexicon.json';

// Outreach Console: the Phase Action Protocol (Archive gate G-25) run on real data.
// Nothing is ticked by hand. Every step ticks itself from what was logged, and shows the proof.
// Pure functions only: used by the console page and by the daily report route.

export const STAGES = ['found', 'messaged', 'replied', 'call_booked', 'call_held', 'plan_sent', 'signed'] as const;
export type Stage = (typeof STAGES)[number] | 'no';

export const STAGE_LABEL: Record<Stage, string> = {
  found: 'Found',
  messaged: 'Messaged',
  replied: 'Replied',
  call_booked: 'Call booked',
  call_held: 'Call held',
  plan_sent: 'Plan sent',
  signed: 'Signed',
  no: 'Not now',
};

export type Variant = {
  id: string;
  code: string;
  body: string;
  angle: string;
  status: 'testing' | 'winner' | 'retired';
  created_at: string;
};

export type Target = {
  id: string;
  studio: string;
  owner_name: string;
  area: string;
  contact: string;
  fit_note: string;
  batch: string;
  variant_id: string | null;
  stage: Stage;
  stage_at: Partial<Record<Stage, string>>;
  friction: string;
  next_step: string;
  next_date: string | null;
  followups: number;
  last_touch_at: string | null;
  created_at: string;
};

export type OutreachEvent = {
  id: string;
  target_id: string | null;
  variant_id: string | null;
  kind: 'stage' | 'followup' | 'note' | 'lesson';
  stage: Stage | null;
  body: string;
  created_at: string;
};

export const FOLLOW_UP_AFTER_DAYS = 4;
const DAY = 86_400_000;

// A target "reached" a stage if it is at it now or passed it (a 'no' keeps what it reached).
export function reached(t: Target, stage: Stage) {
  return Boolean(t.stage_at[stage]) || t.stage === stage;
}

export function fillMessage(body: string, t: Pick<Target, 'studio' | 'owner_name'>) {
  return body.replaceAll('{studio}', t.studio || 'your studio').replaceAll('{name}', t.owner_name || 'there');
}

// Messaged, no reply yet, and nobody has touched it for FOLLOW_UP_AFTER_DAYS.
export function overdueFollowUps(targets: Target[], now = Date.now()) {
  return targets.filter((t) => {
    if (t.stage !== 'messaged') return false;
    const last = t.last_touch_at ?? t.stage_at.messaged;
    return Boolean(last) && now - new Date(last!).getTime() > FOLLOW_UP_AFTER_DAYS * DAY;
  });
}

export function funnel(targets: Target[]) {
  const n = (s: Stage) => targets.filter((t) => reached(t, s)).length;
  return {
    found: targets.length,
    messaged: n('messaged'),
    replied: n('replied'),
    calls: n('call_held'),
    plans: n('plan_sent'),
    signed: n('signed'),
  };
}

// Mini-batch scoring: which message gets replies. Under 5 sent is too few to call.
export function variantScores(variants: Variant[], targets: Target[]) {
  return variants.map((v) => {
    const mine = targets.filter((t) => t.variant_id === v.id);
    const sent = mine.filter((t) => reached(t, 'messaged')).length;
    const replied = mine.filter((t) => reached(t, 'replied')).length;
    const calls = mine.filter((t) => reached(t, 'call_booked')).length;
    return { variant: v, sent, replied, calls, rate: sent ? replied / sent : 0, enough: sent >= 5 };
  });
}

// Plain-language check (SYS-D028), same rules as archive/scripts/gate.mjs.
type Lex = { kind: string; term: string; say?: string; match: string[] };
export function plainCheck(text: string) {
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const issues: string[] = [];
  let banned = false;
  for (const l of (lexicon as { entries: Lex[] }).entries) {
    if (l.match.some((m) => new RegExp(`(^|[^a-z0-9])(${escape(m)})(?=$|[^a-z0-9])`, 'i').test(text))) {
      if (l.kind === 'ban') banned = true;
      issues.push(l.kind === 'ban' ? `Never say "${l.term}"${l.say ? `. Use: ${l.say}` : ''}` : `"${l.term}" → say "${l.say}"`);
    }
  }
  for (const s of text.split(/(?<=[.?!])\s+|\n+/).filter(Boolean)) {
    const words = s.trim().split(/\s+/).length;
    if (words > 20) issues.push(`Long sentence (${words} words): "${s.slice(0, 50)}…"`);
  }
  if (/[!;—–]/.test(text)) issues.push('Use only periods and commas (R8)');
  return { pass: issues.length === 0, banned, issues };
}

// ---------- The four phases, ticked from data ----------

export type Step = { label: string; done: boolean; proof: string; href?: string };
export type Phase = { id: number; rank: string; title: string; plain: string; refs: string; steps: Step[] };

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Kuala_Lumpur' }) : '';

function firstAt(targets: Target[], stage: Stage) {
  const hits = targets
    .filter((t) => t.stage_at[stage])
    .sort((a, b) => a.stage_at[stage]!.localeCompare(b.stage_at[stage]!));
  return hits[0];
}

export function buildPhases(targets: Target[], variants: Variant[], events: OutreachEvent[]): Phase[] {
  const f = funnel(targets);
  const live = variants.filter((v) => v.status !== 'retired');
  const cleanMsg = live.find((v) => plainCheck(v.body).pass);
  const overdue = overdueFollowUps(targets);
  const followupsSent = events.filter((e) => e.kind === 'followup').length;
  const unsent = targets.filter((t) => t.stage === 'found').length;
  const firstCall = firstAt(targets, 'call_booked');
  const heard = targets.find((t) => reached(t, 'call_held') && t.friction.trim());
  const firstPlan = firstAt(targets, 'plan_sent');
  const firstSign = firstAt(targets, 'signed');
  const lessons = events.filter((e) => e.kind === 'lesson').length;

  return [
    {
      id: 1, rank: 'E', title: 'Find & say hello', plain: 'Pick studios that fit, send a short message with one ask: a 15-minute call.',
      refs: 'SYS-P058 · P-015 · Primacy Doctrine (3-line rule)',
      steps: [
        { label: 'Lock the clinical menu (the studio page)', done: true, proof: 'Live since 16 Oct 2026 · commit 2799636', href: 'https://studio.theoperatorplaybook.com' },
        { label: 'Build the M.O.E. Master Gate terminal', done: true, proof: 'Live since 6 Oct 2026', href: 'https://terminal.theoperatorplaybook.com' },
        { label: 'A first message that passes the plain-language check', done: Boolean(cleanMsg), proof: cleanMsg ? `${cleanMsg.code} passes SYS-D028 · ${live.length} message(s) in test` : 'Add a message below' },
        { label: '10 studios on the list', done: f.found >= 10, proof: `${f.found} / 10 on the list` },
        { label: 'Every studio on the list has been messaged', done: f.found > 0 && unsent === 0, proof: f.found ? `${f.messaged} messaged · ${unsent} waiting` : 'List is empty' },
        { label: `Nobody left hanging (follow up after ${FOLLOW_UP_AFTER_DAYS} days)`, done: (followupsSent > 0 || f.replied > 0) && overdue.length === 0, proof: overdue.length ? `${overdue.length} overdue: ${overdue.slice(0, 3).map((t) => t.studio).join(', ')}` : `${followupsSent} follow-up(s) sent · ${f.replied} replied` },
      ],
    },
    {
      id: 2, rank: 'C', title: 'Listen', plain: 'On the call, ask and listen. No pitch. Say their problem back better than they can.',
      refs: 'UEF Track 1 · T-027 Architect’s Review Diagnostic · P-041',
      steps: [
        { label: 'A 15-minute call booked', done: Boolean(firstCall), proof: firstCall ? `${firstCall.studio} · ${fmtDate(firstCall.stage_at.call_booked)}` : `${f.replied} replied so far` },
        { label: 'Call held, their problem written in their words', done: Boolean(heard), proof: heard ? `${heard.studio}: “${heard.friction.slice(0, 60)}${heard.friction.length > 60 ? '…' : ''}”` : 'Write what they said under the studio' },
        { label: 'One lesson written from what we heard', done: lessons > 0, proof: `${lessons} lesson(s) logged` },
      ],
    },
    {
      id: 3, rank: 'B', title: 'Plan', plain: 'Send a 90-day plan built from their own words. Clarity before momentum.',
      refs: 'D-009 Clarity vs. Momentum · UEF Track 2 · T-029 Architectural Brief',
      steps: [
        { label: '90-day plan sent', done: Boolean(firstPlan), proof: firstPlan ? `${firstPlan.studio} · ${fmtDate(firstPlan.stage_at.plan_sent)}` : 'None yet' },
      ],
    },
    {
      id: 4, rank: 'S+', title: 'Start', plain: 'If it fits, sign the 90-Day Setup (RM9,000, 50% before day 1) with the Studio Licence (RM1,200/month, 12 months).',
      refs: 'P-011 SOW as Shield · T-044 Retainer Shell · BC3 offer (16 Oct)',
      steps: [
        { label: '90-Day Setup + Studio Licence signed', done: Boolean(firstSign), proof: firstSign ? `${firstSign.studio} · ${fmtDate(firstSign.stage_at.signed)} · BC3 exit gate` : 'One is the target, not ten' },
      ],
    },
  ];
}

// Days in a row (ending today or yesterday, Malaysia time) with at least one message or follow-up sent.
export function sendStreak(events: OutreachEvent[], now = new Date()) {
  const myDay = (d: Date) => new Date(d.getTime() + 8 * 3_600_000).toISOString().slice(0, 10);
  const days = new Set(
    events.filter((e) => e.kind === 'followup' || (e.kind === 'stage' && e.stage === 'messaged')).map((e) => myDay(new Date(e.created_at))),
  );
  let cursor = now.getTime();
  if (!days.has(myDay(new Date(cursor)))) cursor -= DAY;
  let streak = 0;
  while (days.has(myDay(new Date(cursor)))) {
    streak++;
    cursor -= DAY;
  }
  return streak;
}

// The phone report. Daily: today's to-dos. Fridays (Malaysia): the week in numbers too.
export function buildReport(targets: Target[], variants: Variant[], events: OutreachEvent[], now = new Date()) {
  const f = funnel(targets);
  const overdue = overdueFollowUps(targets, now.getTime());
  const unsent = targets.filter((t) => t.stage === 'found');
  const dueToday = targets.filter((t) => t.next_date && t.next_date <= new Date(now.getTime() + 8 * 3_600_000).toISOString().slice(0, 10) && t.stage !== 'signed' && t.stage !== 'no');
  const weekAgo = now.getTime() - 7 * DAY;
  const thisWeek = events.filter((e) => new Date(e.created_at).getTime() >= weekAgo);
  const wk = (s: Stage) => thisWeek.filter((e) => e.kind === 'stage' && e.stage === s).length;
  const isFriday = new Date(now.getTime() + 8 * 3_600_000).getUTCDay() === 5;
  const best = variantScores(variants, targets).filter((s) => s.enough).sort((a, b) => b.rate - a.rate)[0];

  const lines: string[] = [];
  if (isFriday) {
    lines.push(`This week: ${wk('messaged')} sent · ${thisWeek.filter((e) => e.kind === 'followup').length} follow-ups · ${wk('replied')} replies · ${wk('call_held')} calls · ${wk('plan_sent')} plans · ${wk('signed')} signed`);
    lines.push(`All time: ${f.found} found → ${f.messaged} sent → ${f.replied} replied → ${f.calls} calls → ${f.plans} plans → ${f.signed} signed`);
    lines.push(best ? `Best message: ${best.variant.code} (${best.replied}/${best.sent} replied)` : 'No message has 5 sends yet, too early to pick a winner');
  }
  if (overdue.length) lines.push(`Follow up today: ${overdue.map((t) => t.studio).join(', ')}`);
  if (dueToday.length) lines.push(`Due: ${dueToday.map((t) => `${t.studio} (${t.next_step || 'next step'})`).join(', ')}`);
  if (unsent.length) lines.push(`${unsent.length} studio(s) found but not messaged`);
  if (!targets.length) lines.push('The list is empty. Add 10 studios that fit.');
  if (!lines.length) lines.push(`Nothing due. Streak: ${sendStreak(events, now)} day(s). Protect "messages sent".`);

  const title = isFriday ? 'Outreach · Friday report' : 'Outreach · today';
  return { title, body: lines.join('\n'), worthSending: isFriday || overdue.length > 0 || dueToday.length > 0 || unsent.length > 0 || !targets.length };
}
