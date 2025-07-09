
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image, Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Supplier, Payment } from "@/types/supplier";
import { aiDetectionService } from "@/services/AIDetectionService";

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suppliers: Supplier[];
  selectedSupplierId: number | null;
  onAdd: (payment: Omit<Payment, 'id' | 'createdDate'>) => void;
}

const AddPaymentDialog: React.FC<AddPaymentDialogProps> = ({
  open,
  onOpenChange,
  suppliers,
  selectedSupplierId,
  onAdd
}) => {
  const { toast } = useToast();
  const [isDetectingAmount, setIsDetectingAmount] = useState(false);
  const [formData, setFormData] = useState({
    supplierId: selectedSupplierId?.toString() || "",
    amount: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: "Cash" as const,
    referenceNumber: "",
    notes: ""
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const handleScreenshotUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScreenshot(file);
    setIsDetectingAmount(true);

    try {
      console.log('Starting enhanced payment detection...');
      const detectedData = await aiDetectionService.detectPaymentData(file);
      
      setFormData(prev => ({
        ...prev,
        amount: detectedData.amount.toString(),
        paymentDate: detectedData.date,
        referenceNumber: detectedData.referenceNumber || "",
        paymentMode: (detectedData.paymentMode as any) || "Online"
      }));

      toast({
        title: "Enhanced AI Detection Complete",
        description: `Detected payment: ₹${detectedData.amount.toLocaleString()} on ${new Date(detectedData.date).toLocaleDateString()}`,
      });

    } catch (error) {
      console.error('Enhanced payment detection failed:', error);
      toast({
        title: "Enhanced Detection Failed",
        description: "Could not detect payment details from screenshot. Please enter manually.",
        variant: "destructive"
      });
    } finally {
      setIsDetectingAmount(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId || !formData.amount) return;

    const supplier = suppliers.find(s => s.id === parseInt(formData.supplierId));
    if (!supplier) return;

    const payment: Omit<Payment, 'id' | 'createdDate'> = {
      supplierId: supplier.id,
      supplierName: supplier.name,
      amount: parseFloat(formData.amount),
      paymentDate: formData.paymentDate,
      paymentMode: formData.paymentMode,
      referenceNumber: formData.referenceNumber || undefined,
      screenshot: screenshot?.name || undefined,
      notes: formData.notes || undefined
    };

    onAdd(payment);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      supplierId: selectedSupplierId?.toString() || "",
      amount: "",
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: "Cash",
      referenceNumber: "",
      notes: ""
    });
    setScreenshot(null);
    setIsDetectingAmount(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment - Enhanced AI Detection</DialogTitle>
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
                {suppliers.filter(s => s.isActive).map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Upload Payment Screenshot/Receipt (Enhanced Auto-detection)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
              {isDetectingAmount ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Enhanced AI analyzing payment details...</p>
                  <p className="text-xs text-muted-foreground">Detecting amount, date, and reference number</p>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">Upload payment screenshot for enhanced auto-detection</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="max-w-xs mx-auto"
                  />
                </>
              )}
            </div>

            {screenshot && (
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      <span className="text-sm">{screenshot.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setScreenshot(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount * {isDetectingAmount && "(Auto-detecting...)"}</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Enter amount"
                disabled={isDetectingAmount}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Mode</Label>
            <Select 
              value={formData.paymentMode} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, paymentMode: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Online">Online/UPI</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.paymentMode !== "Cash" && (
            <div className="space-y-2">
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                value={formData.referenceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                placeholder="Auto-detected or enter manually"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any notes about this payment"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isDetectingAmount}>
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentDialog;
