-- ============================================================
-- IRIS Studio — Supabase Security Migration: Phase 6
-- Secure printing orders backend
--
-- IMPORTANT: REVIEW BEFORE EXECUTION IN SUPABASE SQL EDITOR.
-- This migration creates the missing printing_orders table,
-- protects it with RLS, adds a concurrency-safe order sequence,
-- and provides public RPCs for order creation/status lookup.
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.printing_orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  order_number TEXT NOT NULL,
  product_id BIGINT REFERENCES public.printing_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  cart_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  quantity INT NOT NULL DEFAULT 1,
  selected_color TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  item_statuses JSONB NOT NULL DEFAULT '{}'::jsonb,
  delivery_selected BOOLEAN NOT NULL DEFAULT false,
  delivery_address TEXT NOT NULL DEFAULT '',
  delivery_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cliq',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0
);

ALTER TABLE public.printing_orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'printing_orders_order_number_key'
      AND conrelid = 'public.printing_orders'::regclass
  ) THEN
    ALTER TABLE public.printing_orders
      ADD CONSTRAINT printing_orders_order_number_key UNIQUE (order_number);
  END IF;
END $$;

CREATE SEQUENCE IF NOT EXISTS public.printing_order_seq;

DO $$
DECLARE
  v_max_existing BIGINT := 1000;
  v_seq_current BIGINT := 1000;
BEGIN
  SELECT COALESCE(MAX((substring(order_number from '^ORD-([0-9]+)$'))::BIGINT), 1000)
    INTO v_max_existing
  FROM public.printing_orders
  WHERE order_number ~ '^ORD-[0-9]+$';

  SELECT COALESCE(last_value, 1000)
    INTO v_seq_current
  FROM pg_sequences
  WHERE schemaname = 'public' AND sequencename = 'printing_order_seq';

  IF v_seq_current > v_max_existing THEN
    v_max_existing := v_seq_current;
  END IF;

  PERFORM setval('public.printing_order_seq', v_max_existing, true);
END $$;

DROP POLICY IF EXISTS "Allow all on printing_orders" ON public.printing_orders;
DROP POLICY IF EXISTS "Public insert printing_orders" ON public.printing_orders;
DROP POLICY IF EXISTS "Public read printing_orders" ON public.printing_orders;
DROP POLICY IF EXISTS "Admin full access on printing_orders" ON public.printing_orders;

CREATE POLICY "Admin full access on printing_orders"
ON public.printing_orders
FOR ALL
TO authenticated
USING (public.is_admin() = true)
WITH CHECK (public.is_admin() = true);

CREATE OR REPLACE FUNCTION public.create_public_printing_order(p_order_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order_number TEXT;
  v_product_id BIGINT;
  v_product_name TEXT;
  v_customer_name TEXT;
  v_phone TEXT;
  v_notes TEXT;
  v_image_urls JSONB := COALESCE(p_order_data->'image_urls', '[]'::jsonb);
  v_cart_items JSONB := COALESCE(p_order_data->'cart_items', '[]'::jsonb);
  v_quantity INT := COALESCE((p_order_data->>'quantity')::INT, 1);
  v_selected_color TEXT := TRIM(COALESCE(p_order_data->>'selected_color', ''));
  v_delivery_selected BOOLEAN := COALESCE((p_order_data->>'delivery_selected')::BOOLEAN, false);
  v_delivery_address TEXT := TRIM(COALESCE(p_order_data->>'delivery_address', ''));
  v_delivery_cost NUMERIC(10,2) := CASE WHEN v_delivery_selected THEN 2.00 ELSE 0.00 END;
  v_payment_method TEXT := LOWER(TRIM(COALESCE(p_order_data->>'payment_method', 'cliq')));
  v_subtotal NUMERIC(10,2) := 0;
  v_total NUMERIC(10,2) := 0;
  v_item JSONB;
  v_item_product_id BIGINT;
  v_item_qty INT;
  v_item_price NUMERIC(10,2);
  v_item_name TEXT;
  v_new_id BIGINT;
  v_seq BIGINT;
BEGIN
  IF jsonb_typeof(p_order_data) <> 'object' THEN
    RAISE EXCEPTION 'Invalid JSON payload structure' USING ERRCODE = '22023';
  END IF;

  v_customer_name := TRIM(COALESCE(p_order_data->>'customer_name', ''));
  v_phone := TRIM(COALESCE(p_order_data->>'phone', ''));
  v_notes := TRIM(COALESCE(p_order_data->>'notes', ''));

  IF v_customer_name = '' OR LENGTH(v_customer_name) > 100 THEN
    RAISE EXCEPTION 'Invalid customer name' USING ERRCODE = '22023';
  END IF;
  IF v_phone = '' OR LENGTH(v_phone) > 30 THEN
    RAISE EXCEPTION 'Invalid phone number' USING ERRCODE = '22023';
  END IF;
  IF LENGTH(v_notes) > 2000 THEN
    RAISE EXCEPTION 'Notes exceed maximum length' USING ERRCODE = '22023';
  END IF;
  IF v_quantity < 1 OR v_quantity > 100 THEN
    RAISE EXCEPTION 'Invalid quantity' USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(v_image_urls) <> 'array' OR jsonb_typeof(v_cart_items) <> 'array' THEN
    RAISE EXCEPTION 'Image/cart payload must be arrays' USING ERRCODE = '22023';
  END IF;
  IF v_delivery_selected AND v_delivery_address = '' THEN
    RAISE EXCEPTION 'Delivery address is required' USING ERRCODE = '23502';
  END IF;
  IF v_payment_method NOT IN ('cliq', 'cod') THEN
    RAISE EXCEPTION 'Invalid payment method' USING ERRCODE = '22023';
  END IF;

  IF jsonb_array_length(v_cart_items) = 0 THEN
    IF (p_order_data->>'product_id') IS NULL THEN
      RAISE EXCEPTION 'Product selection is required' USING ERRCODE = '23502';
    END IF;
    v_product_id := (p_order_data->>'product_id')::BIGINT;

    SELECT name, price INTO v_product_name, v_item_price
    FROM public.printing_products
    WHERE id = v_product_id AND is_hidden = false;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Selected product is not available' USING ERRCODE = '22023';
    END IF;

    v_subtotal := v_item_price * v_quantity;
    v_cart_items := jsonb_build_array(jsonb_build_object(
      'id', 'item-single',
      'product_id', v_product_id,
      'name', v_product_name,
      'selectedColor', v_selected_color,
      'quantity', v_quantity,
      'price', v_item_price
    ));
  ELSE
    FOR v_item IN SELECT * FROM jsonb_array_elements(v_cart_items)
    LOOP
      IF (v_item->>'product_id') IS NULL THEN
        RAISE EXCEPTION 'Each cart item must include product_id' USING ERRCODE = '23502';
      END IF;
      v_item_product_id := (v_item->>'product_id')::BIGINT;
      v_item_qty := COALESCE((v_item->>'quantity')::INT, 0);
      IF v_item_qty < 1 OR v_item_qty > 100 THEN
        RAISE EXCEPTION 'Invalid cart item quantity' USING ERRCODE = '22023';
      END IF;

      SELECT name, price INTO v_item_name, v_item_price
      FROM public.printing_products
      WHERE id = v_item_product_id AND is_hidden = false;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'A selected cart product is not available' USING ERRCODE = '22023';
      END IF;

      v_item := jsonb_set(v_item, '{name}', to_jsonb(v_item_name), true);
      v_item := jsonb_set(v_item, '{price}', to_jsonb(v_item_price), true);
      v_cart_items := jsonb_set(v_cart_items, ('{' || (v_item->>'_index') || '}')::TEXT[], v_item, true);
      v_subtotal := v_subtotal + (v_item_price * v_item_qty);
    END LOOP;
  END IF;

  v_total := v_subtotal + v_delivery_cost;
  v_seq := nextval('public.printing_order_seq');
  v_order_number := 'ORD-' || v_seq;

  v_product_name := COALESCE(v_product_name, TRIM(COALESCE(p_order_data->>'product_name', 'خدمة طباعة')));

  INSERT INTO public.printing_orders (
    order_number, product_id, product_name, customer_name, phone, notes,
    image_urls, cart_items, quantity, selected_color, status, item_statuses,
    delivery_selected, delivery_address, delivery_cost, payment_method,
    subtotal, total_amount
  ) VALUES (
    v_order_number, v_product_id, v_product_name, v_customer_name, v_phone, v_notes,
    v_image_urls, v_cart_items, v_quantity, v_selected_color, 'pending', '{}'::jsonb,
    v_delivery_selected, v_delivery_address, v_delivery_cost, v_payment_method,
    v_subtotal, v_total
  )
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_new_id,
    'order_number', v_order_number,
    'product_name', v_product_name,
    'subtotal', v_subtotal,
    'delivery_cost', v_delivery_cost,
    'total_amount', v_total,
    'status', 'pending'
  );
END;
$$;

-- NOTE: cart JSON rewriting above intentionally expects each array item to carry _index.
-- The frontend migration below sends _index for cart items.  Single-product orders do not need it.

CREATE OR REPLACE FUNCTION public.get_public_printing_order_status(p_order_number TEXT, p_phone TEXT)
RETURNS TABLE(order_number TEXT, status TEXT, customer_name TEXT, created_at TIMESTAMPTZ)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT po.order_number, po.status, po.customer_name, po.created_at
  FROM public.printing_orders po
  WHERE po.order_number = UPPER(TRIM(p_order_number))
    AND po.phone = TRIM(p_phone)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.create_public_printing_order(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_printing_order(JSONB) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.get_public_printing_order_status(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_printing_order_status(TEXT, TEXT) TO anon, authenticated;

COMMIT;
