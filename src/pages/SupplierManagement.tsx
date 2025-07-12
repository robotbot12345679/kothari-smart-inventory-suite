import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, BarChart3, Building2, FileText, CreditCard, DollarSign, Receipt } from "lucide-react";
import { useSupplierData } from "@/hooks/useSupplierData";
import SupplierList from "@/components/suppliers/SupplierList";
import SupplierStats from "@/components/suppliers/SupplierStats";
import UploadBillDialog from "@/components/suppliers/UploadBillDialog";
import AddSupplierDialog from "@/components/suppliers/AddSupplierDialog";
import AddPaymentDialog from "@/components/suppliers/AddPaymentDialog";
import ManualAddPaymentDialog from "@/components/suppliers/ManualAddPaymentDialog";
import ManualAddBillDialog from "@/components/suppliers/ManualAddBillDialog";
import PurchaseBillsList from "@/components/suppliers/PurchaseBillsList";
import PaymentsList from "@/components/suppliers/PaymentsList";

const SupplierManagement = () => {
  const {
    suppliers,
    purchaseBills,
    payments,
    addSupplier,
    addPurchaseBill,
    addPayment,
    deletePurchaseBill,
    deletePayment,
    deleteSupplier,
    getSupplierAnalytics
  } = useSupplierData();

  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [addSupplierDialogOpen, setAddSupplierDialogOpen] = useState(false);
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false);
  const [manualAddPaymentDialogOpen, setManualAddPaymentDialogOpen] = useState(false);
  const [manualAddBillDialogOpen, setManualAddBillDialogOpen] = useState(false);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const totalPurchases = purchaseBills.reduce((sum, bill) => sum + bill.total, 0);
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const pendingAmount = totalPurchases - totalPayments;
    const activeSuppliers = suppliers.filter(s => s.isActive).length;

    return {
      totalPurchases,
      totalPayments,
      pendingAmount,
      activeSuppliers,
      totalBills: purchaseBills.length,
      totalPaymentsCount: payments.length
    };
  }, [purchaseBills, payments, suppliers]);

  const handleProductComparison = () => {
    window.open('/product-comparison', '_blank');
  };

  const handleDeleteBill = (billId: string) => {
    deletePurchaseBill(billId);
  };

  const handleDeletePayment = (paymentId: string) => {
    deletePayment(paymentId);
  };

  const handleDeleteSupplier = (supplierId: number) => {
    if (window.confirm('Are you sure you want to delete this supplier? This will also delete all related bills and payments.')) {
      deleteSupplier(supplierId);
      if (selectedSupplier === supplierId) {
        setSelectedSupplier(null);
      }
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
            <div className="text-2xl font-bold">₹{overallStats.totalPurchases.toLocaleString()}</div>
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
            <div className="text-2xl font-bold">₹{overallStats.totalPayments.toLocaleString()}</div>
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
              ₹{overallStats.pendingAmount.toLocaleString()}
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
        />
      </div>

      {/* Quick Add Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover cursor-pointer" onClick={() => setManualAddBillDialogOpen(true)}>
          <CardContent className="p-4 text-center">
            <Receipt className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Add Bill Manually</h3>
            <p className="text-sm text-muted-foreground">Quick bill entry</p>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer" onClick={() => setManualAddPaymentDialogOpen(true)}>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold">Add Payment Manually</h3>
            <p className="text-sm text-muted-foreground">Quick payment entry</p>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer" onClick={() => setUploadDialogOpen(true)}>
          <CardContent className="p-4 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold">Upload Documents</h3>
            <p className="text-sm text-muted-foreground">AI detection</p>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer" onClick={() => setAddSupplierDialogOpen(true)}>
          <CardContent className="p-4 text-center">
            <Building2 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold">Add Supplier</h3>
            <p className="text-sm text-muted-foreground">New supplier</p>
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
                bills={purchaseBills.filter(bill => bill.supplierId === selectedSupplier)}
                onDelete={handleDeleteBill}
              />
            </TabsContent>
            <TabsContent value="payments" className="space-y-4">
              <PaymentsList 
                payments={payments.filter(payment => payment.supplierId === selectedSupplier)}
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
        onUpload={addPurchaseBill}
      />
      
      <AddSupplierDialog 
        open={addSupplierDialogOpen}
        onOpenChange={setAddSupplierDialogOpen}
        onAdd={addSupplier}
      />

      <AddPaymentDialog 
        open={addPaymentDialogOpen}
        onOpenChange={setAddPaymentDialogOpen}
        suppliers={suppliers}
        selectedSupplierId={selectedSupplier}
        onAdd={addPayment}
      />

      <ManualAddPaymentDialog 
        open={manualAddPaymentDialogOpen}
        onOpenChange={setManualAddPaymentDialogOpen}
        suppliers={suppliers}
        selectedSupplierId={selectedSupplier}
        onAdd={addPayment}
      />

      <ManualAddBillDialog 
        open={manualAddBillDialogOpen}
        onOpenChange={setManualAddBillDialogOpen}
        suppliers={suppliers}
        onAdd={addPurchaseBill}
      />
    </div>
  );
};

export default SupplierManagement;
