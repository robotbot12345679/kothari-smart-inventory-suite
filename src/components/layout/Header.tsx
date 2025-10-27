import React from "react";
import { Button } from "@/components/ui/button";
import { UserCircle, Bell, Menu, LogOut } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
    navigate('/auth');
  };

  return (
    <header className="fixed left-0 right-0 top-0 h-16 border-b bg-background z-20 flex items-center px-4">
      <div className="flex items-center gap-2">
        <MobileNav />
        <h1 className="text-lg font-bold">Kothari's Dry Fruits</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <UserCircle className="h-6 w-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
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
