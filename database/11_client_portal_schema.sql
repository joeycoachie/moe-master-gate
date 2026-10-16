-- Client Portal (Kinetic menu, Pillar 3 "MOE-MASTER-GATE"), 16 Oct 2026.
-- Run once in Supabase → SQL Editor, after 10_client_arc_system_schema.sql.
-- Adds the portal fields to the existing clients table. No new tables, and no public access:
-- RLS stays on and anon/authenticated keep zero rights. Only the server (service key) reads these.

alter table public.clients
  add column if not exists portal_code_hash text,
  add column if not exists portal_enabled boolean not null default false,
  add column if not exists portal_code_set_at timestamptz,
  add column if not exists fuel_unlocked jsonb not null default '[]'::jsonb,
  add column if not exists recup_member_code text;

-- One code per client; the code itself is never stored, only its SHA-256 hash.
create unique index if not exists clients_portal_code_hash_key
  on public.clients (portal_code_hash) where portal_code_hash is not null;

comment on column public.clients.fuel_unlocked is
  'Fuel products unlocked for this client: [{"key":"niteworks","dose":"2 scoops in 300 ml cold water before bed"}]. Keys match lib/fuelCatalog.json.';
comment on column public.clients.recup_member_code is
  'This client''s RECUP.STN member code (RS-XXXX), linking the Kinetic and Fuel records without merging databases.';

revoke all on public.clients from anon, authenticated;
