# Transmission to KA-Alex · 10 Nov 2026 · FINAL · Standing rules + correction to KIN-T007 + new arc KIN-P021

From: The Architect. Paste everything below the line into KA-Alex.

---

KA-Alex, three things: standing rules, a correction, then a new arc.

## 0. Standing rules (add these to your base prompt; they apply to every client from now on)

- Posture, history and results come only from the coach's records (STOTT sheet in Station 07, the
  client file). Never infer them. If data is missing, ask.
- Be direct with the coach. With a distressed client, use the Safe Harbour tone: gentle, no pressure.
  "Brutally honest" is for the team, never for a struggling client.
- Name products only in the client's own portal, with founder-approved wording. Make no health claims.
- Programme cards stay client-agnostic (D3): no names, no health notes. Conditions become override toggles.

## 1. Correction: the KIN-T007 posture section is wrong. The coach's sheet wins.

Your dossier's Section 2.0 doesn't match the STOTT Postural Analysis Guide the coach filled in on
4 Nov 2026. From now on, the coach's sheet (logged in Station 07) is the only source for posture.
Never infer posture findings from body weight or a typical pattern.

| Segment | KIN-T007 said | Coach's sheet (truth) |
|---|---|---|
| Feet | everted / pronated, both | **R neutral, L inverted / supinated** (front and back views agree) |
| Ankles (side) | plantar flexed | **R plantar flexed, L neutral** |
| Knees (side) | hyperextended | **R hyperextended, L neutral** |
| Knees (front) | genu valgum | **neutral (no valgus)** |
| Femurs | medially rotated | **neutral** |
| Hip joints | not given | **neutral** |
| Pelvis | anterior tilt + left hip high | **anterior tilt + L side high** (agrees) |
| Lumbar | excessive extension (hyperlordosis) | **flat (decreased curve)** |
| Lower thoracic | not given | **neutral** |
| Upper thoracic | excessive flexion (kyphosis) | **flat (decreased curve)** |
| Cervical | excessive extension | **flat (decreased curve)** |
| Head | forward + left tilt | **forward, rotated clockwise, tilted L** |
| Rib cage | not given | **rotated clockwise** |
| Shoulders / scapulae | elevated, protracted, anteriorly tipped, both | **L shoulder elevated, L scapula elevated only** |
| Spine sequencing | not given | **flat areas: yes (upper); imbalances on palpation: no** |

What this changes in your reasoning:
- Not "Systemic Gravity Collapse" with Upper Crossed. The picture is a **flat, stiff spine**
  (lumbar, upper thoracic and cervical all flat), a forward head, a **right-side lock** (R ankle
  plantar flexed, R knee hyperextended) and a **left-side hike** (L pelvis, shoulder and scapula high),
  plus a clockwise twist through the ribs and head.
- No knee valgus and no medial femur rotation, so the anti-valgus rationale goes. Knee care is about
  the **right knee locking back** (soft knee, no end-range locking), not tracking.
- No hyperlordosis, so pelvic clocks are for **finding** a curve, not loosening an excessive one.
  Spinal articulation and gentle extension are on the menu (see the blood pressure rules below).
- The left foot rolls out (supinated) and the right foot is neutral. Don't use an arch-collapse override.

Keep these parts of KIN-T007. They are correct and approved:
- **Section 3.0 Safe Harbour:** no diet pressure yet, make the body weight feel lighter on the
  apparatus, and no awkward floor transitions.
- **Rule 1, blood pressure:**
  - no inversions (hips never above the head: no Short Spine, no Trapeze hanging, no deep downward dog)
  - no breath holding (long audible exhale through pursed lips on every effort)
  - staged transitions (supine → seated → wait 15 s → standing)
- **No heavy standing squats or lunges in the on-ramp.** Legs are built supine and closed chain.

Housekeeping: **KIN-T007 isn't an Archive ID** (T-007 is already the Peer Recon One-Sheet), and
there is no CL-007. Don't number client dossiers. Client files live in the Terminal, not in
the taxonomy.

## 2. New arc: KIN-P021 (ID confirmed by the Architect, 10 Nov 2026)

A client-agnostic arc for an archetype we'll see again. Per D3, the card carries no names and no
health notes. The client file maps people to the override toggles.

**Archetype:** deconditioned adult in their 60s, overweight, high blood pressure, inactive, feels
"stiff and heavy". Flat, stiff spine with a forward head, a one-sided lock in one leg and a one-sided
hike, and low confidence about their body.

**Working title:** Gravity Offload On-Ramp (rename it if you have a better one). Also give us a
client-facing name for the portal in plain words, in the style of "The Shoulder Frame Programme"
or "Strong Hips, Calm Knees".

**Length:** 4 weeks (W1–W4), then it hands over to a standing arc.

**Build on SYS-D022 V2.2:** Phases 2–3 (Anchor, Crucible) are the immutable arc. Phases 1 and 4
(Primer, Unwind) are fluid triage. Use the same Setup / Action / Breath / Layer format as KIN-P019 W3.

**Apparatus:** raised only. Reformer carriage, Cadillac bed, high box. No mat. No jumpboard in W1–W2.

**Overrides,** carried in every week from W1 (`toggleOverride('<key>')`, with a `.<key>-module` cue
under every station):
- `bp` → `[ ] HIGH BLOOD PRESSURE`. Adds the exhale cue, removes anything with hips above the
  head, and adds staged transitions between apparatus.
- `knee` → `[ ] KNEE LOCKS BACK`. Soft-knee cue, no end-range lockout in footwork or standing.
- `lift` → `[ ] OFFLOAD / NO FLOOR`. Swaps any floor or down-and-up station for a raised-apparatus
  version.

**Week themes (yours to refine):**
1. W1, Breath and finding the curve: diaphragmatic breathing, supine pelvic clocks to find neutral,
   footwork on light springs.
2. W2, Spine that moves: gentle supine and seated articulation on the Reformer and Cadillac, mid-back
   series supine, side-hip strength (clams, abduction) on the Cadillac bed.
3. W3, Even both sides: work on the hike side and the locked side (side-lying on the high box,
   single-leg footwork, rotation control seated).
4. W4, Up to standing: staged sit-to-stand, supported standing work, the hand-over gate to a
   standing arc.

**Phase 5 gates (exit of each week):** breath without holding (pass/fail), no dizziness on
transitions, and the client's own "I feel lighter" score (0–10). The coach logs these in the
[ CLIENT LOG ] bar.

**Return format:** one complete HTML file per week, nothing after `</html>`, with ID `KIN-P021_W1`
(etc.), arc `KIN-P021`, week number, and "Replaces: new". Send W1 first.
