
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Calendar, DollarSign } from "lucide-react";
import { PurchaseBill } from "@/types/supplier";

interface PurchaseBillsListProps {
  bills: PurchaseBill[];
}

const PurchaseBillsList: React.FC<PurchaseBillsListProps> = ({ bills }) => {
  if (bills.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No purchase bills found</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Purchase Bills ({bills.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-medium">
                  {bill.billNumber || bill.id.substring(0, 8)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {new Date(bill.billDate).toLocaleDateString('en-IN')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {bill.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="text-sm">
                        {item.productName} ({item.quantity} {item.unit})
                      </div>
                    ))}
                    {bill.items.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{bill.items.length - 2} more items
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    ₹{bill.total.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(bill.status)}>
                    {bill.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PurchaseBillsList;
