-- Member Directory: extend profiles table
-- Run this in Supabase SQL editor.

alter table public.profiles add column if not exists bio          text;
alter table public.profiles add column if not exists location     text;
alter table public.profiles add column if not exists community    text;       -- one of the 8 community slugs in lib/communities.ts
alter table public.profiles add column if not exists availability text default 'active';  -- 'active' | 'available' | 'busy' | 'inactive'
alter table public.profiles add column if not exists avatar_url   text;
alter table public.profiles add column if not exists is_public    boolean default true;

-- Public read of profiles where is_public = true (so the member directory works for guests).
-- Existing RLS already lets authenticated users read profiles; this adds anon read for the public ones.
drop policy if exists "Public profiles are visible to everyone" on public.profiles;
create policy "Public profiles are visible to everyone"
  on public.profiles for select
  using (is_public = true);

-- Indexes for the directory filters.
create index if not exists profiles_community_idx    on public.profiles (community);
create index if not exists profiles_availability_idx on public.profiles (availability);
create index if not exists profiles_is_public_idx    on public.profiles (is_public);
