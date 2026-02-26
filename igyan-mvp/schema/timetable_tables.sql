-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║              TIMETABLE MANAGEMENT TABLES                           ║
-- ║  Dynamic school timetable: structure → class assignments           ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- 1) TIMETABLE TEMPLATES ─ Master template per school per session
--    A school can have one active template per session.
CREATE TABLE IF NOT EXISTS timetable_templates (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id     UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  session_id    UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL DEFAULT 'Default Timetable',
  school_start_time TIME NOT NULL DEFAULT '08:00',
  is_active     BOOLEAN DEFAULT true,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, session_id, template_name)
);

-- 2) TIMETABLE DAYS ─ Which days of the week are active in this template
CREATE TABLE IF NOT EXISTS timetable_days (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id   UUID NOT NULL REFERENCES timetable_templates(id) ON DELETE CASCADE,
  day_name      TEXT NOT NULL CHECK (day_name IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  day_index     INT NOT NULL CHECK (day_index BETWEEN 0 AND 6),  -- 0=Monday
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(template_id, day_name)
);

-- 3) TIMETABLE SLOTS ─ Period/break definitions (common structure for all classes)
--    These define the skeleton of a school day: Period 1, Short Break, Period 2, Lunch, etc.
CREATE TABLE IF NOT EXISTS timetable_slots (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id      UUID NOT NULL REFERENCES timetable_templates(id) ON DELETE CASCADE,
  slot_order       INT NOT NULL,                                    -- sequence: 1, 2, 3...
  slot_type        TEXT NOT NULL CHECK (slot_type IN ('period','short_break','lunch_break')),
  label            TEXT NOT NULL,                                    -- "Period 1", "Short Break", "Lunch"
  start_time       TIME NOT NULL,
  end_time         TIME NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(template_id, slot_order)
);

-- 4) TIMETABLE ENTRIES ─ Per class, per day, per period slot → subject + teacher
--    Only for slots where slot_type = 'period'. Breaks have no entries.
CREATE TABLE IF NOT EXISTS timetable_entries (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id   UUID NOT NULL REFERENCES timetable_templates(id) ON DELETE CASCADE,
  slot_id       UUID NOT NULL REFERENCES timetable_slots(id) ON DELETE CASCADE,
  day_id        UUID NOT NULL REFERENCES timetable_days(id) ON DELETE CASCADE,
  class_id      UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id    UUID REFERENCES subjects(id) ON DELETE SET NULL,
  faculty_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  room          TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(template_id, slot_id, day_id, class_id)
);

-- ═══ INDEXES for performance ═══
CREATE INDEX IF NOT EXISTS idx_tt_templates_school   ON timetable_templates(school_id, session_id);
CREATE INDEX IF NOT EXISTS idx_tt_days_template      ON timetable_days(template_id);
CREATE INDEX IF NOT EXISTS idx_tt_slots_template     ON timetable_slots(template_id, slot_order);
CREATE INDEX IF NOT EXISTS idx_tt_entries_template    ON timetable_entries(template_id, class_id);
CREATE INDEX IF NOT EXISTS idx_tt_entries_faculty     ON timetable_entries(faculty_id);
CREATE INDEX IF NOT EXISTS idx_tt_entries_day_slot    ON timetable_entries(day_id, slot_id);

-- ═══ DISABLE RLS (custom auth, auth.uid() is always NULL) ═══
ALTER TABLE timetable_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_days      DISABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots     DISABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries   DISABLE ROW LEVEL SECURITY;

GRANT ALL ON timetable_templates TO anon, authenticated;
GRANT ALL ON timetable_days      TO anon, authenticated;
GRANT ALL ON timetable_slots     TO anon, authenticated;
GRANT ALL ON timetable_entries   TO anon, authenticated;


-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║        DAILY TIMETABLE SNAPSHOTS (Attendance / Substitution)       ║
-- ║  Each school-date gets a snapshot copied from the master template. ║
-- ║  Absent teachers → slot becomes empty or gets a substitute.        ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- 5) TIMETABLE DAILY RECORDS ─ One record per school per date
--    Captures which template was active on that day.
CREATE TABLE IF NOT EXISTS timetable_daily_records (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id     UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  session_id    UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
  template_id   UUID NOT NULL REFERENCES timetable_templates(id) ON DELETE CASCADE,
  record_date   DATE NOT NULL,
  day_id        UUID NOT NULL REFERENCES timetable_days(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','completed')),
  notes         TEXT,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, record_date)       -- one snapshot per school per calendar date
);

-- 6) TIMETABLE DAILY ENTRIES ─ Actual per-slot per-class record for the day
--    Stores BOTH the original (from master) and actual (after substitutions).
--    status:
--      'as_planned'  → teacher came as scheduled
--      'substituted' → original teacher absent, substitute assigned
--      'cancelled'   → period cancelled entirely
--      'free_period'  → no teacher, students on their own
CREATE TABLE IF NOT EXISTS timetable_daily_entries (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  daily_record_id       UUID NOT NULL REFERENCES timetable_daily_records(id) ON DELETE CASCADE,
  slot_id               UUID NOT NULL REFERENCES timetable_slots(id) ON DELETE CASCADE,
  class_id              UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  original_subject_id   UUID REFERENCES subjects(id) ON DELETE SET NULL,
  original_faculty_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  actual_subject_id     UUID REFERENCES subjects(id) ON DELETE SET NULL,
  actual_faculty_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  status                TEXT NOT NULL DEFAULT 'as_planned'
                        CHECK (status IN ('as_planned','substituted','cancelled','free_period')),
  substitute_reason     TEXT,                              -- e.g. "Sick leave", "Training"
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  UNIQUE(daily_record_id, slot_id, class_id)              -- one entry per slot per class per day
);

-- ═══ INDEXES ═══
CREATE INDEX IF NOT EXISTS idx_tdr_school_date    ON timetable_daily_records(school_id, record_date);
CREATE INDEX IF NOT EXISTS idx_tdr_template       ON timetable_daily_records(template_id);
CREATE INDEX IF NOT EXISTS idx_tde_record         ON timetable_daily_entries(daily_record_id, class_id);
CREATE INDEX IF NOT EXISTS idx_tde_orig_faculty   ON timetable_daily_entries(original_faculty_id);
CREATE INDEX IF NOT EXISTS idx_tde_actual_faculty ON timetable_daily_entries(actual_faculty_id);
CREATE INDEX IF NOT EXISTS idx_tde_slot           ON timetable_daily_entries(slot_id);
CREATE INDEX IF NOT EXISTS idx_tde_status         ON timetable_daily_entries(status);

-- ═══ DISABLE RLS (custom auth) ═══
ALTER TABLE timetable_daily_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_daily_entries DISABLE ROW LEVEL SECURITY;

GRANT ALL ON timetable_daily_records TO anon, authenticated;
GRANT ALL ON timetable_daily_entries TO anon, authenticated;
