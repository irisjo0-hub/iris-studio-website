-- ============================================================
-- IRIS Studio — Supabase Security Migration: Phase 7
-- Public feedback workflow + booking business-rule configuration
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Public booking configuration
-- ------------------------------------------------------------
INSERT INTO public.site_settings (key, value)
VALUES
  ('booking_delivery_config', '{"enabled": true, "cost": 2.00}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------
-- 2. Enforce future-safe status/payment values without breaking
--    any legacy rows that may already contain older values.
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bookings_status_allowed_check'
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_status_allowed_check
      CHECK (status IN ('pending', 'approved', 'completed', 'cancelled')) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'printing_orders_status_allowed_check'
      AND conrelid = 'public.printing_orders'::regclass
  ) THEN
    ALTER TABLE public.printing_orders
      ADD CONSTRAINT printing_orders_status_allowed_check
      CHECK (status IN ('pending', 'processing', 'ready', 'completed', 'cancelled')) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'printing_orders_payment_method_check'
      AND conrelid = 'public.printing_orders'::regclass
  ) THEN
    ALTER TABLE public.printing_orders
      ADD CONSTRAINT printing_orders_payment_method_check
      CHECK (payment_method IN ('cliq', 'cod')) NOT VALID;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 3. Real visitor feedback table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.flow_feedback (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  flow_item_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'زائر',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  CONSTRAINT flow_feedback_status_check
    CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT flow_feedback_name_length_check
    CHECK (char_length(name) BETWEEN 1 AND 80),
  CONSTRAINT flow_feedback_message_length_check
    CHECK (char_length(message) BETWEEN 3 AND 1000)
);

CREATE INDEX IF NOT EXISTS idx_flow_feedback_status_created
  ON public.flow_feedback (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flow_feedback_flow_item
  ON public.flow_feedback (flow_item_id, status, created_at DESC);

ALTER TABLE public.flow_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert flow feedback" ON public.flow_feedback;
DROP POLICY IF EXISTS "Public read approved flow feedback" ON public.flow_feedback;
DROP POLICY IF EXISTS "Admin read flow feedback" ON public.flow_feedback;
DROP POLICY IF EXISTS "Admin update flow feedback" ON public.flow_feedback;
DROP POLICY IF EXISTS "Admin delete flow feedback" ON public.flow_feedback;

CREATE POLICY "Public insert flow feedback"
  ON public.flow_feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND char_length(name) BETWEEN 1 AND 80
    AND char_length(message) BETWEEN 3 AND 1000
  );

CREATE POLICY "Public read approved flow feedback"
  ON public.flow_feedback
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Admin read flow feedback"
  ON public.flow_feedback
  FOR SELECT
  TO authenticated
  USING (public.is_admin() = true);

CREATE POLICY "Admin update flow feedback"
  ON public.flow_feedback
  FOR UPDATE
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

CREATE POLICY "Admin delete flow feedback"
  ON public.flow_feedback
  FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);

-- ------------------------------------------------------------
-- 4. Public RPC returns only approved, non-sensitive fields.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_flow_feedback()
RETURNS TABLE (
  id BIGINT,
  flow_item_id TEXT,
  name TEXT,
  message TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    f.id,
    f.flow_item_id,
    f.name,
    f.message,
    f.created_at
  FROM public.flow_feedback f
  WHERE f.status = 'approved'
  ORDER BY f.created_at DESC
  LIMIT 100;
$$;

REVOKE ALL ON FUNCTION public.get_public_flow_feedback() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_flow_feedback() TO anon, authenticated;

-- Keep direct anonymous writes limited to insert through RLS.
REVOKE SELECT ON public.flow_feedback FROM anon;
GRANT SELECT ON public.flow_feedback TO anon;

COMMIT;
