
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
} from "@/components/ui/dropdown-menu";

const BillsReport = () => {
  const { orders } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  // Filter the orders based on search, payment method, and date
  const filteredOrders = orders.filter((order) => {
    // Filter by search (order ID or customer name)
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by payment method
    const matchesPaymentMethod =
      paymentMethodFilter === "all" || order.paymentMethod === paymentMethodFilter;

    // Filter by date
    const matchesDate =
      !date ||
      format(new Date(order.orderDate), "yyyy-MM-dd") === format(date, "yyyy-MM-dd");

    // Filter by source (POS vs Orders)
    const orderSource = order.id.startsWith("ORD") ? "pos" : "orders";
    const matchesSource = sourceFilter === "all" || orderSource === sourceFilter;

    return matchesSearch && matchesPaymentMethod && matchesDate && matchesSource;
  });

  // Function to print a receipt
  const printReceipt = (order: Order) => {
    // This is a placeholder - in a real app, you would call the same receipt printing function
    // that's used in the POS page
    window.open(`/receipts/${order.id}`, "_blank");
  };

  // Function to download receipts
  const downloadReceipt = (order: Order) => {
    // This is a placeholder for downloading receipt functionality
    console.log("Downloading receipt for order", order.id);
  };

  // Function to connect to OneDrive for backup
  const connectToOneDrive = () => {
    // This is a placeholder - would need Microsoft Graph API integration
    alert("OneDrive connection feature is coming soon. This would allow automatic backups of all transaction data.");
  };

  const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bills & Receipts</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={connectToOneDrive} className="gap-1">
            <Download className="h-4 w-4" />
            Backup to OneDrive
          </Button>
        </div>
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
              {filteredOrders.filter(o => o.id.startsWith("ORD")).length} POS / {filteredOrders.filter(o => !o.id.startsWith("ORD")).length} Orders
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
                <TableHead>Bill #</TableHead>
                <TableHead>Date & Time</TableHead>
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
                  const source = order.id.startsWith("ORD") ? "POS" : "Order";
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        {format(orderDate, "PPP")}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {format(orderDate, "p")}
                        </span>
                      </TableCell>
                      <TableCell>
                        {order.customerName}
                        {order.customerPhone && (
                          <div className="text-xs text-muted-foreground">
                            {order.customerPhone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {order.paymentMethod}
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
                              Print Receipt
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => downloadReceipt(order)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
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

      {/* OneDrive Backup Information */}
      <div className="p-4 bg-muted rounded-lg border border-border">
        <h3 className="font-semibold mb-2">About OneDrive Backup</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Connect your Microsoft OneDrive account to automatically back up all your transaction data,
          receipts, and database. This ensures your business data is safe and accessible from anywhere.
        </p>
        <Button variant="outline" onClick={connectToOneDrive} className="gap-1">
          <Download className="h-4 w-4" />
          Setup OneDrive Backup
        </Button>
      </div>
    </div>
  );
};

export default BillsReport;
