
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import type { Product, CartItem } from "@/types/pos";
import { getImageUrl } from "@/utils/imageUtils";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
  const handleAddToCart = (product: Product) => {
    if (product.stock > 0) {
      onAddToCart(product);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => {
        const imageUrl = getImageUrl(product.image);
        const isOutOfStock = product.stock <= 0;
        
        return (
          <Card 
            key={product.id} 
            className={`overflow-hidden transition-all hover:shadow-md ${
              isOutOfStock ? 'opacity-50' : 'cursor-pointer hover:scale-105'
            }`}
          >
            <div className="h-32 relative">
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
                        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z"></path><path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2.12 2.12 0 0 1 .09-3.67Z"></path><line x1="12" y1="22" x2="12" y2="13"></line><path d="M20 13.5v3.37a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13.5"></path></svg>`;
                        container.appendChild(icon);
                      }
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs font-medium px-2 py-1 rounded">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            <CardContent className="p-3">
              <h3 className="font-medium text-sm truncate mb-1">{product.name}</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#c87137] font-bold text-sm">₹{product.price.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">{product.stock} left</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {product.weight}{product.unit} • {product.sku}
              </p>
              <Button
                size="sm"
                className="w-full h-7 text-xs"
                onClick={() => handleAddToCart(product)}
                disabled={isOutOfStock}
              >
                <Plus className="h-3 w-3 mr-1" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProductGrid;
