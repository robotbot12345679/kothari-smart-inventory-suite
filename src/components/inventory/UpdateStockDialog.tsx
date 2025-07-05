
import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/types/pos";
import { useData } from "@/context/DataContext";
import { Plus } from "lucide-react";

interface UpdateStockDialogProps {
  product?: Product;
  children?: React.ReactNode;
}

const UpdateStockDialog: React.FC<UpdateStockDialogProps> = ({ product, children }) => {
  const [open, setOpen] = useState(false);
  const [additionalStock, setAdditionalStock] = useState<number>(0);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(product?.id || null);
  const { updateInventoryStock, products } = useData();
  
  const selectedProduct = selectedProductId ? products.find(p => p.id === selectedProductId) : null;
  
  const handleUpdate = () => {
    if (additionalStock > 0 && selectedProductId) {
      updateInventoryStock(selectedProductId, additionalStock);
      setAdditionalStock(0);
      setOpen(false);
      if (!product) {
        setSelectedProductId(null);
      }
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Stock
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Inventory Stock</DialogTitle>
          <DialogDescription>
            {product ? `Add additional stock units for ${product.name}.` : "Select a product and add stock units."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {!product && (
            <div className="space-y-2">
              <Label htmlFor="product-select">Select Product</Label>
              <Select value={selectedProductId?.toString() || ""} onValueChange={(value) => setSelectedProductId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((prod) => (
                    <SelectItem key={prod.id} value={prod.id.toString()}>
                      {prod.name} (Current: {prod.stock} {prod.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {selectedProduct && (
            <>
              <div className="space-y-2">
                <Label htmlFor="current-stock">Current Stock</Label>
                <Input 
                  id="current-stock" 
                  value={selectedProduct.stock} 
                  disabled 
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additional-stock">Additional Stock Units</Label>
                <Input 
                  id="additional-stock" 
                  type="number"
                  min="1"
                  value={additionalStock === 0 ? "" : additionalStock}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setAdditionalStock(isNaN(value) ? 0 : Math.max(0, value));
                  }}
                  placeholder="Enter number of units to add"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-stock">New Stock Total</Label>
                <Input 
                  id="new-stock" 
                  value={selectedProduct.stock + additionalStock} 
                  disabled 
                  className="bg-muted"
                />
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={additionalStock <= 0 || !selectedProductId}>
            Update Stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStockDialog;
