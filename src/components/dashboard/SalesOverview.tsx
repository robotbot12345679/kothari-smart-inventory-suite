
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
  
  // Function to prepare chart data - aggregate sales by hour for today
  const prepareSalesData = () => {
    if (!orders || !orders.length) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
    
    // Create hourly sales data
    const hourlyData = {};
    
    // Initialize all hours (6 AM to 10 PM)
    for (let hour = 6; hour <= 22; hour++) {
      let timeLabel = hour <= 12 ? `${hour}AM` : `${hour - 12}PM`;
      if (hour === 12) timeLabel = "12PM";
      hourlyData[timeLabel] = 0;
    }
    
    // Aggregate sales by hour
    todaysOrders.forEach((order) => {
      const orderHour = new Date(order.orderDate).getHours();
      if (orderHour >= 6 && orderHour <= 22) {
        let timeLabel = orderHour <= 12 ? `${orderHour}AM` : `${orderHour - 12}PM`;
        const displayLabel = orderHour === 12 ? "12PM" : timeLabel;
        hourlyData[displayLabel] += order.total;
      }
    });
    
    // Convert to array format for Recharts
    return Object.keys(hourlyData).map((time) => ({
      time,
      sales: hourlyData[time],
    }));
  };
  
  const salesData = prepareSalesData();
  const hasData = salesData.some(item => item.sales > 0);

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
        <CardDescription>Today's hourly sales performance</CardDescription>
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
                  dataKey="time" 
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tickFormatter={(value) => `₹${value}`} 
                  tickCount={5}
                  fontSize={10}
                />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Sales']}
                  labelFormatter={(label) => `Time: ${label}`}
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
            <p>No sales data available for today</p>
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
