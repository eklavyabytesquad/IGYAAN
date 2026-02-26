-- ============================================================
-- PARENT-TEACHER MESSAGING SYSTEM - DATABASE SCHEMA
-- Supports: Direct Chat, Complaints, Homework Queries, Call Logs
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. PARENT-TEACHER CONVERSATIONS
-- Each conversation links a parent to a class teacher for a specific child
CREATE TABLE IF NOT EXISTS public.parent_teacher_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  parent_id uuid NOT NULL,                       -- references users.id (role=parent)
  teacher_id uuid NOT NULL,                      -- references users.id (role=faculty) — class teacher
  student_id uuid NOT NULL,                      -- references users.id (role=student) — the child
  class_id uuid NULL,                            -- references classes.id
  is_active boolean NOT NULL DEFAULT true,
  last_message_at timestamptz NULL,
  unread_parent int NOT NULL DEFAULT 0,          -- unread count for parent
  unread_teacher int NOT NULL DEFAULT 0,         -- unread count for teacher
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT parent_teacher_conversations_pkey PRIMARY KEY (id),
  CONSTRAINT ptc_school_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT ptc_parent_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT ptc_teacher_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT ptc_student_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT unique_parent_teacher_student UNIQUE (school_id, parent_id, teacher_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_ptc_parent ON public.parent_teacher_conversations(parent_id);
CREATE INDEX IF NOT EXISTS idx_ptc_teacher ON public.parent_teacher_conversations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_ptc_school ON public.parent_teacher_conversations(school_id);
CREATE INDEX IF NOT EXISTS idx_ptc_last_msg ON public.parent_teacher_conversations(last_message_at DESC);


-- 2. PARENT-TEACHER MESSAGES
-- Each message belongs to a conversation and has a flag/category
-- flag: 'general' (default), 'complaint', 'homework', 'urgent'
CREATE TABLE IF NOT EXISTS public.parent_teacher_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  school_id uuid NOT NULL,
  sender_id uuid NOT NULL,                       -- who sent this message (parent or teacher)
  sender_role varchar(20) NOT NULL,              -- 'parent' or 'faculty'
  message_text text NOT NULL,
  message_type varchar(20) NOT NULL DEFAULT 'text',  -- 'text', 'image', 'file', 'voice_note'
  flag varchar(20) NOT NULL DEFAULT 'general',   -- 'general', 'complaint', 'homework', 'urgent'
  flag_label varchar(50) NULL,                   -- display label e.g. 'HW', 'COMPLAINT', 'URGENT'
  attachment_url text NULL,                      -- for images/files
  attachment_name varchar(255) NULL,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz NULL,
  is_deleted boolean NOT NULL DEFAULT false,
  replied_to_id uuid NULL,                       -- for reply threading
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT parent_teacher_messages_pkey PRIMARY KEY (id),
  CONSTRAINT ptm_conversation_fkey FOREIGN KEY (conversation_id) REFERENCES public.parent_teacher_conversations(id) ON DELETE CASCADE,
  CONSTRAINT ptm_school_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT ptm_sender_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT ptm_replied_to_fkey FOREIGN KEY (replied_to_id) REFERENCES public.parent_teacher_messages(id) ON DELETE SET NULL,
  CONSTRAINT ptm_flag_check CHECK (flag IN ('general', 'complaint', 'homework', 'urgent')),
  CONSTRAINT ptm_sender_role_check CHECK (sender_role IN ('parent', 'faculty')),
  CONSTRAINT ptm_message_type_check CHECK (message_type IN ('text', 'image', 'file', 'voice_note'))
);

CREATE INDEX IF NOT EXISTS idx_ptm_conversation ON public.parent_teacher_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ptm_sender ON public.parent_teacher_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_ptm_flag ON public.parent_teacher_messages(flag);
CREATE INDEX IF NOT EXISTS idx_ptm_created ON public.parent_teacher_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ptm_unread ON public.parent_teacher_messages(conversation_id, is_read) WHERE is_read = false;


-- 3. PARENT-TEACHER CALL LOGS
-- Tracks call requests / logs between parent and teacher
CREATE TABLE IF NOT EXISTS public.parent_teacher_call_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  school_id uuid NOT NULL,
  caller_id uuid NOT NULL,                       -- who initiated the call
  caller_role varchar(20) NOT NULL,              -- 'parent' or 'faculty'
  call_type varchar(20) NOT NULL DEFAULT 'voice', -- 'voice', 'video', 'callback_request'
  call_status varchar(20) NOT NULL DEFAULT 'requested', -- 'requested', 'accepted', 'completed', 'missed', 'rejected'
  scheduled_at timestamptz NULL,                 -- for scheduled callbacks
  started_at timestamptz NULL,
  ended_at timestamptz NULL,
  duration_seconds int NULL,
  notes text NULL,                               -- call notes / summary
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ptcl_pkey PRIMARY KEY (id),
  CONSTRAINT ptcl_conversation_fkey FOREIGN KEY (conversation_id) REFERENCES public.parent_teacher_conversations(id) ON DELETE CASCADE,
  CONSTRAINT ptcl_school_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT ptcl_caller_fkey FOREIGN KEY (caller_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT ptcl_call_type_check CHECK (call_type IN ('voice', 'video', 'callback_request')),
  CONSTRAINT ptcl_status_check CHECK (call_status IN ('requested', 'accepted', 'completed', 'missed', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_ptcl_conversation ON public.parent_teacher_call_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ptcl_caller ON public.parent_teacher_call_logs(caller_id);
CREATE INDEX IF NOT EXISTS idx_ptcl_status ON public.parent_teacher_call_logs(call_status);


-- 4. COMPLAINT TRACKER
-- Dedicated table for escalated complaints from parents
CREATE TABLE IF NOT EXISTS public.parent_complaints (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  parent_id uuid NOT NULL,
  student_id uuid NOT NULL,
  teacher_id uuid NULL,                          -- class teacher (can be NULL for general complaints)
  message_id uuid NULL,                          -- link to original message if from chat
  complaint_type varchar(50) NOT NULL DEFAULT 'general', -- 'general', 'academic', 'behavior', 'facility', 'homework', 'safety', 'other'
  subject varchar(255) NOT NULL,
  description text NOT NULL,
  priority varchar(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status varchar(20) NOT NULL DEFAULT 'open',     -- 'open', 'in_progress', 'resolved', 'closed', 'escalated'
  assigned_to uuid NULL,                         -- admin/staff handling the complaint
  resolution_notes text NULL,
  resolved_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT parent_complaints_pkey PRIMARY KEY (id),
  CONSTRAINT pc_school_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT pc_parent_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT pc_student_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT pc_teacher_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT pc_message_fkey FOREIGN KEY (message_id) REFERENCES public.parent_teacher_messages(id) ON DELETE SET NULL,
  CONSTRAINT pc_priority_check CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT pc_status_check CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'escalated'))
);

CREATE INDEX IF NOT EXISTS idx_pc_school ON public.parent_complaints(school_id);
CREATE INDEX IF NOT EXISTS idx_pc_parent ON public.parent_complaints(parent_id);
CREATE INDEX IF NOT EXISTS idx_pc_status ON public.parent_complaints(status);
CREATE INDEX IF NOT EXISTS idx_pc_priority ON public.parent_complaints(priority);


-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.parent_teacher_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_teacher_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_teacher_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_complaints ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view own conversations"
  ON public.parent_teacher_conversations FOR SELECT
  USING (auth.uid() = parent_id OR auth.uid() = teacher_id);

CREATE POLICY "Parents can create conversations"
  ON public.parent_teacher_conversations FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.parent_teacher_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.parent_teacher_conversations
      WHERE parent_id = auth.uid() OR teacher_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.parent_teacher_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    conversation_id IN (
      SELECT id FROM public.parent_teacher_conversations
      WHERE parent_id = auth.uid() OR teacher_id = auth.uid()
    )
  );

-- RLS Policies for call logs
CREATE POLICY "Users can view call logs in their conversations"
  ON public.parent_teacher_call_logs FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.parent_teacher_conversations
      WHERE parent_id = auth.uid() OR teacher_id = auth.uid()
    )
  );

CREATE POLICY "Users can create call logs"
  ON public.parent_teacher_call_logs FOR INSERT
  WITH CHECK (auth.uid() = caller_id);

-- RLS Policies for complaints
CREATE POLICY "Parents can view own complaints"
  ON public.parent_complaints FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create complaints"
  ON public.parent_complaints FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Teachers can view complaints about them"
  ON public.parent_complaints FOR SELECT
  USING (auth.uid() = teacher_id);
