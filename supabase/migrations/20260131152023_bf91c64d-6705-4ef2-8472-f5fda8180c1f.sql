-- Drop all existing public policies
DROP POLICY IF EXISTS "Allow public read on fault_history" ON public.fault_history;
DROP POLICY IF EXISTS "Allow public insert on fault_history" ON public.fault_history;
DROP POLICY IF EXISTS "Allow public read on predictions" ON public.predictions;
DROP POLICY IF EXISTS "Allow public insert on predictions" ON public.predictions;
DROP POLICY IF EXISTS "Allow public read on system_status" ON public.system_status;
DROP POLICY IF EXISTS "Allow public update on system_status" ON public.system_status;

-- Create secure policies for fault_history (authenticated users can read, service role can insert)
CREATE POLICY "Authenticated users can read fault_history"
ON public.fault_history FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can insert fault_history"
ON public.fault_history FOR INSERT
TO service_role
WITH CHECK (true);

-- Create secure policies for predictions (authenticated users can read, service role can insert)
CREATE POLICY "Authenticated users can read predictions"
ON public.predictions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can insert predictions"
ON public.predictions FOR INSERT
TO service_role
WITH CHECK (true);

-- Create secure policies for system_status (authenticated users can read, service role can update)
CREATE POLICY "Authenticated users can read system_status"
ON public.system_status FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can update system_status"
ON public.system_status FOR UPDATE
TO service_role
USING (true);