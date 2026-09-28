
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { Toaster } from "@/components/ui/toaster";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex pt-16">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main 
          className={`flex-1 min-w-0 p-4 md:p-6 transition-all duration-300 ${
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
