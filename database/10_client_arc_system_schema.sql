-- Client Arc System: client profiles + per-session station ticks, layering notes and Phase 5 results
-- for every Armory arc. Run once in Supabase → SQL Editor.
--
-- Privacy: these tables hold health notes. Row Level Security is ON with NO policies, and the
-- public (anon) key is revoked, so the only way in is the server-side service key used by the
-- Terminal's /ops/api routes, which themselves require the SYS.OP Architect cookie.

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null unique,
  format text not null default '1-1' check (format in ('1-1', 'group')),
  group_label text,
  history text not null default '',
  conditions text not null default '',
  avoid text not null default '',
  current_arc text,
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.arc_sessions (
  id uuid primary key default gen_random_uuid(),
  protocol_id text not null,
  session_date date not null,
  flow_format text,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists arc_sessions_protocol_date on public.arc_sessions (protocol_id, session_date);

-- One row per client per session. `stations` is keyed "phase.M1" so any arc built on the
-- SYS-D022 V2 template works without new columns:
--   {"primer.M1": {"done": true, "apparatus": "reformer", "movement": "...", "note": "..."}}
-- `audit` holds the Phase 5 gates, body checks, notes and verdict for that client.
create table if not exists public.arc_session_entries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.arc_sessions (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete restrict,
  stations jsonb not null default '{}'::jsonb,
  audit jsonb,
  updated_at timestamptz not null default now(),
  unique (session_id, client_id)
);
create index if not exists arc_session_entries_client on public.arc_session_entries (client_id);

alter table public.clients enable row level security;
alter table public.arc_sessions enable row level security;
alter table public.arc_session_entries enable row level security;
revoke all on public.clients, public.arc_sessions, public.arc_session_entries from anon, authenticated;

-- The founder's current clients (10 Oct 2026).
insert into public.clients (full_name, format, group_label, current_arc, history)
values
  ('Eleine Wong', '1-1', null, 'KIN-P016', 'About 3 cycles in. On Upper Crossed to build her shoulder frame; few problems.'),
  ('Mae Lim', 'group', 'Family trio', 'KIN-P019', 'Knee/nerve case (KIN-P019 W1) and the RA override.'),
  ('Pei Suen', 'group', 'Family trio', null, ''),
  ('Zi Suen', 'group', 'Family trio', null, '')
on conflict (full_name) do nothing;
