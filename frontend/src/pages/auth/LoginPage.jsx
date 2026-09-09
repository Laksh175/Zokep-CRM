import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layers, LogIn, Lock, Mail, ShieldAlert, ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error } = useToast();

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
      {/* Top-Left Navigation Back Button */}
      <Link
        to="/"
        className="btn btn-secondary btn-sm"
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: 600,
          boxShadow: 'var(--shadow-sm)',
          zIndex: 10,
        }}
        title="Return to ZOKEP Landing Homepage"
      >
        <ArrowLeft size={16} color="var(--primary-500)" />
        <span>Back to Website</span>
      </Link>

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

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1, marginTop: '20px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link to="/" style={{ display: 'inline-block', textDecoration: 'none', marginBottom: '16px' }} title="Go to ZOKEP Home">
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

          {/* Quick Demo Login Buttons - Only visible in local development environment */}
          {import.meta.env.DEV && (
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px', textAlign: 'center' }}>
                ⚡ Quick 1-Click Demo Login (Dev Mode Only)
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'space-between', fontSize: '12px' }}
                  onClick={() => {
                    setEmail('realestate.admin@example.com');
                    setPassword('Admin@123');
                  }}
                >
                  <span>🏢 <strong>Tenant Admin</strong></span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>realestate.admin@example.com</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'space-between', fontSize: '12px' }}
                  onClick={() => {
                    setEmail('rohit.sales@example.com');
                    setPassword('Staff@123');
                  }}
                >
                  <span>👤 <strong>Sales Staff</strong></span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>rohit.sales@example.com</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'space-between', fontSize: '12px' }}
                  onClick={() => {
                    setEmail('superadmin@zokepcrm.com');
                    setPassword('SuperAdmin@123');
                  }}
                >
                  <span>👑 <strong>Super Admin</strong></span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>superadmin@zokepcrm.com</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <p style={{ margin: 0 }}>
            Don't have an organization account yet?{' '}
            <Link to="/pricing" style={{ color: 'var(--primary-500)', fontWeight: 700 }}>
              Get a Subscription
            </Link>
          </p>
          <div>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
              <Home size={13} /> Return to ZOKEP Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
