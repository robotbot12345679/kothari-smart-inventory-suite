import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Tag, 
  Printer, 
  CreditCard, 
  Scan,
  QrCode,
  Wallet,
  ArrowRight,
  Save
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { products, categories } from "@/data/products";
import { CartItem } from "@/types/pos";

const Pos = () => {
  const [activeCategory, setActiveCategory] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 1 || product.category === categories.find(c => c.id === activeCategory)?.name;
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: any) => {
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        unit: product.unit
      }]);
    }
  };

  const updateQuantity = (itemId: number, action: 'increase' | 'decrease' | 'remove') => {
    if (action === 'remove') {
      setCart(cart.filter(item => item.id !== itemId));
      return;
    }

    const updatedCart = cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
        return { ...item, quantity: Math.max(newQuantity, 0) };
      }
      return item;
    }).filter(item => item.quantity > 0);

    setCart(updatedCart);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gst = subtotal * 0.18; // 18% GST
  const total = subtotal + gst;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1">
            <Scan className="h-4 w-4" />
            Scan Barcode
          </Button>
          <Button variant="outline" className="gap-1">
            <Save className="h-4 w-4" />
            Save Order
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="w-2/3 flex flex-col overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="p-4 border-b">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products by name or SKU..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="flex space-x-2 pb-2">
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map(product => (
              <Card
                key={product.id}
                className="card-hover cursor-pointer overflow-hidden"
                onClick={() => addToCart(product)}
              >
                <div className="aspect-square w-full overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="h-full w-full object-cover transition-all hover:scale-105"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-muted-foreground">{product.sku}</span>
                    <span className="font-semibold">₹{product.price}/{product.unit}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                <Tag className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="font-semibold text-lg">No products found</h3>
                <p className="text-muted-foreground mt-1">Try a different search term or category</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-1/3 flex flex-col bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart
              </h2>
              {cart.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => setCart([])}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <ShoppingCart className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="font-semibold text-lg">Your cart is empty</h3>
                <p className="text-muted-foreground mt-1">Add products by clicking on them</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-start justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price} × {item.quantity} {item.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, 'decrease')}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, 'increase')}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => updateQuantity(item.id, 'remove')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <div className="pt-4">
                <Button 
                  className="w-full py-6 text-lg gap-2" 
                  disabled={cart.length === 0}
                  onClick={() => setPaymentModalOpen(true)}
                >
                  Proceed to Payment
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
            <DialogDescription>
              Select a payment method to complete the transaction.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="upi" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upi">UPI</TabsTrigger>
              <TabsTrigger value="cash">Cash</TabsTrigger>
              <TabsTrigger value="card">Card</TabsTrigger>
            </TabsList>
            <TabsContent value="upi" className="p-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center w-48 h-48 bg-gray-100 rounded-lg">
                  <QrCode className="h-24 w-24 text-primary" />
                </div>
                <p className="text-center">Scan with any UPI app</p>
                <p className="font-medium text-center">ashokkothari738@oksbi</p>
                <Button className="w-full gap-2">
                  <Wallet className="h-4 w-4" />
                  Complete Payment
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="cash" className="p-4 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="amount-tendered">Amount Tendered</Label>
                <Input id="amount-tendered" type="number" placeholder="Enter amount" />
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-semibold">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Change:</span>
                <span className="font-semibold">₹0.00</span>
              </div>
              <Button className="w-full">Complete Cash Payment</Button>
            </TabsContent>
            <TabsContent value="card" className="p-4 space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input id="card-number" placeholder="•••• •••• •••• ••••" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="•••" />
                  </div>
                </div>
              </div>
              <Button className="w-full gap-2">
                <CreditCard className="h-4 w-4" />
                Process Card Payment
              </Button>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex items-center justify-between">
            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              Print Receipt
            </Button>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pos;
