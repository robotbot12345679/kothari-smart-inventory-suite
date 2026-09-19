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
import Organization from './pages/Organization';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OAuthConsent from './pages/OAuthConsent';

import { CloudDataProvider, useCloudData } from './context/CloudDataContext';
import { PermissionsProvider, usePermissions } from './context/PermissionsContext';
import ForcePasswordChange from './components/auth/ForcePasswordChange';
import RequirePermission from './components/auth/RequirePermission';
import { ROUTE_PERMISSIONS } from './lib/permissions';
import { Toaster } from './components/ui/toaster';

const Guard = ({ path, children }: { path: string; children: React.ReactNode }) => (
  <RequirePermission permission={ROUTE_PERMISSIONS[path] ?? null}>{children}</RequirePermission>
);

const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useCloudData();
  const { profile, loading: permsLoading } = usePermissions();

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

  if (!permsLoading && profile?.must_change_password) {
    return <ForcePasswordChange />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <AuthGate>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/admin"
          element={
            <Guard path="/admin">
              <Admin />
            </Guard>
          }
        />
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/dashboard" element={<Guard path="/dashboard"><Dashboard /></Guard>} />
                <Route path="/products" element={<Guard path="/products"><Products /></Guard>} />
                <Route path="/orders" element={<Guard path="/orders"><Orders /></Guard>} />
                <Route path="/customers" element={<Guard path="/customers"><Customers /></Guard>} />
                <Route path="/reports" element={<Guard path="/reports"><Reports /></Guard>} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/pos" element={<Guard path="/pos"><Pos /></Guard>} />
                <Route path="/analytics" element={<Guard path="/analytics"><Analytics /></Guard>} />
                <Route path="/shipping" element={<Guard path="/shipping"><Shipping /></Guard>} />
                <Route path="/inventory" element={<Guard path="/inventory"><Inventory /></Guard>} />
                <Route path="/bills" element={<Guard path="/bills"><BillsReport /></Guard>} />
                <Route path="/suppliers" element={<Guard path="/suppliers"><SupplierManagement /></Guard>} />
                <Route
                  path="/product-comparison"
                  element={<Guard path="/product-comparison"><ProductComparison /></Guard>}
                />
                <Route path="/organization" element={<Guard path="/organization"><Organization /></Guard>} />
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
        <PermissionsProvider>
          <Router>
            <Routes>
              <Route path="/signup" element={<Signup />} />
              <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
              <Route path="/*" element={<AppRoutes />} />
            </Routes>
            <Toaster />
          </Router>
        </PermissionsProvider>
      </CloudDataProvider>
    </ThemeProvider>
  );
};

export default App;
