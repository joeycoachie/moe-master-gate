// npm run gate -- "Your caption or DM text"
// Command-line version of the SYS-D028 gate check, for people and AI agents.
// Exits 2 on a never-say word, 1 on things to fix, 0 when the words pass.
import { loadLexicon } from './lib.mjs';

const text = process.argv.slice(2).join(' ').trim();
if (!text) { console.log('Usage: npm run gate -- "text to check"'); process.exit(1); }

const { entries } = loadLexicon();
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hits = [];
for (const l of entries) for (const m of l.match) {
  const re = new RegExp(`(^|[^a-z0-9])(${escape(m)})(?=$|[^a-z0-9])`, 'gi');
  if (re.test(text)) { hits.push(l); break; }
}
const bans = hits.filter(h => h.kind === 'ban');
const swaps = hits.filter(h => h.kind === 'swap');
const fixes = [];
bans.forEach(b => fixes.push(`STOP  "${b.term}" is never said. ${b.why}${b.say ? ` Use: ${b.say}.` : ''}`));
swaps.forEach(s => fixes.push(`FIX   "${s.term}" -> say "${s.say}". ${s.why}`));
text.split(/(?<=[.?!])\s+|\n+/).filter(Boolean).forEach(s => {
  const n = s.trim().split(/\s+/).length;
  if (n > 20) fixes.push(`FIX   Long sentence (${n} words). Split it: "${s.slice(0, 60)}${s.length > 60 ? '…' : ''}"`);
});
const punct = (text.match(/[!;—–]/g) || []).length;
if (punct) fixes.push(`FIX   ${punct} mark(s) outside periods and commas. Rule R8.`);
const nums = text.match(/\d+(\.\d+)?\s?%|\d{1,2}:\d{2}\s?(am|pm)?/gi) || [];
if (nums.length) fixes.push(`CHECK Numbers: ${nums.join(', ')}. Rule R4: show the source or remove them.`);

fixes.forEach(f => console.log(f));
if (bans.length) { console.log('\nVerdict: STOP. Do not send.'); process.exit(2); }
if (fixes.some(f => f.startsWith('FIX'))) { console.log('\nVerdict: FIX FIRST.'); process.exit(1); }
console.log((fixes.length ? '\n' : '') + 'Verdict: words pass. A person still checks G1 (7-year-old test), G2 (their problem first), G3 (one next step).');
