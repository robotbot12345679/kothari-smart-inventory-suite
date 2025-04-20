
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  BarChart3,
  ShoppingCart,
  Package,
  Truck,
  Users,
  Settings,
  BarChart,
  Home,
  Tag,
  Package2,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const isMobile = useIsMobile();

  const navItems = [
    { title: "Dashboard", path: "/", icon: <Home className="w-5 h-5" /> },
    { title: "Inventory", path: "/inventory", icon: <Package className="w-5 h-5" /> },
    { title: "POS", path: "/pos", icon: <ShoppingCart className="w-5 h-5" /> },
    { title: "Orders", path: "/orders", icon: <Package2 className="w-5 h-5" /> },
    { title: "Shipping", path: "/shipping", icon: <Truck className="w-5 h-5" /> },
    { title: "Products", path: "/products", icon: <Tag className="w-5 h-5" /> },
    { title: "Customers", path: "/customers", icon: <Users className="w-5 h-5" /> },
    { title: "Analytics", path: "/analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { title: "Reports", path: "/reports", icon: <BarChart className="w-5 h-5" /> },
    { title: "Settings", path: "/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-primary">Kothari Smart</h2>
        <p className="text-sm text-muted-foreground">Inventory Suite</p>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted hover:text-foreground"
                  )
                }
                onClick={() => isMobile && setOpen(false)}
              >
                {item.icon}
                {item.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto p-4 border-t text-xs text-muted-foreground">
        <p>Kothari Dry Fruits & More</p>
        <p>© {new Date().getFullYear()}</p>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-[270px]">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "h-full fixed left-0 top-[64px] bottom-0 z-10 w-64 bg-background border-r transition-transform duration-300 ease-in-out transform",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <SidebarContent />
    </div>
  );
};

export default Sidebar;
