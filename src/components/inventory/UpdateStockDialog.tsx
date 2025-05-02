
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
import { Product } from "@/types/pos";
import { useData } from "@/context/DataContext";
import { Plus } from "lucide-react";

interface UpdateStockDialogProps {
  product: Product;
}

const UpdateStockDialog: React.FC<UpdateStockDialogProps> = ({ product }) => {
  const [open, setOpen] = useState(false);
  const [additionalStock, setAdditionalStock] = useState<number>(0);
  const { updateInventoryStock } = useData();
  
  const handleUpdate = () => {
    if (additionalStock > 0) {
      updateInventoryStock(product.id, additionalStock);
      setAdditionalStock(0);
      setOpen(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Inventory Stock</DialogTitle>
          <DialogDescription>
            Add additional stock units for {product.name}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-stock">Current Stock</Label>
            <Input 
              id="current-stock" 
              value={product.stock} 
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
              value={product.stock + additionalStock} 
              disabled 
              className="bg-muted"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={additionalStock <= 0}>
            Update Stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStockDialog;
