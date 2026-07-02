/*
# Fix Storage RLS for Admin Document Access

## Problem
The `documents` storage bucket is public, but the `documents_read_own` SELECT
policy on `storage.objects` restricts authenticated users to only files where
`auth.uid()::text = (storage.foldername(name))[1]`. Customer-uploaded files are
stored under `customer/<phone>/<appId>/...`, so `foldername(name)[1]` returns
`'customer'` — never the admin's `auth.uid()`. This causes `createSignedUrl()`
to fail silently for admin users, making View and Download buttons appear broken.

## Fix
1. Drop the restrictive `documents_read_own` SELECT policy — it conflicts with
   the broader `documents_bucket_select` public policy and blocks admin access.
2. Add a new `documents_admin_read` SELECT policy allowing admins (via the
   `is_admin()` helper) to read any object in the `documents` bucket.
3. Add a new `documents_admin_upload` INSERT policy allowing admins to upload
   to the `documents` bucket (useful if admin needs to add documents).
4. Keep the existing `documents_bucket_select` public policy (bucket is public).
5. Keep the existing `documents_bucket_insert` anon+authenticated policy.

## Security
- The bucket remains public (unchanged) — anyone with a URL can read.
- Admins get explicit read access via `is_admin()`.
- Customers can still upload via the `documents_bucket_insert` policy.
- No data is lost — only policy definitions change.
*/

-- Drop the restrictive read-own policy that blocks admin access
DROP POLICY IF EXISTS "documents_read_own" ON storage.objects;

-- Drop the restrictive upload policy that requires auth.uid() = foldername
DROP POLICY IF EXISTS "documents_upload" ON storage.objects;

-- Admin can read any document in the bucket
DROP POLICY IF EXISTS "documents_admin_read" ON storage.objects;
CREATE POLICY "documents_admin_read" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents' AND is_admin());

-- Admin can upload to the documents bucket
DROP POLICY IF EXISTS "documents_admin_upload" ON storage.objects;
CREATE POLICY "documents_admin_upload" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents' AND is_admin());

-- Admin can delete any document in the bucket
DROP POLICY IF EXISTS "documents_admin_delete" ON storage.objects;
CREATE POLICY "documents_admin_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND is_admin());
