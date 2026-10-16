-- Recovery measures (client portal, 17 Oct 2026). Run once in Supabase → SQL Editor.
-- 1. Check-ins move from 1-5 to 0-10, the scales studies use, so results can be quoted:
--    body   = discomfort in the client's focus area (0 none, 10 worst): the Numeric Pain Rating Scale.
--    sleep  = sleep quality last night (0 very poor, 10 excellent): the single-item Sleep Quality Scale.
--    energy = energy today (0 exhausted, 10 full of energy).
--    Existing 1-5 answers stay valid inside 0-10.
-- 2. clients.tracking_focus: the area a client tracks, e.g. "Right wrist". Set in the client file.
-- 3. client_requests (end of file).

alter table public.client_checkins
  drop constraint if exists client_checkins_energy_check,
  drop constraint if exists client_checkins_sleep_check,
  drop constraint if exists client_checkins_body_check;

alter table public.client_checkins
  add constraint client_checkins_energy_0_10 check (energy between 0 and 10),
  add constraint client_checkins_sleep_0_10 check (sleep between 0 and 10),
  add constraint client_checkins_body_0_10 check (body between 0 and 10);

comment on column public.client_checkins.body is 'Discomfort in the client''s tracking focus area, 0 none to 10 worst (NPRS).';

alter table public.clients add column if not exists tracking_focus text;

revoke all on public.client_checkins, public.clients from anon, authenticated;

-- 3. client_requests: a client taps "I'm interested" on a product their plan pairs with. The
--    founder sees it in the client file and brings it up at the next session.
create table if not exists public.client_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  item_key text not null,
  created_at timestamptz not null default now(),
  unique (client_id, item_key)
);
alter table public.client_requests enable row level security;
revoke all on public.client_requests from anon, authenticated;
