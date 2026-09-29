# M.O.E. Terminal — Change Log & Overview

Last updated: 2026-09-29 · Latest commit: `15b1678`

---

## 1. Overview — what's live and who it's for

### Instructor side (alias login at `/` → `/terminal`)

| Station | Route | What it does |
|---|---|---|
| 03 | `/terminal/reformer-doctrine` | Reformer Doctrine reference |
| 07 / 08 | `/terminal/programming-log` | Class Programming & V.A.E. Log. Instructors log group classes (Biomechanical Score 2–30, duplicate-from-past, edit until reviewed). Also has Mentor/Auditor mode, the Movement Library (draft → lock → version) and the **🔒 Architect View** |
| 08 (1-1) | `/terminal/session-log` | 1-1 session log + saved sequence vault (the studio runs no 1-1s yet) |
| 10 | `/terminal/availability` | Monthly AM/PM availability. Toggles are staged locally, then **Confirm & Lock In** writes them. Admin governance panel |
| — | `/terminal/postural-diagnostic`, `/terminal/diagnostic-science` | Postural intake + diagnostic science |

### Ops side (passcode login at `/ops/login`) — Danny's lane

| Route | What Danny gets |
|---|---|
| `/ops/roster` (lands here after login) | Month/year → locked-in shifts table, **Export to CSV**, 🔥 utilization heatmap toggle |
| `/ops/dashboard` | Command Center. Pillar 1 = group-class programming logs, avg Biomechanical Score, V.A.E. audit note + cadence (due at 5 classes, overdue at 10). Pillars 2–3 locked (no data model yet) |

Danny does **not** see the biweekly training planner or any link to the Architect page.

### Architect side (founder only)

| Where | What | Access |
|---|---|---|
| `/ops/architect` — "Training Command" | Biweekly Training Planner: best weekday AM/PM slots two weeks apart, fewest sessions covering everyone, who hasn't submitted, half-filled warnings. Reference only; the founder sets the final time | Go to the URL and enter the SYNC.OP code (also grants Ops access). Override via `OPS_ARCHITECT_PASSCODE` |
| Station 8 → 🔒 corner icon | Architect View: every instructor's full programming logs + V.A.E. feedback, uncapped, read-only, searchable | Instructor login with `instructors.role = 'architect'` |

`/ops/architect` links to both PROGRAMMING (Station 8) and ROSTER.

---

## 2. Cadence — every change, by date

### Sep 29
- **Planner moved to its own Architect page** (`15b1678`). Biweekly planner removed from Danny's Roster Export and moved to `/ops/architect` behind the SYNC.OP code. It uses its own signed cookie, and logout clears it.

### Sep 25 — pilot launch day
- **Ops dashboard: audit cadence** (`495d338`). Replaced the feedback count with each instructor's latest V.A.E. audit note + classes since then.
- **Biweekly training planner + heatmap toggle** (`a21b507`). Auto-ranks slots and recommends the fewest biweekly sessions. The heatmap now sits behind a toggle.
- **Fix: Station 10 discards silently not deleting** (`f3a36a3`). With no RLS delete policy, deletes silently did nothing. Deletes now verify and report real errors. Adds a migration.

### Sep 20–22
- **Architect View corner icon** (`6307602`). The entry point became a faded 🔒 corner icon.
- **Architect View added to Station 8** (`fb91196`). Read-only, uncapped view of all programming + feedback. Adds a migration.
- **Ops lands on Roster Export; Pillar 1 re-sourced** (`b721acf`). Pillar 1 now reads group-class logs instead of 1-1 data.
- **`/ops/dashboard` Command Center** (`351cdec`).
- **Utilization heatmap on ops roster** (`8a08dfe`).
- **Duplicate-from-past-session in Station 8** (`0fade4a`). Adds a migration.

### Sep 9–10
- **God Mode ops roster, Movement Library, Station 8/10 fixes** (`ebc752e`). CSV export for Danny. Station 10 staged toggles. Station 8 Enter-key guard, edit-until-reviewed, Biomechanical Score, tooltips.
- **Roster includes instructor-submitted shifts, not just admin-booked** (`5abada1`).
- **Roster button wording: Load Data → Refresh** (`aa362a0`).

### Aug 12 – Sep 7 — foundation
- Master Gate + Incubator auto-routing, enterprise footer on every page, diagnostic tools unified.
- Postural Diagnostic intake, Programming & V.A.E. Log rebuilt in-repo, Reformer Doctrine as Station 03.
- Production build finalized for live deploy (Sep 5).

---

## 3. Open items

**Supabase migrations — confirm each has been run in the SQL editor:**
- [ ] `programming_log_architect_role_migration.sql`. Also set your own alias to `role = 'architect'`, or the Station 8 🔒 won't appear.
- [ ] `programming_log_edit_and_score_migration.sql`. Needed for log edits + the Biomechanical Score column.
- [ ] `programming_log_duplicate_migration.sql`
- [ ] `instructor_availability_delete_policy_migration.sql`. Needed for Station 10 removals to actually delete.
- [x] `movement_library_schema.sql` (confirmed run)

**Deploy:** push `main` so `/ops/architect` goes live.

**Hardening (optional):** the Architect code is short and the login screens don't rate-limit guesses. Set a longer `OPS_ARCHITECT_PASSCODE` if anything sensitive moves onto that page.

**Deferred, not built:**
- Station 8 Architect Phase 2: mark good programming as a canonical 60-min protocol (needs a spec first).
- Training cadence switches biweekly → monthly after N sessions (N not set yet).
- LLM-assisted session-intention generation.
- Ops dashboard Pillars 2–3 (pricing elasticity, cohorts) need data models.
- Newsletter/education sent when availability is submitted.
