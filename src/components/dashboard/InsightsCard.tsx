
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, AlertTriangle, Package, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Product, Order } from "@/types/pos";

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
          Insights
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardTitle>
        <CardDescription>AI-powered business recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          
          {/* Low Stock Alert */}
          {lowStockItems > 0 && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="font-medium text-sm text-red-800">Critical Stock Alert</p>
              </div>
              <p className="text-sm text-red-700">
                {lowStockItems} item{lowStockItems > 1 ? 's' : ''} below minimum stock level
                {lowStockProducts.length > 0 && `: ${lowStockProducts.slice(0, 2).map(p => p.name).join(', ')}${lowStockProducts.length > 2 ? '...' : ''}`}
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
                onClick={() => navigate('/inventory')}
              >
                Update Stock
              </Button>
            </div>
          )}

          {/* Sales Trend Analysis */}
          {salesTrend && typeof salesTrend === 'object' && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                {salesTrend.direction === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : salesTrend.direction === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                )}
                <p className="font-medium text-sm text-blue-800">Sales Trend</p>
              </div>
              <p className="text-sm text-blue-700">
                {salesTrend.direction === 'up' 
                  ? `Sales increased by ${salesTrend.percentage}% this week`
                  : salesTrend.direction === 'down'
                  ? `Sales decreased by ${salesTrend.percentage}% this week`
                  : 'Sales remained stable this week'
                }
              </p>
            </div>
          )}

          {/* Top Product Performance */}
          {topSellingProducts.length > 0 && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-green-600" />
                <p className="font-medium text-sm text-green-800">Top Performer</p>
              </div>
              <p className="text-sm text-green-700">
                "{topSellingProducts[0].name}" is your bestseller with {topSellingProducts[0].quantity} units sold
              </p>
            </div>
          )}

          {/* Purchasing Patterns */}
          {purchasingPatterns && (
            <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-purple-600" />
                <p className="font-medium text-sm text-purple-800">Customer Pattern</p>
              </div>
              <p className="text-sm text-purple-700">
                Peak ordering time is {purchasingPatterns.peakHour} - optimize staff scheduling
              </p>
            </div>
          )}

          {/* Pending Orders */}
          {pendingOrders > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <p className="font-medium text-sm text-amber-800">Action Required</p>
              </div>
              <p className="text-sm text-amber-700">
                {pendingOrders} order{pendingOrders > 1 ? 's' : ''} awaiting processing
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2 text-amber-700 border-amber-300 hover:bg-amber-100"
                onClick={() => navigate('/orders')}
              >
                Process Orders
              </Button>
            </div>
          )}

          {/* Inventory Health */}
          {products.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-gray-600" />
                <p className="font-medium text-sm text-gray-800">Inventory Health</p>
              </div>
              <p className="text-sm text-gray-700">
                {activeProducts} of {products.length} products active. 
                {lowStockItems === 0 ? ' All items well stocked.' : ` ${lowStockItems} need restocking.`}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsCard;
