import { DataTablePagination, usePagination } from "@/components/ui/data-table-pagination";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Calendar, DollarSign, Image, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Payment } from "@/types/supplier";
import ConfirmDialog from "@/components/ui/confirm-dialog";

interface PaymentsListProps {
  payments: Payment[];
  onDelete?: (paymentId: string) => void;
}

const PaymentsList: React.FC<PaymentsListProps> = ({ payments, onDelete }) => {
  const { toast } = useToast();

  const [pendingDelete, setPendingDelete] = React.useState<{ id: string; amount: number } | null>(null);

  const handleDelete = (paymentId: string, amount: number) => {
    setPendingDelete({ id: paymentId, amount });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    onDelete?.(pendingDelete.id);
    toast({
      title: "Payment Deleted",
      description: `Payment of ₹${pendingDelete.amount.toLocaleString()} has been deleted successfully.`,
    });
    setPendingDelete(null);
  };

  const pager = usePagination(payments);
  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No payments found</p>
        </CardContent>
      </Card>
    );
  }

  const getPaymentModeColor = (mode: string) => {
    switch (mode) {
      case 'Cash': return 'bg-blue-100 text-blue-800';
      case 'Online': return 'bg-green-100 text-green-800';
      case 'Cheque': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payments ({payments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pager.pageItems.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {new Date(payment.paymentDate).toLocaleDateString('en-IN')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 font-medium">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    ₹{payment.amount.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getPaymentModeColor(payment.paymentMode)}>
                    {payment.paymentMode}
                  </Badge>
                </TableCell>
                <TableCell>
                  {payment.referenceNumber && (
                    <span className="text-sm font-mono">
                      {payment.referenceNumber}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {payment.screenshot && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Image className="h-3 w-3" />
                      Screenshot
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(payment.id, payment.amount)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
<DataTablePagination {...pager} />
      </CardContent>
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Delete payment?"
        description={pendingDelete ? `Are you sure you want to delete the payment of ₹${pendingDelete.amount.toLocaleString()}? This cannot be undone.` : undefined}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
      />
    </Card>
  );
};

export default PaymentsList;
