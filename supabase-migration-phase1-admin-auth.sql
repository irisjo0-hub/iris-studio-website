-- ============================================================
-- IRIS Studio — Supabase Security Migration: Phase 1 (Revised)
-- Database-Level Admin Authorization Foundation
-- File: supabase-migration-phase1-admin-auth.sql
-- ============================================================

-- ────────────────────────────────────────────
-- 1. DEDICATED ADMIN USERS TABLE
-- ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Idempotent policy cleanup
DROP POLICY IF EXISTS "Admins can view own admin status" ON public.admin_users;

-- RLS Policy: Authenticated users can ONLY view their own admin_users record (prevents enumeration)
-- INSERT, UPDATE, and DELETE policies are omitted, forbidding writes from anon/authenticated roles.
CREATE POLICY "Admins can view own admin status"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────
-- 2. INITIAL MIGRATION SEED (EMAIL USED ONLY AT SEED TIME)
-- ────────────────────────────────────────────
-- Automatically associate iris.contact.jo@gmail.com with admin_users IF it already exists in auth.users.
-- Email is NOT checked at runtime by is_admin().

INSERT INTO public.admin_users (user_id)
SELECT id
FROM auth.users
WHERE email = 'iris.contact.jo@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- ────────────────────────────────────────────
-- 3. SINGLE SOURCE OF TRUTH: SECURE is_admin() FUNCTION
-- ────────────────────────────────────────────
-- Returns true ONLY if auth.uid() exists in public.admin_users.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid UUID;
BEGIN
  -- 1. Extract current authenticated user's UUID from JWT token
  v_uid := auth.uid();

  -- 2. Return FALSE immediately if user is unauthenticated
  IF v_uid IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 3. Check strictly against public.admin_users table (Single Source of Truth)
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = v_uid
  );
END;
$$;

-- ────────────────────────────────────────────
-- 4. EXPLICIT EXECUTE PRIVILEGES
-- ────────────────────────────────────────────
-- Explicitly revoke from PUBLIC and grant EXECUTE strictly to authenticated users.
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
