-- ============================================================
-- IRIS Studio — Supabase Security Migration: Phase 3
-- Database RLS Hardening for Customer Data & Orders Tables
-- File: 20260905000002_phase3_customer_orders_rls.sql
-- ============================================================

-- ────────────────────────────────────────────
-- 1. BOOKINGS TABLE
-- ────────────────────────────────────────────
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public select bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin delete bookings" ON public.bookings;

-- Public can submit new bookings
CREATE POLICY "Public insert bookings"
  ON public.bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Public can read bookings (required for slot availability check & checkout return)
CREATE POLICY "Public select bookings"
  ON public.bookings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can update booking details or status
CREATE POLICY "Admin update bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

-- Only admins can delete bookings
CREATE POLICY "Admin delete bookings"
  ON public.bookings FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);

-- ────────────────────────────────────────────
-- 2. GRADUATION ORDERS TABLE
-- ────────────────────────────────────────────
ALTER TABLE public.graduation_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on graduation_orders" ON public.graduation_orders;
DROP POLICY IF EXISTS "Public insert graduation_orders" ON public.graduation_orders;
DROP POLICY IF EXISTS "Admin select graduation_orders" ON public.graduation_orders;
DROP POLICY IF EXISTS "Admin update graduation_orders" ON public.graduation_orders;
DROP POLICY IF EXISTS "Admin delete graduation_orders" ON public.graduation_orders;

-- Public can submit graduation book orders
CREATE POLICY "Public insert graduation_orders"
  ON public.graduation_orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can view sensitive customer graduation orders
CREATE POLICY "Admin select graduation_orders"
  ON public.graduation_orders FOR SELECT
  TO authenticated
  USING (public.is_admin() = true);

-- Only admins can update graduation order status or details
CREATE POLICY "Admin update graduation_orders"
  ON public.graduation_orders FOR UPDATE
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

-- Only admins can delete graduation orders
CREATE POLICY "Admin delete graduation_orders"
  ON public.graduation_orders FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);

-- ────────────────────────────────────────────
-- 3. PRINTING ORDERS TABLE
-- ────────────────────────────────────────────
ALTER TABLE public.printing_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on printing_orders" ON public.printing_orders;
DROP POLICY IF EXISTS "Public insert printing_orders" ON public.printing_orders;
DROP POLICY IF EXISTS "Public select printing_orders" ON public.printing_orders;
DROP POLICY IF EXISTS "Admin update printing_orders" ON public.printing_orders;
DROP POLICY IF EXISTS "Admin delete printing_orders" ON public.printing_orders;

-- Public can submit printing orders
CREATE POLICY "Public insert printing_orders"
  ON public.printing_orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Public can read printing orders (required for checkout returning & customer order portal tracking)
CREATE POLICY "Public select printing_orders"
  ON public.printing_orders FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can update printing order status or details
CREATE POLICY "Admin update printing_orders"
  ON public.printing_orders FOR UPDATE
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

-- Only admins can delete printing orders
CREATE POLICY "Admin delete printing_orders"
  ON public.printing_orders FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);
