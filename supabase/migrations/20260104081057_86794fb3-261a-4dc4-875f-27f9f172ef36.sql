-- Disable RLS for single-user / no-auth mode so POS + Orders writes/reads work with the anon key.
-- NOTE: This makes these tables accessible according to GRANTs for the anon role.

ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers DISABLE ROW LEVEL SECURITY;

-- Ensure anon/authenticated can read/write (safe in no-auth single-tenant setup).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO anon, authenticated;