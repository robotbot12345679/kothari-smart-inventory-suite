
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
  
  // Function to prepare chart data - aggregate sales by day for current month (only up to current date)
  const prepareMonthlySalesData = () => {
    if (!orders || !orders.length) return [];
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentDay = currentDate.getDate();
    
    // Get orders from current month
    const currentMonthOrders = orders.filter(order => {
      const orderDate = new Date(order.order_date);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    
    // Create daily sales data for current month (only up to current date)
    const dailyData = {};
    
    // Initialize only the days that have passed so far
    for (let day = 1; day <= currentDay; day++) {
      const dateKey = `${day}`;
      dailyData[dateKey] = 0;
    }
    
    // Aggregate sales by day
    currentMonthOrders.forEach((order) => {
      const orderDay = new Date(order.order_date).getDate();
      const dateKey = `${orderDay}`;
      // Only include if the day has passed or is today
      if (orderDay <= currentDay) {
        dailyData[dateKey] += order.total;
      }
    });
    
    // Convert to array format for Recharts
    return Object.keys(dailyData).map((day) => ({
      day: `${day}`,
      sales: dailyData[day],
    }));
  };
  
  const salesData = prepareMonthlySalesData();
  const hasData = salesData.some(item => item.sales > 0);

  const handleChartClick = () => {
    navigate('/analytics');
  };

  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const currentDay = new Date().getDate();

  return (
    <Card className="card-hover">
      <CardHeader className="cursor-pointer" onClick={handleChartClick}>
        <CardTitle className="flex justify-between">
          Sales Overview
          <span className="text-sm text-muted-foreground hover:text-primary underline">View Analytics</span>
        </CardTitle>
        <CardDescription>{currentMonthName} daily sales (up to day {currentDay})</CardDescription>
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
                <XAxis 
                  dataKey="day" 
                  fontSize={10}
                  interval={0}
                />
                <YAxis 
                  tickFormatter={(value) => `₹${value}`} 
                  tickCount={5}
                  fontSize={10}
                />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Sales']}
                  labelFormatter={(label) => `Day ${label}`}
                />
                <Bar 
                  dataKey="sales" 
                  name="Sales" 
                  fill="#c87137" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center">
            <BarChart3 className="h-12 w-12 mb-2 opacity-50" />
            <p>No sales data available for {currentMonthName}</p>
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
