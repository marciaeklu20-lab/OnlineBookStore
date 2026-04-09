-- ============================================================
-- Migration 006: Fix "Database error saving new user"
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Add missing INSERT policy on profiles so the trigger can write rows
--    (the trigger uses SECURITY DEFINER but Supabase still checks RLS on insert)
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- 2. Replace the trigger function with a more robust version that:
--    - Handles null emails (e.g. phone-only or OAuth providers)
--    - Uses ON CONFLICT DO NOTHING to avoid duplicate-key errors on re-runs
--    - Pulls first/last name from Google OAuth metadata if available
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _first_name TEXT;
  _last_name  TEXT;
  _email      TEXT;
BEGIN
  -- Safely extract email (can be NULL for some OAuth flows)
  _email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', '');

  -- Pull name from email/password signup metadata OR Google OAuth
  _first_name := COALESCE(
    NEW.raw_user_meta_data->>'first_name',   -- email signup (AuthForm sends this)
    NEW.raw_user_meta_data->>'given_name',   -- Google OAuth
    split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1),
    ''
  );
  _last_name := COALESCE(
    NEW.raw_user_meta_data->>'last_name',    -- email signup
    NEW.raw_user_meta_data->>'family_name',  -- Google OAuth
    NULLIF(split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 2), ''),
    NULL
  );

  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (NEW.id, _email, _first_name, _last_name)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 3. Re-create the trigger (drop first to avoid duplicates)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
