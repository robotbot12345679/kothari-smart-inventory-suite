import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCloudData } from "@/context/CloudDataContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subDays, subMonths, subQuarters, subYears, isWithinInterval } from "date-fns";
import { 
  TrendingUp, 
  BarChart3 as BarChart3Icon, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Download, 
  RefreshCw,
  Calendar as CalendarIcon,
  FileText
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import AddSalesDialog from "@/components/analytics/AddSalesDialog";
import { cn } from "@/lib/utils";

interface PaymentData {
  name: string;
  value: number;
  color: string;
}

interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

type ReportPeriod = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'lastQuarter' | 'last6months' | 'thisYear' | 'lastYear' | 'custom';

const Analytics = () => {
  const { orders, products, customers } = useCloudData();
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("last30days");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(new Date());
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  // Get date range based on selected period
  const getDateRange = useMemo(() => {
    const now = new Date();
    
    switch (reportPeriod) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
      case 'last7days':
        return { start: startOfDay(subDays(now, 7)), end: endOfDay(now) };
      case 'last30days':
        return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) };
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'thisQuarter':
        return { start: startOfQuarter(now), end: endOfQuarter(now) };
      case 'lastQuarter':
        const lastQuarter = subQuarters(now, 1);
        return { start: startOfQuarter(lastQuarter), end: endOfQuarter(lastQuarter) };
      case 'last6months':
        return { start: startOfDay(subMonths(now, 6)), end: endOfDay(now) };
      case 'thisYear':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'lastYear':
        const lastYear = subYears(now, 1);
        return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
      case 'custom':
        return { 
          start: customStartDate ? startOfDay(customStartDate) : startOfDay(subDays(now, 30)), 
          end: customEndDate ? endOfDay(customEndDate) : endOfDay(now) 
        };
      default:
        return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) };
    }
  }, [reportPeriod, customStartDate, customEndDate]);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.order_date || order.created_at);
      return isWithinInterval(orderDate, { start: getDateRange.start, end: getDateRange.end });
    });
  }, [orders, getDateRange]);

  // Calculate key metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const periodRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const orderCount = orders.length;
  const periodOrderCount = filteredOrders.length;
  const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
  const periodAOV = periodOrderCount > 0 ? periodRevenue / periodOrderCount : 0;
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => (c.total_orders || 0) > 0).length;
  const conversionRate = totalCustomers > 0 ? (orderCount / totalCustomers) * 100 : 0;

  // Payment distribution data
  const paymentDistribution: PaymentData[] = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) return [];
    
    const paymentAmounts: Record<string, number> = {};
    filteredOrders.forEach(order => {
      const method = order.payment_method || 'Cash';
      paymentAmounts[method] = (paymentAmounts[method] || 0) + order.total;
    });
    
    const colors = ['#c87137', '#8B5A2F', '#A0522D', '#CD853F', '#DEB887'];
    
    return Object.entries(paymentAmounts).map(([method, amount], index) => ({
      name: method,
      value: amount,
      color: colors[index % colors.length]
    }));
  }, [filteredOrders]);
  
  // Prepare sales trend data
  const salesTrendData: SalesData[] = useMemo(() => {
    if (!filteredOrders || !filteredOrders.length) return [];
    
    const salesByDate: Record<string, { sales: number; orders: number }> = {};
    
    filteredOrders.forEach((order) => {
      const date = format(new Date(order.order_date || order.created_at), 'MMM dd');
      if (!salesByDate[date]) {
        salesByDate[date] = { sales: 0, orders: 0 };
      }
      salesByDate[date].sales += order.total;
      salesByDate[date].orders += 1;
    });
    
    return Object.entries(salesByDate)
      .map(([date, data]) => ({ date, sales: data.sales, orders: data.orders }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredOrders]);

  // Monthly comparison data
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    
    orders.forEach(order => {
      const month = format(new Date(order.order_date || order.created_at), 'MMM yyyy');
      months[month] = (months[month] || 0) + order.total;
    });
    
    return Object.entries(months)
      .map(([month, revenue]) => ({ month, revenue }))
      .slice(-12);
  }, [orders]);

  // Daily breakdown for period
  const dailyBreakdown = useMemo(() => {
    const days: Record<string, { revenue: number; orders: number; avgOrder: number }> = {};
    
    filteredOrders.forEach(order => {
      const day = format(new Date(order.order_date || order.created_at), 'EEEE');
      if (!days[day]) {
        days[day] = { revenue: 0, orders: 0, avgOrder: 0 };
      }
      days[day].revenue += order.total;
      days[day].orders += 1;
    });
    
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return dayOrder.map(day => ({
      day,
      revenue: days[day]?.revenue || 0,
      orders: days[day]?.orders || 0,
      avgOrder: days[day]?.orders ? days[day].revenue / days[day].orders : 0
    }));
  }, [filteredOrders]);

  // Top selling products
  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    filteredOrders.forEach(order => {
      order.items?.forEach((item: any) => {
        const key = item.id || item.name;
        if (!productSales[key]) {
          productSales[key] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[key].quantity += item.quantity || 1;
        productSales[key].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredOrders]);

  // Category distribution
  const categoryDistribution = useMemo(() => {
    const categories: Record<string, number> = {};
    
    filteredOrders.forEach(order => {
      order.items?.forEach((item: any) => {
        const product = products.find(p => p.id === item.id);
        const category = product?.category || 'Uncategorized';
        categories[category] = (categories[category] || 0) + (item.price || 0) * (item.quantity || 1);
      });
    });
    
    const colors = ['#c87137', '#8B5A2F', '#A0522D', '#CD853F', '#DEB887', '#D2691E'];
    
    return Object.entries(categories).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  }, [filteredOrders, products]);

  // Export report
  const exportReport = () => {
    const reportData = {
      period: reportPeriod,
      dateRange: `${format(getDateRange.start, 'dd/MM/yyyy')} - ${format(getDateRange.end, 'dd/MM/yyyy')}`,
      totalRevenue: periodRevenue,
      totalOrders: periodOrderCount,
      averageOrderValue: periodAOV,
      paymentMethods: paymentDistribution,
      topProducts,
      dailyBreakdown
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_report_${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getPeriodLabel = () => {
    if (reportPeriod === 'custom') {
      return `${format(getDateRange.start, 'MMM dd, yyyy')} - ${format(getDateRange.end, 'MMM dd, yyyy')}`;
    }
    
    const labels: Record<ReportPeriod, string> = {
      today: 'Today',
      yesterday: 'Yesterday',
      last7days: 'Last 7 Days',
      last30days: 'Last 30 Days',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      thisQuarter: 'This Quarter',
      lastQuarter: 'Last Quarter',
      last6months: 'Last 6 Months',
      thisYear: 'This Year',
      lastYear: 'Last Year',
      custom: 'Custom Range'
    };
    
    return labels[reportPeriod];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector */}
          <Select value={reportPeriod} onValueChange={(v) => setReportPeriod(v as ReportPeriod)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisQuarter">This Quarter</SelectItem>
              <SelectItem value="lastQuarter">Last Quarter</SelectItem>
              <SelectItem value="last6months">Last 6 Months</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="lastYear">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {/* Custom Date Range */}
          {reportPeriod === 'custom' && (
            <div className="flex items-center gap-2">
              <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-[130px] justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStartDate ? format(customStartDate, 'MMM dd') : 'Start'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={(date) => {
                      setCustomStartDate(date);
                      setShowStartCalendar(false);
                    }}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground">to</span>
              <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-[130px] justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEndDate ? format(customEndDate, 'MMM dd') : 'End'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={(date) => {
                      setCustomEndDate(date);
                      setShowEndCalendar(false);
                    }}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <AddSalesDialog />
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Period Badge */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span>Showing data for: <strong className="text-foreground">{getPeriodLabel()}</strong></span>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Period Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{periodRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total: ₹{totalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <BarChart3Icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{periodAOV.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall: ₹{averageOrderValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <LineChartIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periodOrderCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total: {orderCount}
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <PieChartIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeCustomers} active / {totalCustomers} total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue for selected period</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {salesTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis tickFormatter={(v) => `₹${v.toLocaleString()}`} fontSize={11} width={70} />
                      <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                      <Area type="monotone" dataKey="sales" stroke="#c87137" fill="#c87137" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Sales by Day of Week</CardTitle>
                <CardDescription>Average revenue per day</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {dailyBreakdown.some(d => d.revenue > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" fontSize={11} tickFormatter={(v) => v.slice(0, 3)} />
                      <YAxis tickFormatter={(v) => `₹${v.toLocaleString()}`} fontSize={11} width={70} />
                      <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#c87137" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Comparison */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Monthly Revenue Comparison</CardTitle>
              <CardDescription>Last 12 months revenue trend</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" fontSize={11} />
                    <YAxis tickFormatter={(v) => `₹${v.toLocaleString()}`} fontSize={11} width={80} />
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#c87137" strokeWidth={2} dot={{ fill: '#c87137' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No monthly data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Daily Sales Details</CardTitle>
              <CardDescription>Sales and order count per day</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {salesTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" fontSize={11} />
                    <YAxis yAxisId="left" tickFormatter={(v) => `₹${v.toLocaleString()}`} fontSize={11} width={80} />
                    <YAxis yAxisId="right" orientation="right" fontSize={11} />
                    <Tooltip formatter={(v: number, name: string) => [name === 'sales' ? `₹${v.toLocaleString()}` : v, name === 'sales' ? 'Revenue' : 'Orders']} />
                    <Bar yAxisId="left" dataKey="sales" fill="#c87137" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#8B5A2F" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No sales data available for selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>By revenue for selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.length > 0 ? topProducts.map((product, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.quantity} units sold</p>
                      </div>
                      <p className="font-semibold">₹{product.revenue.toLocaleString()}</p>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-4">No product data</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Revenue by product category</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {categoryDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No category data
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payments Tab */}
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
                    <PieChart>
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
                      <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No payment data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
                <CardDescription>Breakdown by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentDistribution.map((method, index) => {
                    const totalRev = paymentDistribution.reduce((sum, m) => sum + m.value, 0);
                    const percentage = totalRev > 0 ? (method.value / totalRev) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: method.color }} />
                          <span className="font-medium">{method.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{method.value.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {paymentDistribution.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No payment data</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-lg">Total Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalCustomers}</div>
                <p className="text-sm text-muted-foreground mt-1">Registered customers</p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-lg">Active Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeCustomers}</div>
                <p className="text-sm text-muted-foreground mt-1">With at least 1 order</p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-lg">Customer Lifetime Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{(totalRevenue / Math.max(totalCustomers, 1)).toFixed(0)}</div>
                <p className="text-sm text-muted-foreground mt-1">Average per customer</p>
              </CardContent>
            </Card>
          </div>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>By total spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customers
                  .filter(c => (c.total_spent || 0) > 0)
                  .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
                  .slice(0, 10)
                  .map((customer, i) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.total_orders || 0} orders</p>
                        </div>
                      </div>
                      <p className="font-semibold">₹{(customer.total_spent || 0).toLocaleString()}</p>
                    </div>
                  ))
                }
                {customers.filter(c => (c.total_spent || 0) > 0).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No customer spending data</p>
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
