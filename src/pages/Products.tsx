
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, FileDown, FilePlus, AlertTriangle } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import AddProductDialog from "@/components/products/AddProductDialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types/pos";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Products = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Sample Product",
      sku: "SK-001",
      category: "Nuts",
      image: "",
      variants: [],
      isActive: true
    }
  ]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

  const handleAddProduct = (product: Product) => {
    const newProduct = {
      ...product,
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1
    };
    setProducts([...products, newProduct]);
    toast({
      title: "Product Added",
      description: `${product.name} has been added successfully.`
    });
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsAddProductOpen(true);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    toast({
      title: "Product Updated",
      description: `${updatedProduct.name} has been updated successfully.`
    });
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (product: Product) => {
    setProducts(products.filter(p => p.id !== product.id));
    toast({
      title: "Product Deleted",
      description: `${product.name} has been removed from products.`
    });
  };

  const handleDeleteAllProducts = () => {
    setProducts([]);
    setIsDeleteAllOpen(false);
    toast({
      title: "All Products Deleted",
      description: "All products have been removed."
    });
  };

  const handleExport = () => {
    const data = JSON.stringify(products, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Export Completed",
      description: "Your products data has been exported."
    });
    setIsExportDialogOpen(false);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedProducts = JSON.parse(e.target?.result as string);
        setProducts(importedProducts);
        toast({
          title: "Import Successful",
          description: `${importedProducts.length} products imported.`
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "There was an error importing the products.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    setIsImportDialogOpen(false);
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
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1" onClick={() => setIsExportDialogOpen(true)}>
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="gap-1" onClick={() => setIsImportDialogOpen(true)}>
            <FilePlus className="h-4 w-4" />
            Import
          </Button>
          <AlertDialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-1 border-red-200 text-red-500 hover:text-red-500 hover:bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all products. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllProducts} className="bg-red-500 hover:bg-red-600">
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={() => {
            setSelectedProduct(null);
            setIsAddProductOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-4 border-b flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full bg-background pl-8 md:w-96"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex flex-col items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="font-semibold text-lg">No products found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              {products.length === 0 
                ? "You haven't added any products yet. Click 'Add Product' to get started." 
                : "Try changing your search or filter criteria."}
            </p>
            {products.length === 0 && (
              <Button className="mt-4" onClick={() => setIsAddProductOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add First Product
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      )}

      <AddProductDialog 
        open={isAddProductOpen} 
        onOpenChange={setIsAddProductOpen}
        product={selectedProduct}
        onSave={selectedProduct ? handleUpdateProduct : handleAddProduct}
      />

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Products</DialogTitle>
            <DialogDescription>
              Export your products data as a JSON file.
            </DialogDescription>
          </DialogHeader>
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
            <DialogTitle>Import Products</DialogTitle>
            <DialogDescription>
              Upload a JSON file to import products.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input 
              type="file" 
              accept=".json" 
              onChange={handleImport}
            />
            <p className="text-sm text-muted-foreground">
              Supported format: JSON
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
