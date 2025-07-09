
export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  createdDate: string;
  isActive: boolean;
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
  supplierId: number;
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
  supplierId: number;
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
  supplierId: number;
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
