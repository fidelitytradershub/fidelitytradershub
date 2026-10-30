-- Fidelity Traders Hub: protect customer payment-proof files.
-- This migration secures payment-proof storage and enables receipt submission.
-- The storage policy statements are safe to re-run after the bucket was secured manually.
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

DROP POLICY IF EXISTS "Customers and admins view authorized payment proofs"
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


-- Store the private object path after the customer uploads the receipt.
-- The object must already exist in the customer's own folder.
CREATE OR REPLACE FUNCTION public.submit_deposit_details(
  p_deposit_id uuid,
  p_payment_reference text,
  p_sender_name text,
  p_sender_bank text,
  p_payment_date timestamp with time zone DEFAULT now(),
  p_proof_file_url text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in.';
  END IF;

  IF NULLIF(trim(p_sender_name), '') IS NULL THEN
    RAISE EXCEPTION 'Sender name is required.';
  END IF;

  IF NULLIF(trim(p_sender_bank), '') IS NULL THEN
    RAISE EXCEPTION 'Sender bank is required.';
  END IF;

  IF NULLIF(trim(p_proof_file_url), '') IS NULL THEN
    RAISE EXCEPTION 'A payment receipt is required.';
  END IF;

  IF (storage.foldername(trim(p_proof_file_url)))[1] IS DISTINCT FROM v_user_id::text THEN
    RAISE EXCEPTION 'Invalid payment receipt location.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM storage.objects
    WHERE bucket_id = 'payment-proofs'
      AND name = trim(p_proof_file_url)
  ) THEN
    RAISE EXCEPTION 'Uploaded payment receipt was not found.';
  END IF;

  UPDATE public.deposits
  SET
    payment_reference = COALESCE(NULLIF(trim(p_payment_reference), ''), reference),
    sender_name = trim(p_sender_name),
    sender_bank = trim(p_sender_bank),
    payment_date = COALESCE(p_payment_date, now()),
    proof_file_url = trim(p_proof_file_url),
    status = 'awaiting_verification',
    updated_at = now()
  WHERE id = p_deposit_id
    AND user_id = v_user_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment request was not found, does not belong to you, or is no longer pending.';
  END IF;
END;
$function$;

COMMIT;
