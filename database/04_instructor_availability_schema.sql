-- Instructor availability submission + Ops governance dashboard

alter table instructors add column if not exists role text not null default 'instructor'
  check (role in ('instructor', 'admin'));

create table if not exists instructor_availability (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references instructors(id) not null,
  instructor_name text not null,
  schedule_cycle text not null,        -- e.g. '2026-10', the month this row is for
  available_date date not null,
  time_slot text not null check (time_slot in ('AM', 'PM')),
  status text not null default 'available'
    check (status in ('available', 'pending_ops_approval', 'booked', 'rejected')),
  submitted_at timestamptz not null default now(),
  unique (instructor_id, available_date, time_slot)
);

alter table instructor_availability enable row level security;

create policy "Allow anon select" on instructor_availability for select to anon using (true);
create policy "Allow anon insert" on instructor_availability for insert to anon with check (true);
create policy "Allow anon update" on instructor_availability for update to anon using (true);
