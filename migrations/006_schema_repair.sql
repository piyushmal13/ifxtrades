-- Migration 006: Schema Repair & Synchronization
-- Ensures that even if tables already existed, they have the required columns for the upgrade.

DO $$
BEGIN
    -------------------------------------------------------
    -- 1. webinars Table Repairs
    -------------------------------------------------------
    -- slug
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'webinars' AND column_name = 'slug') THEN
        ALTER TABLE public.webinars ADD COLUMN slug TEXT UNIQUE;
        UPDATE public.webinars SET slug = id::text WHERE slug IS NULL;
        ALTER TABLE public.webinars ALTER COLUMN slug SET NOT NULL;
    END IF;

    -- capacity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'webinars' AND column_name = 'capacity') THEN
        ALTER TABLE public.webinars ADD COLUMN capacity INTEGER DEFAULT 0;
    END IF;

    -- venue
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'webinars' AND column_name = 'venue') THEN
        ALTER TABLE public.webinars ADD COLUMN venue TEXT;
    END IF;

    -- sponsor_tier
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'webinars' AND column_name = 'sponsor_tier') THEN
        ALTER TABLE public.webinars ADD COLUMN sponsor_tier TEXT DEFAULT 'GOLD';
    END IF;

    -- hotel_sponsor
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'webinars' AND column_name = 'hotel_sponsor') THEN
        ALTER TABLE public.webinars ADD COLUMN hotel_sponsor TEXT;
    END IF;

    -- price
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'webinars' AND column_name = 'price') THEN
        ALTER TABLE public.webinars ADD COLUMN price DECIMAL(10, 2) DEFAULT 0;
    END IF;

    -- is_premium
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'webinars' AND column_name = 'is_premium') THEN
        ALTER TABLE public.webinars ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
    END IF;

    -- registration_deadline
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'webinars' AND column_name = 'registration_deadline') THEN
        ALTER TABLE public.webinars ADD COLUMN registration_deadline TIMESTAMPTZ;
    END IF;

    -- starts_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'webinars' AND column_name = 'starts_at') THEN
        ALTER TABLE public.webinars ADD COLUMN starts_at TIMESTAMPTZ;
    END IF;

    -- hero_image_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'webinars' AND column_name = 'hero_image_url') THEN
        ALTER TABLE public.webinars ADD COLUMN hero_image_url TEXT;
    END IF;

    -- promo_video_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'webinars' AND column_name = 'promo_video_url') THEN
        ALTER TABLE public.webinars ADD COLUMN promo_video_url TEXT;
    END IF;

    -------------------------------------------------------
    -- 2. algorithms Table Repairs
    -------------------------------------------------------
    -- slug
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'algorithms' AND column_name = 'slug') THEN
        ALTER TABLE public.algorithms ADD COLUMN slug TEXT UNIQUE;
        UPDATE public.algorithms SET slug = id::text WHERE slug IS NULL;
        ALTER TABLE public.algorithms ALTER COLUMN slug SET NOT NULL;
    END IF;

    -- risk_classification
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'algorithms' AND column_name = 'risk_classification') THEN
        ALTER TABLE public.algorithms ADD COLUMN risk_classification TEXT DEFAULT 'MEDIUM';
    END IF;

    -- monthly_roi_pct
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'algorithms' AND column_name = 'monthly_roi_pct') THEN
        ALTER TABLE public.algorithms ADD COLUMN monthly_roi_pct DECIMAL(5, 2) DEFAULT 0;
    END IF;

    -- min_capital
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'algorithms' AND column_name = 'min_capital') THEN
        ALTER TABLE public.algorithms ADD COLUMN min_capital DECIMAL(15, 2) DEFAULT 0;
    END IF;

    -- compliance_disclaimer
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'algorithms' AND column_name = 'compliance_disclaimer') THEN
        ALTER TABLE public.algorithms ADD COLUMN compliance_disclaimer TEXT;
    END IF;

    -- image_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'algorithms' AND column_name = 'image_url') THEN
        ALTER TABLE public.algorithms ADD COLUMN image_url TEXT;
    END IF;

    -------------------------------------------------------
    -- 3. university_courses Table Repairs
    -------------------------------------------------------
    -- slug
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'university_courses' AND column_name = 'slug') THEN
        ALTER TABLE public.university_courses ADD COLUMN slug TEXT UNIQUE;
        UPDATE public.university_courses SET slug = id::text WHERE slug IS NULL;
        ALTER TABLE public.university_courses ALTER COLUMN slug SET NOT NULL;
    END IF;

    -- plan_required
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'university_courses' AND column_name = 'plan_required') THEN
        ALTER TABLE public.university_courses ADD COLUMN plan_required TEXT DEFAULT 'free';
    END IF;

    -------------------------------------------------------
    -- 4. blog_posts Table Repairs
    -------------------------------------------------------
    -- slug
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'slug') THEN
        ALTER TABLE public.blog_posts ADD COLUMN slug TEXT UNIQUE;
        UPDATE public.blog_posts SET slug = id::text WHERE slug IS NULL;
        ALTER TABLE public.blog_posts ALTER COLUMN slug SET NOT NULL;
    END IF;

    -- excerpt
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'excerpt') THEN
        ALTER TABLE public.blog_posts ADD COLUMN excerpt TEXT;
    END IF;

    -- featured_image_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'featured_image_url') THEN
        ALTER TABLE public.blog_posts ADD COLUMN featured_image_url TEXT;
    END IF;

    -- published_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'published_at') THEN
        ALTER TABLE public.blog_posts ADD COLUMN published_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

END $$;
