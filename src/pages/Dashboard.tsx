
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight
} from "lucide-react";

const Dashboard = () => {
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
            <CardTitle className="text-sm font-medium">Total Sales Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹24,500</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-emerald-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" /> 12%
              </span>
              from yesterday
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-amber-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" /> 3
              </span>
              since last week
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-emerald-500 flex items-center mr-1">
                <ArrowDownRight className="h-3 w-3 mr-1" /> 8%
              </span>
              from yesterday
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Count</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground mt-1">
              15 categories
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="card-hover md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Daily sales performance for the past week</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground flex flex-col items-center">
                <BarChart3 className="h-12 w-12 mb-2 opacity-50" />
                <p>Sales chart will appear here</p>
                <p className="text-xs">Data is being processed...</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>System generated recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium text-sm text-primary">Stock Alert</p>
                <p className="text-sm mt-1">Cashews (250g) inventory level is below threshold. Consider reordering.</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium text-sm text-primary">Sales Pattern</p>
                <p className="text-sm mt-1">Pistachios sales increased by 32% this week. Consider increasing stock.</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium text-sm text-primary">Expiry Warning</p>
                <p className="text-sm mt-1">5 products are expiring in the next 30 days. Review in inventory.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 5 orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((order) => (
                <div key={order} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">Order #{(1000 + order).toString()}</p>
                    <p className="text-xs text-muted-foreground">Customer {100 + order}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{(order * 1250).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Today, {order + 8}:00 AM</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>This week's best performers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Cashews Premium', 'Mixed Dry Fruits', 'California Almonds', 'Pistachios', 'Walnuts'].map((product, index) => (
                <div key={product} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-medium mr-2">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product}</p>
                      <p className="text-xs text-muted-foreground">{Math.round(100 - index * 10)}% profit margin</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Math.round(500 - index * 50)} units</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>Current stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Almonds</span>
                  <span className="text-sm text-primary">85%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Cashews</span>
                  <span className="text-sm text-amber-500">42%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Pistachios</span>
                  <span className="text-sm text-destructive">15%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-destructive rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Walnuts</span>
                  <span className="text-sm text-emerald-500">92%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Mixed Dry Fruits</span>
                  <span className="text-sm text-primary">78%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
