import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCircle, Bell, Menu, Search, Shield, X } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCloudData } from "@/context/CloudDataContext";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const { products, orders, customers } = useCloudData();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Generate notifications based on system state
  const notifications = React.useMemo(() => {
    const notifs = [];
    
    // Low stock notifications
    const lowStockProducts = products.filter(p => p.stock <= (p.min_stock || 5));
    if (lowStockProducts.length > 0) {
      notifs.push({
        id: 'low-stock',
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${lowStockProducts.length} product(s) are running low on stock`,
        time: 'Now'
      });
    }
    
    // Pending orders
    const pendingOrders = orders.filter(o => o.order_status === 'Pending');
    if (pendingOrders.length > 0) {
      notifs.push({
        id: 'pending-orders',
        type: 'info',
        title: 'Pending Orders',
        message: `You have ${pendingOrders.length} pending order(s)`,
        time: 'Now'
      });
    }
    
    // New customers today
    const today = new Date().toDateString();
    const newCustomersToday = customers.filter(c => 
      new Date(c.created_at).toDateString() === today
    );
    if (newCustomersToday.length > 0) {
      notifs.push({
        id: 'new-customers',
        type: 'success',
        title: 'New Customers',
        message: `${newCustomersToday.length} new customer(s) today`,
        time: 'Today'
      });
    }
    
    // Recent orders
    const recentOrders = orders.filter(o => {
      const orderDate = new Date(o.order_date);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return orderDate > hourAgo;
    });
    if (recentOrders.length > 0) {
      notifs.push({
        id: 'recent-orders',
        type: 'info',
        title: 'Recent Activity',
        message: `${recentOrders.length} order(s) in the last hour`,
        time: 'Recent'
      });
    }
    
    return notifs;
  }, [products, orders, customers]);

  // Search results
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return { products: [], customers: [], orders: [] };
    
    const query = searchQuery.toLowerCase();
    
    return {
      products: products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.sku?.toLowerCase().includes(query) ||
        p.barcode?.toLowerCase().includes(query)
      ).slice(0, 5),
      customers: customers.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.phone?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query)
      ).slice(0, 5),
      orders: orders.filter(o => 
        o.id.toLowerCase().includes(query) ||
        o.customer_name?.toLowerCase().includes(query)
      ).slice(0, 5)
    };
  }, [searchQuery, products, customers, orders]);

  const hasSearchResults = searchResults.products.length > 0 || 
    searchResults.customers.length > 0 || 
    searchResults.orders.length > 0;

  return (
    <header className="fixed left-0 right-0 top-0 h-16 border-b bg-background z-20 flex items-center px-4">
      <div className="flex items-center gap-2">
        <MobileNav />
        <h1 className="text-lg font-bold">Kothari's Dry Fruits</h1>
      </div>
      
      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <Popover open={showSearch} onOpenChange={setShowSearch}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products, customers, orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                  autoFocus
                />
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1 h-6 w-6"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            
            {searchQuery.trim() && (
              <ScrollArea className="max-h-80">
                {!hasSearchResults ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No results found
                  </div>
                ) : (
                  <div className="p-2">
                    {searchResults.products.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">Products</p>
                        {searchResults.products.map(p => (
                          <Button
                            key={p.id}
                            variant="ghost"
                            className="w-full justify-start text-sm h-auto py-2"
                            onClick={() => {
                              navigate('/products');
                              setShowSearch(false);
                              setSearchQuery("");
                            }}
                          >
                            <div className="text-left">
                              <p className="font-medium">{p.name}</p>
                              <p className="text-xs text-muted-foreground">₹{p.price} • Stock: {p.stock}</p>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    {searchResults.customers.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">Customers</p>
                        {searchResults.customers.map(c => (
                          <Button
                            key={c.id}
                            variant="ghost"
                            className="w-full justify-start text-sm h-auto py-2"
                            onClick={() => {
                              navigate('/customers');
                              setShowSearch(false);
                              setSearchQuery("");
                            }}
                          >
                            <div className="text-left">
                              <p className="font-medium">{c.name}</p>
                              <p className="text-xs text-muted-foreground">{c.phone || c.email || 'No contact'}</p>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    {searchResults.orders.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">Orders</p>
                        {searchResults.orders.map(o => (
                          <Button
                            key={o.id}
                            variant="ghost"
                            className="w-full justify-start text-sm h-auto py-2"
                            onClick={() => {
                              navigate('/orders');
                              setShowSearch(false);
                              setSearchQuery("");
                            }}
                          >
                            <div className="text-left">
                              <p className="font-medium">{o.customer_name || 'Guest'}</p>
                              <p className="text-xs text-muted-foreground">₹{o.total} • {o.order_status}</p>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            )}
          </PopoverContent>
        </Popover>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {notifications.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-3 border-b font-semibold">
              Notifications
            </div>
            <ScrollArea className="max-h-80">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No new notifications
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      className="p-3 rounded-md hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 mt-1.5 rounded-full ${
                          notif.type === 'warning' ? 'bg-orange-500' :
                          notif.type === 'success' ? 'bg-green-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notif.title}</p>
                          <p className="text-xs text-muted-foreground">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Admin Button */}
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
          <Shield className="h-5 w-5" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <UserCircle className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/admin')}>
              Admin Panel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSidebarOpen(true)}
          className="flex"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
