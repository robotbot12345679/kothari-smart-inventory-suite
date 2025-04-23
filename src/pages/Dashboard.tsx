
import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { products, orders } = useData();
  const navigate = useNavigate();

  // Calculate stats based on real data
  const stats = useMemo(() => {
    const activeProducts = products.filter(p => p.isActive).length;
    const lowStockItems = products.filter(p => {
      if (!p.minimumStock) return false;
      return p.stock < p.minimumStock;
    }).length;

    // Calculate total sales amount from orders
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

    // Get pending orders
    const pendingOrders = orders.filter(order => 
      order.orderStatus === 'Pending' || order.orderStatus === 'Processing'
    ).length;

    return {
      totalSales,
      activeProducts,
      lowStockItems,
      pendingOrders
    };
  }, [products, orders]);

  // Top selling products calculation
  const topSellingProducts = useMemo(() => {
    const productSales = new Map();
    
    // Count product occurrences in orders
    orders.forEach(order => {
      order.items.forEach(item => {
        const currentCount = productSales.get(item.name) || 0;
        productSales.set(item.name, currentCount + item.quantity);
      });
    });
    
    // Convert to array and sort
    return Array.from(productSales, ([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {orders.length} orders
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.lowStockItems > 0 ? (
                <span className="text-amber-500 flex items-center">
                  Requires attention
                </span>
              ) : (
                "All items well stocked"
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingOrders > 0 ? "Needs processing" : "No pending orders"}
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Count</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeProducts} active products
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="card-hover md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Daily sales performance</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {orders.length > 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                Chart will be displayed here when more data is available
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center">
                <BarChart3 className="h-12 w-12 mb-2 opacity-50" />
                <p>No sales data available yet</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/orders')} 
                  className="mt-4"
                >
                  Create your first order
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="card-hover md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Insights</CardTitle>
            <CardDescription>System recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 && orders.length === 0 ? (
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
                {stats.lowStockItems > 0 && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="font-medium text-sm text-primary">Stock Alert</p>
                    <p className="text-sm mt-1">You have {stats.lowStockItems} items below minimum stock level.</p>
                  </div>
                )}
                {stats.pendingOrders > 0 && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="font-medium text-sm text-primary">Order Processing</p>
                    <p className="text-sm mt-1">{stats.pendingOrders} orders waiting to be processed.</p>
                  </div>
                )}
                {products.length > 0 && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="font-medium text-sm text-primary">Inventory Status</p>
                    <p className="text-sm mt-1">
                      {stats.activeProducts} of {products.length} products are active.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-2">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customerName || "Guest Customer"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.total.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="mb-4">No orders yet</p>
                <Button variant="outline" onClick={() => navigate('/orders')}>
                  Create Order
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performers</CardDescription>
          </CardHeader>
          <CardContent>
            {topSellingProducts.length > 0 ? (
              <div className="space-y-2">
                {topSellingProducts.map((product, index) => (
                  <div key={product.name} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-medium mr-2">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.quantity} units sold
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="mb-4">No sales data yet</p>
                <Button variant="outline" onClick={() => navigate('/pos')}>
                  Create Sale
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>Stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="space-y-4">
                {products.slice(0, 5).map((product) => {
                  const stockPercentage = product.minimumStock
                    ? Math.min(100, Math.round((product.stock / (product.minimumStock * 2)) * 100))
                    : 100;
                  
                  let statusColor = "bg-primary";
                  if (stockPercentage < 20) statusColor = "bg-destructive";
                  else if (stockPercentage < 50) statusColor = "bg-amber-500";
                  else if (stockPercentage > 80) statusColor = "bg-emerald-500";
                  
                  return (
                    <div key={product.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{product.name}</span>
                        <span className="text-sm">{stockPercentage}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={`h-full ${statusColor} rounded-full`} 
                          style={{ width: `${stockPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
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
      </div>
    </div>
  );
};

export default Dashboard;
