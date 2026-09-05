-- ============================================================
-- IRIS Studio — Supabase Security Migration: Phase 2
-- Database RLS Hardening for Public Content & Settings Tables
-- File: supabase/migrations/20260905000001_phase2_public_content_rls.sql
-- ============================================================

-- ────────────────────────────────────────────
-- 1. SITE SETTINGS TABLE
-- ────────────────────────────────────────────
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin insert site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin update site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin delete site_settings" ON public.site_settings;

CREATE POLICY "Public read site_settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin insert site_settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin update site_settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin delete site_settings"
  ON public.site_settings FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);

-- ────────────────────────────────────────────
-- 2. PACKAGES TABLE
-- ────────────────────────────────────────────
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on packages" ON public.packages;
DROP POLICY IF EXISTS "Public read packages" ON public.packages;
DROP POLICY IF EXISTS "Admin insert packages" ON public.packages;
DROP POLICY IF EXISTS "Admin update packages" ON public.packages;
DROP POLICY IF EXISTS "Admin delete packages" ON public.packages;

CREATE POLICY "Public read packages"
  ON public.packages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin insert packages"
  ON public.packages FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin update packages"
  ON public.packages FOR UPDATE
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin delete packages"
  ON public.packages FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);

-- ────────────────────────────────────────────
-- 3. OFFERS TABLE
-- ────────────────────────────────────────────
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on offers" ON public.offers;
DROP POLICY IF EXISTS "Public read offers" ON public.offers;
DROP POLICY IF EXISTS "Admin insert offers" ON public.offers;
DROP POLICY IF EXISTS "Admin update offers" ON public.offers;
DROP POLICY IF EXISTS "Admin delete offers" ON public.offers;

CREATE POLICY "Public read offers"
  ON public.offers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin insert offers"
  ON public.offers FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin update offers"
  ON public.offers FOR UPDATE
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin delete offers"
  ON public.offers FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);

-- ────────────────────────────────────────────
-- 4. PRINTING PRODUCTS TABLE
-- ────────────────────────────────────────────
ALTER TABLE public.printing_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on printing_products" ON public.printing_products;
DROP POLICY IF EXISTS "Public read printing_products" ON public.printing_products;
DROP POLICY IF EXISTS "Admin insert printing_products" ON public.printing_products;
DROP POLICY IF EXISTS "Admin update printing_products" ON public.printing_products;
DROP POLICY IF EXISTS "Admin delete printing_products" ON public.printing_products;

CREATE POLICY "Public read printing_products"
  ON public.printing_products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin insert printing_products"
  ON public.printing_products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin update printing_products"
  ON public.printing_products FOR UPDATE
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin delete printing_products"
  ON public.printing_products FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);

-- ────────────────────────────────────────────
-- 5. FLOW ITEMS TABLE
-- ────────────────────────────────────────────
ALTER TABLE public.flow_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on flow_items" ON public.flow_items;
DROP POLICY IF EXISTS "Public read flow_items" ON public.flow_items;
DROP POLICY IF EXISTS "Admin insert flow_items" ON public.flow_items;
DROP POLICY IF EXISTS "Admin update flow_items" ON public.flow_items;
DROP POLICY IF EXISTS "Admin delete flow_items" ON public.flow_items;

CREATE POLICY "Public read flow_items"
  ON public.flow_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin insert flow_items"
  ON public.flow_items FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin update flow_items"
  ON public.flow_items FOR UPDATE
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin delete flow_items"
  ON public.flow_items FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);

-- ────────────────────────────────────────────
-- 6. PORTFOLIO ITEMS TABLE
-- ────────────────────────────────────────────
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on portfolio_items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Public read portfolio_items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Admin insert portfolio_items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Admin update portfolio_items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Admin delete portfolio_items" ON public.portfolio_items;

CREATE POLICY "Public read portfolio_items"
  ON public.portfolio_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin insert portfolio_items"
  ON public.portfolio_items FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin update portfolio_items"
  ON public.portfolio_items FOR UPDATE
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin delete portfolio_items"
  ON public.portfolio_items FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);

-- ────────────────────────────────────────────
-- 7. PACKAGE ITEMS TABLE
-- ────────────────────────────────────────────
ALTER TABLE public.package_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on package_items" ON public.package_items;
DROP POLICY IF EXISTS "Public read package_items" ON public.package_items;
DROP POLICY IF EXISTS "Admin insert package_items" ON public.package_items;
DROP POLICY IF EXISTS "Admin update package_items" ON public.package_items;
DROP POLICY IF EXISTS "Admin delete package_items" ON public.package_items;

CREATE POLICY "Public read package_items"
  ON public.package_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin insert package_items"
  ON public.package_items FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin update package_items"
  ON public.package_items FOR UPDATE
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin delete package_items"
  ON public.package_items FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);

-- ────────────────────────────────────────────
-- 8. TEMPLATE ITEMS TABLE
-- ────────────────────────────────────────────
ALTER TABLE public.template_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on template_items" ON public.template_items;
DROP POLICY IF EXISTS "Public read template_items" ON public.template_items;
DROP POLICY IF EXISTS "Admin insert template_items" ON public.template_items;
DROP POLICY IF EXISTS "Admin update template_items" ON public.template_items;
DROP POLICY IF EXISTS "Admin delete template_items" ON public.template_items;

CREATE POLICY "Public read template_items"
  ON public.template_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin insert template_items"
  ON public.template_items FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin update template_items"
  ON public.template_items FOR UPDATE
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin delete template_items"
  ON public.template_items FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);

-- ────────────────────────────────────────────
-- 9. BOOKING EXTRAS TABLE
-- ────────────────────────────────────────────
ALTER TABLE public.booking_extras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on booking_extras" ON public.booking_extras;
DROP POLICY IF EXISTS "Public read booking_extras" ON public.booking_extras;
DROP POLICY IF EXISTS "Admin insert booking_extras" ON public.booking_extras;
DROP POLICY IF EXISTS "Admin update booking_extras" ON public.booking_extras;
DROP POLICY IF EXISTS "Admin delete booking_extras" ON public.booking_extras;

CREATE POLICY "Public read booking_extras"
  ON public.booking_extras FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin insert booking_extras"
  ON public.booking_extras FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin update booking_extras"
  ON public.booking_extras FOR UPDATE
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin delete booking_extras"
  ON public.booking_extras FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);

-- ────────────────────────────────────────────
-- 10. BOOK EXTRAS TABLE
-- ────────────────────────────────────────────
ALTER TABLE public.book_extras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on book_extras" ON public.book_extras;
DROP POLICY IF EXISTS "Public read book_extras" ON public.book_extras;
DROP POLICY IF EXISTS "Admin insert book_extras" ON public.book_extras;
DROP POLICY IF EXISTS "Admin update book_extras" ON public.book_extras;
DROP POLICY IF EXISTS "Admin delete book_extras" ON public.book_extras;

CREATE POLICY "Public read book_extras"
  ON public.book_extras FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin insert book_extras"
  ON public.book_extras FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin update book_extras"
  ON public.book_extras FOR UPDATE
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin delete book_extras"
  ON public.book_extras FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);
