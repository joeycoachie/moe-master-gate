-- Station 07 fix (10 Nov 2026). Run once in Supabase → SQL Editor.
--
-- 1. Station 07 (Postural Diagnostic) could never save on the live site: the live table was an
--    older version without instructor_name, recommended_focus and notes. This adds them.
-- 2. Postural findings are client health data, so the public key can no longer read them.
--    Instructors can still log (insert). The founder reads them in each client file (SYS.OP).
-- Client data (names, health notes) never goes in this repo. Seed files for real clients stay
-- on the founder's Mac (~/Downloads/MOE_private_sql) and are pasted into the SQL Editor after this.

alter table public.postural_assessments
  add column if not exists instructor_name text,
  add column if not exists recommended_focus text,
  add column if not exists notes text not null default '';

drop policy if exists "Allow anon select" on public.postural_assessments;
revoke select, update, delete on public.postural_assessments from anon, authenticated;
create index if not exists postural_assessments_client on public.postural_assessments (lower(client_name), created_at desc);
