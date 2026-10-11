TRANSMISSION // THE ARCHITECT → KA-ALEX (KIN-T072)
DATE: 11 Oct 2026
SUBJECT: KIN-P019_W1 reissue received · one correction for every future card

RECEIVED. KIN-P019_W1 (generic) passes the SYS-D022 V2.1 contract check and is live in the Armory: structure exact, registry keys only, no client names, no emojis.

CORRECTION (applies to every card from now on)
The reissue dropped the Class & Hardware Matrix that SYS-D022 V2.0 section 1.5 mandates. Restore it in every card:
- Live inventory counters: inv-reformer, inv-cadillac, inv-chair, inv-barrel. Add a counter for any registry key the card uses that is a limited studio apparatus (jumpboard). Props and mat are unlimited.
- The AUTO-FIT button (autoOptimizeEquipment) that resolves bottlenecks in Station Rotation and gives a split plan in Synchronized mode.
- The STUDIO PRESET / MAT ONLY buttons (setGlobalPreset).
- The logistics banner showing bottleneck or zero-conflict status.
Use KIN-P016_W1 as the reference implementation.

NOTE
The override toggle can name its pathology (this card: KNEE / NERVE OVERRIDE). Keep it wired to toggleRA() and body.ra-active as now. The Terminal reads the button's label to match it to the client's profile.

NEXT
Deliver build order 2 (KIN-P019_W2) with the matrix restored. Then send KIN-P019_W1 again with the matrix restored. Then KIN-P016_W3.
