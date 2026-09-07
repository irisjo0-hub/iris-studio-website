-- ============================================================
-- IRIS Studio — Supabase Security Migration: Phase 12
-- Booking scalar bounds + feedback referential integrity
-- ============================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. Bound booking scalar fields at database level.
--    NOT VALID keeps existing legacy rows untouched while enforcing
--    the rules for all future writes.
-- ----------------------------------------------------------------
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

-- ----------------------------------------------------------------
-- 2. Validate flow_feedback.flow_item_id against an existing public
--    flow item without requiring a schema-breaking FK migration.
--    This also permits legacy feedback rows whose old flow IDs may
--    no longer exist.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_flow_feedback_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.flow_item_id IS NULL OR trim(NEW.flow_item_id) = '' THEN
    RAISE EXCEPTION 'A valid flow item is required.' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.flow_items
    WHERE id = NEW.flow_item_id
  ) THEN
    RAISE EXCEPTION 'Invalid flow item.' USING ERRCODE = '22023';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_flow_feedback_item ON public.flow_feedback;
CREATE TRIGGER trg_validate_flow_feedback_item
BEFORE INSERT OR UPDATE OF flow_item_id ON public.flow_feedback
FOR EACH ROW
EXECUTE FUNCTION public.validate_flow_feedback_item();

REVOKE ALL ON FUNCTION public.validate_flow_feedback_item() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_flow_feedback_item() TO authenticated;

COMMIT;
