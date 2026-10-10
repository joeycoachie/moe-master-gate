# DECISIONS · The Operator's Playbook

Things the founder has settled. **Don't re-ask them, and don't contradict them.** Only the founder adds or changes entries. An agent may write one here only when the founder stated it in plain words, and must quote the date.

Newest at the top within each section.

---

## Company-wide

- **2026-10-06 · Domain.** All products live under `theoperatorplaybook.com` as subdomains. `www`/root stay on the Gumroad store.
- **2026-10-06 · Shared source of truth.** This hub (`~/moe-master-gate/hub`) is the cross-project source of truth. Every product's instruction file points here.
- **2026-10-05 · Plain language (SYS-D028).** Every customer-facing word follows the lexicon in `moe-armory/data/lexicon.json` (ban = never use, swap = say this instead). Agents propose changes in `data/proposals.json`; only the founder edits the lexicon.
- **2026-09-29 · Architect the whole system.** When new assets or ideas arrive: audit what exists, design one architecture, ask about real gaps. Don't bolt things on piecemeal or fill gaps with guesses.
- **Standing · Naming.** Asset IDs use the SYS-D020 taxonomy (`SYS-`, `KIN-`, `MET-` prefixes) for zero collisions.
- **Standing · Scope (D-002 Base Camp Protocol).** One foundational objective at a time before expanding.

## M.O.E. Terminal

- **2026-10-06 · Address.** Instructors and the founder log in at terminal.theoperatorplaybook.com. Danny uses `/ops/login` there and lands on Roster Export.
- **2026-10-01 · Armory.** Every SYS-D022 V2.0 protocol (KIN-P0xx_Wn) goes into the Terminal's Armory (`armory/protocols/` + `lib/armory.ts`), behind the SYS.OP code. No new Vercel project per protocol.
- **2026-10-01 · Founder entry point.** The founder enters via the [SYS.OP] button on `/terminal` only. Don't send them to `/ops/*` URLs.
- **Standing · Footer.** Every M.O.E. page carries the "Cleared For Human Performance" footer.

## RECUP.STN

- **2026-10-05 · Customer naming.** HealthBar → **RECUP.STN HQ**. 90-day program → **RECUP 90**. "Shake" → **measured meal**. The partner brand isn't named publicly yet.
- **2026-09-29 · System.** The GitHub Pages site on Supabase is canonical. The React app is retired.
- **2026-09-29 · Identity and contact.** Member code `RS-XXXX`. Contact is WhatsApp or Instagram only.
- **2026-09-29 · Location.** "PHB Saujana" everywhere.
- **2026-09-29 · Brand.** Client pages use the warm RECUP.STN palette. God Terminal, posters and the marketing kit keep the dark cyan look.
- **Standing · Push.** Push to GitHub only after the founder says so.

## Intelligence Archive

- **2026-10-05 · Repo wins.** `moe-armory/data/` is the source of truth. The two claude.ai artifacts are retiring; never write to them.
- **2026-10-05 · Founder-only.** Lexicon edits and overlap/conflict calls are the founder's (HANDOVER D1).

## 2026-10-09 · Optimum Fit sunset
- Optimum Fit's retainer ends Friday 9 Oct 2026, 5 PM.
- Optimum Fit receives an export of their operational data. The Terminal software, protocols and Armory stay with The M.O.E. Group.

## 2026-10-10 · One home, one weekly ritual
- The Intelligence Archive and this hub live inside `moe-master-gate` (folders `archive/` and `hub/`). No separate repos.
- P-010 Founder's Weekly Cognitive Loop is the single weekly ritual. "Scale Faster" (7 Oct 2026) is merged into it as v4.0, not given its own ID.
- New IDs are never minted without checking the founder's O_IP_ARMORY_DATABASE sheet first, and every new or changed ID is flagged to the founder.

## 2026-10-10 · The Archive is the source of truth
- The founder's Google Sheet O_IP_ARMORY_DATABASE was imported into `archive/` in full and is frozen as of 10 Oct 2026. It is not edited again.
- Signals, doctrines, playbooks, tools and crucibles live in `archive/data/archive/`. The Forge Log (`archive/data/forge.json`) and the Digital Fleet (`archive/data/fleet.json`) are kept word-for-word.
- Every clash is a numbered gate in `archive/DECISION_GATES.md`. Agents never resolve a gate themselves; the founder says "gate G-xx: option N".
- Mae Lim = "Mae" in KIN-P016 (RA override) and KIN-P019 W1. Pei Suen and Zi Suen = the daughters in the trio. Eleine Wong is a 1-1 client, about 3 cycles in, on the Upper Crossed arc (KIN-P016) to build her shoulder frame.
