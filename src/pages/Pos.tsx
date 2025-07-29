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
  Package,
  Share,
  Check
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
import { CartItem, Order, Product, Customer } from "@/types/pos";
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/use-toast";
import { useUniqueId } from "@/hooks/useUniqueId";
import ProfessionalInvoice from "@/components/invoice/ProfessionalInvoice";
import { sendInvoiceViaWhatsApp } from "@/services/WhatsAppService";

// Add interface for scanned products with quantity
interface ScannedProduct extends Product {
  scannedQuantity: number;
}

const Pos = () => {
  const { products, categories, addOrder, findProductByBarcode, updateInventoryAfterSale, customers, addCustomer } = useData();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState<boolean>(false);
  const [barcodeInput, setBarcodeInput] = useState<string>("");
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [amountTendered, setAmountTendered] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<string>("upi");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: ""
  });
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);
  const [showProfessionalInvoice, setShowProfessionalInvoice] = useState<boolean>(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  
  const orderId = useUniqueId("ORD");
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (barcodeModalOpen && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [barcodeModalOpen]);

  // Function to find existing customer by phone or name (case insensitive)
  const findExistingCustomer = (name: string, phone: string) => {
    return customers.find(customer => {
      // Check if phone matches
      if (phone && customer.phone === phone) {
        return true;
      }
      
      // Check if name matches (full name, first name, or last name)
      if (name) {
        const searchName = name.toLowerCase().trim();
        const customerName = customer.name.toLowerCase();
        const nameParts = customerName.split(' ');
        
        return customerName === searchName || 
               nameParts.some(part => part === searchName);
      }
      
      return false;
    });
  };

  // Handle customer info changes with auto-lookup
  const handleCustomerInfoChange = (field: string, value: string) => {
    const updatedInfo = { ...customerInfo, [field]: value };
    setCustomerInfo(updatedInfo);

    // Auto-lookup existing customer when name or phone is entered
    if (field === 'name' || field === 'phone') {
      if (value.trim()) {
        const existingCustomer = findExistingCustomer(
          field === 'name' ? value : customerInfo.name,
          field === 'phone' ? value : customerInfo.phone
        );
        
        if (existingCustomer) {
          setMatchedCustomer(existingCustomer);
          setCustomerInfo({
            name: existingCustomer.name,
            phone: existingCustomer.phone,
            email: existingCustomer.email
          });
        } else {
          setMatchedCustomer(null);
        }
      } else {
        setMatchedCustomer(null);
      }
    }
  };

  const filteredProducts = products.filter(product => {
    if (!product.isActive) return false;
    
    const matchesCategory = activeCategory === 1 || product.category === categories.find(c => c.id === activeCategory)?.name;
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
      
      toast({
        title: "Added to cart",
        description: `${product.name} quantity updated in cart`,
        variant: "default"
      });
    } else {
      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        unit: product.unit,
        weight: product.weight
      };
      setCart([...cart, cartItem]);
      
      toast({
        title: "Added to cart",
        description: `${product.name} added to cart`,
        variant: "default"
      });
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

  const handleBarcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    
    const product = findProductByBarcode(barcodeInput.trim());
    if (product) {
      // Check if product is already in scanned products list
      const existingProductIndex = scannedProducts.findIndex(p => p.id === product.id);
      
      if (existingProductIndex >= 0) {
        // Product already exists, increase quantity
        const updatedScannedProducts = [...scannedProducts];
        updatedScannedProducts[existingProductIndex].scannedQuantity += 1;
        setScannedProducts(updatedScannedProducts);
        toast({
          title: "Product scanned",
          description: `${product.name} quantity increased to ${updatedScannedProducts[existingProductIndex].scannedQuantity}`
        });
      } else {
        // New product, add to list
        const scannedProduct: ScannedProduct = {
          ...product,
          scannedQuantity: 1
        };
        setScannedProducts(prev => [...prev, scannedProduct]);
        toast({
          title: "Product scanned",
          description: `${product.name} has been scanned and added to the list`
        });
      }
    } else {
      toast({
        title: "Product not found",
        description: "No product with this barcode was found",
        variant: "destructive"
      });
    }
    
    setBarcodeInput("");
    // Keep the modal open - don't close it
  };

  const handleConfirmScannedProducts = () => {
    // Add all scanned products to cart with their quantities
    scannedProducts.forEach(scannedProduct => {
      const existingItemIndex = cart.findIndex(item => item.id === scannedProduct.id);
      
      if (existingItemIndex >= 0) {
        // Product already in cart, add the scanned quantity
        const updatedCart = [...cart];
        const newQuantity = updatedCart[existingItemIndex].quantity + scannedProduct.scannedQuantity;
        updatedCart[existingItemIndex].quantity = newQuantity;
        setCart(updatedCart);
      } else {
        // Product not in cart, add as new item
        const cartItem: CartItem = {
          id: scannedProduct.id,
          name: scannedProduct.name,
          price: scannedProduct.price,
          quantity: scannedProduct.scannedQuantity,
          unit: scannedProduct.unit,
          weight: scannedProduct.weight
        };
        setCart(prev => [...prev, cartItem]);
      }
    });
    
    const totalItems = scannedProducts.reduce((sum, product) => sum + product.scannedQuantity, 0);
    toast({
      title: "Products added to cart",
      description: `${totalItems} items from ${scannedProducts.length} products have been added to the cart`
    });
    
    // Clear scanned products and close modal
    setScannedProducts([]);
    setBarcodeInput("");
    setBarcodeModalOpen(false);
  };

  const handleRemoveScannedProduct = (productId: number) => {
    setScannedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const updateScannedProductQuantity = (productId: number, action: 'increase' | 'decrease') => {
    setScannedProducts(prev => prev.map(product => {
      if (product.id === productId) {
        const newQuantity = action === 'increase' 
          ? product.scannedQuantity + 1
          : Math.max(product.scannedQuantity - 1, 1);
        
        return { ...product, scannedQuantity: newQuantity };
      }
      return product;
    }));
  };

  const handleCloseBarcodeModal = () => {
    setScannedProducts([]);
    setBarcodeInput("");
    setBarcodeModalOpen(false);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;
  
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
      id: orderId,
      items: [...cart],
      subtotal,
      gst: 0,
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
      // Add customer to database if only name is provided and customer doesn't exist
      if (customerInfo.name.trim() && !matchedCustomer) {
        const newCustomer: Customer = {
          id: 0, // Will be auto-assigned by addCustomer
          name: customerInfo.name,
          phone: customerInfo.phone || '',
          email: customerInfo.email || '',
          city: '',
          state: '',
          totalOrders: 1,
          totalSpent: total,
          lastOrderDate: new Date().toISOString(),
          status: 'Active'
        };
        addCustomer(newCustomer);
      } else if (matchedCustomer) {
        // Update existing customer's order count and spending
        const updatedCustomer = {
          ...matchedCustomer,
          totalOrders: matchedCustomer.totalOrders + 1,
          totalSpent: matchedCustomer.totalSpent + total,
          lastOrderDate: new Date().toISOString()
        };
        // Note: This would need updateCustomer from context, but for now we'll just track the order
      }

      // Update inventory stock levels after a successful sale
      updateInventoryAfterSale(cart);
      
      // Add the order to the system
      addOrder(newOrder);
      
      toast({
        title: "Order Completed",
        description: `Order #${orderId} has been created successfully.`
      });
      
      // Set current order for professional invoice
      setCurrentOrder(newOrder);
      
      setPaymentModalOpen(false);
      
      // Ask if they want to print receipt
      const shouldPrint = window.confirm("Do you want to print a receipt?");
      if (shouldPrint) {
        printReceipt(newOrder);
      }
      
      // Ask if they want to show professional invoice
      const shouldShowInvoice = window.confirm("Do you want to view/share a professional invoice?");
      if (shouldShowInvoice) {
        setShowProfessionalInvoice(true);
      }
      
      // Reset cart and customer info
      setCart([]);
      setAmountTendered("");
      setCustomerInfo({ name: "", phone: "", email: "" });
      setMatchedCustomer(null);
      
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
    
    // Get billing template from localStorage or use defaults
    const storedTemplate = localStorage.getItem("billingTemplate");
    const billingTemplate = storedTemplate ? JSON.parse(storedTemplate) : {
      shopName: "Kothari's Dry Fruits & More",
      address: "89, Sukan Mall, Nr. CIMS Hospital, Science City Road, Ahmedabad, Gujarat 380060",
      phone: "+91 75677 00090",
      logoUrl: "/lovable-uploads/6ab04e40-2860-4562-bace-e35da6383972.png",
      footerText: ["Thank you for shopping with us!", "Visit again soon!"]
    };
    
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

    const showQrCode = order.paymentMethod === 'upi';
    const upiQrCode = showQrCode ? 
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=ashokkothari738@oksbi%26pn=KothariDryFruits%26am=${order.total}%26cu=INR` : '';
    
    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order #${order.id}</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Playfair Display', serif;
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
            font-size: 22px;
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
            <img src="${billingTemplate.logoUrl}" class="logo" alt="Logo">
            <div class="title">${billingTemplate.shopName}</div>
            <div class="info">${billingTemplate.address}</div>
            <div class="info">Phone: ${billingTemplate.phone}</div>
            ${billingTemplate.gstNumber ? `<div class="info">GSTIN: ${billingTemplate.gstNumber}</div>` : ''}
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
                  <td>${item.quantity} ${item.quantity > 1 ? "items" : "item"}</td>
                  <td class="item-price">₹${item.price.toFixed(2)}</td>
                  <td class="item-price">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            
              <tr class="subtotal-row">
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
        
          ${showQrCode ? `
          <div class="qr-code">
            <p>Scan to pay via UPI:</p>
            <img src="${upiQrCode}" alt="UPI QR Code">
            <p>UPI ID: ashokkothari738@oksbi</p>
          </div>
          ` : ''}
        
          <div class="divider"></div>
        
          <div class="footer">
            ${billingTemplate.footerText.map(line => `<p>${line}</p>`).join('')}
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
    <div className="h-[calc(100vh-4rem)] flex flex-col font-playfair">
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

          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <Card
                  key={product.id}
                  className="card-hover cursor-pointer overflow-hidden h-80 flex flex-col"
                  onClick={() => addToCart(product)}
                >
                  <div className="h-48 w-full overflow-hidden">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="h-full w-full object-cover transition-all hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const container = target.parentElement;
                          if (container && !container.querySelector('.placeholder-icon')) {
                            container.classList.add("bg-muted", "flex", "items-center", "justify-center");
                            const icon = document.createElement('div');
                            icon.className = 'placeholder-icon';
                            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z"></path><path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2.12 2.12 0 0 1 .09-3.67Z"></path><line x1="12" y1="22" x2="12" y2="13"></line><path d="M20 13.5v3.37a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13.5"></path></svg>';
                            container.appendChild(icon);
                          }
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 truncate text-lg">{product.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{product.weight}{product.unit} • SKU: {product.sku}</p>
                    </div>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="font-semibold text-[#c87137] text-lg">₹{product.price}</span>
                      <span className="text-sm text-gray-600">{product.stock} in stock</span>
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
                        ₹{item.price} × {item.quantity} {item.quantity > 1 ? "items" : "item"}
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
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Amount to Pay</span>
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

      <Dialog open={barcodeModalOpen} onOpenChange={handleCloseBarcodeModal}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Scan Barcodes</DialogTitle>
            <DialogDescription>
              Scan multiple product barcodes and confirm to add them all to cart
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <form onSubmit={handleBarcodeSearch} className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <Barcode className="h-16 w-16 text-primary mb-2" />
                <div className="w-full space-y-2">
                  <Label htmlFor="barcode-input">Barcode</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode-input"
                      placeholder="Enter barcode number"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      ref={barcodeInputRef}
                      autoFocus
                    />
                    <Button type="submit" size="sm">
                      Scan
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {scannedProducts.length > 0 && (
              <div className="space-y-2">
                <Label>Scanned Products ({scannedProducts.length})</Label>
                <div className="border rounded-lg p-2 max-h-48 overflow-y-auto">
                  {scannedProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ₹{product.price} • SKU: {product.sku}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => updateScannedProductQuantity(product.id, 'decrease')}
                          disabled={product.scannedQuantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{product.scannedQuantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => updateScannedProductQuantity(product.id, 'increase')}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveScannedProduct(product.id)}
                          className="text-destructive hover:text-destructive h-6 w-6 p-0 ml-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
            
          <DialogFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleCloseBarcodeModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmScannedProducts}
              disabled={scannedProducts.length === 0}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              Add {scannedProducts.reduce((sum, p) => sum + p.scannedQuantity, 0)} Items to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Professional Invoice Dialog */}
      <Dialog open={showProfessionalInvoice} onOpenChange={setShowProfessionalInvoice}>
        <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto p-0">
          {currentOrder && (
            <ProfessionalInvoice 
              order={currentOrder} 
              onClose={() => setShowProfessionalInvoice(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Share Invoice Dialog */}
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
                  onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                />
                {matchedCustomer && (
                  <p className="text-sm text-green-600">✓ Existing customer found</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-phone">Phone Number</Label>
                <Input 
                  id="customer-phone" 
                  placeholder="Optional" 
                  value={customerInfo.phone}
                  onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                />
              </div>
            </div>
            
            {matchedCustomer && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Customer Details:</strong> {matchedCustomer.name} | {matchedCustomer.phone}
                  {matchedCustomer.email && ` | ${matchedCustomer.email}`}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Total Orders: {matchedCustomer.totalOrders} | Total Spent: ₹{matchedCustomer.totalSpent.toFixed(2)}
                </p>
              </div>
            )}
            
            {customerInfo.name.trim() && customerInfo.phone.trim() && !matchedCustomer && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ✓ New customer will be added to database
                </p>
              </div>
            )}
            
            <Tabs defaultValue="upi" className="w-full" value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upi">UPI</TabsTrigger>
                <TabsTrigger value="cash">Cash</TabsTrigger>
                <TabsTrigger value="card">Card</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upi" className="space-y-4">
                <div className="flex flex-col items-center">
                  <QrCode className="h-24 w-24 mb-2" />
                  <p className="text-center">Scan this QR code to pay via UPI</p>
                  <div className="text-center my-2">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=ashokkothari738@oksbi%26pn=KothariDryFruits%26am=${total}%26cu=INR`}
                      alt="UPI QR Code" 
                      className="max-w-[200px] mx-auto"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="cash" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount-tendered">Amount Tendered (₹)</Label>
                  <Input 
                    id="amount-tendered" 
                    type="number" 
                    step="0.01"
                    min={total}
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                  />
                </div>
                
                {parseFloat(amountTendered || "0") >= total && (
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Change to return:</span>
                    <span className="font-semibold">₹{getChange()}</span>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="card" className="space-y-4">
                <div className="flex flex-col items-center">
                  <CreditCard className="h-24 w-24 mb-2" />
                  <p className="text-center">Use card machine to process payment</p>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCompletePayment}>
                Complete Payment
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pos;
