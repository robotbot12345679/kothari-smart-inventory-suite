
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Package, Trash2 } from "lucide-react";
import type { Product } from "@/types/pos";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium line-clamp-1" title={product.name}>
          {product.name}
        </CardTitle>
        {product.isActive ? (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">SKU:</span>
            <span className="text-sm">{product.sku}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Category:</span>
            <span className="text-sm">{product.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Price:</span>
            <span className="text-sm">₹{product.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Stock:</span>
            <span className="text-sm">{product.stock}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Weight:</span>
            <span className="text-sm">{product.weight} {product.unit}</span>
          </div>
          {product.minimumStock && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Min Stock:</span>
              <span className="text-sm">{product.minimumStock}</span>
            </div>
          )}
          <div className="flex gap-2 justify-end mt-4">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(product)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
