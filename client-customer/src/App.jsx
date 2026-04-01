import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
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

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-800 rounded-full animate-spin"></div>
        <p className="font-black text-xs text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">INITIATING BHARATDROP...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard instead of login
    return <Navigate to={getRolePath(user.role)} replace />;
  }

  return children;
};

const LoggedInRedirect = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (user) {
    const targetPath = getRolePath(user.role);
    // Prevent redirect loop if we're already on the target path or 
    // if an ADMIN is trying to access a page they don't have access to here
    if (location.pathname !== targetPath && targetPath !== '/') {
      return <Navigate to={targetPath} replace />;
    }
    // If it's an ADMIN and they're at /login, don't redirect them anywhere else 
    // because they don't have a dashboard in this app
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
    </CartProvider>
  );
}

export default App;
