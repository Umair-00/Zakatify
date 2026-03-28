-- profiles table: stores user profile data linked to Supabase auth.users
-- Run this in the Supabase SQL Editor

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  first_name  text not null,
  last_name   text not null,
  country     char(2) not null,          -- ISO 3166-1 alpha-2 (e.g. 'US', 'CA')
  currency    char(3) not null default 'USD', -- ISO 4217 (e.g. 'USD', 'CAD')
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for faster lookups by name (future search/admin)
create index if not exists idx_profiles_last_name on public.profiles (last_name);

-- Auto-update updated_at on row change
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Row Level Security: users can only read/update their own profile
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Allow inserts from service role (backend) and from the user themselves
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Grant access to authenticated users
grant select, insert, update on public.profiles to authenticated;

-- Grant full access to service_role (backend API)
grant all on public.profiles to service_role;
