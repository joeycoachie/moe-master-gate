-- instructor_availability shipped with select/insert/update policies but no
-- delete policy. Under RLS a delete with no matching policy doesn't error — it
-- silently deletes 0 rows. So Station 10's "Confirm & Lock In" on a staged
-- REMOVING slot, and the admin panel's delete, both reported success while the
-- row stayed in the table (slot kept showing green on reload).
--
-- Opening delete to anon matches this table's existing convention: update is
-- already open to anon, which can overwrite any row, so this adds no new class
-- of exposure. The app layer still blocks instructors from removing 'booked' rows.
create policy "Allow anon delete" on instructor_availability for delete to anon using (true);
