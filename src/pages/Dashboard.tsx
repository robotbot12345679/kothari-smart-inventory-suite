
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  Tag,
  Users,
  BarChart3,
  Truck,
  FileText,
  Settings,
  Package2,
  Menu,
  X
} from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { title: "POS", icon: <ShoppingCart className="w-5 h-5" />, path: "/pos" },
    { title: "Inventory", icon: <Package className="w-5 h-5" />, path: "/inventory" },
    { title: "Products", icon: <Tag className="w-5 h-5" />, path: "/products" },
    { title: "Orders", icon: <Package2 className="w-5 h-5" />, path: "/orders" },
    { title: "Shipping", icon: <Truck className="w-5 h-5" />, path: "/shipping" },
    { title: "Customers", icon: <Users className="w-5 h-5" />, path: "/customers" },
    { title: "Analytics", icon: <BarChart3 className="w-5 h-5" />, path: "/analytics" },
    { title: "Reports", icon: <FileText className="w-5 h-5" />, path: "/reports" },
    { title: "Settings", icon: <Settings className="w-5 h-5" />, path: "/settings" },
  ];

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="p-4 space-y-2">
              <h2 className="text-xl font-bold">Menu</h2>
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <Button 
                    key={item.path}
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </Button>
                ))}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item) => (
          <Card 
            key={item.path} 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(item.path)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access {item.title.toLowerCase()} management
              </p>
              <Button 
                className="mt-4 w-full" 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(item.path);
                }}
              >
                Go to {item.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
