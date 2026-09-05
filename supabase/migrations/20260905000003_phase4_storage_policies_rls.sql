-- ============================================================
-- IRIS Studio — Supabase Security Migration: Phase 4
-- Storage Buckets & Policies Security Hardening
-- File: 20260905000003_phase4_storage_policies_rls.sql
-- ============================================================

-- ────────────────────────────────────────────
-- 1. ENSURE STORAGE BUCKETS EXIST
-- ────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('packages', 'packages', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('templates', 'templates', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('reels', 'reels', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('printing-products', 'printing-products', true) ON CONFLICT (id) DO NOTHING;

-- Customer upload buckets marked private for enhanced security
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', false) ON CONFLICT (id) DO UPDATE SET public = false;
INSERT INTO storage.buckets (id, name, public) VALUES ('graduation-orders', 'graduation-orders', false) ON CONFLICT (id) DO UPDATE SET public = false;
INSERT INTO storage.buckets (id, name, public) VALUES ('printing-orders', 'printing-orders', false) ON CONFLICT (id) DO UPDATE SET public = false;


-- ────────────────────────────────────────────
-- 2. CLEAN UP EXISTING PERMISSIVE POLICIES
-- ────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Allow update portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Allow all portfolio" ON storage.objects;

DROP POLICY IF EXISTS "Public read packages" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload packages" ON storage.objects;
DROP POLICY IF EXISTS "Allow update packages" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete packages" ON storage.objects;
DROP POLICY IF EXISTS "Allow all packages" ON storage.objects;

DROP POLICY IF EXISTS "Public read templates" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload templates" ON storage.objects;
DROP POLICY IF EXISTS "Allow update templates" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete templates" ON storage.objects;

DROP POLICY IF EXISTS "Public read reels" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload reels" ON storage.objects;
DROP POLICY IF EXISTS "Allow update reels" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete reels" ON storage.objects;
DROP POLICY IF EXISTS "Allow all reels" ON storage.objects;

DROP POLICY IF EXISTS "Public read printing-products" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload printing-products" ON storage.objects;
DROP POLICY IF EXISTS "Allow update printing-products" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete printing-products" ON storage.objects;

DROP POLICY IF EXISTS "Public read payment-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload payment-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow update payment-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete payment-receipts" ON storage.objects;

DROP POLICY IF EXISTS "Public read graduation-orders" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload graduation-orders" ON storage.objects;
DROP POLICY IF EXISTS "Allow update graduation-orders" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete graduation-orders" ON storage.objects;

DROP POLICY IF EXISTS "Public read printing-orders" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload printing-orders" ON storage.objects;
DROP POLICY IF EXISTS "Allow update printing-orders" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete printing-orders" ON storage.objects;


-- ────────────────────────────────────────────
-- 3. PUBLIC ASSET BUCKETS (Read All, Write Admin)
-- ────────────────────────────────────────────

-- Portfolio Bucket
CREATE POLICY "Public read portfolio bucket" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'portfolio');
CREATE POLICY "Admin insert portfolio bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio' AND public.is_admin() = true);
CREATE POLICY "Admin update portfolio bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'portfolio' AND public.is_admin() = true) WITH CHECK (bucket_id = 'portfolio' AND public.is_admin() = true);
CREATE POLICY "Admin delete portfolio bucket" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'portfolio' AND public.is_admin() = true);

-- Packages Bucket
CREATE POLICY "Public read packages bucket" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'packages');
CREATE POLICY "Admin insert packages bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'packages' AND public.is_admin() = true);
CREATE POLICY "Admin update packages bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'packages' AND public.is_admin() = true) WITH CHECK (bucket_id = 'packages' AND public.is_admin() = true);
CREATE POLICY "Admin delete packages bucket" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'packages' AND public.is_admin() = true);

-- Templates Bucket
CREATE POLICY "Public read templates bucket" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'templates');
CREATE POLICY "Admin insert templates bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'templates' AND public.is_admin() = true);
CREATE POLICY "Admin update templates bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'templates' AND public.is_admin() = true) WITH CHECK (bucket_id = 'templates' AND public.is_admin() = true);
CREATE POLICY "Admin delete templates bucket" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'templates' AND public.is_admin() = true);

-- Reels Bucket
CREATE POLICY "Public read reels bucket" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'reels');
CREATE POLICY "Admin insert reels bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reels' AND public.is_admin() = true);
CREATE POLICY "Admin update reels bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'reels' AND public.is_admin() = true) WITH CHECK (bucket_id = 'reels' AND public.is_admin() = true);
CREATE POLICY "Admin delete reels bucket" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'reels' AND public.is_admin() = true);

-- Printing Products Bucket
CREATE POLICY "Public read printing-products bucket" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'printing-products');
CREATE POLICY "Admin insert printing-products bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'printing-products' AND public.is_admin() = true);
CREATE POLICY "Admin update printing-products bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'printing-products' AND public.is_admin() = true) WITH CHECK (bucket_id = 'printing-products' AND public.is_admin() = true);
CREATE POLICY "Admin delete printing-products bucket" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'printing-products' AND public.is_admin() = true);


-- ────────────────────────────────────────────
-- 4. SENSITIVE CUSTOMER UPLOAD BUCKETS
-- (Public Upload Allowed, Read/Update/Delete Admin Only)
-- ────────────────────────────────────────────

-- Payment Receipts Bucket
CREATE POLICY "Public upload payment-receipts bucket" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'payment-receipts');
CREATE POLICY "Admin read payment-receipts bucket" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'payment-receipts' AND public.is_admin() = true);
CREATE POLICY "Admin update payment-receipts bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'payment-receipts' AND public.is_admin() = true) WITH CHECK (bucket_id = 'payment-receipts' AND public.is_admin() = true);
CREATE POLICY "Admin delete payment-receipts bucket" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'payment-receipts' AND public.is_admin() = true);

-- Graduation Orders Bucket
CREATE POLICY "Public upload graduation-orders bucket" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'graduation-orders');
CREATE POLICY "Admin read graduation-orders bucket" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'graduation-orders' AND public.is_admin() = true);
CREATE POLICY "Admin update graduation-orders bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'graduation-orders' AND public.is_admin() = true) WITH CHECK (bucket_id = 'graduation-orders' AND public.is_admin() = true);
CREATE POLICY "Admin delete graduation-orders bucket" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'graduation-orders' AND public.is_admin() = true);

-- Printing Orders Bucket
CREATE POLICY "Public upload printing-orders bucket" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'printing-orders');
CREATE POLICY "Admin read printing-orders bucket" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'printing-orders' AND public.is_admin() = true);
CREATE POLICY "Admin update printing-orders bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'printing-orders' AND public.is_admin() = true) WITH CHECK (bucket_id = 'printing-orders' AND public.is_admin() = true);
CREATE POLICY "Admin delete printing-orders bucket" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'printing-orders' AND public.is_admin() = true);
