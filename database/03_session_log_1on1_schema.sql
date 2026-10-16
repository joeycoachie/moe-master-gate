-- 1-1 quick session log (full programming captured, tap-driven UI)
create table if not exists session_logs_1on1 (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references instructors(id),
  instructor_name text not null,
  client_name text not null,
  session_date date not null default current_date,
  apparatus text[] not null default '{}',           -- e.g. ["Reformer", "Tower"]
  max_tension text not null,                          -- highest spring load used, e.g. "2 Red"
  movement_sequence jsonb not null default '[]',      -- [{name, spring, reps}] — full programming
  kinetic_deviations text[] not null default '{}',    -- tapped anomalies, or "None / Neutral Alignment"
  performance_score int not null check (performance_score between 1 and 10),
  saved_sequence_name text,                            -- denormalized: name of the sequence this session was saved/loaded as
  created_at timestamptz not null default now()
);

-- Instructor's proprietary sequence library — the value-lock.
-- Tap-to-load into a new session_logs_1on1 entry; use_count tracks reuse
-- so the most-relied-on sequences surface first (and, later, feed an
-- aggregate "what actually works" system across instructors).
create table if not exists saved_sequences (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references instructors(id),
  instructor_name text not null,
  sequence_name text not null,
  apparatus text[] not null default '{}',
  max_tension text,
  movement_sequence jsonb not null default '[]',
  use_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table session_logs_1on1 enable row level security;
alter table saved_sequences enable row level security;

create policy "Allow anon insert" on session_logs_1on1 for insert to anon with check (true);
create policy "Allow anon select" on session_logs_1on1 for select to anon using (true);

create policy "Allow anon insert" on saved_sequences for insert to anon with check (true);
create policy "Allow anon select" on saved_sequences for select to anon using (true);
create policy "Allow anon update" on saved_sequences for update to anon using (true);
