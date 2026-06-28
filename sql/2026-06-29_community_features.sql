-- ====================================================================
-- Community Activities and Discussions
-- ====================================================================

-- 1. Create Activities Table
create table if not exists public.community_activities (
  id uuid default gen_random_uuid() primary key,
  community_slug text not null,
  user_id uuid references public.profiles(id) on delete cascade,
  mock_author_name text, -- For sample data without a real user
  mock_author_title text,
  action_type text not null, -- 'joined', 'shared_resource', 'started_discussion'
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Discussions Table
create table if not exists public.community_discussions (
  id uuid default gen_random_uuid() primary key,
  community_slug text not null,
  user_id uuid references public.profiles(id) on delete cascade,
  mock_author_name text,
  mock_author_title text,
  title text not null,
  content text not null,
  likes integer default 0,
  replies integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.community_activities enable row level security;
alter table public.community_discussions enable row level security;

-- Policies for Activities
drop policy if exists "Public read for activities" on public.community_activities;
create policy "Public read for activities" on public.community_activities for select using (true);

drop policy if exists "Authenticated insert for activities" on public.community_activities;
create policy "Authenticated insert for activities" on public.community_activities for insert with check (auth.uid() = user_id);

-- Policies for Discussions
drop policy if exists "Public read for discussions" on public.community_discussions;
create policy "Public read for discussions" on public.community_discussions for select using (true);

drop policy if exists "Authenticated insert for discussions" on public.community_discussions;
create policy "Authenticated insert for discussions" on public.community_discussions for insert with check (auth.uid() = user_id);

-- 3. Seed Data
-- AI Community
insert into public.community_activities (community_slug, mock_author_name, mock_author_title, action_type, content, created_at) values
('ai', 'Dr. Sarah Connor', 'AI Research Lead', 'shared_resource', 'Uploaded the new framework for LLM fine-tuning.', now() - interval '2 hours'),
('ai', 'Eng. John Smith', 'Machine Learning Engineer', 'joined', 'Joined the Artificial Intelligence community.', now() - interval '5 hours');

insert into public.community_discussions (community_slug, mock_author_name, mock_author_title, title, content, likes, replies, created_at) values
('ai', 'Dr. Sarah Connor', 'AI Research Lead', 'Best practices for RAG architectures?', 'I am looking to optimize our retrieval augmented generation pipeline. Has anyone tried the new embedding models from OpenAI?', 12, 4, now() - interval '1 day'),
('ai', 'Ahmed Ali', 'Data Scientist', 'Local LLMs on Mac', 'What is the fastest local inference engine for Apple Silicon? Llama.cpp vs MLX?', 8, 2, now() - interval '3 days');

-- Data Science Community
insert into public.community_activities (community_slug, mock_author_name, mock_author_title, action_type, content, created_at) values
('data-science', 'Maria Garcia', 'Senior Data Analyst', 'shared_resource', 'Shared a Colab notebook on Pandas 2.0 performance.', now() - interval '1 day');

insert into public.community_discussions (community_slug, mock_author_name, mock_author_title, title, content, likes, replies, created_at) values
('data-science', 'Leo Martinez', 'Data Engineer', 'Airflow vs Prefect for Data Pipelines', 'Which orchestrator are you all preferring for modern data stacks?', 15, 6, now() - interval '2 days');

-- Cybersecurity Community
insert into public.community_activities (community_slug, mock_author_name, mock_author_title, action_type, content, created_at) values
('cybersecurity', 'Ali Hassan', 'Security Analyst', 'joined', 'Joined the Cybersecurity community.', now() - interval '10 hours');

insert into public.community_discussions (community_slug, mock_author_name, mock_author_title, title, content, likes, replies, created_at) values
('cybersecurity', 'Fatima Zahra', 'CISO', 'Zero Trust Architecture Implementation', 'What were the biggest hurdles your team faced when migrating to a Zero Trust model?', 22, 9, now() - interval '4 days');

-- Cloud Computing Community
insert into public.community_activities (community_slug, mock_author_name, mock_author_title, action_type, content, created_at) values
('cloud-computing', 'David Kim', 'Cloud Architect', 'shared_resource', 'Shared a terraform module for EKS deployment.', now() - interval '3 hours');

insert into public.community_discussions (community_slug, mock_author_name, mock_author_title, title, content, likes, replies, created_at) values
('cloud-computing', 'Omar Tariq', 'DevOps Engineer', 'AWS vs GCP for Kubernetes', 'I find GKE to be much more seamless than EKS. Thoughts?', 18, 14, now() - interval '1 week');

-- Strategic Planning
insert into public.community_activities (community_slug, mock_author_name, mock_author_title, action_type, content, created_at) values
('strategic-planning', 'Mona Abdullah', 'Director of Strategy', 'joined', 'Joined the Strategic Planning community.', now() - interval '2 days');

insert into public.community_discussions (community_slug, mock_author_name, mock_author_title, title, content, likes, replies, created_at) values
('strategic-planning', 'Yousef Al-Fahad', 'Management Consultant', 'OKRs vs KPIs', 'How do you balance operational KPIs with transformational OKRs in a traditional enterprise?', 30, 11, now() - interval '5 days');

-- Healthcare
insert into public.community_activities (community_slug, mock_author_name, mock_author_title, action_type, content, created_at) values
('healthcare', 'Dr. Hassan', 'Chief Medical Officer', 'shared_resource', 'Published the report on telemedicine adoption rates.', now() - interval '1 hour');

insert into public.community_discussions (community_slug, mock_author_name, mock_author_title, title, content, likes, replies, created_at) values
('healthcare', 'Dr. Layla', 'Health Informatics Specialist', 'Electronic Health Records Interoperability', 'The new FHIR standards are promising, but legacy systems are still a bottleneck.', 25, 7, now() - interval '2 weeks');

-- Education
insert into public.community_activities (community_slug, mock_author_name, mock_author_title, action_type, content, created_at) values
('education', 'Prof. Khalid', 'Dean of E-Learning', 'joined', 'Joined the EdTech community.', now() - interval '1 day');

insert into public.community_discussions (community_slug, mock_author_name, mock_author_title, title, content, likes, replies, created_at) values
('education', 'Sara Mahmoud', 'Instructional Designer', 'Gamification in Adult Learning', 'What platforms have you found most effective for integrating game mechanics in corporate training?', 14, 5, now() - interval '3 days');

-- Fintech
insert into public.community_activities (community_slug, mock_author_name, mock_author_title, action_type, content, created_at) values
('fintech', 'Tariq Ziad', 'Fintech Founder', 'shared_resource', 'Shared a regulatory compliance checklist for the MENA region.', now() - interval '4 hours');

insert into public.community_discussions (community_slug, mock_author_name, mock_author_title, title, content, likes, replies, created_at) values
('fintech', 'Nour El-Din', 'Product Manager - Payments', 'Open Banking APIs', 'Are the new sandbox environments provided by the central bank stable enough for production testing?', 20, 8, now() - interval '6 days');
