import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layers, LogIn, Lock, Mail, ShieldAlert, Sparkles, ArrowRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error } = useToast();
  const { toggleTheme, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      success(`Welcome back, ${res.user.name}!`);

      if (res.user.role === 'super_admin') {
        navigate('/superadmin');
      } else if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/staff');
      }
    } catch (err) {
      error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick filler for testing
  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-main)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
      }}
    >
      {/* Top Right Theme Toggle */}
      <div style={{ position: 'absolute', top: 20, right: 24 }}>
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-sm"
          style={{ width: 38, height: 38, padding: 0, justifyContent: 'center' }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#6366f1" />}
        </button>
      </div>
      {/* Background Glow */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link to="/" style={{ display: 'inline-block', textDecoration: 'none', marginBottom: '16px' }}>
            <img
              src="/logo.png"
              alt="ZOKEP CRM"
              style={{
                height: '52px',
                objectFit: 'contain',
              }}
            />
          </Link>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Sign in to your CRM workspace</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Multi-tenant portal for Admin, Staff & Platform Managers
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loading}
            >
              <LogIn size={18} />
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Filler for Super Admin */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
              <Sparkles size={14} color="#f59e0b" />
              <span>Platform Owner (Super Admin):</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between', fontSize: '12px', padding: '10px 14px' }}
              onClick={() => fillCredentials('superadmin@zokepcrm.com', 'SuperAdmin@123')}
            >
              <span>👑 Super Admin</span>
              <code>superadmin@zokepcrm.com</code>
            </button>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '8px 0 0', textAlign: 'center' }}>
              Create fresh Admin accounts from the Landing Page or Checkout!
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Don't have an organization account yet?{' '}
          <Link to="/#pricing" style={{ color: 'var(--primary-500)', fontWeight: 600 }}>
            Get a Subscription
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
