
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, X, Plus, Trash2 } from "lucide-react";
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadType, setUploadType] = useState<'bills' | 'ledgers'>('bills');
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
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles(files);
    setIsProcessing(true);

    try {
      // Simulate enhanced AI processing for multiple files
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock more comprehensive extracted data
      const mockExtractedData = {
        supplierName: "ABC Suppliers Pvt Ltd",
        originalBillNumber: "INV/2024/001234", // Preserve original number
        billDate: new Date().toISOString().split('T')[0],
        items: [
          {
            productName: "Premium Basmati Rice",
            quantity: 25,
            unit: "kg",
            pricePerUnit: 120,
            totalPrice: 3000
          },
          {
            productName: "Organic Almonds",
            quantity: 10,
            unit: "kg", 
            pricePerUnit: 850,
            totalPrice: 8500
          },
          {
            productName: "Cashew Nuts (W240)",
            quantity: 5,
            unit: "kg",
            pricePerUnit: 1400,
            totalPrice: 7000
          },
          {
            productName: "Dates (Medjool)",
            quantity: 8,
            unit: "kg",
            pricePerUnit: 650,
            totalPrice: 5200
          },
          {
            productName: "Pistachios",
            quantity: 3,
            unit: "kg",
            pricePerUnit: 2200,
            totalPrice: 6600
          }
        ],
        subtotal: 30300,
        gst: 5454,
        total: 35754
      };

      setExtractedData(mockExtractedData);
      
      // Find supplier by name
      const supplier = suppliers.find(s => 
        s.name.toLowerCase().includes(mockExtractedData.supplierName.toLowerCase())
      );
      
      setFormData({
        supplierId: supplier?.id.toString() || "",
        billNumber: mockExtractedData.originalBillNumber, // Use original bill number
        billDate: mockExtractedData.billDate,
        items: mockExtractedData.items,
        subtotal: mockExtractedData.subtotal,
        gst: mockExtractedData.gst,
        total: mockExtractedData.total
      });

      toast({
        title: "Files Processed Successfully",
        description: `AI extracted data from ${files.length} file(s). ${mockExtractedData.items.length} items detected.`,
      });

    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Failed to process the files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

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
      
      // Auto-calculate total price
      if (field === 'quantity' || field === 'pricePerUnit') {
        newItems[index].totalPrice = newItems[index].quantity * newItems[index].pricePerUnit;
      }
      
      return { ...prev, items: newItems };
    });
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
      billNumber: formData.billNumber, // Keep original bill number
      billDate: formData.billDate,
      items: formData.items,
      subtotal: formData.subtotal,
      gst: formData.gst,
      total: formData.total,
      uploadedFile: selectedFiles.map(f => f.name).join(', '),
      extractedData,
      status: 'Pending'
    };

    onUpload(bill);
    handleClose();
  };

  const handleClose = () => {
    setSelectedFiles([]);
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>

        <Tabs value={uploadType} onValueChange={(value: any) => setUploadType(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bills">Purchase Bills</TabsTrigger>
            <TabsTrigger value="ledgers">Ledgers</TabsTrigger>
          </TabsList>

          <TabsContent value="bills" className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-4">
              <Label>Upload Bills (PDF, Excel, Image, Screenshot, ZIP - Multiple files supported)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your files here, or click to browse (Multiple files allowed)
                  </p>
                  <Input
                    type="file"
                    accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png,.zip"
                    onChange={handleFileUpload}
                    multiple
                    className="max-w-xs mx-auto"
                  />
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files ({selectedFiles.length})</Label>
                  <div className="grid gap-2">
                    {selectedFiles.map((file, index) => (
                      <Card key={index}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm font-medium">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Processing with Enhanced AI Scanner...</p>
                </div>
              )}
            </div>

            {/* Extracted/Manual Data Section */}
            {(extractedData || !selectedFiles.length) && (
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
                    <Label>Bill Number (Original)</Label>
                    <Input
                      value={formData.billNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, billNumber: e.target.value }))}
                      placeholder="Original bill number will be preserved"
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
                  
                  {formData.items.length > 0 && (
                    <div className="border rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
                      {formData.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-6 gap-2 items-end p-3 bg-muted/50 rounded">
                          <div>
                            <Label className="text-xs">Product</Label>
                            <Input
                              value={item.productName}
                              onChange={(e) => updateItem(index, 'productName', e.target.value)}
                              placeholder="Product name"
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Qty</Label>
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
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ledgers" className="space-y-6">
            <div className="space-y-4">
              <Label>Upload Ledgers (PDF, Excel, Image, Screenshot, ZIP)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Upload supplier ledgers for account reconciliation
                  </p>
                  <Input
                    type="file"
                    accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png,.zip"
                    multiple
                    className="max-w-xs mx-auto"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.supplierId || isProcessing}>
            Save {uploadType === 'bills' ? 'Bills' : 'Ledgers'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadBillDialog;
