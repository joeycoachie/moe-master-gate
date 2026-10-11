TRANSMISSION // KA-ALEX (KIN-T072)
FROM: The Architect · DATE: 11 Oct 2026
SUBJECT: Apparatus Registry report + SYS-D022 V2 Data Contract
DOCTRINE: SYS-D022 V2.0 (Master Battle Card Doctrine), proposed addendum V2.1

CONTEXT
Every Battle Card you have shipped (KIN-P016 W1, KIN-P016 W2, KIN-P019 W1) now runs inside the M.O.E. Terminal Armory. A Client Log bar is attached to each card at serve time. It reads the card's own data to record, per client and per session:
- which stations were done
- which apparatus was used
- layering notes
- the Phase 5 gate results

Your three cards already share one internal structure, and that is why the bar works on all of them. This transmission asks you for two things, in order.

---

PART A · REPORT FIRST (do not build anything yet)

Produce an APPARATUS REGISTRY: the complete list of apparatus and props you design for. For each one, give:

1. key: the lowercase id used in your PROTOCOL_DB options (today: reformer, cadillac, chair, barrel, mat)
2. label: the display name (today's EQUIP_LABELS)
3. sub-tools: the props or attachments it covers. Today "mat" lumps together foam roller, yoga block, bands, sliders and dumbbells. Say whether any of these should become its own key.
4. settings vocabulary: how springs, loads or heights are written for it, e.g. "1 Red, 1 Blue Spring"
5. station fit: which station roles it can serve (calibration, closed-chain, oblique sling, lever series, release)
6. RA / grip substitution rule: the default override when the client has RA or a grip limit
7. same actions? Answer yes or no: does every apparatus option of a station train the same objective at the same tempo, so a client switching apparatus mid-arc is still on the same arc? If not, list the exceptions.

Also answer:
- A. Do you want more apparatus keys than the current five (for example: jumpboard, wall unit, springboard, Bosu, kettlebell, cable)? List them with the same seven fields.
- B. KIN-P019 W1 is written for one named client (Mae). Should arcs stay client-agnostic, with client-specific overrides living in the client's profile? Recommend one approach with the safety reasoning.

Output Part A as one JSON block named APPARATUS_REGISTRY plus short answers to A and B. Zero emojis.

---

PART B · THE DATA CONTRACT (proposed SYS-D022 V2.1, keep it in every future card)

The Client Log bar depends on these names. Change the content freely; never change the structure.

MUST STAY EXACTLY AS IS
- Top-level `const PROTOCOL_DB = { ... }` in a classic <script> (no modules, no wrapping function).
- Phase keys, in order: `primer`, `anchor`, `crucible`, `unwind`. Each has `title`, `subtitle`, `clockHint`, `wolfCue`, `shepherdCue`, `safetyGate`, `stations`.
- Stations `M1`, `M2`, `M3` in every phase. Each has `role` and `options`.
- `options` keyed by apparatus key from the registry. Every option has exactly `name`, `setup`, `reps`, `exec`, `ra`.
- Top-level `const stationSelections = { primer: { M1: '<key>', ... }, ... }`, holding the apparatus currently chosen per station.
- Top-level `const EQUIP_LABELS = { <key>: '<label>' }`.
- Phase 5 form:
  - gate selects with ids `gate1-status`, `gate2-status`, `gate3-status` (more allowed: `gate4-status`…), each inside a `div.p-4` whose first `<span>` is the gate name
  - body-check checkboxes with ids starting `som-`, each inside a `<label>` whose first `<span>` is the check name
  - `textarea#auditNotes`
  - `div#auditVerdictBox`
- Sidebar selects `#paxCount` and `#flowFormat`.

FREE TO CHANGE
All text, cues, reps, tempos, apparatus choices per station, colours within SYS-D022, the number of body checks, and the verdict logic.

NEVER
- Rename the phase or station keys.
- Move PROTOCOL_DB into a module or function.
- Put client data (real names, health notes) in the card itself. That belongs in the client profile.

DELIVERY
One self-contained .html file per week, named KIN-P0xx_Wn, with the title tag "Movement OS | KIN-P0xx Wn (...)". The Architect drops it into the Armory as is.
