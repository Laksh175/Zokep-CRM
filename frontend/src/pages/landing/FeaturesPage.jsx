import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Sliders,
  FolderKanban,
  Globe,
  Mail,
  Users,
  FileSpreadsheet,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  Send,
  Eye,
  Check,
  X,
  Share2,
  Code2,
} from 'lucide-react';
import Navbar from '../../components/Navbar';

export const FeaturesPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', overflowX: 'clip', width: '100%' }}>
      <Navbar />

      {/* Hero Header */}
      <section style={{ position: 'relative', padding: 'clamp(48px, 8vw, 70px) 16px 40px', textAlign: 'center', overflow: 'hidden' }}>
        {/* Ambient Brand Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(500px, 90vw)',
            height: 'min(500px, 90vw)',
            background: 'radial-gradient(circle, rgba(0, 56, 101, 0.12) 0%, rgba(0, 166, 81, 0.08) 50%, transparent 70%)',
            filter: 'blur(70px)',
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
              background: 'var(--primary-100)',
              border: '1px solid var(--primary-200)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--primary-500)',
              marginBottom: '18px',
              maxWidth: '100%',
              flexWrap: 'wrap',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            <Sparkles size={15} color="var(--accent-green)" style={{ flexShrink: 0 }} />
            <span>BUILT FOR MODERN HIGH-CONVERTING SALES TEAMS</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(28px, 6vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: '18px',
              wordBreak: 'break-word',
            }}
          >
            Everything You Need to{' '}
            <span style={{ color: 'var(--accent-green)', display: 'inline-block' }}>Capture. Convert. Close.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 2.5vw, 17px)',
              color: 'var(--text-secondary)',
              maxWidth: '720px',
              margin: '0 auto 32px',
              lineHeight: 1.6,
              wordBreak: 'break-word',
            }}
          >
            Stop losing qualified inquiries to slow responses and messy spreadsheets. Zokep CRM gives you
            1-click WhatsApp outreach, dynamic form builders, automated email dispatches, and custom pipeline stages tailored to your business.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/pricing" className="btn btn-primary btn-lg" style={{ fontSize: '15px' }}>
              Get Started Now <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg" style={{ fontSize: '15px' }}>
              Explore Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Feature 1: 1-Click WhatsApp Direct Launcher */}
      <section style={{ padding: '36px 16px', maxWidth: '1200px', margin: '0 auto' }}>
        <div
          className="glass-panel"
          style={{
            padding: 'clamp(24px, 4vw, 48px) clamp(18px, 3.5vw, 40px)',
            borderRadius: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '32px',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(37, 211, 102, 0.12)',
                color: '#16a34a',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '14px',
              }}
            >
              <MessageSquare size={14} />
              <span>1-CLICK WHATSAPP OUTREACH</span>
            </div>

            <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, marginBottom: '14px', lineHeight: 1.25, wordBreak: 'break-word' }}>
              Connect with Leads on WhatsApp in Under 3 Seconds
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px', wordBreak: 'break-word' }}>
              No need to save phone numbers on your mobile or copy-paste messages manually. 1-click generates an instant
              {' '}<code>wa.me/</code> direct chat window with pre-filled, personalized templates and automatic activity logging.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={18} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                  <strong>Dynamic Variable Tags:</strong> Automatically injects <code>&#123;&#123;lead_name&#125;&#125;</code>, <code>&#123;&#123;company&#125;&#125;</code>, and <code>&#123;&#123;staff_name&#125;&#125;</code>.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={18} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                  <strong>Zero Setup Friction:</strong> Works directly in any browser and on WhatsApp Web / Desktop without paying expensive API fees.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={18} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                  <strong>Automatic Timeline Logging:</strong> Every message sent is instantly logged into the lead's contact activity timeline.
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Visual Card */}
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: 'clamp(16px, 3vw, 24px)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#25D366', flexShrink: 0 }} />
                <strong style={{ fontSize: '13px' }}>WhatsApp Direct Message Preview</strong>
              </div>
              <span className="badge" style={{ backgroundColor: 'rgba(37, 211, 102, 0.15)', color: '#16a34a', fontSize: '11px' }}>
                Ready to Send
              </span>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '14px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 10px', fontStyle: 'italic', wordBreak: 'break-word' }}>
                To: <strong>+91 97120 22558 (Manoj Patel)</strong>
              </p>
              <div style={{ background: '#dcf8c6', color: '#111827', padding: '12px 14px', borderRadius: '12px 12px 0 12px', fontSize: '13px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                Hello <strong>Manoj Patel</strong>, thank you for inquiring about <strong>kurm</strong>! I am Rohit Sharma from Skyline Luxury Realty. When is a good time for a quick 5-min call?
              </div>
            </div>

            <button className="btn btn-whatsapp" style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}>
              <MessageSquare size={16} /> Open in WhatsApp Web (wa.me)
            </button>
          </div>
        </div>
      </section>

      {/* Feature 2: Dynamic Custom Fields Builder */}
      <section style={{ padding: '30px 16px', maxWidth: '1200px', margin: '0 auto' }}>
        <div
          className="glass-panel"
          style={{
            padding: 'clamp(24px, 4vw, 48px) clamp(18px, 3.5vw, 40px)',
            borderRadius: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '32px',
            alignItems: 'center',
          }}
        >
          {/* Visual Interactive Preview */}
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: 'clamp(16px, 3vw, 24px)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <strong style={{ fontSize: '13px' }}>Custom Lead Capture Schema</strong>
              <span className="badge" style={{ backgroundColor: 'rgba(0, 56, 101, 0.1)', color: 'var(--primary-500)', fontSize: '11px' }}>
                Real Estate Preset
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>DROPDOWN SELECT</span>
                <strong style={{ fontSize: '13px' }}>Property Type</strong>: <span style={{ fontSize: '12px' }}>2 BHK, 3 BHK Luxury, Penthouse</span>
              </div>
              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>NUMBER RANGE</span>
                <strong style={{ fontSize: '13px' }}>Budget Bracket</strong>: <span style={{ fontSize: '12px' }}>₹75 Lakhs - ₹1.5 Crore</span>
              </div>
              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>TEXT INPUT</span>
                <strong style={{ fontSize: '13px' }}>Preferred Location</strong>: <span style={{ fontSize: '12px' }}>Indiranagar, Whitefield</span>
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(0, 56, 101, 0.1)',
                color: 'var(--primary-500)',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '14px',
              }}
            >
              <Sliders size={14} />
              <span>DYNAMIC FORM BUILDER</span>
            </div>

            <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, marginBottom: '14px', lineHeight: 1.25, wordBreak: 'break-word' }}>
              Tailor Forms to Fit Any Business or Industry
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px', wordBreak: 'break-word' }}>
              Every industry collects different data. With Zokep CRM's visual field builder, you can add custom inputs
              in seconds without writing a single line of code.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={18} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                  <strong>6 Diverse Input Types:</strong> Text, Number, Dropdown Select, Radio, Checkbox, Date & Textarea.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={18} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                  <strong>Seamless Public Form Sync:</strong> Newly added fields instantly appear on your public shareable lead form and website iframe embed.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={18} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                  <strong>CSV Compatible:</strong> Custom fields automatically integrate into your CSV imports and export sheets.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3 & 4: Custom Pipeline & Public Form Embed */}
      <section style={{ padding: '30px 16px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
          {/* Card 1: Custom Pipeline */}
          <div className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 36px)', borderRadius: '20px' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6366f1',
                marginBottom: '16px',
              }}
            >
              <FolderKanban size={22} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>
              Custom Lead Stages & HEX Colors
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '18px' }}>
              Define your stages (e.g., <em>Site Visit, RFQ Sent, Contract Signed</em>) with unique color badges. Switch seamlessly between Table View and Kanban Board with 1 click.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#2563eb', fontSize: '11px' }}>New Lead</span>
              <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#d97706', fontSize: '11px' }}>Site Visit</span>
              <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#059669', fontSize: '11px' }}>Won / Converted</span>
            </div>
          </div>

          {/* Card 2: Public Shareable Form & Embed */}
          <div className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 36px)', borderRadius: '20px' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-green)',
                marginBottom: '16px',
              }}
            >
              <Globe size={22} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>
              Public Shareable Link & iFrame Embed
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '18px' }}>
              Get a dedicated public URL (<code>/f/:tenantId</code>) for your Google & Meta ad campaigns, plus an HTML iframe embed code to paste onto your WordPress, React, or Webflow site.
            </p>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--primary-500)', wordBreak: 'break-all' }}>
              &lt;iframe src="https://zokepcrm.com/f/tenant123" /&gt;
            </div>
          </div>

          {/* Card 3: Automated Nodemailer Dispatcher */}
          <div className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 36px)', borderRadius: '20px' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
                marginBottom: '16px',
              }}
            >
              <Mail size={22} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>
              1-Click Nodemailer Email Dispatcher
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '18px' }}>
              Send formatted HTML email proposals directly from the CRM using your own SMTP credentials. Staff onboarding credentials are auto-emailed on account creation.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0284c7', fontWeight: 600 }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> <span>SMTP Gmail & Custom Domain Support</span>
            </div>
          </div>

          {/* Card 4: Role-Based Access Control */}
          <div className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 36px)', borderRadius: '20px' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: 'rgba(217, 119, 6, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
                marginBottom: '16px',
              }}
            >
              <Users size={22} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>
              3-Tier Multi-Tenant Role Hierarchy
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '18px' }}>
              Dedicated workflows for <strong>Super Admin</strong> (platform revenue & tenant lifecycle), <strong>Tenant Admin</strong> (pipeline & staff control), and <strong>Sales Staff</strong> (assigned leads & follow-ups).
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#d97706', fontWeight: 600 }}>
              <ShieldCheck size={16} style={{ flexShrink: 0 }} /> <span>Strict Data Isolation Between Tenants</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table: Traditional CRM vs Zokep CRM */}
      <section style={{ padding: '40px 16px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4.5vw, 32px)', fontWeight: 800, marginBottom: '10px', wordBreak: 'break-word' }}>
            Why Sales Teams Choose <span style={{ color: 'var(--accent-green)' }}>Zokep CRM</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            See how Zokep compares against traditional, heavyweight CRM software.
          </p>
        </div>

        {/* Mobile Swipe Hint */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '10px',
            fontWeight: 500,
          }}
        >
          <span>← Scroll table horizontally to compare →</span>
        </div>

        <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden', padding: 0 }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
            <table className="crm-table" style={{ margin: 0, minWidth: '600px', width: '100%' }}>
              <thead>
                <tr style={{ background: 'var(--primary-50)' }}>
                  <th style={{ width: '40%', padding: '16px 20px' }}>Feature Capability</th>
                  <th style={{ width: '30%', padding: '16px 20px', color: 'var(--primary-500)', fontWeight: 800, fontSize: '14px' }}>
                    ⚡ Zokep CRM
                  </th>
                  <th style={{ width: '30%', padding: '16px 20px', color: 'var(--text-muted)' }}>Traditional CRMs</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>Setup & Go-Live Time</td>
                  <td style={{ padding: '14px 20px', color: 'var(--accent-green)', fontWeight: 700 }}>60 Seconds Instant</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>2 to 4 Weeks Config</td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>1-Click WhatsApp Direct (wa.me)</td>
                  <td style={{ padding: '14px 20px', color: 'var(--accent-green)', fontWeight: 700 }}>Built-in Free with Dynamic Tags</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>Expensive 3rd-party add-ons</td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>Dynamic Custom Field Builder</td>
                  <td style={{ padding: '14px 20px', color: 'var(--accent-green)', fontWeight: 700 }}>1-Click Visual Builder</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>Requires Developer / Admin</td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>Public Lead Capture & iFrame Embed</td>
                  <td style={{ padding: '14px 20px', color: 'var(--accent-green)', fontWeight: 700 }}>Ready-to-Paste Code Included</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>High-tier plan required</td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>Bulk CSV Import & Column Mapping</td>
                  <td style={{ padding: '14px 20px', color: 'var(--accent-green)', fontWeight: 700 }}>Included in all plans</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>Limited or complicated</td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>Pricing & Transparency</td>
                  <td style={{ padding: '14px 20px', color: 'var(--accent-green)', fontWeight: 700 }}>Affordable Monthly / Annual INR</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>USD Per-User Lock-ins</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section style={{ padding: '30px 16px 60px', maxWidth: '1240px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            padding: 'clamp(32px, 6vw, 52px) clamp(18px, 4vw, 36px)',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #002244 0%, #003865 100%)',
            color: '#ffffff',
            boxShadow: '0 16px 36px rgba(0, 34, 68, 0.22)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: 700,
              color: '#10b981',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            START STREAMLINING YOUR SALES
          </span>
          <h2 style={{ fontSize: 'clamp(22px, 4.5vw, 32px)', fontWeight: 800, marginBottom: '14px', color: '#ffffff', letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
            Ready to Accelerate Your Sales Pipeline?
          </h2>
          <p style={{ color: '#93c5fd', fontSize: '15px', maxWidth: '640px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Get started today with our flexible monthly or annual subscriptions. Zero setup fee, instant access.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              to="/pricing"
              className="btn btn-primary btn-lg"
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                borderColor: '#10b981',
                fontWeight: 700,
                fontSize: '14px',
                padding: '12px 24px',
                borderRadius: '10px',
              }}
            >
              View Subscription Plans <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="btn btn-secondary btn-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                fontWeight: 600,
                fontSize: '14px',
                padding: '12px 20px',
                borderRadius: '10px',
              }}
            >
              Sign In to Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '36px 16px', background: 'var(--bg-surface)' }}>
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

export default FeaturesPage;
