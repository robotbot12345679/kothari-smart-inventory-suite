
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, AlertTriangle, Package, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Product, Order } from "@/types/pos";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InsightsCardProps {
  products: Product[];
  orders: Order[];
  lowStockItems: number;
  pendingOrders: number;
  activeProducts: number;
  lowStockProducts: Product[];
  topSellingProducts: { name: string; quantity: number }[];
}

const InsightsCard: React.FC<InsightsCardProps> = ({ 
  products, 
  orders, 
  lowStockItems, 
  pendingOrders, 
  activeProducts,
  lowStockProducts,
  topSellingProducts
}) => {
  const navigate = useNavigate();

  // Calculate sales trends (compare last 7 days vs previous 7 days)
  const salesTrend = React.useMemo(() => {
    if (!orders || orders.length === 0) return null;
    
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const recentSales = orders.filter(order => 
      new Date(order.orderDate) >= last7Days
    ).reduce((sum, order) => sum + order.total, 0);
    
    const previousSales = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= previous7Days && orderDate < last7Days;
    }).reduce((sum, order) => sum + order.total, 0);
    
    if (previousSales === 0) return recentSales > 0 ? 'up' : 'stable';
    
    const change = ((recentSales - previousSales) / previousSales) * 100;
    return {
      direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      percentage: Math.abs(change).toFixed(1)
    };
  }, [orders]);

  // Identify purchasing patterns
  const purchasingPatterns = React.useMemo(() => {
    if (!orders || orders.length === 0) return null;
    
    // Analyze peak hours
    const hourlyOrders = new Array(24).fill(0);
    orders.forEach(order => {
      const hour = new Date(order.orderDate).getHours();
      hourlyOrders[hour]++;
    });
    
    const peakHour = hourlyOrders.indexOf(Math.max(...hourlyOrders));
    const peakHourFormatted = peakHour === 0 ? '12 AM' : 
                             peakHour === 12 ? '12 PM' : 
                             peakHour < 12 ? `${peakHour} AM` : `${peakHour - 12} PM`;
    
    return {
      peakHour: peakHourFormatted,
      totalOrders: orders.length
    };
  }, [orders]);

  if (!products || products.length === 0) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Insights</CardTitle>
          <CardDescription>AI-powered business recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <Package className="h-12 w-12 mb-4 text-muted-foreground" />
            <p className="text-center mb-4">
              Add products and create orders to see AI-powered insights
            </p>
            <Button onClick={() => navigate('/products')}>
              <Plus className="mr-2 h-4 w-4" /> Add Your First Product
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Critical Stock Alert
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardTitle>
        <CardDescription>
          {lowStockItems > 0 ? `${lowStockItems} items below minimum stock level` : 'All items well stocked'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {lowStockItems > 0 ? (
          <div className="space-y-4">
            <div className="max-h-[250px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Product</TableHead>
                    <TableHead className="text-xs text-right">Current Stock</TableHead>
                    <TableHead className="text-xs text-right">Min Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.slice(0, 10).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="text-xs font-medium">
                        <div className="truncate max-w-[120px]" title={product.name}>
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-right text-red-600">
                        {product.stock} {product.unit}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {product.minimumStock || 10} {product.unit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">
                Products listed: {lowStockProducts.map(p => p.name).slice(0, 3).join(', ')}
                {lowStockProducts.length > 3 && ` and ${lowStockProducts.length - 3} more...`}
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-red-700 border-red-300 hover:bg-red-50"
                onClick={() => navigate('/inventory')}
              >
                Update Stock Levels
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Package className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm text-green-700 font-medium">All items well stocked!</p>
            <p className="text-xs text-muted-foreground mt-1">
              {products.length} products are above minimum stock levels
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightsCard;
