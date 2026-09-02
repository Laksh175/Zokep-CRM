import Lead from '../models/Lead.js';
import LeadStatus from '../models/LeadStatus.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Get Staff Sales Consultant Dashboard Metrics
// @route   GET /api/staff/dashboard
// @access  Private (Staff)
export const getStaffDashboard = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const staffId = req.user._id;

    const myTotalLeads = await Lead.countDocuments({ tenantId, assignedTo: staffId });
    const myConvertedLeads = await Lead.countDocuments({ tenantId, assignedTo: staffId, isConverted: true });

    // Today's Follow-ups
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayFollowups = await Lead.find({
      tenantId,
      assignedTo: staffId,
      nextFollowupDate: { $gte: startOfToday, $lte: endOfToday },
      isConverted: false,
    })
      .populate('statusId', 'name color')
      .sort({ nextFollowupDate: 1 });

    // Overdue Follow-ups
    const overdueFollowups = await Lead.find({
      tenantId,
      assignedTo: staffId,
      nextFollowupDate: { $lt: startOfToday },
      isConverted: false,
    })
      .populate('statusId', 'name color')
      .sort({ nextFollowupDate: 1 });

    // Status breakdown
    const statuses = await LeadStatus.find({ tenantId }).sort({ order: 1 });
    const statusCounts = await Promise.all(
      statuses.map(async (st) => {
        const count = await Lead.countDocuments({ tenantId, assignedTo: staffId, statusId: st._id });
        return {
          id: st._id,
          name: st.name,
          color: st.color,
          count,
        };
      })
    );

    // Recent activity log by this staff
    const recentActivities = await ActivityLog.find({ tenantId, performedBy: staffId })
      .populate('leadId', 'name phone company')
      .sort({ createdAt: -1 })
      .limit(10);

    return res.json({
      success: true,
      data: {
        myTotalLeads,
        myConvertedLeads,
        conversionRate: myTotalLeads > 0 ? ((myConvertedLeads / myTotalLeads) * 100).toFixed(1) : 0,
        todayFollowupsCount: todayFollowups.length,
        overdueCount: overdueFollowups.length,
        todayFollowups,
        overdueFollowups,
        statusCounts,
        recentActivities,
      },
    });
  } catch (error) {
    console.error('Staff Dashboard Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
