
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Product, Order } from "@/types/pos";

interface InsightsCardProps {
  products: Product[];
  orders: Order[];
  lowStockItems: number;
  pendingOrders: number;
  activeProducts: number;
}

const InsightsCard: React.FC<InsightsCardProps> = ({ 
  products, 
  orders, 
  lowStockItems, 
  pendingOrders, 
  activeProducts 
}) => {
  const navigate = useNavigate();

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Insights</CardTitle>
        <CardDescription>System recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        {(!products || products.length === 0) && (!orders || orders.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-center mb-4">
              Add products and create orders to see AI-powered insights
            </p>
            <Button onClick={() => navigate('/products')}>
              <Plus className="mr-2 h-4 w-4" /> Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {lowStockItems > 0 && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium text-sm text-primary">Stock Alert</p>
                <p className="text-sm mt-1">You have {lowStockItems} items below minimum stock level.</p>
              </div>
            )}
            {pendingOrders > 0 && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium text-sm text-primary">Order Processing</p>
                <p className="text-sm mt-1">{pendingOrders} orders waiting to be processed.</p>
              </div>
            )}
            {products && products.length > 0 && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium text-sm text-primary">Inventory Status</p>
                <p className="text-sm mt-1">
                  {activeProducts} of {products.length} products are active.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightsCard;
