-- ============================================================
-- IRIS Studio — Supabase Security Migration: Phase 12
-- Booking scalar bounds
-- ============================================================

BEGIN;

-- Bound booking scalar fields at database level. NOT VALID keeps existing
-- legacy rows untouched while enforcing the rules for future writes.
DO $$
BEGIN
  IF to_regclass('public.bookings') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'bookings_name_length_check'
        AND conrelid = 'public.bookings'::regclass
    ) THEN
      ALTER TABLE public.bookings
        ADD CONSTRAINT bookings_name_length_check
        CHECK (char_length(COALESCE(name, '')) BETWEEN 1 AND 100) NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'bookings_phone_length_check'
        AND conrelid = 'public.bookings'::regclass
    ) THEN
      ALTER TABLE public.bookings
        ADD CONSTRAINT bookings_phone_length_check
        CHECK (char_length(COALESCE(phone, '')) BETWEEN 1 AND 30) NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'bookings_nonnegative_amounts_check'
        AND conrelid = 'public.bookings'::regclass
    ) THEN
      ALTER TABLE public.bookings
        ADD CONSTRAINT bookings_nonnegative_amounts_check
        CHECK (
          COALESCE(package_price, 0) >= 0
          AND COALESCE(extra_companions_cost, 0) >= 0
          AND COALESCE(extras_total, 0) >= 0
          AND COALESCE(subtotal, 0) >= 0
          AND COALESCE(deposit_amount, 0) >= 0
          AND COALESCE(remaining_amount, 0) >= 0
        ) NOT VALID;
    END IF;
  END IF;
END $$;

COMMIT;
