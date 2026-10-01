# SYS-D022 (V2.0) — Master Battle Card Doctrine & Smart Biomechanical Template

- **Classification:** S-Rank System Architecture & AI Agent Master Prompt
- **Domain:** SYS-D022 (Enterprise UI/UX Standard) × KIN-P (Kinetic Playbooks)
- **Owner:** The Architect (Joey)
- **Biomechanical Strategist:** KA-Alex
- **Status:** Locked for global database & VS Code deployment
- **Canonical template:** `armory/protocols/KIN-P016_W1.html` (the pilot). Every new protocol starts as a copy of it with only `PROTOCOL_DB` swapped.

---

## 1.0 Change log — V1.0 → V2.0 (every protocol inherits these)

### 1.1 Biomechanical principles first — no cold loading in Phase 1
- **Flaw (v1):** Long Box Pulling Straps / high-leverage planks loaded in Phase 1 before scapular or cervical calibration.
- **Fix (v2):** Phase 1 (0:00–15:00, The Primer) enforces the STOTT 5 Basic Principles before load:
  - **M1 Scapular Isolation** — pure scapulothoracic protraction/retraction/depression, supported supine or low load (e.g. Reformer Supine Midback Glides, 2 Red), spine still.
  - **M2 Cervical & Ribcage Dissociation** — cranio-cervical nod, 3D lateral rib breathing with thoracic rotation, pelvis anchored.
  - **M3 Closed-Chain Series Prep** — quadruped serratus push-ups, 1-inch Bear/Elephant knee hovers (wakes the Phase 3 pathway).

### 1.2 No mechanical conflict in Phase 2 — stable base for oblique pulls
- **Flaw (v1):** Reformer Side Splits paired with Single-Arm Strap Row — couldn't row heavy or stabilise the splits.
- **Fix (v2):** Phase 2 (15:00–35:00, The Anchor) separates sagittal thoracic extension from contralateral oblique pulling:
  - **M1 Loaded Thoracic Extension** — Long Box Pulling Straps I & II (Plow & T-Pull) or Prone Swan, after Phase 1 calibrated depression.
  - **M2 Posterior Oblique Sling Transfer** — split-stance or half-kneeling contralateral row from a stable base (floor on Cadillac/Mat or locked kneeling on Reformer). Force runs anchored glute → thoracolumbar fascia → working lat.
  - **M3 Transverse Core & Coronal Lock** — Chair Crossover Step-Up to Halo, Short Box Oblique Twist, or Half-Kneeling Woodchop.

### 1.3 Unified ascending closed-chain series & lumbar protection in Phase 3
- **Flaw (v1):** Elephant / Up Stretch / Down Stretch / Long Stretch scattered across Phases 1 and 3; Slider Body Saw with sliders under forearms instead of feet; prone extensions with no L4–L5 pre-activation cue.
- **Fix (v2):** Phase 3 (35:00–55:00, The Crucible) is one Ascending Lever Series building on Phase 1 M3:
  - **M1 Level 1 Base (short-lever flexion)** — Elephant (Reformer) / Pike Pull-Up (Chair) / Slider Pike Scoops (Mat).
  - **M2 Level 2 Intermediate (kneeling anti-extension)** — Down Stretch (Reformer/Chair/PTB) / Kneeling Rollout to Sternum Lift (Mat).
  - **M3 Level 3 Peak (full-lever plank)** — Up Stretch into Long Stretch (Reformer) / Pedal Hover Plank to Pike (Chair) / Forearm Plank Body Saw, sliders under toes (Mat).
- **Mandatory prone extension rule:** any Superman Hold or Swan must cue *"Press pubic bone into the mat and squeeze glutes first (slight posterior pelvic tilt) before lifting the sternum."*

### 1.4 Mandatory 3-station Trio circuit & explicit rep/tempo
- Every active phase (1–4) has exactly 3 stations (M1, M2, M3), each with reps and eccentric tempo, e.g. `[10 Reps // 4s Eccentric]`. Zero dead time in Trio rotations.

### 1.5 Class & Hardware Matrix Engine
- Class Pax: 1 Solo | 2 Duet | 3 Trio | 4 Quad.
- Class structure: Station Rotation (circuit) vs Synchronized Flow (all M1 → M3).
- Live inventory counters: REFORMER, CADILLAC, CHAIR, BARREL.
- Per-station (M1/M2/M3) apparatus dropdowns: Reformer, Cadillac, Wunda Chair, Ladder Barrel, Mat/Bands/Sliders.
- AUTO-FIT: one click resolves hardware bottlenecks, or outputs a split-assignment plan in Synced mode.

### 1.6 Commander's Intent banner & Phase 5 Gate Audit
- **Commander's Intent banner** (always visible): biomechanical trajectory, primary target muscles, gate prerequisites.
- **Phase 5 — Gate Audit & Somatic Loop:**
  - Technical gate grading (Pass/Fail): Gate 01 Scapular Dissociation, Gate 02 Posterior Oblique Transfer, Gate 03 Long Stretch Series Ceiling.
  - Somatic interrogation: Target Hit (Mid-Back / Serratus / Deep Abs) vs Compensation Alerts (Neck/Upper Traps, L4–L5 Lumbar Pinch, Wrist/Forearm Grip Fatigue).
  - Automated routing verdict (cleared for next week vs specific regressions) + one-click COPY TELEMETRY REPORT.

---

## 2.0 Visual & technical UI mandate

- **Palette ("Quiet Good Taste"):** background `#050505`; surfaces `#0a0a0a` / `#111111`; borders `1px solid #333333`; accent `#00e5ff`; warning `#f59e0b`; fail `#ef4444`; RA medical `#3b82f6`.
- Sharp corners everywhere (`rounded-none`). Zero emojis.
- **Typography:** headers Playfair Display; body Inter; telemetry/clocks/tags/dropdowns JetBrains Mono.
- **Per phase:** 3 station cards (role tag, rep/tempo badge, apparatus dropdown, `shrink-0` checkbox, setup, execution, collapsible blue RA/Grip Override) + 3 intelligence cards:
  - **Wolf Cue** (biomechanical — anatomy/fascia, why this order)
  - **Shepherd Cue** (imagery — external, visceral client cue)
  - **Safety Gate** (red `#110505` / `border-red-500` — compensations that force an immediate regression)

---

## 3.0 Template

The full HTML/JS boilerplate (sidebar, flow clock, hardware matrix, 5-phase nav, Commander's Intent, logistics banner, Phase 5 audit engine) is the pilot file itself: `armory/protocols/KIN-P016_W1.html`. Don't maintain a second copy here.

## 4.0 PROTOCOL_DB schema (how to add a new week)

```javascript
const PROTOCOL_DB = {
  primer: {
    id: 'primer',
    title: '1. The Primer (Biomechanical Calibration)',
    subtitle: 'STOTT 5 Basic Principles & Series Prep (15 Mins)',
    clockHint: 'PHASE 1 TARGET: 0-15M',
    wolfCue: '[Why these 3 stations prepare the joints and fascia]',
    shepherdCue: '"[Visceral, external imagery cue for the client]"',
    safetyGate: '[Exact QA fail condition that forces an immediate regression]',
    stations: {
      M1: {
        role: '[Station 1 biomechanical objective]',
        options: {
          reformer: { name: '...', setup: '...', reps: '...', exec: '...', ra: '...' },
          cadillac: { name: '...', setup: '...', reps: '...', exec: '...', ra: '...' },
          chair:    { name: '...', setup: '...', reps: '...', exec: '...', ra: '...' },
          mat:      { name: '...', setup: '...', reps: '...', exec: '...', ra: '...' },
        },
      },
      M2: { /* same shape */ },
      M3: { /* same shape */ },
    },
  },
  anchor:   { /* Phase 2: stable-base oblique sling & extension */ },
  crucible: { /* Phase 3: unified ascending closed-chain series */ },
  unwind:   { /* Phase 4: deep front line & parasympathetic traction */ },
};
```

## 5.0 Rapid build prompt

> Generate [PROTOCOL_ID] strictly following the SYS-D022 V2.0 Master Battle Card Doctrine. Include: (1) Permanent Commander's Intent Banner, (2) Smart Class Logistics & Studio Hardware Inventory Matrix (1–4 Pax, Circuit vs. Synced, AUTO-FIT resolver), (3) Per-Station (M1, M2, M3) Apparatus Dropdowns across Reformer, Cadillac, Chair, Barrel, and Mat, (4) Phase 1 STOTT 5 Principles Calibration before load, (5) Phase 2 Stable-Base Oblique Sling & Prone Glute-Anchored Extension, (6) Phase 3 Unified Ascending Closed-Chain Series, (7) Wolf Cues, Shepherd Cues, Safety Gates, and per-station RA Overrides, and (8) Phase 5 Post-Class Gate Audit & Somatic Feedback Loop with one-click telemetry export.

## 6.0 Adding a protocol to the Armory

1. Copy the protocol HTML to `armory/protocols/<ID>.html` (ID = letters, digits, `_`, `-`).
2. Add an entry to `lib/armory.ts`.
3. It appears at `/ops/armory` behind the SYNC.OP Architect code.
