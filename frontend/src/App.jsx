import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ScrollToTopButton from './components/ScrollToTopButton';

// ScrollToTop Component: Resets scroll to top whenever user changes page
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.scrollTop = 0;
      }
    }
  }, [pathname, hash]);

  return null;
};

// Page Loading Fallback Spinner
const PageFallback = () => (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      color: '#94a3b8',
    }}
  >
    <div
      style={{
        width: '36px',
        height: '36px',
        border: '3px solid rgba(34, 197, 94, 0.2)',
        borderTopColor: '#22c55e',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Loading Zokep CRM...</span>
  </div>
);

// Public Marketing Pages (Eagerly loaded for instant 0ms LCP paint)
import LandingPage from './pages/landing/LandingPage';
import FeaturesPage from './pages/landing/FeaturesPage';
import IndustriesPage from './pages/landing/IndustriesPage';
import PricingPage from './pages/landing/PricingPage';
import FAQPage from './pages/landing/FAQPage';

// Lazy Loaded Auth & Special Public Pages
const CheckoutPage = lazy(() => import('./pages/landing/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const PublicLeadFormPage = lazy(() => import('./pages/public/PublicLeadFormPage'));

// Lazy Loaded Super Admin Pages
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'));
const AdminManagementPage = lazy(() => import('./pages/superadmin/AdminManagementPage'));
const PlanManagementPage = lazy(() => import('./pages/superadmin/PlanManagementPage'));

// Lazy Loaded Tenant Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const LeadManagementPage = lazy(() => import('./pages/admin/LeadManagementPage'));
const StaffManagementPage = lazy(() => import('./pages/admin/StaffManagementPage'));
const CustomerListPage = lazy(() => import('./pages/admin/CustomerListPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const SubscriptionPlanPage = lazy(() => import('./pages/admin/SubscriptionPlanPage'));

// Lazy Loaded Staff Pages
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));
const StaffLeadsPage = lazy(() => import('./pages/staff/StaffLeadsPage'));
const StaffCustomersPage = lazy(() => import('./pages/staff/StaffCustomersPage'));

// Protected Layout with Sidebar
const ProtectedLayout = ({ allowedRoles, children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-primary)', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(0, 56, 101, 0.15)', borderTopColor: '#00a651', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Opening ZOKEP CRM Workspace...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'super_admin') return <Navigate to="/superadmin" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/staff" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
};

export const App = () => {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/industries/:slug" element={<IndustriesPage />} />
          <Route path="/industries" element={<Navigate to="/industries/real-estate" replace />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/f/:tenantId" element={<PublicLeadFormPage />} />

          {/* Super Admin Protected Routes */}
          <Route
            path="/superadmin"
            element={
              <ProtectedLayout allowedRoles={['super_admin']}>
                <SuperAdminDashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/superadmin/admins"
            element={
              <ProtectedLayout allowedRoles={['super_admin']}>
                <AdminManagementPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/superadmin/plans"
            element={
              <ProtectedLayout allowedRoles={['super_admin']}>
                <PlanManagementPage />
              </ProtectedLayout>
            }
          />

          {/* Tenant Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedLayout allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/admin/leads"
            element={
              <ProtectedLayout allowedRoles={['admin']}>
                <LeadManagementPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedLayout allowedRoles={['admin']}>
                <StaffManagementPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedLayout allowedRoles={['admin']}>
                <CustomerListPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedLayout allowedRoles={['admin']}>
                <SettingsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/admin/billing"
            element={
              <ProtectedLayout allowedRoles={['admin']}>
                <SubscriptionPlanPage />
              </ProtectedLayout>
            }
          />

          {/* Staff Consultant Protected Routes */}
          <Route
            path="/staff"
            element={
              <ProtectedLayout allowedRoles={['staff']}>
                <StaffDashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/staff/leads"
            element={
              <ProtectedLayout allowedRoles={['staff']}>
                <StaffLeadsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/staff/customers"
            element={
              <ProtectedLayout allowedRoles={['staff']}>
                <StaffCustomersPage />
              </ProtectedLayout>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <ScrollToTopButton />
    </>
  );
};

export default App;
