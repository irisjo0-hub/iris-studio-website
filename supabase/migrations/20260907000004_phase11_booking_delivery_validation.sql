-- ============================================================
-- IRIS Studio — Supabase Security Migration: Phase 11
-- Validate delivery metadata before applying delivery charges
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.apply_booking_delivery_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_config JSONB;
  v_delivery_cost NUMERIC(10,2) := 0;
  v_is_delivery BOOLEAN := FALSE;
  v_address TEXT := '';
BEGIN
  v_is_delivery := COALESCE(position('[طلب توصيل]' IN COALESCE(NEW.notes, '')) = 1, FALSE);

  IF NOT v_is_delivery THEN
    RETURN NEW;
  END IF;

  -- Delivery selection is encoded in the existing notes field to avoid
  -- changing the public bookings table contract. Require an address so a
  -- forged "delivery" marker cannot create an operationally incomplete order.
  v_address := trim(COALESCE(substring(NEW.notes FROM 'العنوان:\s*([^\n]+)'), ''));
  IF v_address = '' OR char_length(v_address) > 500 THEN
    RAISE EXCEPTION 'A valid delivery address is required.' USING ERRCODE = '22023';
  END IF;

  SELECT value INTO v_config
  FROM public.site_settings
  WHERE key = 'booking_delivery_config';

  IF v_config IS NULL OR NOT COALESCE((v_config->>'enabled')::BOOLEAN, FALSE) THEN
    RAISE EXCEPTION 'Delivery is currently unavailable.' USING ERRCODE = '22023';
  END IF;

  v_delivery_cost := GREATEST(0, COALESCE((v_config->>'cost')::NUMERIC, 0));
  NEW.subtotal := COALESCE(NEW.subtotal, 0) + v_delivery_cost;
  NEW.remaining_amount := GREATEST(0, NEW.subtotal - COALESCE(NEW.deposit_amount, 0));

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_booking_delivery_total() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_booking_delivery_total() TO authenticated;

COMMIT;
