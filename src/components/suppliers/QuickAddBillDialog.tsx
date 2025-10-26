
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Supplier, PurchaseBill } from "@/types/supplier";

interface QuickAddBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suppliers: Supplier[];
  selectedSupplierId?: string | null;
  onAdd: (bill: Omit<PurchaseBill, 'id' | 'createdDate'>) => void;
}

const QuickAddBillDialog: React.FC<QuickAddBillDialogProps> = ({
  open,
  onOpenChange,
  suppliers,
  selectedSupplierId,
  onAdd
}) => {
  const [formData, setFormData] = useState({
    supplierId: selectedSupplierId?.toString() || "",
    billNumber: "",
    billDate: new Date().toISOString().split('T')[0],
    total: 0,
    gst: 0,
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId || formData.total <= 0) return;

    const supplier = suppliers.find(s => s.id === formData.supplierId);
    if (!supplier) return;

    const subtotal = formData.total - formData.gst;

    const bill: Omit<PurchaseBill, 'id' | 'createdDate'> = {
      supplierId: supplier.id,
      supplierName: supplier.name,
      billNumber: formData.billNumber,
      billDate: formData.billDate,
      items: [{
        productName: "Total Bill Amount",
        quantity: 1,
        unit: "amount",
        pricePerUnit: subtotal,
        totalPrice: subtotal
      }],
      subtotal: subtotal,
      gst: formData.gst,
      total: formData.total,
      status: 'Pending'
    };

    onAdd(bill);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      supplierId: selectedSupplierId?.toString() || "",
      billNumber: "",
      billDate: new Date().toISOString().split('T')[0],
      total: 0,
      gst: 0,
      notes: ""
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Add Bill - Total Amount Only</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Supplier *</Label>
            <Select 
              value={formData.supplierId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Bill Number</Label>
            <Input
              value={formData.billNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, billNumber: e.target.value }))}
              placeholder="Enter bill number (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label>Bill Date</Label>
            <Input
              type="date"
              value={formData.billDate}
              onChange={(e) => setFormData(prev => ({ ...prev, billDate: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>GST Amount (₹)</Label>
            <Input
              type="number"
              value={formData.gst}
              onChange={(e) => setFormData(prev => ({ ...prev, gst: parseFloat(e.target.value) || 0 }))}
              placeholder="Enter GST amount"
            />
          </div>

          <div className="space-y-2">
            <Label>Total Bill Amount (₹) *</Label>
            <Input
              type="number"
              value={formData.total}
              onChange={(e) => setFormData(prev => ({ ...prev, total: parseFloat(e.target.value) || 0 }))}
              placeholder="Enter total amount"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Bill
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddBillDialog;
