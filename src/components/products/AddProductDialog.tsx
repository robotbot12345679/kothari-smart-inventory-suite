
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
import type { Product, ProductVariant } from "@/types/pos";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

interface VariantFormData {
  id: number;
  name: string;
  weight: number;
  unit: 'g' | 'kg' | 'box' | 'pcs';
  price: number;
  stock: number;
  profitMargin: number;
  sku: string;
}

const AddProductDialog = ({ open, onOpenChange, product }: AddProductDialogProps) => {
  const { categories, addProduct, updateProduct } = useData();
  const { toast } = useToast();
  const isEditing = !!product;

  // Form state
  const [formData, setFormData] = useState<Partial<Product & {expiryMonth?: string}>>({
    name: "",
    sku: "",
    category: "",
    description: "",
    barcode: "",
    image: "",
    variants: [],
    isActive: true,
  });

  // Variants state
  const [variants, setVariants] = useState<VariantFormData[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Initialize form when editing
  useEffect(() => {
    if (product) {
      // Extract expiry month if available
      let expiryMonth = "";
      if (product.expiryDate) {
        const date = new Date(product.expiryDate);
        expiryMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      }
      
      setFormData({
        ...product,
        expiryMonth,
      });
      
      // Initialize variants
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants.map(v => ({
          ...v,
          profitMargin: v.profitMargin || 0,
        })));
      } else {
        setVariants([createDefaultVariant(product.id)]);
      }
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
        expiryMonth: ""
      });
      
      // Initialize with one default variant
      setVariants([createDefaultVariant(Date.now())]);
    }
  }, [product, open]);

  const createDefaultVariant = (productId: number): VariantFormData => ({
    id: 1,
    name: 'Default',
    weight: 1,
    unit: 'kg',
    price: 0,
    stock: 0,
    profitMargin: 20, // Default 20% profit margin
    sku: formData.sku ? `${formData.sku}-1` : ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target as HTMLInputElement;
    const parsedValue = type === 'number' ? parseFloat(value) : value;
    
    if (id === 'sku') {
      // Update all variant SKUs when base SKU changes
      setVariants(prevVariants => 
        prevVariants.map((v, idx) => ({
          ...v,
          sku: `${value}-${idx + 1}`
        }))
      );
    }
    
    setFormData(prev => ({ ...prev, [id]: parsedValue }));
  };

  const handleSwitchChange = (checked: boolean, id: string) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddVariant = () => {
    setVariants(prev => {
      const newVariantId = prev.length > 0 ? Math.max(...prev.map(v => v.id)) + 1 : 1;
      return [...prev, {
        id: newVariantId,
        name: `Variant ${prev.length + 1}`,
        weight: 1,
        unit: 'kg',
        price: 0,
        stock: 0,
        profitMargin: 20,
        sku: `${formData.sku}-${newVariantId}`
      }];
    });
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "Product must have at least one variant",
        variant: "destructive"
      });
      return;
    }
    
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
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
        image: selectedFile ? URL.createObjectURL(selectedFile) : (formData.image || ""),
        variants: variants.map(v => ({
          id: v.id,
          productId: isEditing && product ? product.id : Date.now(),
          name: v.name,
          weight: v.weight,
          unit: v.unit,
          price: v.price,
          stock: v.stock,
          profitMargin: v.profitMargin,
          sku: v.sku
        })),
        expiryDate,
        minimumStock: formData.minimumStock,
        isActive: formData.isActive !== undefined ? formData.isActive : true
      };
      
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
              <TabsTrigger value="variants">Variants</TabsTrigger>
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
            </TabsContent>

            <TabsContent value="variants" className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Product Variants</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddVariant}>
                  <Plus className="h-4 w-4 mr-1" /> Add Variant
                </Button>
              </div>
              
              {variants.map((variant, index) => (
                <div key={index} className="border p-4 rounded-md space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Variant #{index + 1}</h4>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveVariant(index)}
                      disabled={variants.length <= 1}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Variant Name</Label>
                      <Input 
                        value={variant.name} 
                        onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                        placeholder="e.g. Small, 500g, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SKU</Label>
                      <Input 
                        value={variant.sku} 
                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                        placeholder="Variant SKU"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Weight</Label>
                      <Input 
                        type="number" 
                        value={variant.weight} 
                        onChange={(e) => handleVariantChange(index, 'weight', parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Select 
                        value={variant.unit} 
                        onValueChange={(value) => handleVariantChange(index, 'unit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">Grams (g)</SelectItem>
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="pcs">Pieces</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Stock</Label>
                      <Input 
                        type="number" 
                        value={variant.stock} 
                        onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value))}
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Price (₹)</Label>
                      <Input 
                        type="number" 
                        value={variant.price} 
                        onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Profit Margin (%)</Label>
                      <Input 
                        type="number" 
                        value={variant.profitMargin} 
                        onChange={(e) => handleVariantChange(index, 'profitMargin', parseFloat(e.target.value))}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="extras" className="space-y-4 py-4">
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
