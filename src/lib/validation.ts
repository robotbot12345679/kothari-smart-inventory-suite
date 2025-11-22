import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(200, 'Name too long'),
  price: z.number().positive('Price must be positive').max(999999, 'Price too high'),
  stock: z.number().int('Stock must be a whole number').min(0, 'Stock cannot be negative'),
  min_stock: z.number().int('Min stock must be a whole number').min(0, 'Min stock cannot be negative').nullable().optional(),
  category: z.string().max(100, 'Category name too long').optional(),
  barcode: z.string().max(50, 'Barcode too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  image_url: z.string().url('Invalid image URL').nullable().optional().or(z.literal('')),
});

export const customerSchema = z.object({
  name: z.string().trim().min(1, 'Customer name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email').max(255, 'Email too long').optional().or(z.literal('')),
  phone: z.string().max(20, 'Phone number too long').optional().or(z.literal('')),
  address: z.string().max(500, 'Address too long').optional().or(z.literal('')),
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
