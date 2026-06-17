create table if not exists public.gym_profiles (
  profile_slug text primary key,
  profile_name text not null,
  sessions jsonb not null default '[]'::jsonb,
  exercises jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.gym_profiles enable row level security;

drop policy if exists "Gym profiles public read" on public.gym_profiles;
drop policy if exists "Gym profiles public insert" on public.gym_profiles;
drop policy if exists "Gym profiles public update" on public.gym_profiles;

create policy "Gym profiles public read"
on public.gym_profiles for select
using (true);

create policy "Gym profiles public insert"
on public.gym_profiles for insert
with check (true);

create policy "Gym profiles public update"
on public.gym_profiles for update
using (true)
with check (true);
