
export interface ProductVariant {
  id: number;
  productId: number;
  name: string;
  weight: number;
  unit: 'g' | 'kg' | 'box' | 'pcs';
  price: number;
  stock: number;
  sku: string;
  profitMargin?: number;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  image: string;
  barcode?: string;
  description?: string;
  variants: ProductVariant[];
  expiryDate?: string;
  minimumStock?: number;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CartItem {
  id: number;
  name: string;
  variantId: number;
  price: number;
  quantity: number;
  unit: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  status: 'Active' | 'Inactive';
}

export interface Order {
  id: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: CartItem[];
  subtotal: number;
  gst: number;
  total: number;
  paymentMethod?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderDate: string;
  shippingAddress?: string;
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
}
