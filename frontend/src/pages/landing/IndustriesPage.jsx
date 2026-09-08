import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Building2, Factory, Briefcase, GraduationCap, Car, CheckCircle2, ArrowRight, Sparkles, MessageSquare, Mail, Sliders, FolderKanban, Globe, TrendingUp, Phone, Calendar, Users, Clock, DollarSign, UserCheck, ExternalLink, ShieldCheck, Zap, BarChart2, PieChart as PieIcon, Plus, LayoutDashboard, Settings, CreditCard, User, LogOut, ChevronRight, } from 'lucide-react';
import Navbar from '../../components/Navbar';

export const IndustriesPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  // Supported Industries data with 100% genuine Zokep CRM Admin Dashboard mockups
  const industries = [
    {
      id: 'real-estate',
      name: 'Real Estate & Builders',
      shortName: 'Real Estate',
      icon: Building2,
      accentColor: '#8b5cf6',
      badgeBg: 'rgba(139, 92, 246, 0.12)',
      tag: 'REAL ESTATE & INFRASTRUCTURE PRESET',
      tenantName: 'Skyline Luxury Infra & Builders',
      activePlan: 'Growth Active Plan',
      headline: 'From Property Inquiries to Site Visits & Token Bookings',
      description:
        'Never lose high-value property buyers in messy WhatsApp chats or spreadsheets. Zokep CRM automatically captures buyer inquiries from Meta Ads, 99acres & Magicbricks, organizes site visits, and equips sales agents with 1-click WhatsApp location dispatch.',
      stages: [
        { name: 'Inquiry Inbound', color: '#3b82f6', count: 48, pct: '32%' },
        { name: 'Site Visit Scheduled', color: '#8b5cf6', count: 28, pct: '19%' },
        { name: 'Site Visit Completed', color: '#f59e0b', count: 18, pct: '12%' },
        { name: 'Token Received', color: '#06b6d4', count: 8, pct: '5%' },
        { name: 'Agreement Signed', color: '#10b981', count: 6, pct: '4%' },
      ],
      adminStats: {
        totalLeads: '148',
        unassigned: '4 unassigned leads',
        followUps: '24',
        overdue: '2 overdue site visits',
        pipelineValue: '₹14.85 Cr',
        pipelineSub: '18 high-intent buyer inquiries',
        wonRevenue: '₹4.20 Cr',
        wonSub: '6 property units token booked',
        teamMembers: '6',
        conversionRate: '28.4% overall conversion rate',
      },
      leadSources: [
        { channel: 'Meta & 99acres Portal Ads', pct: 46, count: '68 Leads', color: '#3b82f6' },
        { channel: '1-Click WhatsApp Inquiries', pct: 32, count: '47 Leads', color: '#00a651' },
        { channel: 'Website Embed Forms', pct: 15, count: '22 Leads', color: '#8b5cf6' },
        { channel: 'Walk-in & Investor Referrals', pct: 7, count: '11 Leads', color: '#f59e0b' },
      ],
      leaderboard: [
        { name: 'Rohit Verma', assigned: 48, converted: 16, winRate: '33.3%', dealValue: '₹1.85 Cr' },
        { name: 'Neha Singh', assigned: 38, converted: 12, winRate: '31.5%', dealValue: '₹1.40 Cr' },
        { name: 'Aman Saxena', assigned: 28, converted: 8, winRate: '28.5%', dealValue: '₹95 Lakhs' },
      ],
      upcomingFollowups: [
        { title: 'Site visit for 3BHK Penthouse', client: 'Amitabh Sen (+91 98201 44552)', time: 'Today, 3:30 PM', badge: 'High Priority', color: '#e11d48' },
        { title: 'Token receipt balance follow-up', client: 'Pooja Agarwal (+91 98451 22890)', time: 'Tomorrow, 11:00 AM', badge: 'Closing Stage', color: '#10b981' },
        { title: 'Agreement draft review with legal', client: 'Rajesh Nair (+91 97110 33499)', time: 'Friday, 2:00 PM', badge: 'Documentation', color: '#8b5cf6' },
      ],
      customFields: [
        { label: 'Property Type', type: 'Dropdown', value: '2 BHK, 3 BHK Luxury, Penthouse, Villa' },
        { label: 'Budget Range', type: 'Number', value: '₹75 Lakhs - ₹2.5 Crore' },
        { label: 'Preferred Location', type: 'Text', value: 'Indiranagar, Whitefield, HSR Layout' },
        { label: 'Possession Timeline', type: 'Dropdown', value: 'Ready to Move / Under Construction' },
      ],
      sampleLead: {
        name: 'Amitabh Sen',
        company: 'Skyline Luxury Realty',
        phone: '+91 98201 44552',
        dealValue: '₹1.85 Cr',
        details: 'Looking for: 3 BHK Luxury • Indiranagar • East Facing • Ready to Move',
        badge: 'Site Visit Scheduled',
        badgeColor: '#8b5cf6',
        actionLabel: '1-Click WhatsApp Site Visit Pin',
      },
      highlights: [
        '1-Click WhatsApp Location Sharing: Send Google Maps pins and project brochures in 3 seconds.',
        'Site Visit Calendar: Schedule and assign consultants with automated overdue reminders.',
        'Buyer Budget Brackets: Filter and match buyers instantly when new inventory opens up.',
      ],
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing & B2B',
      shortName: 'Manufacturing',
      icon: Factory,
      accentColor: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      tag: 'MANUFACTURING & INDUSTRIAL B2B PRESET',
      tenantName: 'Apex Industrial Precision Works Ltd',
      activePlan: 'Enterprise Active Plan',
      headline: 'Streamline RFQs, Technical Reviews, Samples & Purchase Orders',
      description:
        'Industrial sales involve complex specs, tonnage requirements, and multiple stakeholder reviews. Zokep CRM tracks custom technical parameters, sample dispatch logistics, and triggers formal PDF quotations with Nodemailer.',
      stages: [
        { name: 'RFQ Received', color: '#3b82f6', count: 34, pct: '38%' },
        { name: 'Technical Review', color: '#8b5cf6', count: 18, pct: '20%' },
        { name: 'Sample Dispatched', color: '#f59e0b', count: 12, pct: '13%' },
        { name: 'Quotation Sent', color: '#06b6d4', count: 14, pct: '15%' },
        { name: 'PO Approved', color: '#10b981', count: 8, pct: '9%' },
      ],
      adminStats: {
        totalLeads: '86',
        unassigned: '2 pending RFQs',
        followUps: '18',
        overdue: '1 sample transit delay',
        pipelineValue: '₹92.50 Lakhs',
        pipelineSub: '12 corporate manufacturing RFQs',
        wonRevenue: '₹38.20 Lakhs',
        wonSub: '8 Purchase Orders confirmed',
        teamMembers: '4',
        conversionRate: '31.2% overall conversion rate',
      },
      leadSources: [
        { channel: 'Direct RFQ Inbound & Indiamart', pct: 52, count: '45 RFQs', color: '#3b82f6' },
        { channel: 'WhatsApp Specification Enquiries', pct: 28, count: '24 RFQs', color: '#00a651' },
        { channel: 'Website Technical Forms', pct: 14, count: '12 RFQs', color: '#f59e0b' },
        { channel: 'Distributor Network', pct: 6, count: '5 RFQs', color: '#8b5cf6' },
      ],
      leaderboard: [
        { name: 'Vikram Joshi', assigned: 34, converted: 12, winRate: '35.2%', dealValue: '₹22.4 Lakhs' },
        { name: 'Rohit Verma', assigned: 28, converted: 8, winRate: '28.5%', dealValue: '₹14.2 Lakhs' },
        { name: 'Kunal Mehra', assigned: 18, converted: 5, winRate: '27.7%', dealValue: '₹8.5 Lakhs' },
      ],
      upcomingFollowups: [
        { title: 'Send revised CNC Turned specs', client: 'Precision Auto (+91 99887 66550)', time: 'Today, 2:00 PM', badge: 'Technical Specs', color: '#f59e0b' },
        { title: 'Sample batch dispatch verification', client: 'Bharat Hydraulics (+91 98220 11944)', time: 'Tomorrow, 10:30 AM', badge: 'BlueDart Tracking', color: '#06b6d4' },
        { title: 'PO delivery schedule sign-off', client: 'Kirloskar Ancillary (+91 98190 77610)', time: 'Thursday, 4:00 PM', badge: 'PO Closing', color: '#10b981' },
      ],
      customFields: [
        { label: 'Required Quantity', type: 'Number', value: '5,000 Units / 25 Metric Tons' },
        { label: 'Material Grade', type: 'Dropdown', value: 'Stainless Steel 316 / Al-6061' },
        { label: 'Delivery Deadline', type: 'Date', value: 'Within 45 Days of PO' },
        { label: 'Client GSTIN', type: 'Text', value: '27AABCP1234F1Z8' },
      ],
      sampleLead: {
        name: 'Precision Auto Components',
        company: 'Apex Manufacturing Hub',
        phone: '+91 99887 66550',
        dealValue: '₹8.50 Lakhs',
        details: 'Qty: 5,000 Units • Custom CNC Turned Parts • Material: SS 316',
        badge: 'Sample Dispatched',
        badgeColor: '#f59e0b',
        actionLabel: 'Send PDF Quotation via Nodemailer',
      },
      highlights: [
        'Dynamic Technical Specs: Capture exact machine dimensions, grades, and tolerances.',
        'Sample Logistics Tracker: Track tracking numbers and dispatch dates directly on the lead card.',
        'Bulk Lead CSV Import: Migrate vendor directories and distributor contacts with smart column mapping.',
      ],
    },
    {
      id: 'agencies',
      name: 'Agencies & IT Services',
      shortName: 'Agencies & IT',
      icon: Briefcase,
      accentColor: '#00a651',
      badgeBg: 'rgba(0, 166, 81, 0.12)',
      tag: 'DIGITAL AGENCIES & IT CONSULTING PRESET',
      tenantName: 'Vanguard Digital & Cloud Solutions',
      activePlan: 'Growth Active Plan',
      headline: 'Lead Qualification to Discovery Calls, SOWs & Retainers',
      description:
        'Whether you sell web development, performance marketing, or enterprise software, Zokep CRM ensures inbound inquiries from your website and ads are immediately assigned to account executives with custom project scope tracking.',
      stages: [
        { name: 'Lead Inbound', color: '#3b82f6', count: 32, pct: '36%' },
        { name: 'Discovery Call', color: '#8b5cf6', count: 16, pct: '18%' },
        { name: 'Proposal / SOW Sent', color: '#f59e0b', count: 12, pct: '14%' },
        { name: 'Contract Negotiation', color: '#06b6d4', count: 6, pct: '7%' },
        { name: 'Retainer Won', color: '#10b981', count: 10, pct: '11%' },
      ],
      adminStats: {
        totalLeads: '76',
        unassigned: '3 new website leads',
        followUps: '16',
        overdue: '0 overdue tasks',
        pipelineValue: '₹34.50 L/Mo',
        pipelineSub: '14 active retainers & projects',
        wonRevenue: '₹18.20 Lakhs',
        wonSub: '10 new client SOWs signed',
        teamMembers: '5',
        conversionRate: '34.8% overall conversion rate',
      },
      leadSources: [
        { channel: 'Meta & Google Ad Inquiries', pct: 48, count: '36 Inquiries', color: '#3b82f6' },
        { channel: 'WhatsApp Direct Consults', pct: 26, count: '20 Inquiries', color: '#00a651' },
        { channel: 'Agency Landing Page iFrame', pct: 18, count: '14 Inquiries', color: '#8b5cf6' },
        { channel: 'Client Word-of-Mouth', pct: 8, count: '6 Inquiries', color: '#f59e0b' },
      ],
      leaderboard: [
        { name: 'Rohit Verma', assigned: 32, converted: 12, winRate: '37.5%', dealValue: '₹8.4 Lakhs' },
        { name: 'Aman Saxena', assigned: 26, converted: 8, winRate: '30.7%', dealValue: '₹5.6 Lakhs' },
        { name: 'Priya Iyer', assigned: 18, converted: 5, winRate: '27.7%', dealValue: '₹4.2 Lakhs' },
      ],
      upcomingFollowups: [
        { title: 'Discovery call for FinTech App', client: 'FinTech Mobile App (+91 97120 11998)', time: 'Today, 4:00 PM', badge: 'Zoom Call', color: '#8b5cf6' },
        { title: 'Deliver Meta Ads CPA audit deck', client: 'HealthTech D2C (+91 98114 66720)', time: 'Tomorrow, 12:00 PM', badge: 'Audit Deck', color: '#00a651' },
        { title: 'SOW signature and kickoff prep', client: 'EdTech Portal (+91 98402 88190)', time: 'Monday, 11:00 AM', badge: 'Contract', color: '#10b981' },
      ],
      customFields: [
        { label: 'Service Scope', type: 'Dropdown', value: 'Full Stack App, UI/UX, Meta Ads, SEO' },
        { label: 'Monthly Ad Spend', type: 'Number', value: '₹1.5 Lakhs - ₹5.0 Lakhs / Month' },
        { label: 'Target Launch Date', type: 'Date', value: 'Q4 Product Launch (Nov 2026)' },
        { label: 'Tech Stack', type: 'Text', value: 'React, Node.js, AWS Cloud' },
      ],
      sampleLead: {
        name: 'FinTech Mobile App Project',
        company: 'Vanguard Digital Lab',
        phone: '+91 97120 11998',
        dealValue: '₹4.20 Lakhs',
        details: 'Retainer: 6 Months • Needs Full Stack + UI/UX Design System',
        badge: 'Proposal Sent',
        badgeColor: '#00a651',
        actionLabel: '1-Click WhatsApp Follow-up (wa.me)',
      },
      highlights: [
        'Website iFrame Embed: Paste your CRM lead form directly into your agency landing page.',
        'Sales Leaderboard: Monitor which account executive is closing the highest retainer volume.',
        'Dynamic Scope Builder: Adjust questions based on whether the lead wants design, dev, or ads.',
      ],
    },
    {
      id: 'education',
      name: 'Education & Coaching',
      shortName: 'Education',
      icon: GraduationCap,
      accentColor: '#0284c7',
      badgeBg: 'rgba(2, 132, 199, 0.12)',
      tag: 'EDUCATION & EDTECH INSTITUTES PRESET',
      tenantName: 'NextGen Academy & Training Hub',
      activePlan: 'Growth Active Plan',
      headline: 'Student Admissions, Counseling Sessions & Batch Enrollment',
      description:
        'Handle high-volume student inquiries during admission seasons effortlessly. Track prospective students, schedule demo classes, send course brochures on WhatsApp, and manage seat confirmations without losing track.',
      stages: [
        { name: 'Inquiry Received', color: '#3b82f6', count: 85, pct: '40%' },
        { name: 'Counseling Scheduled', color: '#8b5cf6', count: 42, pct: '20%' },
        { name: 'Demo Class Attended', color: '#f59e0b', count: 32, pct: '15%' },
        { name: 'Seat Reserved', color: '#06b6d4', count: 24, pct: '11%' },
        { name: 'Admission Confirmed', color: '#10b981', count: 28, pct: '13%' },
      ],
      adminStats: {
        totalLeads: '211',
        unassigned: '6 unassigned student inquiries',
        followUps: '48',
        overdue: '3 demo class follow-ups',
        pipelineValue: '₹24.80 Lakhs',
        pipelineSub: 'Cohort Batch #12 intake drive',
        wonRevenue: '₹14.60 Lakhs',
        wonSub: '28 admissions successfully confirmed',
        teamMembers: '8',
        conversionRate: '29.5% overall conversion rate',
      },
      leadSources: [
        { channel: 'Instagram & YouTube Ad Drives', pct: 54, count: '114 Students', color: '#3b82f6' },
        { channel: 'WhatsApp Syllabus Downloads', pct: 28, count: '59 Students', color: '#00a651' },
        { channel: 'Website Admission Form', pct: 12, count: '25 Students', color: '#0284c7' },
        { channel: 'Student Alumni Referrals', pct: 6, count: '13 Students', color: '#8b5cf6' },
      ],
      leaderboard: [
        { name: 'Pooja Iyer', assigned: 64, converted: 22, winRate: '34.3%', dealValue: '₹8.8 Lakhs' },
        { name: 'Rohit Verma', assigned: 52, converted: 16, winRate: '30.7%', dealValue: '₹6.4 Lakhs' },
        { name: 'Sanjay Dutt', assigned: 42, converted: 11, winRate: '26.1%', dealValue: '₹4.4 Lakhs' },
      ],
      upcomingFollowups: [
        { title: 'Zoom Data Science demo session link', client: 'Rohan Verma (+91 98450 12345)', time: 'Today, 5:00 PM', badge: 'Demo Session', color: '#0284c7' },
        { title: 'Seat reservation fee verification', client: 'Ananya Deshmukh (+91 98233 44109)', time: 'Tomorrow, 10:00 AM', badge: 'Seat Token', color: '#06b6d4' },
        { title: 'LMS credentials & batch onboarding', client: 'Kavita Sundaram (+91 98840 55192)', time: 'Saturday, 11:30 AM', badge: 'Onboarding', color: '#10b981' },
      ],
      customFields: [
        { label: 'Target Course', type: 'Dropdown', value: 'Full Stack Web Dev, Data Science, AI/ML' },
        { label: 'Current Qualification', type: 'Dropdown', value: 'Final Year B.Tech, Graduate, Working Pro' },
        { label: 'Preferred Batch', type: 'Radio', value: 'Weekend Fast-track / Weekday Evening' },
        { label: 'Guardian Phone', type: 'Text', value: '+91 98765 43210' },
      ],
      sampleLead: {
        name: 'Rohan Verma',
        company: 'NextGen Academy',
        phone: '+91 98450 12345',
        dealValue: '₹65,000',
        details: 'Course: Data Science Masterclass • Weekend Batch • Needs EMI Option',
        badge: 'Demo Class Attended',
        badgeColor: '#0284c7',
        actionLabel: '1-Click WhatsApp Zoom Demo Link',
      },
      highlights: [
        'Batch Timing Selectors: Organize students into upcoming cohorts with zero manual sorting.',
        'Automated Nodemailer Credentials: Send student LMS login credentials upon enrollment.',
        '1-Click WhatsApp Syllabus: Dispatch course PDFs and demo class links in 1 tap.',
      ],
    },
    {
      id: 'automobile',
      name: 'Automobile Dealerships',
      shortName: 'Automobile',
      icon: Car,
      accentColor: '#e11d48',
      badgeBg: 'rgba(225, 29, 72, 0.12)',
      tag: 'AUTOMOBILE & HIGH-TICKET RETAIL PRESET',
      tenantName: 'Metro Wheels Motors & EV Dealership',
      activePlan: 'Growth Active Plan',
      headline: 'Test Drives, Car Valuation, Financing & Booking Deliveries',
      description:
        'Car buyers research for weeks before committing. Zokep CRM empowers sales consultants to log test drive feedback, evaluate used car exchange values, track loan approvals, and close vehicle bookings faster.',
      stages: [
        { name: 'Showroom / Web Inquiry', color: '#3b82f6', count: 42, pct: '36%' },
        { name: 'Test Drive Booked', color: '#8b5cf6', count: 24, pct: '21%' },
        { name: 'Exchange Valuation Done', color: '#f59e0b', count: 16, pct: '14%' },
        { name: 'Loan Approved', color: '#06b6d4', count: 12, pct: '10%' },
        { name: 'Vehicle Delivered', color: '#10b981', count: 9, pct: '8%' },
      ],
      adminStats: {
        totalLeads: '103',
        unassigned: '2 walk-in inquiries',
        followUps: '28',
        overdue: '1 pending valuation report',
        pipelineValue: '₹2.10 Cr',
        pipelineSub: '14 vehicle booking deals in progress',
        wonRevenue: '₹68.50 Lakhs',
        wonSub: '9 new car deliveries completed',
        teamMembers: '7',
        conversionRate: '27.4% overall conversion rate',
      },
      leadSources: [
        { channel: 'Meta Ads & Showroom Walk-in', pct: 50, count: '52 Inquiries', color: '#3b82f6' },
        { channel: 'WhatsApp Test Drive Bookings', pct: 30, count: '31 Inquiries', color: '#00a651' },
        { channel: 'CarWale & Website Portal', pct: 14, count: '14 Inquiries', color: '#e11d48' },
        { channel: 'Used Car Exchange Leads', pct: 6, count: '6 Inquiries', color: '#f59e0b' },
      ],
      leaderboard: [
        { name: 'Rohit Verma', assigned: 38, converted: 12, winRate: '31.5%', dealValue: '₹28.4 Lakhs' },
        { name: 'Karan Mehra', assigned: 32, converted: 9, winRate: '28.1%', dealValue: '₹22.5 Lakhs' },
        { name: 'Sunil Sharma', assigned: 24, converted: 6, winRate: '25.0%', dealValue: '₹14.2 Lakhs' },
      ],
      upcomingFollowups: [
        { title: 'Home Test drive for Nexon EV', client: 'Priya Nair (+91 97223 88120)', time: 'Today, 4:30 PM', badge: 'Test Drive', color: '#8b5cf6' },
        { title: 'HDFC Car loan sanction letter review', client: 'Manish Rawat (+91 98100 22390)', time: 'Tomorrow, 11:00 AM', badge: 'Bank Loan', color: '#06b6d4' },
        { title: 'Showroom delivery ceremonial prep', client: 'Sunil Chhabra (+91 98722 99401)', time: 'Friday, 3:00 PM', badge: 'Car Delivery', color: '#10b981' },
      ],
      customFields: [
        { label: 'Vehicle Model & Trim', type: 'Dropdown', value: 'SUV Top Model, Sedan Petrol, EV Luxury' },
        { label: 'Fuel Preference', type: 'Radio', value: 'Electric (EV) / Hybrid / Petrol' },
        { label: 'Old Car Exchange', type: 'Checkbox', value: 'Yes (2019 Swift ZXI - 42,000 KM)' },
        { label: 'Down Payment Amount', type: 'Number', value: '₹3,50,000 Planned' },
      ],
      sampleLead: {
        name: 'Priya Nair',
        company: 'Metro Wheels Auto Hub',
        phone: '+91 97223 88120',
        dealValue: '₹16.80 Lakhs',
        details: 'Model: Nexon EV Empowered+ • Exchange: 2019 Swift • Test Drive Saturday 11 AM',
        badge: 'Test Drive Booked',
        badgeColor: '#e11d48',
        actionLabel: 'Send Proforma Quotation (Email)',
      },
      highlights: [
        'Used Car Exchange Valuation: Record inspection notes and estimated buy-back value.',
        'Bank Finance Stage Tracking: Log loan sanction letter status and disbursement milestones.',
        'Test Drive Reminder SMS/WhatsApp: Automated alerts so potential buyers never miss their slot.',
      ],
    },
  ];

  // Match the active industry based on URL slug e.g. /industries/real-estate
  const currentSlug = slug || 'real-estate';
  const activeIndustry = industries.find((i) => i.id === currentSlug) || industries[0];
  const ActiveIcon = activeIndustry.icon;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Navbar />

      {/* Hero Header Tailored to This Specific Industry */}
      <section style={{ position: 'relative', padding: '65px 24px 45px', textAlign: 'center', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '640px',
            height: '640px',
            background: `radial-gradient(circle, ${activeIndustry.accentColor}25 0%, rgba(0, 56, 101, 0.08) 50%, transparent 70%)`,
            filter: 'blur(70px)',
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
              padding: '6px 16px',
              borderRadius: '9999px',
              background: activeIndustry.badgeBg,
              border: `1px solid ${activeIndustry.accentColor}35`,
              fontSize: '13px',
              fontWeight: 700,
              color: activeIndustry.accentColor,
              marginBottom: '20px',
            }}
          >
            <ActiveIcon size={16} />
            <span>{activeIndustry.tag}</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(34px, 5vw, 54px)',
              fontWeight: 800,
              lineHeight: 1.18,
              letterSpacing: '-1.2px',
              marginBottom: '18px',
            }}
          >
            {activeIndustry.name} CRM Workspace. <br />
            <span style={{ color: activeIndustry.accentColor }}>{activeIndustry.headline}</span>
          </h1>

          <p
            style={{
              fontSize: '17px',
              color: 'var(--text-secondary)',
              maxWidth: '760px',
              margin: '0 auto 30px',
              lineHeight: 1.6,
            }}
          >
            {activeIndustry.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a href="/#pricing" className="btn btn-primary btn-lg" style={{ fontSize: '15px' }}>
              Start Free Trial for {activeIndustry.shortName} <ArrowRight size={17} />
            </a>
            <Link to="/login" className="btn btn-secondary btn-lg" style={{ fontSize: '15px' }}>
              Explore Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* 100% REAL ZOKEP CRM TENANT ADMIN DASHBOARD SHOWCASE (MATCHES EXACT SYSTEM) */}
      <section style={{ padding: '0 24px 60px', maxWidth: '1280px', margin: '0 auto' }}>
        {/* Dashboard Frame Container with Mac Window Header */}
        <div
          style={{
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid var(--border-medium)',
            boxShadow: '0 24px 50px -12px rgba(0, 34, 68, 0.16)',
            backgroundColor: '#ffffff',
          }} >
          {/* Top Window Chrome Bar */}
          <div
            style={{
              background: 'linear-gradient(90deg, #001f3f 0%, #003865 100%)',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#ffffff',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.02em' }}>
                  ZOKEP CRM
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>•</span>
                <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
                  Tenant Admin Portal ({activeIndustry.tenantName})
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.15)',
                  padding: '3px 10px',
                  borderRadius: '20px',
                }}
              >
                LIVE WORKSPACE PREVIEW
              </span>
            </div>
          </div>

          {/* Actual Ultra-High-Def Dashboard Screenshot Matching Real Zokep CRM */}
          <div style={{ backgroundColor: '#ffffff', padding: 0, overflow: 'hidden' }}>
            <img
              src={`/images/dashboards/${activeIndustry.id}.png`}
              alt={`${activeIndustry.name} Zokep CRM Admin Dashboard`}
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </div>
        </div>
      </section>

      {/* Dynamic Fields & 1-Click WhatsApp Lead Card Section */}
      <section style={{ padding: '0 24px 65px', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
          {/* Left: Dynamic Fields for this industry */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={19} color={activeIndustry.accentColor} />
              Dynamic Form Fields (No-Code Builder):
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Zokep CRM adapts directly to {activeIndustry.shortName}. Add custom questions, make them required, or reorder them in 1-click:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {activeIndustry.customFields.map((cf, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '13px' }}>{cf.label}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {cf.value}
                    </div>
                  </div>
                  <span className="badge" style={{ backgroundColor: 'rgba(0, 56, 101, 0.08)', color: 'var(--primary-500)', fontSize: '11px' }}>
                    {cf.type}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeIndustry.highlights.map((hl, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live Sample Lead Card with 1-Click WhatsApp */}
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: '18px',
              padding: '32px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: activeIndustry.accentColor }} />
                <strong style={{ fontSize: '15px' }}>Sample {activeIndustry.shortName} Lead Card</strong>
              </div>
              <span className="badge" style={{ backgroundColor: `${activeIndustry.sampleLead.badgeColor}20`, color: activeIndustry.sampleLead.badgeColor, fontWeight: 700 }}>
                {activeIndustry.sampleLead.badge}
              </span>
            </div>

            {/* Lead Details Box */}
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-subtle)', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 2px', color: 'var(--text-primary)' }}>
                    {activeIndustry.sampleLead.name}
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {activeIndustry.sampleLead.company} • {activeIndustry.sampleLead.phone}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>ESTIMATED DEAL</span>
                  <strong style={{ fontSize: '16px', color: 'var(--accent-green)' }}>
                    {activeIndustry.sampleLead.dealValue}
                  </strong>
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
                {activeIndustry.sampleLead.details}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div
                  className="btn btn-whatsapp btn-sm"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    fontSize: '12px',
                    cursor: 'default',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  <MessageSquare size={13} /> {activeIndustry.sampleLead.actionLabel}
                </div>
                <div
                  className="btn btn-secondary btn-sm"
                  style={{
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'default',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  <Mail size={13} />
                </div>
              </div>
            </div>

            {/* Public Form Embed Snippet Callout */}
            <div style={{ background: '#002244', color: '#93c5fd', borderRadius: '10px', padding: '14px 16px', fontSize: '12px', fontFamily: 'monospace', marginBottom: '16px' }}>
              {`<iframe src="https://zokepcrm.com/f/${activeIndustry.id}" width="100%" height="480px"></iframe>`}
            </div>

            <a href="/#pricing" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Deploy {activeIndustry.shortName} CRM Now <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Switch to Another Industry Footer Strip */}
      <section style={{ padding: '30px 24px 70px', maxWidth: '1240px', margin: '0 auto' }}>
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
          }}
        >
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              LOOKING FOR ANOTHER VERTICAL?
            </span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0', color: '#ffffff', letterSpacing: '-0.02em' }}>
              Explore other pre-configured industry workflows:
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
              {industries
                .filter((ind) => ind.id !== activeIndustry.id)
                .map((ind) => (
                  <Link
                    key={ind.id}
                    to={`/industries/${ind.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'background 0.15s ease',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <span>{ind.name}</span>
                    <ChevronRight size={13} />
                  </Link>
                ))}
            </div>
          </div>

          <div>
            <a href="/#pricing" className="btn btn-primary btn-lg" style={{ fontSize: '15px' }}>
              View Subscription Pricing <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '40px 24px', background: 'var(--bg-surface)' }}>
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

export default IndustriesPage;
