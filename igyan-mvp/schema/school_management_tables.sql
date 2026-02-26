-- ============================================================
-- SCHOOL MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. ACADEMIC SESSIONS (year/term tracking)
-- Tracks school years like "2025-2026" so we can transfer students between sessions
CREATE TABLE IF NOT EXISTS public.academic_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  session_name varchar(100) NOT NULL,           -- e.g. "2025-2026"
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT academic_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT academic_sessions_school_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT unique_session_per_school UNIQUE (school_id, session_name)
);

CREATE INDEX IF NOT EXISTS idx_academic_sessions_school ON public.academic_sessions(school_id);
CREATE INDEX IF NOT EXISTS idx_academic_sessions_active ON public.academic_sessions(school_id, is_active);


-- 2. SUBJECTS (school-level subject master)
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  subject_name varchar(255) NOT NULL,
  subject_code varchar(50) NULL,
  description text NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subjects_pkey PRIMARY KEY (id),
  CONSTRAINT subjects_school_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT unique_subject_per_school UNIQUE (school_id, subject_name)
);

CREATE INDEX IF NOT EXISTS idx_subjects_school ON public.subjects(school_id);


-- 3. CLASSES (class + section per session)
-- e.g. "Class 10 - Section A" for session "2025-2026"
CREATE TABLE IF NOT EXISTS public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  session_id uuid NOT NULL,
  class_name varchar(50) NOT NULL,              -- e.g. "10", "XII", "UKG"
  section varchar(10) NOT NULL DEFAULT 'A',     -- e.g. "A", "B", "C"
  room_number varchar(50) NULL,
  capacity int NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT classes_pkey PRIMARY KEY (id),
  CONSTRAINT classes_school_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT classes_session_fkey FOREIGN KEY (session_id) REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  CONSTRAINT unique_class_section_per_session UNIQUE (school_id, session_id, class_name, section)
);

CREATE INDEX IF NOT EXISTS idx_classes_school ON public.classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_session ON public.classes(session_id);


-- 4. CLASS STUDENTS (which student is in which class for which session)
-- This is the KEY table for tracking student class history & transfers
CREATE TABLE IF NOT EXISTS public.class_students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  class_id uuid NOT NULL,
  student_id uuid NOT NULL,                     -- references users.id (role=student)
  session_id uuid NOT NULL,
  roll_number varchar(20) NULL,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz NULL,                     -- when transferred out / session ended
  status varchar(20) NOT NULL DEFAULT 'active', -- active, transferred, passed, dropped
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT class_students_pkey PRIMARY KEY (id),
  CONSTRAINT class_students_school_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT class_students_class_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
  CONSTRAINT class_students_student_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT class_students_session_fkey FOREIGN KEY (session_id) REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  CONSTRAINT unique_student_active_class UNIQUE (student_id, session_id, status)
);

CREATE INDEX IF NOT EXISTS idx_class_students_school ON public.class_students(school_id);
CREATE INDEX IF NOT EXISTS idx_class_students_class ON public.class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student ON public.class_students(student_id);
CREATE INDEX IF NOT EXISTS idx_class_students_session ON public.class_students(session_id);


-- 5. CLASS SUBJECTS (which subjects are taught in which class)
CREATE TABLE IF NOT EXISTS public.class_subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  class_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT class_subjects_pkey PRIMARY KEY (id),
  CONSTRAINT class_subjects_school_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT class_subjects_class_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
  CONSTRAINT class_subjects_subject_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE,
  CONSTRAINT unique_class_subject UNIQUE (class_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_class_subjects_class ON public.class_subjects(class_id);


-- 6. FACULTY ASSIGNMENTS (assign faculty to class as teacher or to subject)
CREATE TABLE IF NOT EXISTS public.faculty_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  faculty_id uuid NOT NULL,                     -- references users.id (role=faculty)
  class_id uuid NOT NULL,
  subject_id uuid NULL,                         -- NULL = class teacher, NOT NULL = subject teacher
  session_id uuid NOT NULL,
  assignment_type varchar(20) NOT NULL DEFAULT 'subject_teacher',  -- 'class_teacher' or 'subject_teacher'
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT faculty_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT faculty_assignments_school_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT faculty_assignments_faculty_fkey FOREIGN KEY (faculty_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT faculty_assignments_class_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
  CONSTRAINT faculty_assignments_subject_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL,
  CONSTRAINT faculty_assignments_session_fkey FOREIGN KEY (session_id) REFERENCES public.academic_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_faculty_assignments_school ON public.faculty_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_faculty_assignments_faculty ON public.faculty_assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_assignments_class ON public.faculty_assignments(class_id);


-- 7. STUDENT TRANSFER HISTORY (tracks every class change)
CREATE TABLE IF NOT EXISTS public.student_transfer_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  student_id uuid NOT NULL,
  from_class_id uuid NOT NULL,
  to_class_id uuid NULL,                        -- NULL if student left school
  from_session_id uuid NOT NULL,
  to_session_id uuid NULL,
  transfer_type varchar(30) NOT NULL DEFAULT 'promotion', -- promotion, transfer, section_change, demotion, left
  remarks text NULL,
  transferred_at timestamptz NOT NULL DEFAULT now(),
  transferred_by uuid NULL,                     -- admin who did the transfer
  CONSTRAINT student_transfer_history_pkey PRIMARY KEY (id),
  CONSTRAINT sth_school_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT sth_student_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT sth_from_class_fkey FOREIGN KEY (from_class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
  CONSTRAINT sth_to_class_fkey FOREIGN KEY (to_class_id) REFERENCES public.classes(id) ON DELETE SET NULL,
  CONSTRAINT sth_from_session_fkey FOREIGN KEY (from_session_id) REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  CONSTRAINT sth_to_session_fkey FOREIGN KEY (to_session_id) REFERENCES public.academic_sessions(id) ON DELETE SET NULL,
  CONSTRAINT sth_transferred_by_fkey FOREIGN KEY (transferred_by) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_sth_student ON public.student_transfer_history(student_id);
CREATE INDEX IF NOT EXISTS idx_sth_school ON public.student_transfer_history(school_id);


-- 8. STUDENT ATTENDANCE (improved, linked to classes)
-- Drop old table if you want to migrate, or keep both
CREATE TABLE IF NOT EXISTS public.student_attendance_v2 (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  class_id uuid NOT NULL,
  student_id uuid NOT NULL,
  session_id uuid NOT NULL,
  attendance_date date NOT NULL,
  status varchar(10) NOT NULL DEFAULT 'present', -- present, absent, late, half_day
  marked_by uuid NULL,                           -- faculty who marked
  remarks text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_attendance_v2_pkey PRIMARY KEY (id),
  CONSTRAINT sa2_school_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT sa2_class_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
  CONSTRAINT sa2_student_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT sa2_session_fkey FOREIGN KEY (session_id) REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  CONSTRAINT sa2_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT unique_student_attendance_per_day UNIQUE (class_id, student_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_sa2_school ON public.student_attendance_v2(school_id);
CREATE INDEX IF NOT EXISTS idx_sa2_class ON public.student_attendance_v2(class_id);
CREATE INDEX IF NOT EXISTS idx_sa2_date ON public.student_attendance_v2(attendance_date);
CREATE INDEX IF NOT EXISTS idx_sa2_student ON public.student_attendance_v2(student_id);


-- 9. FACULTY ATTENDANCE
CREATE TABLE IF NOT EXISTS public.faculty_attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  faculty_id uuid NOT NULL,
  session_id uuid NOT NULL,
  attendance_date date NOT NULL,
  status varchar(10) NOT NULL DEFAULT 'present', -- present, absent, late, half_day, on_leave
  check_in_time time NULL,
  check_out_time time NULL,
  marked_by uuid NULL,
  remarks text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT faculty_attendance_pkey PRIMARY KEY (id),
  CONSTRAINT fa_school_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT fa_faculty_fkey FOREIGN KEY (faculty_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT fa_session_fkey FOREIGN KEY (session_id) REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fa_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT unique_faculty_attendance_per_day UNIQUE (faculty_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_fa_school ON public.faculty_attendance(school_id);
CREATE INDEX IF NOT EXISTS idx_fa_faculty ON public.faculty_attendance(faculty_id);
CREATE INDEX IF NOT EXISTS idx_fa_date ON public.faculty_attendance(attendance_date);


-- ============================================================
-- ENABLE ROW LEVEL SECURITY (RLS) on all tables
-- ============================================================

ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_transfer_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations for authenticated users (anon key)
-- You can tighten these later per your security needs

CREATE POLICY "Allow all for authenticated" ON public.academic_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.class_students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.class_subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.faculty_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.student_transfer_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.student_attendance_v2 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.faculty_attendance FOR ALL USING (true) WITH CHECK (true);


-- ============================================================
-- DONE! Now run the Next.js code for the School Management page.
-- ============================================================
