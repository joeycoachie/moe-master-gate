// npm run gaps -- "how do I write a caption"
// Reference version of the gap finder the automated backend should run.
// Given a goal in plain words: find the best entry, then show what to learn first,
// the tools it needs, what comes next, and the rules and blind spots nobody would know to ask about.
import { loadArchive } from './lib.mjs';

const goal = process.argv.slice(2).join(' ').trim();
if (!goal) { console.log('Usage: npm run gaps -- "your goal in plain words"'); process.exit(1); }

const { entries, byId, incoming } = loadArchive();
const STOP = new Set('a an the and or to of in on for with is are do does how what which who why can i we our my you your this that it be want need should'.split(' '));
const words = goal.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));

function score(e) {
  const fields = [
    [e.answers?.join(' '), 5],
    [e.concepts?.join(' ').replace(/-/g, ' '), 4],
    [e.components?.map(c => `${c.name} ${c.answers || ''}`).join(' '), 3],
    [e.name, 3],
    [e.desc, 1],
  ];
  let s = 0;
  for (const w of words) for (const [text, weight] of fields) if (text && text.toLowerCase().includes(w)) s += weight;
  return s;
}

const ranked = entries.map(e => [score(e), e]).filter(([s]) => s > 0).sort((a, b) => b[0] - a[0]);
if (!ranked.length) { console.log(`Nothing in the Armory matches "${goal}" yet. That is itself a gap worth filing.`); process.exit(0); }

const top = ranked[0][1];
const label = id => byId.has(id) ? `${id}  ${byId.get(id).name}` : `${id}  (not filed)`;
const out = (rel) => (top.edges || []).filter(e => e.rel === rel);
const inn = (rel) => (incoming.get(top.id) || []).filter(e => e.rel === rel);

// Walk "requires" back to the root, deepest first.
function chain(id, seen = new Set()) {
  if (seen.has(id)) return [];
  seen.add(id);
  const e = byId.get(id);
  const reqs = (e?.edges || []).filter(x => x.rel === 'requires').map(x => x.to);
  return reqs.flatMap(r => [...chain(r, seen), r]);
}
const learnFirst = [...new Set(chain(top.id))];

const section = (title, items) => {
  if (!items.length) return;
  console.log(`\n${title}`);
  items.forEach(i => console.log('  ' + i));
};

console.log(`Goal: ${goal}`);
console.log(`\nStart here: ${label(top.id)}`);
console.log('  ' + top.desc);
section('Learn first (in order):', learnFirst.map(label));
section('You will use:', out('uses').map(e => label(e.to)));
section('Then:', out('feeds').map(e => label(e.to)));
section('Rules you must follow:', inn('governs').map(e => `${label(e.from)}. ${e.why || ''}`));
section('Blind spots (overlaps and conflicts):', [...out('overlaps'), ...out('conflicts'), ...inn('overlaps').map(e => ({ ...e, to: e.from })), ...inn('conflicts').map(e => ({ ...e, to: e.from }))]
  .map(e => `${e.rel === 'conflicts' ? 'CONFLICT' : 'overlap '}  ${label(e.to)}. ${e.why || ''}`));
section('Replaced by:', inn('supersedes').map(e => `${label(e.from)}. ${e.why || ''}`));
if (ranked.length > 1) section('Also related:', ranked.slice(1, 4).map(([, e]) => label(e.id)));
