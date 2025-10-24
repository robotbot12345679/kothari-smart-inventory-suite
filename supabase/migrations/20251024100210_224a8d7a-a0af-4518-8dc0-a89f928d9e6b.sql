-- Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight numeric DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit text DEFAULT 'pcs';
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_includes_gst boolean DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS expiry_date timestamp with time zone;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gst numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'Pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_date timestamp with time zone DEFAULT now();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status text DEFAULT 'Pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number text;

-- Add missing columns to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS birthday text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_orders integer DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_spent numeric DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_order_date timestamp with time zone;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS order_history jsonb DEFAULT '[]'::jsonb;

-- Add missing columns to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;