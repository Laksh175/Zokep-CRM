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

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [myLeads, statuses, recentActivities] = await Promise.all([
      Lead.find({ tenantId, assignedTo: staffId }).populate('statusId', 'name color').lean(),
      LeadStatus.find({ tenantId }).sort({ order: 1 }).lean(),
      ActivityLog.find({ tenantId, performedBy: staffId })
        .populate('leadId', 'name phone company')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const myTotalLeads = myLeads.length;
    let myConvertedLeads = 0;
    const todayFollowups = [];
    const overdueFollowups = [];
    const statusMap = {};

    myLeads.forEach((lead) => {
      if (lead.isConverted) myConvertedLeads++;

      if (lead.statusId) {
        const sKey = String(lead.statusId._id || lead.statusId);
        statusMap[sKey] = (statusMap[sKey] || 0) + 1;
      }

      if (!lead.isConverted && lead.nextFollowupDate) {
        const fDate = new Date(lead.nextFollowupDate);
        if (fDate >= startOfToday && fDate <= endOfToday) {
          todayFollowups.push(lead);
        } else if (fDate < startOfToday) {
          overdueFollowups.push(lead);
        }
      }
    });

    const statusCounts = statuses.map((st) => ({
      id: st._id,
      name: st.name,
      color: st.color,
      count: statusMap[String(st._id)] || 0,
    }));

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
