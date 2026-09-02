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

    console.log('🧹 [Clean Slate] Deleted all previous tenant data, leads, staff, and subscriptions.');

    // 2. Create ONLY Super Admin Account
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

    // 3. Complete Feature List (All plans have 100% same unlimited features)
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

    // 4. Create Subscription Plans (Identical Unlimited Features, Different Durations in Months & Prices)
    await Plan.create([
      {
        name: 'Pro Monthly Plan',
        durationMonths: 1,
        billingCycle: 'monthly',
        price: 1999,
        currency: 'INR',
        description: 'Complete unrestricted access to all CRM features, billed for 1 month with zero lock-in.',
        features: allUnlimitedFeatures,
        leadLimit: -1, // Unlimited Leads
        staffLimit: -1, // Unlimited Staff
        isActive: true,
        isPopular: false,
      },
      {
        name: 'Pro Annual Plan (12 Months)',
        durationMonths: 12,
        billingCycle: 'yearly',
        price: 17999,
        currency: 'INR',
        description: 'Complete unrestricted access for 12 months with 25% annual savings (2+ months free).',
        features: allUnlimitedFeatures,
        leadLimit: -1, // Unlimited Leads
        staffLimit: -1, // Unlimited Staff
        isActive: true,
        isPopular: true,
      },
    ]);

    console.log('💳 [Subscription Plans Initialized]: Pro Monthly (₹1,999/mo) & Pro Annual (₹17,999/yr) with 100% Unlimited Features');
    console.log('✨ [Ready] Database is ready for testing!');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error resetting database:', error);
    process.exit(1);
  }
};

seedDatabase();
