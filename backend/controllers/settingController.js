import LeadStatus from '../models/LeadStatus.js';
import CustomField from '../models/CustomField.js';
import Template from '../models/Template.js';
import Lead from '../models/Lead.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { sendCustomLeadEmail } from '../utils/mailer.js';

// ==================== LEAD STATUSES ====================

export const getLeadStatuses = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const statuses = await LeadStatus.find({ tenantId }).sort({ order: 1 });
    return res.json({ success: true, count: statuses.length, data: statuses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createLeadStatus = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { name, color, isDefault, isConvertedState, isLostState } = req.body;

    const count = await LeadStatus.countDocuments({ tenantId });
    const status = await LeadStatus.create({
      tenantId,
      name,
      color: color || '#3b82f6',
      order: count + 1,
      isDefault: !!isDefault,
      isConvertedState: !!isConvertedState,
      isLostState: !!isLostState,
    });

    return res.status(201).json({ success: true, message: 'Status created successfully', data: status });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLeadStatus = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const { name, color, order, isDefault, isConvertedState, isLostState } = req.body;

    const status = await LeadStatus.findOneAndUpdate(
      { _id: id, tenantId },
      { name, color, order, isDefault, isConvertedState, isLostState },
      { new: true }
    );

    if (!status) return res.status(404).json({ success: false, message: 'Status not found' });
    return res.json({ success: true, message: 'Status updated successfully', data: status });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLeadStatus = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    const leadsUsingStatus = await Lead.countDocuments({ tenantId, statusId: id });
    if (leadsUsingStatus > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete this status because ${leadsUsingStatus} leads are currently assigned to it. Please reassign the leads first.`,
      });
    }

    await LeadStatus.findOneAndDelete({ _id: id, tenantId });
    return res.json({ success: true, message: 'Status deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CUSTOM FIELDS ====================

export const getCustomFields = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const fields = await CustomField.find({ tenantId }).sort({ order: 1 });
    return res.json({ success: true, count: fields.length, data: fields });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCustomField = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { fieldLabel, fieldName, fieldType, options, placeholder, isRequired, showInTable } = req.body;

    const count = await CustomField.countDocuments({ tenantId });
    const field = await CustomField.create({
      tenantId,
      fieldLabel,
      fieldName,
      fieldType: fieldType || 'text',
      options: Array.isArray(options) ? options : options ? options.split(',').map((o) => o.trim()).filter(Boolean) : [],
      placeholder: placeholder || '',
      isRequired: !!isRequired,
      showInTable: !!showInTable,
      order: count + 1,
    });

    return res.status(201).json({ success: true, message: 'Custom field added successfully', data: field });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomField = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const { fieldLabel, fieldType, options, placeholder, isRequired, showInTable, order } = req.body;

    const updateData = { fieldLabel, fieldType, placeholder, isRequired, showInTable, order };
    if (options !== undefined) {
      updateData.options = Array.isArray(options) ? options : options.split(',').map((o) => o.trim()).filter(Boolean);
    }

    const field = await CustomField.findOneAndUpdate({ _id: id, tenantId }, updateData, { new: true });
    if (!field) return res.status(404).json({ success: false, message: 'Custom field not found' });

    return res.json({ success: true, message: 'Custom field updated successfully', data: field });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCustomField = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    await CustomField.findOneAndDelete({ _id: id, tenantId });
    return res.json({ success: true, message: 'Custom field removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== TEMPLATES (WhatsApp & Email) ====================

export const getTemplates = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { type } = req.query;
    const query = { tenantId };
    if (type) query.type = type;

    const templates = await Template.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, count: templates.length, data: templates });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { type, title, subject, body } = req.body;

    const template = await Template.create({
      tenantId,
      type: type || 'whatsapp',
      title,
      subject: subject || '',
      body,
    });

    return res.status(201).json({ success: true, message: 'Template saved successfully', data: template });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const { title, subject, body, isActive } = req.body;

    const template = await Template.findOneAndUpdate(
      { _id: id, tenantId },
      { title, subject, body, isActive },
      { new: true }
    );

    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    return res.json({ success: true, message: 'Template updated successfully', data: template });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    await Template.findOneAndDelete({ _id: id, tenantId });
    return res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Dispatch email to lead using Nodemailer & chosen template
// @route   POST /api/settings/send-lead-email
// @access  Private (Admin or Staff)
export const sendLeadEmailWithTemplate = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { leadId, templateId, customSubject, customBody } = req.body;

    const lead = await Lead.findOne({ _id: leadId, tenantId });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    if (!lead.email) return res.status(400).json({ success: false, message: 'Lead does not have a valid email address' });

    const adminUser = await User.findById(tenantId);
    let subject = customSubject;
    let body = customBody;

    if (templateId) {
      const tpl = await Template.findOne({ _id: templateId, tenantId });
      if (tpl) {
        subject = tpl.subject;
        body = tpl.body;
      }
    }

    // Replace dynamic placeholders
    const replaceTokens = (text) => {
      if (!text) return '';
      return text
        .replace(/{{lead_name}}/gi, lead.name || '')
        .replace(/{{phone}}/gi, lead.phone || '')
        .replace(/{{email}}/gi, lead.email || '')
        .replace(/{{company}}/gi, lead.company || adminUser?.companyName || '')
        .replace(/{{business_name}}/gi, adminUser?.companyName || 'Our Company')
        .replace(/{{staff_name}}/gi, req.user?.name || 'Representative')
        .replace(/{{deal_value}}/gi, lead.dealValue ? `₹${lead.dealValue}` : '');
    };

    const finalSubject = replaceTokens(subject || `Message from ${adminUser?.companyName || 'Zokep CRM'}`);
    const finalBody = replaceTokens(body || '');

    const result = await sendCustomLeadEmail({
      to: lead.email,
      subject: finalSubject,
      html: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">${finalBody}</div>`,
      fromName: adminUser?.companyName || 'Zokep CRM',
    });

    // Record activity log
    await ActivityLog.create({
      tenantId,
      leadId: lead._id,
      performedBy: req.user._id,
      type: 'email',
      title: `Email Sent: ${finalSubject}`,
      note: finalBody.replace(/<[^>]*>?/gm, '').slice(0, 300),
    });

    lead.lastContactedAt = new Date();
    await lead.save();

    return res.json({
      success: true,
      message: 'Email dispatched successfully to lead!',
      mock: result.mock,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
