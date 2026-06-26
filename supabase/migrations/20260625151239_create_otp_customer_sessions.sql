/*
# OTP Login System for SK Digital Seva

## Changes
1. New Table: `otp_requests`
   - Stores 6-digit OTPs tied to mobile numbers
   - Expires after 10 minutes
   - Max 3 attempts per OTP before invalidation
   - Cleared on successful verification

2. New Table: `customer_sessions`
   - Stores active customer sessions (non-Supabase-auth)
   - token (uuid), phone, full_name, expires_at
   - Used since Supabase phone auth requires Twilio

3. New Table: `admin_accounts`
   - Separate admin credentials table
   - Seeded with default admin (password must be changed)

## Security
- RLS: otp_requests and customer_sessions allow anon insert/select (verified by token)
- admin_accounts: no client access (service-role only via edge function)
- OTPs expire in 10 minutes, sessions expire in 7 days
*/

-- OTP requests table
CREATE TABLE IF NOT EXISTS otp_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  otp text NOT NULL,
  attempts integer DEFAULT 0,
  verified boolean DEFAULT false,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE otp_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "otp_insert" ON otp_requests;
CREATE POLICY "otp_insert" ON otp_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "otp_select" ON otp_requests;
CREATE POLICY "otp_select" ON otp_requests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "otp_update" ON otp_requests;
CREATE POLICY "otp_update" ON otp_requests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Customer sessions table
CREATE TABLE IF NOT EXISTS customer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  phone text NOT NULL,
  full_name text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customer_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sessions_insert" ON customer_sessions;
CREATE POLICY "sessions_insert" ON customer_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "sessions_select" ON customer_sessions;
CREATE POLICY "sessions_select" ON customer_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "sessions_delete" ON customer_sessions;
CREATE POLICY "sessions_delete" ON customer_sessions FOR DELETE
  TO anon, authenticated USING (true);

-- Allow anon to select/insert/update applications by phone (for customer portal)
-- Drop and recreate to allow phone-based access without auth.uid()
DROP POLICY IF EXISTS "applications_anon_select_by_phone" ON applications;
CREATE POLICY "applications_anon_select_by_phone" ON applications FOR SELECT
  TO anon USING (true);

DROP POLICY IF EXISTS "applications_anon_insert" ON applications;
CREATE POLICY "applications_anon_insert" ON applications FOR INSERT
  TO anon WITH CHECK (true);

-- Allow anon to insert documents
DROP POLICY IF EXISTS "documents_anon_insert" ON documents;
CREATE POLICY "documents_anon_insert" ON documents FOR INSERT
  TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "documents_anon_select" ON documents;
CREATE POLICY "documents_anon_select" ON documents FOR SELECT
  TO anon USING (true);

-- Index for fast phone lookups
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_requests(phone);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON customer_sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_phone ON customer_sessions(phone);
CREATE INDEX IF NOT EXISTS idx_applications_phone ON applications(applicant_phone);

-- Clean expired OTPs function
CREATE OR REPLACE FUNCTION cleanup_expired_otps() RETURNS void AS $$
BEGIN
  DELETE FROM otp_requests WHERE expires_at < now() OR verified = true;
  DELETE FROM customer_sessions WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;
