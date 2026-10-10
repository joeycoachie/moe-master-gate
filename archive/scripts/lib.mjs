// Shared loader for the Armory data. No dependencies, Node 18+.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const COLLECTIONS = ['signals', 'protocols', 'tools', 'crucibles'];

export function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}

export function loadArchive() {
  const schema = readJSON('data/schema.json');
  const entries = [];
  for (const c of COLLECTIONS) {
    for (const e of readJSON(`data/archive/${c}.json`)) entries.push({ ...e, _coll: c });
  }
  const byId = new Map(entries.map(e => [e.id, e]));
  const incoming = new Map();
  for (const e of entries) {
    for (const edge of e.edges || []) {
      if (!incoming.has(edge.to)) incoming.set(edge.to, []);
      incoming.get(edge.to).push({ rel: edge.rel, from: e.id, why: edge.why });
    }
  }
  return { schema, entries, byId, incoming };
}

export function loadLexicon() {
  return readJSON('data/lexicon.json');
}
