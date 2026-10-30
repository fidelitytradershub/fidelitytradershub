-- Fidelity Traders Hub: protect customer payment-proof files.
-- Review existing objects and application references before applying this migration.
-- This migration is intentionally committed for review; it has NOT been run against production.
--
-- Access after this change:
--   * Customers can read files stored under their own auth.uid() folder.
--   * Active FTH administrators recognized by public.is_admin() can review proofs.
--   * New customer uploads remain restricted to their own folder by the existing INSERT policy.

BEGIN;

UPDATE storage.buckets
SET public = false
WHERE id = 'payment-proofs';

DROP POLICY IF EXISTS "Authenticated users view payment proofs"
ON storage.objects;

CREATE POLICY "Customers and admins view authorized payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_admin()
  )
);

COMMIT;
