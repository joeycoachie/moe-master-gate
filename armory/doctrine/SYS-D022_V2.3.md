# SYS-D022 V2.3 · Addendum: Universal Override Library and Floor Clarity

- **Status:** LOCKED by the founder on 12 Nov 2026 ("Yes, every card"). Extends `SYS-D022_V2.2.md`; everything in V2.2 still holds unless changed below.
- **Proven in paid work (Rule B):** KIN-P021 W1, first session (11 Nov 2026). The card had no clavicle, arch or nerve switches, and two stations could not be pictured from the text on the floor, so the coach skipped them.
- **Replaces:** V2.2's "a card may declare overrides from the library".

## L1 · The library is on every card

Every card, in every arc, declares these three overrides, plus the `ra` slot and any arc-specific ones:

| key | Button label | Where it acts |
|---|---|---|
| `ra` | Card-specific first slot (e.g. HIGH BLOOD PRESSURE on KIN-P021, RA / GRIP on KIN-P016) | All phases |
| `nerve` | NERVE / KNEE SHEAR | Primer and Unwind change; Anchor and Crucible cue only |
| `clavicle` | ACUTE CLAVICLE / PEC FLUSH | Primer and Unwind change; Anchor and Crucible cue only |
| `arch` | PRONATION / ARCH TENSION | Primer and Unwind change; Anchor and Crucible cue only |
| arc-specific | e.g. `knee` (KNEE LOCKS BACK), `lift` (OFFLOAD / NO FLOOR) on KIN-P021 | as the arc says |

- Every option carries a field for every declared key (`ra`, `nerve`, `clavicle`, `arch`, plus arc keys). "Safe." is a valid answer; a missing field is not.
- On KIN-P019 the `ra` slot already reads NERVE / KNEE SHEAR. Those cards count as having `nerve`.
- Why: triage treats what walks in the door that day. Any client can arrive with a pec flare or arch pain, whatever arc they are on.

## C1 · Floor clarity (every option)

- The `exec` text stands on its own. Never "Same as above".
- The first line is **Picture it:** one plain sentence a coach can see without the apparatus in front of them, e.g. "Lying on your back, lift one bent knee until the shin is level with the ceiling, then lower it."
- Use the standard STOTT PILATES name where one exists, and the plain name beside it.

## A1 · Apparatus breadth

- Each station offers at least 2 options (3 in Anchor and Crucible) on different apparatus where the arc allows: Reformer, Cadillac, Chair, Ladder Barrel, TRX, props. The first option is the default; the others serve busy equipment and repeat weeks (FRESH SET in the Client Log).
- An arc may narrow the list only with a reason written in its Commander's Intent (e.g. "no barrel: mounting is unsafe for this archetype in W1–W2").

## Checks

`node armory/check-card.js <card> armory/apparatus-registry.json` fails a card that says SYS-D022 V2.3 and is missing `nerve`, `clavicle` or `arch`, an option without a field for a declared key, "Same as above", or an `exec` without "Picture it". Cards made before 12 Nov get the same lines as warnings.
