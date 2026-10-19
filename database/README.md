# Database · the Terminal's Supabase blueprint

Every SQL file that built the Terminal's database (Supabase `wpdidthdbfoualvnklwq`), numbered
in the order they were run. **All 12 are already in the live database** (checked 16 Oct 2026).
Nothing here needs running again.

Why keep them: they are the recipe to build a fresh copy of the database, e.g. the demo Terminal
for BC3 (no client branding) or a new studio. Run them in number order on an empty project.
File 10 adds 4 real client names at the end; delete those lines when building a demo.

| # | File | What it built | Status |
|---|---|---|---|
| 01 | postural_assessments | Postural Diagnostic intake | in use |
| 02 | programming_log_schema | Station 8 group-class logs + V.A.E. feedback | in use |
| 03 | session_log_1on1_schema | 1-1 session log + saved sequences | in use |
| 04 | instructor_availability_schema | Station 10 availability + instructor roles | in use |
| 05 | movement_library_schema | Movement Library (draft, lock, version) | in use |
| 06 | programming_log_edit_and_score_migration | log edits + Biomechanical Score | in use |
| 07 | programming_log_duplicate_migration | "duplicate a past session" | in use |
| 08 | programming_log_architect_role_migration | Architect role on Station 8 | in use |
| 09 | instructor_availability_delete_policy_migration | Station 10 removals actually delete | likely run; safe to re-run if a removed slot comes back |
| 10 | client_arc_system_schema | client files, arc sessions, per-client ticks | in use |
| 11 | client_portal_schema | portal codes, unlocked fuel, RECUP.STN link | in use |
| 12 | client_checkins_schema | client daily check-ins | in use |
| 13 | recovery_measures | 0-10 check-ins, Recovery Window | see LEDGER 17 Oct |
| 14 | outreach_console | Outreach Console: studios, message tests (V1, V2 seeded), proof-of-work log | in use (run 19 Oct) |
| 15 | outreach_batch_b1 | Messages V3 (email) and V4 (WhatsApp/IG) + first 6 KL studios. Real data: skip for a demo copy | in use (run 19 Oct) |
| 16 | outreach_two_roads | Two roads (Kinetic Studio OS / Fuel RECUP pop-up), "use when" per message, V5 haze pop-up + V6 warm invite; Peak moved to Fuel | **to run** (20 Oct) |

New SQL goes here as `17_<name>.sql`, with a row in this table.
