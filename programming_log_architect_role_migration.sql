-- Adds a third instructors.role value, 'architect', alongside the existing
-- 'instructor' / 'admin' (see instructor_availability_schema.sql).
--
-- The Architect role gates a new read-only "Architect View" mode on Station 8
-- (/terminal/programming-log) — a full, uncapped list of every instructor's
-- submitted programming_logs plus attached vae_feedback, with no edit/delete
-- controls. It is a normal instructor row with an elevated role, not a
-- separate login system.
--
-- The original check constraint from instructor_availability_schema.sql was
-- declared inline with no explicit name, so Postgres auto-named it
-- "instructors_role_check" (the default <table>_<column>_check pattern). If
-- this DROP fails because your instance named it something else, find the
-- real name first with:
--   select conname from pg_constraint where conrelid = 'instructors'::regclass and contype = 'c';
alter table instructors drop constraint if exists instructors_role_check;
alter table instructors add constraint instructors_role_check
  check (role in ('instructor', 'admin', 'architect'));

-- Run this yourself with your own alias once the constraint above is in place:
--   update instructors set role = 'architect' where alias = 'YOUR_ALIAS_HERE';
