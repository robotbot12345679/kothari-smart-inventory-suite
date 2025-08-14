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
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/pos";
import { useData } from "@/context/DataContext";
import { ScanLine, Package, CheckCircle, Trash2, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StockItem {
  product: Product;
  quantity: number;
}

interface BarcodeStockDialogProps {
  children?: React.ReactNode;
}

const BarcodeStockDialog: React.FC<BarcodeStockDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const { findProductByBarcode, updateInventoryStock } = useData();
  const { toast } = useToast();
  
  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setBarcode("");
      setStockItems([]);
      setIsScanning(false);
    }
  }, [open]);

  // Auto-add product when barcode is entered/scanned
  useEffect(() => {
    if (barcode.trim()) {
      const product = findProductByBarcode(barcode.trim());
      if (product) {
        // Check if product already exists in the list
        const existingItemIndex = stockItems.findIndex(item => item.product.id === product.id);
        
        if (existingItemIndex >= 0) {
          // Increment quantity if product already exists
          const updatedItems = [...stockItems];
          updatedItems[existingItemIndex].quantity += 1;
          setStockItems(updatedItems);
        } else {
          // Add new product with quantity 1
          setStockItems(prev => [...prev, { product, quantity: 1 }]);
        }
        
        toast({
          title: "Product added",
          description: `${product.name} - 1 ${product.unit} added to list`,
        });
        
        // Clear barcode for next scan
        setBarcode("");
      } else {
        toast({
          title: "Product not found",
          description: `No product found with barcode: ${barcode}`,
          variant: "destructive"
        });
        setBarcode("");
      }
    }
  }, [barcode, findProductByBarcode, toast, stockItems]);
  
  
  const handleBarcodeChange = (value: string) => {
    setBarcode(value);
  };

  const updateItemQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setStockItems(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setStockItems(prev => 
        prev.map(item => 
          item.product.id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const removeItem = (productId: number) => {
    setStockItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleConfirmAll = () => {
    if (stockItems.length === 0) return;
    
    stockItems.forEach(item => {
      updateInventoryStock(item.product.id, item.quantity);
    });
    
    toast({
      title: "Stock updated successfully",
      description: `Updated ${stockItems.length} product(s)`,
    });
    
    setStockItems([]);
    setBarcode("");
    setOpen(false);
  };

  const getTotalItems = () => {
    return stockItems.reduce((total, item) => total + item.quantity, 0);
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5" />
            Add Stock by Barcode
          </DialogTitle>
          <DialogDescription>
            Scan or enter product barcodes to automatically add 1 unit each. Adjust quantities before confirming.
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

          {/* Stock Items List */}
          {stockItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Items to Add ({stockItems.length})</Label>
                <Badge variant="secondary">
                  Total: {getTotalItems()} units
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {stockItems.map((item) => (
                  <Card key={item.product.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{item.product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            SKU: {item.product.sku} • Current: {item.product.stock} {item.product.unit}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateItemQuantity(item.product.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value > 0) {
                                  updateItemQuantity(item.product.id, value);
                                }
                              }}
                              className="w-16 text-center"
                            />
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateItemQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-muted-foreground">
                        New total: {item.product.stock + item.quantity} {item.product.unit}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {stockItems.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-6 pb-6">
                <div className="text-center text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No items scanned yet</p>
                  <p className="text-xs">Scan a barcode to automatically add products</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAll} 
            disabled={stockItems.length === 0}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Confirm All ({getTotalItems()} items)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeStockDialog;