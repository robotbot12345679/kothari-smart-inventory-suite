import React, { useState, useMemo } from "react";
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
import { useCloudData } from "@/context/CloudDataContext";
import AddSalesDialog from "@/components/analytics/AddSalesDialog";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts";

interface DailyAnalyticsData {
  date: string;
  sales: number;
  orders: number;
  productsSold: number;
  paymentMethods: Record<string, number>;
}

interface SalesData {
  date: string;
  sales: number;
}

interface PaymentData {
  name: string;
  value: number;
  color: string;
}

const Analytics = () => {
  const { 
    totalCustomers, 
    activeCustomers, 
    totalRevenue, 
    averageOrderValue, 
    customerLifetimeValue, 
    activeRate 
  } = useCustomerMetrics();

  const { orders, products } = useCloudData();
  const [period, setPeriod] = useState("30"); // Changed back to 30 days

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

  // Payment distribution data - shows amounts instead of order counts
  const paymentDistribution: PaymentData[] = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    const paymentAmounts: Record<string, number> = {};
    orders.forEach(order => {
      const method = order.paymentMethod || 'Cash';
      paymentAmounts[method] = (paymentAmounts[method] || 0) + order.total;
    });
    
    const colors = ['#c87137', '#8B5A2F', '#A0522D', '#CD853F', '#DEB887'];
    
    return Object.entries(paymentAmounts).map(([method, amount], index) => ({
      name: method,
      value: amount,
      color: colors[index % colors.length]
    }));
  }, [orders]);
  
  // Prepare sales trend data with better formatting
  const prepareSalesData = (): SalesData[] => {
    const salesByDate: Record<string, number> = {};
    
    if (!orders || !orders.length) return [];
    
    const now = new Date();
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(now.getDate() - periodDays);
    
    // Filter orders by selected period
    const periodOrders = orders.filter(order => new Date(order.orderDate) >= startDate);
    
    // Initialize all dates in the period with 0 sales
    for (let i = 0; i < periodDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      salesByDate[dateKey] = 0;
    }
    
    // Group sales by date
    periodOrders.forEach((order) => {
      const date = new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (salesByDate.hasOwnProperty(date)) {
        salesByDate[date] += order.total;
      }
    });
    
    // Convert to array format for Recharts and sort chronologically
    return Object.entries(salesByDate)
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => {
        const dateA = new Date(a.date + ', ' + new Date().getFullYear());
        const dateB = new Date(b.date + ', ' + new Date().getFullYear());
        return dateA.getTime() - dateB.getTime();
      });
  };

  // Daily analytics data
  const dailyAnalytics: DailyAnalyticsData[] = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    const dailyData: Record<string, DailyAnalyticsData> = {};
    
    orders.forEach(order => {
      const date = new Date(order.orderDate).toLocaleDateString('en-IN');
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          sales: 0,
          orders: 0,
          productsSold: 0,
          paymentMethods: {}
        };
      }
      
      dailyData[date].sales += order.total;
      dailyData[date].orders += 1;
      
      // Count products sold
      if (order.items) {
        order.items.forEach(item => {
          dailyData[date].productsSold += item.quantity || 0;
        });
      }
      
      // Payment method distribution
      const method = order.paymentMethod || 'Cash';
      dailyData[date].paymentMethods[method] = (dailyData[date].paymentMethods[method] || 0) + 1;
    });
    
    return Object.values(dailyData).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [orders]);
  
  const periodOrders = getOrdersForPeriod();
  const periodRevenue = periodOrders.reduce((sum, order) => sum + order.total, 0);
  const salesData = prepareSalesData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <AddSalesDialog />
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

      {/* Stats Cards */}
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
          <TabsTrigger value="payments">Payment Analytics</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Analytics</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Daily sales over the selected period ({period} days)</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12}
                      tick={{ fill: '#666' }}
                      interval={Math.max(0, Math.floor(salesData.length / 8))}
                    />
                    <YAxis 
                      tickFormatter={(value) => `₹${value.toLocaleString()}`} 
                      fontSize={12}
                      tick={{ fill: '#666' }}
                      width={80}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Sales']}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="sales" 
                      name="Sales" 
                      fill="#c87137" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground flex flex-col h-full items-center justify-center">
                  <BarChart3 className="h-12 w-12 mb-2 opacity-50" />
                  <p>No sales data available for the selected period</p>
                  <p className="text-xs mt-2">Try adding missing sales data or changing the time period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Payment Method Distribution</CardTitle>
                <CardDescription>Revenue by payment method</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {paymentDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={paymentDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value, percent }) => `${name}: ₹${value.toLocaleString()} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {paymentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No payment data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Payment Methods Summary</CardTitle>
                <CardDescription>Amount breakdown by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentDistribution.map((method, index) => {
                    const totalRevenue = paymentDistribution.reduce((sum, m) => sum + m.value, 0);
                    const percentage = totalRevenue > 0 ? (method.value / totalRevenue) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: method.color }}
                          />
                          <span className="font-medium">{method.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{method.value.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {paymentDistribution.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No payment data available</p>
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
                      <div className="text-sm text-muted-foreground">{product.unit || ''}</div>
                    </div>
                    <div className={`text-sm font-medium ${product.stock <= (product.minimumStock || 5) ? 'text-red-500' : 'text-green-500'}`}>
                      {product.stock || 0} in stock
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
      </Tabs>
    </div>
  );
};

export default Analytics;
