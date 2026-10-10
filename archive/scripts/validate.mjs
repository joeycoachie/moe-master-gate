// npm run validate
// Keeps the Armory from turning into a dumpster. Exits 1 on any error so it can gate commits and deploys.
import { loadArchive, loadLexicon, readJSON } from './lib.mjs';

const errors = [];
const warnings = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);
const warn = (id, msg) => warnings.push(`${id}: ${msg}`);

const { schema, entries, byId } = loadArchive();
const RELS = Object.keys(schema.relations);
const STATUSES = ['live', 'draft', 'frozen', 'retired'];
const ID_RE = /^((SYS|KIN|MET)-)?(D|P|T|C|S)-?\d{3}(-[A-Z])?$/;

// IDs
const seen = new Map();
for (const e of entries) {
  if (!e.id) { err('(no id)', `entry in ${e._coll} has no id`); continue; }
  if (seen.has(e.id)) err(e.id, `duplicate ID (also in ${seen.get(e.id)})`);
  seen.set(e.id, e._coll);
  if (!ID_RE.test(e.id)) warn(e.id, 'ID does not follow the SYS-D020 pattern');
  if (!e.name) err(e.id, 'missing name');
  if (!e.desc) err(e.id, 'missing desc');
  if (e.status && !STATUSES.includes(e.status)) err(e.id, `status "${e.status}" is not one of ${STATUSES.join(', ')}`);
  if (e.layer && !/^L[0-3]-[IP]$/.test(e.layer)) err(e.id, `layer "${e.layer}" should look like L1-I or L3-P`);
  for (const c of e.concepts || []) if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c)) err(e.id, `concept "${c}" must be kebab-case`);

  // Edges
  const pairs = new Set();
  for (const edge of e.edges || []) {
    if (!RELS.includes(edge.rel)) err(e.id, `unknown relation "${edge.rel}" (allowed: ${RELS.join(', ')})`);
    if (!edge.to) { err(e.id, 'edge with no target'); continue; }
    if (edge.to === e.id) err(e.id, 'edge points to itself');
    if (!byId.has(edge.to)) err(e.id, `edge ${edge.rel} -> ${edge.to}, but ${edge.to} is not filed`);
    const key = edge.rel + '>' + edge.to;
    if (pairs.has(key)) err(e.id, `duplicate edge ${key}`);
    pairs.add(key);
    if (['overlaps', 'conflicts', 'supersedes'].includes(edge.rel) && !edge.why) err(e.id, `${edge.rel} -> ${edge.to} needs a "why"`);
  }

  // Anything marked classified must be fully classified.
  if (e.classified) {
    if (!(e.edges || []).length) err(e.id, 'marked classified but has no edges');
    if (!(e.answers || []).length) err(e.id, 'marked classified but has no answers');
    if (!e.status) err(e.id, 'marked classified but has no status');
    if (!e.layer) err(e.id, 'marked classified but has no layer');
  }
}

// Lexicon
const lex = loadLexicon();
const lexIds = new Set();
const matchOwner = new Map();
for (const l of lex.entries) {
  const id = `lexicon/${l.id}`;
  if (lexIds.has(l.id)) err(id, 'duplicate lexicon id');
  lexIds.add(l.id);
  if (!['swap', 'ban'].includes(l.kind)) err(id, `kind must be swap or ban, got "${l.kind}"`);
  if (l.kind === 'swap' && !l.say) err(id, 'swap needs a "say"');
  if (!Array.isArray(l.match) || !l.match.length) err(id, 'needs at least one match string');
  if (!['all', 'recup'].includes(l.scope)) err(id, `scope must be all or recup, got "${l.scope}"`);
  for (const m of l.match || []) {
    if (m !== m.toLowerCase()) err(id, `match "${m}" must be lowercase`);
    if (matchOwner.has(m)) warn(id, `match "${m}" is also claimed by lexicon/${matchOwner.get(m)}`);
    else matchOwner.set(m, l.id);
  }
}

// Proposals waiting
const proposals = readJSON('data/proposals.json').filter(p => p.status === 'pending');

// Report
const classified = entries.filter(e => e.classified);
const open = [];
for (const e of entries) for (const edge of e.edges || []) {
  if (edge.rel === 'overlaps' || edge.rel === 'conflicts') open.push(`${e.id} ${edge.rel} ${edge.to}. ${edge.why || ''}`);
}

console.log(`Armory: ${entries.length} entries, ${classified.length} fully classified, ${entries.length - classified.length} still flat.`);
console.log(`Lexicon: ${lex.entries.length} entries (v${lex.version}). Pending proposals: ${proposals.length}.`);
if (open.length) {
  console.log(`\nFounder decisions open (${open.length}):`);
  open.forEach(o => console.log('  - ' + o));
}
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.forEach(w => console.log('  ! ' + w));
}
if (errors.length) {
  console.log(`\nErrors (${errors.length}):`);
  errors.forEach(e => console.log('  x ' + e));
  process.exit(1);
}
console.log('\nValid.');
