
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { Order } from "@/types/pos";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

interface RecentOrdersCardProps {
  recentOrders: Order[];
}

const RecentOrdersCard: React.FC<RecentOrdersCardProps> = ({ recentOrders }) => {
  const navigate = useNavigate();

  // Helper function to simplify order numbers
  const getSimplifiedOrderId = (orderId: string | undefined): string => {
    if (!orderId) return "";
    // Extract just the numeric part if it follows a pattern like 'ORD12345'
    const match = orderId.match(/[A-Za-z]+(\d+)/);
    return match ? `#${match[1]}` : `#${orderId}`;
  };

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest transactions</CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center text-primary"
          asChild
        >
          <Link to="/orders">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recentOrders && recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <Link 
                key={order.id} 
                to="/orders"
                className="flex justify-between items-center hover:bg-muted/50 p-2 rounded-md cursor-pointer block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Order {getSimplifiedOrderId(order.id)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.order_date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{order.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.items?.length || 0} item(s)
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="mb-4">No orders yet</p>
            <Button variant="outline" onClick={() => navigate('/orders')}>
              Create Order
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrdersCard;
