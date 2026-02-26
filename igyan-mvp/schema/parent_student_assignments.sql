-- Parent-Student Assignment Table
-- Links parent users to student users for school management

CREATE TABLE public.parent_student_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  parent_id UUID NOT NULL,
  student_id UUID NOT NULL,
  relationship VARCHAR(50) DEFAULT 'parent',  -- parent, guardian, mother, father, etc.
  is_primary BOOLEAN DEFAULT true,             -- primary contact parent
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NULL,

  CONSTRAINT parent_student_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT parent_student_unique UNIQUE (parent_id, student_id),
  CONSTRAINT psa_school_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT psa_parent_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT psa_student_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT psa_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- Indexes for fast lookups
CREATE INDEX idx_psa_school ON public.parent_student_assignments(school_id);
CREATE INDEX idx_psa_parent ON public.parent_student_assignments(parent_id);
CREATE INDEX idx_psa_student ON public.parent_student_assignments(student_id);
