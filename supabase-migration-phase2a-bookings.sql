-- ============================================================
-- IRIS Studio — Supabase Security Migration: Phase 2A (FINAL APPROVED DRAFT)
-- Public Bookings Security, Availability RPC, Secure Creation RPC & Exclusion Constraint
-- File: supabase-migration-phase2a-bookings.sql
-- DO NOT EXECUTE ON SUPABASE UNTIL EXPLICITLY APPROVED
-- ============================================================

-- ────────────────────────────────────────────
-- 0A. SCHEMA ENHANCEMENT: ADD DURATION COLUMN TO PACKAGES TABLE
-- ────────────────────────────────────────────
-- Ensures the duration column exists (without updating any pre-existing rows)
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS duration INT;


-- ────────────────────────────────────────────
-- 0B. SAFE SEEDING: OFFICIAL SHOOT PACKAGES (IDEMPOTENT & NON-DUPLICATING)
-- ────────────────────────────────────────────
-- Inserts the 5 official shoot packages ONLY if they do not already exist in DB
INSERT INTO public.packages (title, price, duration, features, category, sort_order, is_hidden)
SELECT 'بكج 20', 20.00, 25, '["25 دقيقة"]'::jsonb, 'shoot', 1, false
WHERE NOT EXISTS (SELECT 1 FROM public.packages WHERE title = 'بكج 20' AND category = 'shoot');

INSERT INTO public.packages (title, price, duration, features, category, sort_order, is_hidden)
SELECT 'بكج 30', 30.00, 50, '["50 دقيقة"]'::jsonb, 'shoot', 2, false
WHERE NOT EXISTS (SELECT 1 FROM public.packages WHERE title = 'بكج 30' AND category = 'shoot');

INSERT INTO public.packages (title, price, duration, features, category, sort_order, is_hidden)
SELECT 'بكج 35', 35.00, 50, '["50 دقيقة"]'::jsonb, 'shoot', 3, false
WHERE NOT EXISTS (SELECT 1 FROM public.packages WHERE title = 'بكج 35' AND category = 'shoot');

INSERT INTO public.packages (title, price, duration, features, category, sort_order, is_hidden)
SELECT 'بكج 40', 40.00, 50, '["50 دقيقة"]'::jsonb, 'shoot', 4, false
WHERE NOT EXISTS (SELECT 1 FROM public.packages WHERE title = 'بكج 40' AND category = 'shoot');

INSERT INTO public.packages (title, price, duration, features, category, sort_order, is_hidden)
SELECT 'الفل بكج 65', 65.00, 50, '["50 دقيقة"]'::jsonb, 'shoot', 5, false
WHERE NOT EXISTS (SELECT 1 FROM public.packages WHERE title = 'الفل بكج 65' AND category = 'shoot');


-- ────────────────────────────────────────────
-- 0C. CONFIGURATION SEED: COMPANION PRICING IN SITE SETTINGS
-- ────────────────────────────────────────────
-- Store authoritative extra companion pricing in site_settings table (only if key does not exist)
INSERT INTO public.site_settings (key, value) VALUES
  ('booking_companion_config', '{"free_companions": 5, "extra_companion_price": 2.00}'::jsonb)
ON CONFLICT (key) DO NOTHING;


-- ────────────────────────────────────────────
-- 1. EXTENSIONS & HELPER FUNCTIONS FOR DOUBLE-BOOKING PREVENTION
-- ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Calculates immutable tsrange for a date, time, and duration
-- Handles times past midnight (00:00 to 08:59) by shifting to next calendar day
-- Handles durations crossing midnight automatically
CREATE OR REPLACE FUNCTION public.booking_time_range(
  p_date TEXT,
  p_time TEXT,
  p_duration INT
)
RETURNS TSRANGE
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
  SELECT tsrange(
    CASE 
      WHEN (p_time || ':00')::TIME < TIME '09:00:00' 
      THEN (p_date::DATE + INTERVAL '1 day' + (p_time || ':00')::TIME)
      ELSE (p_date::DATE + (p_time || ':00')::TIME)
    END,
    CASE 
      WHEN (p_time || ':00')::TIME < TIME '09:00:00' 
      THEN (p_date::DATE + INTERVAL '1 day' + (p_time || ':00')::TIME + (COALESCE(p_duration, 50) || ' minutes')::INTERVAL)
      ELSE (p_date::DATE + (p_time || ':00')::TIME + (COALESCE(p_duration, 50) || ' minutes')::INTERVAL)
    END,
    '[)'
  );
$$;

-- ────────────────────────────────────────────
-- 1B. PREFLIGHT CHECK FOR EXISTING OVERLAPPING BOOKINGS
-- ABORTS MIGRATION IMMEDIATELY IF CONFLICTS ARE FOUND
-- ────────────────────────────────────────────
DO $$
DECLARE
  v_conflict_count INT;
BEGIN
  SELECT COUNT(*) INTO v_conflict_count
  FROM public.bookings b1
  JOIN public.bookings b2 ON b1.id < b2.id
  WHERE b1.status IN ('pending', 'approved', 'completed')
    AND b2.status IN ('pending', 'approved', 'completed')
    AND public.booking_time_range(b1.date, b1.time, b1.duration) && public.booking_time_range(b2.date, b2.time, b2.duration);

  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'PREFLIGHT ABORT: Found % overlapping active bookings in existing database records! Resolve conflicts before applying bookings_no_overlap_excl constraint.', v_conflict_count USING ERRCODE = '23505';
  ELSE
    RAISE NOTICE 'PREFLIGHT PASSED: Zero overlapping active bookings found in existing database records.';
  END IF;
END $$;

-- Apply PostgreSQL Exclusion Constraint on public.bookings
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_no_overlap_excl;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_no_overlap_excl
  EXCLUDE USING gist (
    public.booking_time_range(date, time, duration) WITH &&
  )
  WHERE (status IN ('pending', 'approved', 'completed'));


-- ────────────────────────────────────────────
-- 2. PUBLIC AVAILABILITY RPC
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_public_booking_availability(
  p_start_date TEXT DEFAULT NULL,
  p_end_date TEXT DEFAULT NULL
)
RETURNS TABLE (
  date TEXT,
  time TEXT,
  duration INT,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_start DATE;
  v_end DATE;
BEGIN
  -- Validate date bounds or set defaults (today through 60 days ahead)
  v_start := COALESCE(NULLIF(p_start_date, '')::DATE, CURRENT_DATE);
  v_end := COALESCE(NULLIF(p_end_date, '')::DATE, v_start + INTERVAL '60 days');

  -- Enforce maximum search window of 90 days to prevent CPU/memory abuse
  IF (v_end - v_start) > 90 THEN
    v_end := v_start + INTERVAL '90 days';
  END IF;

  RETURN QUERY
  SELECT 
    b.date,
    b.time,
    b.duration,
    b.status
  FROM public.bookings b
  WHERE (b.date::DATE BETWEEN v_start AND v_end)
    AND b.status IN ('pending', 'approved', 'completed')
  ORDER BY b.date ASC, b.time ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_booking_availability(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_booking_availability(TEXT, TEXT) TO anon, authenticated;


-- ────────────────────────────────────────────
-- 3. SECURE BOOKING CREATION RPC
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_public_booking(
  p_booking_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_name TEXT;
  v_phone TEXT;
  v_package_name TEXT;
  v_date TEXT;
  v_time TEXT;
  v_companions INT;
  v_extras JSONB;
  v_receipt_url TEXT;
  v_notes TEXT;
  
  v_package_price NUMERIC(10,2) := 0;
  v_duration INT := 0;
  v_matching_packages_count INT := 0;
  
  v_free_companions INT := 0;
  v_extra_companion_price NUMERIC(10,2) := 0;
  v_extra_companions INT := 0;
  v_extra_companions_cost NUMERIC(10,2) := 0;
  
  v_extras_total NUMERIC(10,2) := 0;
  v_subtotal NUMERIC(10,2) := 0;
  v_deposit_amount NUMERIC(10,2) := 10.00;
  v_remaining_amount NUMERIC(10,2) := 0;
  
  v_extra_item JSONB;
  v_extra_name TEXT;
  v_extra_qty INT;
  v_matching_extras_count INT := 0;
  v_db_extra_price NUMERIC(10,2);
  v_sanitized_extras JSONB := '[]'::jsonb;
  
  v_companion_config JSONB;
  v_new_id BIGINT;
  v_slot_conflict INT;
  v_lock_key BIGINT;
BEGIN
  -- 1. STRICT INPUT VALIDATION
  IF jsonb_typeof(p_booking_data) <> 'object' THEN
    RAISE EXCEPTION 'Invalid JSON payload structure' USING ERRCODE = '22023';
  END IF;

  v_name := TRIM(COALESCE(p_booking_data->>'name', ''));
  v_phone := TRIM(COALESCE(p_booking_data->>'phone', ''));
  v_package_name := TRIM(COALESCE(p_booking_data->>'package_name', ''));
  v_date := TRIM(COALESCE(p_booking_data->>'date', ''));
  v_time := TRIM(COALESCE(p_booking_data->>'time', ''));
  v_extras := COALESCE(p_booking_data->'extras', '[]'::jsonb);
  v_receipt_url := NULLIF(TRIM(COALESCE(p_booking_data->>'receipt_url', '')), '');
  v_notes := TRIM(COALESCE(p_booking_data->>'notes', ''));

  -- Validate String Lengths
  IF v_name = '' THEN
    RAISE EXCEPTION 'Customer name is required' USING ERRCODE = '23502';
  ELSIF LENGTH(v_name) > 100 THEN
    RAISE EXCEPTION 'Customer name exceeds maximum allowed limit of 100 characters' USING ERRCODE = '22023';
  END IF;

  IF v_phone = '' THEN
    RAISE EXCEPTION 'Phone number is required' USING ERRCODE = '23502';
  ELSIF LENGTH(v_phone) > 30 THEN
    RAISE EXCEPTION 'Phone number exceeds maximum allowed limit of 30 characters' USING ERRCODE = '22023';
  END IF;

  IF LENGTH(v_notes) > 1000 THEN
    RAISE EXCEPTION 'Notes exceed maximum allowed limit of 1000 characters' USING ERRCODE = '22023';
  END IF;

  IF v_package_name = '' THEN
    RAISE EXCEPTION 'Package selection is required' USING ERRCODE = '23502';
  END IF;

  IF v_date = '' OR v_date::DATE < CURRENT_DATE THEN
    RAISE EXCEPTION 'Valid booking date is required' USING ERRCODE = '22007';
  END IF;

  -- Validate Time Format (HH:MM 24h)
  IF NOT (v_time ~ '^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$') THEN
    RAISE EXCEPTION 'Invalid time format (must be HH:MM in 24h format): %', v_time USING ERRCODE = '22007';
  END IF;

  -- Validate Companions (Reject negative values)
  IF (p_booking_data->>'companions') IS NULL THEN
    v_companions := 0;
  ELSE
    v_companions := (p_booking_data->>'companions')::INT;
    IF v_companions < 0 THEN
      RAISE EXCEPTION 'Companions count cannot be negative: %', v_companions USING ERRCODE = '22003';
    ELSIF v_companions > 50 THEN
      RAISE EXCEPTION 'Companions count exceeds maximum limit of 50: %', v_companions USING ERRCODE = '22003';
    END IF;
  END IF;

  -- Validate Extras Payload Type
  IF jsonb_typeof(v_extras) <> 'array' THEN
    RAISE EXCEPTION 'Extras payload must be a JSON array' USING ERRCODE = '22023';
  END IF;

  -- Transactional Advisory Lock on date + time to serialize concurrent booking attempts
  v_lock_key := hashtext(v_date || '_' || v_time);
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- 2. AUTHORITATIVE PACKAGE LOOKUP & DURATION DETERMINATION (NO LIMIT 1, NO HARDCODING)
  SELECT COUNT(*)
  INTO v_matching_packages_count
  FROM public.packages
  WHERE title = v_package_name
    AND category = 'shoot'
    AND is_hidden = false;

  IF v_matching_packages_count = 0 THEN
    RAISE EXCEPTION 'Invalid or unlisted package selected: %', v_package_name USING ERRCODE = '22023';
  ELSIF v_matching_packages_count > 1 THEN
    RAISE EXCEPTION 'Ambiguous package configuration: multiple active packages match title "%"', v_package_name USING ERRCODE = '23505';
  END IF;

  SELECT price, duration
  INTO v_package_price, v_duration
  FROM public.packages
  WHERE title = v_package_name
    AND category = 'shoot'
    AND is_hidden = false;

  IF v_package_price <= 0 THEN
    RAISE EXCEPTION 'Package price configuration error for: %', v_package_name USING ERRCODE = '22023';
  END IF;
  IF v_duration IS NULL OR v_duration <= 0 THEN
    RAISE EXCEPTION 'Package duration configuration error for: %', v_package_name USING ERRCODE = '22023';
  END IF;

  -- 3. AUTHORITATIVE EXTRA COMPANIONS PRICING LOOKUP FROM SITE_SETTINGS (NO HARDCODED FALLBACK)
  SELECT value INTO v_companion_config
  FROM public.site_settings
  WHERE key = 'booking_companion_config';

  IF v_companion_config IS NULL OR (v_companion_config->>'free_companions') IS NULL OR (v_companion_config->>'extra_companion_price') IS NULL THEN
    RAISE EXCEPTION 'Companion pricing configuration error: booking_companion_config missing or invalid in site_settings' USING ERRCODE = '22023';
  END IF;

  v_free_companions := (v_companion_config->>'free_companions')::INT;
  v_extra_companion_price := (v_companion_config->>'extra_companion_price')::NUMERIC;

  IF v_free_companions < 0 OR v_extra_companion_price < 0 THEN
    RAISE EXCEPTION 'Companion pricing configuration error: invalid negative values in site_settings' USING ERRCODE = '22023';
  END IF;

  IF v_companions > v_free_companions THEN
    v_extra_companions := v_companions - v_free_companions;
    v_extra_companions_cost := v_extra_companions * v_extra_companion_price;
  ELSE
    v_extra_companions := 0;
    v_extra_companions_cost := 0.00;
  END IF;

  -- 4. AUTHORITATIVE EXTRAS PRICING LOOKUP FROM BOOKING_EXTRAS TABLE (NO LIMIT 1, NO CLIENT PRICE FALLBACK)
  IF jsonb_array_length(v_extras) > 0 THEN
    FOR v_extra_item IN SELECT * FROM jsonb_array_elements(v_extras)
    LOOP
      v_extra_name := TRIM(COALESCE(v_extra_item->>'name', ''));
      
      IF (v_extra_item->>'qty') IS NULL THEN
        v_extra_qty := 0;
      ELSE
        v_extra_qty := (v_extra_item->>'qty')::INT;
      END IF;

      IF v_extra_name <> '' THEN
        IF v_extra_qty <= 0 THEN
          RAISE EXCEPTION 'Invalid quantity % requested for extra "%"', v_extra_qty, v_extra_name USING ERRCODE = '22003';
        ELSIF v_extra_qty > 20 THEN
          RAISE EXCEPTION 'Excessive quantity % requested for extra "%"', v_extra_qty, v_extra_name USING ERRCODE = '22003';
        END IF;

        -- Count matching booking_extras without LIMIT 1
        SELECT COUNT(*) INTO v_matching_extras_count
        FROM public.booking_extras
        WHERE name = v_extra_name;

        IF v_matching_extras_count = 0 THEN
          RAISE EXCEPTION 'Invalid or unlisted booking extra: "%"', v_extra_name USING ERRCODE = '22023';
        ELSIF v_matching_extras_count > 1 THEN
          RAISE EXCEPTION 'Ambiguous extra configuration: multiple extras match name "%"', v_extra_name USING ERRCODE = '23505';
        END IF;

        -- Fetch authoritative price from single matching record
        SELECT price INTO v_db_extra_price
        FROM public.booking_extras
        WHERE name = v_extra_name;

        v_extras_total := v_extras_total + (v_db_extra_price * v_extra_qty);
        v_sanitized_extras := v_sanitized_extras || jsonb_build_object(
          'name', v_extra_name,
          'price', v_db_extra_price,
          'qty', v_extra_qty
        );
      END IF;
    END LOOP;
  END IF;

  -- 5. SERVER-SIDE TOTALS CALCULATION
  v_deposit_amount := 10.00; -- Fixed deposit amount
  v_subtotal := v_package_price + v_extra_companions_cost + v_extras_total;
  v_remaining_amount := GREATEST(0.00, v_subtotal - v_deposit_amount);

  -- 6. ATOMIC OVERLAP CHECK
  SELECT COUNT(*) INTO v_slot_conflict
  FROM public.bookings b
  WHERE b.status IN ('pending', 'approved', 'completed')
    AND public.booking_time_range(b.date, b.time, b.duration) && public.booking_time_range(v_date, v_time, v_duration);

  IF v_slot_conflict > 0 THEN
    RAISE EXCEPTION 'BOOKING_SLOT_UNAVAILABLE' USING ERRCODE = '23505';
  END IF;

  -- 7. INSERT RECORD (Status = 'pending' enforced)
  INSERT INTO public.bookings (
    name, phone, package_name, package_price, date, time, duration,
    companions, extra_companions, extra_companions_cost, extras,
    extras_total, subtotal, deposit_amount, remaining_amount,
    receipt_url, notes, status
  ) VALUES (
    v_name, v_phone, v_package_name, v_package_price, v_date, v_time, v_duration,
    v_companions, v_extra_companions, v_extra_companions_cost, v_sanitized_extras,
    v_extras_total, v_subtotal, v_deposit_amount, v_remaining_amount,
    v_receipt_url, v_notes, 'pending'
  )
  RETURNING id INTO v_new_id;

  -- Return ONLY safe confirmation object to client (no private customer fields returned)
  RETURN jsonb_build_object(
    'success', true,
    'id', v_new_id,
    'date', v_date,
    'time', v_time,
    'duration', v_duration,
    'status', 'pending'
  );
EXCEPTION
  WHEN exclusion_violation THEN
    RAISE EXCEPTION 'BOOKING_SLOT_UNAVAILABLE' USING ERRCODE = '23505';
END;
$$;

REVOKE ALL ON FUNCTION public.create_public_booking(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_booking(JSONB) TO anon, authenticated;


-- ────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS) HARDENING
-- ────────────────────────────────────────────
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Clean up permissive policies
DROP POLICY IF EXISTS "Allow all on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public select bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin delete bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin full access on bookings" ON public.bookings;

-- Deny direct table SELECT, INSERT, UPDATE, DELETE to public/anon (all public traffic goes through RPCs)
-- Grant full direct table access ONLY to verified administrators
CREATE POLICY "Admin full access on bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);
