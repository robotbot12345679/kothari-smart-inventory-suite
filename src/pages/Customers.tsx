import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, UserPlus, Users, Phone, Mail, FileDown, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCloudData } from "@/context/CloudDataContext";
import { Label } from "@/components/ui/label";
import { Customer } from "@/types/pos";
import EditCustomerDialog from "@/components/customers/EditCustomerDialog";
import { useToast } from "@/components/ui/use-toast";

const Customers = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, orders } = useCloudData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({});
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchQuery === "" || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      customer.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = orders.length > 0 
    ? totalRevenue / orders.length 
    : 0;
  const customerLifetimeValue = customers.length > 0
    ? totalRevenue / customers.length
    : 0;

  const handleAddCustomer = async () => {
    if (newCustomer.name && newCustomer.phone) {
      try {
        await addCustomer({
          name: newCustomer.name,
          email: newCustomer.email || '',
          phone: newCustomer.phone,
          address: '',
          city: '',
          state: '',
          pincode: '',
          notes: '',
          birthday: newCustomer.birthday || '',
          total_orders: 0,
          total_spent: 0,
          status: 'Active',
          last_order_date: null,
          order_history: []
        });
        toast({
          title: "Success",
          description: "Customer added successfully"
        });
        setNewCustomer({});
        setIsAddCustomerOpen(false);
      } catch (error) {
        console.error('Error adding customer:', error);
      }
    } else {
      toast({
        title: "Error",
        description: "Please fill in name and phone number",
        variant: "destructive"
      });
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditCustomerOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete.id);
      toast({
        title: "Customer Deleted",
        description: `${customerToDelete.name} has been deleted successfully.`,
      });
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? "bg-green-100 text-green-800 hover:bg-green-100"
      : "bg-gray-100 text-gray-800 hover:bg-gray-100";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <div className="flex items-center gap-2">
          <Button 
            className="gap-1" 
            variant="outline"
            onClick={() => {
              const csvHeaders = ['Name', 'Phone', 'Email', 'City', 'State', 'Birthday', 'Total Orders', 'Total Spent', 'Last Order Date', 'Status'];
              const csvData = customers.map(customer => ({
                'Name': customer.name,
                'Phone': customer.phone,
                'Email': customer.email || '',
                'City': customer.city || '',
                'State': customer.state || '',
                'Birthday': customer.birthday || '',
                'Total Orders': customer.total_orders || 0,
                'Total Spent': customer.total_spent || 0,
                'Last Order Date': customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString('en-IN') : '',
                'Status': customer.status || 'Active'
              }));
              
              import('@/lib/csv-exporter').then(({ exportToCSV, downloadCSV }) => {
                const csvContent = exportToCSV(csvData, csvHeaders);
                downloadCSV(csvContent, `customers-${new Date().toISOString().split('T')[0]}.csv`);
              });
            }}
          >
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-1" onClick={() => setIsAddCustomerOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">Active: {activeCustomers}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <UserPlus className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {((activeCustomers / customers.length) * 100).toFixed(1)}% active rate
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{customerLifetimeValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Average per customer</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Enter customer details below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
              <Input
                id="name"
                placeholder="Enter customer name"
                className="mt-1 border-2 border-muted focus:border-primary"
                value={newCustomer.name || ''}
                onChange={e => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                className="mt-1 border-2 border-muted focus:border-primary"
                value={newCustomer.phone || ''}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '');
                  setNewCustomer(prev => ({ ...prev, phone: value }));
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                className="mt-1 border-2 border-muted focus:border-primary"
                value={newCustomer.email || ''}
                onChange={e => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="birthday" className="text-sm font-medium">Birthday (Optional)</Label>
              <Input
                id="birthday"
                type="date"
                className="mt-1 border-2 border-muted focus:border-primary"
                value={newCustomer.birthday || ''}
                onChange={e => setNewCustomer(prev => ({ ...prev, birthday: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCustomerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomer}>Add Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditCustomerDialog
        open={isEditCustomerOpen}
        onOpenChange={setIsEditCustomerOpen}
        customer={selectedCustomer}
        onDelete={handleDeleteClick}
      />

      <div className="bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="p-4 border-b flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="w-full bg-background pl-8 md:w-96"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        {customer.email && (
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-1 mt-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {customer.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{customer.total_orders || 0}</TableCell>
                  <TableCell className="text-right">₹{(customer.total_spent || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    {customer.last_order_date 
                      ? new Date(customer.last_order_date).toLocaleDateString('en-IN') 
                      : 'No orders yet'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditCustomer(customer)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(customer)}
                      >
                        <Trash className="h-4 w-4" />
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
            Showing <span className="font-medium">{filteredCustomers.length}</span> customers
          </p>
        </div>
      </div>

      <EditCustomerDialog
        customer={selectedCustomer}
        open={isEditCustomerOpen}
        onOpenChange={setIsEditCustomerOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {customerToDelete?.name}. This action cannot be undone.
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

export default Customers;
