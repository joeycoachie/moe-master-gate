-- Outreach batch B1 (KL, 20 Oct 2026): the email and WhatsApp messages + the first 6 studios.
-- Run AFTER 14_outreach_console.sql. Safe to run twice. Skip this file when building a demo copy.
--
-- Contacts checked on each studio's own website on 19 Oct 2026. The detail fills {detail} in the message.

insert into public.outreach_variants (code, body, angle)
values
  ('V3', E'Subject: A quick question about coaching at {studio}\n\nHi {name},\n\nI saw that {detail}.\n\nHow do you keep coaching plans consistent across your team while still tailoring them to each client?\n\nI''m working on a practical way to make that easier. Would you be open to a 15-minute call to compare notes?\n\nThanks,\nJoey',
   'Email: one real detail, then one question'),
  ('V4', E'Hi, I''m Joey. I saw that {detail}. Who would be the right person to speak with about how your coaches plan and track client training?',
   'WhatsApp / Instagram: ask who to talk to')
on conflict (code) do nothing;

insert into public.outreach_targets (studio, owner_name, area, contact, fit_note, batch, next_step, variant_id)
select s.studio, s.owner_name, s.area, s.contact, s.detail, 'B1 · KL · 20 Oct', s.next_step,
       (select id from public.outreach_variants where code = s.code)
from (values
  ('Peak Human Performance', 'Riad', 'Near KLCC',
   'Contact form: phpstrengthclinic.com (Contact Us) · Call +60 11-1425 4936 · IG @peakhumanperformance.kl',
   'your clinic near KLCC pairs strength coaching with a full recovery area',
   'Send V3 through the website contact form (no public email). Riad is the founder', 'V3'),
  ('Movement Dynamics', '', 'Bukit Damansara (Clearwater, near Semantan LRT)',
   'hello@movementdynamics.my · WhatsApp +60 19-913 7632',
   'you run daily check-ins to keep clients consistent',
   'Email first. No owner named on the site, ask for the head coach', 'V3'),
  ('MOVE Private Fitness', 'Vimal', 'Jalan Ampang (Pavilion Embassy)',
   'embassy@moveprivatefitness.com · WhatsApp +60 16-247 6683 · general: enquiry@moveprivatefitness.com',
   'your Jalan Ampang studio starts each new client with a health and fitness baseline before building the plan',
   'Email the Jalan Ampang branch. Vimal Wei-Shin is the branch manager', 'V3'),
  ('SOFIT', '', 'Setia Alam (3 Klang Valley studios)',
   'admin@sofit.my · WhatsApp +60 13-951 4305',
   'your Elite Care Program pairs personal training with physiotherapy',
   'Email first', 'V3'),
  ('TRIBE Fitness Studio', '', 'Mont Kiara + Bukit Kiara',
   'contact@findyourtribe.co · Tel +60 3-6411 7406 · IG @findyourtribe.co',
   'TRIBE is now an official HYROX affiliated gym',
   'Email first. HYROX link: the Hyrox Engine is a warm second conversation', 'V3'),
  ('MORPH', '', 'KL',
   'IG @morph.kl (no public email or phone confirmed)',
   '',
   'Instagram DM. Read their page and add one detail before sending', 'V4')
) as s(studio, owner_name, area, contact, detail, next_step, code)
where not exists (select 1 from public.outreach_targets t where t.studio = s.studio);
