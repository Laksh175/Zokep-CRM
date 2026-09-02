import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, Crown, ShieldAlert, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = ({ title, subtitle, actions }) => {
  const { user, subscription, isAdmin } = useAuth();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        padding: '18px 32px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 1px 3px 0 rgba(0, 34, 68, 0.04)',
      }}
    >
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>

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
