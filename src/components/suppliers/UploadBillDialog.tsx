
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Supplier, PurchaseBill, PurchaseItem } from "@/types/supplier";

interface UploadBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suppliers: Supplier[];
  onUpload: (bill: Omit<PurchaseBill, 'id' | 'createdDate'>) => void;
}

const UploadBillDialog: React.FC<UploadBillDialogProps> = ({
  open,
  onOpenChange,
  suppliers,
  onUpload
}) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [formData, setFormData] = useState({
    supplierId: "",
    billNumber: "",
    billDate: new Date().toISOString().split('T')[0],
    items: [] as PurchaseItem[],
    subtotal: 0,
    gst: 0,
    total: 0
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      // Simulate AI processing (in real implementation, this would call an AI service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock extracted data
      const mockExtractedData = {
        supplierName: "Kailash Kirana",
        billNumber: `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        billDate: new Date().toISOString().split('T')[0],
        items: [
          {
            productName: "Premium Almonds",
            quantity: 10,
            unit: "kg",
            pricePerUnit: 800,
            totalPrice: 8000
          },
          {
            productName: "Cashews",
            quantity: 5,
            unit: "kg", 
            pricePerUnit: 1200,
            totalPrice: 6000
          }
        ],
        subtotal: 14000,
        gst: 2520,
        total: 16520
      };

      setExtractedData(mockExtractedData);
      
      // Find supplier by name
      const supplier = suppliers.find(s => 
        s.name.toLowerCase().includes(mockExtractedData.supplierName.toLowerCase())
      );
      
      setFormData({
        supplierId: supplier?.id.toString() || "",
        billNumber: mockExtractedData.billNumber,
        billDate: mockExtractedData.billDate,
        items: mockExtractedData.items,
        subtotal: mockExtractedData.subtotal,
        gst: mockExtractedData.gst,
        total: mockExtractedData.total
      });

      toast({
        title: "File Processed",
        description: "AI has extracted the bill information. Please review and confirm.",
      });

    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Failed to process the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.supplierId) {
      toast({
        title: "Validation Error",
        description: "Please select a supplier.",
        variant: "destructive"
      });
      return;
    }

    const supplier = suppliers.find(s => s.id === parseInt(formData.supplierId));
    if (!supplier) return;

    const bill: Omit<PurchaseBill, 'id' | 'createdDate'> = {
      supplierId: supplier.id,
      supplierName: supplier.name,
      billNumber: formData.billNumber,
      billDate: formData.billDate,
      items: formData.items,
      subtotal: formData.subtotal,
      gst: formData.gst,
      total: formData.total,
      uploadedFile: selectedFile?.name,
      extractedData,
      status: 'Pending'
    };

    onUpload(bill);
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setFormData({
      supplierId: "",
      billNumber: "",
      billDate: new Date().toISOString().split('T')[0],
      items: [],
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
          <DialogTitle>Upload Purchase Bill / Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <Label>Upload File (PDF, Excel, Image, Screenshot, ZIP)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Drag and drop your files here, or click to browse
                </p>
                <Input
                  type="file"
                  accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png,.zip"
                  onChange={handleFileUpload}
                  className="max-w-xs mx-auto"
                />
              </div>
            </div>

            {selectedFile && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {isProcessing && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Processing with AI...</p>
              </div>
            )}
          </div>

          {/* Extracted/Manual Data Section */}
          {(extractedData || !selectedFile) && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Supplier</Label>
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

                <div className="space-y-2">
                  <Label>Total Amount</Label>
                  <Input
                    type="number"
                    value={formData.total}
                    onChange={(e) => setFormData(prev => ({ ...prev, total: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter total amount"
                  />
                </div>
              </div>

              {/* Items Section */}
              {formData.items.length > 0 && (
                <div className="space-y-2">
                  <Label>Extracted Items</Label>
                  <div className="border rounded-lg p-4 space-y-2 max-h-40 overflow-y-auto">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <div>
                          <span className="font-medium">{item.productName}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {item.quantity} {item.unit} × ₹{item.pricePerUnit}
                          </span>
                        </div>
                        <span className="font-medium">₹{item.totalPrice}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.supplierId || isProcessing}>
              Save Bill
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadBillDialog;
