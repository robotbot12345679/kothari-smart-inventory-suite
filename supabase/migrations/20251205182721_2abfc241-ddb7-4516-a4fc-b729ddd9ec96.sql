-- Drop all existing public access policies
DROP POLICY IF EXISTS "Public access to categories" ON public.categories;
DROP POLICY IF EXISTS "Public access to customers" ON public.customers;
DROP POLICY IF EXISTS "Public access to orders" ON public.orders;
DROP POLICY IF EXISTS "Public access to products" ON public.products;
DROP POLICY IF EXISTS "Public access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public access to settings" ON public.settings;
DROP POLICY IF EXISTS "Public access to suppliers" ON public.suppliers;

-- Create proper user-scoped RLS policies for categories
CREATE POLICY "Users can manage their own categories"
ON public.categories
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create proper user-scoped RLS policies for customers
CREATE POLICY "Users can manage their own customers"
ON public.customers
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create proper user-scoped RLS policies for orders
CREATE POLICY "Users can manage their own orders"
ON public.orders
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create proper user-scoped RLS policies for products
CREATE POLICY "Users can manage their own products"
ON public.products
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create proper user-scoped RLS policies for profiles
CREATE POLICY "Users can manage their own profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create proper user-scoped RLS policies for settings
CREATE POLICY "Users can manage their own settings"
ON public.settings
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create proper user-scoped RLS policies for suppliers
CREATE POLICY "Users can manage their own suppliers"
ON public.suppliers
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);