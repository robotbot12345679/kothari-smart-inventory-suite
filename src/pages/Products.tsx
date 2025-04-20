
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/products/ProductCard";
import AddProductDialog from "@/components/products/AddProductDialog";
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/use-toast";
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsAddProductOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      toast({
        title: "Product Deleted",
        description: `${productToDelete.name} has been deleted.`,
      });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleAddNewProduct = () => {
    setSelectedProduct(null);
    setIsAddProductOpen(true);
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
        <Button onClick={handleAddNewProduct}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
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
              ? "Start by adding your first product" 
              : "Try changing your search or filter criteria"}
          </p>
          <Button onClick={handleAddNewProduct} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {productToDelete?.name}. This action cannot be undone.
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
