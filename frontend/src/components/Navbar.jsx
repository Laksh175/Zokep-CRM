import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  LogIn,
  LayoutDashboard,
  ChevronDown,
  Building2,
  Factory,
  Briefcase,
  GraduationCap,
  Car,
  Sparkles,
  Layers,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileIndustriesOpen, setMobileIndustriesOpen] = useState(false);
  const timeoutRef = useRef(null);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getNavLinkStyle = (path) => {
    const active = isActive(path);
    return {
      fontSize: '14px',
      fontWeight: active ? 700 : 600,
      color: active ? '#003865' : 'var(--text-secondary)',
      background: active ? 'rgba(0, 56, 101, 0.08)' : 'transparent',
      padding: '7px 16px',
      borderRadius: '10px',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    };
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'super_admin') return '/superadmin';
    if (user.role === 'admin') return '/admin';
    return '/staff';
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIndustriesOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIndustriesOpen(false);
    }, 180);
  };

  const handleItemClick = (slug) => {
    setIndustriesOpen(false);
    setMobileMenuOpen(false);
    navigate(`/industries/${slug}`);
  };

  const industryMenuItems = [
    {
      id: 'real-estate',
      title: 'Real Estate & Builders',
      desc: 'Site visits, token booking & property types',
      icon: Building2,
      color: '#003865',
      bg: 'rgba(0, 56, 101, 0.08)',
    },
    {
      id: 'manufacturing',
      title: 'Manufacturing & B2B',
      desc: 'RFQs, sample approvals & bulk quantities',
      icon: Factory,
      color: '#00a651',
      bg: 'rgba(0, 166, 81, 0.08)',
    },
    {
      id: 'agencies',
      title: 'Agencies & IT Services',
      desc: 'Retainers, ad spend & project scope',
      icon: Briefcase,
      color: '#003865',
      bg: 'rgba(0, 56, 101, 0.08)',
    },
    {
      id: 'education',
      title: 'Education & Institutes',
      desc: 'Student counseling, demo calls & enrollments',
      icon: GraduationCap,
      color: '#00a651',
      bg: 'rgba(0, 166, 81, 0.08)',
    },
    {
      id: 'automobile',
      title: 'Automobile Dealerships',
      desc: 'Test drives, car exchange & vehicle booking',
      icon: Car,
      color: '#003865',
      bg: 'rgba(0, 56, 101, 0.08)',
    },
  ];

  const industriesActive = isActive('/industries');

  return (
    <>
      <nav className="glass-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, width: '100%', zIndex: 9999, padding: '12px 0' }}>
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0 clamp(16px, 3vw, 24px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
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

        {/* Desktop Navigation Links */}
        <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/features" style={getNavLinkStyle('/features')}>
            Features
            {isActive('/features') && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '18px',
                  height: '3px',
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, #003865 0%, #00a651 100%)',
                }}
              />
            )}
          </Link>

          {/* Industries Submenu Dropdown on Hover */}
          <div
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: (industriesOpen || industriesActive) ? 700 : 600,
                color: (industriesOpen || industriesActive) ? '#003865' : 'var(--text-secondary)',
                background: (industriesOpen || industriesActive) ? 'rgba(0, 56, 101, 0.08)' : 'transparent',
                padding: '7px 16px',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                position: 'relative',
              }}
            >
              <span>Industries</span>
              <ChevronDown
                size={14}
                style={{
                  transform: industriesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  color: (industriesOpen || industriesActive) ? '#003865' : 'var(--text-muted)',
                }}
              />
              {industriesActive && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '18px',
                    height: '3px',
                    borderRadius: '999px',
                    background: 'linear-gradient(90deg, #003865 0%, #00a651 100%)',
                  }}
                />
              )}
            </div>

            {/* Submenu Dropdown Card */}
            {industriesOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '-60px',
                  width: '380px',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 18px 40px -8px rgba(0, 34, 68, 0.16), 0 4px 12px rgba(0, 34, 68, 0.08)',
                  border: '1px solid var(--border-medium)',
                  padding: '12px',
                  zIndex: 200,
                  animation: 'fadeInMenu 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Select Your Industry
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {industryMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isCurrentSubItem = location.pathname === `/industries/${item.id}`;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          backgroundColor: isCurrentSubItem ? 'rgba(0, 166, 81, 0.08)' : 'transparent',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrentSubItem) e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrentSubItem) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            backgroundColor: item.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={18} color={item.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: isCurrentSubItem ? 700 : 600, color: isCurrentSubItem ? '#003865' : 'var(--text-primary)' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Submenu Footer */}
                <div
                  style={{
                    marginTop: '8px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingLeft: '12px',
                    paddingRight: '12px',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-500)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Sparkles size={13} color="var(--accent-green)" />
                    Tailored Multi-Tenant Workflows
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pre-Configured</span>
                </div>
              </div>
            )}
          </div>

          <Link to="/pricing" style={getNavLinkStyle('/pricing')}>
            Pricing
            {isActive('/pricing') && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '18px',
                  height: '3px',
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, #003865 0%, #00a651 100%)',
                }}
              />
            )}
          </Link>
          <Link to="/faq" style={getNavLinkStyle('/faq')}>
            FAQ
            {isActive('/faq') && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '18px',
                  height: '3px',
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, #003865 0%, #00a651 100%)',
                }}
              />
            )}
          </Link>
        </div>

        {/* Desktop CTA Buttons */}
        <div className="nav-desktop-cta">
          {isAuthenticated ? (
            <button onClick={() => navigate(getDashboardPath())} className="btn btn-primary">
              <LayoutDashboard size={16} />
              Open Dashboard
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                <LogIn size={16} />
                Sign In
              </Link>
              <Link to="/pricing" className="btn btn-primary">
                Get Started Free
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} color="#003865" /> : <Menu size={22} color="#003865" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '16px 24px 24px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--border-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            animation: 'fadeInMenu 0.2s ease',
          }}
        >
          <Link
            to="/features"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '15px',
              fontWeight: isActive('/features') ? 700 : 600,
              color: isActive('/features') ? '#003865' : 'var(--text-primary)',
              background: isActive('/features') ? 'rgba(0, 56, 101, 0.08)' : 'transparent',
              padding: '8px 12px',
              borderRadius: '8px',
              borderLeft: isActive('/features') ? '3px solid #00a651' : '3px solid transparent',
              textDecoration: 'none',
            }}
          >
            Features
          </Link>

          <div>
            <div
              onClick={() => setMobileIndustriesOpen(!mobileIndustriesOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '15px',
                fontWeight: industriesActive ? 700 : 600,
                color: industriesActive ? '#003865' : 'var(--text-primary)',
                background: industriesActive ? 'rgba(0, 56, 101, 0.08)' : 'transparent',
                padding: '8px 12px',
                borderRadius: '8px',
                borderLeft: industriesActive ? '3px solid #00a651' : '3px solid transparent',
                cursor: 'pointer',
              }}
            >
              <span>Industries</span>
              <ChevronDown
                size={16}
                style={{
                  transform: mobileIndustriesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </div>

            {mobileIndustriesOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingLeft: '12px' }}>
                {industryMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isCurrentSubItem = location.pathname === `/industries/${item.id}`;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: isCurrentSubItem ? 'rgba(0, 166, 81, 0.12)' : 'var(--bg-surface-elevated)',
                        cursor: 'pointer',
                      }}
                    >
                      <Icon size={16} color={item.color} />
                      <span style={{ fontSize: '13px', fontWeight: isCurrentSubItem ? 700 : 600, color: isCurrentSubItem ? '#003865' : 'var(--text-primary)' }}>
                        {item.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '15px',
              fontWeight: isActive('/pricing') ? 700 : 600,
              color: isActive('/pricing') ? '#003865' : 'var(--text-primary)',
              background: isActive('/pricing') ? 'rgba(0, 56, 101, 0.08)' : 'transparent',
              padding: '8px 12px',
              borderRadius: '8px',
              borderLeft: isActive('/pricing') ? '3px solid #00a651' : '3px solid transparent',
              textDecoration: 'none',
            }}
          >
            Pricing
          </Link>
          <Link
            to="/faq"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '15px',
              fontWeight: isActive('/faq') ? 700 : 600,
              color: isActive('/faq') ? '#003865' : 'var(--text-primary)',
              background: isActive('/faq') ? 'rgba(0, 56, 101, 0.08)' : 'transparent',
              padding: '8px 12px',
              borderRadius: '8px',
              borderLeft: isActive('/faq') ? '3px solid #00a651' : '3px solid transparent',
              textDecoration: 'none',
            }}
          >
            FAQ
          </Link>

          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(getDashboardPath());
                }}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <LayoutDashboard size={16} />
                Open Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <LogIn size={16} />
                  Sign In
                </Link>
                <Link
                  to="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Get Started Free
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
    <div style={{ height: '68px', width: '100%', flexShrink: 0 }} />
  </>
  );
};

export default Navbar;

