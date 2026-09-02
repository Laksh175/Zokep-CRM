import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Public & Auth Pages
import LandingPage from './pages/landing/LandingPage';
import CheckoutPage from './pages/landing/CheckoutPage';
import LoginPage from './pages/auth/LoginPage';
import PublicLeadFormPage from './pages/public/PublicLeadFormPage';

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import AdminManagementPage from './pages/superadmin/AdminManagementPage';
import PlanManagementPage from './pages/superadmin/PlanManagementPage';

// Tenant Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import LeadManagementPage from './pages/admin/LeadManagementPage';
import StaffManagementPage from './pages/admin/StaffManagementPage';
import CustomerListPage from './pages/admin/CustomerListPage';
import SettingsPage from './pages/admin/SettingsPage';
import SubscriptionPlanPage from './pages/admin/SubscriptionPlanPage';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffLeadsPage from './pages/staff/StaffLeadsPage';
import StaffCustomersPage from './pages/staff/StaffCustomersPage';

// Protected Layout with Sidebar
const ProtectedLayout = ({ allowedRoles, children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
        <p>Loading session...</p>
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
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
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
  );
};

export default App;
