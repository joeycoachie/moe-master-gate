import { MESSAGE_LIBRARY, REPLY_GATES, WAIT_WORKING_DAYS, formatFor } from '@/lib/outreach';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { currentPartnerId } from '@/lib/teamSession';
import CopyButton from './CopyButton';
import SignOut from '../SignOut';

export const metadata = {
  title: 'RECUP.STN · Team Guide',
  robots: { index: false, follow: false },
};

// For ecosystem partners who do studio outreach with us. The messages and replies come straight
// from lib/outreach.ts (the Outreach Console's library), so this page never drifts from what Joey sends.
// Partners work the Fuel road only; the system conversation and its prices stay with Joey.
const OPENERS = ['V8', 'V5', 'V7', 'V9', 'V11'];
const STUDIO_GUIDE = 'https://studio.theoperatorplaybook.com/recup/guide';
const DECK = 'https://studio.theoperatorplaybook.com/recup/deck';

// Team members only: sign in with a team code (main gate or /recup/login).
async function signedInName(): Promise<string | null> {
  const id = await currentPartnerId();
  if (!id) return null;
  try {
    const { data } = await getSupabaseAdmin().from('recup_partners').select('full_name, active').eq('id', id).maybeSingle();
    return data?.active ? (data.full_name as string) : null;
  } catch {
    return null;
  }
}

export default async function RecupTeamGuide() {
  const name = await signedInName();
  if (!name) redirect('/recup/login');
  const openers = OPENERS.map((code) => MESSAGE_LIBRARY.find((m) => m.code === code)!).filter(Boolean);
  const gates = REPLY_GATES;

  return (
    <div className="wrap">
        <nav className="bar">
          <span>Signed in as {name.split(' ')[0]}</span>
          <Link href="/recup/log">My studios →</Link>
          <SignOut />
        </nav>

        <header className="stack">
          <p className="eyebrow">RECUP.STN · by The M.O.E. Group</p>
          <h1>Team Guide</h1>
          <p className="lede">For partners who reach out to studios with us. This is a guide, not a script. You know your studios and your people, so use your own judgement. When you are unsure, ask Joey.</p>
        </header>

        <div className="intent">
          <p className="eyebrow">Why we do this</p>
          <p>We help studios give members a recovery drink matched to how they trained. The owner gets the numbers after. We earn trust first. The bigger conversation comes later, and Joey leads it.</p>
        </div>

        <section className="stack">
          <h2>Who does what</h2>
          <div className="split">
            <div className="box"><h3>You</h3><ul><li>Find studios that fit</li><li>Send the first message</li><li>Follow up until they answer</li><li>Book the class and the date</li><li>Help on the tasting day</li></ul></div>
            <div className="box"><h3>Joey</h3><ul><li>The deck and its PDF</li><li>Every price and every deal</li><li>The studio system conversation</li><li>Anything you are not sure about</li></ul></div>
          </div>
        </section>

        <section className="stack">
          <h2>1 · Pick the first message</h2>
          <p className="note">Choose by the kind of studio. Fill in their name before you send. Email keeps the subject line, WhatsApp and Instagram don’t.</p>
          {openers.map((m) => {
            const email = formatFor('email', m.body);
            const id = `msg-${m.code}`;
            return (
              <article key={m.code} className="msg">
                <div className="msg-head">
                  <b>{m.angle}</b>
                  <CopyButton text={`Subject: ${email.subject}\n\n${email.text}`} targetId={id} />
                </div>
                <p className="use">Use when: {m.use_when}</p>
                <p className="subject">Subject: {email.subject}</p>
                <p className="body" id={id}>{email.text}</p>
              </article>
            );
          })}
        </section>

        <section className="stack">
          <h2>2 · Rules for every message</h2>
          <ul className="rules">
            <li>Your first name at the top, one clear ask at the end. A yes, a name, a day or a class.</li>
            <li>The studio pays nothing. Members pay a small price for the tasting. Never write “free tasting”.</li>
            <li>No brand names, no health promises, no famous names we have no deal with.</li>
            <li>Use our words: “the drink”, “recovery”, “check”. If a word feels like a sales or lab word, ask Joey first.</li>
            <li>One offer per message. Never mention the studio system or its prices. That is Joey’s conversation.</li>
          </ul>
        </section>

        <section className="stack">
          <h2>3 · When they reply</h2>
          <p className="note">Most first replies come from the front desk, not the owner. Your only job then is to reach the person who decides.</p>
          {gates.map((g) => {
            const reply = g.reply.fuel;
            const id = `gate-${g.key}`;
            return (
              <article key={g.key} className="msg">
                <div className="msg-head">
                  <b>They say: {g.said}</b>
                  <CopyButton text={reply} targetId={id} />
                </div>
                <p className="body" id={id}>{reply}</p>
                <p className="use">Then: {g.next}</p>
              </article>
            );
          })}
        </section>

        <section className="stack">
          <h2>4 · When they don’t reply</h2>
          <ol className="ladder">
            <li><b>Day 0</b><span>Send the first message.</span></li>
            <li><b>+{WAIT_WORKING_DAYS} working days</b><span>Follow up with a gift: an invite to see the full menu at RECUP.STN HQ.</span></li>
            <li><b>+{WAIT_WORKING_DAYS} more</b><span>Call them. The call is to book a visit.</span></li>
            <li><b>Then</b><span>Visit and leave our deck in person. After that, stop and tell Joey.</span></li>
          </ol>
          <p className="note">Weekends don’t count. Email on Tuesday, the gift goes on Friday.</p>
        </section>

        <section className="stack">
          <h2>5 · When they say yes</h2>
          <div className="split">
            <div className="box"><h3>Send them</h3><ul><li>The deck link below</li><li>The Studio Guide link below</li></ul></div>
            <div className="box"><h3>Get from them</h3><ul><li>Which class</li><li>Which date</li><li>Who we call on the day</li><li>Their rules on food, drink and space</li></ul></div>
          </div>
          <div className="linkrow">
            <span className="link" id="deck-link">{DECK}</span>
            <CopyButton text={DECK} targetId="deck-link" />
          </div>
          <div className="linkrow">
            <span className="link" id="studio-guide">{STUDIO_GUIDE}</span>
            <CopyButton text={STUDIO_GUIDE} targetId="studio-guide" />
          </div>
        </section>

        <section className="stack">
          <h2>6 · Before the tasting day</h2>
          <ul className="rules">
            <li>Everyone who pours has food handler training and the typhoid jab.</li>
            <li>Joey sends the check-in link with the studio’s name on it. Members tick a box to agree before anything is saved.</li>
            <li>Agree with the studio what we will count: who checked in, what they chose, who wants more.</li>
            <li>The check-in is not a medical test. Members with health conditions see their doctor first.</li>
          </ul>
        </section>

        <section className="stack">
          <h2>7 · Think before every message</h2>
          <div className="lenses">
            <div><b>What do they need?</b><span>Strip our words away. A hotel needs members to renew, not a drink.</span></div>
            <div><b>What will they say in 90 days?</b><span>Write the result first, then the message.</span></div>
            <div><b>Is the first yes small?</b><span>One class, one date. Easy to say yes to, easy to undo.</span></div>
            <div><b>Will it work without us?</b><span>Every tasting should leave numbers that sell the next one.</span></div>
            <div><b>Small risk, big upside?</b><span>A morning of our time against a studio that stays for years.</span></div>
          </div>
        </section>

        <section className="stack">
          <h2>8 · Log it, and ask when unsure</h2>
          <p>Add a studio in My studios before you message it. If someone already has it, you will be told, so no studio hears from us twice. After each touch, tap what happened. Joey sees every log.</p>
          <p>You are a partner, Joey is the founder. Questions, prices, or anything that feels off: message him.</p>
          <Link href="/recup/log" className="btn" style={{ alignSelf: 'flex-start', textDecoration: 'none' }}>Open my studios</Link>
          <div className="contact">
            <div className="stack" style={{ gap: 2 }}>
              <b>Joey</b>
              <span className="note">Architect of human performance ecosystems</span>
            </div>
            <span className="num" id="joey-wa">+60 10-231 9893</span>
            <CopyButton text="+60 10-231 9893" targetId="joey-wa" />
          </div>
        </section>
    </div>
  );
}
