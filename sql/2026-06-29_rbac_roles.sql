-- ════════════════════════════════════════════════════════════════════
-- RBAC MIGRATIONS (2026-06-29)
-- ════════════════════════════════════════════════════════════════════

-- 1. Add permissions JSON array column to profiles
alter table public.profiles add column if not exists permissions jsonb default '[]'::jsonb;

-- 2. Migrate existing "admin" roles to "super_admin"
update public.profiles set role = 'super_admin' where role = 'admin';

-- ====================================================================
-- MANUAL INTERVENTION REQUIRED
-- ====================================================================
-- To establish the first "main_admin" (God Mode), you must run this 
-- command manually in the Supabase SQL Editor, replacing the ID with 
-- your own user ID (which you can find in the Authentication > Users tab).
--
-- UPDATE public.profiles SET role = 'main_admin' WHERE email = 'your-email@example.com';
