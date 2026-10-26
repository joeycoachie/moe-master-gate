-- Client readiness profile (client portal, 26 Oct 2026). Run once in Supabase → SQL Editor.
-- One row per client: their answers to the three short parts (safety check, lifestyle, commitment),
-- the readiness score worked out from them, and whether any safety answer needs the coach's look.
-- Health data: RLS on, no policies, anon/authenticated revoked. Only the server (service key) reads it.

create table if not exists public.client_readiness (
  client_id uuid primary key references public.clients (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  safety_flag boolean not null default false,
  score smallint check (score between 0 and 100),
  parts_done smallint not null default 0 check (parts_done between 0 and 3),
  updated_at timestamptz not null default now()
);

alter table public.client_readiness enable row level security;
revoke all on public.client_readiness from anon, authenticated;
