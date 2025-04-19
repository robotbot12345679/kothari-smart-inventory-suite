
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, PlusCircle, AlertTriangle, Clock, FileDown, FilePlus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const Inventory = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Sample inventory data
  const inventoryItems = [
    {
      id: 1,
      name: "Premium Cashews",
      sku: "CF-001",
      category: "Nuts",
      quantity: 1250,
      unit: "kg",
      unitPrice: 850,
      expiryDate: "2024-12-15",
      status: "In Stock",
    },
    {
      id: 2,
      name: "California Almonds",
      sku: "AM-002",
      category: "Nuts",
      quantity: 950,
      unit: "kg",
      unitPrice: 980,
      expiryDate: "2024-11-20",
      status: "In Stock",
    },
    {
      id: 3,
      name: "Iranian Pistachios",
      sku: "PS-003",
      category: "Nuts",
      quantity: 150,
      unit: "kg",
      unitPrice: 1250,
      expiryDate: "2024-10-05",
      status: "Low Stock",
    },
    {
      id: 4,
      name: "Chilean Walnuts",
      sku: "WN-004",
      category: "Nuts",
      quantity: 750,
      unit: "kg",
      unitPrice: 1100,
      expiryDate: "2024-09-25",
      status: "In Stock",
    },
    {
      id: 5,
      name: "Dried Apricots",
      sku: "DA-005",
      category: "Dried Fruits",
      quantity: 350,
      unit: "kg",
      unitPrice: 750,
      expiryDate: "2024-08-10",
      status: "Low Stock",
    },
    {
      id: 6,
      name: "Mixed Dry Fruits",
      sku: "MD-006",
      category: "Assorted",
      quantity: 800,
      unit: "kg",
      unitPrice: 650,
      expiryDate: "2024-11-15",
      status: "In Stock",
    },
    {
      id: 7,
      name: "Raisins Golden",
      sku: "RG-007",
      category: "Dried Fruits",
      quantity: 650,
      unit: "kg",
      unitPrice: 320,
      expiryDate: "2024-10-20",
      status: "In Stock",
    },
    {
      id: 8,
      name: "Brazil Nuts",
      sku: "BN-008",
      category: "Nuts",
      quantity: 100,
      unit: "kg",
      unitPrice: 1300,
      expiryDate: "2024-07-30",
      status: "Critical Stock",
    },
  ];

  // Function to determine badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "Critical Stock":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "Out of Stock":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    }
  };

  // Filter inventory items based on search and filters
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || 
      item.category.toLowerCase() === categoryFilter.toLowerCase();
    
    const matchesStatus = statusFilter === "all" || 
      item.status.toLowerCase() === statusFilter.toLowerCase().replace('-', ' ');
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your inventory data is being exported.",
    });
    setIsExportDialogOpen(false);
  };

  const handleImport = () => {
    toast({
      title: "Import Completed",
      description: "Your inventory data has been imported successfully.",
    });
    setIsImportDialogOpen(false);
  };

  const handleAddProduct = () => {
    navigate("/products");
    toast({
      title: "Add Product",
      description: "Redirected to product management page.",
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <div className="flex items-center gap-2">
          <Button className="gap-1" variant="outline" onClick={() => setIsExportDialogOpen(true)}>
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-1" variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <FilePlus className="h-4 w-4" />
            Import
          </Button>
          <Button className="gap-1" onClick={handleAddProduct}>
            <PlusCircle className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">384</div>
            <p className="text-xs text-muted-foreground">Across 8 categories</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Products below threshold</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹48,52,750</div>
            <p className="text-xs text-muted-foreground">At current cost price</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="p-4 border-b flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full bg-background pl-8 md:w-96"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Select 
              value={categoryFilter} 
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="nuts">Nuts</SelectItem>
                <SelectItem value="dried fruits">Dried Fruits</SelectItem>
                <SelectItem value="assorted">Assorted</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="critical-stock">Critical Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell className="text-right">₹{item.unitPrice}</TableCell>
                  <TableCell>
                    {new Date(item.expiryDate).toLocaleDateString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="p-4 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredItems.length}</span> of{" "}
            <span className="font-medium">384</span> products
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Inventory Data</DialogTitle>
            <DialogDescription>
              Select the format and options for exporting your inventory data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select defaultValue="csv">
              <SelectTrigger>
                <SelectValue placeholder="Select export format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleExport}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Inventory Data</DialogTitle>
            <DialogDescription>
              Upload a file to import inventory data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input type="file" />
            <p className="text-sm text-muted-foreground">
              Supported formats: CSV, Excel
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
