-- Outreach Console (/ops/outreach): the studio list, the messages we test, and every touch as
-- proof of work. Feeds the Friday report and the auto-ticked steps. Run once in Supabase → SQL Editor.
--
-- Privacy: studio owners' names and contacts. Same rule as the client tables: RLS ON with NO
-- policies and the public key revoked, so only the server-side service key (behind SYS.OP) gets in.

-- The messages we test in small batches. {studio} and {name} are filled in per studio.
create table if not exists public.outreach_variants (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  body text not null,
  angle text not null default '',
  status text not null default 'testing' check (status in ('testing', 'winner', 'retired')),
  created_at timestamptz not null default now()
);

-- One row per studio. `stage` only moves forward except to 'no'; `stage_at` keeps the first time
-- each stage was reached, e.g. {"messaged": "2026-10-20T02:00:00Z", "replied": "..."}.
create table if not exists public.outreach_targets (
  id uuid primary key default gen_random_uuid(),
  studio text not null,
  owner_name text not null default '',
  area text not null default '',
  contact text not null default '',
  fit_note text not null default '',
  batch text not null default '',
  variant_id uuid references public.outreach_variants (id) on delete set null,
  stage text not null default 'found'
    check (stage in ('found', 'messaged', 'replied', 'call_booked', 'call_held', 'plan_sent', 'signed', 'no')),
  stage_at jsonb not null default '{}'::jsonb,
  friction text not null default '',
  next_step text not null default '',
  next_date date,
  followups int not null default 0,
  last_touch_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists outreach_targets_stage on public.outreach_targets (stage);

-- Every touch, stage change and lesson. This is the proof-of-work log.
create table if not exists public.outreach_events (
  id uuid primary key default gen_random_uuid(),
  target_id uuid references public.outreach_targets (id) on delete cascade,
  variant_id uuid references public.outreach_variants (id) on delete set null,
  kind text not null check (kind in ('stage', 'followup', 'call', 'visit', 'note', 'lesson')),
  stage text,
  body text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists outreach_events_created on public.outreach_events (created_at);

alter table public.outreach_variants enable row level security;
alter table public.outreach_targets enable row level security;
alter table public.outreach_events enable row level security;
revoke all on public.outreach_variants, public.outreach_targets, public.outreach_events from anon, authenticated;

-- The first two messages to test (both pass the SYS-D028 check, 19 Oct 2026).
insert into public.outreach_variants (code, body, angle)
values
  ('V1', 'You opened your studio to coach, not to chase spreadsheets. When every instructor tracks clients their own way, details get lost and clients drift. We set up one simple system for your floor: the same programme, every client''s progress on record. Can I show you in 15 minutes where your studio is losing time?',
   'Owner''s time: admin pain first'),
  ('V2', 'Quick question for {studio}. When a client with a sore knee joins a class, how does each instructor know what to change? Most studios keep that in WhatsApp or in one person''s head. We built a simple way to keep it on record for every client. Open to a 15-minute look?',
   'Client safety: a question, not a statement')
on conflict (code) do nothing;
