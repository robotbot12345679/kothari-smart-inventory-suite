
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/data/products";
import type { Product } from "@/types/pos";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (product: Product) => void;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({
  open,
  onOpenChange,
  product,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Reset form when dialog opens or product changes
  useEffect(() => {
    if (open) {
      if (product) {
        setName(product.name);
        setSku(product.sku);
        setCategory(product.category);
        setDescription(product.description || "");
        setIsActive(product.isActive);
      } else {
        // Reset form for new product
        setName("");
        setSku("");
        setCategory("");
        setDescription("");
        setIsActive(true);
      }
      setErrors({});
    }
  }, [open, product]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) newErrors.name = "Name is required";
    if (!sku.trim()) newErrors.sku = "SKU is required";
    if (!category) newErrors.category = "Category is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const updatedProduct: Product = {
      id: product ? product.id : 0, // Will be set by Products component
      name,
      sku,
      category,
      description,
      isActive,
      image: product?.image || "",
      variants: product?.variants || [],
    };
    
    onSave(updatedProduct);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update product details" : "Add a new product to your inventory"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
                Product Name *
              </Label>
              <Input 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name" 
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku" className={errors.sku ? "text-destructive" : ""}>
                SKU *
              </Label>
              <Input 
                id="sku" 
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Enter SKU" 
                className={errors.sku ? "border-destructive" : ""}
              />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className={errors.category ? "text-destructive" : ""}>
                Category *
              </Label>
              <Select 
                value={category} 
                onValueChange={setCategory}
              >
                <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description" 
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="active" 
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="active">Product is active</Label>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {product ? "Update Product" : "Save Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
