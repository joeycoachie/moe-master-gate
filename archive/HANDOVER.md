# HANDOVER · M.O.E. Armory

Owner: Founder · Handover date: 5 Oct 2026 · Version 0.1.0

Read this before touching the repo. Anyone working on it (a person, a VS Code agent, GRAHAM, a contractor) follows this file. If this file and a chat message disagree, this file wins until the founder changes it.

---

## 1. What this is

The M.O.E. Armory is the company's library of doctrines, playbooks, tools and crucibles. It will become a product. Its job is to guide someone who **doesn't know what they don't know**. A person says what they want to do in plain words. The Armory answers with:

1. **Start here**: the one asset that answers it.
2. **Learn first**: what they need to understand before that, in order.
3. **You will use**: the tools it depends on.
4. **Then**: what comes next.
5. **Rules and blind spots**: what governs it, plus overlaps and conflicts they would never think to ask about.

That only works if every asset is filed **once**, with **typed links** to the others. A flat list of files is a dumpster. This repo is built to stop that.

## 2. What's in the repo (delivered)

| Path | What it is | Status |
|---|---|---|
| `data/archive/protocols.json` | 52 doctrines and playbooks | 1 fully classified (SYS-D028), 51 flat |
| `data/archive/tools.json` | 42 tools | flat |
| `data/archive/crucibles.json` | 9 crucibles | flat |
| `data/schema.json` | Classification rules: fields, 8 link types, gap-finder logic, anti-dumpster rules | final for v0.1 |
| `data/lexicon.json` | SYS-D028 lexicon: 36 swap and ban entries | live, v1 |
| `data/proposals.json` | Lexicon change requests waiting for the founder | empty |
| `data/audits.json` | Weekly after-action log (Closed Loop Debrief) | empty |
| `index.html` | Intelligence Archive viewer: search by ID, name or a plain question, click through links | working |
| `mandate.html` | SYS-D028 Plain Language Mandate: rules, gate check, flow, Whale questions, lexicon | working |
| `scripts/validate.mjs` | `npm run validate`. Blocks bad data. Lists open founder decisions | working |
| `scripts/gaps.mjs` | `npm run gaps -- "goal"`. Reference version of the backend gap finder | working |
| `scripts/gate.mjs` | `npm run gate -- "text"`. Gate check from the command line, for agents | working |
| `AGENTS.md` | Short rules for AI agents working in this repo | final |

The JSON files under `data/` are the **single source of truth**. The pages and scripts only read them.

## 3. Where this came from

**10 Oct 2026:** the founder's Google Sheet O_IP_ARMORY_DATABASE was imported in full (signals, doctrines, playbooks, tools, Forge Log, Digital Fleet). The sheet is frozen; this repo is the source of truth. Open clashes are in `DECISION_GATES.md`.


Moved out of two Claude artifacts on 5 Oct 2026, so that everything lives in one repo and can be packaged:

- Intelligence Archive (claude.ai artifact) → `index.html` + `data/archive/` + `data/schema.json`
- Plain Language Mandate SYS-D028 (claude.ai artifact) → `mandate.html` + `data/lexicon.json`

Exported: every database record (52 protocols, 36 lexicon entries) and the seeded tools and crucibles. Proposals and audits were empty at export.

**What changed in the move:**

| In the artifacts | In this repo |
|---|---|
| Shared live database | JSON files in git. Git history is the audit trail |
| Approve and Reject buttons | Founder moves an entry from `proposals.json` into `lexicon.json`, then commits |
| "Send proposal" and "Log this week" buttons | The buttons make a JSON entry and copy it. Paste it into the file and commit |
| Add or Edit form on the Archive | Edit the JSON, run `npm run validate` |
| Agents read the artifact database | Agents read `data/lexicon.json` and run `npm run gate` |

Once the founder is happy with this repo, the two artifacts can be retired. Do not keep editing both, or they will drift apart.

## 4. How to run it

Requires Node 18 or newer. No packages to install.

```
npm run dev        # serves the site at http://localhost:3000
npm run validate   # must pass before every commit
npm run gaps -- "which words can't I say in a caption"
npm run gate -- "Our shake heals your gut!"
```

The pages fetch the JSON, so open them through `npm run dev` (or the VS Code Live Server extension), not by double-clicking the file.

## 5. The data contract

Every entry has `id`, `name`, `desc`. A **fully classified** entry also has:

| Field | Meaning | Example |
|---|---|---|
| `classified` | Date it was classified. Turns on the strict checks | `"2026-10-05"` |
| `layer` | L0 signal, L1 doctrine or playbook, L3 tool. `-I` internal, `-P` client-facing | `"L1-I"` |
| `status` | live, draft, frozen, retired | `"live"` |
| `answers` | Plain questions a learner would actually ask | `"Which words are we not allowed to say in public?"` |
| `concepts` | kebab-case tags. Reuse before inventing | `"health-claims"` |
| `components` | Parts inside it that don't get their own ID | Whale questions |
| `edges` | `{rel, to, why}` links to other IDs | see below |
| `source` | Where the full asset lives | `"mandate.html"` |

**The 8 link types** (store each link once, on the entry that knows about it. The reverse is computed):

| rel | Means | Shown as |
|---|---|---|
| `requires` | Learn the target first | Learn first / Unlocks |
| `uses` | Applies or is built from the target | Uses / Used by |
| `feeds` | Output goes to the target next | Leads to / Comes after |
| `governs` | This one's rules apply to the target | Rules over / Must follow |
| `supersedes` | Replaces the target, fully or partly | Replaces / Replaced by |
| `overlaps` | Similar job. Candidate to merge | Overlaps |
| `conflicts` | They pull against each other. Founder decides | Conflicts |
| `proven_by` | The crucible where it was tested | Proven in / Proves |

SYS-D028 in `data/archive/protocols.json` is the worked example. Copy its shape.

## 6. Anti-dumpster rules (enforced by `npm run validate`)

1. One ID per asset. No duplicates across collections.
2. A part of an asset is a `component`, not a new ID. Promote it only when it is reused outside its parent.
3. Every link points to an ID that exists, uses one of the 8 types, and is not a duplicate.
4. `overlaps`, `conflicts` and `supersedes` must say why.
5. Anything marked `classified` must have links, answers, a status and a layer.
6. Lexicon: unique IDs, `swap` has a `say`, match strings lowercase.
7. Nobody but the founder edits `data/lexicon.json` or resolves an overlap or conflict.

## 7. What needs to be delivered next

In priority order. Each item has a definition of done.

**D1 · Founder decisions (founder only).** `npm run validate` lists them:
- P-020 vs SYS-D028: two 5-step funnels for the same job. Pick the main one.
- SYS-D023 vs SYS-D028: the Herbalife link vs the rule against naming the partner brand in public.
- KIN-D024 vs SYS-D028: "Wolf" means two different things. Rename one, or add a lexicon note.
- P-014, P-013, SYS-T065: decide when each is used alongside SYS-D028.
- Whale questions: approve the draft. Then promote it to its own Tool ID (next free number).
*Done when:* each decision is written into the entry's `why` or the edge is removed, and validate shows fewer open items.

**D2 · Classify the remaining 102 entries.** Same shape as SYS-D028. Start with COMM_OS and the client-facing assets, since SYS-D028 governs them.
*Done when:* every entry has `classified`, validate passes, and `npm run gaps` gives a useful answer to 10 sample questions the founder writes.

**D3 · File the missing sources.** SYS-D028 cites four documents that aren't in the Archive yet: COMMS-D V1.0, EX-COMM V2.0, Plain Language Dossiers, Brand Bible v2.9 (see `sources_unfiled`). Also the FORMOH Audit.
*Done when:* each one has an ID, a record and links, and is removed from `sources_unfiled`.

**D4 · Recheck client-facing assets against the mandate.** KIN-T040, SYS-T041, MET-T042, SYS-T064 to SYS-T067, T-014. Run the text through `npm run gate`.
*Done when:* each passes or has a proposal filed.

**D5 · Deploy.** GitHub → Vercel per P-047. It is a static site, so no build step is needed. Run `npm run validate` in CI and block the deploy if it fails.
*Done when:* the site is live on a static subdomain (SYS-P061) and a failing validate blocks the deploy.

**D6 · Product backend (later).** Turn `scripts/gaps.mjs` into an API: goal in, learning path out. Keep the JSON as the source, or move it into a database with the same fields. The fields and link types in `data/schema.json` are the contract. Don't change them without the founder.

## 8. Out of scope for v0.1

Logins, multi-user editing, payments, a public product UI. Pages follow SYS-D022 and SYS-D027 ("Quiet Good Taste").

## 9. Checklist before handing work back

- [ ] `npm run validate` passes
- [ ] Every new or changed entry follows the SYS-D028 shape
- [ ] No new ID for something that is only a part of another asset
- [ ] No edits to `data/lexicon.json` unless the founder approved them
- [ ] Customer-facing text passes `npm run gate`
- [ ] Both pages load at http://localhost:3000 with no console errors
