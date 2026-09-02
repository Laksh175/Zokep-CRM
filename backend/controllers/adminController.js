import User from '../models/User.js';
import Lead from '../models/Lead.js';
import LeadStatus from '../models/LeadStatus.js';
import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import ActivityLog from '../models/ActivityLog.js';
import { sendStaffWelcomeEmail } from '../utils/mailer.js';

// @desc    Get Tenant Admin Dashboard Analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboard = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const totalLeads = await Lead.countDocuments({ tenantId });
    const convertedLeads = await Lead.countDocuments({ tenantId, isConverted: true });
    const unassignedLeads = await Lead.countDocuments({ tenantId, assignedTo: null });
    const totalStaff = await User.countDocuments({ tenantId, role: 'staff' });

    // Financial pipeline values
    const allLeads = await Lead.find({ tenantId });
    const totalPipelineValue = allLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0);
    const wonRevenue = allLeads
      .filter((l) => l.isConverted)
      .reduce((sum, l) => sum + (l.convertedDealAmount || l.dealValue || 0), 0);

    // Status breakdown with colors
    const statuses = await LeadStatus.find({ tenantId }).sort({ order: 1 });
    const statusCounts = await Promise.all(
      statuses.map(async (st) => {
        const count = await Lead.countDocuments({ tenantId, statusId: st._id });
        return {
          id: st._id,
          name: st.name,
          color: st.color,
          count,
        };
      })
    );

    // Staff Leaderboard
    const staffMembers = await User.find({ tenantId, role: 'staff' });
    const staffPerformance = await Promise.all(
      staffMembers.map(async (staff) => {
        const assigned = await Lead.countDocuments({ tenantId, assignedTo: staff._id });
        const converted = await Lead.countDocuments({ tenantId, assignedTo: staff._id, isConverted: true });
        const followupsCount = await ActivityLog.countDocuments({ tenantId, performedBy: staff._id });
        const rate = assigned > 0 ? ((converted / assigned) * 100).toFixed(1) : 0;
        return {
          id: staff._id,
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          isActive: staff.isActive,
          assignedLeads: assigned,
          convertedLeads: converted,
          followupsCount,
          conversionRate: rate,
        };
      })
    );

    // Upcoming followups (next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingFollowups = await Lead.find({
      tenantId,
      nextFollowupDate: { $gte: now, $lte: nextWeek },
      isConverted: false,
    })
      .populate('assignedTo', 'name email')
      .populate('statusId', 'name color')
      .sort({ nextFollowupDate: 1 })
      .limit(10);

    // Lead Sources breakdown
    const sourceMap = {};
    allLeads.forEach((l) => {
      const src = l.source || 'manual';
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });

    return res.json({
      success: true,
      data: {
        totalLeads,
        convertedLeads,
        unassignedLeads,
        totalStaff,
        totalPipelineValue,
        wonRevenue,
        conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0,
        statusCounts,
        staffPerformance,
        upcomingFollowups,
        sourceBreakdown: Object.entries(sourceMap).map(([source, count]) => ({ source, count })),
      },
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all staff members for Admin tenant
// @route   GET /api/admin/staff
// @access  Private (Admin)
export const getStaffMembers = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const staff = await User.find({ tenantId, role: 'staff' }).sort({ createdAt: -1 });

    const staffWithMetrics = await Promise.all(
      staff.map(async (s) => {
        const leadsCount = await Lead.countDocuments({ tenantId, assignedTo: s._id });
        const convertedCount = await Lead.countDocuments({ tenantId, assignedTo: s._id, isConverted: true });
        return {
          id: s._id,
          name: s.name,
          email: s.email,
          phone: s.phone,
          isActive: s.isActive,
          lastLogin: s.lastLogin,
          createdAt: s.createdAt,
          leadsCount,
          convertedCount,
        };
      })
    );

    return res.json({ success: true, count: staffWithMetrics.length, data: staffWithMetrics });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new staff member / consultant
// @route   POST /api/admin/staff
// @access  Private (Admin)
export const createStaffMember = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    // Check staff limit based on plan
    const sub = await Subscription.findOne({ tenantId, status: { $in: ['active', 'grace_period'] } })
      .populate('planId')
      .sort({ endDate: -1 });

    const currentStaffCount = await User.countDocuments({ tenantId, role: 'staff' });
    const staffLimit = sub?.planId?.staffLimit ?? 5;

    if (staffLimit !== -1 && currentStaffCount >= staffLimit) {
      return res.status(400).json({
        success: false,
        message: `Staff member limit (${staffLimit}) reached for your current plan. Please upgrade your subscription to add more team members.`,
      });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const rawPassword = password;
    const staff = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'staff',
      tenantId,
      isActive: true,
    });

    // Send credentials via email
    const adminUser = await User.findById(tenantId);
    sendStaffWelcomeEmail({
      to: staff.email,
      name: staff.name,
      email: staff.email,
      password: rawPassword,
      companyName: adminUser?.companyName || 'Our Company CRM',
      loginUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`,
    }).catch((e) => console.log('Staff mailer warning:', e.message));

    return res.status(201).json({
      success: true,
      message: 'Staff member created successfully. Login credentials sent to their email.',
      data: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        isActive: staff.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update staff member (profile or toggle active)
// @route   PUT /api/admin/staff/:id
// @access  Private (Admin)
export const updateStaffMember = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const { name, phone, isActive, password } = req.body;

    const staff = await User.findOne({ _id: id, tenantId, role: 'staff' });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found in your organization' });
    }

    if (name) staff.name = name;
    if (phone !== undefined) staff.phone = phone;
    if (isActive !== undefined) staff.isActive = isActive;
    if (password) staff.password = password; // pre-save will hash

    await staff.save();

    return res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        isActive: staff.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete staff member & reassign leads
// @route   DELETE /api/admin/staff/:id
// @access  Private (Admin)
export const deleteStaffMember = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const { reassignToId } = req.body;

    const staff = await User.findOne({ _id: id, tenantId, role: 'staff' });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    // Reassign leads to another staff or unassign
    if (reassignToId) {
      await Lead.updateMany({ tenantId, assignedTo: id }, { assignedTo: reassignToId });
    } else {
      await Lead.updateMany({ tenantId, assignedTo: id }, { assignedTo: null });
    }

    await User.findByIdAndDelete(id);

    return res.json({ success: true, message: 'Staff member removed and leads updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
