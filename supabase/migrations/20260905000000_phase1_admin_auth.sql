-- ============================================================
-- IRIS Studio — Supabase Security Migration: Phase 1
-- Database-Level Admin Authorization Foundation
-- File: supabase/migrations/20260905000000_phase1_admin_auth.sql
-- ============================================================

-- ────────────────────────────────────────────
-- 1. DEDICATED ADMIN USERS TABLE
-- ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists for idempotent re-runs
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;

-- RLS Policy: Only authenticated admin users can view entries in admin_users
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────
-- 2. AUTOMATIC ADMIN ASSOCIATE SEED
-- ────────────────────────────────────────────
-- If the account iris.contact.jo@gmail.com already exists in auth.users,
-- link its UUID to admin_users automatically.

INSERT INTO public.admin_users (user_id)
SELECT id
FROM auth.users
WHERE email = 'iris.contact.jo@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- ────────────────────────────────────────────
-- 3. SECURE is_admin() FUNCTION
-- ────────────────────────────────────────────
-- Secure RPC function called by frontend (supabase.rpc('is_admin'))
-- Returns true ONLY if the requesting user's JWT auth.uid() is in admin_users
-- or matches the primary admin email in auth.users.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid UUID;
  v_is_admin BOOLEAN := FALSE;
BEGIN
  -- Get current authenticated user's UUID from JWT token
  v_uid := auth.uid();

  -- Return FALSE immediately if user is unauthenticated
  IF v_uid IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check 1: Is user ID listed in admin_users table?
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = v_uid
  ) INTO v_is_admin;

  IF v_is_admin THEN
    RETURN TRUE;
  END IF;

  -- Check 2: Does user's authenticated email match intended admin email?
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = v_uid
      AND email = 'iris.contact.jo@gmail.com'
  ) INTO v_is_admin;

  RETURN v_is_admin;
END;
$$;

-- Grant EXECUTE permission to anon and authenticated roles
-- (Unauthenticated/anon callers will safely receive false because auth.uid() is NULL)
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
