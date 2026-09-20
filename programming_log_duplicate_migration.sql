-- Incremental migration on top of programming_log_schema.sql +
-- programming_log_edit_and_score_migration.sql:
--   Lets an instructor duplicate a past log as a starting draft for a new session.
--   duplicated_from_log_id is only ever set when the submitted content is byte-for-byte
--   identical to the source log (checked client-side before insert) -- if the instructor
--   changes anything, it submits as null and the log is indistinguishable from one written
--   from scratch. Set null on delete so removing a source log doesn't cascade-delete its copies.

alter table programming_logs
  add column if not exists duplicated_from_log_id uuid references programming_logs(id) on delete set null;
