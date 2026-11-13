# Database · the Terminal's Supabase blueprint

Every SQL file that built the Terminal's database (Supabase `wpdidthdbfoualvnklwq`), numbered
in the order they were run. **All 12 are already in the live database** (checked 16 Oct 2026).
Nothing here needs running again.

Why keep them: they are the recipe to build a fresh copy of the database, e.g. the demo Terminal
for BC3 (no client branding) or a new studio. Run them in number order on an empty project.
File 10 adds 4 real client names at the end; delete those lines when building a demo.

| # | File | What it built | Status |
|---|---|---|---|
| 01 | postural_assessments | Postural Diagnostic intake | live table was an older version; fixed by 24 |
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
| 16 | outreach_two_roads | Two roads (Kinetic Studio OS / Fuel RECUP pop-up), "use when" per message, V5 haze pop-up + V6 warm invite; Peak moved to Fuel | in use (run 20 Oct) |
| 17 | outreach_v7_premium | V7: Recovery Omakase hook for premium studios (Fuel road) | not needed: since 20 Oct the console loads every message from lib/outreach.ts itself |
| 18 | recup_team | RECUP.STN team: partners (team codes), their studio claims and touches. One studio, one owner | in use (checked 13 Nov) |
| 19 | outreach_referrals | 'Referred by' on studios + Sofitel reply logged (Swee Mei via Elisha) | in use (run 22 Oct) |
| 20 | sofitel_restart | Sofitel card back to Found for Swee Mei (referral restart) | **do not run** (overtaken: Swee Mei already replied, 26 Oct) |
| 21 | client_readiness | Readiness profile per client: safety check, lifestyle, commitment, score | in use (checked 13 Nov) |
| 22 | client_packages | Session packages: sessions left, payment due, last updated (portal corner + client file) | in use (run 2 Nov) |
| 23 | custom_requests | 'Something else in mind?' free-text programme requests from the portal | **to run** (2 Nov) |

| 24 | station07_postural_fix | Station 07 fix: 3 missing columns added, public reads closed (instructors can still log). Real-client seed files are kept off the repo | **to run** (10 Nov) |

| 25 | postural_rebuild | Live postural table was a different old version (findings = uuid): rebuilt while empty, insert-only for the public key | **to run** (10 Nov) |

New SQL goes here as `26_<name>.sql`, with a row in this table.
