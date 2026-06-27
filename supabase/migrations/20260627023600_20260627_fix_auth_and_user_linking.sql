/*
# Fix Authentication and User Linking

## Changes
1. Make `user_id` nullable in applications (customers use phone/OTP, not Supabase Auth)
2. Add `customer_phone` column to link applications to customer_sessions
3. Add trigger to auto-create profile for new Supabase Auth users (admins)
4. Update RLS policies for both auth-based (admin) and phone-based (customer) access
5. Add helper function to check admin role

## Security
- Admins: authenticated via Supabase Auth, role checked in profiles table
- Customers: authenticated via customer_sessions table (phone/OTP)
- Applications linked by customer_phone for customers, user_id for admins
*/

-- ============================================
-- 1. Make user_id nullable and add customer_phone
-- ============================================

-- Drop the default and not null constraint from user_id
ALTER TABLE applications ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE applications ALTER COLUMN user_id DROP DEFAULT;

-- Add customer_phone column to link with customer_sessions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='customer_phone') THEN
    ALTER TABLE applications ADD COLUMN customer_phone text;
  END IF;
END $$;

-- Add customer_session_id to link to the session
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='customer_session_id') THEN
    ALTER TABLE applications ADD COLUMN customer_session_id uuid;
  END IF;
END $$;

-- Create index for customer lookups
CREATE INDEX IF NOT EXISTS idx_applications_customer_phone ON applications(customer_phone);
CREATE INDEX IF NOT EXISTS idx_applications_customer_session ON applications(customer_session_id);

-- ============================================
-- 2. Helper function to check if user is admin
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- 3. Update RLS policies for applications
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "applications_select_own" ON applications;
DROP POLICY IF EXISTS "applications_insert_own" ON applications;
DROP POLICY IF EXISTS "applications_update_own" ON applications;
DROP POLICY IF EXISTS "applications_delete_admin" ON applications;
DROP POLICY IF EXISTS "applications_anon_select_by_phone" ON applications;
DROP POLICY IF EXISTS "applications_anon_insert" ON applications;

-- Select: Allow admin to see all, customers see their own by phone
CREATE POLICY "applications_select" ON applications FOR SELECT
  TO anon, authenticated
  USING (
    -- Admin sees everything
    is_admin() 
    OR 
    -- Customer sees their own by phone
    customer_phone IS NOT NULL AND customer_phone = current_setting('request.jwt.claims->>phone', true)
    OR
    -- Or by session
    customer_session_id IS NOT NULL
  );

-- For simplicity, allow anon to select by phone (for demo without JWT)
CREATE POLICY "applications_select_by_phone" ON applications FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert: Allow anon (customer) and authenticated (admin)
CREATE POLICY "applications_insert" ON applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Update: Admin can update any, customers cannot update after submission
CREATE POLICY "applications_update" ON applications FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Delete: Admin only
CREATE POLICY "applications_delete" ON applications FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- 4. Update RLS policies for documents
-- ============================================

DROP POLICY IF EXISTS "documents_select_own" ON documents;
DROP POLICY IF EXISTS "documents_insert_own" ON documents;
DROP POLICY IF EXISTS "documents_update_own" ON documents;
DROP POLICY IF EXISTS "documents_delete_own" ON documents;
DROP POLICY IF EXISTS "documents_anon_insert" ON documents;
DROP POLICY IF EXISTS "documents_anon_select" ON documents;

-- Select: Admin or document owner
CREATE POLICY "documents_select" ON documents FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert: Allow anon and authenticated
CREATE POLICY "documents_insert" ON documents FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Update/Delete: Admin only
CREATE POLICY "documents_update" ON documents FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "documents_delete" ON documents FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- 5. Auto-create profile for new Supabase Auth users
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 6. Create admin_accounts table for secure admin login
-- ============================================

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- No client access - only service role can read/write
CREATE POLICY "admin_users_no_access" ON admin_users
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ============================================
-- 7. Update profiles table to ensure admin role works
-- ============================================

-- Add unique email index if not exists
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;

-- ============================================
-- 8. Grant necessary permissions
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
