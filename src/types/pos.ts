
export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  category: string;
  image: string;
  unit: string;
  barcode?: string;
  stock: number;
  expiryDate?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface Order {
  id: string;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  gst: number;
  total: number;
  paymentMethod?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderDate: string;
}
