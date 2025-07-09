
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { Toaster } from "@/components/ui/toaster";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex overflow-hidden pt-16">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main 
          className={`flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-0' : ''
          }`}
        >
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default MainLayout;
