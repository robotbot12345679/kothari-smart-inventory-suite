
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Package } from "lucide-react";
import type { Product } from "@/types/pos";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {!product.isActive && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium px-2 py-1 rounded-md">
              Inactive
            </span>
          </div>
        )}
      </div>

      <CardContent className="pt-4">
        <h3 className="font-semibold truncate">{product.name}</h3>
        <div className="mt-1 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Pack: {product.weight}{product.unit}</span>
          <span className="font-medium">₹{product.price.toFixed(2)}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="text-xs">
            <span className="text-muted-foreground">SKU:</span> {product.sku}
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Stock:</span>{" "}
            {product.stock}
          </div>
        </div>
        
        {product.minimumStock !== undefined && product.stock <= product.minimumStock && (
          <div className="mt-2">
            <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-800 rounded">
              Low Stock
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-2 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2"
          onClick={() => onEdit(product)}
        >
          <Edit className="h-3.5 w-3.5 mr-1" /> Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 text-destructive hover:text-destructive"
          onClick={() => onDelete(product)}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
