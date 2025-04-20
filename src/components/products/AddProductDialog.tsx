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
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/use-toast";
import type { Product } from "@/types/pos";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

const AddProductDialog = ({ open, onOpenChange, product }: AddProductDialogProps) => {
  const { categories, addProduct, updateProduct } = useData();
  const { toast } = useToast();
  const isEditing = !!product;

  // Form state
  const [formData, setFormData] = useState<Partial<Product & {expiryMonth?: string, price?: number, stock?: number}>>({
    name: "",
    sku: "",
    category: "",
    description: "",
    barcode: "",
    image: "",
    variants: [],
    isActive: true,
    price: 0,
    stock: 0
  });

  // Initialize form when editing
  useEffect(() => {
    if (product) {
      // Extract expiry month if available
      let expiryMonth = "";
      if (product.expiryDate) {
        const date = new Date(product.expiryDate);
        expiryMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      }
      
      // Add price and stock from first variant if available
      const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
      
      setFormData({
        ...product,
        expiryMonth,
        price: defaultVariant?.price || 0,
        stock: defaultVariant?.stock || 0
      });
    } else {
      // Reset form for new product
      setFormData({
        name: "",
        sku: "",
        category: "",
        description: "",
        barcode: "",
        image: "",
        variants: [],
        isActive: true,
        price: 0,
        stock: 0,
        expiryMonth: ""
      });
    }
  }, [product, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target as HTMLInputElement;
    const parsedValue = type === 'number' ? parseFloat(value) : value;
    setFormData(prev => ({ ...prev, [id]: parsedValue }));
  };

  const handleSwitchChange = (checked: boolean, id: string) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.sku || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Calculate expiry date from month picker (set to last day of month)
      let expiryDate: string | undefined = undefined;
      if (formData.expiryMonth) {
        const [year, month] = formData.expiryMonth.split('-').map(Number);
        // Get last day of the month (By going to first day of next month, then subtracting 1 day)
        const lastDay = new Date(year, month, 0).getDate();
        expiryDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
      }
      
      // Prepare the product object
      const productData: Product = {
        id: isEditing && product ? product.id : Date.now(),
        name: formData.name!,
        sku: formData.sku!,
        category: formData.category!,
        description: formData.description || "",
        barcode: formData.barcode || "",
        image: formData.image || "",
        variants: [],
        expiryDate,
        minimumStock: formData.minimumStock,
        isActive: formData.isActive !== undefined ? formData.isActive : true
      };
      
      // If it's a new product or the product has no variants, create a default variant
      if (!isEditing || (product && product.variants.length === 0)) {
        productData.variants = [{
          id: 1,
          productId: productData.id,
          name: 'Default',
          weight: 1,
          unit: 'kg',
          price: formData.price || 0,
          stock: formData.stock || 0,
          sku: `${formData.sku}-1`
        }];
      } else if (product) {
        // Keep existing variants
        productData.variants = product.variants;
      }
      
      if (isEditing && product) {
        // Update existing product
        updateProduct(product.id, productData);
        toast({
          title: "Product Updated",
          description: `${formData.name} has been updated successfully.`
        });
      } else {
        // Add new product
        addProduct(productData);
      }
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update product details" : "Add a new product to your inventory"}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="extras">Additional</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter product name" 
                    value={formData.name || ""} 
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input 
                    id="sku" 
                    placeholder="Enter SKU" 
                    value={formData.sku || ""} 
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category || ""} 
                    onValueChange={(value) => handleSelectChange(value, "category")}
                    required
                  >
                    <SelectTrigger>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input 
                    id="barcode" 
                    placeholder="Enter barcode" 
                    value={formData.barcode || ""} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter product description" 
                  value={formData.description || ""} 
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={formData.price || ""} 
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    placeholder="0" 
                    value={formData.stock || ""} 
                    onChange={handleChange}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="minimumStock">Minimum Stock Level</Label>
                <Input 
                  id="minimumStock" 
                  type="number" 
                  placeholder="0" 
                  value={formData.minimumStock || ""} 
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiryMonth">Expiry Month</Label>
                <Input 
                  id="expiryMonth" 
                  type="month" 
                  value={formData.expiryMonth || ""} 
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">Expiry will be set to the last day of selected month</p>
              </div>
            </TabsContent>

            <TabsContent value="extras" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="image">Product Image URL</Label>
                <Input 
                  id="image" 
                  placeholder="Enter image URL" 
                  value={formData.image || ""} 
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Product Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch 
                    id="isActive" 
                    checked={formData.isActive || false}
                    onCheckedChange={(checked) => handleSwitchChange(checked, "isActive")}
                  />
                  <Label htmlFor="isActive">Product is active and available for sale</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Product" : "Save Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
