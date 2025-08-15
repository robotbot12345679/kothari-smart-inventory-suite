import React, { useState, useEffect, useRef } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/pos";
import { useData } from "@/context/DataContext";
import { ScanLine, Package, CheckCircle, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
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
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { findProductByBarcode, updateInventoryStock } = useData();
  const { toast } = useToast();
  
  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setBarcode("");
      setStockItems([]);
      setCurrentProduct(null);
      setQuantityToAdd(1);
      // Focus input when dialog opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Handle barcode entry with Enter key - automatically adds 1 unit
  const handleBarcodeSubmit = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    
    if (!barcode.trim()) return;
    
    const product = findProductByBarcode(barcode.trim());
    if (product) {
      // Automatically add 1 unit each time barcode is scanned
      const existingItemIndex = stockItems.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Add 1 more unit to existing item
        const updatedItems = [...stockItems];
        updatedItems[existingItemIndex].quantity += 1;
        setStockItems(updatedItems);
      } else {
        // Add new item with 1 unit
        setStockItems(prev => [...prev, { product, quantity: 1 }]);
      }
      
      toast({
        title: "Product scanned",
        description: `${product.name} - 1 ${product.unit} added`,
      });
      
      setBarcode("");
      // Keep focus on input for next scan
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      toast({
        title: "Product not found",
        description: `No product found with barcode: ${barcode}`,
        variant: "destructive"
      });
      setBarcode("");
    }
  };

  const addCurrentProduct = () => {
    if (!currentProduct || quantityToAdd <= 0) return;

    const existingItemIndex = stockItems.findIndex(item => item.product.id === currentProduct.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...stockItems];
      updatedItems[existingItemIndex].quantity += quantityToAdd;
      setStockItems(updatedItems);
    } else {
      // Add new item
      setStockItems(prev => [...prev, { product: currentProduct, quantity: quantityToAdd }]);
    }
    
    toast({
      title: "Product added",
      description: `${currentProduct.name} - ${quantityToAdd} ${currentProduct.unit} added`,
    });
    
    // Reset for next product
    setCurrentProduct(null);
    setQuantityToAdd(1);
    inputRef.current?.focus();
  };

  const updateItemQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
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
      title: "Inventory updated",
      description: `Successfully updated ${stockItems.length} product(s)`,
    });
    
    setStockItems([]);
    setCurrentProduct(null);
    setOpen(false);
  };

  const getTotalItems = () => {
    return stockItems.reduce((total, item) => total + item.quantity, 0);
  };

  const clearAll = () => {
    setStockItems([]);
    setCurrentProduct(null);
    setQuantityToAdd(1);
    inputRef.current?.focus();
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
            Barcode Stock Manager
          </DialogTitle>
          <DialogDescription>
            Scan barcodes to find products, then add them to your inventory with custom quantities.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Barcode Input Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barcode-input">Scan Product Barcode</Label>
              <div className="flex gap-2">
                <Input 
                  ref={inputRef}
                  id="barcode-input"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={handleBarcodeSubmit}
                  placeholder="Scan or type barcode and press Enter..."
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBarcodeSubmit()}
                  disabled={!barcode.trim()}
                >
                  <ScanLine className="h-4 w-4" />
                  Find
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use a barcode scanner or type manually, then press Enter
              </p>
            </div>
          </div>

          {/* Current Product Preview */}
          {currentProduct && (
            <Card className="border border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{currentProduct.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      SKU: {currentProduct.sku} • Current Stock: {currentProduct.stock} {currentProduct.unit}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    Found
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 mt-4">
                  <Label htmlFor="quantity-input" className="text-sm font-medium">
                    Quantity to add:
                  </Label>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantityToAdd(Math.max(1, quantityToAdd - 1))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <Input
                      id="quantity-input"
                      type="number"
                      min="1"
                      value={quantityToAdd}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value > 0) {
                          setQuantityToAdd(value);
                        }
                      }}
                      className="w-20 text-center"
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantityToAdd(quantityToAdd + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <Button onClick={addCurrentProduct} className="gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Add to List
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stock Items List */}
          {stockItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Items to Update ({stockItems.length})
                </Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    Total: {getTotalItems()} units
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    Clear All
                  </Button>
                </div>
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
                          <p className="text-xs text-muted-foreground mt-1">
                            New total: <span className="font-medium">{item.product.stock + item.quantity} {item.product.unit}</span>
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateItemQuantity(item.product.id, item.quantity - 1)}
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
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {stockItems.length === 0 && !currentProduct && (
            <Card className="border-dashed">
              <CardContent className="pt-6 pb-6">
                <div className="text-center text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Scan a barcode to get started</p>
                  <p className="text-xs">Use your barcode scanner or type the code manually</p>
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