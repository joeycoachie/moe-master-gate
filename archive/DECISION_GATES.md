# Decision Gates

Open calls the founder makes. Most gates came from importing the O_IP_ARMORY_DATABASE sheet on 10 Oct 2026.
Nothing here was guessed or changed. Rows that clashed are kept word-for-word in `data/import/sheet_parked_rows.json`.
When you decide a gate, tell any agent "gate G-xx: option N". It applies the change, runs `npm run validate`, and moves the gate to Settled.

**Rule from now on:** the Archive is the source of truth. The Google Sheet is frozen as of 10 Oct 2026 and is not edited again.

## Empty rows

### G-01 · SYS-T069

"PROTOCL ATLAS - CLAUDE" has no description in the sheet, so it can't be filed.

1. Write a one-line description and file it
2. Delete it if it is a duplicate or a placeholder

**Recommended:** Describe it or delete it.

### G-02 · SYS-T071

"PROTOCL ATLAS - CLAUDE" has no description in the sheet, so it can't be filed.

1. Write a one-line description and file it
2. Delete it if it is a duplicate or a placeholder

**Recommended:** Describe it or delete it.

## Same ID, different asset

### G-03 · SYS-022

The Strategic Takeaway Protocol is written as "SYS-022", which breaks the taxonomy. The Forge Log (F-048, F-049, F-061) calls it P-022.

1. Rename to P-022 (matches the Forge Log)
2. Rename to SYS-P0xx (new series)

**Recommended:** Rename to P-022.

## Same idea filed more than once

### G-04 · P-018 · SYS-P055 · SYS-P062

Three entries for "The 90-Day Ascent": P-018 (Client OS), SYS-P055 (franchise shell), SYS-P062 (franchise shell). SYS-P055 and SYS-P062 read as the same thing.

1. Keep P-018 for client delivery and SYS-P062 for the franchise shell; retire SYS-P055 into SYS-P062
2. Merge all three into one

**Recommended:** Keep P-018 + SYS-P062, retire SYS-P055 (supersedes, fully).

### G-05 · SYS-P053 · SYS-P054

Identical name and text (Moe Goru Protocol, ERD Logic). Meanwhile P-003 and P-004 say they were "superseded by SYS-P053", which is really the Intake Pipeline SYS-P052.

1. Retire SYS-P054 into SYS-P053, and fix P-003/P-004 to say superseded by SYS-P052
2. Keep both

**Recommended:** Retire SYS-P054; point P-003/P-004 at SYS-P052.

### G-06 · D-009 · D-012

D-009 "The Clarity vs. Momentum Protocol" and D-012 "Clarity vs. Momentum Protocol" are the same doctrine; D-012 is also used for Founder's Lexicon M1.

1. D-012 = Founder's Lexicon M1, and the Clarity copy is retired into D-009
2. Keep D-012 for Clarity and renumber the Lexicon

**Recommended:** Clarity lives in D-009 only. D-012 = Lexicon M1, D-013 stays Separation of Powers, Lexicon M2 gets the next free D number.

## Same ID, different asset

### G-07 · KIN-P015

The protocol tab says KIN-P015 = Hardware Procurement (The 3 Filters). The fleet and the Terminal say KIN-P015 = QL Nerve Impingement Corrective.

1. Hardware Procurement keeps KIN-P015, QL Nerve gets a new KIN-P number
2. The reverse

**Recommended:** QL Nerve keeps KIN-P015 (it is a clinical arc like KIN-P016/P019); Hardware Procurement becomes SYS-P (it is an ops checklist).

### G-08 · SYS-T058 / MET-T058 · SYS-T060 / MET-T060

Two tools share each number across prefixes. SYS-D020 promises "zero database collision", but the number should be unique on its own.

1. Renumber the MET ones to the next free T numbers
2. Allow the same number across prefixes

**Recommended:** Renumber the MET tools; numbers stay unique.

### G-09 · SYS-T060-T062 vs Forge Log

Tools tab: SYS-T060 Frictionless, SYS-T061 Biology, SYS-T062 Hustle. Forge Log F-167 to F-169 logs them as SYS-T061, MET-T062, SYS-T063.

1. The tools tab is right; fix the Forge Log
2. The Forge Log is right; renumber the tools

**Recommended:** The tools tab is right.

### G-10 · SYS-T064-T067

The Archive has four tools the sheet never had: Base Camp Audit CTA, Transference Audit, Headline Set Template, Opening Paragraph Pattern.

1. Keep them (the Archive is now the source of truth)
2. Retire them

**Recommended:** Keep them.

### G-11 · C-007 / KIN-004

Crucible written with two IDs. Already resolved: C-007 was merged into C-008 on 2026-10-09. KIN-004 is not used anywhere else.

1. Drop the KIN-004 alias

**Recommended:** Drop it.

## Forge Log

### G-12 · F-109 · F-110

Both IDs are used twice for different links (C-009/T-019 and P-037/T-027; C-009/C-003+C-008 and D-006/T-028).

1. Renumber the second pair to F-171 and F-172

**Recommended:** Renumber.

### G-13 · F-161 to F-165

Missing from the log (F-160 jumps to F-166). Either deleted or never written.

1. Mark them as intentionally unused
2. Recover them if you remember what they were

**Recommended:** Mark as unused.

### G-14 · Links to IDs that are not filed

The Forge Log points at 22 IDs that exist nowhere in the sheet's own tabs: KIN-013-A, KIN-013-C, KIN-MOE-005, KIN-MOE-006, KIN-MOE-007, KIN-MOE-008, KIN-MOE-009, KIN-MOE-019, MET-T062, OPS_OPTIMUM_FIT, P-022, P-049, SYS-MOE-004, SYS-MOE-010, SYS-MOE-011, SYS-P029, SYS-P064, SYS-T013, SYS-T053, SYS-T055, SYS-T063, T-045.

1. Find and file the missing assets
2. Correct the IDs (several are typos, e.g. SYS-P029 for P-029, P-049 for SYS-P049)

**Recommended:** Correct the typos; file the KIN-013 specs as KIN-P013 components.

### G-15 · Turn the Forge Log into typed links

167 rows are kept word-for-word in data/forge.json. The Archive's typed links (requires, uses, feeds, proven_by...) can replace it, so the gap-finder can use them.

1. Convert row by row after the gates above are settled
2. Keep the Forge Log as a separate record forever

**Recommended:** Convert after the ID gates are settled; keep the original file as history.

## Digital Fleet

### G-16 · Fleet rows without clean IDs

About 30 fleet rows have no ID, an ID with a colon or "[FIX]", or no details (e.g. "hyrox double", "UPPER CROSS W1", KIN-T001:, SYS-T001:). The sheet's red rows did not survive CSV export, so I can't tell which ones you marked.

1. Give each live asset a fleet ID and drop the rest
2. Keep them as notes

**Recommended:** Tell me which red rows mean "retired"; I'll clean the rest.

### G-17 · Fleet vs hub REGISTRY

The fleet tab and hub/REGISTRY.md both list live products and URLs, so they will drift.

1. The fleet becomes the single deployment list; REGISTRY links to it
2. Keep both

**Recommended:** One list: data/fleet.json in the Archive.

## Status

### G-18 · Taxonomy for arcs

Clinical arcs appear as KIN-P013 / KIN-013 / KIN-MOE-0xx / KIN-P016 / KIN-016 / KIN-P019_W1.

1. Arc = KIN-P0xx, week = KIN-P0xx_Wn, and the deployed page = the same ID (no separate KIN-MOE number)

**Recommended:** One ID per arc and one per week. The Armory already uses KIN-P016_W1, KIN-P019_W1.

## Open from the Archive itself

These were already open before the import (`npm run validate` lists them).

### G-19 · SYS-D028 · P-020

Two 5-step funnels for the same job (Plain Language flow vs High-Signal Funnel).

1. SYS-D028's flow is the main one; P-020 is retired into it
2. P-020 stays main for B2B; SYS-D028 for RECUP.STN customers

**Recommended:** SYS-D028 is main for customers; keep P-020 for B2B peers.

### G-20 · SYS-D028 · P-014

Both script the first DM reply. Goals differ: newsletter (P-014) vs 15-min call (SYS-D028).

1. Use SYS-D028 when selling a program, P-014 for audience growth
2. Merge

**Recommended:** Keep both, with that split.

### G-21 · SYS-D028 · P-013

Two quality gates for content.

1. Pillar content must pass both
2. One replaces the other

**Recommended:** Pass both: P-013 for authenticity, SYS-D028 for words.

### G-22 · SYS-D028 · SYS-T065

Another short diagnostic vs the Whale questions.

1. Whale questions for programs; SYS-T065 for content audits
2. Merge

**Recommended:** Keep both, with that split.

### G-23 · SYS-D028 · KIN-D024

"Wolf" means internal jargon in SYS-D028 and a firm coaching cue in KIN-D024.

1. Rename the SYS-D028 sense to "Engine language"
2. Add a lexicon note and keep both

**Recommended:** Add a lexicon note; coaches keep Wolf/Shepherd.

### G-24 · SYS-D028 · SYS-D023

SYS-D023 links M.O.E. to Herbalife; SYS-D028 bars naming the partner brand in public until tested.

1. Internal: SYS-D023 applies. Public: SYS-D028 wins until the reaction test
2. Name the partner publicly now

**Recommended:** Internal yes, public no until tested.

## Settled

_None yet._
