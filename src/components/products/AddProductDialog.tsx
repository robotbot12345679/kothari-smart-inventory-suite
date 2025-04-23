
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
import { Plus, Trash, Edit } from "lucide-react";
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

  const [formData, setFormData] = useState<Partial<Product & {expiryMonth?: string}>>({
    name: "",
    sku: "",
    category: "",
    description: "",
    barcode: "",
    image: "",
    price: 0,
    weight: 1,
    unit: "kg",
    stock: 0,
    isActive: true,
    priceIncludesGST: true
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (product) {
      let expiryMonth = "";
      if (product.expiryDate) {
        const date = new Date(product.expiryDate);
        expiryMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      }
      
      setFormData({
        ...product,
        expiryMonth,
      });
    } else {
      setFormData({
        name: "",
        sku: "",
        category: "",
        description: "",
        barcode: "",
        image: "",
        price: 0,
        weight: 1,
        unit: "kg",
        stock: 0,
        isActive: true,
        priceIncludesGST: true,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      let expiryDate: string | undefined = undefined;
      if (formData.expiryMonth) {
        const [year, month] = formData.expiryMonth.split('-').map(Number);
        const lastDay = new Date(year, month, 0).getDate();
        expiryDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
      }
      
      const productData: Product = {
        id: isEditing && product ? product.id : Date.now(),
        name: formData.name!,
        sku: formData.sku!,
        category: formData.category!,
        description: formData.description || "",
        barcode: formData.barcode || "",
        image: selectedFile ? URL.createObjectURL(selectedFile) : (formData.image || ""),
        price: formData.price || 0,
        stock: formData.stock || 0,
        weight: formData.weight || 1,
        unit: (formData.unit as 'g' | 'kg' | 'box' | 'pcs') || 'kg',
        priceIncludesGST: true,
        expiryDate,
        minimumStock: formData.minimumStock,
        isActive: formData.isActive !== undefined ? formData.isActive : true
      };
      
      if (isEditing && product) {
        updateProduct(product.id, productData);
        toast({
          title: "Product Updated",
          description: `${formData.name} has been updated successfully.`
        });
      } else {
        addProduct(productData);
        toast({
          title: "Product Added",
          description: `${formData.name} has been added successfully.`
        });
      }
      
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto font-playfair">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update product details" : "Add a new product to your inventory"}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
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

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="0.00" 
                    value={formData.price || ""} 
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input 
                    id="weight" 
                    type="number" 
                    placeholder="1" 
                    value={formData.weight || ""} 
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select 
                    value={formData.unit || "kg"} 
                    onValueChange={(value) => handleSelectChange(value, "unit")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">Grams (g)</SelectItem>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="pcs">Pieces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    placeholder="0" 
                    value={formData.stock || ""} 
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumStock">Min. Stock Level</Label>
                  <Input 
                    id="minimumStock" 
                    type="number" 
                    placeholder="0" 
                    value={formData.minimumStock || ""} 
                    onChange={handleChange}
                    min="0"
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

            <TabsContent value="extras" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <Input 
                  id="image" 
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {formData.image && !selectedFile && (
                  <div className="mt-2">
                    <img src={formData.image} alt="Product" className="h-24 w-24 object-cover rounded-md" />
                  </div>
                )}
                {selectedFile && (
                  <div className="mt-2">
                    <img src={URL.createObjectURL(selectedFile)} alt="Selected product" className="h-24 w-24 object-cover rounded-md" />
                  </div>
                )}
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
