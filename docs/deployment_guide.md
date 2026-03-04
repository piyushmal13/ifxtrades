# Deployment & Seeding Guide

Since the Supabase CLI is not configured in this environment, you should manually apply the migrations and seed data using the **Supabase SQL Editor**.

## Steps to Deploy

1.  Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Navigate to your project.
3.  Click on the **SQL Editor** in the left sidebar.
4.  Create a **New Query**.
5.  Copy and paste the contents of the following SQL files in order:
    - [006_schema_repair.sql](file:///c:/Users/Piyush/Downloads/ifxtrades_full_institutional_build/ifxtrades_full_institutional_build/migrations/006_schema_repair.sql) - Fixes missing columns in existing tables.
    - [003_content_schema.sql](file:///c:/Users/Piyush/Downloads/ifxtrades_full_institutional_build/ifxtrades_full_institutional_build/migrations/003_content_schema.sql) - Sets up new tables and RLS.
    - [005_enrollment_support.sql](file:///c:/Users/Piyush/Downloads/ifxtrades_full_institutional_build/ifxtrades_full_institutional_build/migrations/005_enrollment_support.sql) - Adds enrollment support.
    - [004_initial_seed.sql](file:///c:/Users/Piyush/Downloads/ifxtrades_full_institutional_build/ifxtrades_full_institutional_build/migrations/004_initial_seed.sql) - Populates with institutional content.
6.  Click **Run**.

```sql
-- Combined Institutional Migration Script
-- Run these sequentially in the Supabase SQL Editor.

-- [001] Auth & Profiles Repair
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  attempts INT NOT NULL DEFAULT 0,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- [006] Schema Repair & Synchronization
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'webinars' AND column_name = 'slug') THEN
        ALTER TABLE public.webinars ADD COLUMN slug TEXT UNIQUE;
        UPDATE public.webinars SET slug = id::text WHERE slug IS NULL;
        ALTER TABLE public.webinars ALTER COLUMN slug SET NOT NULL;
    END IF;
    -- (Additional columns like capacity, venue, sponsor_tier, etc. are added here as well)
END $$;

-- [003] Content Schema (Tables & RLS)
CREATE TABLE IF NOT EXISTS webinars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    venue TEXT,
    sponsor_tier TEXT DEFAULT 'GOLD',
    hotel_sponsor TEXT,
    capacity INTEGER DEFAULT 0,
    price DECIMAL(10, 2) DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    registration_deadline TIMESTAMPTZ,
    starts_at TIMESTAMPTZ,
    hero_image_url TEXT,
    promo_video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webinar_agenda_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webinar_id UUID REFERENCES webinars(id) ON DELETE CASCADE,
    time TEXT,
    topic TEXT NOT NULL,
    speaker_name TEXT,
    speaker_linkedin TEXT,
    speaker_image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webinar_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webinar_id UUID REFERENCES webinars(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webinar_sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webinar_id UUID REFERENCES webinars(id) ON DELETE CASCADE,
    tier TEXT DEFAULT 'SILVER',
    name TEXT NOT NULL,
    logo_url TEXT,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS algorithms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    risk_classification TEXT DEFAULT 'MEDIUM',
    monthly_roi_pct DECIMAL(5, 2) DEFAULT 0,
    min_capital DECIMAL(15, 2) DEFAULT 0,
    price DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    compliance_disclaimer TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS university_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'INTERMEDIATE',
    description TEXT,
    plan_required TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES university_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    duration_minutes INTEGER,
    video_url TEXT,
    pdf_url TEXT,
    is_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    body TEXT NOT NULL,
    category TEXT DEFAULT 'Macro',
    author_name TEXT DEFAULT 'IFX Research Desk',
    featured_image_url TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    quote TEXT NOT NULL,
    video_url TEXT,
    broker_endorsement TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registrations & Licenses
CREATE TABLE IF NOT EXISTS webinar_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    webinar_id UUID REFERENCES webinars(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS algo_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    algo_id UUID REFERENCES algorithms(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [005] Enrollment Support
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES university_courses(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'enrolled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- [004] Core Seed Data
-- Note: Insert statements for high-end institutional content
INSERT INTO webinars (slug, title, description, venue, sponsor_tier, capacity, price, is_premium, starts_at)
VALUES ('macro-liquidity-2026', 'The Great Divergence Outlook', 'Institutional briefing for G7 mandates.', 'London Executive Suite', 'PLATINUM', 150, 499.00, TRUE, NOW() + INTERVAL '15 days')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO algorithms (slug, name, description, risk_classification, monthly_roi_pct, min_capital, price)
VALUES ('ifx-genesis-8', 'IFX Genesis-8: HFT Correlation Scalper', 'High-frequency mean reversion model.', 'HIGH', 5.85, 50000.00, 4500.00)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO university_courses (slug, title, category, description, plan_required)
VALUES ('institutional-order-flow', 'Institutional Order Flow & Market Mechanics', 'INSTITUTIONAL', 'Bank-level execution training.', 'premium')
ON CONFLICT (slug) DO NOTHING;
```

## Post-Deployment Verification

After running the scripts:
- **Homepage**: Refresh your browser. You should see "The Great Divergence" and "IFX Genesis-8" appearing in their respective sections.
- **Admin Panel**: Visit the admin dashboard. The KPIs (Total Users, Webinar Registrations, etc.) should now reflect the live database state instead of demo fallbacks.
- **Insights**: The blog section should display the high-end institutional research posts.
