
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Package } from "lucide-react";
import type { Product } from "@/types/pos";
import UpdateStockDialog from "../inventory/UpdateStockDialog";
import { getImageUrl } from "@/utils/imageUtils";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isSelected?: boolean;
  onSelect?: (productId: number, isSelected: boolean) => void;
  showCheckbox?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete, isSelected = false, onSelect, showCheckbox = false }) => {
  const imageUrl = getImageUrl(product.image);

  return (
    <Card className={`overflow-hidden h-[350px] flex flex-col ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <div className="h-[150px] relative">
        {showCheckbox && onSelect && (
          <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(product.id, !!checked)}
              className="bg-white/80 border-2"
            />
          </div>
        )}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              
              const container = target.parentElement;
              if (container) {
                container.classList.add("bg-muted", "flex", "items-center", "justify-center");
                
                if (!container.querySelector('.placeholder-icon')) {
                  const icon = document.createElement('div');
                  icon.className = 'placeholder-icon';
                  icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z"></path><path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2.12 2.12 0 0 1 .09-3.67Z"></path><line x1="12" y1="22" x2="12" y2="13"></line><path d="M20 13.5v3.37a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13.5"></path></svg>`;
                  container.appendChild(icon);
                }
              }
            }}
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

      <CardContent className="pt-2 p-3 flex-grow">
        <h3 className="font-bold text-base truncate text-gray-800">{product.name}</h3>
        <p className="text-xs text-gray-500 truncate">{product.weight}{product.unit} • SKU: {product.sku}</p>
        <div className="flex justify-between items-center mt-1">
          <span className="text-[#c87137] font-bold text-base">₹{product.price.toFixed(2)}</span>
          <span className="text-gray-600 text-xs">{product.stock} in stock</span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-2 pt-0 p-3 mt-auto">
        <UpdateStockDialog product={product} />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2"
            onClick={() => onEdit(product)}
          >
            <Edit className="h-3 w-3 mr-1" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-destructive hover:text-destructive"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="h-3 w-3 mr-1" /> Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
