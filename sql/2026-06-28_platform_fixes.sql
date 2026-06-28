-- ════════════════════════════════════════════════════════════════════
-- PLATFORM INCOMPLETENESS MIGRATIONS (2026-06-28)
-- ════════════════════════════════════════════════════════════════════
-- Purpose: Setup tables for Digital Library & Media Center sections.
-- ════════════════════════════════════════════════════════════════════

-- 1. Digital Library Table
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  title_ar text not null,
  title_en text not null,
  description_ar text,
  description_en text,
  category text not null, -- 'research' | 'books' | 'worksheets'
  file_size text not null, -- e.g. '2.4 MB'
  download_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS and select policies
alter table public.documents enable row level security;
drop policy if exists "Allow public read access to documents" on public.documents;
create policy "Allow public read access to documents" on public.documents for select using (true);

-- 2. Media Center Table
create table if not exists public.media_articles (
  id uuid default gen_random_uuid() primary key,
  title_ar text not null,
  title_en text not null,
  summary_ar text,
  summary_en text,
  content_ar text,
  content_en text,
  type text not null, -- 'news' | 'gallery' | 'video'
  image_url text,
  video_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS and select policies
alter table public.media_articles enable row level security;
drop policy if exists "Allow public read access to media_articles" on public.media_articles;
create policy "Allow public read access to media_articles" on public.media_articles for select using (true);
