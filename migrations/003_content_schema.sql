-- Migration 003: Content Schema

-- 1. Webinars
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

-- Webinar Agenda Items
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

-- Webinar FAQs
CREATE TABLE IF NOT EXISTS webinar_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webinar_id UUID REFERENCES webinars(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webinar Sponsors
CREATE TABLE IF NOT EXISTS webinar_sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webinar_id UUID REFERENCES webinars(id) ON DELETE CASCADE,
    tier TEXT DEFAULT 'SILVER',
    name TEXT NOT NULL,
    logo_url TEXT,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Algorithms
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

-- Algo Performance Snapshots
CREATE TABLE IF NOT EXISTS algo_performance_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    algo_id UUID REFERENCES algorithms(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    roi_pct DECIMAL(5, 2) NOT NULL,
    drawdown_pct DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. University Courses
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

-- Course Lessons
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

-- 4. Blog Posts
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

-- 5. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    quote TEXT NOT NULL,
    video_url TEXT,
    broker_endorsement TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. User Specific Tables (Registrations, Licenses, Progress)

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

CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- RLS Policies

-- Public Read Access
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for webinars" ON webinars;
CREATE POLICY "Public read access for webinars" ON webinars FOR SELECT USING (TRUE);

ALTER TABLE webinar_agenda_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for agenda" ON webinar_agenda_items;
CREATE POLICY "Public read access for agenda" ON webinar_agenda_items FOR SELECT USING (TRUE);

ALTER TABLE webinar_faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for faqs" ON webinar_faqs;
CREATE POLICY "Public read access for faqs" ON webinar_faqs FOR SELECT USING (TRUE);

ALTER TABLE webinar_sponsors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for sponsors" ON webinar_sponsors;
CREATE POLICY "Public read access for sponsors" ON webinar_sponsors FOR SELECT USING (TRUE);

ALTER TABLE algorithms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for algorithms" ON algorithms;
CREATE POLICY "Public read access for algorithms" ON algorithms FOR SELECT USING (TRUE);

ALTER TABLE algo_performance_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for snapshots" ON algo_performance_snapshots;
CREATE POLICY "Public read access for snapshots" ON algo_performance_snapshots FOR SELECT USING (TRUE);

ALTER TABLE university_courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for courses" ON university_courses;
CREATE POLICY "Public read access for courses" ON university_courses FOR SELECT USING (TRUE);

ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for lessons" ON course_lessons;
CREATE POLICY "Public read access for lessons" ON course_lessons FOR SELECT USING (TRUE);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for blog posts" ON blog_posts;
CREATE POLICY "Public read access for blog posts" ON blog_posts FOR SELECT USING (TRUE);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for reviews" ON reviews;
CREATE POLICY "Public read access for reviews" ON reviews FOR SELECT USING (TRUE);
