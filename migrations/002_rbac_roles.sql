-- ============================================================
-- Migration: 002_rbac_roles
-- Adds moderator/support role support and performance indexes
-- Safe to run multiple times (idempotent)
-- Paste the ENTIRE contents below into Supabase SQL Editor
-- ============================================================

-- 1. Add `role` column to profiles (TEXT, defaults to 'user')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'role'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'admin', 'moderator', 'support'));
  END IF;
END $$;

-- 2. Backfill: existing admin users (those with is_admin = true or user_role = 'admin')
DO $$
BEGIN
  -- Backfill from is_admin column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'is_admin'
  ) THEN
    UPDATE public.profiles
    SET role = 'admin'
    WHERE is_admin = true AND role = 'user';
  END IF;

  -- Backfill from user_role column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'user_role'
  ) THEN
    UPDATE public.profiles
    SET role = user_role
    WHERE user_role IN ('admin', 'moderator', 'support') AND role = 'user';
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Backfill skipped: %', SQLERRM;
END $$;

-- 3. Performance indexes

-- profiles: role (for admin queries filtering by role)
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles(role);

-- profiles: email_verified (partial index for unverified users only)
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified
  ON public.profiles(email_verified)
  WHERE email_verified = false;

-- webinar_registrations: user_id
-- NOTE: run only if this table exists in your schema
CREATE INDEX IF NOT EXISTS idx_webinar_registrations_user_id
  ON public.webinar_registrations(user_id);

-- 4. RLS: allow users to read/update their own profile row
-- (assumes RLS is already enabled on the profiles table)
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- users cannot self-escalate to admin/moderator/support
    role = 'user' OR auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- ============================================================
-- ROLLBACK (paste and run manually if needed):
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
-- DROP INDEX IF EXISTS idx_profiles_role;
-- DROP INDEX IF EXISTS idx_profiles_email_verified;
-- DROP INDEX IF EXISTS idx_webinar_registrations_user_id;
-- ============================================================
