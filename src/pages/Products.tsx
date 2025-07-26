
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, FileText, Download, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/products/ProductCard";
import AddProductDialog from "@/components/products/AddProductDialog";
import ImportProductsDialog from "@/components/products/ImportProductsDialog";
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/use-toast";
import { exportToCSV, downloadCSV } from "@/lib/csv-exporter";
import type { Product } from "@/types/pos";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const Products = () => {
  const { products, categories, deleteProduct } = useData();
  const { toast } = useToast();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isImportProductsOpen, setIsImportProductsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsAddProductOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProducts.size > 0) {
      selectedProducts.forEach(productId => {
        deleteProduct(productId);
      });
      toast({
        title: "Products Deleted",
        description: `${selectedProducts.size} product(s) have been deleted.`,
      });
      setSelectedProducts(new Set());
      setIsDeleteDialogOpen(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedProducts.size === 0) {
      toast({
        title: "No products selected",
        description: "Please select products to delete.",
        variant: "destructive"
      });
      return;
    }
    setIsDeleteDialogOpen(true);
  };

  const handleProductSelect = (productId: number, isSelected: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (isSelected) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleAddNewProduct = () => {
    setSelectedProduct(null);
    setIsAddProductOpen(true);
  };

  const handleImportProducts = () => {
    setIsImportProductsOpen(true);
  };

  const handleExportProducts = () => {
    if (products.length === 0) {
      toast({
        title: "No products to export",
        description: "Add some products first before exporting.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare product data for export with all details
      const exportData = products.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        description: product.description || '',
        barcode: product.barcode || '',
        price: product.price,
        stock: product.stock,
        weight: product.weight,
        unit: product.unit,
        minimumStock: product.minimumStock || '',
        expiryDate: product.expiryDate || '',
        isActive: product.isActive ? 'Yes' : 'No',
        priceIncludesGST: product.priceIncludesGST ? 'Yes' : 'No'
      }));

      const csvContent = exportToCSV(exportData);
      const filename = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
      
      downloadCSV(csvContent, filename);
      
      toast({
        title: "Export Successful",
        description: `Exported ${products.length} products to ${filename}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export products. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || 
      product.category.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
        <div className="flex gap-2">
          {selectedProducts.size > 0 && (
            <Button onClick={handleBulkDelete} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedProducts.size})
            </Button>
          )}
          <Button onClick={handleExportProducts} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={handleImportProducts} variant="outline">
            <FileText className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <Button onClick={handleAddNewProduct}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filteredProducts.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAll}
              className="gap-1"
            >
              {selectedProducts.size === filteredProducts.length ? "Deselect All" : "Select All"}
            </Button>
          )}
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
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name.toLowerCase()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-semibold">No products found</h3>
          <p className="text-muted-foreground">
            {products.length === 0 
              ? "Start by adding your first product or import products from CSV" 
              : "Try changing your search or filter criteria"}
          </p>
          <div className="flex gap-4 justify-center mt-4">
            <Button onClick={handleImportProducts} variant="outline">
              <FileText className="mr-2 h-4 w-4" /> Import CSV
            </Button>
            <Button onClick={handleAddNewProduct}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 overflow-y-auto max-h-[calc(100vh-250px)]">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              isSelected={selectedProducts.has(product.id)}
              onSelect={handleProductSelect}
            />
          ))}
        </div>
      )}

      <AddProductDialog 
        open={isAddProductOpen} 
        onOpenChange={setIsAddProductOpen}
        product={selectedProduct}
        defaultUnit="g"
      />

      <ImportProductsDialog
        open={isImportProductsOpen}
        onOpenChange={setIsImportProductsOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedProducts.size} selected product(s). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
