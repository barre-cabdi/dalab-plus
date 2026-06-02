
-- 1. Create credential tables
CREATE TABLE public.business_credentials (
  business_id uuid PRIMARY KEY,
  password_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.staff_credentials (
  staff_id uuid PRIMARY KEY,
  password_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Lock down: service_role only
REVOKE ALL ON public.business_credentials FROM anon, authenticated, public;
REVOKE ALL ON public.staff_credentials FROM anon, authenticated, public;
GRANT ALL ON public.business_credentials TO service_role;
GRANT ALL ON public.staff_credentials TO service_role;

ALTER TABLE public.business_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny all client access to business_credentials"
  ON public.business_credentials FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "Deny all client access to staff_credentials"
  ON public.staff_credentials FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

-- 3. Backfill existing plaintext passwords (edge function will detect and re-hash on first login)
INSERT INTO public.business_credentials (business_id, password_hash)
SELECT id, COALESCE(admin_password, '') FROM public.businesses
ON CONFLICT (business_id) DO NOTHING;

INSERT INTO public.staff_credentials (staff_id, password_hash)
SELECT id, COALESCE(password, '') FROM public.staff WHERE password IS NOT NULL AND password <> ''
ON CONFLICT (staff_id) DO NOTHING;

-- 4. Drop plaintext columns
ALTER TABLE public.businesses DROP COLUMN admin_password;
ALTER TABLE public.staff DROP COLUMN password;
