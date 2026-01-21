-- Add subject column to student_attendance table
ALTER TABLE public.student_attendance 
ADD COLUMN IF NOT EXISTS subject VARCHAR(100);

-- First, ensure student_profile_id is NOT NULL where it should be
-- You may need to clean up any orphaned records first
DELETE FROM public.student_attendance 
WHERE student_profile_id IS NULL;

-- Add foreign key constraint for student_profile_id
ALTER TABLE public.student_attendance
DROP CONSTRAINT IF EXISTS student_attendance_student_profile_id_fkey;

ALTER TABLE public.student_attendance
ADD CONSTRAINT student_attendance_student_profile_id_fkey 
FOREIGN KEY (student_profile_id) 
REFERENCES public.student_profiles(id) 
ON DELETE CASCADE;

-- Add foreign key constraint for marked_by
ALTER TABLE public.student_attendance
DROP CONSTRAINT IF EXISTS student_attendance_marked_by_fkey;

ALTER TABLE public.student_attendance
ADD CONSTRAINT student_attendance_marked_by_fkey 
FOREIGN KEY (marked_by) 
REFERENCES public.users(id) 
ON DELETE SET NULL;

-- Add foreign key constraint for school_id
ALTER TABLE public.student_attendance
DROP CONSTRAINT IF EXISTS student_attendance_school_id_fkey;

ALTER TABLE public.student_attendance
ADD CONSTRAINT student_attendance_school_id_fkey 
FOREIGN KEY (school_id) 
REFERENCES public.schools(id) 
ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_student_attendance_date 
ON public.student_attendance(attendance_date);

CREATE INDEX IF NOT EXISTS idx_student_attendance_school 
ON public.student_attendance(school_id);

CREATE INDEX IF NOT EXISTS idx_student_attendance_profile 
ON public.student_attendance(student_profile_id);

-- Add check constraint for status
ALTER TABLE public.student_attendance
DROP CONSTRAINT IF EXISTS student_attendance_status_check;

ALTER TABLE public.student_attendance
ADD CONSTRAINT student_attendance_status_check 
CHECK (status IN ('present', 'absent', 'late', 'leave'));
