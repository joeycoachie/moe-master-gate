-- Incremental migration on top of programming_log_schema.sql:
--   1. Instructors can now edit their own logs (the app additionally guards this at the
--      UI layer — editing is blocked once a log has vae_feedback attached, so a mentor's
--      review can't be silently rewritten out from under them).
--   2. Adds the computed Biomechanical Score (Planes x Actions + Stabilization, 1/3/5-banded
--      by how many tags are selected in each group; range 2-30) so it can be stored and
--      shown in history instead of only recomputed live in the form.

alter table programming_logs add column if not exists biomechanical_score int;

create policy "Allow anon update" on programming_logs for update to anon using (true);
