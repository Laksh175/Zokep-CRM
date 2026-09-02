import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import LeadStatus from '../models/LeadStatus.js';
import CustomField from '../models/CustomField.js';
import Template from '../models/Template.js';
import { sendAdminWelcomeEmail } from '../utils/mailer.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'zokep_crm_super_secure_jwt_secret_key_2026_dev', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Seed default settings for a newly created Tenant Admin
export const initializeTenantDefaults = async (tenantId, businessType = 'General') => {
  try {
    // 1. Create Default Lead Statuses
    let statuses = [];
    if (businessType === 'Real Estate') {
      statuses = [
        { name: 'New Inquiry', color: '#3b82f6', order: 1, isDefault: true },
        { name: 'Site Visit Scheduled', color: '#8b5cf6', order: 2 },
        { name: 'Site Visit Done', color: '#06b6d4', order: 3 },
        { name: 'Negotiation / Token', color: '#f59e0b', order: 4 },
        { name: 'Booking Confirmed (Won)', color: '#10b981', order: 5, isConvertedState: true },
        { name: 'Dropped / Not Interested', color: '#ef4444', order: 6, isLostState: true },
      ];
    } else if (businessType === 'Manufacturing') {
      statuses = [
        { name: 'RFQ Received', color: '#3b82f6', order: 1, isDefault: true },
        { name: 'Technical Review', color: '#8b5cf6', order: 2 },
        { name: 'Sample Sent', color: '#06b6d4', order: 3 },
        { name: 'Quotation Sent', color: '#f59e0b', order: 4 },
        { name: 'PO Received (Won)', color: '#10b981', order: 5, isConvertedState: true },
        { name: 'Rejected / Lost', color: '#ef4444', order: 6, isLostState: true },
      ];
    } else {
      statuses = [
        { name: 'New Lead', color: '#3b82f6', order: 1, isDefault: true },
        { name: 'Follow-up Needed', color: '#8b5cf6', order: 2 },
        { name: 'Demo / Pitch', color: '#06b6d4', order: 3 },
        { name: 'Proposal Sent', color: '#f59e0b', order: 4 },
        { name: 'Won / Converted', color: '#10b981', order: 5, isConvertedState: true },
        { name: 'Lost / Closed', color: '#ef4444', order: 6, isLostState: true },
      ];
    }

    for (const st of statuses) {
      await LeadStatus.create({ ...st, tenantId });
    }

    // 2. Create Default Custom Fields for industry if applicable
    if (businessType === 'Real Estate') {
      await CustomField.create([
        {
          tenantId,
          fieldLabel: 'Property Type',
          fieldName: 'property_type',
          fieldType: 'select',
          options: ['1 BHK', '2 BHK', '3 BHK', '4 BHK Luxury', 'Commercial Shop', 'Plot / Land'],
          isRequired: false,
          showInTable: true,
          order: 1,
        },
        {
          tenantId,
          fieldLabel: 'Preferred Location',
          fieldName: 'preferred_location',
          fieldType: 'text',
          isRequired: false,
          showInTable: true,
          order: 2,
        },
        {
          tenantId,
          fieldLabel: 'Budget Range',
          fieldName: 'budget_range',
          fieldType: 'select',
          options: ['Under 50 Lakhs', '50L - 1 Crore', '1Cr - 2.5 Crore', '2.5 Crore+'],
          isRequired: false,
          order: 3,
        },
      ]);
    } else if (businessType === 'Manufacturing') {
      await CustomField.create([
        {
          tenantId,
          fieldLabel: 'Required Quantity',
          fieldName: 'required_quantity',
          fieldType: 'number',
          isRequired: false,
          showInTable: true,
          order: 1,
        },
        {
          tenantId,
          fieldLabel: 'Product Category',
          fieldName: 'product_category',
          fieldType: 'select',
          options: ['Standard Raw Material', 'Custom Machined Parts', 'Finished Assembly', 'Packaging'],
          isRequired: false,
          showInTable: true,
          order: 2,
        },
      ]);
    }

    // 3. Create Default Message Templates (WhatsApp & Email)
    await Template.create([
      {
        tenantId,
        type: 'whatsapp',
        title: 'Quick Welcome & Greeting',
        body: 'Hello {{lead_name}}, thank you for reaching out to {{company}}! We have received your inquiry. I am {{staff_name}} and I will be assisting you. When is a good time for a quick 5-min call?',
      },
      {
        tenantId,
        type: 'whatsapp',
        title: 'Follow-up on Proposal',
        body: 'Hi {{lead_name}}, just checking in regarding the quotation/details we shared yesterday. Do you have any questions or require any adjustments? - {{staff_name}}, {{company}}',
      },
      {
        tenantId,
        type: 'email',
        title: 'Official Product Brochure & Intro',
        subject: 'Thank you for your interest in {{company}}',
        body: '<p>Dear <strong>{{lead_name}}</strong>,</p><p>Thank you for expressing interest in our products and services at <strong>{{company}}</strong>.</p><p>We are dedicated to providing the best quality and solutions for your requirements. Please find our overview attached, or feel free to reply directly to this email to schedule a meeting.</p><p>Best regards,<br><strong>{{staff_name}}</strong><br>{{company}}</p>',
      },
    ]);
  } catch (err) {
    console.error('Error initializing tenant defaults:', err);
  }
};

// @desc    Register new Admin (from Landing Page / Subscription Checkout)
// @route   POST /api/auth/register-admin
// @access  Public
export const registerAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      companyName,
      businessType,
      planId,
      billingCycle,
      paymentMethod = 'razorpay',
      paymentReference = '',
      razorpayOrderId = '',
      razorpayPaymentId = '',
      razorpaySignature = '',
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please login instead.',
      });
    }

    // Fetch Plan
    let plan = null;
    if (planId) {
      plan = await Plan.findById(planId);
    }
    if (!plan) {
      // Pick first active plan
      plan = await Plan.findOne({ isActive: true });
    }

    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription plan found. Please contact support.',
      });
    }

    // Create Admin User
    const rawPassword = password; // for email credentials
    const user = new User({
      name,
      email,
      password,
      phone,
      role: 'admin',
      companyName: companyName || `${name}'s Company`,
      businessType: businessType || 'General Sales',
      isActive: true,
      lastLogin: new Date(),
    });

    // Set self as tenantId
    user.tenantId = user._id;
    await user.save();

    // Calculate subscription period based on plan duration in months
    const months = Number(plan.durationMonths) || (plan.billingCycle === 'yearly' ? 12 : 1);
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    // Create Subscription
    const subscription = await Subscription.create({
      tenantId: user._id,
      planId: plan._id,
      status: 'active',
      startDate,
      endDate,
      amountPaid: plan.price || 0,
      currency: plan.currency || 'INR',
      paymentMethod,
      paymentReference: paymentReference || `SUB-${Date.now()}`,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      autoRenew: true,
    });

    // Initialize tenant defaults (Statuses, Custom fields, Templates)
    await initializeTenantDefaults(user._id, businessType);

    // Send welcome email with credentials in background
    sendAdminWelcomeEmail({
      to: user.email,
      name: user.name,
      email: user.email,
      password: rawPassword,
      companyName: user.companyName,
      planName: plan.name,
      loginUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`,
    }).catch((e) => console.log('Mailer async warning:', e.message));

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully and subscription activated!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        businessType: user.businessType,
        tenantId: user.tenantId,
      },
      subscription: {
        id: subscription._id,
        status: subscription.status,
        planName: plan.name,
        endDate: subscription.endDate,
      },
    });
  } catch (error) {
    console.error('Register Admin Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating account',
    });
  }
};

// @desc    Universal Login (Super Admin, Admin, Staff)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: user.deactivationReason
          ? `Your account is suspended: ${user.deactivationReason}`
          : 'Your account has been deactivated. Please contact support.',
        isDeactivated: true,
      });
    }

    // If staff, check if parent Admin is active
    if (user.role === 'staff' && user.tenantId) {
      const parentAdmin = await User.findById(user.tenantId);
      if (parentAdmin && !parentAdmin.isActive) {
        return res.status(403).json({
          success: false,
          message: 'The organization account associated with this login is currently suspended.',
          isDeactivated: true,
        });
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Fetch subscription details if Admin or Staff
    let subscriptionInfo = null;
    if (user.role !== 'super_admin') {
      const tenantId = user.role === 'admin' ? user._id : user.tenantId;
      const sub = await Subscription.findOne({ tenantId })
        .populate('planId', 'name billingCycle leadLimit staffLimit price')
        .sort({ endDate: -1 });

      if (sub) {
        const isExpired = new Date(sub.endDate) < new Date();
        subscriptionInfo = {
          id: sub._id,
          status: isExpired ? 'expired' : sub.status,
          plan: sub.planId,
          endDate: sub.endDate,
          isExpired,
        };
      }
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        companyName: user.companyName,
        businessType: user.businessType,
        tenantId: user.tenantId,
        avatar: user.avatar,
      },
      subscription: subscriptionInfo,
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server login error',
    });
  }
};

// @desc    Get Current Logged in User Profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let subscriptionInfo = null;

    if (user.role !== 'super_admin') {
      const tenantId = user.role === 'admin' ? user._id : user.tenantId;
      const sub = await Subscription.findOne({ tenantId })
        .populate('planId', 'name billingCycle leadLimit staffLimit price features')
        .sort({ endDate: -1 });

      if (sub) {
        const isExpired = new Date(sub.endDate) < new Date();
        subscriptionInfo = {
          id: sub._id,
          status: isExpired ? 'expired' : sub.status,
          plan: sub.planId,
          startDate: sub.startDate,
          endDate: sub.endDate,
          isExpired,
          amountPaid: sub.amountPaid,
          invoiceNumber: sub.invoiceNumber,
        };
      }
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        companyName: user.companyName,
        businessType: user.businessType,
        tenantId: user.tenantId,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      subscription: subscriptionInfo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, companyName, businessType } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (companyName && user.role === 'admin') user.companyName = companyName;
    if (businessType && user.role === 'admin') user.businessType = businessType;

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        companyName: user.companyName,
        businessType: user.businessType,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
