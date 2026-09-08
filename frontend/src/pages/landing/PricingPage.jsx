import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Check,
  CreditCard,
  Coins,
  Sparkles,
  Zap,
  ShieldCheck,
  MessageSquare,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

const DEFAULT_PLANS = [
  {
    _id: 'default_pro',
    name: 'Pro Monthly Plan',
    billingCycle: 'monthly',
    price: 1999,
    durationMonths: 1,
    currency: 'INR',
    description: 'Complete unrestricted access to all CRM features.',
    features: [
      'Unlimited Leads & Deals Pipeline',
      'Unlimited Staff & Sales Consultants',
      'Custom Lead Statuses & HEX Colors',
      'Dynamic Form Custom Fields Builder',
      '1-Click WhatsApp Direct Launcher',
      '1-Click Nodemailer Email Dispatcher',
      'Public Shareable Lead Capture Form Link',
      'HTML Website Iframe Embeds',
      'Bulk CSV Import & CSV Export',
      'Sales Pipeline & Staff Leaderboard Analytics',
    ],
    isPopular: true,
  },
];

export const PricingPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/superadmin/plans');
      if (res.success && res.data.length > 0) {
        setPlans(res.data);
      }
    } catch (err) {
      console.warn('Failed to load plans:', err.message);
    }
  };

  const filteredPlans = plans.filter((p) => p.billingCycle === billingCycle);
  const displayPlans = filteredPlans.length > 0 ? filteredPlans : plans;

  // Real-world, authentic value propositions
  const valueHighlights = [
    {
      icon: <Coins size={22} color="#10b981" />,
      title: 'Truly Affordable (Zero Per-Seat Costs)',
      description:
        'Most legacy CRMs charge ₹1,500 to ₹3,000 for every single salesperson you add. Zokep CRM gives you unlimited staff members under one transparent flat rate, saving your team thousands every month as you hire.',
      tag: 'Cost Effective',
      tagColor: '#10b981',
    },
    {
      icon: <Sparkles size={22} color="#6366f1" />,
      title: 'High Value (All Core Features Included)',
      description:
        'No locked modules or surprise paywalls. Dynamic form builder, custom pipeline stages, bulk CSV tools, website embeds, and sales leaderboards are all unlocked from day one without expensive plan upgrades.',
      tag: 'Maximum Value',
      tagColor: '#6366f1',
    },
    {
      icon: <Zap size={22} color="#f59e0b" />,
      title: 'Instant 2-Minute Automated Setup',
      description:
        'No waiting for sales callbacks or complex manual installations. The moment payment is verified via Razorpay, your admin credentials and dedicated CRM workspace link are emailed to you automatically.',
      tag: 'Zero Wait Time',
      tagColor: '#f59e0b',
    },
    {
      icon: <MessageSquare size={22} color="#10b981" />,
      title: 'Direct WhatsApp Outreach (Zero API Fees)',
      description:
        'Sales consultants can initiate chats with prospects in 1-click through native WhatsApp Web and Desktop. No monthly Meta conversation charges, no third-party API approval headaches, and no setup delays.',
      tag: 'Built for India',
      tagColor: '#10b981',
    },
    {
      icon: <ShieldCheck size={22} color="#003865" />,
      title: '100% Isolated & Private Lead Data',
      description:
        'Your client database, confidential deal sizes, and consultant notes are securely isolated within your own dedicated tenant scope. No other business or competitor ever has access to your leads.',
      tag: 'Enterprise Privacy',
      tagColor: '#003865',
    },
    {
      icon: <FileSpreadsheet size={22} color="#06b6d4" />,
      title: 'Zero Vendor Lock-in & 1-Click CSV Portability',
      description:
        'Easily import your existing leads from Excel or Google Sheets in minutes using our guided CSV mapper. You can also export your entire lead database anytime with complete freedom and transparency.',
      tag: 'Full Ownership',
      tagColor: '#06b6d4',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Dynamic Pricing Section Matching Homepage */}
      <section style={{ padding: 'clamp(40px, 6vw, 75px) clamp(16px, 4vw, 24px) 50px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#34d399',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '12px',
            }}
          >
            TRANSPARENT SUBSCRIPTION TIERS
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Choose the Perfect Plan for <span className="gradient-text">Your Business</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(14px, 3.5vw, 16px)', maxWidth: '600px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Instant automated provisioning. Razorpay secure checkout. Credentials dispatched directly to your inbox on purchase.
          </p>

          {/* Monthly / Yearly Switch */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--bg-surface-elevated)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-medium)', maxWidth: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: billingCycle === 'monthly' ? 'var(--primary-600)' : 'transparent',
                color: billingCycle === 'monthly' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: billingCycle === 'yearly' ? 'var(--primary-600)' : 'transparent',
                color: billingCycle === 'yearly' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Annual Billing
              <span style={{ fontSize: '10.5px', background: '#10b981', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid / Image 1 Wide Card Layout for Single Plan */}
        {displayPlans.length === 1 ? (
          <div style={{ maxWidth: '940px', margin: '0 auto' }}>
            {displayPlans.map((plan) => (
              <div
                key={plan._id}
                className="glass-panel"
                style={{
                  padding: plan.isPopular
                    ? 'clamp(44px, 5vw, 52px) clamp(18px, 4vw, 48px) clamp(24px, 4vw, 42px)'
                    : 'clamp(28px, 4vw, 42px) clamp(18px, 4vw, 48px)',
                  borderRadius: '24px',
                  position: 'relative',
                  border: plan.isPopular ? '2px solid #6366f1' : '2px solid #003865',
                  boxShadow: plan.isPopular ? '0 16px 40px rgba(99, 102, 241, 0.22)' : 'var(--shadow-lg)',
                }}
              >
                {plan.isPopular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-14px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '5px 18px',
                      borderRadius: '9999px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      zIndex: 2,
                      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                    }}
                  >
                    ⚡ Most Popular Choice
                  </div>
                )}

                {/* Plan Header & Description */}
                <div style={{ marginBottom: '20px', marginTop: plan.isPopular ? '12px' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{plan.name}</h3>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', whiteSpace: 'nowrap' }}>
                      UNLIMITED USERS
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {plan.description}
                  </p>
                </div>

                {/* Price Display with Strikethrough Original Price */}
                <div style={{ marginBottom: '24px' }}>
                  <div
                    style={{
                      fontSize: '15px',
                      color: '#94a3b8',
                      textDecoration: 'line-through',
                      fontWeight: 600,
                      marginBottom: '2px',
                      letterSpacing: '0.02em',
                    }}
                  >
                    ₹{plan.originalPrice || (plan.price ? Math.round(plan.price * 1.6) : 3499)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 'clamp(32px, 6vw, 42px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>₹{plan.price}</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      / {plan.durationMonths || (plan.billingCycle === 'yearly' ? 12 : 1)} {(plan.durationMonths || (plan.billingCycle === 'yearly' ? 12 : 1)) === 1 ? 'month' : 'months'}
                    </span>
                  </div>
                </div>

                {/* 2-Column Features Grid Matching Image 1 */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                    gap: '12px 24px',
                    marginBottom: '32px',
                  }}
                >
                  {plan.features?.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      <Check size={17} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Full Width Bottom Button Matching Home Page Styling */}
                <button
                  onClick={() => navigate(`/checkout?planId=${plan._id}`)}
                  className="btn btn-lg"
                  style={{
                    width: '100%',
                    justify: 'center',
                    fontSize: 'clamp(14px, 3.5vw, 15px)',
                    fontWeight: 700,
                    padding: '14px 20px',
                    borderRadius: '12px',
                    background: plan.isPopular
                      ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
                      : 'linear-gradient(135deg, #001f3f 0%, #003865 100%)',
                    color: '#ffffff',
                    boxShadow: plan.isPopular
                      ? '0 8px 24px rgba(99, 102, 241, 0.35)'
                      : '0 8px 24px rgba(0, 31, 63, 0.25)',
                    border: 'none',
                  }}
                >
                  <CreditCard size={18} />
                  Get Started with {plan.name}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px' }}>
            {displayPlans.map((plan) => (
              <div
                key={plan._id}
                className="glass-panel"
                style={{
                  padding: plan.isPopular
                    ? 'clamp(44px, 5vw, 48px) clamp(18px, 4vw, 32px) clamp(24px, 4vw, 32px)'
                    : 'clamp(28px, 4vw, 36px) clamp(18px, 4vw, 32px)',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: plan.isPopular ? '2px solid #6366f1' : '2px solid #003865',
                  boxShadow: plan.isPopular ? '0 12px 30px rgba(99, 102, 241, 0.25)' : 'var(--shadow-lg)',
                }}
              >
                {plan.isPopular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-14px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 14px',
                      borderRadius: '9999px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      zIndex: 2,
                      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                    }}
                  >
                    ⚡ Most Popular Choice
                  </div>
                )}

                <div style={{ marginBottom: '20px', marginTop: plan.isPopular ? '10px' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800, margin: 0 }}>{plan.name}</h3>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', whiteSpace: 'nowrap' }}>
                      UNLIMITED USERS
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', minHeight: '38px', margin: 0, lineHeight: 1.5 }}>
                    {plan.description}
                  </p>
                </div>

                {/* Price Display with Strikethrough Original Price */}
                <div style={{ marginBottom: '22px' }}>
                  <div
                    style={{
                      fontSize: '15px',
                      color: '#94a3b8',
                      textDecoration: 'line-through',
                      fontWeight: 600,
                      marginBottom: '2px',
                      letterSpacing: '0.02em',
                    }}
                  >
                    ₹{plan.originalPrice || (plan.price ? Math.round(plan.price * 1.6) : 3499)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 'clamp(30px, 5vw, 38px)', fontWeight: 800, color: 'var(--text-primary)' }}>₹{plan.price}</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                      / {plan.durationMonths || (plan.billingCycle === 'yearly' ? 12 : 1)} {(plan.durationMonths || (plan.billingCycle === 'yearly' ? 12 : 1)) === 1 ? 'month' : 'months'}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {plan.features?.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      <Check size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate(`/checkout?planId=${plan._id}`)}
                  className="btn btn-lg"
                  style={{
                    width: '100%',
                    justify: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    padding: '13px 18px',
                    borderRadius: '12px',
                    background: plan.isPopular
                      ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
                      : 'linear-gradient(135deg, #001f3f 0%, #003865 100%)',
                    color: '#ffffff',
                    boxShadow: plan.isPopular
                      ? '0 8px 24px rgba(99, 102, 241, 0.35)'
                      : '0 8px 24px rgba(0, 31, 63, 0.25)',
                    border: 'none',
                  }}
                >
                  <CreditCard size={18} />
                  Get Started with {plan.name}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Genuine Value Proposition Cards (Affordable, High Value, Practical) */}
      <section style={{ padding: '30px 24px 80px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.02em' }}>
            Built for Real-World Business Value
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '640px', margin: '0 auto' }}>
            Why growing sales teams, dealers, and consultants choose Zokep CRM over complex per-user alternatives.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {valueHighlights.map((item, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '28px 26px',
                borderRadius: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-subtle)',
                background: '#ffffff',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'var(--bg-surface-elevated)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {item.icon}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: item.tagColor,
                      background: `${item.tagColor}15`,
                      padding: '3px 10px',
                      borderRadius: '20px',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {item.tag}
                  </span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Simple CTA Bar */}
      <section style={{ padding: '0 24px 70px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #002244 0%, #003865 100%)',
            borderRadius: '20px',
            padding: '36px 40px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: '0 12px 30px rgba(0, 34, 68, 0.2)',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              GET STARTED IN UNDER 2 MINUTES
            </span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '6px 0', color: '#ffffff', letterSpacing: '-0.02em' }}>
              Ready to streamline your sales pipeline?
            </h3>
            <p style={{ fontSize: '14px', color: '#93c5fd', margin: 0 }}>
              Immediate access upon checkout with automated login credentials.
            </p>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary btn-lg"
            style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              borderColor: '#10b981',
              fontWeight: 700,
              fontSize: '15px',
              padding: '12px 28px',
              borderRadius: '10px',
            }}
          >
            Deploy Your CRM Workspace <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '40px 24px', background: 'var(--bg-surface)', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src="/logo.png" alt="ZOKEP CRM" style={{ height: '32px', objectFit: 'contain' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>&copy; {new Date().getFullYear()} ZOKEP CRM. All rights reserved.</span>
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            <Link to="/features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</Link>
            <Link to="/industries/real-estate" style={{ color: 'inherit', textDecoration: 'none' }}>Industries</Link>
            <Link to="/pricing" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing</Link>
            <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
