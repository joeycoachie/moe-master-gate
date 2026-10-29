# Transmission to KA-Alex · 29 Oct 2026 · KIN-P019 W3: restore the V2.2 triage layer

From: The Architect. Paste everything below the line into KA-Alex.

---

KA-Alex, KIN-P019 W3 (Isometric Hinge & Tendon Analgesia) is live. The Setup / Action / Breath /
Layer format is clear on the floor; keep it. One gap: W3 was written on the old single-override
format (V2.1). This arc runs on SYS-D022 V2.2 (locked 19 Oct), and W2 already carries the triage
layer. Overrides introduced in an arc carry forward to every later week of that arc.

Reissue W3 as one complete file, nothing after `</html>`, with:

1. **The three overrides from W2, same keys and labels:**
   - `ra` → `[ ] NERVE / KNEE SHEAR` (W3 currently says KNEE / NERVE OVERRIDE; use W2's label)
   - `clavicle` → `[ ] ACUTE CLAVICLE / PEC FLUSH`
   - `arch` → `[ ] PRONATION / ARCH TENSION`
   Each is `<button id="<key>ToggleBtn" onclick="toggleOverride('<key>')">`, with a `.<key>-module`
   cue under every station, and one field per key on every option (`ra`, `clavicle`, `arch`).
2. **Triage Doctrine (T1):** in Primer and Unwind an override may change the movement. In Anchor and
   Crucible the movement stays and the override only adds a safety cue.
3. **Gate 03 back to Triage Resolution**, as in W2:
   `PASSED (Overrides reduced acute pain)` / `FAIL: Clavicle/Foot/Knee pain persists`.
   Rotational Control can move into the Gate 02 question or the body checks, your call.
4. **Body checks:** keep `som-pilo` (nerve alert) and add one for the foot/arch if it fits this week.
5. Keep `function toggleRA() { toggleOverride('ra'); }` and write degrees as plain text (30–45°), not
   `$30^\circ$`.

Then queue W4 (Gait & Coronal Integration: step-ups and foot mechanics) on the same V2.2 base. The
arch override matters most there.
