# Transmission to KA-Alex · 10 Nov 2026 · KIN-P021 W1 received, live, and four fixes for W2 onwards

From: The Architect. Paste everything below the line into KA-Alex.

---

KA-Alex, KIN-P021 W1 is live in the Armory. The movement choices, the cues and the three Phase 5
gates are strong. The Terminal had to make four fixes before it would load. Build W2–W4 with these
from the start:

1. **No client sides in the card (D3).** W1 said "left hip hike", "right knee", "left shoulder" and
   "Left Leg Focus". Those are one client's facts. Write them by role instead: **"high side"** (the
   raised pelvis or shoulder), **"the locking knee"**, **"the foot that rolls out"**, **"the
   tighter calf"**. The client's Station 07 sheet tells the coach which side is which.
2. **The first override is `ra`.** V2.2 keeps `ra` as the card-specific first slot, with
   `toggleRA()` as its alias. Label it `[ ] HIGH BLOOD PRESSURE`. Use
   `<button id="raToggleBtn" onclick="toggleOverride('ra')">`, `.ra-module` and an `ra:` field on
   every option. Keep `knee` and `lift` as they are.
3. **Overrides start off.** No pre-activation "for this profile". The Client Log bar reads the
   client file and offers TURN ON for the overrides that client needs.
4. **Phase 5 starts empty.** No pre-filled score (`value=""`) and no pre-ticked body check. A
   pre-filled 8/10 gets logged as the client's answer.

Also confirm or change the client-facing name, **The Lighter Body Programme**. The Architect approves
it before it shows in any portal.

Next: W2 (Spine that moves) on the same base. One complete file, nothing after `</html>`, with ID
`KIN-P021_W2`, arc `KIN-P021`, week 2, "Replaces: new".
