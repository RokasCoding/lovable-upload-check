-- ================================================
-- QUICK FIX - Remove RLS temporarily for testing
-- Run this for immediate access, then use fix-rls-permissions.sql for proper setup
-- ================================================

-- TEMPORARY: Disable RLS on prizes table for testing
ALTER TABLE public.prizes DISABLE ROW LEVEL SECURITY;

-- TEMPORARY: Disable RLS on other tables if needed
ALTER TABLE public.bonus_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_redemptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.content DISABLE ROW LEVEL SECURITY;

-- Keep profiles RLS enabled for security
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

SELECT 'RLS temporarily disabled - you should now be able to create prizes!' as message;
SELECT 'IMPORTANT: Re-enable RLS and set proper policies after testing!' as warning; 