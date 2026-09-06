-- ============================================================
-- IRIS Studio — Supabase Security Migration: Phase 5
-- Catalog RLS hardening: public read, admin write
--
-- IMPORTANT:
-- 1. This migration changes RLS policies only. It does not modify data.
-- 2. It intentionally preserves public SELECT for data used by the
--    customer-facing website.
-- 3. Anonymous/public INSERT/UPDATE/DELETE is removed from catalog tables.
-- 4. Admin writes require public.is_admin() = true.
-- 5. DO NOT execute until reviewed/approved.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- Public catalog tables: SELECT for everyone, ALL for admins only
-- ------------------------------------------------------------

DO $$
DECLARE
  v_table text;
  v_public_policy text;
  v_admin_policy text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'flow_items',
    'offers',
    'package_items',
    'packages',
    'portfolio_items',
    'printing_products',
    'site_settings',
    'template_items',
    'booking_extras'
  ]
  LOOP
    v_public_policy := 'Public read ' || v_table;
    v_admin_policy := 'Admin full access on ' || v_table;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Allow all on ' || v_table, v_table);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', v_public_policy, v_table);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', v_admin_policy, v_table);

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true)',
      v_public_policy,
      v_table
    );

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_admin() = true) WITH CHECK (public.is_admin() = true)',
      v_admin_policy,
      v_table
    );
  END LOOP;
END $$;

-- ------------------------------------------------------------
-- book_extras: internal/admin-managed data.
-- No anonymous/public access is granted here.
-- ------------------------------------------------------------

ALTER TABLE public.book_extras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on book_extras" ON public.book_extras;
DROP POLICY IF EXISTS "Public read book_extras" ON public.book_extras;
DROP POLICY IF EXISTS "Admin full access on book_extras" ON public.book_extras;

CREATE POLICY "Admin full access on book_extras"
ON public.book_extras
FOR ALL
TO authenticated
USING (public.is_admin() = true)
WITH CHECK (public.is_admin() = true);

COMMIT;

-- ============================================================
-- Expected security model after execution:
--
-- anon:
--   SELECT catalog data only.
--   No INSERT / UPDATE / DELETE on these tables.
--
-- authenticated non-admin:
--   SELECT catalog data only.
--   No INSERT / UPDATE / DELETE on these tables.
--
-- authenticated admin:
--   Full CRUD on these tables.
-- ============================================================
