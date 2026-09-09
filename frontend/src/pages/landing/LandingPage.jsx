import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layers, ArrowRight, CheckCircle2, Zap, Shield, MessageSquare, Users, BarChart3, Sparkles, Building2, Factory, Briefcase, Globe, Check, CreditCard, Sliders, } from 'lucide-react';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

export const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [activeTab, setActiveTab] = useState('realestate');

  useEffect(() => {
    fetchPlans();
  }, []);

  // Smooth scroll to target section when navigating with hash (e.g. /#pricing, /#features, /#industries)
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location]);

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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', width: '100%' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ position: 'relative', padding: ' clamp(48px, 8vw, 80px) 16px 48px', overflow: 'hidden', textAlign: 'center' }}>
        {/* Ambient Glows */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(500px, 90vw)',
            height: 'min(500px, 90vw)',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.1) 45%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 1, padding: '0 8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              fontSize: '12px',
              fontWeight: 600,
              color: '#818cf8',
              marginBottom: '20px',
              maxWidth: '100%',
              flexWrap: 'wrap',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            <Sparkles size={15} style={{ flexShrink: 0 }} />
            <span>Next-Gen Multi-Tenant SaaS CRM with Razorpay & WhatsApp</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(28px, 6vw, 58px)',
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: '20px',
              wordBreak: 'break-word',
            }}
          >
            Close More Deals Faster With{' '}
            <span className="gradient-text" style={{ display: 'inline-block' }}>
              Custom-Tailored Lead Workflows
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 2.5vw, 18px)',
              color: 'var(--text-secondary)',
              maxWidth: '720px',
              margin: '0 auto 32px',
              lineHeight: 1.6,
              wordBreak: 'break-word',
            }}
          >
            The all-in-one subscription CRM built for Real Estate, Manufacturing, Agencies, and Modern Sales Teams. Configure custom stages, dynamic forms, 1-click WhatsApp triggers, and staff assignment in seconds.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/pricing" className="btn btn-primary btn-lg" style={{ fontSize: '15px' }}>
              Choose a Subscription
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg" style={{ fontSize: '15px' }}>
              Explore Live Demo
            </Link>
          </div>

          {/* Feature Highlights Pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px 20px', marginTop: '40px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
              <span>1-Click WhatsApp Direct (wa.me)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
              <span>Dynamic Form Custom Fields</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
              <span>Razorpay Subscription Billing</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
              <span>Automated Nodemailer Credentials</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Overview Section */}
      <section id="features" style={{ padding: '50px 16px', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'var(--primary-100)',
              color: 'var(--primary-500)',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '12px',
            }}
          >
            ⚡ CAPTURE • CONVERT • CLOSE
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 4.5vw, 34px)', fontWeight: 800, marginBottom: '12px', wordBreak: 'break-word' }}>
            Next-Gen Tools to <span style={{ color: 'var(--accent-green)' }}>Supercharge Your Pipeline</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '680px', margin: '0 auto' }}>
            Built specifically to eliminate messy spreadsheets and slow sales follow-ups with instant WhatsApp and automated workflows.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', marginBottom: '32px' }}>
          {/* Feature 1 */}
          <div className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 32px)', borderRadius: '20px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'rgba(37, 211, 102, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', marginBottom: '16px' }}>
              <MessageSquare size={22} />
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '10px' }}>1-Click WhatsApp Direct (wa.me)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
              Launch instant WhatsApp chats without saving contact numbers. Pre-fill customer names and deal info dynamically.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 32px)', borderRadius: '20px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'rgba(0, 56, 101, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-500)', marginBottom: '16px' }}>
              <Sliders size={22} />
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '10px' }}>Dynamic Form Fields Builder</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
              Add custom text, number, dropdown, radio, or date fields to tailor your CRM to Real Estate, Manufacturing, or Agency workflows.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 32px)', borderRadius: '20px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)', marginBottom: '16px' }}>
              <Globe size={22} />
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '10px' }}>Public Form Link & Website Embed</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
              Share your dedicated lead capture link on Google & Meta Ads, or embed the iframe into your website for zero lead leakage.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/features" className="btn btn-primary btn-lg" style={{ fontSize: '15px' }}>
            Explore Full Features Breakdown <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Interactive Industry Use Cases */}
      <section id="industries" style={{ padding: '50px 16px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4.5vw, 32px)', fontWeight: 800, marginBottom: '12px', wordBreak: 'break-word' }}>
            Engineered for <span className="gradient-cyan">Your Exact Business</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '680px', margin: '0 auto' }}>
            No two businesses are identical. Zokep CRM adapts dynamic stages and custom fields to match your sales cycle.
          </p>
        </div>

        {/* Industry Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('realestate')}
            className={`btn ${activeTab === 'realestate' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: '1 1 auto', minWidth: '150px', maxWidth: '230px', padding: '10px 12px', fontSize: '13px' }}
          >
            <Building2 size={16} />
            <span>Real Estate & Property</span>
          </button>
          <button
            onClick={() => setActiveTab('manufacturing')}
            className={`btn ${activeTab === 'manufacturing' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: '1 1 auto', minWidth: '150px', maxWidth: '230px', padding: '10px 12px', fontSize: '13px' }}
          >
            <Factory size={16} />
            <span>Manufacturing & B2B</span>
          </button>
          <button
            onClick={() => setActiveTab('agency')}
            className={`btn ${activeTab === 'agency' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: '1 1 auto', minWidth: '150px', maxWidth: '230px', padding: '10px 12px', fontSize: '13px' }}
          >
            <Briefcase size={16} />
            <span>Agencies & IT Services</span>
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="glass-panel" style={{ padding: 'clamp(18px, 4vw, 36px)', borderRadius: '20px' }}>
          {activeTab === 'realestate' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                  REAL ESTATE CRM PRESET
                </div>
                <h3 style={{ fontSize: 'clamp(20px, 3.5vw, 24px)', fontWeight: 700, marginBottom: '12px' }}>From Inquiry to Site Visits to Token Bookings</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '18px' }}>
                  Track property types (1BHK, 2BHK, Luxury Villas), preferred locations, and budget brackets with custom fields. Schedule site visits and trigger WhatsApp reminders instantly.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', flexWrap: 'wrap' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#8b5cf6', marginTop: '6px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong>Custom Stages:</strong>{' '}
                      <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                        Site Visit Scheduled &rarr; Site Visit Completed &rarr; Token Confirmed
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', flexWrap: 'wrap' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#06b6d4', marginTop: '6px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong>Dynamic Fields:</strong>{' '}
                      <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                        Property Type, Preferred Area, Budget Range
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: 'clamp(14px, 3vw, 24px)', borderRadius: '14px', border: '1px solid var(--border-medium)' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '14px', color: 'var(--text-secondary)' }}>Sample Real Estate Lead Card:</h4>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #8b5cf6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <strong>Amitabh Sen</strong>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>₹1.85 Cr</span>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Looking for: 3 BHK Luxury • Indiranagar • East Facing
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', fontSize: '11px' }}>Site Visit Scheduled</span>
                    <span className="badge" style={{ backgroundColor: 'rgba(37, 211, 102, 0.2)', color: '#4ade80', fontSize: '11px' }}>WhatsApp Sent</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manufacturing' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                  MANUFACTURING & B2B PRESET
                </div>
                <h3 style={{ fontSize: 'clamp(20px, 3.5vw, 24px)', fontWeight: 700, marginBottom: '12px' }}>RFQ to Sample Approval & Purchase Orders</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '18px' }}>
                  Manage industrial inquiries with custom fields for required tonnage/quantities, technical specs, and sample dispatch logistics.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', flexWrap: 'wrap' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b', marginTop: '6px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong>Custom Stages:</strong>{' '}
                      <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                        RFQ Received &rarr; Sample Dispatched &rarr; PO Approved
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', flexWrap: 'wrap' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', marginTop: '6px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong>Dynamic Fields:</strong>{' '}
                      <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                        Required Quantity, Machine Specs, Delivery Deadline
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: 'clamp(14px, 3vw, 24px)', borderRadius: '14px', border: '1px solid var(--border-medium)' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '14px', color: 'var(--text-secondary)' }}>Sample Industrial Lead Card:</h4>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <strong>Precision Auto Components</strong>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>₹8.50 Lakhs</span>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Qty: 5,000 Units • Custom CNC Turned Parts
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '11px' }}>Sample Sent</span>
                    <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontSize: '11px' }}>Technical Review</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agency' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                  AGENCY & CONSULTING PRESET
                </div>
                <h3 style={{ fontSize: 'clamp(20px, 3.5vw, 24px)', fontWeight: 700, marginBottom: '12px' }}>Lead Qualification to Scope of Work & Retainers</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '18px' }}>
                  Track client project requirements, budget tiers, and target go-live dates. Auto-assign inquiries from your public lead form to sales executives.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', flexWrap: 'wrap' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#a855f7', marginTop: '6px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong>Custom Stages:</strong>{' '}
                      <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                        Discovery Call &rarr; Scope of Work &rarr; Retainer Signed
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', flexWrap: 'wrap' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00a651', marginTop: '6px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong>Dynamic Fields:</strong>{' '}
                      <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                        Monthly Budget, Deliverables Scope, Launch Timeline
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: 'clamp(14px, 3vw, 24px)', borderRadius: '14px', border: '1px solid var(--border-medium)' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '14px', color: 'var(--text-secondary)' }}>Sample Agency Lead Card:</h4>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <strong>FinTech Mobile App Project</strong>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>₹4.20 Lakhs</span>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Retainer: 6 Months • Needs Full Stack + UI/UX
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '11px' }}>Proposal Sent</span>
                    <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontSize: '11px' }}>Scope Review</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Pricing Section with Ultra-Premium World-Class Design */}
      <section id="pricing" style={{ padding: '80px 16px', maxWidth: '1240px', margin: '0 auto', position: 'relative' }}>
        {/* Ambient Background Radial Glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '680px',
            height: '420px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(16, 185, 129, 0.07) 50%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ textAlign: 'center', marginBottom: '48px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#10b981',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              marginBottom: '14px',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={14} color="#10b981" />
            TRANSPARENT ENTERPRISE PRICING
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 42px)', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.8px', wordBreak: 'break-word' }}>
            Choose the Perfect Plan for <span className="gradient-text">Your Business</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '620px', margin: '0 auto 28px', lineHeight: 1.6 }}>
            Instant automated provisioning. Razorpay secure checkout. Credentials dispatched directly to your inbox on purchase.
          </p>

          {/* Monthly / Yearly Switch */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--bg-surface-elevated)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border-medium)', maxWidth: '100%', flexWrap: 'wrap', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '9px 20px',
                borderRadius: '10px',
                border: 'none',
                background: billingCycle === 'monthly' ? 'linear-gradient(135deg, #001f3f 0%, #003865 100%)' : 'transparent',
                color: billingCycle === 'monthly' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: billingCycle === 'monthly' ? '0 4px 12px rgba(0, 31, 63, 0.25)' : 'none',
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              style={{
                padding: '9px 20px',
                borderRadius: '10px',
                border: 'none',
                background: billingCycle === 'yearly' ? 'linear-gradient(135deg, #001f3f 0%, #003865 100%)' : 'transparent',
                color: billingCycle === 'yearly' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: billingCycle === 'yearly' ? '0 4px 12px rgba(0, 31, 63, 0.25)' : 'none',
              }}
            >
              Annual Billing
              <span style={{ fontSize: '11px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', padding: '2px 7px', borderRadius: '6px', fontWeight: 800 }}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid / Single Card Unique Design */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: displayPlans.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: '32px',
            maxWidth: displayPlans.length === 1 ? '620px' : '100%',
            margin: '0 auto',
          }}
        >
          {displayPlans.map((plan) => (
            <div
              key={plan._id}
              className="glass-panel"
              style={{
                padding: plan.isPopular
                  ? 'clamp(44px, 5vw, 48px) clamp(18px, 4vw, 36px) clamp(24px, 4vw, 36px)'
                  : 'clamp(28px, 4vw, 36px) clamp(18px, 4vw, 36px)',
                borderRadius: '26px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
                border: plan.isPopular ? '2px solid #6366f1' : '2px solid #003865',
                boxShadow: plan.isPopular
                  ? '0 20px 50px -10px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.15)'
                  : '0 16px 40px -10px rgba(15, 23, 42, 0.12)',
                transition: 'transform 0.3s ease, boxShadow 0.3s ease',
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
                    fontSize: '11.5px',
                    fontWeight: 800,
                    padding: '5px 18px',
                    borderRadius: '9999px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    whiteSpace: 'nowrap',
                    zIndex: 2,
                  }}
                >
                  <Zap size={13} fill="#ffffff" color="#ffffff" />
                  MOST POPULAR CHOICE
                </div>
              )}

              {/* Plan Header */}
              <div style={{ marginBottom: '22px', marginTop: plan.isPopular ? '10px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{plan.name}</h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', whiteSpace: 'nowrap' }}>
                    UNLIMITED USERS
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {plan.description}
                </p>
              </div>

              {/* Price Display Block */}
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: '16px',
                  background: 'rgba(241, 245, 249, 0.7)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  marginBottom: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600, marginBottom: '2px' }}>
                    ₹{plan.originalPrice || (plan.price ? Math.round(plan.price * 1.6) : 3499)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '38px', fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>₹{plan.price}</span>
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                      / {plan.durationMonths || (plan.billingCycle === 'yearly' ? 12 : 1)} {(plan.durationMonths || (plan.billingCycle === 'yearly' ? 12 : 1)) === 1 ? 'month' : 'months'}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1', background: '#e0e7ff', padding: '4px 10px', borderRadius: '6px' }}>
                  Flat Rate
                </span>
              </div>

              {/* Features List */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
                  Key Capabilities Unlocked:
                </div>
                {plan.features?.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: '#334155', fontWeight: 500, lineHeight: 1.45 }}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '1px',
                      }}
                    >
                      <Check size={13} color="#10b981" strokeWidth={3} />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* CTA Action Button */}
              <button
                onClick={() => navigate(`/checkout?planId=${plan._id}`)}
                className="btn btn-lg"
                style={{
                  width: '100%',
                  justify: 'center',
                  fontSize: '15.5px',
                  fontWeight: 700,
                  padding: '14px 24px',
                  borderRadius: '14px',
                  background: plan.isPopular
                    ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
                    : 'linear-gradient(135deg, #001f3f 0%, #003865 100%)',
                  color: '#ffffff',
                  boxShadow: plan.isPopular
                    ? '0 8px 24px rgba(99, 102, 241, 0.35)'
                    : '0 8px 24px rgba(0, 31, 63, 0.25)',
                  border: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <CreditCard size={18} />
                Get Started with {plan.name}
                <ArrowRight size={17} style={{ marginLeft: '4px' }} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '36px 16px', background: 'var(--bg-surface)', marginTop: '48px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <img src="/logo.png" alt="ZOKEP CRM" style={{ height: '30px', objectFit: 'contain' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>&copy; {new Date().getFullYear()} ZOKEP CRM. All rights reserved.</span>
          </div>
          <div style={{ display: 'flex', gap: '16px 20px', fontSize: '14px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            <Link to="/features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</Link>
            <Link to="/industries/real-estate" style={{ color: 'inherit', textDecoration: 'none' }}>Industries</Link>
            <Link to="/pricing" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing</Link>
            <Link to="/faq" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</Link>
            <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
