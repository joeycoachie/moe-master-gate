-- Session packages (client portal, 2 Nov 2026). Run once in Supabase → SQL Editor.
-- A client buys N sessions (e.g. 10). Every session logged for them on or after counts_from
-- (arc sessions and extra sessions) uses one. The portal shows sessions left, when the file was
-- last updated and when the next payment is due. One active package per client.

create table if not exists public.client_packages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  sessions_total integer not null check (sessions_total between 1 and 200),
  counts_from date not null,
  price_rm numeric(10, 2),
  paid_on date,
  payment_due date,
  note text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists client_packages_one_active on public.client_packages (client_id) where active;

alter table public.client_packages enable row level security;
revoke all on public.client_packages from anon, authenticated;
