import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Pos from './pages/Pos';
import Analytics from './pages/Analytics';
import Shipping from './pages/Shipping';
import Inventory from './pages/Inventory';
import BillsReport from './pages/BillsReport';
import SupplierManagement from './pages/SupplierManagement';
import ProductComparison from './pages/ProductComparison';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { CloudDataProvider, useCloudData } from './context/CloudDataContext';
import { Toaster } from './components/ui/toaster';

const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useCloudData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <AuthGate>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/pos" element={<Pos />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/bills" element={<BillsReport />} />
                <Route path="/suppliers" element={<SupplierManagement />} />
                <Route path="/product-comparison" element={<ProductComparison />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
    </AuthGate>
  );
};

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <CloudDataProvider>
        <Router>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
          <Toaster />
        </Router>
      </CloudDataProvider>
    </ThemeProvider>
  );
};

export default App;
