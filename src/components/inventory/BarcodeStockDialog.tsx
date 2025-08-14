import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/types/pos";
import { useData } from "@/context/DataContext";
import { ScanLine, Package, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BarcodeStockDialogProps {
  children?: React.ReactNode;
}

const BarcodeStockDialog: React.FC<BarcodeStockDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [additionalStock, setAdditionalStock] = useState<number>(0);
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { findProductByBarcode, updateInventoryStock } = useData();
  const { toast } = useToast();
  
  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setBarcode("");
      setAdditionalStock(0);
      setFoundProduct(null);
      setIsScanning(false);
    }
  }, [open]);

  // Auto-search product when barcode is entered
  useEffect(() => {
    if (barcode.trim()) {
      const product = findProductByBarcode(barcode.trim());
      setFoundProduct(product);
      if (!product) {
        toast({
          title: "Product not found",
          description: `No product found with barcode: ${barcode}`,
          variant: "destructive"
        });
      }
    } else {
      setFoundProduct(null);
    }
  }, [barcode, findProductByBarcode, toast]);
  
  const handleBarcodeChange = (value: string) => {
    setBarcode(value);
  };

  const handleUpdate = () => {
    if (additionalStock > 0 && foundProduct) {
      updateInventoryStock(foundProduct.id, additionalStock);
      toast({
        title: "Stock updated",
        description: `Added ${additionalStock} ${foundProduct.unit} to ${foundProduct.name}`,
      });
      setAdditionalStock(0);
      setBarcode("");
      setFoundProduct(null);
      setOpen(false);
    }
  };

  const handleScanMode = () => {
    setIsScanning(true);
    // Focus the input for manual entry or hardware scanner input
    const input = document.getElementById('barcode-input');
    if (input) {
      input.focus();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <ScanLine className="h-4 w-4" />
            Scan Barcode
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5" />
            Add Stock by Barcode
          </DialogTitle>
          <DialogDescription>
            Scan or enter a product barcode to automatically detect the product and add stock.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Barcode Input Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barcode-input">Product Barcode</Label>
              <div className="flex gap-2">
                <Input 
                  id="barcode-input"
                  value={barcode}
                  onChange={(e) => handleBarcodeChange(e.target.value)}
                  placeholder="Enter or scan barcode..."
                  className={`flex-1 ${isScanning ? 'ring-2 ring-primary' : ''}`}
                  autoFocus
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleScanMode}
                  className={isScanning ? 'bg-primary/10' : ''}
                >
                  <ScanLine className="h-4 w-4" />
                </Button>
              </div>
              {isScanning && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  Ready to scan - Point scanner at barcode or type manually
                </p>
              )}
            </div>
          </div>

          {/* Product Found Section */}
          {foundProduct && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Product Found
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Product Name</Label>
                    <p className="font-medium">{foundProduct.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">SKU</Label>
                    <p className="font-medium">{foundProduct.sku}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Current Stock</Label>
                    <p className="font-medium">{foundProduct.stock} {foundProduct.unit}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <p className="font-medium">{foundProduct.category}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional-stock">Additional Stock to Add</Label>
                  <Input 
                    id="additional-stock" 
                    type="number"
                    min="1"
                    value={additionalStock === 0 ? "" : additionalStock}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setAdditionalStock(isNaN(value) ? 0 : Math.max(0, value));
                    }}
                    placeholder={`Enter units to add (${foundProduct.unit})`}
                  />
                </div>
                
                {additionalStock > 0 && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>New total:</strong> {foundProduct.stock + additionalStock} {foundProduct.unit}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* No Product Found Message */}
          {barcode.trim() && !foundProduct && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-orange-800">
                  <Package className="h-4 w-4" />
                  <p className="text-sm">
                    No product found with barcode: <strong>{barcode}</strong>
                  </p>
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  Please check the barcode or add the product first.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdate} 
            disabled={additionalStock <= 0 || !foundProduct}
            className="gap-2"
          >
            <Package className="h-4 w-4" />
            Add Stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeStockDialog;