// Builds BRAIN.md: one file any agent (Claude, Gemini/KA-Alex, ChatGPT) can be given so it
// works from the same source of truth. Built from the Archive, the hub ROADMAP and DECISIONS,
// and the SYS-D028 lexicon, never written by hand. Rebuild after any Archive or hub change:
//   node archive/scripts/brain.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { ROOT, loadArchive, loadLexicon } from './lib.mjs';

const HUB = path.join(ROOT, '..', 'hub');
const read = (p) => fs.readFileSync(p, 'utf8');
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }).format(new Date());
let commit = 'uncommitted';
try {
  commit = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
} catch {}

const { entries } = loadArchive();
const lexicon = loadLexicon();
const docs = fs.existsSync(path.join(ROOT, 'docs'))
  ? fs.readdirSync(path.join(ROOT, 'docs')).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')).sort()
  : [];
// Skeletons: stripped, fill-in versions of Archive items that can be used straight away.
// archive/skeletons/<key>.md (front matter + body) → data/skeletons.json for the Archive's dropdown.
const SKEL_DIR = path.join(ROOT, 'skeletons');
const skeletons = fs.existsSync(SKEL_DIR)
  ? fs.readdirSync(SKEL_DIR).filter((f) => f.endsWith('.md')).sort().map((f) => {
      const raw = read(path.join(SKEL_DIR, f));
      const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!m) throw new Error(`skeletons/${f}: missing front matter`);
      const meta = Object.fromEntries(m[1].split('\n').map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]));
      for (const k of ['key', 'id', 'title', 'use_when', 'status']) if (!meta[k]) throw new Error(`skeletons/${f}: missing ${k}`);
      if (!entries.some((e) => e.id === meta.id)) throw new Error(`skeletons/${f}: ${meta.id} is not in the Archive`);
      return { ...meta, body: m[2].trim() };
    })
  : [];
fs.writeFileSync(path.join(ROOT, 'data', 'skeletons.json'), JSON.stringify(skeletons, null, 2) + '\n');

const gates = [...read(path.join(ROOT, 'DECISION_GATES.md')).split('## Settled')[0].matchAll(/^### (G-\d+ · .+)$/gm)].map((m) => m[1]);

const oneLine = (s, n = 160) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};
const order = ['signals', 'protocols', 'tools', 'crucibles'];
const index = order
  .map((c) => {
    const rows = entries
      .filter((e) => e._coll === c)
      .map((e) => `- **${e.id}** ${e.name}${e.status ? ` [${e.status}]` : ''}${docs.includes(e.id) ? ' (full text)' : ''}: ${oneLine(e.desc)}`);
    return `### ${c[0].toUpperCase()}${c.slice(1)} (${rows.length})\n\n${rows.join('\n')}`;
  })
  .join('\n\n');

const bans = lexicon.entries.filter((e) => e.kind === 'ban').map((e) => `"${e.term}"`);
const swaps = lexicon.entries.filter((e) => e.kind === 'swap').map((e) => `"${e.term}" → "${e.say}"`);

const out = `# M.O.E. Brain Pack · ${today} · ${commit}

You are working for The M.O.E. Group (founder: Joey, "the Architect"). This pack is the single
source of truth. It is generated from the Intelligence Archive and the Founder Command hub.
If anything you were told before disagrees with this pack, this pack wins. If this pack is more
than 14 days old, ask the founder for a fresh one.

Rules for you:
1. Use only IDs that appear in the index below. Never invent a new ID. Propose new items to the
   founder in plain words, saying what they replace (Rule B).
2. A protocol counts only when it has been used in paid work (Rule A).
3. Anything a customer, studio owner or follower reads follows the Plain Language Mandate
   (SYS-D028): no jargon, sentences of 20 words or fewer, no "!" or ";", numbers need a source.
   Internal names (Wolf, Shepherd, Crucible, S-Rank) stay internal.
4. Health: no claims that a product or programme treats, heals or cures anything.
5. Full documents exist for: ${docs.join(', ') || 'none yet'}. Ask the founder to paste one if you need it.

---

## 1. Plain Language Mandate (SYS-D028) word list

Banned in public copy: ${bans.join(', ')}.

Swaps: ${swaps.join('; ')}.

---

## 2. Roadmap

${read(path.join(HUB, 'ROADMAP.md')).replace(/^# .*\n/, '')}

---

## 3. Settled decisions (do not re-ask)

${read(path.join(HUB, 'DECISIONS.md')).replace(/^# .*\n/, '')}

---

## 3b. How we think with high-value operators (HVO Playbook)

${read(path.join(HUB, 'HVO_PLAYBOOK.md')).replace(/^# .*\n/, '').replace(/^## /gm, '### ')}

---

## 4. Open decision gates (only the founder settles these)

${gates.map((g) => `- ${g}`).join('\n') || '- none'}

---

## 5. Ready-to-use templates (skeletons)

The founder copies these from the Archive (Use a template). Status "proposed" waits for the founder's yes.

${skeletons.map((k) => `- **${k.title}** (${k.id}, ${k.status}): ${k.use_when}`).join('\n')}

---

## 6. The Archive index (${entries.length} entries)

${index}
`;

fs.writeFileSync(path.join(ROOT, 'BRAIN.md'), out);
console.log(`BRAIN.md · ${today} · ${commit} · ${entries.length} entries · ${docs.length} full docs · ${skeletons.length} skeletons · ${out.length} chars`);
