# SYS-D022 V2.2 · Addendum: Triage Doctrine and Override Library

- **Status:** LOCKED by the founder on 19 Oct 2026 ("approve V2.2 + install"). Extends `SYS-D022_V2.1.md`; everything in V2.1 still holds unless changed below.
- **Proven in paid work (Rule B):** KIN-P019 private sessions. A client's clavicle/pec flare after a side plank with ring twist had no place on a single-override card. Source: `TRANSMISSION_ARCHITECT_2026-10-19_TRIAGE.md`.
- **Replaces:** V2.1's single override (one `toggleRA()` per card).
- **First card:** KIN-P019_W2 Advanced Hip Armor & Triage (KA-Alex, 19 Oct 2026).

## T1 · The Triage Doctrine (the 80/20 rule)

- **The Arc (80%):** Phases 2 and 3 (Anchor and Crucible) are immutable. The exercise stays; an override may only add a safety cue to it.
- **The Triage (20%):** Phases 1 and 4 (Primer and Unwind) are fluid. An override may change the movement there to treat what walked in the door that day.
- We never write a new workout for a flare-up. We add an override to the card.

## T2 · The override library (data contract change)

- A card may declare several named overrides. Each is a button `<button id="<key>ToggleBtn" onclick="toggleOverride('<key>')">` whose text names the pathology, e.g. `[ ] ACUTE CLAVICLE / PEC FLUSH`.
- `toggleOverride(key)` toggles `body.<key>-active` and shows every `.<key>-module` cue.
- `ra` stays the first override, and `toggleRA()` stays as its alias, so V2.1 cards and the Client Log keep working.
- Every option still has `name`, `setup`, `reps`, `exec`, `ra`. It may add one field per declared override key (e.g. `clavicle`, `arch`), and no other fields.
- Override keys in use (OVERRIDE_LIBRARY v0, to be completed by KA-Alex's breadth transmission):

| key | Button label | Where it acts |
|---|---|---|
| `ra` | Card-specific, e.g. RA / GRIP OVERRIDE, NERVE / KNEE SHEAR | All phases |
| `clavicle` | ACUTE CLAVICLE / PEC FLUSH | Primer and Unwind change; Anchor and Crucible cue only |
| `arch` | PRONATION / ARCH TENSION | Primer and Unwind change; Anchor and Crucible cue only |

- Clients are still never named in a card (V2.1 D3). The Client Log offers each override when a selected client's conditions mention its words, and the session record keeps which overrides were on.

## Checks

`node armory/check-card.js <card> armory/apparatus-registry.json` checks V2.2: declared overrides call `toggleOverride`, each has a `.<key>-module`, and option fields stay within the library.
