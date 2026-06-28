-- ════════════════════════════════════════════════════════════════════
-- DIRECT MESSAGING SCHEMA (2026-06-28)
-- ════════════════════════════════════════════════════════════════════
-- Purpose: Setup direct messaging tables and enable real-time replication.
-- ════════════════════════════════════════════════════════════════════

-- 1. Create Messages Table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references auth.users(id) on delete cascade not null,
  receiver_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.messages enable row level security;

-- 3. Create Security Policies
drop policy if exists "Users can read their own messages" on public.messages;
create policy "Users can read their own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can insert their own messages" on public.messages;
create policy "Users can insert their own messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- 4. Enable Realtime Replication
-- Check if the table is already part of publication first
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
