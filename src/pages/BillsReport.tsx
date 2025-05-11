import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  FileText,
  Download,
  Printer,
  ChevronDown,
  MessageSquare,
  CreditCard,
  Link,
  Mail,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useData } from "@/context/DataContext";
import { Order } from "@/types/pos";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sendInvoiceViaWhatsApp, createPrintableInvoice } from "@/services/WhatsAppService";
import ProfessionalInvoice from "@/components/invoice/ProfessionalInvoice";
import { generateInvoiceNumber } from "@/services/InvoiceService";

const BillsReport = () => {
  const { orders, updateOrderPaymentStatus } = useData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isPaymentLinkDialogOpen, setIsPaymentLinkDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [messageText, setMessageText] = useState("");
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  
  // Filter the orders based on search, payment method, and date
  const filteredOrders = orders.filter((order) => {
    // Filter by search (order ID or customer name)
    const matchesSearch =
      searchQuery === "" ||
      (order.id && order.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter by payment method
    const matchesPaymentMethod =
      paymentMethodFilter === "all" || order.paymentMethod === paymentMethodFilter;

    // Filter by date
    const matchesDate =
      !date ||
      (order.orderDate && format(new Date(order.orderDate), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));

    // Filter by source (POS vs Orders)
    const orderSource = order.id && order.id.startsWith("ORD") ? "pos" : "orders";
    const matchesSource = sourceFilter === "all" || orderSource === sourceFilter;

    return matchesSearch && matchesPaymentMethod && matchesDate && matchesSource;
  });

  // Function to print a receipt
  const printReceipt = (order: Order) => {
    setSelectedOrder(order);
    setShowInvoicePreview(true);
  };

  // Function to download receipts
  const downloadReceipt = (order: Order) => {
    setSelectedOrder(order);
    setShowInvoicePreview(true);
  };

  // Function to handle sharing invoice via WhatsApp
  const shareInvoiceWhatsApp = () => {
    if (!selectedOrder || !customerPhone) {
      toast({
        title: "Missing Information",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    sendInvoiceViaWhatsApp(selectedOrder, customerPhone);
    
    toast({
      title: "WhatsApp Message Ready",
      description: "Redirecting to WhatsApp to send the invoice",
    });
    
    setIsShareDialogOpen(false);
    setCustomerPhone("");
    setMessageText("");
  };

  // Function to handle sharing invoice via Email
  const shareInvoiceEmail = () => {
    if (!selectedOrder || !customerEmail) {
      toast({
        title: "Missing Information",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    // Get billing template from localStorage or use defaults
    const storedTemplate = localStorage.getItem("billingTemplate");
    const billingTemplate = storedTemplate ? JSON.parse(storedTemplate) : {
      shopName: "Kothari's Dry Fruits & More"
    };
    
    const invoiceNumber = generateInvoiceNumber(selectedOrder.id);
    const orderDate = new Date(selectedOrder.orderDate);
    const formattedDate = format(orderDate, 'PP');
    
    const subject = `Invoice ${invoiceNumber} - ${billingTemplate.shopName}`;
    const body = messageText || 
      `Dear ${selectedOrder.customerName || ""},

Please find attached your invoice #${invoiceNumber} for Rs. ${selectedOrder.total.toFixed(2)} dated ${formattedDate}.

Thank you for shopping with us!

Regards,
${billingTemplate.shopName}`;
    
    // First, generate the PDF in a new window
    createPrintableInvoice(selectedOrder);
    
    // After a short delay to allow the PDF to initialize, open the email client
    setTimeout(() => {
      // Generate mailto URL
      const mailtoUrl = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open email client
      window.location.href = mailtoUrl;
    }, 500);
    
    toast({
      title: "Email Prepared",
      description: "Opening your email client to send the invoice with PDF attachment",
    });
    
    setIsShareDialogOpen(false);
    setCustomerEmail("");
    setMessageText("");
  };

  // Function to record payment
  const handleRecordPayment = () => {
    if (!selectedOrder) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || amount > selectedOrder.total) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }
    
    // Update the order payment status - Fix the type issue by ensuring paymentStatus is one of the allowed values
    const updatedOrder = {
      ...selectedOrder,
      paymentStatus: "Paid" as "Pending" | "Paid" | "Failed", // Type assertion to match the required union type
      paymentMethod: paymentMethod,
      paymentDate: paymentDate ? paymentDate.toISOString() : new Date().toISOString()
    };
    
    updateOrderPaymentStatus(selectedOrder.id, updatedOrder);
    
    toast({
      title: "Payment Recorded",
      description: `Payment of ₹${amount.toFixed(2)} has been recorded for invoice ${generateInvoiceNumber(selectedOrder.id)}`,
    });
    
    setIsRecordPaymentOpen(false);
    setPaymentAmount("");
  };

  // Function to generate payment link
  const generatePaymentLink = () => {
    if (!selectedOrder) {
      toast({
        title: "Error",
        description: "No order selected",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, this would call your payment gateway API
    // For now, we'll simulate creating a payment link
    const invoiceNumber = generateInvoiceNumber(selectedOrder.id);
    const dummyPaymentLink = `https://pay.example.com/invoice/${invoiceNumber}?amount=${selectedOrder.total}`;
    
    // Copy link to clipboard
    navigator.clipboard.writeText(dummyPaymentLink).then(() => {
      toast({
        title: "Payment Link Generated",
        description: "The payment link has been copied to clipboard",
      });
    });
    
    setIsPaymentLinkDialogOpen(false);
  };

  const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bills & Receipts</h1>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              From {orders.length} total transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sales Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across all filtered transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Source Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredOrders.filter(o => o.id && o.id.startsWith("ORD")).length} POS / {filteredOrders.filter(o => o.id && !o.id.startsWith("ORD")).length} Orders
            </div>
            <p className="text-xs text-muted-foreground">
              POS vs. Order Management bills
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="p-4 border-b flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by order ID or customer..."
              className="w-full bg-background pl-8 md:w-96"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "justify-start text-left font-normal gap-1",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Select
              value={paymentMethodFilter}
              onValueChange={setPaymentMethodFilter}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="pos">POS</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="gap-1" onClick={() => {
              setSearchQuery("");
              setPaymentMethodFilter("all");
              setSourceFilter("all");
              setDate(undefined);
            }}>
              <Filter className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const orderDate = new Date(order.orderDate);
                  const source = order.id?.startsWith("ORD") ? "POS" : "Order";
                  const isPaid = order.paymentStatus === "Paid";
                  const invoiceNumber = generateInvoiceNumber(order.id);
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{invoiceNumber}</TableCell>
                      <TableCell>
                        {format(orderDate, "PPP")}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {format(orderDate, "p")}
                        </span>
                      </TableCell>
                      <TableCell>
                        {order.customerName ? order.customerName : "—"}
                        {order.customerPhone && (
                          <div className="text-xs text-muted-foreground">
                            {order.customerPhone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {isPaid ? "Paid" : "Pending"} - {order.paymentMethod || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={source === "POS" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                          {source}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{order.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => printReceipt(order)}>
                              <Printer className="mr-2 h-4 w-4" />
                              View/Print Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => downloadReceipt(order)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              setSelectedOrder(order);
                              setIsShareDialogOpen(true);
                              setCustomerPhone(order.customerPhone || "");
                            }}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Share via WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedOrder(order);
                              setIsShareDialogOpen(true);
                              setCustomerEmail(order.customerEmail || "");
                            }}>
                              <Mail className="mr-2 h-4 w-4" />
                              Share via Email
                            </DropdownMenuItem>
                            {!isPaid && (
                              <>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedOrder(order);
                                  setPaymentAmount(order.total.toString());
                                  setIsRecordPaymentOpen(true);
                                }}>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Record Payment
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedOrder(order);
                                  setIsPaymentLinkDialogOpen(true);
                                }}>
                                  <Link className="mr-2 h-4 w-4" />
                                  Generate Payment Link
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                    <div className="text-muted-foreground">No bills found</div>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters or search
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="p-4 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{filteredOrders.length}</span> of{" "}
            <span className="font-medium">{orders.length}</span> bills
          </p>
        </div>
      </div>

      {/* WhatsApp/Email Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share Invoice</DialogTitle>
            <DialogDescription>
              Send this invoice to your customer via WhatsApp or Email
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Tabs defaultValue="whatsapp">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="whatsapp" className="gap-2">
                  <MessageSquare className="h-4 w-4" /> WhatsApp
                </TabsTrigger>
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="h-4 w-4" /> Email
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="whatsapp" className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <Input
                    id="phone-number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 9876543210"
                  />
                  <p className="text-xs text-muted-foreground">Include country code (e.g. +91 for India)</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Custom Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Enter custom message or leave blank to use default"
                    rows={3}
                  />
                </div>
                
                <Button onClick={shareInvoiceWhatsApp} className="w-full gap-2">
                  <MessageSquare className="h-4 w-4" /> Share via WhatsApp
                </Button>
              </TabsContent>
              
              <TabsContent value="email" className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-message">Custom Message (Optional)</Label>
                  <Textarea
                    id="email-message"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Enter custom message or leave blank to use default"
                    rows={3}
                  />
                </div>
                
                <Button onClick={shareInvoiceEmail} className="w-full gap-2">
                  <Mail className="h-4 w-4" /> Share via Email
                </Button>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Link Dialog */}
      <Dialog open={isPaymentLinkDialogOpen} onOpenChange={setIsPaymentLinkDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate Payment Link</DialogTitle>
            <DialogDescription>
              Create a payment link for this invoice to send to your customer
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Invoice Number:</span>
                <span>{selectedOrder ? generateInvoiceNumber(selectedOrder.id) : ''}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Customer:</span>
                <span>{selectedOrder?.customerName || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Amount:</span>
                <span className="font-bold">₹{selectedOrder?.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="bg-muted p-3 rounded text-sm">
              <p>This will generate a payment link that can be shared with the customer. Once the payment is complete, the order status will be updated.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={generatePaymentLink} className="gap-2">
              <CreditCard className="h-4 w-4" /> Generate Payment Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={isRecordPaymentOpen} onOpenChange={setIsRecordPaymentOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for invoice {selectedOrder ? generateInvoiceNumber(selectedOrder.id) : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Payment Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">₹</span>
                <Input
                  id="payment-amount"
                  type="number"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-date">Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !paymentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate ? format(paymentDate, 'PPP') : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={paymentDate}
                    onSelect={setPaymentDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRecordPaymentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Dialog */}
      <Dialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview}>
        <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto p-0">
          {selectedOrder && (
            <ProfessionalInvoice 
              order={selectedOrder} 
              onClose={() => setShowInvoicePreview(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillsReport;
