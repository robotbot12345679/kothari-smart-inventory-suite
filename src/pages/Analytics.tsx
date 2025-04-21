import React from "react";
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

  // Order count
  const orderCount = orders.length;

  // Simple conversion rate: orders / total customers (if totalCustomers > 0)
  const conversionRate = totalCustomers > 0
    ? ((orderCount / totalCustomers) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <div className="flex items-center gap-2">
          <Select defaultValue="30">
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
              <span className="text-emerald-500 mr-1">↑</span>
              from last period
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
              <span className="text-emerald-500 mr-1">↑</span>
              from last period
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
              <span className="text-emerald-500 mr-1">↑</span>
              from last period
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
              <span className="text-red-500 mr-1">↓</span>
              from last period
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
                <CardDescription>Daily sales over the selected period</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] flex items-center justify-center">
                <div className="text-muted-foreground flex flex-col items-center">
                  <LineChart className="h-12 w-12 mb-2 opacity-50" />
                  <p>Sales trend chart will appear here</p>
                  <p className="text-xs">Sales data is being processed...</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>By revenue in the selected period</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground flex flex-col items-center">
                  <BarChart3 className="h-12 w-12 mb-2 opacity-50" />
                  <p>Product chart will appear here</p>
                  <p className="text-xs">Product data is being processed...</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution by product category</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground flex flex-col items-center">
                  <PieChart className="h-12 w-12 mb-2 opacity-50" />
                  <p>Category chart will appear here</p>
                  <p className="text-xs">Category data is being processed...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Inventory Turnover Ratio</CardTitle>
              <CardDescription>Analysis of inventory efficiency</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-muted-foreground flex flex-col items-center">
                <BarChart3 className="h-12 w-12 mb-2 opacity-50" />
                <p>Inventory turnover chart will appear here</p>
                <p className="text-xs">Inventory data is being processed...</p>
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
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-muted-foreground flex flex-col items-center">
                <LineChart className="h-12 w-12 mb-2 opacity-50" />
                <p>Customer pattern chart will appear here</p>
                <p className="text-xs">Customer data is being processed...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>Smart recommendations based on your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="font-medium text-sm text-primary">Inventory Optimization</p>
                  <p className="text-sm mt-1">Consider increasing stock levels for cashews by 15% to meet rising demand trends.</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="font-medium text-sm text-primary">Price Optimization</p>
                  <p className="text-sm mt-1">A 5% price increase on premium pistachios could yield 8% more revenue based on elasticity analysis.</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="font-medium text-sm text-primary">Sales Forecast</p>
                  <p className="text-sm mt-1">Projected 22% sales increase for next month based on seasonal patterns and current trends.</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="font-medium text-sm text-primary">Customer Segment Opportunity</p>
                  <p className="text-sm mt-1">Targeting corporate gift boxes could increase B2B sales by 30% based on market analysis.</p>
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
