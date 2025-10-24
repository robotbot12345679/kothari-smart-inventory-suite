
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCloudData } from "@/context/CloudDataContext";
import { format, subDays, isAfter, startOfDay, endOfDay, isValid, parse } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Download, Calendar as CalendarIcon, FileText, Filter, Printer } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DateRange } from "react-day-picker";

const Reports = () => {
  const { orders, products, categories } = useCloudData();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [reportType, setReportType] = useState("sales");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Get filtered orders based on date range
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.order_date);
    const fromDate = dateRange.from ? startOfDay(dateRange.from) : undefined;
    const toDate = dateRange.to ? endOfDay(dateRange.to) : undefined;
    
    if (fromDate && !isAfter(orderDate, fromDate)) {
      return false;
    }
    
    if (toDate && isAfter(orderDate, toDate)) {
      return false;
    }
    
    return true;
  });
  
  // Total sales and revenue
  const totalSales = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  
  // Sales by payment method data
  const salesByMethod = filteredOrders.reduce((acc, order) => {
    const method = order.payment_method || "Unknown";
    if (!acc[method]) {
      acc[method] = { count: 0, amount: 0 };
    }
    acc[method].count += 1;
    acc[method].amount += order.total;
    return acc;
  }, {} as Record<string, { count: number; amount: number }>);
  
  const paymentMethodChartData = Object.entries(salesByMethod).map(([method, data]) => ({
    name: method.charAt(0).toUpperCase() + method.slice(1),
    value: data.count
  }));
  
  // Sales by category data
  const salesByCategory = filteredOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        const category = product.category;
        if (!acc[category]) {
          acc[category] = { count: 0, amount: 0 };
        }
        acc[category].count += item.quantity;
        acc[category].amount += item.price * item.quantity;
      }
    });
    return acc;
  }, {} as Record<string, { count: number; amount: number }>);
  
  const categoryChartData = Object.entries(salesByCategory).map(([category, data]) => ({
    name: category,
    value: data.amount
  }));
  
  // Top selling products
  const productSales = filteredOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      if (!acc[item.id]) {
        acc[item.id] = { 
          name: item.name,
          quantity: 0, 
          revenue: 0 
        };
      }
      acc[item.id].quantity += item.quantity;
      acc[item.id].revenue += item.price * item.quantity;
    });
    return acc;
  }, {} as Record<number, { name: string; quantity: number; revenue: number }>);
  
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  // Inventory report - filter by category if needed
  const inventoryData = products
    .filter(product => categoryFilter === "all" || product.category === categoryFilter)
    .map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      stock: product.stock,
      category: product.category,
      min_stock: product.min_stock || 0,
      lowStock: product.min_stock && product.stock <= product.min_stock
    }));
  
  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  const generateCsv = () => {
    let csvContent = "";
    let filename = "";
    
    if (reportType === "sales") {
      // Generate sales report CSV
      csvContent = "Order ID,Date,Customer,Items,Total\n";
      filteredOrders.forEach(order => {
        const date = new Date(order.order_date).toLocaleDateString();
        const customer = order.customer_name || "Guest";
        const items = order.items.reduce((sum, item) => sum + item.quantity, 0);
        csvContent += `${order.id},${date},${customer},${items},${order.total.toFixed(2)}\n`;
      });
      filename = `sales-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    } else if (reportType === "inventory") {
      // Generate inventory report CSV
      csvContent = "ID,Name,SKU,Category,Stock,Minimum Stock,Low Stock\n";
      inventoryData.forEach(item => {
        csvContent += `${item.id},${item.name},${item.sku},${item.category},${item.stock},${item.minimumStock},${item.lowStock ? "Yes" : "No"}\n`;
      });
      filename = `inventory-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Report Downloaded",
      description: `${filename} has been downloaded.`
    });
  };
  
  const printReport = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      toast({
        title: "Print Error",
        description: "Could not open print window. Please check your popup blocker settings.",
        variant: "destructive"
      });
      return;
    }
    
    const reportTitle = reportType === "sales" ? "Sales Report" : "Inventory Report";
    const dateRangeText = dateRange.from && dateRange.to 
      ? `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
      : "All Time";
    
    let tableContent = "";
    
    if (reportType === "sales") {
      tableContent = `
        <table class="report-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Payment Method</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${filteredOrders.map(order => `
              <tr>
                <td>${order.id}</td>
                <td>${format(new Date(order.order_date), 'MMM dd, yyyy')}</td>
                <td>${order.customer_name || "Guest"}</td>
                <td>${order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                <td>${order.payment_method || "Unknown"}</td>
                <td>₹${order.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5"><strong>Total Sales</strong></td>
              <td><strong>₹${totalRevenue.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
      `;
    } else if (reportType === "inventory") {
      tableContent = `
        <table class="report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Min. Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${inventoryData.map(item => `
              <tr ${item.lowStock ? 'class="low-stock"' : ''}>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.sku}</td>
                <td>${item.category}</td>
                <td>${item.stock}</td>
                <td>${item.minimumStock}</td>
                <td>${item.lowStock ? "Low Stock" : "OK"}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.4;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 5px;
          }
          .report-date {
            color: #666;
            margin-bottom: 20px;
          }
          .report-summary {
            margin-bottom: 20px;
            display: flex;
            gap: 30px;
          }
          .summary-item {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
          }
          .summary-item h3 {
            margin: 0 0 5px 0;
          }
          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .report-table th, .report-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .report-table th {
            background-color: #f2f2f2;
          }
          .report-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .report-table tfoot {
            font-weight: bold;
          }
          .low-stock {
            background-color: #fff2f2 !important;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body {
              padding: 0;
              margin: 0.5cm;
            }
          }
        </style>
      </head>
      <body>
        <h1>${reportTitle}</h1>
        <div class="report-date">
          <p>Period: ${dateRangeText}</p>
          <p>Generated: ${format(new Date(), 'MMMM dd, yyyy h:mm a')}</p>
        </div>
        
        ${reportType === "sales" ? `
        <div class="report-summary">
          <div class="summary-item">
            <h3>Total Orders</h3>
            <p>${totalSales}</p>
          </div>
          <div class="summary-item">
            <h3>Total Revenue</h3>
            <p>₹${totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        ` : ''}
        
        ${tableContent}
        
        <div class="footer">
          <p>Kothari's Dry Fruits - Report generated on ${format(new Date(), 'MMMM dd, yyyy h:mm a')}</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };
  
  const formatTooltipValue = (value: number | string) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={printReport} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={generateCsv} className="gap-2">
            <Download className="h-4 w-4" />
            Export to CSV
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Tabs value={reportType} onValueChange={setReportType} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="sales">Sales Report</TabsTrigger>
                <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {reportType === "inventory" && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      if (range) {
                        setDateRange(range);
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        
        <Tabs value={reportType} className="w-full">
          <TabsContent value="sales" className="p-0">
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalSales}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Order Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : "0.00"}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                      Distribution of orders by payment method
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {paymentMethodChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={paymentMethodChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {paymentMethodChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value, 'Orders']} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-muted-foreground">No data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Sales by Category</CardTitle>
                    <CardDescription>
                      Revenue distribution by product category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {categoryChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {categoryChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => {
                              if (typeof value === 'number') {
                                return [`₹${value.toFixed(2)}`, 'Revenue'];
                              }
                              return [value, 'Revenue'];
                            }} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-muted-foreground">No data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>
                    Products with the highest sales in the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {topProducts.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={topProducts}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            width={100}
                          />
                          <Tooltip formatter={(value, name) => {
                            if (typeof value === 'number') {
                              return [name === "revenue" ? `₹${value.toFixed(2)}` : value, name === "revenue" ? "Revenue" : "Quantity Sold"];
                            }
                            return [value, name];
                          }} />
                          <Legend />
                          <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                          <Bar dataKey="quantity" name="Quantity Sold" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No sales data available for the selected period</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="inventory" className="p-0">
            <div className="p-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Status</CardTitle>
                  <CardDescription>
                    Current inventory levels by product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="relative w-full overflow-auto">
                      <table className="w-full caption-bottom text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="h-10 px-4 text-left font-medium">Name</th>
                            <th className="h-10 px-4 text-left font-medium">SKU</th>
                            <th className="h-10 px-4 text-left font-medium">Category</th>
                            <th className="h-10 px-4 text-left font-medium">Current Stock</th>
                            <th className="h-10 px-4 text-left font-medium">Min. Stock</th>
                            <th className="h-10 px-4 text-left font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryData.length > 0 ? (
                            inventoryData.map((item) => (
                              <tr 
                                key={item.id} 
                                className={`border-b ${item.lowStock ? 'bg-red-50' : ''}`}
                              >
                                <td className="p-2 px-4">{item.name}</td>
                                <td className="p-2 px-4">{item.sku}</td>
                                <td className="p-2 px-4">{item.category}</td>
                                <td className="p-2 px-4">{item.stock}</td>
                                <td className="p-2 px-4">{item.minimumStock}</td>
                                <td className="p-2 px-4">
                                  {item.lowStock ? (
                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                      Low Stock
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                      In Stock
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="h-24 text-center">
                                No inventory data available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
