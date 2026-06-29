-- SQL Script to generate default sections for all communities
-- Run this in your Supabase SQL Editor

-- 1. AI Community
insert into public.community_discussion_sections (community_slug, name, description) values
('ai', 'General Discussion', 'General talks about Artificial Intelligence.'),
('ai', 'Resources & Tutorials', 'Share your favorite AI tools and tutorials.');

-- 2. Data Science
insert into public.community_discussion_sections (community_slug, name, description) values
('data-science', 'General Discussion', 'General talks about Data Science.'),
('data-science', 'Projects & Datasets', 'Share your datasets and projects.');

-- 3. Strategic Planning
insert into public.community_discussion_sections (community_slug, name, description) values
('strategic-planning', 'General Discussion', 'Discuss overall strategies and visions.'),
('strategic-planning', 'Case Studies', 'Share and analyze strategic planning case studies.');

-- 4. Project Management
insert into public.community_discussion_sections (community_slug, name, description) values
('project-management', 'General Discussion', 'General PM discussions.'),
('project-management', 'Agile & Scrum', 'Discuss Agile methodologies, tools, and processes.');

-- 5. TQM (Total Quality Management)
insert into public.community_discussion_sections (community_slug, name, description) values
('tqm', 'General Discussion', 'Discuss Total Quality Management topics.'),
('tqm', 'Quality Standards (ISO)', 'Discuss ISO standards and implementation.');

-- 6. Financial Management
insert into public.community_discussion_sections (community_slug, name, description) values
('financial-management', 'General Discussion', 'General finance and accounting topics.'),
('financial-management', 'Market Analysis', 'Discuss market trends and financial analysis.');

-- 7. Healthcare
insert into public.community_discussion_sections (community_slug, name, description) values
('healthcare', 'General Discussion', 'General healthcare administration topics.'),
('healthcare', 'Medical Tech', 'Discuss new technologies in healthcare.');

-- 8. English Learning
insert into public.community_discussion_sections (community_slug, name, description) values
('english', 'General Discussion', 'Talk about learning English.'),
('english', 'Grammar & Vocabulary', 'Share tips for improving grammar and expanding vocabulary.');
