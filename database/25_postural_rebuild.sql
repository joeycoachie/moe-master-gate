-- Station 07 rebuild (10 Nov 2026). Run once in Supabase → SQL Editor.
-- The live postural_assessments table was an older, different version (findings was a uuid, three
-- columns missing) and has never held a row. If it is still empty, this drops it and builds it to
-- the shape Station 07 writes. If it already has rows, nothing is dropped (check by hand first).

do $$
begin
  if to_regclass('public.postural_assessments') is not null
     and (select count(*) from public.postural_assessments) = 0 then
    drop table public.postural_assessments cascade;
  end if;
end $$;

create table if not exists public.postural_assessments (
  id uuid primary key default gen_random_uuid(),
  instructor_id text,
  instructor_name text,
  client_name text not null,
  findings jsonb not null default '{}'::jsonb,
  recommended_focus text,
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists postural_assessments_client on public.postural_assessments (lower(client_name), created_at desc);

-- Instructors (public key) may log; nobody but the server (service key) may read. Health data.
alter table public.postural_assessments enable row level security;
revoke all on public.postural_assessments from anon, authenticated;
grant insert on public.postural_assessments to anon, authenticated;
drop policy if exists "Allow anon insert" on public.postural_assessments;
create policy "Allow anon insert" on public.postural_assessments for insert to anon, authenticated with check (true);
