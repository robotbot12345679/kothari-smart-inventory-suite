
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Product } from "@/types/pos";

interface InventoryStatusProps {
  products: Product[];
}

// Enhanced color palette for product bars with more variety
const productColors = [
  "bg-emerald-500",  // Green
  "bg-amber-500",    // Amber/Orange
  "bg-blue-500",     // Blue
  "bg-purple-500",   // Purple
  "bg-rose-500",     // Rose
  "bg-indigo-500",   // Indigo
  "bg-cyan-500",     // Cyan
  "bg-fuchsia-500",  // Fuchsia
  "bg-lime-500",     // Lime
  "bg-teal-500",     // Teal
  "bg-sky-500",      // Sky
  "bg-orange-500",   // Orange
  "bg-pink-500",     // Pink
  "bg-yellow-500",   // Yellow
  "bg-red-500",      // Red
  "bg-violet-500",   // Violet
];

const InventoryStatus: React.FC<InventoryStatusProps> = ({ products }) => {
  const navigate = useNavigate();

  const calculateStockPercentage = (product: Product): { percentage: number; statusColor: string } => {
    let stockPercentage = 100;
    try {
      stockPercentage = product.min_stock
        ? Math.min(100, Math.round((Number(product.stock) / (product.min_stock * 2)) * 100))
        : 100;
    } catch (e) {
      console.error("Error calculating stock percentage:", e);
    }
    
    // Get color based on product id for consistent but varied colors
    const colorIndex = parseInt(product.id.substring(0, 8), 16) % productColors.length;
    const statusColor = productColors[colorIndex];
    
    return { percentage: stockPercentage, statusColor };
  };

  const handleViewAllInventory = () => {
    navigate('/inventory');
  };

  return (
    <Card className="card-hover cursor-pointer" onClick={handleViewAllInventory}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Inventory Status
          <span className="text-sm text-muted-foreground hover:text-primary underline">
            View All
          </span>
        </CardTitle>
        <CardDescription>Stock levels (Top 10 products)</CardDescription>
      </CardHeader>
      <CardContent>
        {products && products.length > 0 ? (
          <div className="space-y-4">
            {products.slice(0, 10).map((product) => {
              const { percentage, statusColor } = calculateStockPercentage(product);
              
              return (
                <div key={product.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium truncate">{product.name}</span>
                    <span className="text-sm">{percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={`h-full ${statusColor} rounded-full`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {products.length > 10 && (
              <div className="text-center pt-2">
                <Button variant="outline" size="sm" onClick={handleViewAllInventory}>
                  View All {products.length} Products
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="mb-4">No products in inventory</p>
            <Button variant="outline" onClick={() => navigate('/products')}>
              Add Products
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryStatus;
