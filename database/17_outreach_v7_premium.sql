-- Outreach V7 (20 Oct 2026): the Recovery Omakase hook for premium studios that already run brand collaborations.
-- Fuel road. Passes the SYS-D028 check. Run once in Supabase → SQL Editor after 16. Safe to run twice.
insert into public.outreach_variants (code, body, angle, road, use_when)
values
  ('V7', E'Hi {name}, Joey here. Brands sample drinks at studios all the time. We do it differently. Each member does a 60-second check-in and gets the drink that fits today''s session. You get the numbers after. Could we run one Recovery Omakase after your busiest class?',
   'Premium studio: what makes us different from a brand booth', 'fuel',
   'Cold, first touch. Premium studios that already run brand collaborations. Send the deck as a PDF if they reply.')
on conflict (code) do nothing;
