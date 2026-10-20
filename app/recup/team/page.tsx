import { MESSAGE_LIBRARY, REPLY_GATES, WAIT_WORKING_DAYS, formatFor } from '@/lib/outreach';
import CopyButton from './CopyButton';

export const metadata = {
  title: 'RECUP.STN · Team Guide',
  robots: { index: false, follow: false },
};

// For ecosystem partners who do studio outreach with us. The messages and replies come straight
// from lib/outreach.ts (the Outreach Console's library), so this page never drifts from what Joey sends.
// Partners work the Fuel road only; the system conversation and its prices stay with Joey.
const OPENERS = ['V8', 'V5', 'V7', 'V9', 'V11'];
const STUDIO_GUIDE = 'https://studio.theoperatorplaybook.com/recup/guide';

export default function RecupTeamGuide() {
  const openers = OPENERS.map((code) => MESSAGE_LIBRARY.find((m) => m.code === code)!).filter(Boolean);
  const gates = REPLY_GATES;

  return (
    <main className="rt">
      <style>{CSS}</style>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Rubik:wght@400;500;700&display=swap" />
      <div className="wrap">
        <header className="stack">
          <p className="eyebrow">RECUP.STN · by The M.O.E. Group</p>
          <h1>Team Guide</h1>
          <p className="lede">For partners who reach out to studios with us. Read it once, then keep it open while you send.</p>
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
            <div className="box"><h3>Send them</h3><ul><li>The deck PDF (ask Joey for the latest)</li><li>The Studio Guide link below</li></ul></div>
            <div className="box"><h3>Get from them</h3><ul><li>Which class</li><li>Which date</li><li>Who we call on the day</li><li>Their rules on food, drink and space</li></ul></div>
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
          <h2>8 · Report back</h2>
          <p>After every touch, send Joey one WhatsApp: the studio, what happened, the next step and its date. He logs it in the system so nobody gets messaged twice.</p>
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
    </main>
  );
}

const CSS = `
.rt { --bg:#F6F0E7; --panel:#EADFD0; --panel-2:#F0E7DA; --fg:#221B17; --muted:#5A4D44; --accent:#B8482A; --accent-fg:#FBF4EC; --line:#DDCFBD;
  --display:'Oswald','Arial Narrow',Arial,sans-serif; --body:'Rubik',Arial,sans-serif;
  background:var(--bg); color:var(--fg); font:400 16px/1.6 var(--body); min-height:100vh;
  padding-left:max(16px, env(safe-area-inset-left, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)); }
@media (prefers-color-scheme: dark) { .rt { --bg:#1C1613; --panel:#2A221D; --panel-2:#241D19; --fg:#F3EBE1; --muted:#C9BBAB; --accent:#E07A55; --accent-fg:#1C1613; --line:#3A2F28; color-scheme:dark; } }
.rt .wrap { max-width:760px; margin:0 auto; padding-block:40px 64px; display:flex; flex-direction:column; gap:40px; }
.rt h1, .rt h2, .rt h3 { font-family:var(--display); font-weight:600; margin:0; text-wrap:balance; }
.rt h1 { font-size:clamp(34px, 7vw, 52px); line-height:1.05; }
.rt h2 { font-size:24px; line-height:1.2; }
.rt h3 { font-size:18px; }
.rt p { margin:0; }
.rt .stack { display:flex; flex-direction:column; gap:14px; min-width:0; }
.rt .eyebrow { font-family:var(--display); font-size:13px; letter-spacing:.18em; text-transform:uppercase; color:var(--accent); }
.rt .lede { font-size:18px; color:var(--muted); }
.rt .note { font-size:14px; color:var(--muted); }
.rt .intent { background:var(--accent); color:var(--accent-fg); padding:24px; border-radius:14px; display:flex; flex-direction:column; gap:10px; }
.rt .intent .eyebrow { color:var(--accent-fg); opacity:.85; }
.rt .intent p:last-child { font-size:18px; line-height:1.5; }
.rt .split { display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:12px; }
.rt .box { background:var(--panel-2); border:1px solid var(--line); border-radius:12px; padding:18px; display:flex; flex-direction:column; gap:8px; }
.rt .box ul, .rt .rules { margin:0; padding-left:18px; display:flex; flex-direction:column; gap:6px; }
.rt .msg { border-top:1px solid var(--line); padding-top:14px; display:flex; flex-direction:column; gap:6px; }
.rt .msg-head { display:flex; justify-content:space-between; align-items:center; gap:12px; }
.rt .use { font-size:14px; color:var(--accent); }
.rt .subject { font-size:14px; color:var(--muted); }
.rt .body { white-space:pre-wrap; background:var(--panel-2); border-radius:10px; padding:12px 14px; }
.rt .copy { font:500 13px var(--body); background:var(--fg); color:var(--bg); border:0; border-radius:999px; padding:6px 14px; cursor:pointer; flex:none; }
.rt .copy:focus-visible { outline:2px solid var(--accent); outline-offset:3px; }
.rt .ladder { list-style:none; margin:0; padding:0; }
.rt .ladder li { display:grid; grid-template-columns:150px 1fr; gap:12px; padding:10px 0; border-top:1px solid var(--line); }
.rt .ladder li:last-child { border-bottom:1px solid var(--line); }
.rt .ladder b { font-family:var(--display); font-weight:500; color:var(--accent); }
.rt .lenses { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; }
.rt .lenses div { background:var(--panel); border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:4px; }
.rt .lenses span { font-size:14px; color:var(--muted); }
.rt .linkrow, .rt .contact { display:flex; flex-wrap:wrap; gap:10px 16px; align-items:center; background:var(--panel); border-radius:12px; padding:14px 16px; }
.rt .link { font-size:14px; word-break:break-all; min-width:0; }
.rt .num { font-family:var(--display); font-size:22px; font-variant-numeric:tabular-nums; }
@media (max-width:480px) { .rt .ladder li { grid-template-columns:1fr; gap:2px; } }
`;
