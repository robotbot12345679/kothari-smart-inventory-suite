import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, Calendar, Package, FileDown, Printer, Trash } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCloudData } from "@/context/CloudDataContext";
import { Order } from "@/types/pos";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import AddOrderDialog from "@/components/orders/AddOrderDialog";

const Orders = () => {
  const { orders, deleteOrder } = useCloudData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  // Filter orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.order_status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate total orders value
  const totalOrdersValue = orders.reduce((total, order) => total + order.total, 0);

  // Function to handle printing an order
  const handlePrint = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Check if UPI method is selected
    const isUpiPayment = order.payment_method === 'upi';
    
    // Generate UPI QR data URI - in a real app, this would be an actual QR code
    const upiQrCode = isUpiPayment ? 
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=ashokkothari738@oksbi%26pn=KothariDryFruits%26am=${order.total}%26cu=INR` : '';

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Receipt - ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .order-info { margin-bottom: 20px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .total { text-align: right; margin-top: 20px; }
          .qr-code { text-align: center; margin: 20px 0; }
          .qr-code img { max-width: 150px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Kothari's Dry Fruits & More</h2>
          <p>123 Market Street, Mumbai, Maharashtra</p>
          <p>Phone: +91 9876543210 | Email: info@kotharidryfruits.com</p>
          <hr />
          <p>Order Receipt</p>
          <p>Order ID: ${order.id}</p>
          <p>Date: ${format(new Date(order.order_date), 'PPP')}</p>
        </div>
        <div class="order-info">
          ${order.customer_name ? `<p><strong>Customer:</strong> ${order.customer_name}</p>` : ''}
          ${order.customer_phone ? `<p><strong>Phone:</strong> ${order.customer_phone}</p>` : ''}
          ${order.customer_email ? `<p><strong>Email:</strong> ${order.customer_email}</p>` : ''}
        </div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity} ${item.unit}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          <p><strong>Subtotal:</strong> ₹${order.subtotal.toFixed(2)}</p>
          <p><strong>GST (Included):</strong> ₹${order.gst.toFixed(2)}</p>
          <p><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
          <p><strong>Payment Status:</strong> ${order.payment_status}</p>
          <p><strong>Payment Method:</strong> ${order.payment_method}</p>
        </div>
        ${isUpiPayment ? `
          <div class="qr-code">
            <p>Scan to pay via UPI:</p>
            <img src="${upiQrCode}" alt="UPI QR Code">
            <p>UPI ID: ashokkothari738@oksbi</p>
          </div>
        ` : ''}
        <hr />
        <div style="text-align: center; margin-top: 20px; font-size: 14px;">
          <p>Thank you for your business!</p>
          <p>All prices are tax inclusive.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();

    toast({
      title: "Print initiated",
      description: `Printing order ${order.id}`,
    });
  };

  const handleDeleteConfirm = () => {
    if (orderToDelete) {
      deleteOrder(orderToDelete.id);
      toast({
        title: "Order Deleted",
        description: `Order ${orderToDelete.id} has been deleted.`,
      });
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <Button onClick={() => setIsAddOrderOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Order
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(order => order.order_status === 'Pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(order => 
                new Date(order.order_date).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total value: ₹{totalOrdersValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{orders.length > 0 ? (totalOrdersValue / orders.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="p-4 border-b flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="w-full bg-background pl-8 md:w-96"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer_name || '-'}</TableCell>
                    <TableCell>
                      {format(new Date(order.order_date), 'PP')}
                    </TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(order.order_status || 'Pending')}>
                        {order.order_status || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPaymentStatusColor(order.payment_status || 'Pending')}>
                        {order.payment_status || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handlePrint(order)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteOrder(order)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <p className="text-muted-foreground">No orders found</p>
                    {searchQuery || statusFilter !== "all" ? (
                      <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
                    ) : (
                      <Button 
                        onClick={() => setIsAddOrderOpen(true)} 
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Order
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="p-4 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{filteredOrders.length}</span> orders
          </p>
        </div>
      </div>

      <AddOrderDialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen} />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the order. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Processing":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "Pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "Shipped":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    case "Cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "Failed":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

export default Orders;
