-- Sofitel FITNESS (22 Oct 2026): Swee Mei has never seen our first email (it went to Elisha), so her
-- card starts again at Found. Elisha's reply stays in the history. Send V12 (now a full introduction),
-- then tap MARK MESSAGED: her follow-ups count from that day. Terminal database (wpdidthdbfoualvnklwq).
update public.outreach_targets
set stage = 'found',
    next_step = 'Send V12 to Swee Mei: a full introduction, she has not seen our first email. Then MARK MESSAGED. Ask early: can outside drinks be served in the hotel?',
    next_date = '2026-10-23',
    updated_at = now()
where studio = 'Sofitel FITNESS' and stage = 'replied';
