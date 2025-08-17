import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Supplier, 
  PurchaseBill, 
  Payment, 
  ProductPriceHistory, 
  SupplierAnalytics 
} from "@/types/supplier";

export const useSupplierData = () => {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseBills, setPurchaseBills] = useState<PurchaseBill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [productPriceHistory, setProductPriceHistory] = useState<ProductPriceHistory[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSuppliers = localStorage.getItem("suppliers");
    const savedPurchaseBills = localStorage.getItem("purchaseBills");
    const savedPayments = localStorage.getItem("supplierPayments");
    const savedPriceHistory = localStorage.getItem("productPriceHistory");

    if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
    if (savedPurchaseBills) setPurchaseBills(JSON.parse(savedPurchaseBills));
    if (savedPayments) setPayments(JSON.parse(savedPayments));
    if (savedPriceHistory) setProductPriceHistory(JSON.parse(savedPriceHistory));
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("suppliers", JSON.stringify(suppliers));
    localStorage.setItem("purchaseBills", JSON.stringify(purchaseBills));
    localStorage.setItem("supplierPayments", JSON.stringify(payments));
    localStorage.setItem("productPriceHistory", JSON.stringify(productPriceHistory));
  }, [suppliers, purchaseBills, payments, productPriceHistory]);

  const addSupplier = (supplier: Omit<Supplier, 'id' | 'createdDate'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: Math.max(0, ...suppliers.map(s => s.id)) + 1,
      createdDate: new Date().toISOString()
    };
    
    setSuppliers(prev => [...prev, newSupplier]);
    toast({
      title: "Supplier Added",
      description: `${supplier.name} has been added successfully.`,
    });
    
    return newSupplier;
  };

  const updateSupplier = (id: number, updatedSupplier: Omit<Supplier, 'id' | 'createdDate'>) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === id 
        ? { ...supplier, ...updatedSupplier }
        : supplier
    ));
    
    // Update supplier name in related bills and payments
    setPurchaseBills(prev => prev.map(bill => 
      bill.supplierId === id 
        ? { ...bill, supplierName: updatedSupplier.name }
        : bill
    ));
    
    setPayments(prev => prev.map(payment => 
      payment.supplierId === id 
        ? { ...payment, supplierName: updatedSupplier.name }
        : payment
    ));
    
    setProductPriceHistory(prev => prev.map(history => 
      history.supplierId === id 
        ? { ...history, supplierName: updatedSupplier.name }
        : history
    ));
    
    toast({
      title: "Supplier Updated",
      description: `${updatedSupplier.name} has been updated successfully.`,
    });
  };

  const deleteSupplier = (supplierId: number) => {
    setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    // Also delete related bills and payments
    setPurchaseBills(prev => prev.filter(b => b.supplierId !== supplierId));
    setPayments(prev => prev.filter(p => p.supplierId !== supplierId));
    setProductPriceHistory(prev => prev.filter(p => p.supplierId !== supplierId));
    
    toast({
      title: "Supplier Deleted",
      description: "Supplier and all related data has been deleted.",
    });
  };

  const addPurchaseBill = (bill: Omit<PurchaseBill, 'id' | 'createdDate'>) => {
    const newBill: PurchaseBill = {
      ...bill,
      id: `PB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date().toISOString()
    };
    
    setPurchaseBills(prev => [...prev, newBill]);
    
    // Update product price history
    const priceHistoryEntries: ProductPriceHistory[] = bill.items.map(item => ({
      productName: item.productName,
      supplierId: bill.supplierId,
      supplierName: bill.supplierName,
      price: item.pricePerUnit,
      date: bill.billDate,
      billId: newBill.id
    }));
    
    setProductPriceHistory(prev => [...prev, ...priceHistoryEntries]);
    
    toast({
      title: "Purchase Bill Added",
      description: `Bill from ${bill.supplierName} has been recorded.`,
    });
    
    return newBill;
  };

  const deletePurchaseBill = (billId: string) => {
    setPurchaseBills(prev => prev.filter(b => b.id !== billId));
    setProductPriceHistory(prev => prev.filter(p => p.billId !== billId));
    
    toast({
      title: "Bill Deleted",
      description: "Purchase bill has been deleted successfully.",
    });
  };

  const addPayment = (payment: Omit<Payment, 'id' | 'createdDate'>) => {
    const newPayment: Payment = {
      ...payment,
      id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date().toISOString()
    };
    
    setPayments(prev => [...prev, newPayment]);
    toast({
      title: "Payment Recorded",
      description: `Payment of ₹${payment.amount} to ${payment.supplierName} has been recorded.`,
    });
    
    return newPayment;
  };

  const deletePayment = (paymentId: string) => {
    setPayments(prev => prev.filter(p => p.id !== paymentId));
    
    toast({
      title: "Payment Deleted",
      description: "Payment has been deleted successfully.",
    });
  };

  const getSupplierAnalytics = (supplierId: number): SupplierAnalytics => {
    const supplier = suppliers.find(s => s.id === supplierId);
    const supplierBills = purchaseBills.filter(bill => bill.supplierId === supplierId);
    const supplierPayments = payments.filter(payment => payment.supplierId === supplierId);
    
    const totalPurchases = supplierBills.reduce((sum, bill) => sum + bill.total, 0);
    const totalPayments = supplierPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const calculatedPending = totalPurchases - totalPayments;
    
    // Priority: use manual adjustment if set, otherwise use calculated pending
    let finalPendingAmount = calculatedPending;
    if (supplier?.pendingAmountAdjustment !== undefined && supplier.pendingAmountAdjustment !== null) {
      finalPendingAmount = supplier.pendingAmountAdjustment;
    }
    
    console.log(`Analytics for ${supplier?.name}: Bills=${totalPurchases}, Payments=${totalPayments}, Calculated=${calculatedPending}, Manual=${supplier?.pendingAmountAdjustment}, Final=${finalPendingAmount}`);
    
    const lastBillDate = supplierBills.length > 0 
      ? supplierBills.sort((a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime())[0].billDate
      : undefined;
    
    const lastPaymentDate = supplierPayments.length > 0
      ? supplierPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0].paymentDate
      : undefined;

    return {
      totalPurchases,
      totalPayments,
      pendingAmount: finalPendingAmount,
      lastBillDate,
      lastPaymentDate,
      billCount: supplierBills.length,
      paymentCount: supplierPayments.length
    };
  };

  const getProductComparison = () => {
    const productMap = new Map<string, {
      suppliers: { [key: string]: { price: number; date: string; change?: number; changePercent?: number } }
    }>();

    // Group price history by product
    productPriceHistory.forEach(entry => {
      if (!productMap.has(entry.productName)) {
        productMap.set(entry.productName, { suppliers: {} });
      }
      
      const product = productMap.get(entry.productName)!;
      const supplierKey = `${entry.supplierId}-${entry.supplierName}`;
      
      // Keep only the latest price for each supplier
      if (!product.suppliers[supplierKey] || new Date(entry.date) > new Date(product.suppliers[supplierKey].date)) {
        const previousPrice = product.suppliers[supplierKey]?.price;
        const change = previousPrice ? entry.price - previousPrice : 0;
        const changePercent = previousPrice ? ((change / previousPrice) * 100) : 0;
        
        product.suppliers[supplierKey] = {
          price: entry.price,
          date: entry.date,
          change: change,
          changePercent: changePercent
        };
      }
    });

    return Array.from(productMap.entries()).map(([productName, data]) => ({
      productName,
      suppliers: data.suppliers
    }));
  };

  return {
    suppliers,
    purchaseBills,
    payments,
    productPriceHistory,
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
