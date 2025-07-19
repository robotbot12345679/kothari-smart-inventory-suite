
export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  image: string;
  barcode?: string;
  description?: string;
  price: number;
  stock: number;
  weight: number;
  unit: 'g' | 'kg' | 'box' | 'pcs';
  priceIncludesGST: boolean;
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
  price: number;
  quantity: number;
  unit: string;
  weight: number;
  variantId?: number; // Making variantId optional
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone: string;
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

export interface BillingTemplate {
  shopName: string;
  address: string;
  phone: string;
  gstNumber: string;
  footerText: string[];
  logoUrl?: string;
}
