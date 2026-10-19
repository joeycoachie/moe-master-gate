-- Outreach Console: two roads on one skeleton (20 Oct 2026).
--   kinetic = Kinetic Studio OS (ends in a signed 90-Day Setup)
--   fuel    = RECUP.STN recovery pop-up (the small first yes; leads into the kinetic road)
-- Plus "use when" on every message: who it is for and where they are in the pipeline.
-- Run once in Supabase → SQL Editor after 14 and 15. Safe to run twice.

alter table public.outreach_variants add column if not exists road text not null default 'kinetic';
alter table public.outreach_variants add column if not exists use_when text not null default '';
alter table public.outreach_targets add column if not exists road text not null default 'kinetic';

do $$ begin
  alter table public.outreach_variants add constraint outreach_variants_road check (road in ('kinetic', 'fuel'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.outreach_targets add constraint outreach_targets_road check (road in ('kinetic', 'fuel'));
exception when duplicate_object then null; end $$;

-- When to use the first four (all Kinetic road).
update public.outreach_variants set use_when = 'Cold, first touch. An owner who is drowning in admin.' where code = 'V1' and use_when = '';
update public.outreach_variants set use_when = 'Cold, first touch. An owner who cares about clients getting hurt.' where code = 'V2' and use_when = '';
update public.outreach_variants set use_when = 'Cold email, when you found one real detail on their website.' where code = 'V3' and use_when = '';
update public.outreach_variants set use_when = 'Cold chat, when you don''t know who decides. Asks who to talk to.' where code = 'V4' and use_when = '';

-- The two Fuel messages (both pass the SYS-D028 check, 20 Oct 2026).
insert into public.outreach_variants (code, body, angle, road, use_when)
values
  ('V5', E'Hi {name}, Joey here. With the haze keeping runs indoors, we''re testing a one-day recovery pop-up inside a few studios. Drinks, a short check-in, nothing for you to set up. Could {studio} be one of them?',
   'Haze pop-up: lead with what is happening now', 'fuel',
   'Cold, first touch. Studios whose members run or train outdoors. Only while the haze lasts. Send with one photo of the station.'),
  ('V6', E'Hi {name}, Joey here. Thanks for your time at {studio}. I''d like to return the favour. Come by RECUP.STN HQ for a drink on us and a proper chat about recovery. Does Thursday or Friday suit you?',
   'Warm invite: return the favour', 'fuel',
   'Warm. After you have met them in person. This is the gift follow-up.')
on conflict (code) do nothing;

-- Peak Human Performance: already visited, spoke to Riad in person (before 20 Oct). Fuel road, warm invite next.
update public.outreach_targets
set road = 'fuel',
    variant_id = (select id from public.outreach_variants where code = 'V6'),
    stage = 'call_held',
    stage_at = jsonb_build_object('messaged', now(), 'replied', now(), 'call_booked', now(), 'call_held', now()),
    last_touch_at = now(),
    next_step = 'Send V6: invite Riad to RECUP.STN HQ, Thu or Fri',
    updated_at = now()
where studio = 'Peak Human Performance' and stage = 'found';

insert into public.outreach_events (target_id, kind, body)
select id, 'note', 'Visited Peak and spoke to Riad in person (before 20 Oct). Logged 20 Oct.'
from public.outreach_targets
where studio = 'Peak Human Performance'
  and not exists (select 1 from public.outreach_events e where e.target_id = outreach_targets.id and e.kind = 'note');
