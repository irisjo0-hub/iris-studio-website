-- IRIS Studio security, integrity and cleanup hardening

DROP POLICY IF EXISTS "Public read packages" ON public.packages;
CREATE POLICY "Public read packages"
  ON public.packages FOR SELECT TO anon, authenticated
  USING (is_hidden = false);

DROP POLICY IF EXISTS "Public read offers" ON public.offers;
CREATE POLICY "Public read offers"
  ON public.offers FOR SELECT TO anon, authenticated
  USING (is_hidden = false);

DROP POLICY IF EXISTS "Public read printing_products" ON public.printing_products;
CREATE POLICY "Public read printing_products"
  ON public.printing_products FOR SELECT TO anon, authenticated
  USING (is_hidden = false);

DROP POLICY IF EXISTS "Public read approved flow feedback" ON public.flow_feedback;

DROP POLICY IF EXISTS "Public upload graduation-orders" ON storage.objects;
DROP POLICY IF EXISTS "Public upload payment-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public upload printing-orders bucket" ON storage.objects;

UPDATE storage.buckets
SET file_size_limit = 8388608,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp']::text[]
WHERE id IN ('graduation-orders', 'payment-receipts');

DO $$
DECLARE
  v_def text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO v_def
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.prokind = 'f'
    AND p.proname = 'create_public_graduation_order'
    AND pg_get_function_identity_arguments(p.oid) = 'p_order_data jsonb';
  IF v_def IS NULL THEN RAISE EXCEPTION 'create_public_graduation_order(jsonb) not found'; END IF;
  v_def := replace(
    v_def,
    '  v_delivery_cost := CASE WHEN v_delivery_selected THEN 2.00 ELSE 0.00 END;',
    $replacement$  IF v_delivery_selected THEN
    SELECT greatest(0, coalesce((value->>'cost')::numeric, 0)) INTO v_delivery_cost
    FROM public.site_settings
    WHERE key = 'booking_delivery_config'
      AND coalesce((value->>'enabled')::boolean, false);
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Delivery is currently unavailable.' USING ERRCODE = '22023';
    END IF;
  ELSE
    v_delivery_cost := 0.00;
  END IF;$replacement$
  );
  EXECUTE v_def;
END $$;

DO $$
DECLARE
  v_def text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO v_def
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.prokind = 'f'
    AND p.proname = 'create_public_printing_order'
    AND pg_get_function_identity_arguments(p.oid) = 'p_order_data jsonb';
  IF v_def IS NULL THEN RAISE EXCEPTION 'create_public_printing_order(jsonb) not found'; END IF;
  v_def := replace(
    v_def,
    '  v_delivery_cost NUMERIC(10,2) := CASE WHEN v_delivery_selected THEN 2.00 ELSE 0.00 END;',
    '  v_delivery_cost NUMERIC(10,2) := 0.00;'
  );
  v_def := replace(
    v_def,
    $needle$  IF v_payment_method NOT IN ('cliq', 'cod') THEN
    RAISE EXCEPTION 'Invalid payment method' USING ERRCODE = '22023';
  END IF;$needle$,
    $replacement$  IF v_payment_method NOT IN ('cliq', 'cod') THEN
    RAISE EXCEPTION 'Invalid payment method' USING ERRCODE = '22023';
  END IF;

  IF v_delivery_selected THEN
    SELECT greatest(0, coalesce((value->>'cost')::numeric, 0)) INTO v_delivery_cost
    FROM public.site_settings
    WHERE key = 'booking_delivery_config'
      AND coalesce((value->>'enabled')::boolean, false);
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Delivery is currently unavailable.' USING ERRCODE = '22023';
    END IF;
  END IF;$replacement$
  );
  EXECUTE v_def;
END $$;

ALTER TABLE public.printing_orders
  DROP CONSTRAINT IF EXISTS printing_orders_status_allowed_check;
ALTER TABLE public.printing_orders
  ADD CONSTRAINT printing_orders_status_allowed_check
  CHECK (status = ANY (ARRAY[
    'pending','approved','processing','ready','out_for_delivery','completed','cancelled','rejected'
  ]::text[]));
ALTER TABLE public.printing_orders
  VALIDATE CONSTRAINT printing_orders_status_allowed_check;

ALTER TABLE public.bookings VALIDATE CONSTRAINT bookings_extras_payload_size_check;
ALTER TABLE public.bookings VALIDATE CONSTRAINT bookings_name_length_check;
ALTER TABLE public.bookings VALIDATE CONSTRAINT bookings_nonnegative_amounts_check;
ALTER TABLE public.bookings VALIDATE CONSTRAINT bookings_notes_length_check;
ALTER TABLE public.bookings VALIDATE CONSTRAINT bookings_phone_length_check;
ALTER TABLE public.bookings VALIDATE CONSTRAINT bookings_status_allowed_check;

ALTER TABLE public.printing_orders VALIDATE CONSTRAINT printing_orders_cart_items_size_check;
ALTER TABLE public.printing_orders VALIDATE CONSTRAINT printing_orders_customer_name_length_check;
ALTER TABLE public.printing_orders VALIDATE CONSTRAINT printing_orders_delivery_address_length_check;
ALTER TABLE public.printing_orders VALIDATE CONSTRAINT printing_orders_image_urls_size_check;
ALTER TABLE public.printing_orders VALIDATE CONSTRAINT printing_orders_json_array_count_check;
ALTER TABLE public.printing_orders VALIDATE CONSTRAINT printing_orders_notes_length_check;
ALTER TABLE public.printing_orders VALIDATE CONSTRAINT printing_orders_payment_method_check;
ALTER TABLE public.printing_orders VALIDATE CONSTRAINT printing_orders_phone_length_check;
ALTER TABLE public.printing_orders VALIDATE CONSTRAINT printing_orders_selected_color_length_check;

DELETE FROM public.site_settings WHERE key = 'test_key';
