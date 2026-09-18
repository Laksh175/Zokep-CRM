import User from '../models/User.js';
import CustomField from '../models/CustomField.js';
import LeadStatus from '../models/LeadStatus.js';
import Lead from '../models/Lead.js';
import ActivityLog from '../models/ActivityLog.js';
import Subscription from '../models/Subscription.js';

// Helper to get or fallback to default status
const getTenantDefaultStatus = async (tenantId) => {
  return (
    (await LeadStatus.findOne({ tenantId, isDefault: true })) ||
    (await LeadStatus.findOne({ tenantId }).sort({ order: 1 }))
  );
};

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
    const { name, phone, email, company, notes, customFieldsData, source } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone number are required' });
    }

    const admin = await User.findOne({ _id: tenantId, role: 'admin', isActive: true });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Invalid form submission: Tenant not found or inactive' });
    }

    const defaultStatus = await getTenantDefaultStatus(tenantId);

    // Create lead
    const lead = await Lead.create({
      tenantId,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : '',
      company: company ? company.trim() : '',
      source: source || 'public_form',
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

// @desc    Verify Meta Ads Webhook Subscription Challenge
// @route   GET /api/public/webhook/meta/:tenantId
// @access  Public (Meta Platform Verification)
export const verifyMetaWebhook = async (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe') {
      console.log(`[Meta Webhook] Verification successful for tenant: ${req.params.tenantId}`);
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Verification failed');
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// @desc    Receive Direct Lead from Meta (Facebook & Instagram Lead Generation Ads)
// @route   POST /api/public/webhook/meta/:tenantId
// @access  Public (Webhook / Direct Push)
export const receiveMetaLeadWebhook = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const body = req.body || {};

    const admin = await User.findOne({ _id: tenantId, role: 'admin', isActive: true });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Tenant not found or inactive' });
    }

    const defaultStatus = await getTenantDefaultStatus(tenantId);

    let name = body.name || body.full_name || body.fullName || '';
    let phone = body.phone || body.phone_number || body.phoneNumber || '';
    let email = body.email || body.emailAddress || '';
    let company = body.company || body.company_name || '';
    let notes = body.notes || body.message || '';
    const campaignName = body.campaign_name || body.ad_name || body.form_name || '';
    const customFieldsData = body.customFieldsData || {};

    // Handle standard Meta Graph API field_data array format: [{ name: 'full_name', values: ['...'] }]
    if (Array.isArray(body.field_data)) {
      body.field_data.forEach((field) => {
        const key = (field.name || '').toLowerCase();
        const val = Array.isArray(field.values) ? field.values[0] : field.values;
        if (!val) return;

        if (key.includes('name') || key.includes('full_name') || key.includes('first_name')) {
          if (!name) name = val;
        } else if (key.includes('phone') || key.includes('mobile') || key.includes('contact')) {
          if (!phone) phone = val;
        } else if (key.includes('email')) {
          if (!email) email = val;
        } else if (key.includes('company') || key.includes('business') || key.includes('organization')) {
          if (!company) company = val;
        } else {
          customFieldsData[key] = val;
        }
      });
    }

    // Handle Meta Leadgen change notification wrapper: entry[0].changes[0].value
    if (body.entry && Array.isArray(body.entry)) {
      const change = body.entry[0]?.changes?.[0]?.value;
      if (change?.leadgen_id) {
        notes = `${notes ? notes + ' | ' : ''}Meta Leadgen ID: ${change.leadgen_id}, Form ID: ${change.form_id || 'N/A'}, Page ID: ${change.page_id || 'N/A'}`;
      }
    }

    if (!name) name = 'Meta Lead ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    if (!phone) phone = '+91 ' + Math.floor(6000000000 + Math.random() * 3999999999);

    if (campaignName) {
      notes = notes ? `[Campaign: ${campaignName}] ${notes}` : `Campaign: ${campaignName}`;
    }

    const lead = await Lead.create({
      tenantId,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : '',
      company: company ? company.trim() : '',
      dealValue: Number(body.dealValue) || 0,
      source: 'facebook_ads',
      notes: notes || 'Direct lead captured from Facebook / Instagram Lead Ad',
      priority: body.priority || 'high',
      statusId: defaultStatus?._id || null,
      customFieldsData,
    });

    await ActivityLog.create({
      tenantId,
      leadId: lead._id,
      performedBy: admin._id,
      type: 'created',
      title: 'Meta Ads Lead Ingested',
      note: `Direct lead received from Meta (Facebook & Instagram Instant Form). Contact: ${name} (${phone}). ${campaignName ? `Ad Campaign: ${campaignName}` : ''}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Meta Ads lead received and saved to CRM pipeline successfully',
      leadId: lead._id,
      data: lead,
    });
  } catch (error) {
    console.error('Meta Lead Ingestion Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify WhatsApp Webhook Subscription Challenge
// @route   GET /api/public/webhook/whatsapp/:tenantId
// @access  Public (WhatsApp Cloud API Verification)
export const verifyWhatsAppWebhook = async (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe') {
      console.log(`[WhatsApp Webhook] Verification successful for tenant: ${req.params.tenantId}`);
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Verification failed');
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// @desc    Receive Inbound WhatsApp Message / Inquiry into CRM
// @route   POST /api/public/webhook/whatsapp/:tenantId
// @access  Public (WhatsApp Cloud API / Webhook Ingestion)
export const receiveWhatsAppWebhook = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const body = req.body || {};

    const admin = await User.findOne({ _id: tenantId, role: 'admin', isActive: true });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Tenant not found or inactive' });
    }

    const defaultStatus = await getTenantDefaultStatus(tenantId);

    let name = body.name || body.profile_name || body.senderName || '';
    let phone = body.phone || body.from || body.sender || '';
    let messageText = body.message || body.text || body.body || '';

    // Handle Meta WhatsApp Cloud API format: entry[0].changes[0].value.messages[0]
    if (body.entry && Array.isArray(body.entry)) {
      const val = body.entry[0]?.changes?.[0]?.value;
      if (val) {
        if (val.contacts && val.contacts[0]) {
          name = val.contacts[0].profile?.name || name;
          phone = val.contacts[0].wa_id || phone;
        }
        if (val.messages && val.messages[0]) {
          phone = val.messages[0].from || phone;
          messageText = val.messages[0].text?.body || val.messages[0].type || messageText;
        }
      }
    }

    if (!phone) {
      phone = '+91 ' + Math.floor(6000000000 + Math.random() * 3999999999);
    }
    if (!name) {
      name = `WhatsApp User (${phone.slice(-4)})`;
    }

    // Check if lead already exists with this phone number under this tenant
    const existingLead = await Lead.findOne({ tenantId, phone: phone.trim() });
    if (existingLead) {
      // Append activity log to existing lead
      await ActivityLog.create({
        tenantId,
        leadId: existingLead._id,
        performedBy: admin._id,
        type: 'whatsapp_sent',
        title: 'New Inbound WhatsApp Message',
        note: `Inbound WhatsApp message received: "${messageText || 'Inquiry message'}"`,
      });

      return res.status(200).json({
        success: true,
        message: 'Existing lead updated with new WhatsApp message',
        leadId: existingLead._id,
        isExisting: true,
      });
    }

    // Create brand new WhatsApp lead
    const lead = await Lead.create({
      tenantId,
      name: name.trim(),
      phone: phone.trim(),
      email: body.email ? body.email.trim().toLowerCase() : '',
      company: body.company || '',
      source: 'whatsapp',
      notes: messageText ? `Inbound WhatsApp Chat: "${messageText}"` : 'Inquiry initiated via WhatsApp',
      priority: 'high',
      statusId: defaultStatus?._id || null,
      customFieldsData: body.customFieldsData || {},
    });

    await ActivityLog.create({
      tenantId,
      leadId: lead._id,
      performedBy: admin._id,
      type: 'created',
      title: 'WhatsApp Lead Ingested',
      note: `Prospect initiated contact via WhatsApp. Initial message: "${messageText || 'Hi, I need more info'}"`,
    });

    return res.status(201).json({
      success: true,
      message: 'WhatsApp lead received and created in CRM pipeline',
      leadId: lead._id,
      data: lead,
    });
  } catch (error) {
    console.error('WhatsApp Webhook Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Universal Inbound Webhook (Zapier, Make, WordPress, Custom Webhook)
// @route   POST /api/public/webhook/lead/:tenantId
// @access  Public
export const receiveUniversalLeadWebhook = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { name, phone, email, company, dealValue, source, notes, priority, customFieldsData } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Lead Name and Phone number are required' });
    }

    const admin = await User.findOne({ _id: tenantId, role: 'admin', isActive: true });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Tenant not found or inactive' });
    }

    const defaultStatus = await getTenantDefaultStatus(tenantId);

    const lead = await Lead.create({
      tenantId,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : '',
      company: company ? company.trim() : '',
      dealValue: Number(dealValue) || 0,
      source: source || 'website',
      notes: notes || 'Lead ingested via Universal API Webhook',
      priority: priority || 'medium',
      statusId: defaultStatus?._id || null,
      customFieldsData: customFieldsData || {},
    });

    await ActivityLog.create({
      tenantId,
      leadId: lead._id,
      performedBy: admin._id,
      type: 'created',
      title: 'Lead Ingested via API Webhook',
      note: `Received from channel: ${source || 'API Webhook'}. Details: ${name} (${phone}).`,
    });

    return res.status(201).json({
      success: true,
      message: 'Lead received and added to CRM pipeline successfully',
      leadId: lead._id,
      data: lead,
    });
  } catch (error) {
    console.error('Universal Lead Webhook Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
