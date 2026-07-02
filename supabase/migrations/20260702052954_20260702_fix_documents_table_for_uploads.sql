/*
# Fix Documents Table for Customer Uploads

## Problem
The `documents` table has two issues blocking the document upload flow:
1. `user_id` is NOT NULL with a default of `auth.uid()` — but customers log in via
   phone/OTP (customer_sessions), NOT Supabase Auth, so `auth.uid()` is NULL and
   every insert fails the NOT NULL constraint.
2. The table is missing `document_name` and `file_url` columns that the upload
   flow needs to store a human-readable label and a public/signed URL alongside
   the storage path.

## Changes
1. `documents.user_id` — drop NOT NULL and the `auth.uid()` default so phone-based
   customers can insert rows with `user_id = NULL`.
2. `documents.document_name` — new nullable text column for a human-readable
   document label (e.g. "Aadhaar Card").
3. `documents.file_url` — new nullable text column storing the public or signed
   URL for quick access.

## Security
- No RLS policy changes. Existing policies already allow anon + authenticated
  SELECT and INSERT (see migration 20260627023600), and admin-only UPDATE/DELETE.
- The storage bucket `documents` is already public with anon insert allowed
  (see migration 20260625143427 and later bucket policies).

## Notes
- All existing data is preserved — this is additive only (no drops, no type
  changes, no renames).
- The `documents` table is the canonical document store; the frontend refers to
  it as "application_documents" conceptually, but the underlying table name
  remains `documents` to avoid a data-losing rename.
*/

-- 1. Make user_id nullable and remove the auth.uid() default
ALTER TABLE documents ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE documents ALTER COLUMN user_id DROP DEFAULT;

-- 2. Add document_name column (human-readable label)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'document_name'
  ) THEN
    ALTER TABLE documents ADD COLUMN document_name text;
  END IF;
END $$;

-- 3. Add file_url column (public/signed URL for quick access)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE documents ADD COLUMN file_url text;
  END IF;
END $$;
