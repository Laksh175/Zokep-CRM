import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Layers,
  LayoutDashboard,
  Users,
  UserCheck,
  FolderKanban,
  Settings,
  CreditCard,
  Building2,
  LogOut,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Sidebar = () => {
  const { user, subscription, logout, isSuperAdmin, isAdmin, isStaff } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="/logo.png"
          alt="ZOKEP CRM"
          style={{
            maxHeight: '46px',
            maxWidth: '190px',
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
            margin: '0 auto',
          }}
        />
      </div>

      {/* Subscription Banner for Admin */}
      {isAdmin && subscription && (
        <div
          style={{
            margin: '14px 16px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: subscription.isExpired ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${subscription.isExpired ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.25)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {subscription.isExpired ? (
            <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
          ) : (
            <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
          )}
          <div style={{ fontSize: '12px', minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 600, color: subscription.isExpired ? '#f87171' : '#34d399' }}>
              {subscription.plan?.name || 'Pro Plan'}
            </p>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {subscription.isExpired ? 'Subscription Expired' : 'Active Plan'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* SUPER ADMIN LINKS */}
        {isSuperAdmin && (
          <>
            <NavLink
              to="/superadmin"
              end
              className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', borderRadius: '8px', textAlign: 'left' }}
            >
              <LayoutDashboard size={18} />
              Platform Analytics
            </NavLink>
            <NavLink
              to="/superadmin/admins"
              className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', borderRadius: '8px', textAlign: 'left' }}
            >
              <Building2 size={18} />
              Tenant Admins
            </NavLink>
            <NavLink
              to="/superadmin/plans"
              className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', borderRadius: '8px', textAlign: 'left' }}
            >
              <CreditCard size={18} />
              Subscription Plans
            </NavLink>
          </>
        )}

        {/* TENANT ADMIN LINKS */}
        {isAdmin && (
          <>
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', borderRadius: '8px', textAlign: 'left' }}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/leads"
              className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', borderRadius: '8px', textAlign: 'left' }}
            >
              <FolderKanban size={18} />
              Leads & Pipeline
            </NavLink>
            <NavLink
              to="/admin/staff"
              className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', borderRadius: '8px', textAlign: 'left' }}
            >
              <Users size={18} />
              Staff & Consultants
            </NavLink>
            <NavLink
              to="/admin/customers"
              className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', borderRadius: '8px', textAlign: 'left' }}
            >
              <UserCheck size={18} />
              Converted Customers
            </NavLink>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', borderRadius: '8px', textAlign: 'left' }}
            >
              <Settings size={18} />
              CRM Settings
            </NavLink>
            <NavLink
              to="/admin/billing"
              className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', borderRadius: '8px', textAlign: 'left' }}
            >
              <CreditCard size={18} />
              Subscription & Billing
            </NavLink>
          </>
        )}

        {/* STAFF LINKS */}
        {isStaff && (
          <>
            <NavLink
              to="/staff"
              end
              className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', borderRadius: '8px', textAlign: 'left' }}
            >
              <LayoutDashboard size={18} />
              My Workspace
            </NavLink>
            <NavLink
              to="/staff/leads"
              className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', borderRadius: '8px', textAlign: 'left' }}
            >
              <FolderKanban size={18} />
              My Assigned Leads
            </NavLink>
            <NavLink
              to="/staff/customers"
              className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', borderRadius: '8px', textAlign: 'left' }}
            >
              <UserCheck size={18} />
              My Converted Deals
            </NavLink>
          </>
        )}
      </nav>

      {/* User Footer Profile */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: 'var(--primary-600)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              flexShrink: 0,
            }}
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </p>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
              {user?.email}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={toggleTheme}
            className="btn-icon btn-secondary"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{ width: 32, height: 32, flexShrink: 0 }}
          >
            {isDark ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#6366f1" />}
          </button>
          <button
            onClick={handleLogout}
            className="btn-icon btn-secondary"
            title="Sign Out"
            style={{ width: 32, height: 32, flexShrink: 0 }}
          >
            <LogOut size={15} color="#f43f5e" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
