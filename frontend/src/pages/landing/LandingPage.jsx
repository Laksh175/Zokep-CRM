import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  MessageSquare,
  Users,
  BarChart3,
  Sparkles,
  Building2,
  Factory,
  Briefcase,
  Globe,
  Check,
  CreditCard,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [activeTab, setActiveTab] = useState('realestate');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/superadmin/plans');
      if (res.success && res.data.length > 0) {
        setPlans(res.data);
      } else {
        // Fallback default plans if not yet seeded
        setPlans([
          {
            _id: 'default_starter',
            name: 'Starter Tier',
            billingCycle: 'monthly',
            price: 1499,
            currency: 'INR',
            description: 'Ideal for solo consultants and boutique sales agencies.',
            features: [
              'Up to 500 Active Leads',
              '3 Staff Members',
              'Custom Lead Statuses & Colors',
              '1-Click WhatsApp & Email Triggers',
              'Public Shareable Lead Capture Link',
              'CSV Batch Import & Export',
            ],
            isPopular: false,
          },
          {
            _id: 'default_growth',
            name: 'Growth Suite',
            billingCycle: 'monthly',
            price: 3499,
            currency: 'INR',
            description: 'The standard choice for growing sales teams & dealerships.',
            features: [
              'Unlimited Leads & Deals',
              '10 Staff Members',
              'Custom Dynamic Form Fields Builder',
              'Unlimited WhatsApp & Email Templates',
              'Staff Performance Leaderboard',
              'Public Embeddable Form',
              'Priority Email & Nodemailer Integration',
            ],
            isPopular: true,
          },
          {
            _id: 'default_enterprise',
            name: 'Enterprise Suite',
            billingCycle: 'yearly',
            price: 29999,
            currency: 'INR',
            description: 'Comprehensive annual package for high-volume sales organizations.',
            features: [
              'Unlimited Leads & Deals',
              'Unlimited Staff Members',
              'Custom Industry Workflows',
              'Razorpay & Webhook Automation',
              'Dedicated Account Manager',
              '2 Months Free Discount Included',
            ],
            isPopular: false,
          },
        ]);
      }
    } catch (err) {
      console.warn('Failed to load plans:', err.message);
    } finally {
      setLoadingPlans(false);
    }
  };

  const filteredPlans = plans.filter((p) => p.billingCycle === billingCycle);
  const displayPlans = filteredPlans.length > 0 ? filteredPlans : plans;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ position: 'relative', padding: '80px 24px 60px', overflow: 'hidden', textAlign: 'center' }}>
        {/* Ambient Glows */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.1) 45%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              fontSize: '13px',
              fontWeight: 600,
              color: '#818cf8',
              marginBottom: '24px',
            }}
          >
            <Sparkles size={16} />
            <span>Next-Gen Multi-Tenant SaaS CRM with Razorpay & WhatsApp</span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-1.5px', marginBottom: '24px' }}>
            Close More Deals Faster With <br />
            <span className="gradient-text">Custom-Tailored Lead Workflows</span>
          </h1>

          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto 36px', lineHeight: 1.6 }}>
            The all-in-one subscription CRM built for Real Estate, Manufacturing, Agencies, and Modern Sales Teams. Configure custom stages, dynamic forms, 1-click WhatsApp triggers, and staff assignment in seconds.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <a href="#pricing" className="btn btn-primary btn-lg" style={{ fontSize: '16px' }}>
              Choose a Subscription
              <ArrowRight size={18} />
            </a>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Explore Live Demo
            </Link>
          </div>

          {/* Feature Highlights Pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px', marginTop: '48px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>1-Click WhatsApp Direct (wa.me)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>Dynamic Form Custom Fields</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>Razorpay Subscription Billing</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>Automated Nodemailer Credentials</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Industry Use Cases */}
      <section id="industries" style={{ padding: '60px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>
            Engineered for <span className="gradient-cyan">Your Exact Business</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            No two businesses are identical. Zokep CRM adapts dynamic stages and custom fields to match your sales cycle.
          </p>
        </div>

        {/* Industry Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('realestate')}
            className={`btn ${activeTab === 'realestate' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Building2 size={18} />
            Real Estate & Property
          </button>
          <button
            onClick={() => setActiveTab('manufacturing')}
            className={`btn ${activeTab === 'manufacturing' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Factory size={18} />
            Manufacturing & Industrial
          </button>
          <button
            onClick={() => setActiveTab('agency')}
            className={`btn ${activeTab === 'agency' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Briefcase size={18} />
            Agencies & IT Services
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="glass-panel" style={{ padding: '36px', borderRadius: '20px' }}>
          {activeTab === 'realestate' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                  REAL ESTATE CRM PRESET
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '14px' }}>From Inquiry to Site Visits to Token Bookings</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                  Track property types (1BHK, 2BHK, Luxury Villas), preferred locations, and budget brackets with custom fields. Schedule site visits and trigger WhatsApp reminders instantly.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
                    <strong>Custom Stages:</strong> Site Visit Scheduled &rarr; Site Visit Completed &rarr; Token Confirmed
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#06b6d4' }} />
                    <strong>Dynamic Fields:</strong> Property Type, Preferred Area, Budget Range
                  </div>
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-medium)' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '16px', color: 'var(--text-secondary)' }}>Sample Real Estate Lead Card:</h4>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #8b5cf6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>Amitabh Sen</strong>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>₹1.85 Cr</span>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Looking for: 3 BHK Luxury • Indiranagar • East Facing
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' }}>Site Visit Scheduled</span>
                    <span className="badge" style={{ backgroundColor: 'rgba(37, 211, 102, 0.2)', color: '#4ade80' }}>WhatsApp Sent</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manufacturing' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                  MANUFACTURING & B2B PRESET
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '14px' }}>RFQ to Sample Approval & Purchase Orders</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                  Manage industrial inquiries with custom fields for required tonnage/quantities, technical specs, and sample dispatch logistics.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                    <strong>Custom Stages:</strong> RFQ Received &rarr; Sample Dispatched &rarr; PO Approved
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <strong>Dynamic Fields:</strong> Required Quantity, Machine Specs, Delivery Deadline
                  </div>
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-medium)' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '16px', color: 'var(--text-secondary)' }}>Sample Industrial Lead Card:</h4>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>Precision Auto Components</strong>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>₹8.50 Lakhs</span>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Qty: 5,000 Units • Custom CNC Turned Parts
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>Sample Sent</span>
                    <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>Technical Review</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agency' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                  AGENCY & CONSULTING PRESET
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '14px' }}>Lead Qualification to Scope of Work & Retainers</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                  Track client project requirements, budget tiers, and target go-live dates. Auto-assign inquiries from your public lead form to sales executives.
                </p>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-medium)' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '16px', color: 'var(--text-secondary)' }}>Sample Agency Lead Card:</h4>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>FinTech Mobile App Project</strong>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>₹4.20 Lakhs</span>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Retainer: 6 Months • Needs Full Stack + UI/UX
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>Proposal Sent</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Pricing Section */}
      <section id="pricing" style={{ padding: '80px 24px', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
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
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '14px' }}>
            Choose the Perfect Plan for <span className="gradient-text">Your Team</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto 28px' }}>
            Instant setup. Razorpay secure checkout. Credentials automatically dispatched to your email on purchase.
          </p>

          {/* Monthly / Yearly Switch */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--bg-surface-elevated)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: billingCycle === 'monthly' ? 'var(--primary-600)' : 'transparent',
                color: billingCycle === 'monthly' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: billingCycle === 'yearly' ? 'var(--primary-600)' : 'transparent',
                color: billingCycle === 'yearly' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Annual Billing
              <span style={{ fontSize: '11px', background: '#10b981', color: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {displayPlans.map((plan) => (
            <div
              key={plan._id}
              className="glass-panel"
              style={{
                padding: '32px 28px',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: plan.isPopular ? '2px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                boxShadow: plan.isPopular ? '0 12px 30px rgba(99, 102, 241, 0.25)' : 'var(--shadow-lg)',
              }}
            >
              {plan.isPopular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
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
                  }}
                >
                  Most Popular Choice
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>{plan.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', minHeight: '38px', margin: 0 }}>
                  {plan.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '24px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{plan.price}</span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  / {plan.durationMonths || (plan.billingCycle === 'yearly' ? 12 : 1)} { (plan.durationMonths || (plan.billingCycle === 'yearly' ? 12 : 1)) === 1 ? 'month' : 'months' }
                </span>
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
                className={`btn ${plan.isPopular ? 'btn-primary' : 'btn-secondary'} btn-lg`}
                style={{ width: '100%' }}
              >
                <CreditCard size={18} />
                Get Started with {plan.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '40px 24px', background: 'var(--bg-surface)', marginTop: '60px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src="/logo.png" alt="ZOKEP CRM" style={{ height: '32px', objectFit: 'contain' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>&copy; {new Date().getFullYear()} ZOKEP CRM. All rights reserved.</span>
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <Link to="/login">Universal Login</Link>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
