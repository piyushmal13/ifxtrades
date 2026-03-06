-- Migration 008: Profile Email Synchronization
-- Ensures public.profiles table has the email column and stays synced with auth.users.
DO $$ BEGIN -------------------------------------------------------
-- 1. Add email column to profiles
-------------------------------------------------------
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'email'
) THEN
ALTER TABLE public.profiles
ADD COLUMN email TEXT;
-- Backfill existing emails from auth.users (requires auth schema access)
BEGIN
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;
EXCEPTION
WHEN OTHERS THEN RAISE NOTICE 'Initial email backfill failed: %',
SQLERRM;
END;
END IF;
-------------------------------------------------------
-- 2. Email Sync Trigger
-------------------------------------------------------
-- Function to handle the sync
CREATE OR REPLACE FUNCTION public.handle_user_email_sync() RETURNS TRIGGER AS $$ BEGIN
UPDATE public.profiles
SET email = NEW.email
WHERE id = NEW.id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger on auth.users update
-- Note: This requires running as a superuser or having sufficient permissions on the auth schema.
-- In Supabase, you can set this up via the SQL Editor.
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
AFTER
UPDATE OF email ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_sync();
END $$;