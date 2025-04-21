
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, LineChart, PieChart, TrendingUp, Calendar, Download, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomerMetrics } from "@/hooks/useCustomerMetrics";
import { useData } from "@/context/DataContext";

const Analytics = () => {
  const { 
    totalCustomers, 
    activeCustomers, 
    totalRevenue, 
    averageOrderValue, 
    customerLifetimeValue, 
    activeRate 
  } = useCustomerMetrics();

  const { orders, products } = useData();
  const [period, setPeriod] = useState("30");

  // Order count
  const orderCount = orders.length;

  // Simple conversion rate: orders / total customers (if totalCustomers > 0)
  const conversionRate = totalCustomers > 0
    ? ((orderCount / totalCustomers) * 100)
    : 0;
    
  // Calculate orders for the selected period
  const getOrdersForPeriod = () => {
    const now = new Date();
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(now.getDate() - periodDays);
    
    return orders.filter(order => new Date(order.orderDate) >= startDate);
  };
  
  const periodOrders = getOrdersForPeriod();
  const periodRevenue = periodOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <div className="flex items-center gap-2">
          <Select defaultValue={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-1">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-emerald-500 mr-1">₹{periodRevenue.toLocaleString()}</span>
              in last {period} days
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-emerald-500 mr-1">
                ₹{periodOrders.length > 0 ? (periodRevenue / periodOrders.length).toFixed(2) : '0.00'}
              </span>
              in last {period} days
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order Count</CardTitle>
            <LineChart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-emerald-500 mr-1">{periodOrders.length}</span>
              in last {period} days
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <PieChart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-muted-foreground mr-1">
                Based on {totalCustomers} total customers
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Analytics</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="ai">AI Recommendations</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-hover md:col-span-2">
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Daily sales over the selected period ({period} days)</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] flex items-center justify-center">
                <div className="text-muted-foreground flex flex-col items-center">
                  <LineChart className="h-12 w-12 mb-2 opacity-50" />
                  <p>Sales trend chart will appear here</p>
                  <p className="text-xs">Showing data for last {period} days</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>By revenue in the selected period</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="space-y-4">
                  {products.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-muted-foreground">{index + 1}.</div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.variants[0]?.price ? `₹${product.variants[0].price}` : 'No price'}</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {product.variants[0]?.stock || 0} in stock
                      </div>
                    </div>
                  ))}
                  
                  {products.length === 0 && (
                    <div className="text-center py-10">
                      <p>No product data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution by product category</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="space-y-4">
                  {Array.from(new Set(products.map(p => p.category))).slice(0, 5).map((category, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-muted-foreground">{index + 1}.</div>
                        <div>
                          <div className="font-medium">{category}</div>
                          <div className="text-sm text-muted-foreground">
                            {products.filter(p => p.category === category).length} products
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {products.length === 0 && (
                    <div className="text-center py-10">
                      <p>No category data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>Overview of your current inventory levels</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span>Product</span>
                  <span>Stock Level</span>
                </div>
                {products.slice(0, 10).map((product) => (
                  <div key={product.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.variants[0]?.unit || ''}</div>
                    </div>
                    <div className={`text-sm font-medium ${product.variants[0]?.stock <= (product.minimumStock || 5) ? 'text-red-500' : 'text-green-500'}`}>
                      {product.variants[0]?.stock || 0} in stock
                    </div>
                  </div>
                ))}
                
                {products.length === 0 && (
                  <div className="text-center py-10">
                    <p>No inventory data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Customer Buying Patterns</CardTitle>
              <CardDescription>Analysis of customer purchasing behavior</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Customer Retention Rate</h3>
                    <div className="text-2xl font-bold">{activeRate.toFixed(1)}%</div>
                    <p className="text-sm text-muted-foreground">
                      {activeCustomers} active out of {totalCustomers} total customers
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Avg. Customer Lifetime Value</h3>
                    <div className="text-2xl font-bold">₹{customerLifetimeValue.toFixed(2)}</div>
                    <p className="text-sm text-muted-foreground">
                      Average revenue per customer
                    </p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-3">Recent Customer Orders</h3>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                        <div>
                          <div className="font-medium">{order.customerName || 'Guest'}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm font-medium">₹{order.total.toFixed(2)}</div>
                      </div>
                    ))}
                    
                    {orders.length === 0 && (
                      <div className="text-center py-5">
                        <p>No order data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>Based on your actual store data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.length > 0 ? (
                  <>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="font-medium text-sm text-primary">Inventory Optimization</p>
                      <p className="text-sm mt-1">
                        {products.filter(p => p.variants[0]?.stock <= (p.minimumStock || 5)).length > 0 ? 
                          `${products.filter(p => p.variants[0]?.stock <= (p.minimumStock || 5)).length} products are running low on stock and need replenishment.` : 
                          'All products are currently well-stocked.'}
                      </p>
                    </div>
                    
                    {orderCount > 0 && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="font-medium text-sm text-primary">Sales Performance</p>
                        <p className="text-sm mt-1">
                          Your average order value is ₹{averageOrderValue.toFixed(2)} with {orderCount} total orders.
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="font-medium text-sm text-primary">Product Recommendations</p>
                      <p className="text-sm mt-1">
                        {products.length > 0 ? 
                          `Consider featuring ${products[0].name} more prominently as it appears to be a popular item.` :
                          'Add more products to get personalized recommendations.'}
                      </p>
                    </div>
                    
                    {totalCustomers > 0 && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="font-medium text-sm text-primary">Customer Engagement</p>
                        <p className="text-sm mt-1">
                          {activeRate > 50 ? 
                            `Your customer retention rate of ${activeRate.toFixed(1)}% is healthy. Consider a loyalty program to increase it further.` : 
                            `Your customer retention rate of ${activeRate.toFixed(1)}% could be improved. Consider running a re-engagement campaign.`}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Add products and complete sales to get AI-powered insights for your business.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
