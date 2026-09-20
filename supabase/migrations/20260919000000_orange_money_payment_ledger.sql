BEGIN;

-- Allow Orange Money as a first-class checkout method for printing orders.
ALTER TABLE public.printing_orders
  DROP CONSTRAINT IF EXISTS printing_orders_payment_method_check;

ALTER TABLE public.printing_orders
  ADD CONSTRAINT printing_orders_payment_method_check
  CHECK (payment_method = ANY (ARRAY['cliq'::text, 'cod'::text, 'orange_money'::text]));

-- Central payment ledger. Provider credentials/tokens never live in the browser.
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  order_type text NOT NULL CHECK (order_type IN ('printing','booking','graduation')),
  order_id bigint NOT NULL,
  order_number text NOT NULL,
  provider text NOT NULL DEFAULT 'orange_money',
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'JOD',
  customer_name text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'initiated'
    CHECK (status IN ('initiated','pending','paid','failed','expired','cancelled')),
  provider_reference text,
  provider_token text,
  provider_status text,
  failure_reason text,
  paid_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS payment_transactions_order_provider_uidx
  ON public.payment_transactions(order_type, order_id, provider);

CREATE INDEX IF NOT EXISTS payment_transactions_order_number_idx
  ON public.payment_transactions(order_number);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No public access to payment_transactions" ON public.payment_transactions;

-- Payment records are only accessed by the server-side Edge Function using service role.
CREATE POLICY "No public access to payment_transactions"
  ON public.payment_transactions
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.set_payment_transactions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payment_transactions_updated_at ON public.payment_transactions;
CREATE TRIGGER payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW EXECUTE FUNCTION public.set_payment_transactions_updated_at();

COMMIT;