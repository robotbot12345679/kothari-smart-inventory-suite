
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Order } from "@/types/pos";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  CartesianGrid,
} from "recharts";

interface SalesOverviewProps {
  orders: Order[];
}

const SalesOverview: React.FC<SalesOverviewProps> = ({ orders }) => {
  const navigate = useNavigate();
  
  // Function to prepare chart data - aggregate sales by date
  const prepareSalesData = () => {
    const salesByDate = {};
    
    if (!orders || !orders.length) return [];
    
    // Group sales by date
    orders.forEach((order) => {
      const date = new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!salesByDate[date]) {
        salesByDate[date] = 0;
      }
      salesByDate[date] += order.total;
    });
    
    // Convert to array format for Recharts
    return Object.keys(salesByDate).map((date) => ({
      date,
      sales: salesByDate[date],
    })).slice(-7); // Last 7 days
  };
  
  const salesData = prepareSalesData();
  const hasData = salesData.length > 0;

  const handleChartClick = () => {
    navigate('/analytics');
  };

  return (
    <Card className="card-hover">
      <CardHeader className="cursor-pointer" onClick={handleChartClick}>
        <CardTitle className="flex justify-between">
          Sales Overview
          <span className="text-sm text-muted-foreground hover:text-primary underline">View Analytics</span>
        </CardTitle>
        <CardDescription>Daily sales performance</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {hasData ? (
          <div 
            className="h-[300px] w-full cursor-pointer" 
            onClick={handleChartClick}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis 
                  tickFormatter={(value) => `₹${value}`} 
                  tickCount={5}
                />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Sales']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar 
                  dataKey="sales" 
                  name="Sales" 
                  fill="#c87137" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center">
            <BarChart3 className="h-12 w-12 mb-2 opacity-50" />
            <p>No sales data available yet</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/pos')} 
              className="mt-4"
            >
              Create your first order
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesOverview;
