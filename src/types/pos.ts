// Re-export types from CloudDataContext to maintain a single source of truth
export type { 
  Product, 
  Category, 
  Customer, 
  Order 
} from '@/context/CloudDataContext';

// Legacy type that's still used in some components
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  weight: number;
  variantId?: number;
}

export interface BillingTemplate {
  shopName: string;
  address: string;
  phone: string;
  gstNumber: string;
  footerText: string[];
  logoUrl?: string;
}
