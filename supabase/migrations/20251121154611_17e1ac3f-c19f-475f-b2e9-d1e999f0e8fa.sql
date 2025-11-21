-- Insert default categories for the user
INSERT INTO categories (user_id, name, description, is_active) 
VALUES 
  ('ce4e31ba-703b-4402-948d-1f2ecc219ba4', 'all', 'All Products', true),
  ('ce4e31ba-703b-4402-948d-1f2ecc219ba4', 'dry fruits', 'Dry Fruits Category', true),
  ('ce4e31ba-703b-4402-948d-1f2ecc219ba4', 'nuts', 'Nuts Category', true),
  ('ce4e31ba-703b-4402-948d-1f2ecc219ba4', 'seeds', 'Seeds Category', true);