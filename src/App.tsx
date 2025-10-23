
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
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
import Auth from './pages/Auth';
import { CloudDataProvider } from './context/CloudDataContext';
import { Toaster } from './components/ui/toaster';

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <CloudDataProvider>
        <Router>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
                      </Routes>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster />
          </Router>
      </CloudDataProvider>
    </ThemeProvider>
  );
};

export default App;
