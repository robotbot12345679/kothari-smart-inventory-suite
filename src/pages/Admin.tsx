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
  AlertTriangle,
  LogOut
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
import { supabase } from "@/integrations/supabase/client";

const DESTRUCT_PASSWORD = "75677";
const ADMIN_PASSWORD = "4646";

const Admin = () => {
  const { products, customers, orders, suppliers, categories, user, addProduct, addCustomer, addOrder, addSupplier, addCategory } = useCloudData();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showDestructDialog, setShowDestructDialog] = useState(false);
  const [showDestructConfirm, setShowDestructConfirm] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [destructPassword, setDestructPassword] = useState("");
  const [importing, setImporting] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAdminPassword("");
    } else {
      toast({ title: "Access Denied", description: "Incorrect admin password", variant: "destructive" });
      setAdminPassword("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter the admin password to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-pw">Admin Password</Label>
                <Input
                  id="admin-pw"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full">Unlock Admin Panel</Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Export all system data to Excel
  const exportAllData = () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      if (products.length > 0) {
        const productsData = products.map(p => ({
          name: p.name, sku: p.sku || '', category: p.category || '', price: p.price,
          stock: p.stock, weight: p.weight, unit: p.unit, description: p.description || '',
          barcode: p.barcode || '', min_stock: p.min_stock || 0, is_active: p.is_active,
          expiry_date: p.expiry_date || ''
        }));
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(productsData), "Products");
      }
      
      if (customers.length > 0) {
        const customersData = customers.map(c => ({
          name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '',
          city: c.city || '', state: c.state || '', pincode: c.pincode || '',
          birthday: c.birthday || '', total_orders: c.total_orders, total_spent: c.total_spent,
          status: c.status, notes: c.notes || ''
        }));
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(customersData), "Customers");
      }
      
      if (orders.length > 0) {
        const ordersData = orders.map(o => ({
          order_date: o.order_date, customer_name: o.customer_name || '',
          customer_phone: o.customer_phone || '', customer_email: o.customer_email || '',
          items: JSON.stringify(o.items), subtotal: o.subtotal, gst: o.gst, total: o.total,
          payment_method: o.payment_method || '', payment_status: o.payment_status,
          order_status: o.order_status, shipping_address: o.shipping_address || '',
          tracking_number: o.tracking_number || ''
        }));
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(ordersData), "Orders");
      }
      
      if (suppliers.length > 0) {
        const suppliersData = suppliers.map(s => ({
          name: s.name, contact_person: s.contact_person || '', email: s.email || '',
          phone: s.phone || '', address: s.address || '',
          bills: JSON.stringify(s.bills || []), payments: JSON.stringify(s.payments || [])
        }));
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(suppliersData), "Suppliers");
      }
      
      if (categories.length > 0) {
        const categoriesData = categories.map(c => ({
          name: c.name, description: c.description || '', is_active: c.is_active
        }));
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(categoriesData), "Categories");
      }
      
      const timestamp = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `kothari_system_backup_${timestamp}.xlsx`);
      toast({ title: "Export Successful", description: "All system data has been exported successfully." });
    } catch (error) {
      console.error("Export error:", error);
      toast({ title: "Export Failed", description: "Failed to export data.", variant: "destructive" });
    }
  };

  const downloadBackup = () => {
    try {
      exportAllData();
      const summaryContent = `
KOTHARI'S DRY FRUITS & MORE - SYSTEM BACKUP SUMMARY
Generated: ${new Date().toLocaleString()}
===========================================
PRODUCTS: ${products.length} items
CUSTOMERS: ${customers.length} records
ORDERS: ${orders.length} transactions
SUPPLIERS: ${suppliers.length} vendors
CATEGORIES: ${categories.length} categories
===========================================`;
      
      const blob = new Blob([summaryContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kothari_backup_summary_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Backup Downloaded", description: "System backup and summary have been downloaded." });
    } catch (error) {
      toast({ title: "Backup Failed", description: "Failed to create backup.", variant: "destructive" });
    }
  };

  // Import all system data - NO manual confirmation needed
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      let importedCounts = { products: 0, customers: 0, orders: 0, suppliers: 0, categories: 0 };
      
      toast({ title: "Import Started", description: "Processing your backup file..." });
      
      // Import Categories first
      if (workbook.SheetNames.includes('Categories')) {
        const sheet = workbook.Sheets['Categories'];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];
        for (const item of jsonData) {
          try {
            await addCategory(item.name);
            importedCounts.categories++;
          } catch (err) { /* skip duplicates */ }
        }
      }

      // Import Products
      if (workbook.SheetNames.includes('Products')) {
        const sheet = workbook.Sheets['Products'];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];
        for (const item of jsonData) {
          try {
            await addProduct({
              name: item.name || 'Unknown',
              price: Number(item.price) || 0,
              stock: Number(item.stock) || 0,
              weight: Number(item.weight) || 0,
              unit: item.unit || 'kg',
              category: item.category || '',
              sku: item.sku || '',
              barcode: item.barcode || '',
              description: item.description || '',
              min_stock: Number(item.min_stock) || 0,
              is_active: item.is_active !== false,
              price_includes_gst: item.price_includes_gst || false,
              expiry_date: item.expiry_date || '',
            });
            importedCounts.products++;
          } catch (err) { console.error('Product import error:', err); }
        }
      }

      // Import Customers
      if (workbook.SheetNames.includes('Customers')) {
        const sheet = workbook.Sheets['Customers'];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];
        for (const item of jsonData) {
          try {
            await addCustomer({
              name: item.name || 'Unknown',
              phone: item.phone?.toString() || '',
              email: item.email || '',
              address: item.address || '',
              city: item.city || '',
              state: item.state || '',
              pincode: item.pincode?.toString() || '',
              birthday: item.birthday || '',
              total_orders: Number(item.total_orders) || 0,
              total_spent: Number(item.total_spent) || 0,
              status: item.status || 'Active',
              notes: item.notes || '',
              order_history: [],
            });
            importedCounts.customers++;
          } catch (err) { console.error('Customer import error:', err); }
        }
      }

      // Import Orders
      if (workbook.SheetNames.includes('Orders')) {
        const sheet = workbook.Sheets['Orders'];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];
        for (const item of jsonData) {
          try {
            let items = [];
            try { items = JSON.parse(item.items || '[]'); } catch { items = []; }
            await addOrder({
              order_date: item.order_date || new Date().toISOString().split('T')[0],
              customer_name: item.customer_name || '',
              customer_phone: item.customer_phone?.toString() || '',
              customer_email: item.customer_email || '',
              items,
              subtotal: Number(item.subtotal) || 0,
              gst: Number(item.gst) || 0,
              total: Number(item.total) || 0,
              payment_method: item.payment_method || '',
              payment_status: item.payment_status || 'Pending',
              order_status: item.order_status || 'Pending',
              status: item.status || 'pending',
              shipping_address: item.shipping_address || '',
              tracking_number: item.tracking_number || '',
            });
            importedCounts.orders++;
          } catch (err) { console.error('Order import error:', err); }
        }
      }

      // Import Suppliers
      if (workbook.SheetNames.includes('Suppliers')) {
        const sheet = workbook.Sheets['Suppliers'];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];
        for (const item of jsonData) {
          try {
            let bills = [], payments = [];
            try { bills = JSON.parse(item.bills || '[]'); } catch { bills = []; }
            try { payments = JSON.parse(item.payments || '[]'); } catch { payments = []; }
            await addSupplier({
              name: item.name || 'Unknown',
              contact_person: item.contact_person || '',
              email: item.email || '',
              phone: item.phone?.toString() || '',
              address: item.address || '',
              bills,
              payments,
            });
            importedCounts.suppliers++;
          } catch (err) { console.error('Supplier import error:', err); }
        }
      }
      
      toast({
        title: "Import Completed",
        description: `Imported: ${importedCounts.products} products, ${importedCounts.customers} customers, ${importedCounts.orders} orders, ${importedCounts.suppliers} suppliers, ${importedCounts.categories} categories.`
      });
      
    } catch (error) {
      console.error("Import error:", error);
      toast({ title: "Import Failed", description: "Failed to import data. Check file format.", variant: "destructive" });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleDestructClick = () => setShowDestructDialog(true);
  const handleFirstConfirm = () => { setShowDestructDialog(false); setShowDestructConfirm(true); };
  const handleSecondConfirm = () => { setShowDestructConfirm(false); setShowPasswordDialog(true); setDestructPassword(""); };

  const handleFinalDestruct = async () => {
    if (destructPassword !== DESTRUCT_PASSWORD) {
      toast({ title: "Invalid Password", description: "The destruct password is incorrect.", variant: "destructive" });
      setShowPasswordDialog(false);
      setDestructPassword("");
      return;
    }
    
    try {
      // Delete all data from all tables
      await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('suppliers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      toast({ title: "System Destruct Complete", description: "All system data has been permanently deleted.", variant: "destructive" });
      setShowPasswordDialog(false);
      setDestructPassword("");
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error("Destruct error:", error);
      toast({ title: "Destruct Failed", description: "Failed to destruct system data.", variant: "destructive" });
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
          <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{products.length}</div><p className="text-sm text-muted-foreground">Products</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{customers.length}</div><p className="text-sm text-muted-foreground">Customers</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{orders.length}</div><p className="text-sm text-muted-foreground">Orders</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{suppliers.length}</div><p className="text-sm text-muted-foreground">Suppliers</p></CardContent></Card>
      </div>

      {/* Admin Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" />Export All Data</CardTitle>
            <CardDescription>Export all system data to Excel</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={exportAllData} className="w-full"><FileDown className="mr-2 h-4 w-4" />Export to Excel</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Import All Data</CardTitle>
            <CardDescription>Import from Excel backup (auto-imports immediately)</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="import-file" className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-10 px-4 py-2 border rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Upload className="mr-2 h-4 w-4" />{importing ? "Importing..." : "Import from Excel"}
              </div>
              <Input id="import-file" type="file" accept=".xlsx,.xls" onChange={handleImportFile} className="hidden" disabled={importing} />
            </Label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" />Download Backup</CardTitle>
            <CardDescription>Download Excel data + summary report</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadBackup} variant="secondary" className="w-full"><Download className="mr-2 h-4 w-4" />Download Full Backup</Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><Trash2 className="h-5 w-5" />System Destruct</CardTitle>
            <CardDescription>Permanently delete ALL system data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleDestructClick} variant="destructive" className="w-full"><AlertTriangle className="mr-2 h-4 w-4" />Destruct All Data</Button>
          </CardContent>
        </Card>
      </div>

      {/* Logout Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LogOut className="h-5 w-5" />Session Management</CardTitle>
          <CardDescription>Logout from this device. Other devices will remain logged in.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />Logout from this Device
          </Button>
        </CardContent>
      </Card>

      {/* Destruct Dialogs */}
      <AlertDialog open={showDestructDialog} onOpenChange={setShowDestructDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" />Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete ALL system data including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{products.length} Products</li><li>{customers.length} Customers</li>
                <li>{orders.length} Orders</li><li>{suppliers.length} Suppliers</li><li>{categories.length} Categories</li>
              </ul>
              <p className="mt-4 font-semibold text-destructive">This action CANNOT be undone!</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFirstConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Yes, I want to proceed</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDestructConfirm} onOpenChange={setShowDestructConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Final Warning</AlertDialogTitle>
            <AlertDialogDescription>All your business data will be permanently lost.<p className="mt-4 font-bold">Make sure you have downloaded a backup!</p></AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSecondConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Proceed to password</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Enter Destruct Password</DialogTitle>
            <DialogDescription>Enter the password to confirm permanent deletion.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="destruct-password">Destruct Password</Label>
              <Input id="destruct-password" type="password" value={destructPassword} onChange={(e) => setDestructPassword(e.target.value)} placeholder="Enter destruct password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleFinalDestruct}><Trash2 className="mr-2 h-4 w-4" />Confirm Destruct</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
