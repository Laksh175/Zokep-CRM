import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import LeadStatus from '../models/LeadStatus.js';
import CustomField from '../models/CustomField.js';
import Template from '../models/Template.js';
import Lead from '../models/Lead.js';
import ActivityLog from '../models/ActivityLog.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zokep_crm');
    console.log('[Seeder] Connected to MongoDB (127.0.0.1:27017)');

    // 1. Wipe ALL existing data across the database
    await User.deleteMany();
    await Plan.deleteMany();
    await Subscription.deleteMany();
    await LeadStatus.deleteMany();
    await CustomField.deleteMany();
    await Template.deleteMany();
    await Lead.deleteMany();
    await ActivityLog.deleteMany();

    console.log('🧹 [Clean Slate] Deleted all previous data.');

    // 2. Create Super Admin Account
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@zokepcrm.com',
      password: 'SuperAdmin@123',
      phone: '+91 9876543210',
      role: 'super_admin',
      companyName: 'Zokep Platform Inc.',
      isActive: true,
    });
    console.log('👑 [Super Admin Initialized]: superadmin@zokepcrm.com (Password: SuperAdmin@123)');

    // 3. Create Subscription Plans
    const allUnlimitedFeatures = [
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
    ];

    const proPlan = await Plan.create({
      name: 'Pro Monthly Plan',
      durationMonths: 1,
      billingCycle: 'monthly',
      price: 1999,
      currency: 'INR',
      description: 'Complete unrestricted access to all CRM features.',
      features: allUnlimitedFeatures,
      leadLimit: -1,
      staffLimit: -1,
      isActive: true,
      isPopular: true,
    });

    // 4. Create Demo Tenant Admin Account
    const tenantAdmin = new User({
      name: 'Skyline Realty Admin',
      email: 'realestate.admin@example.com',
      password: 'Admin@123',
      phone: '+91 9819000111',
      role: 'admin',
      companyName: 'Skyline Luxury Realty',
      businessType: 'Real Estate',
      isActive: true,
    });
    tenantAdmin.tenantId = tenantAdmin._id;
    await tenantAdmin.save();
    console.log('🏢 [Tenant Admin Created]: realestate.admin@example.com (Password: Admin@123)');

    // Active Subscription for Tenant
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    await Subscription.create({
      tenantId: tenantAdmin._id,
      planId: proPlan._id,
      status: 'active',
      startDate,
      endDate,
      amountPaid: 1999,
      paymentMethod: 'razorpay',
    });

    // 5. Create Staff Consultant
    const staffUser = await User.create({
      name: 'Rohit Sharma',
      email: 'rohit.sales@example.com',
      password: 'Staff@123',
      phone: '+91 9712022558',
      role: 'staff',
      tenantId: tenantAdmin._id,
      companyName: 'Skyline Luxury Realty',
      isActive: true,
    });
    console.log('👤 [Sales Staff Created]: rohit.sales@example.com (Password: Staff@123)');

    // 6. Create Default Lead Statuses for Tenant
    const defaultStatuses = [
      { name: 'New Lead', color: '#3b82f6', order: 1, isSystemDefault: true },
      { name: 'Follow-up Needed', color: '#f59e0b', order: 2 },
      { name: 'Demo / Pitch', color: '#8b5cf6', order: 3 },
      { name: 'Proposal Sent', color: '#06b6d4', order: 4 },
      { name: 'Won / Converted', color: '#10b981', order: 5, isConvertedState: true },
      { name: 'Lost / Closed', color: '#ef4444', order: 6, isLostState: true },
    ];

    const createdStatuses = [];
    for (const st of defaultStatuses) {
      const statusDoc = await LeadStatus.create({
        tenantId: tenantAdmin._id,
        ...st,
      });
      createdStatuses.push(statusDoc);
    }

    // 7. Create Sample Leads for Tenant
    await Lead.create([
      {
        tenantId: tenantAdmin._id,
        name: 'Manoj Patel',
        phone: '+917202255851',
        email: 'manoj@gmail.com',
        company: 'kurm',
        dealValue: 12000,
        source: 'website',
        priority: 'high',
        statusId: createdStatuses[0]._id, // New Lead
        assignedTo: staffUser._id,
        notes: 'Interested in 3BHK luxury apartment in city center.',
      },
      {
        tenantId: tenantAdmin._id,
        name: 'Ananya Sharma',
        phone: '+919820011223',
        email: 'ananya.s@techcorp.in',
        company: 'TechCorp Solutions',
        dealValue: 45000,
        source: 'social_media',
        priority: 'urgent',
        statusId: createdStatuses[1]._id, // Follow-up Needed
        assignedTo: staffUser._id,
        notes: 'Requested product walkthrough demo call.',
      },
      {
        tenantId: tenantAdmin._id,
        name: 'Vikram Malhotra',
        phone: '+919988776655',
        email: 'vikram@malhotraenterprises.com',
        company: 'Malhotra Enterprises',
        dealValue: 85000,
        source: 'referral',
        priority: 'medium',
        statusId: createdStatuses[4]._id, // Won / Converted
        assignedTo: staffUser._id,
        isConverted: true,
        convertedAt: new Date(),
        convertedDealAmount: 85000,
        notes: 'Deal closed successfully. Token amount received.',
      },
    ]);

    // 8. Create Default WhatsApp & Email Templates for Tenant
    await Template.create([
      {
        tenantId: tenantAdmin._id,
        type: 'whatsapp',
        title: 'Quick Welcome & Greeting',
        body: 'Hello {{lead_name}}, thank you for reaching out to {{company}}! We have received your inquiry. I am {{staff_name}} and I will be assisting you. When is a good time for a quick 5-min call?',
        isActive: true,
      },
      {
        tenantId: tenantAdmin._id,
        type: 'whatsapp',
        title: 'Follow-up on Proposal',
        body: 'Hi {{lead_name}}, just checking in regarding the quotation/details we shared yesterday. Do you have any questions or require any adjustments? - {{staff_name}}, {{company}}',
        isActive: true,
      },
      {
        tenantId: tenantAdmin._id,
        type: 'email',
        title: 'Official Product Brochure & Intro',
        subject: 'Thank you for your interest in {{company}}',
        body: '<p>Dear <strong>{{lead_name}}</strong>,</p><p>Thank you for expressing interest in our products and services at <strong>{{company}}</strong>.</p><p>We are dedicated to providing the best quality and solutions for your requirements. Please find our overview attached, or feel free to reply directly to this email to schedule a meeting.</p><p>Best regards,<br><strong>{{staff_name}}</strong><br>{{company}}</p>',
        isActive: true,
      },
    ]);

    console.log('✨ [Ready] Database seeded successfully with Super Admin, Tenant Admin, Staff, Templates, and sample Leads!');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error resetting database:', error);
    process.exit(1);
  }
};

seedDatabase();
