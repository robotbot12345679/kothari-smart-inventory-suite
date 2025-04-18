
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Package, 
  Tag, 
  FileDown, 
  FilePlus,
  Pencil, 
  Trash2, 
  Eye 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

const Products = () => {
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  // Sample product data
  const products = [
    {
      id: 1,
      name: "Premium Cashews",
      sku: "CF-001",
      category: "Nuts",
      price: 850,
      costPrice: 700,
      stockLevel: 120,
      unit: "kg",
      barcode: "890123456789",
      imageUrl: "https://placehold.co/100x100?text=Cashews",
      status: "Active",
    },
    {
      id: 2,
      name: "California Almonds",
      sku: "AM-002",
      category: "Nuts",
      price: 980,
      costPrice: 820,
      stockLevel: 95,
      unit: "kg",
      barcode: "890123456790",
      imageUrl: "https://placehold.co/100x100?text=Almonds",
      status: "Active",
    },
    {
      id: 3,
      name: "Iranian Pistachios",
      sku: "PS-003",
      category: "Nuts",
      price: 1250,
      costPrice: 1050,
      stockLevel: 15,
      unit: "kg",
      barcode: "890123456791",
      imageUrl: "https://placehold.co/100x100?text=Pistachios",
      status: "Active",
    },
    {
      id: 4,
      name: "Chilean Walnuts",
      sku: "WN-004",
      category: "Nuts",
      price: 1100,
      costPrice: 950,
      stockLevel: 75,
      unit: "kg",
      barcode: "890123456792",
      imageUrl: "https://placehold.co/100x100?text=Walnuts",
      status: "Active",
    },
    {
      id: 5,
      name: "Dried Apricots",
      sku: "DA-005",
      category: "Dried Fruits",
      price: 750,
      costPrice: 600,
      stockLevel: 35,
      unit: "kg",
      barcode: "890123456793",
      imageUrl: "https://placehold.co/100x100?text=Apricots",
      status: "Active",
    },
    {
      id: 6,
      name: "Mixed Dry Fruits",
      sku: "MD-006",
      category: "Assorted",
      price: 650,
      costPrice: 520,
      stockLevel: 80,
      unit: "kg",
      barcode: "890123456794",
      imageUrl: "https://placehold.co/100x100?text=Mixed",
      status: "Active",
    },
    {
      id: 7,
      name: "Raisins Golden",
      sku: "RG-007",
      category: "Dried Fruits",
      price: 320,
      costPrice: 240,
      stockLevel: 65,
      unit: "kg",
      barcode: "890123456795",
      imageUrl: "https://placehold.co/100x100?text=Raisins",
      status: "Active",
    },
    {
      id: 8,
      name: "Brazil Nuts",
      sku: "BN-008",
      category: "Nuts",
      price: 1300,
      costPrice: 1100,
      stockLevel: 10,
      unit: "kg",
      barcode: "890123456796",
      imageUrl: "https://placehold.co/100x100?text=Brazil+Nuts",
      status: "Low Stock",
    },
  ];

  // Sample categories
  const categories = [
    { id: 1, name: "Nuts", count: 5 },
    { id: 2, name: "Dried Fruits", count: 3 },
    { id: 3, name: "Assorted", count: 2 },
    { id: 4, name: "Gift Packs", count: 2 },
    { id: 5, name: "Spices", count: 3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <div className="flex items-center gap-2">
          <Button className="gap-1" variant="outline">
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-1" variant="outline">
            <FilePlus className="h-4 w-4" />
            Import
          </Button>
          <Button className="gap-1" onClick={() => setProductDialogOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">In 8 categories</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Tag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">112</div>
            <p className="text-xs text-muted-foreground">Available for sale</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Package className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">Need reordering</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Product categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Categories</h2>
          </div>
          <div className="p-4">
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-between"
              >
                All Categories 
                <Badge>{products.length}</Badge>
              </Button>
              {categories.map(category => (
                <Button 
                  key={category.id}
                  variant="ghost" 
                  className="w-full justify-between"
                >
                  {category.name}
                  <Badge>{category.count}</Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full bg-background pl-8 md:w-96"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price (₹)</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="font-medium">{product.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">
                      {product.price}/{product.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.stockLevel} {product.unit}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={product.stockLevel < 20 ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : "bg-green-100 text-green-800 hover:bg-green-100"}
                      >
                        {product.stockLevel < 20 ? "Low Stock" : "In Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-4 border-t flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">1</span> to <span className="font-medium">8</span> of{" "}
              <span className="font-medium">128</span> products
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory. Fill out the details below.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="extras">Additional</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name *</Label>
                  <Input id="product-name" placeholder="Enter product name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input id="sku" placeholder="Enter unique SKU" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nuts">Nuts</SelectItem>
                      <SelectItem value="dried-fruits">Dried Fruits</SelectItem>
                      <SelectItem value="assorted">Assorted</SelectItem>
                      <SelectItem value="gift-packs">Gift Packs</SelectItem>
                      <SelectItem value="spices">Spices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="pcs">pcs</SelectItem>
                      <SelectItem value="box">box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="selling-price">Selling Price (₹) *</Label>
                  <Input id="selling-price" type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost-price">Cost Price (₹) *</Label>
                  <Input id="cost-price" type="number" placeholder="0.00" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter product description" />
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock-quantity">Stock Quantity *</Label>
                  <Input id="stock-quantity" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-stock-level">Minimum Stock Level</Label>
                  <Input id="min-stock-level" type="number" placeholder="0" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input id="barcode" placeholder="Enter barcode" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (grams)</Label>
                  <Input id="weight" type="number" placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry-date">Expiry Date</Label>
                  <Input id="expiry-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch-number">Batch Number</Label>
                  <Input id="batch-number" placeholder="Enter batch number" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Track Inventory</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="track-inventory" />
                  <Label htmlFor="track-inventory">Track quantity for this product</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="extras" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="product-image">Product Image</Label>
                <Input id="product-image" type="file" className="cursor-pointer" />
              </div>

              <div className="space-y-2">
                <Label>Product Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="product-status" defaultChecked />
                  <Label htmlFor="product-status">Product is active and available for sale</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input id="tax-rate" type="number" placeholder="18" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hsn-code">HSN Code</Label>
                  <Input id="hsn-code" placeholder="Enter HSN code" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" placeholder="Enter comma separated tags" />
                <p className="text-xs text-muted-foreground">Separate tags with commas (e.g., organic, premium, gift)</p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
