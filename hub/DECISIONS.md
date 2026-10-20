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

## 2026-10-10 · Founder answers (roadmap v0.2)
- Ops Healthbar's 25% profit share is not active. RECUP.STN is a separate, new proof of concept. Both use Herbalife products. President's Team is still a goal.
- Monthly money floor: 3k.
- Why Optimum Fit left: they wanted the 90-day Phase 1 build to run permanently without paying the Tier 2 monthly management retainer.
- Dream buyer: a high-agency studio owner who values systems, data and accountable execution. Refused: enterprise systems at freelance rates; "busy" as an excuse to avoid decisions; free hosting or management outside an active retainer.

## 2026-10-11 · Roadmap v1.0
- Income: RM9,000 this month (peak about RM10k); floor RM3,000. The 9-to-5 rule does not apply while income stays above the floor.
- Rule A adopted: a protocol only counts once it has been used in paid work (`proven_by`). It replaces "IP Generation Velocity".
- Rule B adopted: no new framework unless it was proven in paid work and names what it replaces or merges.
- Summit (D-004): "The operating system behind every studio, clinic and recovery station that takes the body seriously."
- Optimum Fit prices for the record: build RM1,800/month (May–Sep 2026), Tier 2 RM3,200/month. The new offer's numbers (RM9,000 setup, RM1,200 licence, RM2,000 Floor Command) are a recommendation until the founder confirms them.

## 2026-10-11 · Team
- KA-Alex is an AI chatbot role, not a person. Filed as KIN-T072 (Functional Spec), next to the Tesseract (T-011/T-012) and Archivist 7 (T-025) specs. No human staff.

## 2026-10-11 · SYS-D022 V2.1 (D1–D3 approved)
- D1: the Battle Card data contract is locked for every card (armory/doctrine/SYS-D022_V2.1.md).
- D2: the apparatus registry v1.0 is approved, adding props_slider, props_band, props_freeweight and jumpboard. Jumpboard is always its own station.
- D3: arcs are client-agnostic. No names or health notes in cards; the client profile maps people to override toggles.
- D4 (KA-Alex build order) is not yet confirmed.
- The live app is terminal.theoperatorplaybook.com. The duplicate Vercel project `moe-master-gate` (moe-master-gate-roan.vercel.app) has no client-system key.

## 2026-10-11 · D4 approved · KIN-P016 length
- D4 approved as is. KA-Alex build order: (0) finish KIN-P016_W3 if already in progress, (1) KIN-P019_W1 generic reissue, (2) KIN-P019_W2, (3) KIN-P016_W3 if not already done, (4) KIN-P016_W4–W5.
- KIN-P016 Upper Crossed is a 5-week arc (W1–W5).

## 2026-10-16 · Client Portal
- Clients get a personal code to the MOE-MASTER-GATE portal (Kinetic menu Pillar 3). Eleine Wong is the pilot.
- In a client's own portal, products may be named (e.g. "Niteworks"), using the client-facing layer of the MET Product Academy (Sovereign Fuel OS). This settles gate G-24 for private client files only; public copy still follows SYS-D028.
- The portal shows a client's sessions, end-of-session checks and unlocked fuel with their dose. It never shows instructor notes, conditions, history or routing verdicts.

## 2026-10-16 · BC3 offer prices confirmed
- Kinetic Studio OS: 90-Day Setup RM9,000 (50% upfront); Studio Licence RM1,200/month, mandatory, 12-month minimum, and the system stops if unpaid; Floor Command RM2,000/month, optional.
- Client portal pilot is live: Eleine Wong has a code (issued 16 Oct). Programme shown as "The Shoulder Frame Programme".

## 2026-10-19 · SYS-D022 V2.2 · Triage Doctrine and override library
- Founder approved V2.2 ("approve V2.2 + install"). Phases 2–3 (Anchor, Crucible) are the immutable arc; Phases 1 and 4 (Primer, Unwind) are fluid triage. A card may carry several named overrides (`ra`, `clavicle`, `arch`); it replaces V2.1's single override. Doctrine: armory/doctrine/SYS-D022_V2.2.md.
- KIN-P019_W2 is now KA-Alex's Advanced Hip Armor & Triage card (19 Oct); it replaces the 11 Oct issue.

## 2026-10-20 · RECUP.STN studio outreach
- Fuel goes first: the Recovery Omakase / post-class tasting is the hook; the studio system (Kinetic) comes second, after a tasting day. Never both in one first message.
- The studio pays nothing for a tasting. Members pay a small price for the three-cup flight (price to set). Changed the same day from "first session free": free drinks for members are not sustainable.
- The offer is called "The Recovery Omakase" (not "metabolic", per RECUP's word rules).
