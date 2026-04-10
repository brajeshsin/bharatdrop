import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, ROLES } from './context/AuthContext';
import AdminLayout from './components/layout/AdminLayout';
import FullPageLoader from './components/common/FullPageLoader';

// Admin Auth Page
import AdminLogin from './pages/auth/AdminLogin';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import OrderDetail from './pages/admin/OrderDetail';
import AdminVendors from './pages/admin/Vendors';
import AdminCustomers from './pages/admin/Customers';
import AdminPartners from './pages/admin/DeliveryPartners';
import PartnerDetails from './pages/admin/PartnerDetails';
import AdminZones from './pages/admin/Zones';
import AdminPayments from './pages/admin/Payments';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import PaymentManagement from './pages/admin/PaymentManagement';
import VendorDetail from './pages/admin/VendorDetail';
import AddVendor from './pages/admin/AddVendor';
import PendingApprovals from './pages/admin/PendingApprovals';
import ProductManagement from './pages/merchant/Products';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader message="SECURE ACCESS..." />;

  if (!user || user.role !== ROLES.ADMIN) return <Navigate to="/login" replace />;

  return children;
};

const LoggedInRedirect = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (user && user.role === ROLES.ADMIN) return <Navigate to="/admin" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Admin Login */}
      <Route path="/login" element={
        <LoggedInRedirect>
          <AdminLogin />
        </LoggedInRedirect>
      } />

      {/* Admin Routes (SaaS Layout) */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="vendors" element={<AdminVendors />} />
        <Route path="vendors/new" element={<AddVendor />} />
        <Route path="vendors/:id" element={<VendorDetail />} />
        <Route path="pending-approvals" element={<PendingApprovals />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="partners" element={<AdminPartners />} />
        <Route path="partners/:id" element={<PartnerDetails />} />
        <Route path="zones" element={<AdminZones />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="payment-methods" element={<PaymentManagement />} />
        <Route path="vendors/:id/inventory" element={
          <div className="p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <ProductManagement />
          </div>
        } />
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '11px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '12px 20px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <AppRoutes />
    </>
  );
}

export default App;
