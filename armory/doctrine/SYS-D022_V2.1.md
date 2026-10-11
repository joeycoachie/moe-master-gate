# SYS-D022 V2.1 · Addendum: Data Contract, Apparatus Registry, Client-Agnostic Arcs

- **Status:** LOCKED by the founder on 11 Oct 2026 (D1–D3). Extends `SYS-D022_V2.md`; it doesn't replace it.
- **Why:** the Terminal's Client Log bar reads each card's own data to log sessions per client. That only works if every card keeps one structure.

## D1 · The data contract (every card, from now on)

**Must stay exactly as is:**
- Top-level `const PROTOCOL_DB` in a classic `<script>`. No modules, no wrapping function.
- Phase keys, in order: `primer`, `anchor`, `crucible`, `unwind`. Each has `title`, `subtitle`, `clockHint`, `wolfCue`, `shepherdCue`, `safetyGate` and `stations`.
- Stations `M1`, `M2`, `M3` in every phase, each with `role` and `options`.
- `options` keyed by apparatus key (see D2). Every option has exactly `name`, `setup`, `reps`, `exec`, `ra`.
- Top-level `const stationSelections` and `const EQUIP_LABELS`.
- Phase 5:
  - `gate1-status` to `gate3-status` selects (more allowed), each inside a `div.p-4` whose first `<span>` is the gate name
  - `som-*` checkboxes inside `<label>`s whose first `<span>` is the check name
  - `textarea#auditNotes`
  - `div#auditVerdictBox`
- Sidebar: `#paxCount`, `#flowFormat`. RA override through the global `toggleRA()` and `body.ra-active`.

**Free to change:** all text, cues, reps, tempos, apparatus per station, colours within SYS-D022, the number of body checks, and the verdict logic.

## D2 · The apparatus registry

The source of truth is `armory/apparatus-registry.json` (v1.0, from KA-Alex):
- **Live keys:** `reformer`, `cadillac`, `chair`, `barrel`, `mat`. `mat` now means floor, foam roller and yoga block only.
- **New keys:** `props_slider`, `props_band`, `props_freeweight`, `jumpboard`.
- **Rule:** an option may sit as an alternative inside a station only if its `same_actions` is yes. **Jumpboard is no**, so a jumpboard series is always its own station.
- Cards issued before 11 Oct (KIN-P016 W1/W2, KIN-P019 W1) still use `mat` for bands, sliders and weights. They stay valid until reissued.

## D3 · Arcs are client-agnostic

- No real names, personal history or health notes inside a card.
- Client-specific needs are generic override toggles: RA / GRIP today, plus new ones (e.g. KNEE / NERVE) only when a paid crucible needs them.
- The Terminal's client profile maps a person to an override. When a client with RA is selected, the Client Log bar offers to switch the RA override on.
