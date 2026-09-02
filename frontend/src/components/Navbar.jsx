import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, LogIn, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'super_admin') return '/superadmin';
    if (user.role === 'admin') return '/admin';
    return '/staff';
  };

  return (
    <nav className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '16px 0' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img
            src="/logo.png"
            alt="ZOKEP CRM"
            style={{
              height: '38px',
              objectFit: 'contain',
            }}
          />
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <a href="/#features" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Features
          </a>
          <a href="/#industries" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Industries
          </a>
          <a href="/#pricing" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Pricing
          </a>
          <a href="/#faq" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            FAQ
          </a>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{ width: 40, height: 40, padding: 0, justifyContent: 'center' }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#6366f1" />}
          </button>

          {isAuthenticated ? (
            <button
              onClick={() => navigate(getDashboardPath())}
              className="btn btn-primary"
            >
              <LayoutDashboard size={16} />
              Open Dashboard
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                <LogIn size={16} />
                Sign In
              </Link>
              <a href="/#pricing" className="btn btn-primary">
                Get Started Free
                <ArrowRight size={16} />
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
