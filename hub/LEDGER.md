# LEDGER · The Operator's Playbook

One line per change, from every agent and window, **appended at the bottom**. This is how the windows know what the others did.

Format: `- YYYY-MM-DD · <Product> · <what changed, in plain words> · <commit or link>`

Add a line after every push or deploy, any DNS or domain change, any database migration, and any decision the founder settles. Commit and push the hub straight after. (`.gitattributes` uses union merge on this file, so two windows appending at once won't conflict.)

---

- 2026-09-29 · RECUP.STN · GitHub Pages site on Supabase made canonical; React app retired · joeycoachie/recup-station-
- 2026-10-01 · M.O.E. Terminal · Armory built at /ops/armory, KIN-P016_W1 pilot, SYS.OP unlock on /terminal · 742d79d, d0e7313
- 2026-10-02 · M.O.E. Terminal · KIN-P016_W2 (4s Eccentric Load) added to the Armory · 9a4a176
- 2026-10-03 · RECUP.STN · Open day
- 2026-10-05 · Intelligence Archive · v0.1.0 imported from the claude.ai artifacts into ~/Downloads/moe-armory
- 2026-10-05 · RECUP.STN · Customer naming: RECUP.STN HQ, RECUP 90, measured meal
- 2026-10-06 · Domain · terminal.theoperatorplaybook.com live (Squarespace A record → Vercel); Gumroad on www untouched
- 2026-10-06 · Hub · ~/theoperatorplaybook created (REGISTRY, DECISIONS, LEDGER); hub rule added to every product's instruction file
- 2026-10-08 · M.O.E. Terminal · KIN-P019_W1 (Knee/Nerve Diagnostic & Hip Flow) added to the Armory as a new arc · 53a0f7e
- 2026-10-09 · M.O.E. Terminal · Founder reports the retainer behind the instructor calibration terminal was lost. Data handover / access / repositioning not yet decided
- 2026-10-09 · Intelligence Archive · ~/Downloads/moe-armory folder missing from disk (not found by search; Trash unreadable from Claude). The claude.ai artifact still holds the 52 protocols; the 42 tools + 9 crucibles have no other copy found
- 2026-10-09 · Intelligence Archive · Founder restored ~/Downloads/moe-armory from Trash; verified complete (52 protocols, 42 tools, 9 crucibles, 36 lexicon, git history intact, validate passes). Still no GitHub remote
- 2026-10-09 · M.O.E. Terminal · Optimum Fit sunsets today 5 PM. Founder decision: export their operational data to them; Terminal software, protocols and Armory stay with M.O.E. Export prepared at ~/Downloads/OptimumFit_Export_2026-10-09 (6 instructors, 63 availability slots, 9 programming logs, 1 saved sequence)
- 2026-10-09 · Intelligence Archive · Crucibles consolidated: C-006 merged into C-005 (Project Genesis), C-007 into C-008 (Operation Kinetic / Optimum Fit, sunset recorded); Healthbar Victory PDF filed as C-003's source · b616a0e
- 2026-10-09 · M.O.E. Terminal · Optimum Fit cutoff: founder suspended the 5 instructor logins (Joey/architect stays active; all records intact) and rotated Ops passcode + session secret on instructor-callibration-terminal (redeployed). moe-master-gate Vercel project rotated + redeployed too. Cutoff complete
- 2026-10-10 · Intelligence Archive · Filed SYS-P062 Scale Faster (founder playbook, 7 Oct); open overlap with P-010 on which weekly review is the ritual · 180af94
- 2026-10-10 · Hub · Intelligence Archive and hub moved into moe-master-gate (archive/, hub/) with history; all product CLAUDE.md files repointed. RECUP.STN local folder found missing (code safe on GitHub)
- 2026-10-10 · Intelligence Archive · Scale Faster merged into P-010 (v4.0, the one weekly ritual); the SYS-P062 entry added earlier today was removed because SYS-P062 is already "The 90-Day Ascent (Franchise Shell)" in the founder's sheet
- 2026-10-10 · Intelligence Archive · Imported the founder's O_IP_ARMORY_DATABASE sheet (8 tabs): now 25 signals, 92 doctrines/playbooks, 67 tools, 9 crucibles, plus Forge Log (167 rows) and Digital Fleet (74 rows) kept word-for-word. 24 decision gates opened in archive/DECISION_GATES.md. Sheet frozen
- 2026-10-10 · M.O.E. Terminal · Intelligence Archive viewable online at terminal.theoperatorplaybook.com/ops/archive behind SYS.OP (ARCHIVE button on /terminal); only the viewer pages and archive/data JSON are served
- 2026-10-10 · Hub · ROADMAP.md v0.1 (draft) written from our doctrines; Founder Command page at terminal.theoperatorplaybook.com/ops/command (roadmap + full ledger, behind SYS.OP, COMMAND button on /terminal). 8 open questions for the founder
- 2026-10-10 · Hub · Roadmap v0.2: founder answers recorded (Healthbar 25% inactive, RECUP.STN separate proof of concept, 3k floor, why Optimum Fit left, dream buyer, refuse list); BC3 offer shaped as setup + mandatory licence
- 2026-10-11 · Hub · Roadmap v1.0: Summit sentence set, Rules A and B adopted, BC3 offer priced from Optimum Fit's real numbers (setup + mandatory licence + optional Floor Command)
- 2026-10-11 · Intelligence Archive · KA-Alex role brief filed as KIN-T072 (new tool ID, flagged to founder); roadmap team question closed
- 2026-10-11 · M.O.E. Terminal · Client Arc System built: /ops/clients (profiles + timelines) and a [ CLIENT LOG ] bar injected into every Armory arc (per-client ticks, layering notes, apparatus, Phase 5 capture). Locked behind SYS.OP; new tables clients / arc_sessions / arc_session_entries with RLS and no public access. Needs founder setup: run client_arc_system_schema.sql + add SUPABASE_SERVICE_ROLE_KEY on Vercel
- 2026-10-11 · M.O.E. Terminal · Transmission to KA-Alex written (armory/doctrine/TRANSMISSION_KA-ALEX_2026-10-11.md): Part A apparatus registry report first, Part B data contract (proposed SYS-D022 V2.1, flagged to founder)
- 2026-10-11 · M.O.E. Terminal · Client system confirmed live (4 clients load; public key blocked from all 3 client tables). Client Log bar now shows each selected client's conditions/avoid and offers TURN ON RA OVERRIDE for RA clients. KA-Alex apparatus registry saved as armory/apparatus-registry.json (draft); reply transmission drafted with decisions D1–D4 for the founder
- 2026-10-11 · M.O.E. Terminal · SYS-D022 V2.1 locked (D1–D3): data contract, apparatus registry v1.0 (4 new keys), client-agnostic arcs. Archive SYS-D022 entry updated to doc_version 2.1 (existing ID, flagged)
- 2026-10-11 · M.O.E. Terminal · D4 approved; KA-Alex reply transmission finalised (KIN-P016 = 5-week arc; W3 in progress goes first)
- 2026-10-11 · M.O.E. Terminal · KIN-P019_W1 replaced by KA-Alex's client-agnostic reissue (SYS-D022 V2.1; passes armory/check-card.js; Hardware Matrix missing, correction transmission drafted). Client Log override button now reads each card's own toggle (RA or KNEE / NERVE) and matches it to client conditions
- 2026-10-11 · M.O.E. Terminal · KIN-P019_W2 (Proximal Hip Armor, KA-Alex) added to the Armory; passes armory/check-card.js including the Hardware Matrix. Minor note to Alex: 'left patella' laterality
- 2026-10-11 · M.O.E. Terminal · KIN-P019_W1 v2 (KA-Alex, Hardware Matrix restored) replaces v1; passes check-card.js and a headless browser run of the matrix, presets, phases and override
- 2026-10-11 · M.O.E. Terminal · KIN-P016_W1 and W2 made client-agnostic by relabelling only (16 labels; movements byte-identical; check-card.js passes; Client Log RA match re-tested). Removed from KA-Alex's queue; next from Alex: KIN-P016_W3–W5
- 2026-10-12 · M.O.E. Terminal · Breadth transmission to KA-Alex drafted: ARC_MAP, OVERRIDE_LIBRARY, INTAKE_ROUTING (indexes of existing work, Rule B); instructor gates deferred to BC4
- 2026-10-13 · M.O.E. Terminal · Client Log is now a full-width bottom dock on every arc (client names visible on page load, tap who's in, OPEN LOG); ← ARMORY link moved above it
