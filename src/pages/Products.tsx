
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import AddProductDialog from "@/components/products/AddProductDialog";
import type { Product } from "@/types/pos";

const Products = () => {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsAddProductOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    // Implement delete functionality
    console.log("Delete product:", product);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
        <Button onClick={() => setIsAddProductOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ProductCard 
          product={{
            id: 1,
            name: "Sample Product",
            sku: "SK-001",
            category: "Nuts",
            image: "",
            variants: [],
            isActive: true
          }}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      </div>

      <AddProductDialog 
        open={isAddProductOpen} 
        onOpenChange={setIsAddProductOpen}
      />
    </div>
  );
};

export default Products;
