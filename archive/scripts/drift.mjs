// npm run drift -- <snapshot-dir>  (one folder per artifact)
// Compares a snapshot of an old artifact database (Intelligence Archive or Plain Language Mandate) with data/.
// The snapshot is what an agent saves with ArtifactData list (out_dir): <dir>/<collection>/<id>.json and <dir>/meta/schema.json.
// Exits 1 if the artifact holds anything the repo does not, so nothing is lost before the artifact is retired.
import fs from 'node:fs';
import path from 'node:path';
import { loadArchive, readJSON, COLLECTIONS } from './lib.mjs';

const dir = process.argv[2];
if (!dir || !fs.existsSync(dir)) {
  console.error('Usage: npm run drift -- <snapshot-dir>');
  process.exit(2);
}

// Fields the move changed on purpose (HANDOVER section 3). Not drift.
const RENAMED = { ssot_url: 'source' };

const { schema, byId } = loadArchive();
const drift = [];
// The artifact database returns object keys sorted, so compare with keys sorted.
const sorted = v => Array.isArray(v) ? v.map(sorted)
  : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sorted(v[k])])) : v;
const same = (a, b) => JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));
// The Mandate artifact stored '—' for a ban word with nothing to say instead. The repo stores ''.
const empty = v => v == null || v === '' || v === '—' || (Array.isArray(v) && !v.length);

let read = 0;
for (const c of COLLECTIONS) {
  const cdir = path.join(dir, c);
  if (!fs.existsSync(cdir)) continue;
  for (const f of fs.readdirSync(cdir).filter(f => f.endsWith('.json'))) {
    const id = f.slice(0, -5);
    const live = JSON.parse(fs.readFileSync(path.join(cdir, f), 'utf8'));
    read++;
    const repo = byId.get(id);
    if (!repo) { drift.push(`${id}: in the artifact (${c}) but not in data/`); continue; }
    if (repo._coll !== c) drift.push(`${id}: in ${c} in the artifact, ${repo._coll} in data/`);
    for (const [k, v] of Object.entries(live)) {
      if (empty(v)) continue;
      if (RENAMED[k] && !empty(repo[RENAMED[k]])) continue;
      if (!same(v, repo[k])) drift.push(`${id}.${k}: artifact and data/ differ`);
    }
  }
}

const schemaFile = path.join(dir, 'meta', 'schema.json');
if (fs.existsSync(schemaFile)) {
  const live = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
  for (const k of Object.keys(live)) if (!same(live[k], schema[k])) drift.push(`meta/schema.${k}: artifact and data/schema.json differ`);
}

// Plain Language Mandate artifact: lexicon, proposals, audits, meta/state.
const readDir = c => {
  const cdir = path.join(dir, c);
  if (!fs.existsSync(cdir)) return null;
  return fs.readdirSync(cdir).filter(f => f.endsWith('.json'))
    .map(f => ({ id: f.slice(0, -5), ...JSON.parse(fs.readFileSync(path.join(cdir, f), 'utf8')) }));
};
const lexicon = readJSON('data/lexicon.json');
const liveLex = readDir('lexicon');
if (liveLex) {
  const repoLex = new Map(lexicon.entries.map(e => [e.id, e]));
  for (const e of liveLex) {
    read++;
    const r = repoLex.get(e.id);
    if (!r) { drift.push(`lexicon/${e.id}: in the artifact but not in data/lexicon.json`); continue; }
    for (const [k, v] of Object.entries(e)) if (!empty(v) && !same(v, r[k])) drift.push(`lexicon/${e.id}.${k}: artifact and data/lexicon.json differ`);
  }
}
for (const c of ['proposals', 'audits']) {
  const live = readDir(c);
  if (!live) continue;
  const repo = readJSON(`data/${c}.json`);
  const ids = new Set(repo.map(r => r.id));
  for (const e of live) { read++; if (!ids.has(e.id)) drift.push(`${c}/${e.id}: in the artifact but not in data/${c}.json`); }
}
const stateFile = path.join(dir, 'meta', 'state.json');
if (fs.existsSync(stateFile)) {
  const st = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  if (st.lexVersion !== lexicon.version) drift.push(`meta/state.lexVersion: artifact v${st.lexVersion}, data/lexicon.json v${lexicon.version}`);
}

console.log(`Artifact snapshot: ${read} records read from ${dir}.`);
if (drift.length) {
  console.log(`\nDrift (${drift.length}):`);
  for (const d of drift) console.log(`  - ${d}`);
  process.exit(1);
}
console.log('No drift. data/ holds everything the artifact holds.');
