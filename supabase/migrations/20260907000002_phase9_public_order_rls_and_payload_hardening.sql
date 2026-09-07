-- ============================================================
-- IRIS Studio — Supabase Security Migration: Phase 9
-- Remove direct public order table access and enforce payload bounds
-- ============================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. BOOKINGS: all public writes/reads go through vetted RPCs.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Public insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public select bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow all on bookings" ON public.bookings;

-- Keep administrators as the only direct table users.
DROP POLICY IF EXISTS "Admin full access on bookings" ON public.bookings;
CREATE POLICY "Admin full access on bookings"
  ON public.bookings
  FOR ALL
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

-- ----------------------------------------------------------------
-- 2. PRINTING ORDERS: prevent bypassing authoritative pricing RPC.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Public insert printing_orders" ON public.printing_orders;
DROP POLICY IF EXISTS "Public select printing_orders" ON public.printing_orders;
DROP POLICY IF EXISTS "Allow all on printing_orders" ON public.printing_orders;
DROP POLICY IF EXISTS "Admin full access on printing_orders" ON public.printing_orders;

CREATE POLICY "Admin full access on printing_orders"
  ON public.printing_orders
  FOR ALL
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

-- ----------------------------------------------------------------
-- 3. Payload bounds for customer-controlled JSON/text fields.
--    These are intentionally future-safe constraints.
-- ----------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.bookings') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'bookings_notes_length_check'
        AND conrelid = 'public.bookings'::regclass
    ) THEN
      ALTER TABLE public.bookings
        ADD CONSTRAINT bookings_notes_length_check
        CHECK (char_length(COALESCE(notes, '')) <= 1000) NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'bookings_extras_payload_size_check'
        AND conrelid = 'public.bookings'::regclass
    ) THEN
      ALTER TABLE public.bookings
        ADD CONSTRAINT bookings_extras_payload_size_check
        CHECK (pg_column_size(COALESCE(extras, '{}'::jsonb)) <= 262144) NOT VALID;
    END IF;
  END IF;

  IF to_regclass('public.printing_orders') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'printing_orders_notes_length_check'
        AND conrelid = 'public.printing_orders'::regclass
    ) THEN
      ALTER TABLE public.printing_orders
        ADD CONSTRAINT printing_orders_notes_length_check
        CHECK (char_length(COALESCE(notes, '')) <= 2000) NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'printing_orders_image_urls_size_check'
        AND conrelid = 'public.printing_orders'::regclass
    ) THEN
      ALTER TABLE public.printing_orders
        ADD CONSTRAINT printing_orders_image_urls_size_check
        CHECK (pg_column_size(COALESCE(image_urls, '[]'::jsonb)) <= 524288) NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'printing_orders_cart_items_size_check'
        AND conrelid = 'public.printing_orders'::regclass
    ) THEN
      ALTER TABLE public.printing_orders
        ADD CONSTRAINT printing_orders_cart_items_size_check
        CHECK (pg_column_size(COALESCE(cart_items, '[]'::jsonb)) <= 524288) NOT VALID;
    END IF;
  END IF;
END $$;

-- ----------------------------------------------------------------
-- 4. Keep helper RPCs executable by public roles, while denying
--    direct table access through RLS above.
-- ----------------------------------------------------------------

COMMIT;
