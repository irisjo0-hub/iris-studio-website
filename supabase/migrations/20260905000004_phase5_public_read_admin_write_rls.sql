-- ============================================================
-- IRIS Studio — Supabase Security Migration: Phase 5
-- Catalog RLS hardening: public read, admin write
--
-- IMPORTANT:
-- This is the migration-history copy of the reviewed Phase 5 RLS hardening.
-- It does not grant anonymous write access to catalog tables.
-- ============================================================

BEGIN;

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

ALTER TABLE public.book_extras ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on book_extras" ON public.book_extras;
DROP POLICY IF EXISTS "Public read book_extras" ON public.book_extras;
DROP POLICY IF EXISTS "Admin full access on book_extras" ON public.book_extras;

CREATE POLICY "Admin full access on book_extras"
ON public.book_extras
FOR ALL TO authenticated
USING (public.is_admin() = true)
WITH CHECK (public.is_admin() = true);

COMMIT;
