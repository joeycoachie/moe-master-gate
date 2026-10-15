// Copies the CLIENT-FACING layer of the MET Product Academy directory (Sovereign Fuel OS)
// into lib/fuelCatalog.json for the client portal. The Architect layer (wolf/shepherd
// scripts, objections, clinical doses, deploy logic) is never copied.
// Usage: node scripts/sync-fuel-catalog.mjs [path to moe_product_academy/index.html]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';

const src = process.argv[2] || path.join(os.homedir(), 'Desktop/MET-PRODUCT-DIRECTORY/moe_product_academy/index.html');
const html = fs.readFileSync(src, 'utf8');
const start = html.search(/const\s+db\s*=\s*\{/);
if (start === -1) throw new Error('Product directory (const db = {...}) not found');
let i = html.indexOf('{', start), depth = 0, inStr = null;
for (let j = i; j < html.length; j++) {
  const c = html[j], prev = html[j - 1];
  if (inStr) { if (c === inStr && prev !== '\\') inStr = null; continue; }
  if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
  if (c === '{') depth++;
  if (c === '}' && --depth === 0) { var end = j + 1; break; }
}
const db = vm.runInNewContext('(' + html.slice(i, end) + ')');

const catalog = {};
for (const [key, e] of Object.entries(db)) {
  if (!e || !e.client || !e.title) continue;
  const { desc, benefits, usage } = e.client;
  if (!desc) continue;
  catalog[key] = { title: e.title, group: e.group || '', tag: e.tag || '', desc, benefits: benefits || [], usage: usage || '' };
}
const out = { source: 'MET Product Academy (Sovereign Fuel OS) · client layer only', synced: new Date().toISOString().slice(0, 10), products: catalog };
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'lib', 'fuelCatalog.json'), JSON.stringify(out, null, 2) + '\n');
console.log(Object.keys(catalog).length + ' products:', Object.keys(catalog).join(', '));
