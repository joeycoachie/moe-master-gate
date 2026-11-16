-- Outreach Console, 16 Nov 2026. Terminal database (wpdidthdbfoualvnklwq). Safe to run twice.
-- 1. TRIBE: today's call went unanswered → visit tomorrow (17 Nov, 11:30 block is on the calendar).
-- 2. Sofitel: Swee Mei's one-screen summary sent today → call her Thursday 19 Nov.
-- 3. Shows MOVE's card so we can see why the call step (V15) is not showing.

-- 0. Fix (run 16 Nov failed here): the live table was made before 'call' and 'visit' existed, so it
--    refused them. This also broke the console's LOG: CALL / LOG: VISIT buttons. Now it accepts all six.
alter table public.outreach_events drop constraint if exists outreach_events_kind_check;
alter table public.outreach_events add constraint outreach_events_kind_check
  check (kind in ('stage', 'followup', 'call', 'visit', 'note', 'lesson'));

insert into public.outreach_events (target_id, variant_id, kind, body)
select id, variant_id, 'call', 'Called 16 Nov, no answer. Visit booked for 17 Nov.'
from public.outreach_targets t
where studio ilike 'tribe%'
  and not exists (select 1 from public.outreach_events e where e.target_id = t.id and e.kind = 'call' and e.created_at::date = date '2026-11-16');

update public.outreach_targets
set next_step = 'Visit 11:30: leave the one-page plan (V16). Then LOG: VISIT.',
    next_date = '2026-11-17', last_touch_at = now(), updated_at = now()
where studio ilike 'tribe%';

insert into public.outreach_events (target_id, variant_id, kind, body)
select id, variant_id, 'followup', 'Final email 16 Nov: one-screen summary, no attachments, "Is that fair?", call on Thursday.'
from public.outreach_targets t
where studio = 'Sofitel FITNESS'
  and not exists (select 1 from public.outreach_events e where e.target_id = t.id and e.kind = 'followup' and e.created_at::date = date '2026-11-16');

update public.outreach_targets
set owner_name = coalesce(nullif(owner_name, ''), 'Swee Mei Tew'),
    next_step = 'Call Swee Mei: mobile 012-330 8702 first, then hotel 03-2720 6688 (ask for her by name). Unless she replied.',
    next_date = '2026-11-19', last_touch_at = now(), updated_at = now()
where studio = 'Sofitel FITNESS';

-- Paste the result of this back to Claude.
select t.studio, t.stage, t.next_step, t.next_date,
       (select count(*) from public.outreach_events e where e.target_id = t.id and e.kind = 'followup') as followups,
       (select max(e.created_at)::date from public.outreach_events e where e.target_id = t.id and e.kind = 'followup') as last_followup,
       (select count(*) from public.outreach_events e where e.target_id = t.id and e.kind = 'call') as calls
from public.outreach_targets t
where t.studio ilike 'move%' or t.studio ilike 'tribe%' or t.studio = 'Sofitel FITNESS';
