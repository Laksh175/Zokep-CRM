import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, Crown, ShieldAlert, Sparkles, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = ({ title, subtitle, actions }) => {
  const { user, subscription, isAdmin, toggleSidebar, sidebarOpen } = useAuth();

  return (
    <header className="page-header">
      <div className="header-left">
        <button
          className="mobile-sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar Navigation"
          title="Toggle Navigation Menu"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div>
          <h1 className="header-title">{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>

        {/* Public Form Quick Link for Admin */}
        {isAdmin && user?.tenantId && (
          <Link
            to={`/f/${user.tenantId}`}
            target="_blank"
            className="btn btn-secondary btn-sm"
            title="Open Public Shareable Lead Capture Form"
          >
            <ExternalLink size={14} />
            Public Lead Form
          </Link>
        )}

        {/* Subscription Indicator */}
        {isAdmin && subscription?.isExpired && (
          <Link
            to="/admin/billing"
            className="btn btn-sm btn-danger"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldAlert size={14} />
            Renew Subscription
          </Link>
        )}

        {/* Custom Actions */}
        {actions}
      </div>
    </header>
  );
};

export default Header;
