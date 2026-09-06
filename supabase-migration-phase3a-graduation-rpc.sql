-- ============================================================
-- IRIS Studio — Supabase Security Migration: Phase 3A (FINAL REVISED)
-- Secure Graduation Order Creation RPC, Dynamic Sequence & Safe Unique Constraint
-- File: supabase-migration-phase3a-graduation-rpc.sql
-- ============================================================

-- ────────────────────────────────────────────
-- 1. DEDICATED SEQUENCE FOR GRADUATION ORDER NUMBERS (FULLY IDEMPOTENT & CONCURRENCY-SAFE)
-- ────────────────────────────────────────────
-- Creates sequence idempotently
CREATE SEQUENCE IF NOT EXISTS public.graduation_order_seq;

-- Dynamically align sequence value with GREATEST(max_existing_db_number, current_sequence_value)
DO $$
DECLARE
  v_max_existing BIGINT := 1000;
  v_seq_current BIGINT := 1000;
BEGIN
  SELECT COALESCE(
    MAX((substring(order_number from '^GRAD-([0-9]+)$'))::BIGINT),
    1000
  )
  INTO v_max_existing
  FROM public.graduation_orders
  WHERE order_number ~ '^GRAD-[0-9]+$';

  SELECT COALESCE(last_value, 1000)
  INTO v_seq_current
  FROM pg_sequences
  WHERE schemaname = 'public'
    AND sequencename = 'graduation_order_seq';

  IF v_seq_current > v_max_existing THEN
    v_max_existing := v_seq_current;
  END IF;

  PERFORM setval(
    'public.graduation_order_seq',
    v_max_existing,
    true
  );
END $$;


-- ────────────────────────────────────────────
-- 2. PREFLIGHT DUPLICATE CHECK & SAFE UNIQUE CONSTRAINT
-- ────────────────────────────────────────────
-- Checks for existing duplicate order_numbers. Aborts with clear error if duplicates exist.
DO $$
DECLARE
  v_duplicate_count INT;
BEGIN
  -- 1. Check for duplicate order_number records in existing database rows
  SELECT COUNT(*) INTO v_duplicate_count
  FROM (
    SELECT order_number
    FROM public.graduation_orders
    WHERE order_number IS NOT NULL AND order_number <> ''
    GROUP BY order_number
    HAVING COUNT(*) > 1
  ) duplicates;

  IF v_duplicate_count > 0 THEN
    RAISE EXCEPTION 'PREFLIGHT ABORT: Found % duplicate order_number values in existing graduation_orders records! Please resolve duplicate order numbers manually before applying the UNIQUE constraint.', v_duplicate_count USING ERRCODE = '23505';
  END IF;

  -- 2. Safely add UNIQUE constraint if no duplicates exist
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'graduation_orders_order_number_key'
      AND conrelid = 'public.graduation_orders'::regclass
  ) THEN
    ALTER TABLE public.graduation_orders 
      ADD CONSTRAINT graduation_orders_order_number_key UNIQUE (order_number);
  END IF;
END $$;


-- ────────────────────────────────────────────
-- 3. SECURE GRADUATION ORDER CREATION RPC
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_public_graduation_order(
  p_order_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_package_id BIGINT;
  v_arabic_name TEXT;
  v_english_name TEXT;
  v_phone TEXT;
  v_university TEXT;
  v_major TEXT;
  v_custom_dedication TEXT;
  v_ext_tpl_num TEXT;
  v_int_tpl_num TEXT;
  v_front_cover_url TEXT;
  v_back_cover_urls JSONB;
  v_internal_image_urls JSONB;
  v_photo_pages_qty INT;
  v_photo_pages_urls JSONB;
  v_delivery_selected BOOLEAN;
  v_delivery_address TEXT;
  v_receipt_url TEXT;

  v_package_title TEXT;
  v_package_price NUMERIC(10,2) := 0;
  v_matching_packages_count INT := 0;

  v_photo_pages_total NUMERIC(10,2) := 0;
  v_delivery_cost NUMERIC(10,2) := 0;
  v_subtotal NUMERIC(10,2) := 0;
  v_deposit_amount NUMERIC(10,2) := 5.00;
  v_remaining_amount NUMERIC(10,2) := 0;

  v_next_seq BIGINT;
  v_generated_order_num TEXT;
  v_new_id BIGINT;
BEGIN
  -- 1. STRICT INPUT VALIDATION
  IF jsonb_typeof(p_order_data) <> 'object' THEN
    RAISE EXCEPTION 'Invalid JSON payload structure' USING ERRCODE = '22023';
  END IF;

  -- Read package_id from JSON (must be provided as BIGINT/INTEGER or numeric string)
  IF (p_order_data->>'package_id') IS NULL OR TRIM(COALESCE(p_order_data->>'package_id', '')) = '' THEN
    RAISE EXCEPTION 'Package selection (package_id) is required' USING ERRCODE = '23502';
  END IF;
  v_package_id := (p_order_data->>'package_id')::BIGINT;

  v_arabic_name := TRIM(COALESCE(p_order_data->>'arabic_name', ''));
  v_english_name := TRIM(COALESCE(p_order_data->>'english_name', ''));
  v_phone := TRIM(COALESCE(p_order_data->>'phone', ''));
  v_university := TRIM(COALESCE(p_order_data->>'university', ''));
  v_major := TRIM(COALESCE(p_order_data->>'major', ''));
  v_custom_dedication := TRIM(COALESCE(p_order_data->>'custom_dedication', ''));
  v_ext_tpl_num := TRIM(COALESCE(p_order_data->>'external_template_number', ''));
  v_int_tpl_num := TRIM(COALESCE(p_order_data->>'internal_template_number', ''));
  v_front_cover_url := NULLIF(TRIM(COALESCE(p_order_data->>'front_cover_url', '')), '');
  v_back_cover_urls := COALESCE(p_order_data->'back_cover_urls', '[]'::jsonb);
  v_internal_image_urls := COALESCE(p_order_data->'internal_image_urls', '[]'::jsonb);
  v_photo_pages_urls := COALESCE(p_order_data->'photographic_pages_urls', '[]'::jsonb);
  v_delivery_selected := COALESCE((p_order_data->>'delivery_selected')::BOOLEAN, false);
  v_delivery_address := TRIM(COALESCE(p_order_data->>'delivery_address', ''));
  v_receipt_url := NULLIF(TRIM(COALESCE(p_order_data->>'receipt_url', '')), '');

  -- Validate Text Fields & String Lengths
  IF v_arabic_name = '' THEN
    RAISE EXCEPTION 'Arabic name is required' USING ERRCODE = '23502';
  ELSIF LENGTH(v_arabic_name) > 100 THEN
    RAISE EXCEPTION 'Arabic name exceeds maximum limit of 100 characters' USING ERRCODE = '22023';
  END IF;

  IF v_english_name = '' THEN
    RAISE EXCEPTION 'English name is required' USING ERRCODE = '23502';
  ELSIF LENGTH(v_english_name) > 100 THEN
    RAISE EXCEPTION 'English name exceeds maximum limit of 100 characters' USING ERRCODE = '22023';
  END IF;

  IF v_phone = '' THEN
    RAISE EXCEPTION 'Phone number is required' USING ERRCODE = '23502';
  ELSIF LENGTH(v_phone) > 30 THEN
    RAISE EXCEPTION 'Phone number exceeds maximum limit of 30 characters' USING ERRCODE = '22023';
  END IF;

  IF v_university = '' THEN
    RAISE EXCEPTION 'University name is required' USING ERRCODE = '23502';
  ELSIF LENGTH(v_university) > 100 THEN
    RAISE EXCEPTION 'University name exceeds maximum limit of 100 characters' USING ERRCODE = '22023';
  END IF;

  IF v_major = '' THEN
    RAISE EXCEPTION 'Major is required' USING ERRCODE = '23502';
  ELSIF LENGTH(v_major) > 100 THEN
    RAISE EXCEPTION 'Major exceeds maximum limit of 100 characters' USING ERRCODE = '22023';
  END IF;

  IF v_ext_tpl_num = '' THEN
    RAISE EXCEPTION 'External cover template number is required' USING ERRCODE = '23502';
  END IF;

  IF v_front_cover_url IS NULL THEN
    RAISE EXCEPTION 'Front cover image is required' USING ERRCODE = '23502';
  END IF;

  IF v_receipt_url IS NULL THEN
    RAISE EXCEPTION 'Payment deposit receipt image is required' USING ERRCODE = '23502';
  END IF;

  IF v_delivery_selected AND v_delivery_address = '' THEN
    RAISE EXCEPTION 'Delivery address is required when delivery option is selected' USING ERRCODE = '23502';
  END IF;

  -- Validate Photo Pages Quantity (0 to 100)
  IF (p_order_data->>'photographic_pages_quantity') IS NULL THEN
    v_photo_pages_qty := 0;
  ELSE
    v_photo_pages_qty := (p_order_data->>'photographic_pages_quantity')::INT;
    IF v_photo_pages_qty < 0 THEN
      RAISE EXCEPTION 'Photographic pages quantity cannot be negative' USING ERRCODE = '22003';
    ELSIF v_photo_pages_qty > 100 THEN
      RAISE EXCEPTION 'Photographic pages quantity exceeds maximum limit of 100' USING ERRCODE = '22003';
    END IF;
  END IF;

  -- Validate Array Payload Types
  IF jsonb_typeof(v_back_cover_urls) <> 'array' OR jsonb_typeof(v_internal_image_urls) <> 'array' OR jsonb_typeof(v_photo_pages_urls) <> 'array' THEN
    RAISE EXCEPTION 'Image URLs payloads must be JSON arrays' USING ERRCODE = '22023';
  END IF;

  -- 2. AUTHORITATIVE PACKAGE LOOKUP (BY package_id ONLY)
  SELECT COUNT(*)
  INTO v_matching_packages_count
  FROM public.packages
  WHERE id = v_package_id
    AND category = 'graduation'
    AND is_hidden = false;

  IF v_matching_packages_count = 0 THEN
    RAISE EXCEPTION 'Invalid, unlisted, or hidden graduation package selected (ID: %)', v_package_id USING ERRCODE = '22023';
  END IF;

  SELECT title, price
  INTO v_package_title, v_package_price
  FROM public.packages
  WHERE id = v_package_id
    AND category = 'graduation'
    AND is_hidden = false;

  IF v_package_price <= 0 THEN
    RAISE EXCEPTION 'Package price configuration error for package ID: %', v_package_id USING ERRCODE = '22023';
  END IF;

  -- 3. SERVER-SIDE FINANCIAL CALCULATIONS
  v_photo_pages_total := v_photo_pages_qty * 1.00;
  v_delivery_cost := CASE WHEN v_delivery_selected THEN 2.00 ELSE 0.00 END;
  v_subtotal := v_package_price + v_photo_pages_total + v_delivery_cost;
  v_deposit_amount := 5.00;
  v_remaining_amount := GREATEST(0.00, v_subtotal - v_deposit_amount);

  -- 4. CONCURRENCY-SAFE ORDER NUMBER GENERATION
  v_next_seq := nextval('public.graduation_order_seq');
  v_generated_order_num := 'GRAD-' || v_next_seq;

  -- 5. ATOMIC INSERT INTO public.graduation_orders (status = 'pending' ENFORCED)
  INSERT INTO public.graduation_orders (
    order_number, package_name, package_price, arabic_name, english_name,
    phone, university, major, custom_dedication, external_template_number,
    internal_template_number, front_cover_url, back_cover_urls, internal_image_urls,
    photographic_pages_quantity, photographic_pages_urls, photographic_pages_total,
    delivery_selected, delivery_address, delivery_cost, subtotal,
    deposit_amount, remaining_amount, receipt_url, status
  ) VALUES (
    v_generated_order_num, v_package_title, v_package_price, v_arabic_name, v_english_name,
    v_phone, v_university, v_major, v_custom_dedication, v_ext_tpl_num,
    v_int_tpl_num, v_front_cover_url, v_back_cover_urls, v_internal_image_urls,
    v_photo_pages_qty, v_photo_pages_urls, v_photo_pages_total,
    v_delivery_selected, v_delivery_address, v_delivery_cost, v_subtotal,
    v_deposit_amount, v_remaining_amount, v_receipt_url, 'pending'
  )
  RETURNING id INTO v_new_id;

  -- 6. RETURN SAFE RESULT OBJECT FOR FRONTEND
  RETURN jsonb_build_object(
    'success', true,
    'id', v_new_id,
    'order_number', v_generated_order_num,
    'package_name', v_package_title,
    'subtotal', v_subtotal,
    'deposit_amount', v_deposit_amount,
    'remaining_amount', v_remaining_amount,
    'status', 'pending'
  );
END;
$$;

-- EXPLICIT EXECUTE PRIVILEGES
REVOKE EXECUTE ON FUNCTION public.create_public_graduation_order(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_graduation_order(JSONB) TO anon, authenticated;
