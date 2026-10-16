-- Group-class Movement Library — reusable sequences instructors submit for permanent storage.
-- Draft rows are private working copies; submitting locks a row (immutable) and it joins the
-- shared library. Editing a locked row is not possible — create a new version instead, linked
-- back via parent_sequence_id. Category aggregation is deferred until ~100 entries accumulate,
-- so `category` stays nullable until that taxonomy is defined.
create table if not exists movement_library (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references instructors(id),
  instructor_name text not null,
  sequence_name text not null,
  class_tier text not null check (class_tier in ('Control', 'Capacity', 'Flow')),
  apparatus_base text not null,
  apparatus_modifiers text[] not null default '{}',
  movement_sequence jsonb not null default '[]',   -- [{name, spring, reps}]
  category text,                                     -- null until curated at ~100 entries
  status text not null default 'draft' check (status in ('draft', 'locked')),
  parent_sequence_id uuid references movement_library(id),
  use_count int not null default 0,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table movement_library enable row level security;

create policy "Allow anon select" on movement_library for select to anon using (true);
create policy "Allow anon insert" on movement_library for insert to anon with check (true);
create policy "Allow anon update" on movement_library for update to anon using (true);
create policy "Allow anon delete" on movement_library for delete to anon using (true);
