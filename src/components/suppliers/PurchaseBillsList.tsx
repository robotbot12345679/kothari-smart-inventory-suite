
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Calendar, DollarSign, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PurchaseBill } from "@/types/supplier";

interface PurchaseBillsListProps {
  bills: PurchaseBill[];
  onDelete?: (billId: string) => void;
}

const PurchaseBillsList: React.FC<PurchaseBillsListProps> = ({ bills, onDelete }) => {
  const { toast } = useToast();

  const handleDelete = (billId: string, billNumber: string) => {
    if (window.confirm(`Are you sure you want to delete bill ${billNumber}?`)) {
      onDelete?.(billId);
      toast({
        title: "Bill Deleted",
        description: `Bill ${billNumber} has been deleted successfully.`,
      });
    }
  };

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
              <TableHead>Actions</TableHead>
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
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(bill.id, bill.billNumber || bill.id.substring(0, 8))}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
