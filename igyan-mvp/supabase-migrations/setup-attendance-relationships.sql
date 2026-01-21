-- ============================================
-- Setup Foreign Key Relationships for student_attendance
-- ============================================

-- Step 1: Add subject column if not exists
ALTER TABLE public.student_attendance 
ADD COLUMN IF NOT EXISTS subject VARCHAR(100);

-- Step 2: Clean up any orphaned records (records without valid student_profile_id)
DELETE FROM public.student_attendance 
WHERE student_profile_id IS NULL 
   OR student_profile_id NOT IN (SELECT id FROM public.student_profiles);

-- Step 3: Drop existing constraints if they exist
ALTER TABLE public.student_attendance
DROP CONSTRAINT IF EXISTS student_attendance_student_profile_id_fkey;

ALTER TABLE public.student_attendance
DROP CONSTRAINT IF EXISTS student_attendance_marked_by_fkey;

ALTER TABLE public.student_attendance
DROP CONSTRAINT IF EXISTS student_attendance_school_id_fkey;

-- Step 4: Add foreign key constraint for student_profile_id
ALTER TABLE public.student_attendance
ADD CONSTRAINT student_attendance_student_profile_id_fkey 
FOREIGN KEY (student_profile_id) 
REFERENCES public.student_profiles(id) 
ON DELETE CASCADE;

-- Step 5: Add foreign key constraint for marked_by
ALTER TABLE public.student_attendance
ADD CONSTRAINT student_attendance_marked_by_fkey 
FOREIGN KEY (marked_by) 
REFERENCES public.users(id) 
ON DELETE SET NULL;

-- Step 6: Add foreign key constraint for school_id
ALTER TABLE public.student_attendance
ADD CONSTRAINT student_attendance_school_id_fkey 
FOREIGN KEY (school_id) 
REFERENCES public.schools(id) 
ON DELETE CASCADE;

-- Step 7: Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_student_attendance_date 
ON public.student_attendance(attendance_date);

CREATE INDEX IF NOT EXISTS idx_student_attendance_school 
ON public.student_attendance(school_id);

CREATE INDEX IF NOT EXISTS idx_student_attendance_profile 
ON public.student_attendance(student_profile_id);

CREATE INDEX IF NOT EXISTS idx_student_attendance_subject 
ON public.student_attendance(subject);

-- Step 8: Add check constraint for status
ALTER TABLE public.student_attendance
DROP CONSTRAINT IF EXISTS student_attendance_status_check;

ALTER TABLE public.student_attendance
ADD CONSTRAINT student_attendance_status_check 
CHECK (status IN ('present', 'absent', 'late', 'leave'));

-- Step 9: Make student_profile_id NOT NULL (optional but recommended)
-- ALTER TABLE public.student_attendance
-- ALTER COLUMN student_profile_id SET NOT NULL;

-- Verification query - run this to check relationships
-- SELECT 
--   tc.constraint_name, 
--   tc.table_name, 
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name 
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
--   AND tc.table_schema = kcu.table_schema
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
--   AND ccu.table_schema = tc.table_schema
-- WHERE tc.constraint_type = 'FOREIGN KEY' 
--   AND tc.table_name='student_attendance';
