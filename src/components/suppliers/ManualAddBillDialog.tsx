
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { Supplier, PurchaseBill, PurchaseItem } from "@/types/supplier";

interface ManualAddBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suppliers: Supplier[];
  onAdd: (bill: Omit<PurchaseBill, 'id' | 'createdDate'>) => void;
}

const ManualAddBillDialog: React.FC<ManualAddBillDialogProps> = ({
  open,
  onOpenChange,
  suppliers,
  onAdd
}) => {
  const [formData, setFormData] = useState({
    supplierId: "",
    billNumber: "",
    billDate: new Date().toISOString().split('T')[0],
    items: [
      {
        productName: "",
        quantity: 0,
        unit: "kg",
        pricePerUnit: 0,
        totalPrice: 0
      }
    ] as PurchaseItem[],
    subtotal: 0,
    gst: 0,
    total: 0
  });

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productName: "",
        quantity: 0,
        unit: "kg",
        pricePerUnit: 0,
        totalPrice: 0
      }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      if (field === 'quantity' || field === 'pricePerUnit') {
        newItems[index].totalPrice = newItems[index].quantity * newItems[index].pricePerUnit;
      }
      
      // Calculate totals
      const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const total = subtotal + prev.gst;
      
      return { 
        ...prev, 
        items: newItems,
        subtotal,
        total
      };
    });
  };

  const handleGstChange = (gst: number) => {
    setFormData(prev => ({
      ...prev,
      gst,
      total: prev.subtotal + gst
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId || formData.items.length === 0) return;

    const supplier = suppliers.find(s => s.id === formData.supplierId);
    if (!supplier) return;

    const bill: Omit<PurchaseBill, 'id' | 'createdDate'> = {
      supplierId: supplier.id,
      supplierName: supplier.name,
      billNumber: formData.billNumber,
      billDate: formData.billDate,
      items: formData.items.filter(item => item.productName.trim() !== ""),
      subtotal: formData.subtotal,
      gst: formData.gst,
      total: formData.total,
      status: 'Pending'
    };

    onAdd(bill);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      supplierId: "",
      billNumber: "",
      billDate: new Date().toISOString().split('T')[0],
      items: [{
        productName: "",
        quantity: 0,
        unit: "kg",
        pricePerUnit: 0,
        totalPrice: 0
      }],
      subtotal: 0,
      gst: 0,
      total: 0
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Bill Manually</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
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
                placeholder="Enter bill number"
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
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 items-end p-3 bg-muted/50 rounded">
                  <div>
                    <Label className="text-xs">Product *</Label>
                    <Input
                      value={item.productName}
                      onChange={(e) => updateItem(index, 'productName', e.target.value)}
                      placeholder="Product name"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Unit</Label>
                    <Input
                      value={item.unit}
                      onChange={(e) => updateItem(index, 'unit', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Rate</Label>
                    <Input
                      type="number"
                      value={item.pricePerUnit}
                      onChange={(e) => updateItem(index, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Total</Label>
                    <Input
                      type="number"
                      value={item.totalPrice}
                      readOnly
                      className="h-8 bg-muted"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="h-8"
                    disabled={formData.items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Subtotal</Label>
              <Input
                type="number"
                value={formData.subtotal}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>GST</Label>
              <Input
                type="number"
                value={formData.gst}
                onChange={(e) => handleGstChange(parseFloat(e.target.value) || 0)}
                placeholder="GST amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <Input
                type="number"
                value={formData.total}
                readOnly
                className="bg-muted font-semibold"
              />
            </div>
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

export default ManualAddBillDialog;
