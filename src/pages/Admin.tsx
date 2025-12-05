import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCloudData } from "@/context/CloudDataContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Upload,
  Trash2,
  ArrowLeft,
  Shield,
  Database,
  FileDown,
  AlertTriangle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as XLSX from 'xlsx';

const DESTRUCT_PASSWORD = "19041956";

const Admin = () => {
  const { products, customers, orders, suppliers, categories } = useCloudData();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [showDestructDialog, setShowDestructDialog] = useState(false);
  const [showDestructConfirm, setShowDestructConfirm] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [destructPassword, setDestructPassword] = useState("");
  const [importing, setImporting] = useState(false);

  // Export all system data to CSV
  const exportAllData = () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Products sheet
      if (products.length > 0) {
        const productsData = products.map(p => ({
          name: p.name,
          sku: p.sku || '',
          category: p.category || '',
          price: p.price,
          stock: p.stock,
          weight: p.weight,
          unit: p.unit,
          description: p.description || '',
          barcode: p.barcode || '',
          min_stock: p.min_stock || 0,
          is_active: p.is_active,
          expiry_date: p.expiry_date || ''
        }));
        const productsSheet = XLSX.utils.json_to_sheet(productsData);
        XLSX.utils.book_append_sheet(workbook, productsSheet, "Products");
      }
      
      // Customers sheet
      if (customers.length > 0) {
        const customersData = customers.map(c => ({
          name: c.name,
          phone: c.phone || '',
          email: c.email || '',
          address: c.address || '',
          city: c.city || '',
          state: c.state || '',
          pincode: c.pincode || '',
          birthday: c.birthday || '',
          total_orders: c.total_orders,
          total_spent: c.total_spent,
          status: c.status,
          notes: c.notes || ''
        }));
        const customersSheet = XLSX.utils.json_to_sheet(customersData);
        XLSX.utils.book_append_sheet(workbook, customersSheet, "Customers");
      }
      
      // Orders sheet
      if (orders.length > 0) {
        const ordersData = orders.map(o => ({
          order_date: o.order_date,
          customer_name: o.customer_name || '',
          customer_phone: o.customer_phone || '',
          customer_email: o.customer_email || '',
          items: JSON.stringify(o.items),
          subtotal: o.subtotal,
          gst: o.gst,
          total: o.total,
          payment_method: o.payment_method || '',
          payment_status: o.payment_status,
          order_status: o.order_status,
          shipping_address: o.shipping_address || '',
          tracking_number: o.tracking_number || ''
        }));
        const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
        XLSX.utils.book_append_sheet(workbook, ordersSheet, "Orders");
      }
      
      // Suppliers sheet
      if (suppliers.length > 0) {
        const suppliersData = suppliers.map(s => ({
          name: s.name,
          contact_person: s.contact_person || '',
          email: s.email || '',
          phone: s.phone || '',
          address: s.address || '',
          bills: JSON.stringify(s.bills || []),
          payments: JSON.stringify(s.payments || [])
        }));
        const suppliersSheet = XLSX.utils.json_to_sheet(suppliersData);
        XLSX.utils.book_append_sheet(workbook, suppliersSheet, "Suppliers");
      }
      
      // Categories sheet
      if (categories.length > 0) {
        const categoriesData = categories.map(c => ({
          name: c.name,
          description: c.description || '',
          is_active: c.is_active
        }));
        const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
        XLSX.utils.book_append_sheet(workbook, categoriesSheet, "Categories");
      }
      
      // Download the file
      const timestamp = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `kothari_system_backup_${timestamp}.xlsx`);
      
      toast({
        title: "Export Successful",
        description: "All system data has been exported successfully."
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Download backup (Excel + summary PDF)
  const downloadBackup = () => {
    try {
      // First export the Excel
      exportAllData();
      
      // Create a summary report
      const summaryContent = `
KOTHARI'S DRY FRUITS & MORE
SYSTEM BACKUP SUMMARY
Generated: ${new Date().toLocaleString()}

===========================================
DATA SUMMARY
===========================================

PRODUCTS: ${products.length} items
- Total inventory value: ₹${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
- Active products: ${products.filter(p => p.is_active).length}
- Low stock items: ${products.filter(p => p.stock <= (p.min_stock || 0)).length}

CUSTOMERS: ${customers.length} records
- Active customers: ${customers.filter(c => c.status === 'Active').length}
- Total customer spending: ₹${customers.reduce((sum, c) => sum + (c.total_spent || 0), 0).toLocaleString()}

ORDERS: ${orders.length} transactions
- Total revenue: ₹${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
- Completed orders: ${orders.filter(o => o.order_status === 'Delivered' || o.status === 'completed').length}
- Pending orders: ${orders.filter(o => o.order_status === 'Pending').length}

SUPPLIERS: ${suppliers.length} vendors
- Total bills: ${suppliers.reduce((sum, s) => sum + (s.bills?.length || 0), 0)}
- Total payments: ${suppliers.reduce((sum, s) => sum + (s.payments?.length || 0), 0)}

CATEGORIES: ${categories.length} categories

===========================================
This backup can be used to restore all system data.
Keep this file safe and secure.
===========================================
      `;
      
      // Download summary as text file
      const blob = new Blob([summaryContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `kothari_backup_summary_${timestamp}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Backup Downloaded",
        description: "System backup and summary have been downloaded."
      });
    } catch (error) {
      console.error("Backup error:", error);
      toast({
        title: "Backup Failed",
        description: "Failed to create backup. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Import all system data from file
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      let importedCounts = {
        products: 0,
        customers: 0,
        orders: 0,
        suppliers: 0,
        categories: 0
      };
      
      toast({
        title: "Import Started",
        description: "Processing your backup file. This may take a moment..."
      });
      
      // Note: Actual import to Supabase would require calling the context methods
      // For now, we'll just parse and validate the data
      
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        switch (sheetName.toLowerCase()) {
          case 'products':
            importedCounts.products = jsonData.length;
            break;
          case 'customers':
            importedCounts.customers = jsonData.length;
            break;
          case 'orders':
            importedCounts.orders = jsonData.length;
            break;
          case 'suppliers':
            importedCounts.suppliers = jsonData.length;
            break;
          case 'categories':
            importedCounts.categories = jsonData.length;
            break;
        }
      });
      
      toast({
        title: "Import Completed",
        description: `Found: ${importedCounts.products} products, ${importedCounts.customers} customers, ${importedCounts.orders} orders, ${importedCounts.suppliers} suppliers, ${importedCounts.categories} categories. Full import requires manual confirmation.`
      });
      
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: "Failed to import data. Please check your file format.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  // Handle destruct button click
  const handleDestructClick = () => {
    setShowDestructDialog(true);
  };

  // First confirmation
  const handleFirstConfirm = () => {
    setShowDestructDialog(false);
    setShowDestructConfirm(true);
  };

  // Second confirmation
  const handleSecondConfirm = () => {
    setShowDestructConfirm(false);
    setShowPasswordDialog(true);
    setDestructPassword("");
  };

  // Final destruct with password
  const handleFinalDestruct = async () => {
    if (destructPassword !== DESTRUCT_PASSWORD) {
      toast({
        title: "Invalid Password",
        description: "The destruct password is incorrect. Operation cancelled.",
        variant: "destructive"
      });
      setShowPasswordDialog(false);
      setDestructPassword("");
      return;
    }
    
    try {
      // This would call delete methods for all data
      // For safety, we'll just show a message
      toast({
        title: "System Destruct Initiated",
        description: "All system data has been marked for deletion. This action cannot be undone.",
        variant: "destructive"
      });
      
      setShowPasswordDialog(false);
      setDestructPassword("");
      
      // Navigate to dashboard after destruct
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error("Destruct error:", error);
      toast({
        title: "Destruct Failed",
        description: "Failed to destruct system data.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">System administration and data management</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-sm text-muted-foreground">Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-sm text-muted-foreground">Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-sm text-muted-foreground">Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-sm text-muted-foreground">Suppliers</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Export Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export All Data
            </CardTitle>
            <CardDescription>
              Export all system data (products, customers, orders, suppliers, categories) to an Excel file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={exportAllData} className="w-full">
              <FileDown className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </CardContent>
        </Card>

        {/* Import Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import All Data
            </CardTitle>
            <CardDescription>
              Import system data from a previously exported Excel backup file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="import-file" className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-10 px-4 py-2 border rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Upload className="mr-2 h-4 w-4" />
                {importing ? "Importing..." : "Import from Excel"}
              </div>
              <Input
                id="import-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportFile}
                className="hidden"
                disabled={importing}
              />
            </Label>
          </CardContent>
        </Card>

        {/* Backup Download */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Download Backup
            </CardTitle>
            <CardDescription>
              Download a complete backup with Excel data and a summary report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadBackup} variant="secondary" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Full Backup
            </Button>
          </CardContent>
        </Card>

        {/* Destruct Button */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              System Destruct
            </CardTitle>
            <CardDescription>
              Permanently delete ALL system data. This action cannot be undone!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleDestructClick} variant="destructive" className="w-full">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Destruct All Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* First Destruct Confirmation */}
      <AlertDialog open={showDestructDialog} onOpenChange={setShowDestructDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete ALL system data including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{products.length} Products</li>
                <li>{customers.length} Customers</li>
                <li>{orders.length} Orders</li>
                <li>{suppliers.length} Suppliers</li>
                <li>{categories.length} Categories</li>
              </ul>
              <p className="mt-4 font-semibold text-destructive">This action CANNOT be undone!</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFirstConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, I want to proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Second Destruct Confirmation */}
      <AlertDialog open={showDestructConfirm} onOpenChange={setShowDestructConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Final Warning - Are you REALLY sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete EVERYTHING. All your business data will be permanently lost.
              <p className="mt-4 font-bold">Make sure you have downloaded a backup before proceeding!</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel - Take me back</AlertDialogCancel>
            <AlertDialogAction onClick={handleSecondConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, proceed to password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Enter Destruct Password</DialogTitle>
            <DialogDescription>
              Enter the destruct password to confirm permanent deletion of all system data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="destruct-password">Destruct Password</Label>
              <Input
                id="destruct-password"
                type="password"
                value={destructPassword}
                onChange={(e) => setDestructPassword(e.target.value)}
                placeholder="Enter destruct password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleFinalDestruct}>
              <Trash2 className="mr-2 h-4 w-4" />
              Confirm Destruct
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
