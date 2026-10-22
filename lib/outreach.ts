import lexicon from '@/archive/data/lexicon.json';

// Outreach Console: the Phase Action Protocol (Archive gate G-25) run on real data.
// Nothing is ticked by hand. Every step ticks itself from what was logged, and shows the proof.
// Pure functions only: used by the console page and by the daily report route.

export const STAGES = ['found', 'messaged', 'replied', 'call_booked', 'call_held', 'plan_sent', 'signed'] as const;
export type Stage = (typeof STAGES)[number] | 'no';

// Two roads, one skeleton (gate G-25): the same five steps, a different offer at the end.
//   kinetic: Kinetic Studio OS. Ends in a signed 90-Day Setup (BC3 exit gate).
//   fuel:    RECUP.STN recovery pop-up. The small first yes. Ends in a pop-up held, then opens the kinetic road.
export type Road = 'kinetic' | 'fuel';
export const ROADS: Road[] = ['kinetic', 'fuel'];
export const ROAD_INFO: Record<Road, { name: string; offer: string; colour: string }> = {
  kinetic: { name: 'Kinetic · Studio OS', offer: '90-Day Setup + Studio Licence', colour: '#00e5ff' },
  fuel: { name: 'Fuel · RECUP pop-up', offer: 'One-day recovery pop-up', colour: '#ffb454' },
};
export const roadOf = (x: { road?: Road | null }): Road => (x.road === 'fuel' ? 'fuel' : 'kinetic');

const FUEL_STAGE_LABEL: Partial<Record<Stage, string>> = {
  call_booked: 'Chat booked',
  call_held: 'Chat held',
  plan_sent: 'Pop-up plan sent',
  signed: 'Pop-up held',
};
export function stageLabel(road: Road, stage: Stage) {
  return (road === 'fuel' && FUEL_STAGE_LABEL[stage]) || STAGE_LABEL[stage];
}

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
  use_when?: string;
  road?: Road;
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
  road?: Road;
  referred_by?: string;
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
  kind: 'stage' | 'followup' | 'call' | 'visit' | 'note' | 'lesson';
  stage: Stage | null;
  body: string;
  created_at: string;
};

export const WAIT_WORKING_DAYS = 3;

// Today's date (yyyy-mm-dd) in Malaysia.
export const todayMY = (now = Date.now()) => new Date(now + 8 * 3_600_000).toISOString().slice(0, 10);
const DAY = 86_400_000;

// A target "reached" a stage if it is at it now or passed it (a 'no' keeps what it reached).
export function reached(t: Target, stage: Stage) {
  return Boolean(t.stage_at[stage]) || t.stage === stage;
}

// {detail} is the one real thing we noticed about them (the studio's "detail" field, stored as fit_note).
// Left as a visible blank when missing, so nothing generic goes out by accident.
export function fillMessage(body: string, t: Pick<Target, 'studio' | 'owner_name' | 'fit_note'> & { referred_by?: string }) {
  return body
    .replaceAll('{referrer}', t.referred_by || '[WHO REFERRED YOU]')
    .replaceAll('{studio}', t.studio || 'your studio')
    .replaceAll('{name}', t.owner_name || 'there')
    .replaceAll('{detail}', t.fit_note || '[ADD ONE DETAIL FROM THEIR PAGE]');
}

// One message, packaged per channel. Write it once; the channel decides the wrapping.
//   email:     first line "Subject: …" becomes the subject.
//   whatsapp / instagram: no subject line, no sign-off, short.
//   person:    the same words as a talking script (for the call or the visit).
export type Channel = 'email' | 'whatsapp' | 'instagram' | 'person';
export const CHANNELS: Channel[] = ['email', 'whatsapp', 'instagram', 'person'];
export const CHANNEL_LABEL: Record<Channel, string> = { email: 'Email', whatsapp: 'WhatsApp', instagram: 'Instagram', person: 'Call / visit' };

export function formatFor(channel: Channel, message: string) {
  const [first, ...rest] = message.split('\n');
  const hasSubject = /^subject:/i.test(first);
  const subject = hasSubject ? first.replace(/^subject:\s*/i, '').trim() : '';
  let text = (hasSubject ? rest.join('\n') : message).trim();
  if (channel !== 'email') {
    text = text
      .replace(/\n+(thanks|cheers|best|regards)[^\n]*(\n[^\n]*){1,3}\s*$/i, '') // chat needs no sign-off
      .replace(/\n{2,}/g, '\n\n')
      .trim();
  }
  if (channel === 'person') text = text.replace(/^hi[^\n,]*,?\s*/i, '').trim();
  return { subject, text };
}

// Where each channel opens, read from the contact field ("embassy@x.com · WhatsApp +60 16-247 6683 · IG @x").
export function contactFor(channel: Channel, contact: string) {
  if (channel === 'email') return contact.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0];
  // Only a number marked "WhatsApp" counts: a landline would open a dead chat.
  if (channel === 'whatsapp') return contact.match(/whatsapp[^+\d]*(\+?\d[\d\s-]{7,}\d)/i)?.[1];
  if (channel === 'instagram') return contact.match(/(?:^|[\s(])@([\w.]+)/)?.[1];
  return undefined;
}

export function openLink(channel: Channel, contact: string, message: string) {
  const to = contactFor(channel, contact);
  if (!to) return undefined;
  const { subject, text } = formatFor(channel, message);
  if (channel === 'email') return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  if (channel === 'whatsapp') {
    let digits = to.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = `6${digits}`; // Malaysian local number → 60…
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  }
  if (channel === 'instagram') return `https://ig.me/m/${to}`; // Instagram can't prefill: copy first, then paste
  return undefined;
}

// The best first channel for a studio: whatever their contact field offers, chat before email.
export function defaultChannel(contact: string, message: string): Channel {
  if (/^subject:/i.test(message) && contactFor('email', contact)) return 'email';
  for (const c of ['whatsapp', 'instagram', 'email'] as const) if (contactFor(c, contact)) return c;
  return 'person';
}

// ---------- The message library: the source of truth for every message ----------
// The console loads these into the database by itself (matched by code), so a new or changed
// message needs no SQL paste. Every message has a subject line: email uses it, chat drops it.
// Every message passes the SYS-D028 check (20 Oct 2026). Stats stay with the code.

export type LibraryMessage = { code: string; road: Road; angle: string; use_when: string; body: string };

const msg = (subject: string, text: string) => `Subject: ${subject}\n\n${text}`;

export const MESSAGE_LIBRARY: LibraryMessage[] = [
  // Fuel road: the hook. After-class pilot: one drink per member, RM18 flat per cup, no event fee for the studio (founder, 21 Oct).
  {
    code: 'V8', road: 'fuel', angle: 'Deck first: ask to send the deck',
    use_when: 'Cold, first touch. Default for any studio, and best when a front desk answers: they forward decks to the owner.',
    body: msg('A one-class recovery pilot for {studio}', "Hi {name}, Joey here from RECUP.STN. We run a one-class recovery pilot inside studios. Members do a short check-in and get one drink chosen for their session. We bring the drinks and staff, and there is no event fee for the studio.\n\nReply YES and I'll send our short deck to whoever plans member events."),
  },
  {
    code: 'V5', road: 'fuel', angle: 'Haze: lead with what is happening now',
    use_when: 'Cold, first touch. Studios whose members run or train outdoors. Only while the haze lasts. Send with one photo of the station.',
    body: msg('A recovery pop-up for {studio} while the haze lasts', "Hi {name}, Joey here. With the haze keeping runs indoors, we're running a one-class recovery pilot inside a few studios. One drink each, chosen from a short check-in. We bring everything.\n\nReply YES and I'll send the details for {studio}."),
  },
  {
    code: 'V7', road: 'fuel', angle: 'Premium studio: not another brand booth',
    use_when: 'Cold, first touch. Premium studios that already run brand collaborations.',
    body: msg('Not another brand booth', "Hi {name}, Joey here. Brands sample drinks at studios all the time. We do it differently. Each member does a 60-second check-in and gets the drink that fits today's session. You get the numbers after.\n\nWhich class is your busiest? We'd bring the Recovery Omakase to that one."),
  },
  {
    code: 'V9', road: 'fuel', angle: 'Boutique: members leave the minute class ends',
    use_when: 'Cold, first touch. Small boutique studios that want members to stay and come back.',
    body: msg('Ten more minutes with your members', 'Hi {name}, Joey here. Most members leave the minute class ends. We give them a reason to stay ten minutes. One recovery drink each, chosen from a short check-in, with no event fee for your studio.\n\nReply YES and I\'ll send our short deck.'),
  },
  {
    code: 'V11', road: 'fuel', angle: 'Hotel gym: one more member privilege',
    use_when: 'Cold email, first touch. Hotel gyms with paid memberships (pool, sauna, spa). Formal tone. Email the membership team, ask for the wellness lead.',
    body: msg('A Recovery Omakase morning for {studio} members', "Hello {name},\n\nI'm Joey from RECUP.STN, a recovery station in Kuala Lumpur. Your members already enjoy the pool, the sauna and the spa. We would like to add one more privilege for them: a Recovery Omakase morning.\n\nEach member does a 60-second check-in and gets a recovery drink matched to how they trained. We bring the station and the team, and the hotel pays nothing.\n\nCould you share the name of whoever looks after member events or wellness?\n\nThanks,\nJoey"),
  },
  {
    code: 'V6', road: 'fuel', angle: 'Warm invite: return the favour',
    use_when: 'Warm. After you have met them in person. This is the gift follow-up.',
    body: msg('Thank you, and a drink on us', "Hi {name}, Joey here. Thanks for your time at {studio}. I'd like to return the favour. Come by RECUP.STN HQ for a drink on us and a proper chat about recovery.\n\nDoes Thursday or Friday suit you?"),
  },
  // Follow-ups and referrals (22 Oct 2026).
  {
    code: 'V12', road: 'fuel', angle: 'Referral: someone named who to contact',
    use_when: 'Warm. Someone at the studio named the right person. Put that person in Owner and the referrer in Referred by.',
    body: msg('{referrer} suggested I write to you', "Hello {name},\n\n{referrer} kindly suggested I get in touch. I'm Joey, founder of RECUP.STN, a recovery station from The M.O.E. Group in Kuala Lumpur.\n\nWe would like to offer {studio} members a Recovery Omakase morning. After training, each member does a short check-in and gets one recovery drink chosen for their session. We bring the station and the team.\n\nCould I show you how it works in 15 minutes? Does Tuesday or Wednesday next week suit you?\n\nThanks,\nJoey\nFounder, The M.O.E. Group\n+60 10-231 9893"),
  },
  {
    code: 'V13', road: 'fuel', angle: 'Gift follow-up: an invite to HQ',
    use_when: 'No reply after 3 working days. Same channel as the first message. The gift is a visit to RECUP.STN HQ.',
    body: msg('An invitation for the {studio} team', "Hi {name}, following up on my note about a recovery pilot for {studio}. Instead of another message, an invitation. Come by RECUP.STN HQ with one teammate, try the drinks on us, and see how the check-in works.\n\nDoes Thursday or Friday suit you?"),
  },
  {
    code: 'V14', road: 'fuel', angle: 'Instagram nudge after an unanswered email',
    use_when: 'No reply by email. A short DM to the studio’s Instagram, from @recup.stn.',
    body: msg('Quick note from RECUP.STN', "Hi {studio}, Joey from @recup.stn here. I sent you an email about a one-class recovery pilot for your members.\n\nWho is the best person to chat with about member events?"),
  },
  // Kinetic road: the system. Usually after a tasting day, through OPEN KINETIC ROAD.
  {
    code: 'V10', road: 'kinetic', angle: 'The bridge: tasting numbers → the system',
    use_when: 'Warm. The day after a tasting, when you send the owner their numbers. This is where the system comes in.',
    body: msg('Your tasting day, in numbers', "Hi {name}, here are the numbers from the tasting at {studio}. [__] members checked in and [__] asked for more. That's one table on one day. Imagine the same picture for every client in every class. Who trains, what they need, who is slipping away.\n\nDoes Tuesday or Wednesday suit you for 15 minutes to look at it together?"),
  },
  {
    code: 'V3', road: 'kinetic', angle: 'Email: one real detail, then one question',
    use_when: 'Cold email, when you found one real detail on their website.',
    body: msg('A quick question about coaching at {studio}', "Hi {name},\n\nI saw that {detail}.\n\nHow do you keep coaching plans consistent across your team while still tailoring them to each client?\n\nI'm working on a practical way to make that easier. Does Tuesday or Wednesday suit you for a 15-minute call?\n\nThanks,\nJoey"),
  },
  {
    code: 'V1', road: 'kinetic', angle: "Owner's time: admin pain first",
    use_when: 'Cold, first touch. An owner who is drowning in admin.',
    body: msg('Where is your studio losing time?', "You opened your studio to coach, not to chase spreadsheets. When every instructor tracks clients their own way, details get lost and clients drift. We set up one simple system for your floor: the same programme, every client's progress on record. I can show you where your studio is losing time in 15 minutes.\n\nDoes Tuesday or Wednesday suit you?"),
  },
  {
    code: 'V2', road: 'kinetic', angle: 'Client safety: a question, not a statement',
    use_when: 'Cold, first touch. An owner who cares about clients getting hurt.',
    body: msg('A quick question about clients with sore knees', "Quick question for {studio}. When a client with a sore knee joins a class, how does each instructor know what to change? Most studios keep that in WhatsApp or in one person's head. We built a simple way to keep it on record for every client.\n\nDoes Tuesday or Wednesday suit you for a 15-minute look?"),
  },
  {
    code: 'V4', road: 'kinetic', angle: 'Chat: ask who to talk to',
    use_when: "Cold chat, when you don't know who decides.",
    body: msg('Who looks after coaching at {studio}?', "Hi, I'm Joey. I saw that {detail}.\n\nWho is the best person to speak with about how your coaches plan and track client training? A name is all I need."),
  },
];

// Studios researched by Claude, ready to add in one tap (contacts checked on their own websites).
export type SuggestedTarget = {
  key: string; studio: string; owner_name: string; area: string; contact: string;
  fit_note: string; batch: string; road: Road; variant_code: string; next_step: string; why: string;
};
export const SUGGESTED_TARGETS: SuggestedTarget[] = [
  {
    key: 'sofitel-fitness',
    studio: 'Sofitel FITNESS',
    owner_name: '',
    area: 'Sofitel KL Damansara hotel · level 3',
    contact: 'Elisha.Frankie@sofitel.com (membership) · sri.dewani@sofitel.com (enquiries) · Tel +603 2720 6688',
    fit_note: 'your members already get the pool, sauna and spa',
    batch: 'B2 · Hotel gyms',
    road: 'fuel',
    variant_code: 'V11',
    next_step: 'Email V11 to Elisha (membership). Get the wellness lead’s name. Ask early: can outside drinks be served in the hotel?',
    why: 'Hotel gym, memberships RM299–4,999. Not SOFIT the studio. No PT or classes listed, so Fuel first; the system only if they run training.',
  },
];

// ---------- Reply gates: when they answer, tap what they said, get the reply and the next step ----------
// Most first replies come from the front desk, not the owner. The admin gates' only job is to reach
// the person who decides. Every gate passes the SYS-D028 check (20 Oct 2026).

export type ReplyGate = {
  key: string;
  who: 'admin' | 'owner' | 'either';
  said: string; // what they said, as the button reads
  reply: Record<Road, string>;
  stage: Stage; // moves forward only
  next: string; // the next step, written onto the card
  inDays: number; // working days until the next step is due
};

export const REPLY_GATES: ReplyGate[] = [
  {
    key: 'admin_what', who: 'admin', said: '“What is this about?” / asks for details',
    reply: {
      kinetic: "Thanks for getting back to me. In short, we help studios keep every client's programme and progress on record, so every instructor coaches the same way. Could you share the name of whoever looks after coaching or operations?",
      fuel: 'Thanks for getting back to me. In short, after one class we serve members one recovery drink each, chosen from a short check-in. We bring the drinks and staff, and there is no event fee for the studio. Could you share the name of whoever plans member events?',
    },
    stage: 'replied', next: "Get the decision-maker's name. Put it in Owner and send them the first message", inDays: 2,
  },
  {
    key: 'admin_pass', who: 'admin', said: '“We’ll pass it on” / owner is busy',
    reply: {
      kinetic: "Thank you, I appreciate it. I'll check back with you on {day} if I haven't heard. Could I have their name so I write to them properly?",
      fuel: "Thank you, I appreciate it. I'll check back with you on {day} if I haven't heard. Could I have their name so I write to them properly?",
    },
    stage: 'replied', next: 'Check back with the front desk. Ask for the owner by name', inDays: 3,
  },
  {
    key: 'admin_referred', who: 'admin', said: 'They name someone else to contact',
    reply: {
      kinetic: "Thank you, that's very helpful. I'll write to them directly and mention that you suggested it. Could I ask their best email?",
      fuel: "Thank you, that's very helpful. I'll write to them directly and mention that you suggested it. Could I ask their best email?",
    },
    stage: 'replied', next: 'Put the new name in Owner and the person who referred you in Referred by. Then send V12', inDays: 1,
  },
  {
    key: 'admin_email', who: 'admin', said: '“Send us an email”',
    reply: {
      kinetic: "Of course. What's the best email to send it to, and who should I address it to?",
      fuel: "Of course. What's the best email to send it to, and who should I address it to?",
    },
    stage: 'replied', next: 'Put the email in Contact, then send the first message by EMAIL', inDays: 1,
  },
  {
    key: 'deck_yes', who: 'either', said: '“Yes, send the deck”',
    reply: {
      kinetic: 'Here it is, thank you:\nhttps://studio.theoperatorplaybook.com/recup/deck\n\nThe short version: one class, one drink each, no event fee for your studio. Which class is your busiest each week?',
      fuel: 'Here it is, thank you:\nhttps://studio.theoperatorplaybook.com/recup/deck\n\nThe short version: one class, one drink each, no event fee for your studio. Which class is your busiest each week?',
    },
    stage: 'replied', next: 'The deck link is in the reply. Then get a class and a date', inDays: 2,
  },
  {
    key: 'owner_yes', who: 'owner', said: 'Interested / “tell me more”',
    reply: {
      kinetic: "Great to hear from you, {name}. I'm happy to come to you. Does Tuesday or Wednesday suit you for 15 minutes?",
      fuel: "Great to hear from you, {name}. I'm happy to come to you. Does Tuesday or Wednesday suit you for 15 minutes?",
    },
    stage: 'replied', next: 'They pick a time → tap MARK CALL BOOKED. Then listen first, no pitch', inDays: 1,
  },
  {
    key: 'owner_price', who: 'owner', said: '“How much is it?”',
    reply: {
      kinetic: "Fair question. It depends on how your studio runs, so I'd rather not guess. After 15 minutes on your setup, I'll send clear numbers in writing. Does Tuesday or Wednesday suit you?",
      // No event fee for the studio; members pay RM18 per cup (founder, 21 Oct 2026).
      fuel: 'Fair question. There is no event fee for the studio. Members pay RM18 per cup, and we bring everything. Which class and date suit you best?',
    },
    stage: 'replied', next: 'Book the 15 minutes (Kinetic) or the pop-up date (Fuel)', inDays: 2,
  },
  {
    key: 'not_now', who: 'either', said: '“Not interested” / “not now”',
    reply: {
      kinetic: 'Understood, and thanks for the honest answer. Would it be all right if I check back in three months?',
      fuel: 'Understood, and thanks for the honest answer. Would it be all right if I check back in three months?',
    },
    stage: 'no', next: 'Check back in three months with something new (a result, a case study)', inDays: 65,
  },
];

export const WHO_LABEL: Record<ReplyGate['who'], string> = {
  admin: 'Front desk / admin replied',
  owner: 'Owner / decision-maker replied',
  either: 'Either',
};

// yyyy-mm-dd (Malaysia) n working days from now.
export function addWorkingDays(n: number, now = Date.now()) {
  let d = Math.floor((now + 8 * 3_600_000) / DAY) * DAY;
  let left = n;
  while (left > 0) {
    d += DAY;
    const wd = new Date(d).getUTCDay();
    if (wd !== 0 && wd !== 6) left--;
  }
  return new Date(d).toISOString().slice(0, 10);
}

export function gateReply(gate: ReplyGate, road: Road, t: Pick<Target, 'studio' | 'owner_name' | 'fit_note'>, now = Date.now()) {
  const day = new Date(`${addWorkingDays(gate.inDays, now)}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' });
  return fillMessage(gate.reply[road].replaceAll('{day}', day), t).replace(/^Great to hear from you, there\./, 'Great to hear from you.');
}

// Working days (Mon–Fri, Malaysia time) between two moments.
// Counts calendar dates, so a follow-up due "Friday" is due from Friday's first minute.
export function workingDaysSince(iso: string, now = Date.now()) {
  const myMidnight = (ms: number) => Math.floor((ms + 8 * 3_600_000) / DAY) * DAY;
  const today = myMidnight(now);
  let n = 0;
  for (let d = myMidnight(new Date(iso).getTime()) + DAY; d <= today; d += DAY) {
    const wd = new Date(d).getUTCDay();
    if (wd !== 0 && wd !== 6) n++;
  }
  return n;
}

// The no-reply ladder (SYS-P058 ends with the physical drop, so the visit comes last):
// message → 3 working days → follow-up with a gift → 3 working days → call → visit and drop the Executive Dossier.
export type MoveKey = 'followup' | 'call' | 'visit';
export const MOVE_LABEL: Record<MoveKey, string> = {
  followup: 'Follow up with a gift',
  call: 'Call them',
  visit: 'Visit: drop the Executive Dossier',
};
export type Move = { key: MoveKey | 'wait'; label: string; due: boolean; inDays: number };

export function nextMove(t: Target, events: OutreachEvent[], now = Date.now()): Move | null {
  if (t.stage !== 'messaged') return null;
  const last = (k: OutreachEvent['kind']) =>
    events.filter((e) => e.target_id === t.id && e.kind === k).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const step = (key: MoveKey, since: string | undefined, wait: number): Move => {
    const inDays = since ? Math.max(0, wait - workingDaysSince(since, now)) : 0;
    return { key, label: MOVE_LABEL[key], due: inDays === 0, inDays };
  };
  if (last('visit')) return { key: 'wait', label: 'Ladder done. Log their reply, or mark Not now', due: false, inDays: 0 };
  const call = last('call');
  if (call) return step('visit', call.created_at, 0); // the call books the visit
  const follow = last('followup');
  if (follow) return step('call', follow.created_at, WAIT_WORKING_DAYS);
  return step('followup', t.stage_at.messaged ?? t.last_touch_at ?? undefined, WAIT_WORKING_DAYS);
}

export function dueMoves(targets: Target[], events: OutreachEvent[], now = Date.now()) {
  return targets
    .map((t) => ({ t, move: nextMove(t, events, now) }))
    .filter((x): x is { t: Target; move: Move } => Boolean(x.move?.due));
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

// Every message ends on one ask that is easy to answer: a yes, a name, a day or a class.
// The sign-off ("Thanks, Joey") is ignored; the line before it must be the ask.
export function ctaCheck(text: string) {
  const body = text.replace(/^subject:[^\n]*\n+/i, '').replace(/\n+(thanks|cheers|best|regards)[^\n]*(\n[^\n]*){1,3}\s*$/i, '').trim();
  const lastLine = body.split(/\n+/).filter(Boolean).pop() ?? '';
  const pass = /\?\s*$/.test(lastLine) || /^reply\b/i.test(lastLine) || /\?[^.?!]*\.\s*$/.test(lastLine);
  return { pass, lastLine };
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

export function buildPhases(allTargets: Target[], allVariants: Variant[], allEvents: OutreachEvent[], road: Road = 'kinetic'): Phase[] {
  const targets = allTargets.filter((t) => roadOf(t) === road);
  const ids = new Set(targets.map((t) => t.id));
  const variants = allVariants.filter((v) => roadOf(v) === road);
  const vids = new Set(variants.map((v) => v.id));
  const events = allEvents.filter((e) => (e.target_id ? ids.has(e.target_id) : !e.variant_id || vids.has(e.variant_id)));
  const f = funnel(targets);
  const live = variants.filter((v) => v.status !== 'retired');
  const cleanMsg = live.find((v) => plainCheck(v.body).pass);
  const overdue = dueMoves(targets, events).map((x) => x.t);
  const followupsSent = events.filter((e) => e.kind === 'followup').length;
  const unsent = targets.filter((t) => t.stage === 'found').length;
  const firstCall = firstAt(targets, 'call_booked');
  const heard = targets.find((t) => reached(t, 'call_held') && t.friction.trim());
  const firstPlan = firstAt(targets, 'plan_sent');
  const firstSign = firstAt(targets, 'signed');
  const lessons = events.filter((e) => e.kind === 'lesson').length;

  if (road === 'fuel') {
    const bridged = targets.find((t) => reached(t, 'signed') && allTargets.some((k) => roadOf(k) === 'kinetic' && k.studio === t.studio));
    return [
      {
        id: 1, rank: 'E', title: 'Find & say hello', plain: 'Pick studios whose members train hard. Lead with what is happening now (the haze). One small ask: a one-day pop-up.',
        refs: 'SYS-P058 (movement → fuel bridge) · P-015 · Primacy Doctrine (3-line rule)',
        steps: [
          { label: 'RECUP.STN page live (what they can look up)', done: true, proof: 'Live on GitHub Pages', href: 'https://joeycoachie.github.io/recup-station-/' },
          { label: 'A first message that passes the plain-language check', done: Boolean(cleanMsg), proof: cleanMsg ? `${cleanMsg.code} passes SYS-D028 · ${live.length} message(s) in test` : 'Add a Fuel message below' },
          { label: '10 studios on the list', done: f.found >= 10, proof: `${f.found} / 10 on the list` },
          { label: 'Every studio on the list has been messaged', done: f.found > 0 && unsent === 0, proof: f.found ? `${f.messaged} messaged · ${unsent} waiting` : 'List is empty' },
          { label: `Nobody left hanging (follow-up, call, visit: ${WAIT_WORKING_DAYS} working days apart)`, done: (followupsSent > 0 || f.replied > 0) && overdue.length === 0, proof: overdue.length ? `${overdue.length} due now: ${overdue.slice(0, 3).map((t) => t.studio).join(', ')}` : `${followupsSent} follow-up(s) sent · ${f.replied} replied` },
        ],
      },
      {
        id: 2, rank: 'C', title: 'Listen', plain: 'Ask what their members need after training and what the venue allows. Don’t steer every answer to a drink.',
        refs: 'UEF Track 1 · T-027 Architect’s Review Diagnostic · P-041',
        steps: [
          { label: 'A chat booked (or a visit)', done: Boolean(firstCall), proof: firstCall ? `${firstCall.studio} · ${fmtDate(firstCall.stage_at.call_booked)}` : `${f.replied} replied so far` },
          { label: 'Chat held, what their members need written in their words', done: Boolean(heard), proof: heard ? `${heard.studio}: “${heard.friction.slice(0, 60)}${heard.friction.length > 60 ? '…' : ''}”` : 'Write what they said under the studio' },
          { label: 'One lesson written from what we heard', done: lessons > 0, proof: `${lessons} lesson(s) logged` },
        ],
      },
      {
        id: 3, rank: 'B', title: 'Plan', plain: 'Send a one-page pop-up plan: date, space, who does what, and what we will count.',
        refs: 'D-009 Clarity vs. Momentum · T-029 Architectural Brief',
        steps: [
          { label: 'Pop-up plan sent', done: Boolean(firstPlan), proof: firstPlan ? `${firstPlan.studio} · ${fmtDate(firstPlan.stage_at.plan_sent)}` : 'None yet' },
        ],
      },
      {
        id: 4, rank: 'S+', title: 'Start', plain: 'Run the pop-up, share the numbers with the owner, then open the studio conversation on the Kinetic road.',
        refs: 'SYS-D023 Triad · /studio Recovery Bar add-on',
        steps: [
          { label: 'Pop-up held', done: Boolean(firstSign), proof: firstSign ? `${firstSign.studio} · ${fmtDate(firstSign.stage_at.signed)}` : 'None yet' },
          { label: 'Studio conversation opened (moved onto the Kinetic road)', done: Boolean(bridged), proof: bridged ? `${bridged.studio} is on the Kinetic road` : 'After a pop-up, tap OPEN KINETIC ROAD on that studio' },
        ],
      },
    ];
  }

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
        { label: `Nobody left hanging (follow-up, call, visit: ${WAIT_WORKING_DAYS} working days apart)`, done: (followupsSent > 0 || f.replied > 0) && overdue.length === 0, proof: overdue.length ? `${overdue.length} due now: ${overdue.slice(0, 3).map((t) => t.studio).join(', ')}` : `${followupsSent} follow-up(s) sent · ${f.replied} replied` },
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
    events.filter((e) => ['followup', 'call', 'visit'].includes(e.kind) || (e.kind === 'stage' && e.stage === 'messaged')).map((e) => myDay(new Date(e.created_at))),
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
  const due = dueMoves(targets, events, now.getTime());
  const unsent = targets.filter((t) => t.stage === 'found');
  const dueToday = targets.filter((t) => t.next_date && t.next_date <= new Date(now.getTime() + 8 * 3_600_000).toISOString().slice(0, 10) && t.stage !== 'signed' && t.stage !== 'no');
  const weekAgo = now.getTime() - 7 * DAY;
  const thisWeek = events.filter((e) => new Date(e.created_at).getTime() >= weekAgo);
  const wk = (s: Stage) => thisWeek.filter((e) => e.kind === 'stage' && e.stage === s).length;
  const isFriday = new Date(now.getTime() + 8 * 3_600_000).getUTCDay() === 5;
  const best = variantScores(variants, targets).filter((s) => s.enough).sort((a, b) => b.rate - a.rate)[0];

  const lines: string[] = [];
  if (isFriday) {
    lines.push(`This week: ${wk('messaged')} sent · ${thisWeek.filter((e) => e.kind === 'followup').length} follow-ups · ${thisWeek.filter((e) => e.kind === 'call').length} cold calls · ${thisWeek.filter((e) => e.kind === 'visit').length} visits · ${wk('replied')} replies · ${wk('call_held')} calls · ${wk('plan_sent')} plans · ${wk('signed')} signed`);
    for (const r of ROADS) {
      const g = funnel(targets.filter((t) => roadOf(t) === r));
      if (g.found) lines.push(`${ROAD_INFO[r].name}: ${g.found} found → ${g.messaged} sent → ${g.replied} replied → ${g.calls} talks → ${g.plans} plans → ${g.signed} ${r === 'fuel' ? 'pop-ups' : 'signed'}`);
    }
    lines.push(best ? `Best message: ${best.variant.code} (${best.replied}/${best.sent} replied)` : 'No message has 5 sends yet, too early to pick a winner');
  }
  for (const k of ['followup', 'call', 'visit'] as const) {
    const hits = due.filter((x) => x.move.key === k);
    if (hits.length) lines.push(`${MOVE_LABEL[k]}: ${hits.map((x) => x.t.studio).join(', ')}`);
  }
  if (dueToday.length) lines.push(`Due: ${dueToday.map((t) => `${t.studio} (${t.next_step || 'next step'})`).join(', ')}`);
  if (unsent.length) lines.push(`${unsent.length} studio(s) found but not messaged`);
  if (!targets.length) lines.push('The list is empty. Add 10 studios that fit.');
  if (!lines.length) lines.push(`Nothing due. Streak: ${sendStreak(events, now)} day(s). Protect "messages sent".`);

  const title = isFriday ? 'Outreach · Friday report' : 'Outreach · today';
  return { title, body: lines.join('\n'), worthSending: isFriday || due.length > 0 || dueToday.length > 0 || unsent.length > 0 || !targets.length };
}
