-- Fix: faculty_profiles table has no PRIMARY KEY
-- This causes "Unable to update row as table has no primary keys" error
-- when trying to update/delete rows via Supabase Dashboard or PostgREST API.

-- Step 1: Add PRIMARY KEY constraint to the existing 'id' column
ALTER TABLE public.faculty_profiles
  ADD CONSTRAINT faculty_profiles_pkey PRIMARY KEY (id);

-- Step 2 (optional but recommended): Add a UNIQUE constraint on user_id
-- so each faculty user can only have one profile
ALTER TABLE public.faculty_profiles
  ADD CONSTRAINT faculty_profiles_user_id_key UNIQUE (user_id);
