
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Order } from "@/types/pos";

interface SalesOverviewProps {
  orders: Order[];
}

const SalesOverview: React.FC<SalesOverviewProps> = ({ orders }) => {
  const navigate = useNavigate();

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Daily sales performance</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {orders && orders.length > 0 ? (
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
  );
};

export default SalesOverview;
