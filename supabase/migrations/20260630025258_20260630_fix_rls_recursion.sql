/*
# Fix Infinite Recursion in Profiles RLS Policy

## Problem
The SELECT policy was querying profiles table inside the policy that protects profiles,
causing infinite recursion: "SELECT role FROM profiles WHERE id = auth.uid()" inside
the policy that controls access to profiles.

## Solution
Use SECURITY DEFINER function to check admin role without RLS recursion.
Simplify policies to avoid self-referencing.
*/

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
DROP POLICY IF EXISTS "profiles_upsert_own" ON profiles;

-- Create a security definer function to check admin status
-- This bypasses RLS when checking admin role
CREATE OR REPLACE FUNCTION is_admin_user(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- New non-recursive policies

-- SELECT: Users can read their own profile, admins can read all
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR is_admin_user(auth.uid())
  );

-- INSERT: Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: Users can update their own profile, admins can update all
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id 
    OR is_admin_user(auth.uid())
  )
  WITH CHECK (
    auth.uid() = id 
    OR is_admin_user(auth.uid())
  );

-- DELETE: Only admins can delete
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
  TO authenticated
  USING (is_admin_user(auth.uid()));

-- Grant execute on the helper function
GRANT EXECUTE ON FUNCTION is_admin_user(uuid) TO authenticated;
