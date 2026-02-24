-- ============================================================
-- Migration: 001_auth_verification (SAFE VERSION)
-- Works in Supabase SQL Editor without auth schema access issues
-- ============================================================

-- 1. Add email_verified to profiles (safe if column already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'email_verified'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

-- 2. OTP storage table
CREATE TABLE IF NOT EXISTS public.otps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  email       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  attempts    INT NOT NULL DEFAULT 0,
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otps_user_id    ON public.otps(user_id);
CREATE INDEX IF NOT EXISTS idx_otps_email      ON public.otps(email);
CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON public.otps(expires_at);

-- 3. OTP event log for metrics
CREATE TABLE IF NOT EXISTS public.otp_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID,
  email      TEXT NOT NULL,
  event_type TEXT NOT NULL,
  meta       JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_events_email      ON public.otp_events(email);
CREATE INDEX IF NOT EXISTS idx_otp_events_event_type ON public.otp_events(event_type);
CREATE INDEX IF NOT EXISTS idx_otp_events_created_at ON public.otp_events(created_at);

-- 4. Backfill: existing users who are already confirmed in Supabase auth
-- (only runs if auth.users is accessible — safe to skip if it errors)
DO $$
BEGIN
  UPDATE public.profiles p
  SET email_verified = TRUE
  FROM auth.users u
  WHERE p.id = u.id
    AND u.email_confirmed_at IS NOT NULL
    AND p.email_verified = FALSE;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Backfill skipped (auth schema not accessible): %', SQLERRM;
END $$;

-- 5. RLS
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_events ENABLE ROW LEVEL SECURITY;

-- Users can only read their own OTPs
DROP POLICY IF EXISTS "Users read own OTPs" ON public.otps;
CREATE POLICY "Users read own OTPs"
  ON public.otps FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- ROLLBACK (paste and run manually if needed):
-- DROP TABLE IF EXISTS public.otp_events;
-- DROP TABLE IF EXISTS public.otps;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS email_verified;
-- ============================================================
