import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, Crown, ShieldAlert, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = ({ title, subtitle, actions }) => {
  const { user, subscription, isAdmin } = useAuth();

  return (
    <header
      style={{
        padding: '20px 32px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{title}</h1>
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
