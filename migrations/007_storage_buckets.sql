-- ============================================================
-- Migration: 007_storage_buckets
-- Creates public storage buckets for all app image assets.
-- Run this in Supabase SQL Editor.
-- ============================================================

-- Create storage buckets (safe to run multiple times)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('logos',      'logos',      true, 5242880,  ARRAY['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('webinars',   'webinars',   true, 10485760, ARRAY['image/png','image/jpeg','image/webp']),
  ('algos',      'algos',      true, 10485760, ARRAY['image/png','image/jpeg','image/webp']),
  ('blog',       'blog',       true, 10485760, ARRAY['image/png','image/jpeg','image/webp']),
  ('reviews',    'reviews',    true, 5242880,  ARRAY['image/png','image/jpeg','image/webp']),
  ('university', 'university', true, 10485760, ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── RLS Policies ────────────────────────────────────────────────

-- Public SELECT on all buckets (anyone can read images)
DO $$
DECLARE
  bucket_name text;
BEGIN
  FOREACH bucket_name IN ARRAY ARRAY['logos','webinars','algos','blog','reviews','university']
  LOOP
    -- Allow public read
    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS "Public read %1$s" ON storage.objects FOR SELECT USING (bucket_id = %2$L)',
      bucket_name, bucket_name
    );

    -- Only admins can upload/update/delete
    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS "Admin write %1$s" ON storage.objects
       FOR INSERT WITH CHECK (
         bucket_id = %2$L
         AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
       )',
      bucket_name, bucket_name
    );

    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS "Admin update %1$s" ON storage.objects
       FOR UPDATE USING (
         bucket_id = %2$L
         AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
       )',
      bucket_name, bucket_name
    );

    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS "Admin delete %1$s" ON storage.objects
       FOR DELETE USING (
         bucket_id = %2$L
         AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
       )',
      bucket_name, bucket_name
    );
  END LOOP;
END $$;

-- ── Usage notes ─────────────────────────────────────────────────
-- After running this migration:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Upload your logo.png to the "logos" bucket
-- 3. Set NEXT_PUBLIC_SUPABASE_URL in your .env.local and Vercel env vars
-- 4. The getLogoUrl() helper in lib/storage.ts will automatically
--    serve from Supabase with WebP optimization.
