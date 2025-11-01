-- Delete existing categories for the user
DELETE FROM categories WHERE user_id = '4dc6ec84-b228-4ff6-97f9-46d8eba71fd3';

-- Insert the correct categories
INSERT INTO categories (user_id, name, is_active) VALUES
  ('4dc6ec84-b228-4ff6-97f9-46d8eba71fd3', 'All', true),
  ('4dc6ec84-b228-4ff6-97f9-46d8eba71fd3', 'Dry Fruits', true),
  ('4dc6ec84-b228-4ff6-97f9-46d8eba71fd3', 'Nuts', true),
  ('4dc6ec84-b228-4ff6-97f9-46d8eba71fd3', 'Seeds', true);