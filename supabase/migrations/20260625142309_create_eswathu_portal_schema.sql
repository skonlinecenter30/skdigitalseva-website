/*
# Karnataka eSwathu 2.0 Portal - Initial Schema

## Summary
Creates the complete database schema for the SK Online Center eSwathu portal.

## New Tables

### 1. profiles
- Extends auth.users with customer profile data
- Stores name, phone, address, language preference

### 2. applications
- Stores all service applications (e-Khata, Khata Transfer, etc.)
- Tracks application status lifecycle
- Links to applicant profile

### 3. documents
- Stores uploaded document metadata per application
- References storage bucket paths

### 4. enquiries
- Stores public enquiry form submissions (no auth required)
- Captures name, phone, email, message

### 5. reviews
- Customer reviews/testimonials
- Admin approved flag

## Security
- RLS enabled on all tables
- Profiles: users see/edit own; admins see all
- Applications: owners and admins
- Documents: application owners and admins
- Enquiries: public insert, admin read
- Reviews: public insert, public select approved, admin all
*/

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  email text,
  address text,
  language text DEFAULT 'en' CHECK (language IN ('en', 'kn')),
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
  TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type text NOT NULL CHECK (service_type IN ('new_ekhata', 'khata_transfer', 'khata_correction', 'form9_download', 'form11_download')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'completed')),
  applicant_name text NOT NULL,
  applicant_phone text NOT NULL,
  applicant_email text,
  property_address text,
  village_name text,
  hobli text,
  taluk text,
  district text,
  survey_number text,
  khata_number text,
  previous_owner_name text,
  area_in_acres text,
  remarks text,
  admin_notes text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_amount numeric(10,2),
  payment_id text,
  payment_method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applications_select_own" ON applications;
CREATE POLICY "applications_select_own" ON applications FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "applications_insert_own" ON applications;
CREATE POLICY "applications_insert_own" ON applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "applications_update_own" ON applications;
CREATE POLICY "applications_update_own" ON applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "applications_delete_admin" ON applications;
CREATE POLICY "applications_delete_admin" ON applications FOR DELETE
  TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documents_select_own" ON documents;
CREATE POLICY "documents_select_own" ON documents FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "documents_insert_own" ON documents;
CREATE POLICY "documents_insert_own" ON documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "documents_update_own" ON documents;
CREATE POLICY "documents_update_own" ON documents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "documents_delete_own" ON documents;
CREATE POLICY "documents_delete_own" ON documents FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Enquiries table (public, no auth required)
CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  service_type text,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enquiries_public_insert" ON enquiries;
CREATE POLICY "enquiries_public_insert" ON enquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "enquiries_admin_select" ON enquiries;
CREATE POLICY "enquiries_admin_select" ON enquiries FOR SELECT
  TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "enquiries_admin_update" ON enquiries;
CREATE POLICY "enquiries_admin_update" ON enquiries FOR UPDATE
  TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "enquiries_admin_delete" ON enquiries;
CREATE POLICY "enquiries_admin_delete" ON enquiries FOR DELETE
  TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  location text,
  service_type text,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text text NOT NULL,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_public_insert" ON reviews;
CREATE POLICY "reviews_public_insert" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "reviews_public_select_approved" ON reviews;
CREATE POLICY "reviews_public_select_approved" ON reviews FOR SELECT
  TO anon, authenticated USING (
    is_approved = true OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "reviews_admin_update" ON reviews;
CREATE POLICY "reviews_admin_update" ON reviews FOR UPDATE
  TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "reviews_admin_delete" ON reviews;
CREATE POLICY "reviews_admin_delete" ON reviews FOR DELETE
  TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Function to auto-generate application numbers
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_number IS NULL OR NEW.application_number = '' THEN
    NEW.application_number := 'SKON-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('application_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequence for application numbers
CREATE SEQUENCE IF NOT EXISTS application_seq START 1000;

-- Trigger for auto application number
DROP TRIGGER IF EXISTS set_application_number ON applications;
CREATE TRIGGER set_application_number
  BEFORE INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION generate_application_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed some approved reviews for display
INSERT INTO reviews (full_name, location, service_type, rating, review_text, is_approved) VALUES
  ('Raju Gowda', 'Bangalore Rural', 'new_ekhata', 5, 'Excellent service! Got my e-Khata within 7 days. Very professional team at SK Online Center.', true),
  ('Savitha Reddy', 'Mysuru', 'khata_transfer', 5, 'ಖಾತಾ ವರ್ಗಾವಣೆ ತುಂಬಾ ಸುಲಭವಾಯಿತು. SK Online Center ತಂಡಕ್ಕೆ ಧನ್ಯವಾದಗಳು!', true),
  ('Mahesh Kumar', 'Tumkur', 'khata_correction', 4, 'Good service, helped me correct errors in my Khata quickly. Recommended to everyone.', true),
  ('Anitha Nagaraj', 'Ramanagara', 'new_ekhata', 5, 'Very quick and hassle-free process. The team guided me through every step. 100% genuine service.', true),
  ('Venkatesh B', 'Kolar', 'form9_download', 5, 'Downloaded Form 9 within 2 days. No need to visit government office anymore. Great work!', true),
  ('Lakshmi Devi', 'Hassan', 'khata_transfer', 4, 'ಸೇವೆ ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ. ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಕೆಲಸ ಮುಗಿಸಿದರು.', true)
ON CONFLICT DO NOTHING;
