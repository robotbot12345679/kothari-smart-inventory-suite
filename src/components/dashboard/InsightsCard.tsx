
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, AlertTriangle, Package, Users, Target, Clock, Award } from "lucide-react";
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
      new Date(order.order_date) >= last7Days
    ).reduce((sum, order) => sum + order.total, 0);
    
    const previousSales = orders.filter(order => {
      const orderDate = new Date(order.order_date);
      return orderDate >= previous7Days && orderDate < last7Days;
    }).reduce((sum, order) => sum + order.total, 0);
    
    if (previousSales === 0) return recentSales > 0 ? { direction: 'up', percentage: '100' } : null;
    
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
      const hour = new Date(order.order_date).getHours();
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

  // Get top selling product
  const topProduct = topSellingProducts.length > 0 ? topSellingProducts[0] : null;

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
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardTitle>
        <CardDescription>AI-powered business recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Critical Stock Alert */}
          {lowStockItems > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="font-medium text-red-700 text-sm">Critical Stock Alert</span>
              </div>
              <p className="text-sm text-red-600">
                {lowStockItems} items below minimum stock level: {lowStockProducts.slice(0, 3).map(p => p.name).join(', ')}
                {lowStockProducts.length > 3 && ` and ${lowStockProducts.length - 3} more...`}
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2 text-red-700 border-red-300 hover:bg-red-50 text-xs h-7"
                onClick={() => navigate('/inventory')}
              >
                Update Stock
              </Button>
            </div>
          )}

          {/* Sales Trend */}
          {salesTrend && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-700 text-sm">Sales Trend</span>
              </div>
              <p className="text-sm text-blue-600">
                Sales {salesTrend.direction === 'up' ? 'increased' : salesTrend.direction === 'down' ? 'decreased' : 'remained stable'} by {salesTrend.percentage}% this week
              </p>
            </div>
          )}

          {/* Top Performer */}
          {topProduct && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700 text-sm">Top Performer</span>
              </div>
              <p className="text-sm text-green-600">
                "{topProduct.name}" is your bestseller with {topProduct.quantity} units sold
              </p>
            </div>
          )}

          {/* Customer Pattern */}
          {purchasingPatterns && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-purple-700 text-sm">Customer Pattern</span>
              </div>
              <p className="text-sm text-purple-600">
                Peak ordering time is {purchasingPatterns.peakHour} - optimize staff scheduling
              </p>
            </div>
          )}

          {/* Inventory Health */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700 text-sm">Inventory Health</span>
            </div>
            <p className="text-sm text-gray-600">
              {activeProducts} of {products.length} products active. {lowStockItems > 0 ? lowStockItems : 'No'} need restocking.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsCard;
