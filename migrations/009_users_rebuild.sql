-- ============================================================
-- Migration 009: Full Users Table Rebuild
-- Matches the new subscription / role / onboarding schema spec
-- Safe to run multiple times (idempotent CREATE IF NOT EXISTS)
-- ============================================================
-- 1. updated_at trigger function (shared utility)
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- 2. Main users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    company_name TEXT,
    phone TEXT,
    country TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'none' CHECK (
        subscription_tier IN ('none', 'starter', 'professional', 'institutional')
    ),
    subscription_status TEXT DEFAULT 'inactive' CHECK (
        subscription_status IN ('inactive', 'active', 'suspended', 'cancelled')
    ),
    subscription_expires_at TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'superadmin')),
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. updated_at trigger on users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- 4. Auto-create user row on new auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.users (id, email, full_name, email_verified)
VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        (NEW.email_confirmed_at IS NOT NULL)
    ) ON CONFLICT (id) DO
UPDATE
SET email = EXCLUDED.email,
    email_verified = (NEW.email_confirmed_at IS NOT NULL),
    updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- 5. Auto-update email_verified when auth confirms email
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed() RETURNS TRIGGER AS $$ BEGIN IF NEW.email_confirmed_at IS NOT NULL
    AND OLD.email_confirmed_at IS NULL THEN
UPDATE public.users
SET email_verified = TRUE,
    email = NEW.email,
    updated_at = NOW()
WHERE id = NEW.id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
AFTER
UPDATE OF email_confirmed_at ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_confirmed();
-- 6. Track last login
CREATE OR REPLACE FUNCTION public.handle_user_login() RETURNS TRIGGER AS $$ BEGIN
UPDATE public.users
SET last_login_at = NOW(),
    login_count = COALESCE(login_count, 0) + 1,
    updated_at = NOW()
WHERE id = NEW.id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 7. Backfill: migrate existing profiles data into users
DO $$ BEGIN
INSERT INTO public.users (id, email, email_verified, role, created_at)
SELECT p.id,
    COALESCE(p.email, u.email),
    COALESCE(
        p.email_verified,
        (u.email_confirmed_at IS NOT NULL)
    ),
    CASE
        WHEN p.role IN ('admin', 'superadmin') THEN p.role
        WHEN p.role = 'user'
        OR p.role IS NULL THEN 'member'
        ELSE 'member'
    END,
    COALESCE(p.created_at, NOW())
FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.id ON CONFLICT (id) DO NOTHING;
EXCEPTION
WHEN OTHERS THEN RAISE NOTICE 'Backfill from profiles skipped: %',
SQLERRM;
END $$;
-- 8. RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR
SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR
UPDATE USING (auth.uid() = id) WITH CHECK (
        -- Cannot self-escalate role
        role = (
            SELECT role
            FROM public.users
            WHERE id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role IN ('admin', 'superadmin')
        )
    );
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role IN ('admin', 'superadmin')
        )
    );
-- 9. Performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON public.users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);
-- ============================================================
-- ROLLBACK (manual):
-- DROP TABLE IF EXISTS public.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP FUNCTION IF EXISTS public.handle_user_email_confirmed();
-- DROP FUNCTION IF EXISTS public.update_updated_at_column();
-- ============================================================