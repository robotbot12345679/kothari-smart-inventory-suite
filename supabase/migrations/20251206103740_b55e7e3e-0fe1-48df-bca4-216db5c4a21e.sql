-- Drop all existing RLS policies and disable RLS on all tables
-- This enables direct public access without authentication

-- Products table
DROP POLICY IF EXISTS "Users can view their own products" ON public.products;
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Categories table
DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Customers table
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can insert their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- Orders table
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON public.orders;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Suppliers table
DROP POLICY IF EXISTS "Users can view their own suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Users can insert their own suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Users can update their own suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Users can delete their own suppliers" ON public.suppliers;
ALTER TABLE public.suppliers DISABLE ROW LEVEL SECURITY;

-- Profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Settings table
DROP POLICY IF EXISTS "Users can view their own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON public.settings;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;