
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Package, 
  AlertTriangle,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StatsCardsProps {
  totalSales: number;
  activeProducts: number;
  lowStockItems: number;
  pendingOrders: number;
  totalOrders: number;
  todaysSales: number;
  todaysOrders: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ 
  totalSales, 
  activeProducts, 
  lowStockItems, 
  pendingOrders,
  totalOrders,
  todaysSales,
  todaysOrders
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
          <Calendar className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{todaysSales.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            From {todaysOrders || 0} orders today
          </p>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{totalSales.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            From {totalOrders || 0} orders
          </p>
        </CardContent>
      </Card>
      
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Product Count</CardTitle>
          <Package className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeProducts.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {activeProducts} active products
          </p>
        </CardContent>
      </Card>

      <Card 
        className="card-hover cursor-pointer" 
        onClick={() => navigate('/inventory')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lowStockItems}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {lowStockItems > 0 ? (
              <span className="text-amber-500 flex items-center cursor-pointer hover:underline">
                Requires attention - Click to view
              </span>
            ) : (
              "All items well stocked"
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
