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
import { useCloudData } from "@/context/CloudDataContext";
import { useToast } from "@/components/ui/use-toast";
import { Trash } from "lucide-react";
import type { Product } from "@/types/pos";
import { saveImageToPublic, getImageUrl, validateImageFile, deleteImage } from "@/utils/imageUtils";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  defaultUnit?: 'g' | 'kg' | 'box' | 'pcs';
  onDelete?: (product: Product) => void;
}

type StepType = 'name' | 'sku' | 'barcode' | 'price' | 'weight';

const AddProductDialog = ({ open, onOpenChange, product, defaultUnit = 'g', onDelete }: AddProductDialogProps) => {
  const { addProduct, updateProduct } = useCloudData();
  const { toast } = useToast();
  const isEditing = !!product;

  const [currentStep, setCurrentStep] = useState<StepType>('name');
  const [formData, setFormData] = useState<Partial<Product & {expiryMonth?: string}>>({
    name: "",
    sku: "",
    category: "All",
    description: "",
    barcode: "",
    image: "",
    price: 0,
    weight: 1,
    unit: defaultUnit,
    stock: 0,
    is_active: true,
    price_includes_gst: true
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRefs = {
    name: useRef<HTMLInputElement>(null),
    sku: useRef<HTMLInputElement>(null),
    barcode: useRef<HTMLInputElement>(null),
    price: useRef<HTMLInputElement>(null),
    weight: useRef<HTMLInputElement>(null),
  };

  const steps: StepType[] = ['name', 'sku', 'barcode', 'price', 'weight'];

  useEffect(() => {
    if (product) {
      let expiryMonth = "";
      if (product.expiry_date) {
        const date = new Date(product.expiry_date);
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
        category: "All",
        description: "",
        barcode: "",
        image: "",
        price: 0,
        weight: 1,
        unit: defaultUnit,
        stock: 0,
        is_active: true,
        price_includes_gst: true,
        expiryMonth: ""
      });
      setCurrentStep('name');
    }
  }, [product, open, defaultUnit]);

  // Auto-focus on current step input
  useEffect(() => {
    if (!isEditing && open) {
      const timer = setTimeout(() => {
        inputRefs[currentStep]?.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isEditing, open]);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      try {
        validateImageFile(file);
        setSelectedFile(file);
        
        // Show preview immediately
        const preview = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, image: preview }));
      } catch (error) {
        toast({
          title: "Invalid Image",
          description: error instanceof Error ? error.message : "Please select a valid image file.",
          variant: "destructive"
        });
      }
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isEditing) {
      e.preventDefault();
      const currentIndex = steps.indexOf(currentStep);
      
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      } else {
        // Last step - save product
        saveProduct();
      }
    }
  };

  const saveProduct = async () => {
    // Validation
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.sku?.trim()) {
      toast({
        title: "Validation Error",
        description: "SKU is required.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.price || formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Price must be greater than 0.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.weight || formData.weight <= 0) {
      toast({
        title: "Validation Error",
        description: "Weight must be greater than 0.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      let imageFilename = formData.image || "";
      
      // Handle image upload if a new file is selected
      if (selectedFile) {
        imageFilename = await saveImageToPublic(selectedFile);
      }

      let expiryDate: string | undefined = undefined;
      if (formData.expiryMonth) {
        const [year, month] = formData.expiryMonth.split('-').map(Number);
        const lastDay = new Date(year, month, 0).getDate();
        expiryDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
      }
      
      const productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'> = {
        name: formData.name!,
        sku: formData.sku!,
        category: formData.category || "All",
        description: formData.description || "",
        barcode: formData.barcode || "",
        image: imageFilename,
        price: formData.price || 0,
        stock: formData.stock || 0,
        weight: formData.weight || 1,
        unit: (formData.unit as 'g' | 'kg' | 'box' | 'pcs') || 'g',
        price_includes_gst: true,
        expiry_date: expiryDate || null,
        min_stock: formData.min_stock || null,
        is_active: formData.is_active !== undefined ? formData.is_active : true,
        image_url: null
      };
      
      await addProduct(productData);
      
      onOpenChange(false);
      setCurrentStep('name');
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      // Edit mode validation
      if (!formData.name || !formData.sku) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      setIsUploading(true);

      try {
        let imageFilename = formData.image || "";
        
        // Handle image upload if a new file is selected
        if (selectedFile) {
          imageFilename = await saveImageToPublic(selectedFile);
          
          // If editing and there was an old image, delete it
          if (product?.image && product.image !== imageFilename) {
            await deleteImage(product.image);
          }
        }

        let expiryDate: string | undefined = undefined;
        if (formData.expiryMonth) {
          const [year, month] = formData.expiryMonth.split('-').map(Number);
          const lastDay = new Date(year, month, 0).getDate();
          expiryDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
        }
        
        const productData: Partial<Product> = {
          name: formData.name!,
          sku: formData.sku!,
          category: formData.category || "All",
          description: formData.description || "",
          barcode: formData.barcode || "",
          image: imageFilename,
          price: formData.price || 0,
          stock: formData.stock || 0,
          weight: formData.weight || 1,
          unit: (formData.unit as 'g' | 'kg' | 'box' | 'pcs') || 'g',
          price_includes_gst: true,
          expiry_date: expiryDate || null,
          min_stock: formData.min_stock || null,
          is_active: formData.is_active !== undefined ? formData.is_active : true,
        };
        
        await updateProduct(product!.id, productData);
        toast({
          title: "Product Updated",
          description: `${formData.name} has been updated successfully.`
        });
        
        onOpenChange(false);
      } catch (error) {
        console.error("Error saving product:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save product. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
      }
    } else {
      // Add mode - handled by step-by-step process
      saveProduct();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto font-playfair">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update product details" : `Step ${steps.indexOf(currentStep) + 1} of ${steps.length}: Enter ${currentStep}`}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isEditing ? (
            // Step-by-step mode for adding new products
            <div className="space-y-4 py-4">
              {currentStep === 'name' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input 
                    ref={inputRefs.name}
                    id="name" 
                    placeholder="Enter product name and press Enter" 
                    value={formData.name || ""} 
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    autoFocus
                  />
                </div>
              )}

              {currentStep === 'sku' && (
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input 
                    ref={inputRefs.sku}
                    id="sku" 
                    placeholder="Enter SKU and press Enter" 
                    value={formData.sku || ""} 
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">Previous: {formData.name}</p>
                </div>
              )}

              {currentStep === 'barcode' && (
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode (Optional)</Label>
                  <Input 
                    ref={inputRefs.barcode}
                    id="barcode" 
                    placeholder="Enter barcode and press Enter (or leave empty)" 
                    value={formData.barcode || ""} 
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">Previous: {formData.name} - {formData.sku}</p>
                </div>
              )}

              {currentStep === 'price' && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input 
                    ref={inputRefs.price}
                    id="price" 
                    type="number" 
                    placeholder="Enter price and press Enter" 
                    value={formData.price || ""} 
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    min="0"
                    step="0.01"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">Previous: {formData.name} - {formData.sku}</p>
                </div>
              )}

              {currentStep === 'weight' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight *</Label>
                    <div className="flex gap-2">
                      <Input 
                        ref={inputRefs.weight}
                        id="weight" 
                        type="number" 
                        placeholder="Enter weight and press Enter to save" 
                        value={formData.weight || ""} 
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        min="0"
                        step="0.01"
                        className="flex-1"
                        autoFocus
                      />
                      <Select 
                        value={formData.unit || defaultUnit} 
                        onValueChange={(value) => handleSelectChange(value, "unit")}
                      >
                        <SelectTrigger className="w-[120px]">
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
                    <p className="text-xs text-muted-foreground">
                      Review: {formData.name} - ₹{formData.price} - SKU: {formData.sku}
                    </p>
                    <p className="text-xs text-green-600">Press Enter to save product</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category || "All"} 
                      onValueChange={(value) => handleSelectChange(value, "category")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Dry Fruits">Dry Fruits</SelectItem>
                        <SelectItem value="Nuts">Nuts</SelectItem>
                        <SelectItem value="Seeds">Seeds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Full form for editing existing products
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
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category || "All"} 
                      onValueChange={(value) => handleSelectChange(value, "category")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Dry Fruits">Dry Fruits</SelectItem>
                        <SelectItem value="Nuts">Nuts</SelectItem>
                        <SelectItem value="Seeds">Seeds</SelectItem>
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
                      value={formData.unit || defaultUnit} 
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
                    <Label htmlFor="min_stock">Min. Stock Level</Label>
                    <Input 
                      id="min_stock" 
                      type="number" 
                      placeholder="0" 
                      value={formData.min_stock || ""} 
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
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 15MB. Supported formats: JPEG, PNG, GIF, WebP
                  </p>
                  {formData.image && (
                    <div className="mt-2">
                      <img 
                        src={selectedFile ? formData.image : getImageUrl(formData.image)} 
                        alt="Product preview" 
                        className="h-24 w-24 object-cover rounded-md" 
                      />
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
                      id="is_active" 
                      checked={formData.is_active || false}
                      onCheckedChange={(checked) => handleSwitchChange(checked, "is_active")}
                    />
                    <Label htmlFor="is_active">Product is active and available for sale</Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {isEditing && onDelete && product && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => onDelete(product)}
                disabled={isUploading}
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </Button>
            )}
            {isEditing && (
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Update Product"}
              </Button>
            )}
            {!isEditing && currentStep === 'weight' && (
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Saving..." : "Save Product"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
