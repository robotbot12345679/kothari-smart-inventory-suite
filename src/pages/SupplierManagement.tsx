
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, BarChart3, Building2, FileText, CreditCard, DollarSign, Receipt } from "lucide-react";
import { useCloudData } from "@/context/CloudDataContext";
import { formatCurrency } from "@/utils/indianNumberFormat";
import SupplierList from "@/components/suppliers/SupplierList";
import SupplierStats from "@/components/suppliers/SupplierStats";
import UploadBillDialog from "@/components/suppliers/UploadBillDialog";
import AddSupplierDialog from "@/components/suppliers/AddSupplierDialog";
import EditSupplierDialog from "@/components/suppliers/EditSupplierDialog";
import AddPaymentDialog from "@/components/suppliers/AddPaymentDialog";
import ManualAddPaymentDialog from "@/components/suppliers/ManualAddPaymentDialog";
import ManualAddBillDialog from "@/components/suppliers/ManualAddBillDialog";
import QuickAddBillDialog from "@/components/suppliers/QuickAddBillDialog";
import PurchaseBillsList from "@/components/suppliers/PurchaseBillsList";
import PaymentsList from "@/components/suppliers/PaymentsList";
import { Supplier } from "@/types/supplier";

const SupplierManagement = () => {
  const { 
    suppliers, 
    addSupplier, 
    updateSupplier, 
    deleteSupplier,
    addPurchaseBill,
    deletePurchaseBill,
    addPayment,
    deletePayment
  } = useCloudData();

  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [addSupplierDialogOpen, setAddSupplierDialogOpen] = useState(false);
  const [editSupplierDialogOpen, setEditSupplierDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false);
  const [manualAddPaymentDialogOpen, setManualAddPaymentDialogOpen] = useState(false);
  const [manualAddBillDialogOpen, setManualAddBillDialogOpen] = useState(false);
  const [quickAddBillDialogOpen, setQuickAddBillDialogOpen] = useState(false);

  // Calculate supplier stats from their bills and payments
  const getSupplierAnalytics = (supplier: any) => {
    const bills = supplier.bills || [];
    const payments = supplier.payments || [];
    
    const totalPurchases = bills.reduce((sum: number, bill: any) => sum + (bill.total || 0), 0);
    const totalPayments = payments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
    const pendingAmount = totalPurchases - totalPayments;
    
      const lastBillDate = bills.length > 0 ? bills[bills.length - 1]?.billDate : null;
    const lastPaymentDate = payments.length > 0 ? payments[payments.length - 1]?.paymentDate : null;
    
    return {
      totalPurchases,
      totalPayments,
      pendingAmount,
      lastBillDate,
      lastPaymentDate,
      billCount: bills.length,
      paymentCount: payments.length
    };
  };
  
  const overallStats = useMemo(() => {
    let totalPurchases = 0;
    let totalPayments = 0;
    let totalPendingAmount = 0;
    
    suppliers.forEach(supplier => {
      const bills = supplier.bills || [];
      const payments = supplier.payments || [];
      
      const supplierTotalPurchases = bills.reduce((sum: number, bill: any) => sum + (bill.total || 0), 0);
      const supplierTotalPayments = payments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
      
      totalPurchases += supplierTotalPurchases;
      totalPayments += supplierTotalPayments;
      totalPendingAmount += (supplierTotalPurchases - supplierTotalPayments);
    });
    
    const activeSuppliers = suppliers.filter(s => s.bills?.length > 0 || s.payments?.length > 0).length;
    const totalBills = suppliers.reduce((sum, s) => sum + (s.bills?.length || 0), 0);
    const totalPaymentsCount = suppliers.reduce((sum, s) => sum + (s.payments?.length || 0), 0);

    return {
      totalPurchases,
      totalPayments,
      pendingAmount: totalPendingAmount,
      activeSuppliers,
      totalBills,
      totalPaymentsCount
    };
  }, [suppliers]);

  const handleProductComparison = () => {
    window.open('/product-comparison', '_blank');
  };

  const handleDeleteBill = (billId: string) => {
    if (selectedSupplier) {
      deletePurchaseBill(selectedSupplier, billId);
    }
  };

  const handleDeletePayment = (paymentId: string) => {
    if (selectedSupplier) {
      deletePayment(selectedSupplier, paymentId);
    }
  };

  const handleDeleteSupplier = (supplierId: string) => {
    if (window.confirm('Are you sure you want to delete this supplier? This will also delete all related bills and payments.')) {
      deleteSupplier(supplierId);
      if (selectedSupplier === supplierId) {
        setSelectedSupplier(null);
      }
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setEditSupplierDialogOpen(true);
  };

  const handleUpdateSupplier = (id: string, updatedSupplier: Partial<Supplier>) => {
    updateSupplier(id, updatedSupplier);
  };

  const handleAddSupplierWithPendingAmount = async (supplierData: any, pendingAmount: number) => {
    await addSupplier(supplierData);
    
    // Get the newly added supplier to get its ID
    const newSupplier = suppliers[suppliers.length - 1];
    
    // Add a bill for the pending amount
    if (pendingAmount > 0 && newSupplier) {
      const pendingBill = {
        id: `PENDING-${Date.now()}`,
        supplierId: newSupplier.id,
        supplierName: newSupplier.name,
        billNumber: `PENDING-${Date.now()}`,
        billDate: new Date().toISOString().split('T')[0],
        items: [{
          productName: "Opening Balance",
          quantity: 1,
          unit: "amount",
          pricePerUnit: pendingAmount,
          totalPrice: pendingAmount
        }],
        subtotal: pendingAmount,
        gst: 0,
        total: pendingAmount,
        status: 'Pending' as const,
        createdDate: new Date().toISOString()
      };
      await addPurchaseBill(newSupplier.id, pendingBill);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Supplier Management</h1>
        <div className="flex gap-2">
          <Button 
            onClick={handleProductComparison}
            variant="outline"
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Compare Product Prices
          </Button>
          <Button 
            onClick={() => setUploadDialogOpen(true)}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Documents
          </Button>
        </div>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overallStats.totalPurchases)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {overallStats.totalBills} bills
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overallStats.totalPayments)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overallStats.totalPaymentsCount} payments made
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Building2 className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(overallStats.pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Outstanding payments
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.activeSuppliers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered suppliers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Selection and Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Suppliers</h2>
          <Button 
            onClick={() => setAddSupplierDialogOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Supplier
          </Button>
        </div>

        <SupplierList 
          suppliers={suppliers}
          selectedSupplier={selectedSupplier}
          onSelectSupplier={setSelectedSupplier}
          onDeleteSupplier={handleDeleteSupplier}
          onEditSupplier={handleEditSupplier}
        />
      </div>

      {/* Quick Add Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="card-hover cursor-pointer" onClick={() => setQuickAddBillDialogOpen(true)}>
          <CardContent className="p-4 text-center">
            <Receipt className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold">Quick Add Bill</h3>
            <p className="text-sm text-muted-foreground">Just total amount</p>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer" onClick={() => setManualAddBillDialogOpen(true)}>
          <CardContent className="p-4 text-center">
            <Receipt className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Detailed Bill</h3>
            <p className="text-sm text-muted-foreground">With items</p>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer" onClick={() => setManualAddPaymentDialogOpen(true)}>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold">Add Payment</h3>
            <p className="text-sm text-muted-foreground">Manual entry</p>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer" onClick={() => setUploadDialogOpen(true)}>
          <CardContent className="p-4 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-amber-600" />
            <h3 className="font-semibold">Upload Documents</h3>
            <p className="text-sm text-muted-foreground">AI detection</p>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer" onClick={() => setAddSupplierDialogOpen(true)}>
          <CardContent className="p-4 text-center">
            <Building2 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold">Add Supplier</h3>
            <p className="text-sm text-muted-foreground">With pending amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Selected Supplier Details */}
      {selectedSupplier && (
        <div className="space-y-6">
          <SupplierStats 
            supplier={suppliers.find(s => s.id === selectedSupplier)!}
            analytics={getSupplierAnalytics(selectedSupplier)}
            onAddPayment={() => setAddPaymentDialogOpen(true)}
          />

          <Tabs defaultValue="bills" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bills">Purchase Bills</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            <TabsContent value="bills" className="space-y-4">
              <PurchaseBillsList 
                bills={suppliers.find(s => s.id === selectedSupplier)?.bills || []}
                onDelete={handleDeleteBill}
              />
            </TabsContent>
            <TabsContent value="payments" className="space-y-4">
              <PaymentsList 
                payments={suppliers.find(s => s.id === selectedSupplier)?.payments || []}
                onDelete={handleDeletePayment}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Dialogs */}
      <UploadBillDialog 
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        suppliers={suppliers}
        onUpload={(bill) => addPurchaseBill(bill.supplierId, bill)}
      />
      
      <AddSupplierDialog 
        open={addSupplierDialogOpen}
        onOpenChange={setAddSupplierDialogOpen}
        onAdd={addSupplier}
        onAddWithPendingAmount={handleAddSupplierWithPendingAmount}
      />

      <EditSupplierDialog 
        open={editSupplierDialogOpen}
        onOpenChange={setEditSupplierDialogOpen}
        supplier={editingSupplier}
        onUpdate={handleUpdateSupplier}
      />

      <AddPaymentDialog 
        open={addPaymentDialogOpen}
        onOpenChange={setAddPaymentDialogOpen}
        suppliers={suppliers}
        selectedSupplierId={selectedSupplier}
        onAdd={(payment) => addPayment(payment.supplierId, payment)}
      />

      <ManualAddPaymentDialog 
        open={manualAddPaymentDialogOpen}
        onOpenChange={setManualAddPaymentDialogOpen}
        suppliers={suppliers}
        selectedSupplierId={selectedSupplier}
        onAdd={(payment) => addPayment(payment.supplierId, payment)}
      />

      <ManualAddBillDialog 
        open={manualAddBillDialogOpen}
        onOpenChange={setManualAddBillDialogOpen}
        suppliers={suppliers}
        onAdd={(bill) => addPurchaseBill(bill.supplierId, bill)}
      />

      <QuickAddBillDialog 
        open={quickAddBillDialogOpen}
        onOpenChange={setQuickAddBillDialogOpen}
        suppliers={suppliers}
        selectedSupplierId={selectedSupplier}
        onAdd={(bill) => addPurchaseBill(bill.supplierId, bill)}
      />
    </div>
  );
};

export default SupplierManagement;
