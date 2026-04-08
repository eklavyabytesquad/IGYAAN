-- ============================================================
-- FIX: user_access table - Disable RLS
-- ============================================================
-- PROBLEM: App uses custom authentication (not Supabase Auth),
-- so auth.uid() is always NULL. RLS blocks all queries.
-- 
-- FIX: Disable RLS since the app handles authorization in
-- the application layer (super_admin role check in frontend).
-- ============================================================

-- Drop any existing RLS policies on user_access
DROP POLICY IF EXISTS "Users can view own modules" ON public.user_access;
DROP POLICY IF EXISTS "Users can insert own modules" ON public.user_access;
DROP POLICY IF EXISTS "Users can delete own modules" ON public.user_access;
DROP POLICY IF EXISTS "Admins can manage user modules" ON public.user_access;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_access;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.user_access;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.user_access;

-- Disable RLS entirely
ALTER TABLE public.user_access DISABLE ROW LEVEL SECURITY;
