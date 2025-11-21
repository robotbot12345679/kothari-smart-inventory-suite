-- Make all tables publicly accessible since authentication is removed
-- This allows the app to work without login while maintaining data structure

-- Update categories table policies
DROP POLICY IF EXISTS "Users can manage their own categories" ON categories;
CREATE POLICY "Public access to categories"
  ON categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update customers table policies
DROP POLICY IF EXISTS "Users can manage their own customers" ON customers;
CREATE POLICY "Public access to customers"
  ON customers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update orders table policies
DROP POLICY IF EXISTS "Users can manage their own orders" ON orders;
CREATE POLICY "Public access to orders"
  ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update products table policies
DROP POLICY IF EXISTS "Users can manage their own products" ON products;
CREATE POLICY "Public access to products"
  ON products
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update suppliers table policies
DROP POLICY IF EXISTS "Users can manage their own suppliers" ON suppliers;
CREATE POLICY "Public access to suppliers"
  ON suppliers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update settings table policies
DROP POLICY IF EXISTS "Users can view their own settings" ON settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON settings;
CREATE POLICY "Public access to settings"
  ON settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Public access to profiles"
  ON profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);