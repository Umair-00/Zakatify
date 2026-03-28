-- Add zakat preference columns to profiles table
-- Run this in the Supabase SQL Editor

alter table public.profiles
  add column if not exists nisab_basis text not null default 'silver'
    check (nisab_basis in ('gold', 'silver')),
  add column if not exists calendar_type text not null default 'lunar'
    check (calendar_type in ('lunar', 'gregorian')),
  add column if not exists zakat_anniversary date;
