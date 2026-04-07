import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import FullPageLoader from './components/common/FullPageLoader';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

// Auth Pages
import Login from './pages/auth/Login';
import VerifyOtp from './pages/auth/VerifyOtp';

// Customer Pages
import Home from './pages/customer/Home';
import ShopDetails from './pages/customer/ShopDetails';
import Cart from './pages/customer/Cart';
import Tracking from './pages/customer/Tracking';
import Profile from './pages/customer/Profile';
import AllProducts from './pages/customer/AllProducts';
import Orders from './pages/customer/Orders';
import SearchResults from './pages/customer/SearchResults';

// Vendor Pages
import VendorDashboard from './pages/vendor/Dashboard';

// Delivery Pages
import DeliveryDashboard from './pages/delivery/Dashboard';

// Admin Pages - Removed from Customer App

const getRolePath = (role) => {
  switch (role) {
    case ROLES.CUSTOMER: return '/home';
    case ROLES.VENDOR: return '/merchant';
    case ROLES.DELIVERY: return '/partner';
    case ROLES.ADMIN: return '/login'; // Admin has no dashboard in this app
    default: return '/';
  }
};

// Helper: synchronously get user from localStorage as fallback
const getUserSync = () => {
  try {
    const saved = localStorage.getItem('vdp_user');
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user: contextUser, loading } = useAuth();

  // Use context user if available; otherwise fall back to localStorage
  // This eliminates the React state race condition after login
  const user = contextUser || getUserSync();

  // Only show loader if truly loading AND localStorage has nothing
  if (loading && !user) return <FullPageLoader />;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRolePath(user.role)} replace />;
  }

  return children;
};

const LoggedInRedirect = ({ children }) => {
  const { user: contextUser, loading } = useAuth();
  const location = useLocation();

  const user = contextUser || getUserSync();

  if (loading && !user) return <FullPageLoader />;

  if (user) {
    const targetPath = getRolePath(user.role);
    if (location.pathname !== targetPath && targetPath !== '/') {
      return <Navigate to={targetPath} replace />;
    }
    if (user.role === ROLES.ADMIN) return children;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <LoggedInRedirect>
          <Login />
        </LoggedInRedirect>
      } />
      <Route path="/verify" element={
        <LoggedInRedirect>
          <VerifyOtp />
        </LoggedInRedirect>
      } />

      {/* Customer Routes (General Layout) */}
      <Route path="/home" element={
        <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Home />} />
        <Route path="shop/:id" element={<ShopDetails />} />
        <Route path="shop/:id/products" element={<AllProducts />} />
        <Route path="cart" element={<Cart />} />
        <Route path="profile" element={<Profile />} />
        <Route path="search" element={<SearchResults />} />
      </Route>

      {/* Customer Orders Routes */}
      <Route path="/ordershistory" element={
        <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Orders />} />
        <Route path="track/:id" element={<Tracking />} />
      </Route>

      {/* Vendor Routes */}
      <Route path="/merchant" element={
        <ProtectedRoute allowedRoles={[ROLES.VENDOR]}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<VendorDashboard />} />
      </Route>

      {/* Delivery Routes */}
      <Route path="/partner" element={
        <ProtectedRoute allowedRoles={[ROLES.DELIVERY]}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DeliveryDashboard />} />
      </Route>

      <Route path="/profile" element={<Navigate to="/home/profile" replace />} />
      <Route path="/home/orders" element={<Navigate to="/ordershistory" replace />} />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <CartProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'premium-toast',
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
    </CartProvider>
  );
}

export default App;
