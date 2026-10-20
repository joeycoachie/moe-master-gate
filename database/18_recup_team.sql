-- RECUP.STN team (outreach partners), 20 Oct 2026. Run once in the Terminal's Supabase → SQL Editor.
--
-- Partners sign in at the main gate with a team code (TEAM-NAME-123456), read the Team Guide and keep
-- their own studio log. The founder sees every partner's log at /ops/partners (SYS.OP).
-- Kept apart from the founder's Outreach Console tables on purpose. A studio can be claimed once:
-- studio_key is unique across all partners, and the API also checks the founder's own outreach list.
-- Privacy: studio contacts. RLS on, no policies, public key revoked; only the server's service key gets in.

create table if not exists public.recup_partners (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null default '',
  code_hash text unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.recup_partner_targets (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.recup_partners (id) on delete restrict,
  studio text not null,
  studio_key text not null unique,          -- lower-case name without spaces or symbols: one claim per studio
  area text not null default '',
  contact text not null default '',
  stage text not null default 'found' check (stage in ('found', 'messaged', 'replied', 'booked', 'held', 'no')),
  stage_at jsonb not null default '{}'::jsonb,
  next_step text not null default '',
  next_date date,
  notes text not null default '',
  last_touch_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists recup_partner_targets_partner on public.recup_partner_targets (partner_id);

create table if not exists public.recup_partner_events (
  id uuid primary key default gen_random_uuid(),
  target_id uuid not null references public.recup_partner_targets (id) on delete cascade,
  partner_id uuid not null references public.recup_partners (id) on delete restrict,
  kind text not null check (kind in ('stage', 'followup', 'note')),
  stage text,
  body text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists recup_partner_events_target on public.recup_partner_events (target_id);

alter table public.recup_partners enable row level security;
alter table public.recup_partner_targets enable row level security;
alter table public.recup_partner_events enable row level security;
revoke all on public.recup_partners, public.recup_partner_targets, public.recup_partner_events from anon, authenticated;
