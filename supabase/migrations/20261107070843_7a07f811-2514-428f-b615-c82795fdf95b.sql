REVOKE ALL ON public.bookings FROM anon, authenticated;
CREATE POLICY "No direct visitor access to bookings" ON public.bookings FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);