import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, X, Plus, Trash2, Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Supplier, PurchaseBill, PurchaseItem } from "@/types/supplier";
import { aiDetectionService } from "@/services/AIDetectionService";

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
      if (files.length === 1) {
        // Single file processing
        const detectedData = await aiDetectionService.detectBillData(files[0]);
        
        setExtractedData(detectedData);
        
        // Find supplier by name
        const supplier = suppliers.find(s => 
          s.name.toLowerCase().includes(detectedData.supplierName.toLowerCase()) ||
          detectedData.supplierName.toLowerCase().includes(s.name.toLowerCase())
        );
        
        setFormData({
          supplierId: supplier?.id.toString() || "",
          billNumber: detectedData.billNumber,
          billDate: detectedData.billDate,
          items: detectedData.items,
          subtotal: detectedData.subtotal,
          gst: detectedData.gst,
          total: detectedData.total
        });

        toast({
          title: "Enhanced AI Detection Complete",
          description: `Detected ${detectedData.items.length} items from ${files[0].name}. Bill: ${detectedData.billNumber}`,
        });
      } else {
        // Multiple files processing
        const allDetectedData = await aiDetectionService.detectMultipleBills(files);
        
        // For multiple files, we'll process the first one and show summary
        if (allDetectedData.length > 0) {
          const firstBill = allDetectedData[0];
          setExtractedData(firstBill);
          
          const supplier = suppliers.find(s => 
            s.name.toLowerCase().includes(firstBill.supplierName.toLowerCase())
          );
          
          setFormData({
            supplierId: supplier?.id.toString() || "",
            billNumber: firstBill.billNumber,
            billDate: firstBill.billDate,
            items: firstBill.items,
            subtotal: firstBill.subtotal,
            gst: firstBill.gst,
            total: firstBill.total
          });
        }

        toast({
          title: "Bulk Processing Complete",
          description: `Successfully processed ${allDetectedData.length} out of ${files.length} files.`,
        });
      }

    } catch (error) {
      console.error('AI Detection failed:', error);
      toast({
        title: "Enhanced AI Detection Failed",
        description: "Failed to process the files. Please check the files and try again.",
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

    const supplier = suppliers.find(s => s.id === formData.supplierId);
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
          <DialogTitle>Upload Documents - Enhanced AI Detection</DialogTitle>
        </DialogHeader>

        <Tabs value={uploadType} onValueChange={(value: any) => setUploadType(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bills">Purchase Bills</TabsTrigger>
            <TabsTrigger value="ledgers">Ledgers</TabsTrigger>
          </TabsList>

          <TabsContent value="bills" className="space-y-6">
            <div className="space-y-4">
              <Label>Upload Bills (PDF, Excel, Image, Screenshot, ZIP - Multiple files supported)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader className="h-12 w-12 animate-spin text-primary" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Enhanced AI Processing...</p>
                      <p className="text-xs text-muted-foreground">
                        Analyzing {selectedFiles.length} file(s) for complete bill data extraction
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
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
            </div>

            {/* Enhanced extracted data display */}
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
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Bill Number (Preserved from original)</Label>
                    <Input
                      value={formData.billNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, billNumber: e.target.value }))}
                      placeholder="Original bill number preserved"
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
                      placeholder="Total amount"
                    />
                  </div>
                </div>

                {/* Enhanced items section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Detected Items ({formData.items.length})</Label>
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
