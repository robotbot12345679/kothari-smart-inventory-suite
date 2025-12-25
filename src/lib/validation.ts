import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(200, 'Name too long'),
  price: z.number().min(0, 'Price must be at least 0').max(999999, 'Price too high'),
  stock: z.number().int('Stock must be a whole number').min(0, 'Stock cannot be negative'),
  min_stock: z.number().int('Min stock must be a whole number').min(0, 'Min stock cannot be negative').nullable().optional(),
  category: z.string().max(100, 'Category name too long').optional().nullable().or(z.literal('')),
  barcode: z.string().max(50, 'Barcode too long').optional().nullable().or(z.literal('')),
  description: z.string().max(1000, 'Description too long').optional().nullable().or(z.literal('')),
  image_url: z.string().max(500, 'Image path too long').nullable().optional().or(z.literal('')),
  image: z.string().max(500, 'Image path too long').optional().nullable().or(z.literal('')),
  sku: z.string().max(100, 'SKU too long').optional().nullable().or(z.literal('')),
  unit: z.string().max(20, 'Unit too long').optional().nullable().or(z.literal('')),
  weight: z.number().min(0, 'Weight cannot be negative').optional().nullable(),
  is_active: z.boolean().optional().nullable(),
  price_includes_gst: z.boolean().optional().nullable(),
  expiry_date: z.string().optional().nullable().or(z.literal('')),
});

export const customerSchema = z.object({
  name: z.string().trim().min(1, 'Customer name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email').max(255, 'Email too long').optional().nullable().or(z.literal('')),
  phone: z.string().max(20, 'Phone number too long').optional().nullable().or(z.literal('')),
  address: z.string().max(500, 'Address too long').optional().nullable().or(z.literal('')),
  city: z.string().max(100, 'City name too long').optional().nullable().or(z.literal('')),
  state: z.string().max(100, 'State name too long').optional().nullable().or(z.literal('')),
  pincode: z.string().max(10, 'Pincode too long').optional().nullable().or(z.literal('')),
  notes: z.string().max(500, 'Notes too long').optional().nullable().or(z.literal('')),
  birthday: z.string().optional().nullable().or(z.literal('')),
  total_orders: z.number().int().min(0).optional().nullable(),
  total_spent: z.number().min(0).optional().nullable(),
  status: z.string().optional().nullable(),
  last_order_date: z.string().optional().nullable(),
  order_history: z.array(z.any()).optional().nullable(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100, 'Name too long'),
});

export const orderSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID').optional(),
  customer_name: z.string().max(100, 'Name too long').optional(),
  items: z.array(z.any()).min(1, 'Order must have at least one item'),
  total: z.number().positive('Total must be positive').max(9999999, 'Total too high'),
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
});

export const supplierSchema = z.object({
  name: z.string().trim().min(1, 'Supplier name is required').max(100, 'Name too long'),
  contact_person: z.string().max(100, 'Contact person name too long').optional().or(z.literal('')),
  email: z.string().email('Invalid email').max(255, 'Email too long').optional().or(z.literal('')),
  phone: z.string().max(20, 'Phone number too long').optional().or(z.literal('')),
  address: z.string().max(500, 'Address too long').optional().or(z.literal('')),
  bills: z.array(z.any()).optional(),
  payments: z.array(z.any()).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
