
import React, { useState, useRef, useEffect } from "react";
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
  Save,
  Barcode,
  Package
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
import { CartItem, Order } from "@/types/pos";
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/use-toast";
import { useUniqueId } from "@/hooks/useUniqueId";

const Pos = () => {
  const { products, categories, addOrder, findProductByBarcode } = useData();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState<boolean>(false);
  const [barcodeInput, setBarcodeInput] = useState<string>("");
  const [amountTendered, setAmountTendered] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<string>("upi");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: ""
  });
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const orderIdPrefix = useUniqueId("ORD");
  
  useEffect(() => {
    if (barcodeModalOpen && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [barcodeModalOpen]);

  const filteredProducts = products.filter(product => {
    if (!product.isActive) return false;
    
    const matchesCategory = activeCategory === 1 || product.category === categories.find(c => c.id === activeCategory)?.name;
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: any) => {
    const variant = product.variants[0];
    
    if (!variant || variant.stock <= 0) {
      toast({
        title: "Cannot add product",
        description: "This product is out of stock",
        variant: "destructive"
      });
      return;
    }
    
    const existingItemIndex = cart.findIndex(item => item.variantId === variant.id);
    
    if (existingItemIndex >= 0) {
      if (cart[existingItemIndex].quantity >= variant.stock) {
        toast({
          title: "Stock limit reached",
          description: `Only ${variant.stock} units available in stock`,
          variant: "destructive"
        });
        return;
      }
      
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        variantId: variant.id,
        price: variant.price,
        quantity: 1,
        unit: variant.unit,
        weight: variant.weight // Add weight property
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
        const product = products.find(p => p.id === item.id);
        const variant = product?.variants.find(v => v.id === item.variantId);
        
        if (action === 'increase' && variant && item.quantity >= variant.stock) {
          toast({
            title: "Stock limit reached",
            description: `Only ${variant.stock} units available in stock`,
            variant: "destructive"
          });
          return item;
        }
        
        const newQuantity = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
        return { ...item, quantity: Math.max(newQuantity, 0) };
      }
      return item;
    }).filter(item => item.quantity > 0);

    setCart(updatedCart);
  };

  const handleBarcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;
    
    const product = findProductByBarcode(barcodeInput);
    if (product) {
      addToCart(product);
      toast({
        title: "Product added",
        description: `${product.name} has been added to the cart`
      });
    } else {
      toast({
        title: "Product not found",
        description: "No product with this barcode was found",
        variant: "destructive"
      });
    }
    
    setBarcodeInput("");
    setBarcodeModalOpen(false);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;
  
  const getChange = () => {
    const tendered = parseFloat(amountTendered || "0");
    return Math.max(0, tendered - total).toFixed(2);
  };

  const handleCompletePayment = () => {
    if (currentTab === "cash" && parseFloat(amountTendered || "0") < total) {
      toast({
        title: "Invalid Payment",
        description: "Amount tendered is less than the total amount",
        variant: "destructive"
      });
      return;
    }
    
    const newOrder: Order = {
      id: orderIdPrefix,
      items: [...cart],
      subtotal,
      gst,
      total,
      paymentMethod: currentTab,
      paymentStatus: 'Paid',
      orderDate: new Date().toISOString(),
      orderStatus: 'Delivered',
      customerName: customerInfo.name || "Guest Customer",
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email
    };
    
    try {
      addOrder(newOrder);
      
      toast({
        title: "Order Completed",
        description: `Order #${orderIdPrefix} has been created successfully.`
      });
      
      setCart([]);
      setAmountTendered("");
      setPaymentModalOpen(false);
      setCustomerInfo({ name: "", phone: "", email: "" });
      
      printReceipt(newOrder);
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to complete the order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const printReceipt = (order: Order) => {
    const receiptWindow = window.open('', '_blank', 'width=400,height=600');
    
    if (!receiptWindow) {
      toast({
        title: "Print Error",
        description: "Could not open print window. Please check your popup blocker settings.",
        variant: "destructive"
      });
      return;
    }
    
    const orderDate = new Date(order.orderDate);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const formattedTime = orderDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const isUpiPayment = order.paymentMethod === 'upi';
    const upiQrCode = isUpiPayment ? 
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=ashokkothari738@oksbi%26pn=KothariDryFruits%26am=${order.total}%26cu=INR` : '';
    
    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order #${order.id}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 20px;
            max-width: 380px;
          }
          .receipt {
            border: 1px solid #ddd;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo {
            max-width: 100px;
            margin: 0 auto;
            display: block;
          }
          .title {
            font-size: 18px;
            font-weight: bold;
            margin: 10px 0;
          }
          .info {
            margin: 5px 0;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            text-align: left;
            padding: 8px 4px;
            border-bottom: 1px solid #ddd;
            font-size: 14px;
          }
          th {
            font-weight: bold;
          }
          .item-price {
            text-align: right;
          }
          .subtotal-row td {
            border-top: 1px solid #000;
            border-bottom: none;
            padding-top: 10px;
          }
          .total-row td {
            font-weight: bold;
            border-bottom: none;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
          }
          .divider {
            border-top: 1px dashed #ddd;
            margin: 15px 0;
          }
          .qr-code {
            text-align: center;
            margin: 15px 0;
          }
          .qr-code img {
            max-width: 150px;
            margin: 10px auto;
          }
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            .receipt {
              border: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="title">Kothari's Dry Fruits</div>
            <div class="info">123 Market Street, Mumbai, India</div>
            <div class="info">Phone: +91 9876543210</div>
            <div class="info">GST No: 27AAAAA0000A1Z5</div>
          </div>
          
          <div class="order-info">
            <div class="info">Order #: ${order.id}</div>
            <div class="info">Date: ${formattedDate} ${formattedTime}</div>
            <div class="info">Customer: ${order.customerName}</div>
            ${order.customerPhone ? `<div class="info">Phone: ${order.customerPhone}</div>` : ''}
          </div>
          
          <div class="divider"></div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th class="item-price">Price</th>
                <th class="item-price">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity} ${item.unit}</td>
                  <td class="item-price">₹${item.price.toFixed(2)}</td>
                  <td class="item-price">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
              
              <tr class="subtotal-row">
                <td colspan="3">Subtotal</td>
                <td class="item-price">₹${order.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3">GST (Included)</td>
                <td class="item-price">₹${order.gst.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3">Total</td>
                <td class="item-price">₹${order.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3">Payment Method</td>
                <td class="item-price">${order.paymentMethod.toUpperCase()}</td>
              </tr>
              ${order.paymentMethod === 'cash' ? `
                <tr>
                  <td colspan="3">Amount Tendered</td>
                  <td class="item-price">₹${parseFloat(amountTendered).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3">Change</td>
                  <td class="item-price">₹${getChange()}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
          
          ${isUpiPayment ? `
            <div class="qr-code">
              <p>Scan to pay via UPI:</p>
              <img src="${upiQrCode}" alt="UPI QR Code">
              <p>UPI ID: ashokkothari738@oksbi</p>
            </div>
          ` : ''}
          
          <div class="divider"></div>
          
          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>All prices are inclusive of taxes.</p>
            <p>Visit us again soon.</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          }
        </script>
      </body>
      </html>
    `);
    
    receiptWindow.document.close();
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="gap-1"
            onClick={() => setBarcodeModalOpen(true)}
          >
            <Scan className="h-4 w-4" />
            Scan Barcode
          </Button>
          <Button 
            variant="outline" 
            className="gap-1"
            onClick={() => {
              toast({
                title: "Order Saved",
                description: "Your current order has been saved as a draft."
              });
            }}
          >
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
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <Card
                  key={product.id}
                  className={`card-hover cursor-pointer overflow-hidden ${
                    product.variants[0]?.stock <= 0 ? "opacity-50" : ""
                  }`}
                  onClick={() => addToCart(product)}
                >
                  <div className="aspect-square w-full overflow-hidden">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="h-full w-full object-cover transition-all hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted">
                        <Package className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-muted-foreground">{product.sku}</span>
                      <span className="font-semibold">₹{product.variants[0]?.price}/{product.variants[0]?.unit}</span>
                    </div>
                    <div className="text-xs mt-1">
                      {product.variants[0]?.stock > 0 ? (
                        <span className="text-green-600">In Stock: {product.variants[0]?.stock}</span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-center p-4">
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

      <Dialog open={barcodeModalOpen} onOpenChange={setBarcodeModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Scan Barcode</DialogTitle>
            <DialogDescription>
              Enter or scan product barcode to quickly add to cart
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleBarcodeSearch} className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Barcode className="h-16 w-16 text-primary mb-2" />
              <div className="w-full space-y-2">
                <Label htmlFor="barcode-input">Barcode</Label>
                <Input
                  id="barcode-input"
                  placeholder="Enter barcode number"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  ref={barcodeInputRef}
                  autoFocus
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBarcodeModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Find Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
            <DialogDescription>
              Select a payment method to complete the transaction.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer-name">Customer Name</Label>
                <Input 
                  id="customer-name" 
                  placeholder="Optional" 
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-phone">Phone Number</Label>
                <Input 
                  id="customer-phone" 
                  placeholder="Optional" 
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                />
              </div>
            </div>
            
            <Tabs defaultValue="upi" className="w-full" value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upi">UPI</TabsTrigger>
                <TabsTrigger value="cash">Cash</TabsTrigger>
                <TabsTrigger value="card">Card</TabsTrigger>
              </TabsList>
              <TabsContent value="upi" className="p-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center justify-center w-48 h-48 bg-gray-100 rounded-lg">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=ashokkothari738@oksbi%26pn=KothariDryFruits%26am=${total}%26cu=INR`} 
                      alt="UPI QR Code" 
                      className="max-w-full max-h-full"
                    />
                  </div>
                  <p className="text-center">Scan with any UPI app</p>
                  <p className="font-medium text-center">ashokkothari738@oksbi</p>
                  <Button className="w-full gap-2" onClick={handleCompletePayment}>
                    <Wallet className="h-4 w-4" />
                    Complete Payment
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="cash" className="p-4 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount-tendered">Amount Tendered</Label>
                  <Input 
                    id="amount-tendered" 
                    type="number" 
                    step="0.01"
                    placeholder="Enter amount" 
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                  />
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-semibold">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span className="font-semibold">₹{getChange()}</span>
                </div>
                <Button 
                  className="w-full"
                  onClick={handleCompletePayment}
                  disabled={parseFloat(amountTendered || "0") < total}
                >
                  Complete Cash Payment
                </Button>
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
                <Button className="w-full gap-2" onClick={handleCompletePayment}>
                  <CreditCard className="h-4 w-4" />
                  Process Card Payment
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={() => {
                if (cart.length > 0) {
                  const draftOrder: Order = {
                    id: orderIdPrefix + "-DRAFT",
                    items: [...cart],
                    subtotal,
                    gst,
                    total,
                    paymentMethod: 'not paid',
                    paymentStatus: 'Pending',
                    orderDate: new Date().toISOString(),
                    orderStatus: 'Pending',
                    customerName: customerInfo.name || "Guest Customer"
                  };
                  printReceipt(draftOrder);
                }
              }}
            >
              <Printer className="h-4 w-4" />
              Print Quote
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
