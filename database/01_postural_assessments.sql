create table if not exists postural_assessments (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references instructors(id),
  instructor_name text,
  client_name text not null,
  findings jsonb not null,
  recommended_focus text,
  notes text,
  created_at timestamptz not null default now()
);

alter table postural_assessments enable row level security;

create policy "Allow anon insert" on postural_assessments
  for insert to anon
  with check (true);

create policy "Allow anon select" on postural_assessments
  for select to anon
  using (true);
