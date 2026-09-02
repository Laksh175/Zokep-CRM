import User from '../models/User.js';
import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import Lead from '../models/Lead.js';

// @desc    Get Super Admin Platform Dashboard Metrics & Analytics
// @route   GET /api/superadmin/analytics
// @access  Private (Super Admin)
export const getPlatformAnalytics = async (req, res) => {
  try {
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true });
    const suspendedAdmins = await User.countDocuments({ role: 'admin', isActive: false });
    const totalStaff = await User.countDocuments({ role: 'staff' });
    const totalLeads = await Lead.countDocuments();
    const convertedLeads = await Lead.countDocuments({ isConverted: true });

    // Subscriptions count
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const activeSubscriptions = await Subscription.countDocuments({
      status: 'active',
      endDate: { $gte: now },
    });

    const expiredSubscriptions = await Subscription.countDocuments({
      $or: [{ status: 'expired' }, { endDate: { $lt: now } }],
    });

    const expiringSoonSubscriptions = await Subscription.countDocuments({
      status: 'active',
      endDate: { $gte: now, $lte: sevenDaysFromNow },
    });

    // Revenue calculation
    const allSubscriptions = await Subscription.find().sort({ createdAt: -1 });
    const totalRevenue = allSubscriptions.reduce((acc, sub) => acc + (sub.amountPaid || 0), 0);

    // Recent 30 days revenue
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const mrrRevenue = allSubscriptions
      .filter((s) => new Date(s.createdAt) >= thirtyDaysAgo)
      .reduce((acc, sub) => acc + (sub.amountPaid || 0), 0);

    // Recent Subscriptions table
    const recentSubscriptions = await Subscription.find()
      .populate('tenantId', 'name email companyName phone')
      .populate('planId', 'name billingCycle price')
      .sort({ createdAt: -1 })
      .limit(10);

    // Expired tenants list with details
    const expiredTenantSubs = await Subscription.find({
      $or: [{ status: 'expired' }, { endDate: { $lt: now } }],
    })
      .populate('tenantId', 'name email companyName phone isActive')
      .populate('planId', 'name billingCycle price')
      .sort({ endDate: -1 })
      .limit(20);

    return res.json({
      success: true,
      data: {
        totalRevenue,
        mrrRevenue,
        totalAdmins,
        activeAdmins,
        suspendedAdmins,
        totalStaff,
        totalLeads,
        conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0,
        activeSubscriptions,
        expiredSubscriptions,
        expiringSoonSubscriptions,
        recentSubscriptions,
        expiredTenantSubs,
      },
    });
  } catch (error) {
    console.error('Super Admin Analytics Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Tenant Admins with Search, Filter & Subscription state
// @route   GET /api/superadmin/admins
// @access  Private (Super Admin)
export const getAllAdmins = async (req, res) => {
  try {
    const { search, status, subStatus, page = 1, limit = 50 } = req.query;

    const query = { role: 'admin' };

    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const admins = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    // Enrich each admin with their current subscription, staff count, and lead count
    const enrichedAdmins = await Promise.all(
      admins.map(async (admin) => {
        const latestSub = await Subscription.findOne({ tenantId: admin._id })
          .populate('planId', 'name billingCycle price leadLimit staffLimit')
          .sort({ endDate: -1 });

        const staffCount = await User.countDocuments({ tenantId: admin._id, role: 'staff' });
        const leadCount = await Lead.countDocuments({ tenantId: admin._id });

        const now = new Date();
        const isExpired = latestSub ? new Date(latestSub.endDate) < now : true;

        return {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          companyName: admin.companyName,
          businessType: admin.businessType,
          isActive: admin.isActive,
          deactivationReason: admin.deactivationReason,
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt,
          staffCount,
          leadCount,
          subscription: latestSub
            ? {
                id: latestSub._id,
                planName: latestSub.planId?.name || 'Standard',
                billingCycle: latestSub.planId?.billingCycle || 'monthly',
                price: latestSub.amountPaid,
                startDate: latestSub.startDate,
                endDate: latestSub.endDate,
                status: isExpired ? 'expired' : latestSub.status,
                isExpired,
              }
            : null,
        };
      })
    );

    // If filtered by subscription status
    let filteredResults = enrichedAdmins;
    if (subStatus === 'active') {
      filteredResults = enrichedAdmins.filter((a) => a.subscription && !a.subscription.isExpired);
    } else if (subStatus === 'expired') {
      filteredResults = enrichedAdmins.filter((a) => !a.subscription || a.subscription.isExpired);
    }

    return res.json({
      success: true,
      total,
      data: filteredResults,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Tenant Admin Account Activation / Deactivation with reason
// @route   PUT /api/superadmin/admins/:id/toggle-status
// @access  Private (Super Admin)
export const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, deactivationReason } = req.body;

    const admin = await User.findById(id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Tenant Admin not found' });
    }

    admin.isActive = isActive;
    admin.deactivationReason = isActive ? '' : (deactivationReason || 'Account suspended by platform Super Admin.');
    await admin.save();

    return res.json({
      success: true,
      message: `Tenant account ${isActive ? 'activated' : 'suspended'} successfully.`,
      data: {
        id: admin._id,
        isActive: admin.isActive,
        deactivationReason: admin.deactivationReason,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Manually extend a Tenant's subscription (grace period/trial extension)
// @route   POST /api/superadmin/admins/:id/extend-subscription
// @access  Private (Super Admin)
export const extendSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30, note = 'Admin manual extension' } = req.body;

    const sub = await Subscription.findOne({ tenantId: id }).sort({ endDate: -1 });
    if (!sub) {
      return res.status(404).json({ success: false, message: 'No subscription found for this tenant.' });
    }

    const currentEnd = new Date(sub.endDate) > new Date() ? new Date(sub.endDate) : new Date();
    const newEnd = new Date(currentEnd.getTime() + Number(days) * 24 * 60 * 60 * 1000);

    sub.endDate = newEnd;
    sub.status = 'active';
    await sub.save();

    return res.json({
      success: true,
      message: `Subscription extended by ${days} days until ${newEnd.toLocaleDateString()}.`,
      data: sub,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------- PLAN MANAGEMENT -----------------

// @desc    Get all Plans (Public & Super Admin)
// @route   GET /api/superadmin/plans
// @access  Public / Super Admin
export const getPlans = async (req, res) => {
  try {
    const query = req.user?.role === 'super_admin' ? {} : { isActive: true };
    const plans = await Plan.find(query).sort({ price: 1 });
    return res.json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new Plan
// @route   POST /api/superadmin/plans
// @access  Private (Super Admin)
export const createPlan = async (req, res) => {
  try {
    const { name, durationMonths = 1, price, currency, description, features, isPopular, isActive } = req.body;

    const months = Math.max(1, Number(durationMonths) || 1);
    const cycle = months === 1 ? 'monthly' : months === 12 ? 'yearly' : `${months} months`;

    const plan = await Plan.create({
      name,
      durationMonths: months,
      billingCycle: cycle,
      price: Number(price),
      currency: currency || 'INR',
      description: description || '',
      features: Array.isArray(features) ? features : features ? features.split('\n').filter(Boolean) : [],
      leadLimit: -1, // Unlimited leads for all tenants
      staffLimit: -1, // Unlimited staff for all tenants
      razorpayPlanId: '',
      isPopular: !!isPopular,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({ success: true, message: 'Plan created successfully', data: plan });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Plan
// @route   PUT /api/superadmin/plans/:id
// @access  Private (Super Admin)
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (typeof updateData.features === 'string') {
      updateData.features = updateData.features.split('\n').filter(Boolean);
    }
    if (updateData.durationMonths !== undefined) {
      const months = Math.max(1, Number(updateData.durationMonths) || 1);
      updateData.durationMonths = months;
      updateData.billingCycle = months === 1 ? 'monthly' : months === 12 ? 'yearly' : `${months} months`;
    }
    // Always enforce unlimited features & staff
    updateData.leadLimit = -1;
    updateData.staffLimit = -1;

    const plan = await Plan.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    return res.json({ success: true, message: 'Plan updated successfully', data: plan });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Plan
// @route   DELETE /api/superadmin/plans/:id
// @access  Private (Super Admin)
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    await Plan.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
