import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  ChevronDown,
  Layers,
  Zap,
  Users,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Mail,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Navbar from '../../components/Navbar';

export const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaqId, setOpenFaqId] = useState(1); // Default first question open

  const categories = [
    { id: 'all', name: 'All Questions', icon: <HelpCircle size={16} /> },
    { id: 'setup', name: 'Getting Started & Setup', icon: <Zap size={16} /> },
    { id: 'leads', name: 'Leads & Custom Forms', icon: <Layers size={16} /> },
    { id: 'team', name: 'Team & Consultants', icon: <Users size={16} /> },
    { id: 'outreach', name: 'WhatsApp & Email', icon: <MessageSquare size={16} /> },
    { id: 'security', name: 'Data Security & Billing', icon: <ShieldCheck size={16} /> },
  ];

  // 100% Genuine, Authentic FAQs tailored specifically to Zokep CRM's real codebase & features
  const faqData = [
    // --- 1. Getting Started & Setup ---
    {
      id: 1,
      category: 'setup',
      question: 'How do I receive access to my CRM workspace after subscribing?',
      answer:
        'The moment you complete your payment via Razorpay, our automated provisioning system initializes your dedicated tenant database. Your Admin credentials (registered email and secure temporary password) along with your workspace login link are instantly dispatched to your email inbox via Nodemailer within 2 minutes.',
    },
    {
      id: 2,
      category: 'setup',
      question: 'Do I need to install or download any desktop software?',
      answer:
        'No. Zokep CRM is a 100% cloud-based SaaS web application. You, your team, and your sales consultants can access it instantly from Google Chrome, Apple Safari, Microsoft Edge, or any modern browser on Windows, Mac, iOS, or Android devices.',
    },
    {
      id: 3,
      category: 'setup',
      question: 'How long does it take to set up our sales pipeline and start capturing leads?',
      answer:
        'Under 5 minutes. Zokep comes pre-seeded with industry-standard pipeline stages (New Lead, Follow-up Needed, Demo/Pitch, Proposal Sent, Won, Lost). You can use your ready-made public lead form link immediately, or customize form fields in under 2 minutes.',
    },

    // --- 2. Leads & Custom Forms ---
    {
      id: 4,
      category: 'leads',
      question: 'What is the No-Code Dynamic Form Builder, and how does it work?',
      answer:
        'Every business collects different client data (e.g., Real Estate needs Budget & BHK, Manufacturing needs Part Numbers & Order Quantities). Our visual field builder allows Tenant Admins to add custom fields—Text, Number, Dropdown Select, Radio, and Checkboxes—with zero coding. Newly added fields immediately appear in your public lead capture forms and lead detail views.',
    },
    {
      id: 5,
      category: 'leads',
      question: 'Can I embed the Zokep lead capture form into our existing website?',
      answer:
        'Yes! Every tenant gets a dedicated hosted form URL (e.g., zokepcrm.com/f/[your-tenant-id]) and a ready-to-copy HTML <iframe /> code snippet. You can embed this directly into WordPress, Webflow, React, Shopify, or custom HTML landing pages. All submissions stream directly into your CRM in real time.',
    },
    {
      id: 6,
      category: 'leads',
      question: 'Can I import my existing leads from Excel or Google Sheets?',
      answer:
        'Yes. Zokep CRM includes an intelligent Bulk CSV Importer. Simply export your spreadsheet as a .csv file and upload it. The mapper auto-detects columns for Lead Name, Phone Number, Email, and Company. You can also export your complete lead database to CSV at any time.',
    },
    {
      id: 7,
      category: 'leads',
      question: 'Can I customize our pipeline stages and badge colors?',
      answer:
        'Yes. From your Admin Lead Statuses console, you can add custom stages (like "Site Visit Scheduled", "Quotation Under Review", or "Token Booking"), set their display order, and assign custom HEX colors so your sales team can visually scan deal progress instantly.',
    },

    // --- 3. Team & Consultants ---
    {
      id: 8,
      category: 'team',
      question: 'How do my sales consultants log in and manage their assigned leads?',
      answer:
        'The Tenant Admin creates individual staff accounts from the Staff Management page. Each sales consultant receives their own login credentials. Staff members have a focused dashboard showing only the leads assigned to them, their pending follow-ups, and their daily conversion metrics.',
    },
    {
      id: 9,
      category: 'team',
      question: 'Do you charge extra fees for adding more sales consultants or staff members?',
      answer:
        'No! Unlike legacy CRMs (like Salesforce, HubSpot, or Zoho) that charge ₹1,500 to ₹3,500 per month for every single user, Zokep CRM provides UNLIMITED sales staff accounts at one predictable flat subscription price.',
    },
    {
      id: 10,
      category: 'team',
      question: 'What metrics does the Team Performance Leaderboard track?',
      answer:
        'The leaderboard provides real-time visibility into your sales reps performance: Total Leads Assigned, Deals Converted / Won, Lost Inquiries, and individual Win Rate percentage (%). This enables managers to identify top closers and coach struggling reps.',
    },

    // --- 4. WhatsApp & Email Outreach ---
    {
      id: 11,
      category: 'outreach',
      question: 'How does 1-Click WhatsApp Direct outreach work? Are there Meta API charges?',
      answer:
        'There are zero Meta Cloud API fees or monthly conversation surcharges. Clicking the WhatsApp button on any lead card immediately launches the official WhatsApp Web or WhatsApp Desktop application with the lead’s phone number and a pre-composed greeting with the customer’s name. Your reps never need to save phone numbers in their personal contact books.',
    },
    {
      id: 12,
      category: 'outreach',
      question: 'How are formal email notifications and credentials sent?',
      answer:
        'Zokep CRM is powered by a high-deliverability Nodemailer SMTP dispatcher. It automatically emails new staff credentials, password reset links, and customer notifications using structured, professional email templates.',
    },

    // --- 5. Data Security & Billing ---
    {
      id: 13,
      category: 'security',
      question: 'Is our lead and customer data isolated from other businesses?',
      answer:
        '100% Yes. Zokep CRM is architected with strict Multi-Tenant Data Isolation. Every inquiry, custom form field, customer note, and staff record is cryptographically scoped to your tenant ID in MongoDB. No competitor or other tenant can ever view or access your business data.',
    },
    {
      id: 14,
      category: 'security',
      question: 'What payment methods are supported, and will I receive a GST invoice?',
      answer:
        'All transactions are processed through Razorpay, supporting UPI (Google Pay, PhonePe, Paytm, BHIM), all major Credit/Debit Cards, Net Banking, and Corporate Cards. An automated GST-compliant tax invoice is generated for every payment so your business can claim Input Tax Credit (ITC).',
    },
    {
      id: 15,
      category: 'security',
      question: 'Can I upgrade, downgrade, or cancel my subscription at any time?',
      answer:
        'Yes. There are no lock-in contracts or cancellation penalties. You can review your subscription status and manage your billing cycle directly from your Admin Billing console whenever you choose.',
    },
  ];

  // Filter FAQs by Category & Search Query
  const filteredFaqs = useMemo(() => {
    return faqData.filter((faq) => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ position: 'relative', padding: '75px 24px 45px', textAlign: 'center', overflow: 'hidden' }}>
        {/* Glow ambient background */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '640px',
            height: '640px',
            background: 'radial-gradient(circle, rgba(0, 56, 101, 0.12) 0%, rgba(0, 166, 81, 0.08) 45%, transparent 70%)',
            filter: 'blur(75px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: '9999px',
              background: 'rgba(0, 56, 101, 0.08)',
              color: '#003865',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            <HelpCircle size={14} color="#10b981" /> FREQUENTLY ASKED QUESTIONS
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 800,
              lineHeight: 1.18,
              letterSpacing: '-0.02em',
              marginBottom: '16px',
            }}
          >
            Everything You Need to Know About <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #002244 0%, #003865 40%, #00A651 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Zokep CRM Platform
            </span>
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              maxWidth: '620px',
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            Clear, honest answers about setup, 1-click WhatsApp outreach, dynamic form builders, staff management, and billing.
          </p>

          {/* Real-time Search Input */}
          <div
            style={{
              position: 'relative',
              maxWidth: '560px',
              margin: '0 auto',
            }}
          >
            <Search
              size={18}
              color="var(--text-muted)"
              style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search by topic, e.g. 'WhatsApp', 'CSV', 'staff', 'Razorpay'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 20px 14px 48px',
                borderRadius: '14px',
                border: '1px solid var(--border-medium)',
                background: '#ffffff',
                fontSize: '14.5px',
                color: 'var(--text-primary)',
                outline: 'none',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#00A651';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 166, 81, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.05)';
              }}
            />
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section style={{ padding: '0 24px 30px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: isActive ? '1px solid #002244' : '1px solid var(--border-subtle)',
                  background: isActive ? '#002244' : '#ffffff',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(0, 34, 68, 0.15)' : 'none',
                }}
              >
                {cat.icon}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Accordion FAQ List */}
      <section style={{ padding: '10px 24px 70px', maxWidth: '880px', margin: '0 auto', width: '100%', flex: 1 }}>
        {filteredFaqs.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              borderRadius: '18px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <HelpCircle size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px' }}>
              No answers found for &ldquo;{searchQuery}&rdquo;
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 20px' }}>
              Try searching with different keywords like &ldquo;WhatsApp&rdquo;, &ldquo;Form&rdquo;, or &ldquo;Payment&rdquo;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="btn btn-secondary btn-sm"
            >
              Clear Search Filter
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="glass-panel"
                  style={{
                    borderRadius: '16px',
                    border: isOpen ? '1px solid #00A651' : '1px solid var(--border-subtle)',
                    background: '#ffffff',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: isOpen ? '0 8px 24px rgba(0, 166, 81, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isOpen ? 'rgba(0, 166, 81, 0.03)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '15.5px',
                      gap: '16px',
                    }}
                  >
                    <span>{faq.question}</span>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isOpen ? 'rgba(0, 166, 81, 0.1)' : 'var(--bg-surface-elevated)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <ChevronDown
                        size={16}
                        color={isOpen ? '#00A651' : 'var(--text-muted)'}
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </div>
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: '0 24px 22px',
                        fontSize: '14.5px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.65,
                        borderTop: '1px solid rgba(0, 0, 0, 0.03)',
                        paddingTop: '14px',
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Still Have Questions Box */}
      <section style={{ padding: '0 24px 75px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #002244 0%, #003865 100%)',
            borderRadius: '24px',
            padding: '44px 40px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
            boxShadow: '0 16px 36px rgba(0, 34, 68, 0.22)',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#10b981',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              NEED PERSONAL ASSISTANCE?
            </span>
            <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 8px', color: '#ffffff' }}>
              Still have questions about your specific business?
            </h3>
            <p style={{ fontSize: '14.5px', color: '#93c5fd', margin: 0, maxWidth: '600px', lineHeight: 1.5 }}>
              Whether you are a real estate broker, manufacturing firm, or consulting agency, we are here to clarify your workflows.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              to="/pricing"
              className="btn btn-primary btn-lg"
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                borderColor: '#10b981',
                fontWeight: 700,
                fontSize: '14.5px',
                padding: '12px 26px',
                borderRadius: '10px',
              }}
            >
              View Pricing & Plans <ArrowRight size={16} />
            </Link>
            <Link
              to="/features"
              className="btn btn-secondary btn-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                fontWeight: 600,
                fontSize: '14.5px',
                padding: '12px 22px',
                borderRadius: '10px',
              }}
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* Standardized Global Footer */}
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

export default FAQPage;
