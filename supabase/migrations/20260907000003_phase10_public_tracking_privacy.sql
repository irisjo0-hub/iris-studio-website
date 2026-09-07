-- ============================================================
-- IRIS Studio — Supabase Security Migration: Phase 10
-- Public printing-order tracking privacy hardening
-- ============================================================

BEGIN;

-- Public tracking needs only the order number, current status, and
-- creation time. Customer identity is intentionally not returned.
CREATE OR REPLACE FUNCTION public.get_public_printing_order_status(
  p_order_number TEXT,
  p_phone TEXT
)
RETURNS TABLE(
  order_number TEXT,
  status TEXT,
  customer_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    po.order_number,
    po.status,
    ''::TEXT AS customer_name,
    po.created_at
  FROM public.printing_orders po
  WHERE length(trim(COALESCE(p_order_number, ''))) BETWEEN 5 AND 40
    AND trim(p_order_number) ~ '^ORD-[0-9]+$'
    AND length(trim(COALESCE(p_phone, ''))) BETWEEN 5 AND 30
    AND po.order_number = UPPER(trim(p_order_number))
    AND po.phone = trim(p_phone)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_printing_order_status(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_printing_order_status(TEXT, TEXT) TO anon, authenticated;

-- Bound customer-controlled scalar fields so malformed payloads cannot
-- create arbitrarily large database rows even when future RPC code changes.
DO $$
BEGIN
  IF to_regclass('public.printing_orders') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'printing_orders_customer_name_length_check'
        AND conrelid = 'public.printing_orders'::regclass
    ) THEN
      ALTER TABLE public.printing_orders
        ADD CONSTRAINT printing_orders_customer_name_length_check
        CHECK (char_length(COALESCE(customer_name, '')) BETWEEN 1 AND 100) NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'printing_orders_phone_length_check'
        AND conrelid = 'public.printing_orders'::regclass
    ) THEN
      ALTER TABLE public.printing_orders
        ADD CONSTRAINT printing_orders_phone_length_check
        CHECK (char_length(COALESCE(phone, '')) BETWEEN 1 AND 30) NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'printing_orders_delivery_address_length_check'
        AND conrelid = 'public.printing_orders'::regclass
    ) THEN
      ALTER TABLE public.printing_orders
        ADD CONSTRAINT printing_orders_delivery_address_length_check
        CHECK (char_length(COALESCE(delivery_address, '')) <= 500) NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'printing_orders_selected_color_length_check'
        AND conrelid = 'public.printing_orders'::regclass
    ) THEN
      ALTER TABLE public.printing_orders
        ADD CONSTRAINT printing_orders_selected_color_length_check
        CHECK (char_length(COALESCE(selected_color, '')) <= 100) NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'printing_orders_json_array_count_check'
        AND conrelid = 'public.printing_orders'::regclass
    ) THEN
      ALTER TABLE public.printing_orders
        ADD CONSTRAINT printing_orders_json_array_count_check
        CHECK (
          jsonb_typeof(COALESCE(image_urls, '[]'::jsonb)) = 'array'
          AND jsonb_array_length(COALESCE(image_urls, '[]'::jsonb)) <= 50
          AND jsonb_typeof(COALESCE(cart_items, '[]'::jsonb)) = 'array'
          AND jsonb_array_length(COALESCE(cart_items, '[]'::jsonb)) <= 50
        ) NOT VALID;
    END IF;
  END IF;
END $$;

COMMIT;
