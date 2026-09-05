-- ============================================================
-- IRIS Studio — Supabase Storage Security Migration
-- Reproducible Production Storage Bucket Policies & RLS Migration
-- File: supabase-migration-storage-security.sql
-- ============================================================

-- ────────────────────────────────────────────
-- 1. STORAGE BUCKET PUBLIC PRIVACY CONFIGURATION
-- ────────────────────────────────────────────
-- Updates the public visibility flag for existing studio storage buckets:
-- Private buckets (public = false): payment-receipts, graduation-orders, reels
-- Public buckets (public = true): packages, portfolio, templates

UPDATE storage.buckets
SET public = CASE id
  WHEN 'payment-receipts' THEN false
  WHEN 'graduation-orders' THEN false
  WHEN 'reels' THEN false
  WHEN 'packages' THEN true
  WHEN 'portfolio' THEN true
  WHEN 'templates' THEN true
END
WHERE id IN (
  'payment-receipts',
  'graduation-orders',
  'reels',
  'packages',
  'portfolio',
  'templates'
);


-- ────────────────────────────────────────────
-- 2. CLEANUP LEGACY & PRODUCTION STORAGE POLICIES
-- ────────────────────────────────────────────
-- Idempotently drop old permissive or existing policies matching production names across all 6 buckets.

-- Legacy permissive policies
DROP POLICY IF EXISTS "Allow all payment-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow all graduation-orders" ON storage.objects;
DROP POLICY IF EXISTS "Allow all reels" ON storage.objects;
DROP POLICY IF EXISTS "Allow all packages" ON storage.objects;
DROP POLICY IF EXISTS "Allow all portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Allow all templates" ON storage.objects;

-- Exact production policy names for private buckets
DROP POLICY IF EXISTS "Public upload payment-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admins read payment-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admins update payment-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete payment-receipts" ON storage.objects;

DROP POLICY IF EXISTS "Public upload graduation-orders" ON storage.objects;
DROP POLICY IF EXISTS "Admins read graduation-orders" ON storage.objects;
DROP POLICY IF EXISTS "Admins update graduation-orders" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete graduation-orders" ON storage.objects;

-- Exact production policy names for public buckets
DROP POLICY IF EXISTS "Public read packages" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload packages" ON storage.objects;
DROP POLICY IF EXISTS "Admins update packages" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete packages" ON storage.objects;

DROP POLICY IF EXISTS "Public read portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Admins update portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete portfolio" ON storage.objects;

DROP POLICY IF EXISTS "Public read templates" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload templates" ON storage.objects;
DROP POLICY IF EXISTS "Admins update templates" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete templates" ON storage.objects;


-- ────────────────────────────────────────────
-- 3. PRIVATE BUCKETS POLICIES: payment-receipts & graduation-orders
-- ────────────────────────────────────────────
-- Public customers can upload files (INSERT) during booking & order checkout.
-- Reading (SELECT), Updating (UPDATE), and Deleting (DELETE) are restricted strictly to authenticated admins.

-- A) Bucket: payment-receipts
CREATE POLICY "Public upload payment-receipts"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'payment-receipts');

CREATE POLICY "Admins read payment-receipts"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'payment-receipts' AND public.is_admin() = true);

CREATE POLICY "Admins update payment-receipts"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'payment-receipts' AND public.is_admin() = true)
  WITH CHECK (bucket_id = 'payment-receipts' AND public.is_admin() = true);

CREATE POLICY "Admins delete payment-receipts"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'payment-receipts' AND public.is_admin() = true);


-- B) Bucket: graduation-orders
CREATE POLICY "Public upload graduation-orders"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'graduation-orders');

CREATE POLICY "Admins read graduation-orders"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'graduation-orders' AND public.is_admin() = true);

CREATE POLICY "Admins update graduation-orders"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'graduation-orders' AND public.is_admin() = true)
  WITH CHECK (bucket_id = 'graduation-orders' AND public.is_admin() = true);

CREATE POLICY "Admins delete graduation-orders"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'graduation-orders' AND public.is_admin() = true);


-- ────────────────────────────────────────────
-- 4. PUBLIC BUCKETS POLICIES: packages, portfolio, templates
-- ────────────────────────────────────────────
-- Public reading (SELECT) is allowed for all visitors (anon & authenticated).
-- Writing (INSERT, UPDATE, DELETE) is restricted strictly to authenticated admins.

-- A) Bucket: packages
CREATE POLICY "Public read packages"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'packages');

CREATE POLICY "Admins upload packages"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'packages' AND public.is_admin() = true);

CREATE POLICY "Admins update packages"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'packages' AND public.is_admin() = true)
  WITH CHECK (bucket_id = 'packages' AND public.is_admin() = true);

CREATE POLICY "Admins delete packages"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'packages' AND public.is_admin() = true);


-- B) Bucket: portfolio
CREATE POLICY "Public read portfolio"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'portfolio');

CREATE POLICY "Admins upload portfolio"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio' AND public.is_admin() = true);

CREATE POLICY "Admins update portfolio"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_admin() = true)
  WITH CHECK (bucket_id = 'portfolio' AND public.is_admin() = true);

CREATE POLICY "Admins delete portfolio"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_admin() = true);


-- C) Bucket: templates
CREATE POLICY "Public read templates"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'templates');

CREATE POLICY "Admins upload templates"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'templates' AND public.is_admin() = true);

CREATE POLICY "Admins update templates"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'templates' AND public.is_admin() = true)
  WITH CHECK (bucket_id = 'templates' AND public.is_admin() = true);

CREATE POLICY "Admins delete templates"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'templates' AND public.is_admin() = true);


-- ────────────────────────────────────────────
-- 5. BUCKET: reels (LEGACY / ISOLATED BUCKET)
-- ────────────────────────────────────────────
-- Legacy permissive policy "Allow all reels" was dropped above.
-- No replacement public policy is created. The bucket and existing objects are preserved intact without access.
