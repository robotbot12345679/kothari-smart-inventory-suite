export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  bills: PurchaseBill[];
  payments: Payment[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseItem {
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

export interface PurchaseBill {
  id: string;
  supplierId: string;
  supplierName: string;
  billNumber?: string;
  billDate: string;
  items: PurchaseItem[];
  subtotal: number;
  gst?: number;
  total: number;
  uploadedFile?: string;
  extractedData?: any;
  status: 'Pending' | 'Paid' | 'Partial';
  createdDate: string;
}

export interface Payment {
  id: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  paymentDate: string;
  paymentMode: 'Cash' | 'Online' | 'Cheque' | 'Bank Transfer';
  referenceNumber?: string;
  screenshot?: string;
  notes?: string;
  createdDate: string;
}

export interface ProductPriceHistory {
  productName: string;
  supplierId: string;
  supplierName: string;
  price: number;
  date: string;
  billId: string;
}

export interface SupplierAnalytics {
  totalPurchases: number;
  totalPayments: number;
  pendingAmount: number;
  lastBillDate?: string;
  lastPaymentDate?: string;
  billCount: number;
  paymentCount: number;
}
