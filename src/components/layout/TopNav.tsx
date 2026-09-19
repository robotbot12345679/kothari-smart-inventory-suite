import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, Sun, Moon, Search, Settings, Users, Package, BarChart3, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCloudData } from "@/context/CloudDataContext";
import { usePermissions } from "@/context/PermissionsContext";

interface TopNavProps {
  onMenuToggle: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ onMenuToggle }) => {
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const { products, orders, customers } = useCloudData();
  const { can, profile } = usePermissions();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const notifications = useMemo(() => {
    const items: { id: string; type: string; title: string; message: string; time: string; path: string }[] = [];

    const lowStock = products.filter((p) => Number(p.stock) <= Number(p.min_stock || 5));
    if (lowStock.length > 0) {
      items.push({
        id: "low-stock",
        type: "warning",
        title: "Low Stock Alert",
        message: `${lowStock.length} product(s) running low on stock`,
        time: "Now",
        path: "/inventory",
      });
    }

    const pendingOrders = orders.filter((o) => o.order_status === "Pending");
    if (pendingOrders.length > 0) {
      items.push({
        id: "pending-orders",
        type: "info",
        title: "Pending Orders",
        message: `${pendingOrders.length} order(s) awaiting fulfilment`,
        time: "Now",
        path: "/orders",
      });
    }

    const today = new Date().toDateString();
    const newCustomers = customers.filter((c) => new Date(c.created_at).toDateString() === today);
    if (newCustomers.length > 0) {
      items.push({
        id: "new-customers",
        type: "success",
        title: "New Customers",
        message: `${newCustomers.length} new customer(s) today`,
        time: "Today",
        path: "/customers",
      });
    }

    return items;
  }, [products, orders, customers]);

  const results = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return { products: [], customers: [], orders: [] };

    return {
      products: products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.sku?.toLowerCase().includes(query) ||
            p.barcode?.toLowerCase().includes(query)
        )
        .slice(0, 5),
      customers: customers
        .filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.phone?.toLowerCase().includes(query) ||
            c.email?.toLowerCase().includes(query)
        )
        .slice(0, 5),
      orders: orders
        .filter((o) => o.id.toLowerCase().includes(query) || o.customer_name?.toLowerCase().includes(query))
        .slice(0, 5),
    };
  }, [searchQuery, products, customers, orders]);

  const hasResults =
    results.products.length > 0 || results.customers.length > 0 || results.orders.length > 0;

  const go = (path: string) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Button variant="ghost" size="icon" className="mr-2" onClick={onMenuToggle}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <div className="flex-1 flex items-center justify-end gap-4">
          <Popover open={searchOpen && searchQuery.trim().length > 0} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative hidden md:flex w-full max-w-sm items-center">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products, customers, orders..."
                  className="w-full bg-background pl-8 pr-8 md:w-[300px] lg:w-[400px]"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-7 w-7"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-[360px] p-0"
              align="end"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <ScrollArea className="max-h-80">
                {!hasResults ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
                ) : (
                  <div className="p-2">
                    {results.products.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">Products</p>
                        {results.products.map((p) => (
                          <Button
                            key={p.id}
                            variant="ghost"
                            className="w-full justify-start h-auto py-2"
                            onClick={() => go("/products")}
                          >
                            <div className="text-left">
                              <p className="font-medium text-sm">{p.name}</p>
                              <p className="text-xs text-muted-foreground">
                                ₹{p.price} • Stock: {p.stock}
                              </p>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}

                    {results.customers.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">Customers</p>
                        {results.customers.map((c) => (
                          <Button
                            key={c.id}
                            variant="ghost"
                            className="w-full justify-start h-auto py-2"
                            onClick={() => go("/customers")}
                          >
                            <div className="text-left">
                              <p className="font-medium text-sm">{c.name}</p>
                              <p className="text-xs text-muted-foreground">{c.phone || c.email || "No contact"}</p>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}

                    {results.orders.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">Orders</p>
                        {results.orders.map((o) => (
                          <Button
                            key={o.id}
                            variant="ghost"
                            className="w-full justify-start h-auto py-2"
                            onClick={() => go("/orders")}
                          >
                            <div className="text-left">
                              <p className="font-medium text-sm">{o.customer_name || "Guest"}</p>
                              <p className="text-xs text-muted-foreground">
                                ₹{o.total} • {o.order_status}
                              </p>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                  >
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-3 border-b font-semibold text-sm">Notifications</div>
              <ScrollArea className="max-h-80">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">You're all caught up</div>
                ) : (
                  <div className="p-2">
                    {notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => navigate(notif.path)}
                        className="w-full text-left p-3 rounded-md hover:bg-muted/60 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={`w-2 h-2 mt-1.5 rounded-full ${
                              notif.type === "warning"
                                ? "bg-orange-500"
                                : notif.type === "success"
                                ? "bg-green-500"
                                : "bg-blue-500"
                            }`}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{notif.title}</p>
                            <p className="text-xs text-muted-foreground">{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-sm font-normal">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">AD</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{profile?.display_name ?? "My account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {can("products.view") && (
                <DropdownMenuItem onClick={() => navigate('/products')}>
                  <Package className="mr-2 h-4 w-4" />
                  Manage Products
                </DropdownMenuItem>
              )}
              {can("customers.view") && (
                <DropdownMenuItem onClick={() => navigate('/customers')}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Customers
                </DropdownMenuItem>
              )}
              {can("analytics.view") && (
                <DropdownMenuItem onClick={() => navigate('/analytics')}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {can("admin.access") && (
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Page
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
