import { useMemo } from 'react';
import { useCloudData } from '@/context/CloudDataContext';
import type { Supplier } from '@/context/CloudDataContext';

interface SupplierAnalytics {
  totalPurchases: number;
  totalPayments: number;
  pendingAmount: number;
  lastBillDate?: string;
  lastPaymentDate?: string;
  billCount: number;
  paymentCount: number;
}

interface ProductComparison {
  productName: string;
  suppliers: {
    [key: string]: {
      price: number;
      date: string;
      change?: number;
      changePercent?: number;
    };
  };
}

export const useCloudSupplierData = () => {
  const {
    suppliers,
    addSupplier: cloudAddSupplier,
    updateSupplier: cloudUpdateSupplier,
    deleteSupplier: cloudDeleteSupplier,
    addSupplierBill,
    updateSupplierBill,
    deleteSupplierBill,
    addSupplierPayment,
    updateSupplierPayment,
    deleteSupplierPayment,
    showToast
  } = useCloudData();

  // Transform cloud suppliers to match the old format
  const transformedSuppliers = useMemo(() => {
    return suppliers.map(s => ({
      id: parseInt(s.id.split('-')[0], 36), // Simple numeric ID for compatibility
      name: s.name,
      contactPerson: s.contact_person || '',
      email: s.email || '',
      phone: s.phone || '',
      address: s.address || '',
      isActive: true,
      createdDate: s.created_at,
      cloudId: s.id // Keep track of cloud ID
    }));
  }, [suppliers]);

  // Get all bills from all suppliers
  const purchaseBills = useMemo(() => {
    return suppliers.flatMap(s => 
      (s.bills || []).map((bill: any) => ({
        ...bill,
        supplierId: parseInt(s.id.split('-')[0], 36),
        cloudSupplierId: s.id
      }))
    );
  }, [suppliers]);

  // Get all payments from all suppliers
  const payments = useMemo(() => {
    return suppliers.flatMap(s => 
      (s.payments || []).map((payment: any) => ({
        ...payment,
        supplierId: parseInt(s.id.split('-')[0], 36),
        cloudSupplierId: s.id
      }))
    );
  }, [suppliers]);

  const addSupplier = (supplier: any) => {
    cloudAddSupplier({
      name: supplier.name,
      contact_person: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      bills: [],
      payments: []
    });

    // Return a temporary object for immediate use
    return {
      id: Math.max(0, ...transformedSuppliers.map(s => s.id)) + 1,
      ...supplier,
      createdDate: new Date().toISOString()
    };
  };

  const updateSupplier = (id: number, updatedSupplier: any) => {
    const supplier = transformedSuppliers.find(s => s.id === id);
    if (!supplier?.cloudId) return;

    cloudUpdateSupplier(supplier.cloudId, {
      name: updatedSupplier.name,
      contact_person: updatedSupplier.contactPerson,
      email: updatedSupplier.email,
      phone: updatedSupplier.phone,
      address: updatedSupplier.address
    });
  };

  const deleteSupplier = (id: number) => {
    const supplier = transformedSuppliers.find(s => s.id === id);
    if (!supplier?.cloudId) return;
    
    cloudDeleteSupplier(supplier.cloudId);
  };

  const addPurchaseBill = (bill: any) => {
    const supplier = transformedSuppliers.find(s => s.id === bill.supplierId);
    if (!supplier?.cloudId) return;

    addSupplierBill(supplier.cloudId, bill);
    return bill;
  };

  const deletePurchaseBill = (billId: string) => {
    const bill = purchaseBills.find(b => b.id === billId);
    if (!bill?.cloudSupplierId) return;

    deleteSupplierBill(bill.cloudSupplierId, billId);
  };

  const addPayment = (payment: any) => {
    const supplier = transformedSuppliers.find(s => s.id === payment.supplierId);
    if (!supplier?.cloudId) return;

    addSupplierPayment(supplier.cloudId, payment);
    return payment;
  };

  const deletePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment?.cloudSupplierId) return;

    deleteSupplierPayment(payment.cloudSupplierId, paymentId);
  };

  const getSupplierAnalytics = (supplierId: number): SupplierAnalytics => {
    const supplierBills = purchaseBills.filter(bill => bill.supplierId === supplierId);
    const supplierPayments = payments.filter(payment => payment.supplierId === supplierId);
    
    const totalPurchases = supplierBills.reduce((sum, bill) => sum + bill.total, 0);
    const totalPayments = supplierPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const pendingAmount = totalPurchases - totalPayments;
    
    const lastBillDate = supplierBills.length > 0 
      ? supplierBills.sort((a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime())[0].billDate
      : undefined;
    
    const lastPaymentDate = supplierPayments.length > 0
      ? supplierPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0].paymentDate
      : undefined;

    return {
      totalPurchases,
      totalPayments,
      pendingAmount,
      lastBillDate,
      lastPaymentDate,
      billCount: supplierBills.length,
      paymentCount: supplierPayments.length
    };
  };

  const getProductComparison = (): ProductComparison[] => {
    const productMap = new Map<string, {
      suppliers: { [key: string]: { price: number; date: string; change?: number; changePercent?: number } }
    }>();

    // Build product price history from all bills
    purchaseBills.forEach(bill => {
      (bill.items || []).forEach((item: any) => {
        if (!productMap.has(item.productName)) {
          productMap.set(item.productName, { suppliers: {} });
        }
        
        const product = productMap.get(item.productName)!;
        const supplierKey = `${bill.supplierId}-${bill.supplierName}`;
        
        // Keep only the latest price for each supplier
        if (!product.suppliers[supplierKey] || new Date(bill.billDate) > new Date(product.suppliers[supplierKey].date)) {
          const previousPrice = product.suppliers[supplierKey]?.price;
          const change = previousPrice ? item.pricePerUnit - previousPrice : 0;
          const changePercent = previousPrice ? ((change / previousPrice) * 100) : 0;
          
          product.suppliers[supplierKey] = {
            price: item.pricePerUnit,
            date: bill.billDate,
            change: change,
            changePercent: changePercent
          };
        }
      });
    });

    return Array.from(productMap.entries()).map(([productName, data]) => ({
      productName,
      suppliers: data.suppliers
    }));
  };

  return {
    suppliers: transformedSuppliers,
    purchaseBills,
    payments,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addPurchaseBill,
    deletePurchaseBill,
    addPayment,
    deletePayment,
    getSupplierAnalytics,
    getProductComparison
  };
};
