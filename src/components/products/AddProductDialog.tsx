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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Plus, Trash, Edit } from "lucide-react";
import type { Product } from "@/types/pos";
import { saveImageToPublic, getImageUrl, validateImageFile, deleteImage } from "@/utils/imageUtils";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  defaultUnit?: 'g' | 'kg' | 'box' | 'pcs';
  onDelete?: (product: Product) => void;
}

const AddProductDialog = ({ open, onOpenChange, product, defaultUnit = 'g', onDelete }: AddProductDialogProps) => {
  const { categories, addProduct, updateProduct, addCategory } = useCloudData();
  const { toast } = useToast();
  const isEditing = !!product;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Product & {expiryMonth?: string}>>({
    name: "",
    sku: "",
    category: "",
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
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const steps = isEditing ? [] : ['name', 'sku', 'barcode', 'price', 'weight'];

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
      setCurrentStep(0);
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
        unit: "g",
        stock: 0,
        is_active: true,
        price_includes_gst: true,
        expiryMonth: ""
      });
      setCurrentStep(0);
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

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Validate current field
      if (field === 'name' && !formData.name?.trim()) {
        toast({
          title: "Required",
          description: "Product name is required",
          variant: "destructive"
        });
        return;
      }
      
      if (field === 'sku' && !formData.sku?.trim()) {
        toast({
          title: "Required",
          description: "SKU is required",
          variant: "destructive"
        });
        return;
      }

      if (field === 'price' && (!formData.price || formData.price <= 0)) {
        toast({
          title: "Required",
          description: "Price must be greater than 0",
          variant: "destructive"
        });
        return;
      }

      if (field === 'weight' && (!formData.weight || formData.weight <= 0)) {
        toast({
          title: "Required",
          description: "Weight must be greater than 0",
          variant: "destructive"
        });
        return;
      }
      
      // Move to next step or save
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        // Focus next input after state update
        setTimeout(() => {
          const nextInput = document.querySelector<HTMLInputElement>(`#${steps[currentStep + 1]}`);
          nextInput?.focus();
        }, 50);
      } else {
        // Save product on last step
        await saveProduct();
      }
    }
  };

  const saveProduct = async () => {
    if (!formData.name?.trim() || !formData.sku?.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and SKU are required",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      let imageFilename = formData.image || "";
      
      if (selectedFile) {
        imageFilename = await saveImageToPublic(selectedFile);
        
        if (isEditing && product?.image && product.image !== imageFilename) {
          await deleteImage(product.image);
        }
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
        category: formData.category || "",
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
        description: error instanceof Error ? error.message : "Failed to save product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a category name.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addCategory(newCategoryName.trim());
      
      setFormData(prev => ({ ...prev, category: newCategoryName.trim() }));
      setNewCategoryName("");
      setShowAddCategory(false);
      
      toast({
        title: "Category Added",
        description: `${newCategoryName} has been added successfully.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProduct();

  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto font-playfair">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update product details" : !isEditing ? "Press Enter after each field to continue" : "Add a new product to your inventory"}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isEditing ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input 
                  id="name" 
                  placeholder="Enter product name" 
                  value={formData.name || ""} 
                  onChange={handleChange}
                  onKeyPress={(e) => handleKeyPress(e, 'name')}
                  autoFocus
                  required
                />
              </div>

              {currentStep >= 1 && (
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input 
                    id="sku" 
                    placeholder="Enter SKU" 
                    value={formData.sku || ""} 
                    onChange={handleChange}
                    onKeyPress={(e) => handleKeyPress(e, 'sku')}
                    required
                  />
                </div>
              )}

              {currentStep >= 2 && (
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input 
                    id="barcode" 
                    placeholder="Enter barcode (optional)" 
                    value={formData.barcode || ""} 
                    onChange={handleChange}
                    onKeyPress={(e) => handleKeyPress(e, 'barcode')}
                  />
                </div>
              )}

              {currentStep >= 3 && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="0.00" 
                    value={formData.price || ""} 
                    onChange={handleChange}
                    onKeyPress={(e) => handleKeyPress(e, 'price')}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              )}

              {currentStep >= 4 && (
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight *</Label>
                  <Input 
                    id="weight" 
                    type="number" 
                    placeholder="1" 
                    value={formData.weight || ""} 
                    onChange={handleChange}
                    onKeyPress={(e) => handleKeyPress(e, 'weight')}
                    min="0"
                    step="0.01"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Press Enter to save product</p>
                </div>
              )}
            </div>
          ) : (
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
                    <Label htmlFor="category">Category (optional)</Label>
                    <div className="flex gap-2">
                      <Select 
                        value={formData.category || ""} 
                        onValueChange={(value) => handleSelectChange(value, "category")}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder={categories.length === 0 ? "No categories available" : "Select category"} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter(cat => cat.is_active).map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                          {categories.length === 0 && (
                            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                              No categories yet
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowAddCategory(true)}
                        title="Add new category"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
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
          
          {!isEditing && currentStep < steps.length - 1 && (
            <div className="text-center text-sm text-muted-foreground py-2">
              Step {currentStep + 1} of {steps.length}
            </div>
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
            {(isEditing || currentStep >= steps.length - 1) && (
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Saving..." : isEditing ? "Update Product" : "Save Product"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>

      <AlertDialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Category</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a name for the new category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewCategoryName("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddCategory}>Add Category</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default AddProductDialog;
