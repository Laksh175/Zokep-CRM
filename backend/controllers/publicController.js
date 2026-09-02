import User from '../models/User.js';
import CustomField from '../models/CustomField.js';
import LeadStatus from '../models/LeadStatus.js';
import Lead from '../models/Lead.js';
import ActivityLog from '../models/ActivityLog.js';
import Subscription from '../models/Subscription.js';

// @desc    Get Public Lead Form Metadata & Custom Fields for a Tenant
// @route   GET /api/public/form/:tenantId
// @access  Public
export const getPublicFormConfig = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const admin = await User.findOne({ _id: tenantId, role: 'admin', isActive: true });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'This lead form is currently unavailable or inactive.' });
    }

    // Check if subscription is active
    const sub = await Subscription.findOne({
      tenantId,
      status: { $in: ['active', 'grace_period'] },
      endDate: { $gte: new Date() },
    });

    if (!sub) {
      return res.status(403).json({
        success: false,
        message: 'This lead capture form is currently paused due to an inactive subscription.',
      });
    }

    const customFields = await CustomField.find({ tenantId }).sort({ order: 1 });

    return res.json({
      success: true,
      data: {
        tenantId: admin._id,
        companyName: admin.companyName || 'Business Organization',
        businessType: admin.businessType,
        customFields,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Lead from Public Embed / Shareable Link
// @route   POST /api/public/form/:tenantId
// @access  Public
export const submitPublicLead = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { name, phone, email, company, notes, customFieldsData } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone number are required' });
    }

    const admin = await User.findOne({ _id: tenantId, role: 'admin', isActive: true });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Invalid form submission: Tenant not found or inactive' });
    }

    // Find default status
    const defaultStatus = (await LeadStatus.findOne({ tenantId, isDefault: true })) || (await LeadStatus.findOne({ tenantId }).sort({ order: 1 }));

    // Create lead
    const lead = await Lead.create({
      tenantId,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : '',
      company: company ? company.trim() : '',
      source: 'public_form',
      notes: notes || '',
      statusId: defaultStatus?._id || null,
      customFieldsData: customFieldsData || {},
    });

    // Create activity log
    await ActivityLog.create({
      tenantId,
      leadId: lead._id,
      performedBy: admin._id,
      type: 'created',
      title: 'Lead Captured via Public Web Form',
      note: `Inquiry submitted via public link from ${name} (${phone}).`,
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your information has been received. Our team will contact you shortly.',
      leadId: lead._id,
    });
  } catch (error) {
    console.error('Public Lead Form Submission Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
