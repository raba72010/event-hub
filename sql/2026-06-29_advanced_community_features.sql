-- ====================================================================
-- Advanced Community Features (Activities, Sections, Discussions, Comments)
-- ====================================================================

-- 1. Clean up old mock tables
drop table if exists public.community_discussion_likes cascade;
drop table if exists public.community_discussion_comments cascade;
drop table if exists public.community_discussions cascade;
drop table if exists public.community_discussion_sections cascade;
drop table if exists public.community_activity_participants cascade;
drop table if exists public.community_activities cascade;

-- 2. Activities (Initiatives / Projects)
create table public.community_activities (
  id uuid default gen_random_uuid() primary key,
  community_slug text not null,
  title text not null,
  description text not null,
  date_string text, -- e.g., "July 15 - Aug 1"
  location text, -- e.g., "Virtual" or "Riyadh"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.community_activity_participants (
  activity_id uuid references public.community_activities(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (activity_id, user_id)
);

-- 3. Discussion Board Sections
create table public.community_discussion_sections (
  id uuid default gen_random_uuid() primary key,
  community_slug text not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Discussions (Threads within Sections)
create table public.community_discussions (
  id uuid default gen_random_uuid() primary key,
  section_id uuid references public.community_discussion_sections(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  mock_author_name text,
  mock_author_title text,
  title text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Comments on Discussions
create table public.community_discussion_comments (
  id uuid default gen_random_uuid() primary key,
  discussion_id uuid references public.community_discussions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  mock_author_name text,
  mock_author_title text,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Likes on Discussions
create table public.community_discussion_likes (
  discussion_id uuid references public.community_discussions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (discussion_id, user_id)
);

-- Enable RLS
alter table public.community_activities enable row level security;
alter table public.community_activity_participants enable row level security;
alter table public.community_discussion_sections enable row level security;
alter table public.community_discussions enable row level security;
alter table public.community_discussion_comments enable row level security;
alter table public.community_discussion_likes enable row level security;

-- Public Read Policies
create policy "Public read for community_activities" on public.community_activities for select using (true);
create policy "Public read for community_activity_participants" on public.community_activity_participants for select using (true);
create policy "Public read for community_discussion_sections" on public.community_discussion_sections for select using (true);
create policy "Public read for community_discussions" on public.community_discussions for select using (true);
create policy "Public read for community_discussion_comments" on public.community_discussion_comments for select using (true);
create policy "Public read for community_discussion_likes" on public.community_discussion_likes for select using (true);

-- Authenticated Insert Policies
create policy "Auth insert for community_activities" on public.community_activities for insert with check (auth.uid() is not null);
create policy "Auth delete for community_activities" on public.community_activities for delete using (auth.uid() is not null);

create policy "Auth insert for community_activity_participants" on public.community_activity_participants for insert with check (auth.uid() = user_id);
create policy "Auth delete for community_activity_participants" on public.community_activity_participants for delete using (auth.uid() = user_id);

create policy "Auth insert for community_discussion_sections" on public.community_discussion_sections for insert with check (auth.uid() is not null);
create policy "Auth delete for community_discussion_sections" on public.community_discussion_sections for delete using (auth.uid() is not null);

create policy "Auth insert for community_discussions" on public.community_discussions for insert with check (auth.uid() = user_id);
create policy "Auth insert for community_discussion_comments" on public.community_discussion_comments for insert with check (auth.uid() = user_id);

create policy "Auth insert for community_discussion_likes" on public.community_discussion_likes for insert with check (auth.uid() = user_id);
create policy "Auth delete for community_discussion_likes" on public.community_discussion_likes for delete using (auth.uid() = user_id);

-- 7. Seed Data (AI Community)
insert into public.community_activities (id, community_slug, title, description, date_string, location) values
('a0000000-0000-0000-0000-000000000001', 'ai', 'Open Source LLM Hackathon', 'Join members in building agents using LLaMA-3 and Mistral.', 'August 1 - 5, 2026', 'Virtual'),
('a0000000-0000-0000-0000-000000000002', 'ai', 'AI Safety Reading Group', 'A weekly discussion on AI alignment and safety research papers.', 'Every Friday', 'Discord');

insert into public.community_discussion_sections (id, community_slug, name, description) values
('s0000000-0000-0000-0000-000000000001', 'ai', 'Machine Learning', 'Discussions around classic ML, deep learning, and architectures.'),
('s0000000-0000-0000-0000-000000000002', 'ai', 'Generative AI', 'LLMs, Diffusion Models, and Prompt Engineering.'),
('s0000000-0000-0000-0000-000000000003', 'ai', 'Career & Mentorship', 'Advice on breaking into the AI field, interviews, and resumes.');

insert into public.community_discussions (id, section_id, mock_author_name, mock_author_title, title, content) values
('d0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000001', 'Eng. John Smith', 'ML Engineer', 'Batch Normalization vs Layer Normalization', 'When should I prefer LayerNorm over BatchNorm in CNNs? I know LN is standard in Transformers, but what about ResNets?'),
('d0000000-0000-0000-0000-000000000002', 's0000000-0000-0000-0000-000000000002', 'Dr. Sarah Connor', 'AI Researcher', 'Best RAG Strategies for 2026', 'Are vector databases still the gold standard, or are folks moving towards graph-based retrieval?');

insert into public.community_discussion_comments (discussion_id, mock_author_name, mock_author_title, content) values
('d0000000-0000-0000-0000-000000000001', 'Ahmed Ali', 'Data Scientist', 'BatchNorm is highly dependent on batch size. If your batch size is small (e.g. 2 or 4), LayerNorm or GroupNorm usually perform better even in CNNs.');

-- Seed Data (Data Science)
insert into public.community_discussion_sections (id, community_slug, name, description) values
('s0000000-0000-0000-0000-000000000010', 'data-science', 'Data Engineering', 'Pipelines, ETL/ELT, Airflow, and Data Warehousing.'),
('s0000000-0000-0000-0000-000000000011', 'data-science', 'Data Visualization', 'Tableau, PowerBI, D3.js and visual storytelling.');
