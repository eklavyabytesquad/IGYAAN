-- ============================================================
-- OTP RECORDS TABLE
-- Stores OTP codes sent via WhatsApp for phone verification
-- ============================================================

CREATE TABLE IF NOT EXISTS public.otp_records (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone         TEXT NOT NULL,
  otp_code      TEXT NOT NULL,
  reason        TEXT NOT NULL DEFAULT 'registration',  -- registration, login, password_reset, phone_change, etc.
  is_verified   BOOLEAN DEFAULT FALSE,
  attempts      INTEGER DEFAULT 0,                     -- how many times user tried to verify this OTP
  max_attempts  INTEGER DEFAULT 5,                     -- max allowed attempts
  expires_at    TIMESTAMPTZ NOT NULL,
  verified_at   TIMESTAMPTZ,
  ip_address    TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_otp_phone_reason ON public.otp_records (phone, reason, is_verified);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON public.otp_records (expires_at);

-- Disable RLS (app uses custom auth, same pattern as messaging tables)
ALTER TABLE public.otp_records DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.otp_records TO anon, authenticated;
