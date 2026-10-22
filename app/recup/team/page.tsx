import { MESSAGE_LIBRARY, REPLY_GATES, WAIT_WORKING_DAYS, formatFor } from '@/lib/outreach';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { currentPartnerId } from '@/lib/teamSession';
import CopyButton from './CopyButton';
import zh from '@/sales/i18n/team-zh.json';
import ms from '@/sales/i18n/team-ms.json';
import fr from '@/sales/i18n/team-fr.json';
import SignOut from '../SignOut';

export const metadata = {
  title: 'RECUP.STN · Team Guide',
  robots: { index: false, follow: false },
};

// For ecosystem partners who do studio outreach with us. The messages and replies come straight
// from lib/outreach.ts (the Outreach Console's library), so this page never drifts from what the Architect sends.
// Partners work the Fuel road only; the system conversation and its prices stay with the Architect.
const OPENERS = ['V8', 'V5', 'V7', 'V9', 'V11'];

// Four languages, one page. Every line goes through t(); a missing translation falls back to English.
const TABLES: Record<string, Record<string, string>> = { zh, ms, fr };
const LANGS = [
  ['en', 'EN'],
  ['zh', '中文'],
  ['ms', 'BM'],
  ['fr', 'FR'],
] as const;
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

export default async function RecupTeamGuide({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const name = await signedInName();
  if (!name) redirect('/recup/login');
  const { lang: rawLang } = await searchParams;
  const lang = rawLang && TABLES[rawLang] ? rawLang : 'en';
  const table = TABLES[lang] ?? {};
  const t = (english: string) => table[english] || english;
  const q = lang === 'en' ? '' : `?lang=${lang}`;
  const copyLabels = { copy: t('Copy'), copied: t('Copied'), selected: t('Selected, press copy') };
  const deck = DECK + q;
  const guide = STUDIO_GUIDE + q;
  // Partners send as themselves: the library's messages are signed by the founder, so swap in this partner's name.
  const me = name.split(' ')[0];
  const asMe = (text: string) => text.replace(/\bJoey\b/g, me);
  const openers = OPENERS.map((code) => MESSAGE_LIBRARY.find((m) => m.code === code)!).filter(Boolean);
  // The referral email introduces the sender as founder, so partners get a note instead (rule in section 2).
  const gates = REPLY_GATES.filter((g) => g.key !== 'admin_referred');
  const followUps = ['V13', 'V14'].map((code) => MESSAGE_LIBRARY.find((m) => m.code === code)!).filter(Boolean);

  return (
    <div className="wrap">
        <nav className="bar">
          <span>{t('Signed in as')} {name.split(' ')[0]}</span>
          <Link href={`/recup/log${q}`}>{t('My studios →')}</Link>
          <SignOut label={t('Sign out')} />
          <span className="langs">
            {LANGS.map(([code, label]) => (code === lang ? <b key={code}>{label}</b> : <Link key={code} href={code === 'en' ? '/recup/team' : `/recup/team?lang=${code}`}>{label}</Link>))}
          </span>
        </nav>

        <header className="stack">
          <p className="eyebrow">{t('RECUP.STN · by The M.O.E. Group')}</p>
          <h1>{t('Team Guide')}</h1>
          <p className="lede">{t('For partners who reach out to studios with us. This is a guide, not a script. You know your studios and your people, so use your own judgement. When you are unsure, ask the Architect.')}</p>
        </header>

        <div className="intent">
          <p className="eyebrow">{t('Why we do this')}</p>
          <p>{t('We help studios give members a recovery drink matched to how they trained. The owner gets the numbers after. We earn trust first. The bigger conversation comes later, and the Architect leads it.')}</p>
        </div>

        <section className="stack">
          <h2>{t('Your kit')}</h2>
          <p className="note">{t('What studios get from us. Open them once so you know what they will read.')}</p>
          <div className="linkrow">
            <span className="stack" style={{ gap: 0, minWidth: 0 }}><b>{t('Studio deck · 13 slides')}</b><span className="link" id="kit-deck">{deck}</span></span>
            <a className="btn" href={deck} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>{t('Open')}</a>
            <CopyButton text={deck} targetId="kit-deck" labels={copyLabels} />
          </div>
          <div className="linkrow">
            <span className="stack" style={{ gap: 0, minWidth: 0 }}><b>{t('Studio guide · one page')}</b><span className="link" id="kit-guide">{guide}</span></span>
            <a className="btn" href={guide} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>{t('Open')}</a>
            <CopyButton text={guide} targetId="kit-guide" labels={copyLabels} />
          </div>
        </section>

        <section className="stack">
          <h2>{t('Who does what')}</h2>
          <div className="split">
            <div className="box"><h3>{t('You')}</h3><ul><li>{t('Find studios that fit')}</li><li>{t('Send the first message')}</li><li>{t('Follow up until they answer')}</li><li>{t('Book the class and the date')}</li><li>{t('Help on the tasting day')}</li></ul></div>
            <div className="box"><h3>{t('The Architect')}</h3><ul><li>{t('The deck')}</li><li>{t('Every price and every deal')}</li><li>{t('The studio system conversation')}</li><li>{t('Anything you are not sure about')}</li></ul></div>
          </div>
        </section>

        <section className="stack">
          <h2>{t('1 · Pick the first message')}</h2>
          <p className="note">{t('Choose by the kind of studio. Fill in their name before you send. Email keeps the subject line, WhatsApp and Instagram don’t.')}</p>
          {openers.map((m) => {
            const email = formatFor('email', asMe(t(m.body)));
            const id = `msg-${m.code}`;
            return (
              <article key={m.code} className="msg">
                <div className="msg-head">
                  <b>{t(m.angle)}</b>
                  <CopyButton text={`${t('Subject:')} ${email.subject}\n\n${email.text}`} targetId={id} labels={copyLabels} />
                </div>
                <p className="use">{t('Use when:')} {t(m.use_when)}</p>
                <p className="subject">{t('Subject:')} {email.subject}</p>
                <p className="body" id={id}>{email.text}</p>
              </article>
            );
          })}
        </section>

        <section className="stack">
          <h2>{t('2 · Rules for every message')}</h2>
          <ul className="rules">
            <li>{t('Your first name at the top, one clear ask at the end. A yes, a name, a day or a class.')}</li>
            <li>{t('No event fee for the studio. Members pay RM18 per cup. Never write “free tasting”.')}</li>
            <li>{t('No brand names, no health promises, no famous names we have no deal with.')}</li>
            <li>{t('Use our words: “the drink”, “recovery”, “check”. If a word feels like a sales or lab word, ask the Architect first.')}</li>
            <li>{t('One offer per message. Never mention the studio system or its prices. That is the Architect’s conversation.')}</li>
            <li>{t('If they name someone else to contact, write both names in your notes in My studios. Then message the Architect before you write to the new person.')}</li>
          </ul>
        </section>

        <section className="stack">
          <h2>{t('3 · When they reply')}</h2>
          <p className="note">{t('Most first replies come from the front desk, not the owner. Your only job then is to reach the person who decides.')}</p>
          {gates.map((g) => {
            const reply = asMe(t(g.reply.fuel));
            const id = `gate-${g.key}`;
            return (
              <article key={g.key} className="msg">
                <div className="msg-head">
                  <b>{t('They say:')} {t(g.said)}</b>
                  <CopyButton text={reply} targetId={id} labels={copyLabels} />
                </div>
                <p className="body" id={id}>{reply}</p>
                <p className="use">{t('Then:')} {t(g.next)}</p>
              </article>
            );
          })}
        </section>

        <section className="stack">
          <h2>{t('4 · When they don’t reply')}</h2>
          <ol className="ladder">
            <li><b>{t('Day 0')}</b><span>{t('Send the first message.')}</span></li>
            <li><b>+{WAIT_WORKING_DAYS} {t('working days')}</b><span>{t('Follow up with a gift: an invite to see the full menu at RECUP.STN HQ.')}</span></li>
            <li><b>+{WAIT_WORKING_DAYS} {t('more')}</b><span>{t('Call them. The call is to book a visit.')}</span></li>
            <li><b>{t('Then')}</b><span>{t('Visit and leave our deck in person. After that, stop and tell the Architect.')}</span></li>
          </ol>
          <p className="note">{t('Weekends don’t count. Email on Tuesday, the gift goes on Friday.')}</p>
          {followUps.map((m) => {
            const email = formatFor('email', asMe(t(m.body)));
            const id = `msg-${m.code}`;
            return (
              <article key={m.code} className="msg">
                <div className="msg-head">
                  <b>{t(m.angle)}</b>
                  <CopyButton text={m.code === 'V14' ? email.text : `${t('Subject:')} ${email.subject}\n\n${email.text}`} targetId={id} labels={copyLabels} />
                </div>
                <p className="use">{t('Use when:')} {t(m.use_when)}</p>
                {m.code !== 'V14' && <p className="subject">{t('Subject:')} {email.subject}</p>}
                <p className="body" id={id}>{email.text}</p>
              </article>
            );
          })}
        </section>

        <section className="stack">
          <h2>{t('5 · When they say yes')}</h2>
          <div className="split">
            <div className="box"><h3>{t('Send them')}</h3><ul><li>{t('The deck link below')}</li><li>{t('The Studio Guide link below')}</li></ul></div>
            <div className="box"><h3>{t('Get from them')}</h3><ul><li>{t('Which class')}</li><li>{t('Which date')}</li><li>{t('Who we call on the day')}</li><li>{t('Their rules on food, drink and space')}</li></ul></div>
          </div>
          <div className="linkrow">
            <span className="link" id="deck-link">{deck}</span>
            <CopyButton text={deck} targetId="deck-link" labels={copyLabels} />
          </div>
          <div className="linkrow">
            <span className="link" id="studio-guide">{guide}</span>
            <CopyButton text={guide} targetId="studio-guide" labels={copyLabels} />
          </div>
        </section>

        <section className="stack">
          <h2>{t('6 · Before the tasting day')}</h2>
          <ul className="rules">
            <li>{t('Everyone who pours has food handler training and the typhoid jab.')}</li>
            <li>{t('The Architect sends the check-in link with the studio’s name on it. Members tick a box to agree before anything is saved.')}</li>
            <li>{t('Agree with the studio what we will count: who checked in, what they chose, who wants more.')}</li>
            <li>{t('The check-in is not a medical test. Members with health conditions see their doctor first.')}</li>
          </ul>
        </section>

        <section className="stack">
          <h2>{t('7 · Think before every message')}</h2>
          <div className="lenses">
            <div><b>{t('What do they need?')}</b><span>{t('Strip our words away. A hotel needs members to renew, not a drink.')}</span></div>
            <div><b>{t('What will they say in 90 days?')}</b><span>{t('Write the result first, then the message.')}</span></div>
            <div><b>{t('Is the first yes small?')}</b><span>{t('One class, one date. Easy to say yes to, easy to undo.')}</span></div>
            <div><b>{t('Will it work without us?')}</b><span>{t('Every tasting should leave numbers that sell the next one.')}</span></div>
            <div><b>{t('Small risk, big upside?')}</b><span>{t('A morning of our time against a studio that stays for years.')}</span></div>
          </div>
        </section>

        <section className="stack">
          <h2>{t('8 · Log it, and ask when unsure')}</h2>
          <p>{t('Add a studio in My studios before you message it. If someone already has it, you will be told, so no studio hears from us twice. After each touch, tap what happened. The Architect sees every log.')}</p>
          <p>{t('You are a partner. The Architect is the founder. Questions, prices, or anything that feels off: message him.')}</p>
           <Link href={`/recup/log${q}`} className="btn" style={{ alignSelf: 'flex-start', textDecoration: 'none' }}>{t('Open my studios')}</Link>
          <div className="contact">
            <div className="stack" style={{ gap: 2 }}>
              <b>{t('The Architect')}</b>
              <span className="note">{t('Architect of human performance ecosystems')}</span>
            </div>
            <span className="num" id="joey-wa">+60 10-231 9893</span>
            <CopyButton text="+60 10-231 9893" targetId="joey-wa" labels={copyLabels} />
          </div>
        </section>
    </div>
  );
}
