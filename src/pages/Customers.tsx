import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, UserPlus, Users, Phone, Mail, FileDown } from "lucide-react";
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
import { useData } from "@/context/DataContext";
import { Label } from "@/components/ui/label";
import { Customer } from "@/types/pos";

const Customers = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, orders } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({});
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchQuery === "" || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    const matchesLocation = locationFilter === "all" || 
      customer.city.toLowerCase() === locationFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = orders.length > 0 
    ? totalRevenue / orders.length 
    : 0;
  const customerLifetimeValue = customers.length > 0
    ? totalRevenue / customers.length
    : 0;

  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.email && newCustomer.phone) {
      addCustomer({
        id: 0, // Will be set by addCustomer function
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        city: newCustomer.city || '',
        state: newCustomer.state || '',
        totalOrders: 0,
        totalSpent: 0,
        status: 'Active'
      });
      setNewCustomer({});
      setIsAddCustomerOpen(false);
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
          <Button className="gap-1" variant="outline">
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
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newCustomer.name || ''}
                onChange={e => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newCustomer.email || ''}
                onChange={e => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newCustomer.phone || ''}
                onChange={e => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={newCustomer.city || ''}
                onChange={e => setNewCustomer(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={newCustomer.state || ''}
                onChange={e => setNewCustomer(prev => ({ ...prev, state: e.target.value }))}
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
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {[...new Set(customers.map(c => c.city).filter(Boolean))].map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
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
                <TableHead>Location</TableHead>
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
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {customer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.city}, {customer.state}
                  </TableCell>
                  <TableCell className="text-right">{customer.totalOrders}</TableCell>
                  <TableCell className="text-right">₹{customer.totalSpent.toLocaleString()}</TableCell>
                  <TableCell>
                    {customer.lastOrderDate 
                      ? new Date(customer.lastOrderDate).toLocaleDateString('en-IN') 
                      : 'No orders yet'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => {/* Edit functionality */}}>
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteCustomer(customer.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
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
    </div>
  );
};

export default Customers;
