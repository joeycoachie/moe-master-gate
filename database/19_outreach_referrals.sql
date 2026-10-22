-- Outreach referrals (22 Oct 2026): who gave us the right person's name, plus the Sofitel reply.
-- Run once in the Terminal's Supabase (wpdidthdbfoualvnklwq) → SQL Editor. Safe to run twice.

alter table public.outreach_targets add column if not exists referred_by text not null default '';

-- The referral message. The console keeps its wording up to date from lib/outreach.ts (V12).
insert into public.outreach_variants (code, body, angle, road, use_when)
values ('V12', 'Subject: {referrer} suggested I write to you', 'Referral: someone named who to contact', 'fuel', 'Warm. Someone at the studio named the right person.')
on conflict (code) do nothing;

-- Sofitel FITNESS: emailed 20 Oct 1:04 PM. Elisha Frankie (Spa Supervisor) replied 1:29 PM and named
-- Swee Mei Tew, Spa & Wellness Manager. Adds the studio if it was never added from the Suggested box.
insert into public.outreach_targets (studio, area, contact, fit_note, batch, road)
select 'Sofitel FITNESS', 'Sofitel KL Damansara hotel · level 3', '', 'your members already get the pool, sauna and spa', 'B2 · Hotel gyms', 'fuel'
where not exists (select 1 from public.outreach_targets where studio = 'Sofitel FITNESS');

update public.outreach_targets
set owner_name = 'Swee Mei',
    referred_by = 'Elisha',
    contact = 'Sweemei.TEW@sofitel.com (Swee Mei Tew, Spa & Wellness Manager) · referred by Elisha.Frankie@sofitel.com (Spa Supervisor) · Tel +603 2720 6688',
    road = 'fuel',
    variant_id = (select id from public.outreach_variants where code = 'V12'),
    stage = case when stage in ('found', 'messaged') then 'replied' else stage end,
    stage_at = stage_at
      || jsonb_build_object('messaged', coalesce(stage_at ->> 'messaged', '2026-10-20T05:04:00Z'))
      || jsonb_build_object('replied', coalesce(stage_at ->> 'replied', '2026-10-20T05:29:00Z')),
    next_step = 'Email Swee Mei (V12). Mention Elisha suggested it. Ask early: can outside drinks be served in the hotel?',
    next_date = '2026-10-23',
    last_touch_at = '2026-10-20T05:29:00Z',
    updated_at = now()
where studio = 'Sofitel FITNESS';

insert into public.outreach_events (target_id, kind, body)
select id, 'note', 'Reply 20 Oct 1:29 PM from Elisha Frankie, Spa Supervisor: contact Swee Mei Tew, Spa & Wellness Manager, Sweemei.TEW@sofitel.com'
from public.outreach_targets t
where studio = 'Sofitel FITNESS'
  and not exists (select 1 from public.outreach_events e where e.target_id = t.id and e.body like 'Reply 20 Oct 1:29 PM%');
