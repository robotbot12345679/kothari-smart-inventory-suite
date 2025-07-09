
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LucideIcon,
  Home,
  Package,
  ClipboardList,
  Users,
  ShoppingCart,
  BarChart,
  Settings,
  Truck,
  Box,
  FileText,
  X,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  path: string;
  isActive: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  path,
  isActive,
}) => {
  return (
    <li>
      <Link
        to={path}
        className={cn(
          "flex items-center px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        )}
      >
        <Icon className="mr-3 h-5 w-5" />
        <span>{label}</span>
        {label === "Bills" && (
          <span className="ml-auto bg-primary text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
            New
          </span>
        )}
        {label === "Suppliers" && (
          <span className="ml-auto bg-green-600 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
            New
          </span>
        )}
      </Link>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const location = useLocation();

  const sidebarItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Package, label: "Products", path: "/products" },
    { icon: ClipboardList, label: "Orders", path: "/orders" },
    { icon: Users, label: "Customers", path: "/customers" },
    { icon: ShoppingCart, label: "Point of Sale", path: "/pos" },
    { icon: BarChart, label: "Analytics", path: "/analytics" },
    { icon: Truck, label: "Shipping", path: "/shipping" },
    { icon: Box, label: "Inventory", path: "/inventory" },
    { icon: Building2, label: "Suppliers", path: "/suppliers" },
    { icon: FileText, label: "Bills", path: "/bills" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div
      className={cn(
        "bg-sidebar-background border-r border-sidebar-border text-sidebar-foreground transition-all duration-300 z-50",
        open ? "w-64 fixed inset-y-0 left-0" : "w-0 hidden"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center">
          <img
            src="/lovable-uploads/00972147-e824-453d-8b6d-dc558e1cb95e.png"
            alt="Logo"
            className="h-8 w-auto mr-2"
          />
          <span className="text-lg font-semibold">Kothari's</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1 rounded-full hover:bg-sidebar-accent lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-4rem)]">
        <nav className="p-3">
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                isActive={location.pathname === item.path}
              />
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
