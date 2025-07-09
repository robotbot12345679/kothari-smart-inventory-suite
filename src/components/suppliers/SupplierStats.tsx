
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  CreditCard, 
  AlertTriangle, 
  Calendar,
  Clock,
  Plus
} from "lucide-react";
import { Supplier, SupplierAnalytics } from "@/types/supplier";

interface SupplierStatsProps {
  supplier: Supplier;
  analytics: SupplierAnalytics;
  onAddPayment: () => void;
}

const SupplierStats: React.FC<SupplierStatsProps> = ({
  supplier,
  analytics,
  onAddPayment
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{supplier.name} - Analytics</h2>
        <Button onClick={onAddPayment} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Payment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.totalPurchases.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {analytics.billCount} bills
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.totalPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.paymentCount} payments made
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${analytics.pendingAmount > 0 ? 'text-red-500' : 'text-green-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${analytics.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₹{analytics.pendingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.pendingAmount > 0 ? 'Outstanding' : 'All cleared'}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Bill Date</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {analytics.lastBillDate 
                ? new Date(analytics.lastBillDate).toLocaleDateString('en-IN')
                : 'No bills'
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Latest purchase
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {analytics.lastPaymentDate 
                ? new Date(analytics.lastPaymentDate).toLocaleDateString('en-IN')
                : 'No payments'
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Latest payment
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierStats;
