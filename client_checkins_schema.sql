-- Client daily check-ins (client portal, 16 Oct 2026).
-- Run once in Supabase → SQL Editor, after client_portal_schema.sql.
-- One row per client per day: how they feel (1-5) and whether they took their fuel.
-- Clients write their own row through the Terminal's /portal/api/checkin (signed cookie, service
-- key). RLS stays on with no policies and anon/authenticated get no rights.

create table if not exists public.client_checkins (
  client_id uuid not null references public.clients (id) on delete cascade,
  day date not null,
  energy smallint check (energy between 1 and 5),
  sleep smallint check (sleep between 1 and 5),
  body smallint check (body between 1 and 5),
  fuel_taken boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (client_id, day)
);

alter table public.client_checkins enable row level security;
revoke all on public.client_checkins from anon, authenticated;
