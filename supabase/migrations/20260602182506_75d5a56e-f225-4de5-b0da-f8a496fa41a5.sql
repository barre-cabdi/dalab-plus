
-- Lock down otp_codes: only service_role (edge functions) can access
DROP POLICY IF EXISTS "Allow all access to otp_codes" ON public.otp_codes;
REVOKE ALL ON public.otp_codes FROM anon, authenticated;
GRANT ALL ON public.otp_codes TO service_role;

-- Default deny policy (no access for anon/authenticated)
CREATE POLICY "Deny all client access to otp_codes"
ON public.otp_codes
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Lock down password_logs: only service_role can access
DROP POLICY IF EXISTS "Allow all access to password_logs" ON public.password_logs;
REVOKE ALL ON public.password_logs FROM anon, authenticated;
GRANT ALL ON public.password_logs TO service_role;

CREATE POLICY "Deny all client access to password_logs"
ON public.password_logs
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);
