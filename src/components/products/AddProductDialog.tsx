
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
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    sku: "",
    category: "",
    description: "",
    barcode: "",
    image: "",
    variants: [],
    isActive: true,
  });

  // Initialize form when editing
  useEffect(() => {
    if (product) {
      setFormData({
        ...product
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
      });
    }
  }, [product, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
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
      if (isEditing && product) {
        // Update existing product
        updateProduct(product.id, {
          ...product,
          ...formData as Product
        });
        toast({
          title: "Product Updated",
          description: `${formData.name} has been updated successfully.`
        });
      } else {
        // Add new product
        const newProduct: Product = {
          id: Date.now(),
          name: formData.name!,
          sku: formData.sku!,
          category: formData.category!,
          description: formData.description || "",
          barcode: formData.barcode || "",
          image: formData.image || "",
          variants: [],
          isActive: formData.isActive !== undefined ? formData.isActive : true
        };
        
        addProduct(newProduct);
        toast({
          title: "Product Added",
          description: `${formData.name} has been added successfully.`
        });
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
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input 
                  id="expiryDate" 
                  type="date" 
                  value={formData.expiryDate || ""} 
                  onChange={handleChange}
                />
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
