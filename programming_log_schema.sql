-- Instructor's own post-session log
create table if not exists programming_logs (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references instructors(id),
  instructor_name text not null,
  client_name text not null,
  session_date date not null default current_date,
  class_tier text not null,                -- 'Control' | 'Capacity' | 'Flow'
  taxonomy_justification text not null,     -- why this tier, every time (anti-drift)
  apparatus_base text not null,             -- e.g. "Reformer + Barrel"
  apparatus_modifiers text[] not null default '{}',   -- e.g. ["Foam Roller"]
  session_intention text,
  planes_tags text[] not null default '{}',
  stabilisation_tags text[] not null default '{}',
  biomechanical_tags text[] not null default '{}',
  movement_sequence jsonb not null default '[]',  -- [{name, spring, reps}]
  reflection text,
  created_at timestamptz not null default now()
);

-- Mentor/Auditor V.A.E. feedback, one row per audited log
create table if not exists vae_feedback (
  id uuid primary key default gen_random_uuid(),
  log_id uuid not null references programming_logs(id) on delete cascade,
  instructor_id uuid references instructors(id),   -- denormalized for cheap realtime filtering
  mentor_name text not null,
  category text not null,        -- Room Command / Biomechanics / Class Vibe / Client Sales / Client Care
  validate_text text not null,
  align_text text not null,
  elevate_text text not null,
  created_at timestamptz not null default now()
);

alter table programming_logs enable row level security;
alter table vae_feedback enable row level security;

create policy "Allow anon insert" on programming_logs for insert to anon with check (true);
create policy "Allow anon select" on programming_logs for select to anon using (true);

create policy "Allow anon insert" on vae_feedback for insert to anon with check (true);
create policy "Allow anon select" on vae_feedback for select to anon using (true);

-- Realtime needs the table added to the publication
alter publication supabase_realtime add table vae_feedback;
