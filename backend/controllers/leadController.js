import fs from 'fs';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import { Parser as Json2CsvParser } from 'json2csv';
import Lead from '../models/Lead.js';
import LeadStatus from '../models/LeadStatus.js';
import CustomField from '../models/CustomField.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import { formatDate } from '../utils/dateFormatter.js';

/**
 * Helper function to build MongoDB query for filtering leads across list, pagination & CSV export
 */
export const buildLeadFilterQuery = (tenantId, user, queryParams = {}) => {
  const {
    search,
    statusId,
    assignedTo,
    source,
    priority,
    isConverted,
    dateFrom,
    dateTo,
    followupFilter,
    leadIds,
  } = queryParams;

  const query = { tenantId };

  // Staff can only view/export their own assigned leads
  if (user && user.role === 'staff') {
    query.assignedTo = user._id;
  } else if (assignedTo) {
    if (assignedTo === 'unassigned') {
      query.assignedTo = null;
    } else {
      query.assignedTo = assignedTo;
    }
  }

  if (statusId) query.statusId = statusId;
  if (source) query.source = source;
  if (priority) query.priority = priority;

  if (isConverted !== undefined && isConverted !== '') {
    query.isConverted = isConverted === 'true' || isConverted === true;
  }

  // Follow-up quick filters (today, overdue, upcoming)
  if (followupFilter) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (followupFilter === 'today') {
      query.nextFollowupDate = { $gte: startOfToday, $lte: endOfToday };
      query.isConverted = false;
    } else if (followupFilter === 'overdue') {
      query.nextFollowupDate = { $lt: startOfToday };
      query.isConverted = false;
    } else if (followupFilter === 'upcoming') {
      const nextWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
      nextWeek.setHours(23, 59, 59, 999);
      query.nextFollowupDate = { $gt: endOfToday, $lte: nextWeek };
      query.isConverted = false;
    }
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  if (search && typeof search === 'string' && search.trim()) {
    const term = search.trim();
    query.$or = [
      { name: { $regex: term, $options: 'i' } },
      { phone: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
      { company: { $regex: term, $options: 'i' } },
    ];
  }

  // If specific lead IDs are passed (for bulk selected lead exports)
  if (leadIds) {
    const ids = Array.isArray(leadIds)
      ? leadIds
      : String(leadIds)
          .split(',')
          .map((id) => id.trim())
          .filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (ids.length > 0) {
      query._id = { $in: ids };
    }
  }

  return query;
};

// @desc    Get all leads with advanced filtering & role scoping
// @route   GET /api/leads
// @access  Private (Admin & Staff)
export const getLeads = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = buildLeadFilterQuery(tenantId, req.user, req.query);

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 50);

    // Parallel Count & Query Execution with .lean() for fast response
    const [total, leads] = await Promise.all([
      Lead.countDocuments(query),
      Lead.find(query)
        .populate('statusId', 'name color isConvertedState isLostState')
        .populate('assignedTo', 'name email phone')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
    ]);

    return res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: leads,
    });
  } catch (error) {
    console.error('Get Leads Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single lead details with timeline activity
// @route   GET /api/leads/:id
// @access  Private (Admin & Staff)
export const getLeadById = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const lead = await Lead.findOne({ _id: id, tenantId })
      .populate('statusId', 'name color isConvertedState isLostState')
      .populate('assignedTo', 'name email phone');

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // If staff, verify assignment
    if (req.user.role === 'staff' && String(lead.assignedTo?._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this lead' });
    }

    // Fetch timeline activity logs
    const activities = await ActivityLog.find({ leadId: lead._id, tenantId })
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: {
        lead,
        activities,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Lead (Admin or Staff)
// @route   POST /api/leads
// @access  Private (Admin & Staff)
export const createLead = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const {
      name,
      phone,
      email,
      company,
      dealValue,
      source,
      notes,
      priority,
      tags,
      statusId,
      assignedTo,
      customFieldsData,
      nextFollowupDate,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Lead name and phone number are required' });
    }

    // Determine Status
    let targetStatusId = statusId;
    if (!targetStatusId) {
      const defaultStatus = await LeadStatus.findOne({ tenantId, isDefault: true });
      if (defaultStatus) {
        targetStatusId = defaultStatus._id;
      } else {
        const firstStatus = await LeadStatus.findOne({ tenantId }).sort({ order: 1 });
        targetStatusId = firstStatus?._id || null;
      }
    }

    // Determine Assignment:
    // If staff member creates lead, auto-assign to themselves
    let targetAssignedTo = null;
    if (req.user.role === 'staff') {
      targetAssignedTo = req.user._id;
    } else if (assignedTo) {
      targetAssignedTo = assignedTo;
    }

    const lead = await Lead.create({
      tenantId,
      name,
      phone,
      email: email || '',
      company: company || '',
      dealValue: Number(dealValue) || 0,
      source: source || (req.user.role === 'staff' ? 'staff_added' : 'manual'),
      notes: notes || '',
      priority: priority || 'medium',
      tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      statusId: targetStatusId,
      assignedTo: targetAssignedTo,
      customFieldsData: customFieldsData || {},
      nextFollowupDate: nextFollowupDate ? new Date(nextFollowupDate) : null,
      lastFollowupNote: notes || '',
    });

    // Create activity log
    await ActivityLog.create({
      tenantId,
      leadId: lead._id,
      performedBy: req.user._id,
      type: 'created',
      title: 'Lead Created',
      note: `Lead created by ${req.user.name}${targetAssignedTo ? ` (Assigned to ${req.user.role === 'staff' ? 'self' : 'team member'})` : ''}. ${notes || ''}`,
      nextFollowupDate: lead.nextFollowupDate,
    });

    const populatedLead = await Lead.findById(lead._id)
      .populate('statusId', 'name color')
      .populate('assignedTo', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: populatedLead,
    });
  } catch (error) {
    console.error('Create Lead Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Lead details
// @route   PUT /api/leads/:id
// @access  Private (Admin & Staff)
export const updateLead = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const {
      name,
      phone,
      email,
      company,
      dealValue,
      source,
      priority,
      tags,
      customFieldsData,
      assignedTo,
      statusId,
      nextFollowupDate,
      notes,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const lead = await Lead.findOne({ _id: id, tenantId });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    if (req.user.role === 'staff' && String(lead.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this lead' });
    }

    if (name) lead.name = name;
    if (phone) lead.phone = phone;
    if (email !== undefined) lead.email = email;
    if (company !== undefined) lead.company = company;
    if (dealValue !== undefined) lead.dealValue = Number(dealValue);
    if (source) lead.source = source;
    if (priority) lead.priority = priority;
    if (notes !== undefined) lead.notes = notes;
    if (nextFollowupDate !== undefined) {
      lead.nextFollowupDate = nextFollowupDate ? new Date(nextFollowupDate) : null;
    }
    if (tags !== undefined) {
      lead.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (customFieldsData) {
      lead.customFieldsData = { ...lead.customFieldsData, ...customFieldsData };
    }

    // Status change
    if (statusId !== undefined && statusId !== null && statusId !== '') {
      const currentStatusStr = lead.statusId ? String(lead.statusId._id || lead.statusId) : '';
      const newStatusStr = String(statusId._id || statusId);

      if (currentStatusStr !== newStatusStr) {
        lead.statusId = newStatusStr;
        const newStatusDoc = await LeadStatus.findById(newStatusStr);
        if (newStatusDoc?.isConvertedState) {
          lead.isConverted = true;
          lead.convertedAt = new Date();
          lead.convertedDealAmount = lead.dealValue || 0;
        } else {
          lead.isConverted = false;
        }
        lead.lastContactedAt = new Date();
        await ActivityLog.create({
          tenantId,
          leadId: lead._id,
          performedBy: req.user._id,
          type: 'status_change',
          title: `Status changed to: ${newStatusDoc?.name || 'Updated'}`,
          note: `Updated during lead edit`,
        });
      }
    }

    // Only Admin can reassign
    if (req.user.role === 'admin' && assignedTo !== undefined) {
      if (String(lead.assignedTo) !== String(assignedTo)) {
        const oldAssignee = lead.assignedTo;
        lead.assignedTo = assignedTo || null;

        const newStaff = assignedTo ? await User.findById(assignedTo) : null;
        await ActivityLog.create({
          tenantId,
          leadId: lead._id,
          performedBy: req.user._id,
          type: 'reassigned',
          title: 'Lead Reassigned',
          note: `Reassigned to ${newStaff ? newStaff.name : 'Unassigned'}`,
        });
      }
    }

    await lead.save();

    const updated = await Lead.findById(lead._id)
      .populate('statusId', 'name color isConvertedState isLostState')
      .populate('assignedTo', 'name email');

    return res.json({ success: true, message: 'Lead updated successfully', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Direct 1-Click Update Lead Status (Table, Kanban, Modal)
// @route   PUT /api/leads/:id/status
// @access  Private (Admin & Staff)
export const updateLeadStatusDirectly = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const { statusId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (!statusId) {
      return res.status(400).json({ success: false, message: 'statusId is required' });
    }

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    if (req.user.role === 'staff' && String(lead.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this lead' });
    }

    const newStatusStr = String(statusId._id || statusId);
    lead.statusId = newStatusStr;
    const newStatusDoc = await LeadStatus.findById(newStatusStr);

    if (newStatusDoc?.isConvertedState) {
      lead.isConverted = true;
      lead.convertedAt = new Date();
      lead.convertedDealAmount = lead.dealValue || 0;
    } else {
      // If moved back to an active non-converted state
      lead.isConverted = false;
    }

    lead.lastContactedAt = new Date();
    await lead.save();

    await ActivityLog.create({
      tenantId,
      leadId: lead._id,
      performedBy: req.user._id,
      type: 'status_change',
      title: `Status changed to: ${newStatusDoc?.name || 'Updated'}`,
      note: `Status updated via pipeline interface`,
    });

    const populated = await Lead.findById(lead._id)
      .populate('statusId', 'name color isConvertedState isLostState')
      .populate('assignedTo', 'name email');

    return res.json({
      success: true,
      message: `Status updated to ${newStatusDoc?.name || 'Updated'}`,
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Lead Status, Followup Note & Next Followup Date
// @route   POST /api/leads/:id/followup
// @access  Private (Admin & Staff)
export const addFollowupAndUpdateStatus = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const { statusId, note, nextFollowupDate, activityType = 'note' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const lead = await Lead.findOne({ _id: id, tenantId });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    if (req.user.role === 'staff' && String(lead.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this lead' });
    }

    let statusChanged = false;
    let newStatusDoc = null;

    if (statusId && String(lead.statusId) !== String(statusId)) {
      statusChanged = true;
      newStatusDoc = await LeadStatus.findById(statusId);
      lead.statusId = statusId;

      if (newStatusDoc?.isConvertedState) {
        lead.isConverted = true;
        lead.convertedAt = new Date();
        lead.convertedDealAmount = lead.dealValue || 0;
      }
    }

    if (nextFollowupDate) {
      lead.nextFollowupDate = new Date(nextFollowupDate);
    }
    if (note) {
      lead.lastFollowupNote = note;
    }
    lead.lastContactedAt = new Date();

    await lead.save();

    // Create activity log
    await ActivityLog.create({
      tenantId,
      leadId: lead._id,
      performedBy: req.user._id,
      type: statusChanged ? 'status_change' : activityType,
      title: statusChanged
        ? `Status changed to: ${newStatusDoc?.name || 'Updated'}`
        : activityType === 'whatsapp'
        ? 'WhatsApp Follow-up'
        : activityType === 'call'
        ? 'Phone Call Logged'
        : 'Follow-up Note Added',
      note: note || '',
      nextFollowupDate: lead.nextFollowupDate,
    });

    const populated = await Lead.findById(lead._id)
      .populate('statusId', 'name color isConvertedState isLostState')
      .populate('assignedTo', 'name email');

    return res.json({
      success: true,
      message: 'Follow-up and status updated successfully',
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Convert Lead to Customer
// @route   POST /api/leads/:id/convert
// @access  Private (Admin & Staff)
export const convertLeadToCustomer = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const { dealAmount, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const lead = await Lead.findOne({ _id: id, tenantId });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    if (req.user.role === 'staff' && String(lead.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Find converted status if exists
    const convertedStatus = await LeadStatus.findOne({ tenantId, isConvertedState: true });
    if (convertedStatus) {
      lead.statusId = convertedStatus._id;
    }

    lead.isConverted = true;
    lead.convertedAt = new Date();
    lead.convertedDealAmount = dealAmount !== undefined ? Number(dealAmount) : lead.dealValue || 0;
    await lead.save();

    await ActivityLog.create({
      tenantId,
      leadId: lead._id,
      performedBy: req.user._id,
      type: 'converted',
      title: '🎉 Lead Converted to Customer!',
      note: `Deal closed for ₹${lead.convertedDealAmount}. ${note || ''}`,
    });

    return res.json({
      success: true,
      message: 'Lead converted to Customer successfully! 🎉',
      data: lead,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reassign Lead (Admin Only)
// @route   PUT /api/leads/:id/reassign
// @access  Private (Admin)
export const reassignLead = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const targetAssignee = req.body.assignedTo || req.body.assignedToId || null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const lead = await Lead.findOne({ _id: id, tenantId });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    let staffName = 'Unassigned';
    if (targetAssignee) {
      const staff = await User.findOne({ _id: targetAssignee, tenantId, role: 'staff' });
      if (!staff) return res.status(400).json({ success: false, message: 'Invalid staff member' });
      staffName = staff.name;
    }

    lead.assignedTo = targetAssignee || null;
    await lead.save();

    await ActivityLog.create({
      tenantId,
      leadId: lead._id,
      performedBy: req.user._id,
      type: 'reassigned',
      title: 'Lead Assignment Changed',
      note: `Lead assigned to: ${staffName}`,
    });

    const populated = await Lead.findById(lead._id)
      .populate('statusId', 'name color')
      .populate('assignedTo', 'name email');

    return res.json({ success: true, message: `Lead successfully assigned to ${staffName}`, data: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk Upload Leads from CSV
// @route   POST /api/leads/bulk-upload
// @access  Private (Admin)
export const bulkUploadLeads = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a valid CSV file to upload.' });
    }

    // 1. Fetch Subscription & Capacity
    const sub = await Subscription.findOne({ tenantId, status: { $in: ['active', 'grace_period'] } })
      .populate('planId', 'leadLimit name')
      .sort({ endDate: -1 });

    const planLimit = sub?.planId?.leadLimit ?? -1;
    const currentLeadCount = await Lead.countDocuments({ tenantId });
    const remainingCapacity = planLimit === -1 ? Infinity : Math.max(0, planLimit - currentLeadCount);

    if (remainingCapacity <= 0 && planLimit !== -1) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: `Your subscription plan (${sub?.planId?.name || 'Current Plan'}) has reached its limit of ${planLimit} total leads. Please upgrade your plan to import additional leads.`,
      });
    }

    const customFields = await CustomField.find({ tenantId });
    const defaultStatus =
      (await LeadStatus.findOne({ tenantId, isDefault: true })) ||
      (await LeadStatus.findOne({ tenantId }).sort({ order: 1 }));

    // Extract optional assignedTo staff from request body
    const { assignedTo } = req.body || {};
    let targetAssignedTo = null;
    let assignedStaffDoc = null;

    if (req.user.role === 'staff') {
      targetAssignedTo = req.user._id;
    } else if (assignedTo && assignedTo !== '') {
      assignedStaffDoc = await User.findOne({ _id: assignedTo, tenantId });
      if (assignedStaffDoc) {
        targetAssignedTo = assignedStaffDoc._id;
      }
    }

    const validSources = [
      'manual',
      'meta_ads',
      'google_ads',
      'whatsapp',
      'website_form',
      'referral',
      'cold_call',
      'walk_in',
      'csv_import',
      'other',
    ];

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

          if (results.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'The uploaded CSV file is empty or formatted incorrectly.',
            });
          }

          let importedCount = 0;
          let skippedCount = 0;
          const errors = [];

          for (let i = 0; i < results.length; i++) {
            const row = results[i];
            const rowNum = i + 2; // Row 1 is header in CSV files

            // Helper to find column case-insensitively
            const getVal = (possibleKeys) => {
              for (const k of Object.keys(row)) {
                if (possibleKeys.includes(k.toLowerCase().trim())) {
                  return typeof row[k] === 'string' ? row[k].trim() : String(row[k] ?? '').trim();
                }
              }
              return '';
            };

            const rawName = getVal(['name', 'lead name', 'full name', 'contact name', 'customer name']);
            const rawPhone = getVal(['phone', 'mobile', 'contact', 'phone number', 'cell', 'telephone', 'mobile number']);
            const rawEmail = getVal(['email', 'email address', 'mail', 'email id']);
            const rawCompany = getVal(['company', 'organization', 'company name', 'business', 'org']);
            const rawDealValue = getVal(['deal value', 'dealvalue', 'value', 'budget', 'amount', 'price', 'deal amount']);
            const rawSource = getVal(['source', 'lead source', 'lead_source', 'channel', 'origin', 'lead origin']);
            const rawPriority = getVal(['priority', 'urgency', 'level']);
            const rawNotes = getVal(['notes', 'note', 'remarks', 'requirement', 'description', 'comments']);

            // 1. Validation: Name
            if (!rawName) {
              skippedCount++;
              errors.push({
                row: rowNum,
                name: '(Empty)',
                phone: rawPhone || '-',
                reason: 'Missing required field: Lead Name',
                rawRow: row,
              });
              continue;
            }
            if (rawName.length < 2) {
              skippedCount++;
              errors.push({
                row: rowNum,
                name: rawName,
                phone: rawPhone || '-',
                reason: 'Lead Name must be at least 2 characters',
                rawRow: row,
              });
              continue;
            }

            // 2. Validation: Phone
            if (!rawPhone) {
              skippedCount++;
              errors.push({
                row: rowNum,
                name: rawName,
                phone: '(Empty)',
                reason: 'Missing required field: Phone Number',
                rawRow: row,
              });
              continue;
            }

            // Clean phone string (allow +, remove spaces, hyphens, parentheses, dots)
            const cleanPhone = rawPhone.replace(/[\s\-\(\)\.]/g, '');
            const digitCount = (cleanPhone.match(/\d/g) || []).length;
            if (digitCount < 7 || digitCount > 16) {
              skippedCount++;
              errors.push({
                row: rowNum,
                name: rawName,
                phone: rawPhone,
                reason: `Invalid phone number format (${digitCount} digits detected; must contain 7-15 digits)`,
                rawRow: row,
              });
              continue;
            }

            // 3. Validation: Email (Optional, but if present must be valid)
            let email = '';
            if (rawEmail) {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(rawEmail)) {
                email = rawEmail.toLowerCase();
              } else {
                skippedCount++;
                errors.push({
                  row: rowNum,
                  name: rawName,
                  phone: rawPhone,
                  reason: `Invalid email address format: "${rawEmail}"`,
                  rawRow: row,
                });
                continue;
              }
            }

            // 4. Capacity Limit Enforcement
            if (planLimit !== -1 && importedCount >= remainingCapacity) {
              skippedCount++;
              errors.push({
                row: rowNum,
                name: rawName,
                phone: rawPhone,
                reason: `Skipped: Plan limit of ${planLimit} total leads reached for your account.`,
                rawRow: row,
              });
              continue;
            }

            // 5. Deal Value Sanitization
            let dealValue = 0;
            if (rawDealValue) {
              const cleanVal = rawDealValue.replace(/[^\d.-]/g, '');
              const parsed = parseFloat(cleanVal);
              if (!isNaN(parsed) && parsed >= 0) {
                dealValue = parsed;
              }
            }

            // 6. Lead Source Normalization
            let source = 'csv_import';
            if (rawSource) {
              const sLower = rawSource.toLowerCase().replace(/[\s-]/g, '_');
              if (validSources.includes(sLower)) {
                source = sLower;
              } else if (sLower.includes('meta') || sLower.includes('facebook') || sLower.includes('fb') || sLower.includes('insta')) {
                source = 'meta_ads';
              } else if (sLower.includes('google') || sLower.includes('gads')) {
                source = 'google_ads';
              } else if (sLower.includes('whatsapp') || sLower.includes('wa')) {
                source = 'whatsapp';
              } else if (sLower.includes('web') || sLower.includes('site') || sLower.includes('form')) {
                source = 'website_form';
              } else if (sLower.includes('refer')) {
                source = 'referral';
              } else if (sLower.includes('call')) {
                source = 'cold_call';
              } else if (sLower.includes('walk')) {
                source = 'walk_in';
              }
            }

            // 7. Priority Normalization
            let priority = 'medium';
            if (rawPriority) {
              const pLower = rawPriority.toLowerCase();
              if (['low', 'medium', 'high', 'urgent'].includes(pLower)) {
                priority = pLower;
              }
            }

            // 8. Dynamic Custom Fields Mapping
            const customData = {};
            for (const cf of customFields) {
              const val = getVal([cf.fieldName.toLowerCase(), cf.fieldLabel.toLowerCase()]);
              if (val) {
                if (cf.fieldType === 'number') {
                  const num = Number(val.replace(/[^\d.-]/g, ''));
                  customData[cf.fieldName] = isNaN(num) ? 0 : num;
                } else if (cf.fieldType === 'date') {
                  const d = new Date(val);
                  customData[cf.fieldName] = isNaN(d.getTime()) ? val : d.toISOString().split('T')[0];
                } else {
                  customData[cf.fieldName] = val;
                }
              }
            }

            // Create Lead Record
            const lead = await Lead.create({
              tenantId,
              name: rawName,
              phone: cleanPhone,
              email,
              company: rawCompany,
              dealValue,
              source,
              priority,
              notes: rawNotes,
              statusId: defaultStatus?._id || null,
              assignedTo: targetAssignedTo,
              customFieldsData: customData,
            });

            await ActivityLog.create({
              tenantId,
              leadId: lead._id,
              performedBy: req.user._id,
              type: 'created',
              title: 'Bulk Imported Lead',
              note: `Imported via CSV batch upload (Source: ${source})${assignedStaffDoc ? ` (Assigned to ${assignedStaffDoc.name})` : ''}`,
            });

            importedCount++;
          }

          const message =
            skippedCount === 0
              ? `Successfully imported all ${importedCount} leads!`
              : `Import completed: ${importedCount} leads imported, ${skippedCount} rows skipped due to validation errors.`;

          return res.json({
            success: true,
            message,
            data: {
              totalProcessed: results.length,
              importedCount,
              skippedCount,
              errors,
            },
          });
        } catch (err) {
          console.error('Bulk Import processing error:', err);
          return res.status(500).json({ success: false, message: err.message });
        }
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export Filtered Leads to CSV
// @route   GET /api/leads/export-csv
// @access  Private (Admin & Staff)
export const exportLeadsCSV = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const {
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = buildLeadFilterQuery(tenantId, req.user, req.query);

    const [leads, customFields] = await Promise.all([
      Lead.find(query)
        .populate('statusId', 'name')
        .populate('assignedTo', 'name email')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .lean(),
      CustomField.find({ tenantId }).lean(),
    ]);

    const flatData = leads.map((l) => {
      const row = {
        'Lead ID': l._id.toString(),
        Name: l.name,
        Phone: l.phone,
        Email: l.email || '',
        Company: l.company || '',
        'Deal Value': l.dealValue || 0,
        Priority: l.priority ? l.priority.charAt(0).toUpperCase() + l.priority.slice(1) : 'Medium',
        Status: l.statusId?.name || 'New',
        'Assigned To': l.assignedTo?.name || 'Unassigned',
        Source: l.source || '',
        'Is Converted': l.isConverted ? 'Yes' : 'No',
        'Converted Amount': l.convertedDealAmount || 0,
        'Converted Date': l.convertedAt ? formatDate(l.convertedAt) : '',
        'Next Followup': l.nextFollowupDate ? formatDate(l.nextFollowupDate) : '',
        'Created Date': formatDate(l.createdAt),
        Notes: l.notes || '',
      };

      // Append custom fields
      for (const cf of customFields) {
        row[cf.fieldLabel || cf.fieldName] = l.customFieldsData?.[cf.fieldName] || '';
      }

      return row;
    });

    const fields = [
      'Lead ID',
      'Name',
      'Phone',
      'Email',
      'Company',
      'Deal Value',
      'Priority',
      'Status',
      'Assigned To',
      'Source',
      'Is Converted',
      'Converted Amount',
      'Converted Date',
      'Next Followup',
      'Created Date',
      'Notes',
      ...customFields.map((cf) => cf.fieldLabel || cf.fieldName),
    ];

    const json2csvParser = new Json2CsvParser({ fields });
    const csvData = json2csvParser.parse(flatData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`zokep_crm_leads_${Date.now()}.csv`);
    return res.send(csvData);
  } catch (error) {
    console.error('Export Leads CSV Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download Sample CSV Template for Bulk Lead Import
// @route   GET /api/leads/sample-csv
// @access  Private (Admin & Staff)
export const getSampleLeadCSV = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const customFields = await CustomField.find({ tenantId });

    const sampleRows = [
      {
        Name: 'Rahul Sharma',
        Phone: '+919876543210',
        Email: 'rahul.sharma@example.com',
        Company: 'Acme Innovations Pvt Ltd',
        'Deal Value': 50000,
        Source: 'meta_ads',
        Notes: 'Looking for multi-user CRM with WhatsApp integration',
      },
      {
        Name: 'Priya Patel',
        Phone: '+919812345678',
        Email: 'priya.patel@techcorp.in',
        Company: 'TechCorp Solutions',
        'Deal Value': 75000,
        Source: 'website_form',
        Notes: 'Requested live product demo for 15 sales reps',
      },
      {
        Name: 'Amit Verma',
        Phone: '+919700112233',
        Email: 'amit.verma@globalventures.com',
        Company: 'Global Ventures',
        'Deal Value': 30000,
        Source: 'whatsapp',
        Notes: 'Contacted via direct WhatsApp ad campaign',
      },
    ];

    if (customFields && customFields.length > 0) {
      sampleRows.forEach((row, idx) => {
        customFields.forEach((cf) => {
          row[cf.fieldLabel || cf.fieldName] = cf.fieldType === 'number' ? (idx + 1) * 10 : cf.fieldType === 'date' ? '2026-10-15' : 'Sample Value';
        });
      });
    }

    const json2csvParser = new Json2CsvParser();
    const csvData = json2csvParser.parse(sampleRows);

    res.header('Content-Type', 'text/csv');
    res.attachment('sample_lead_import_template.csv');
    return res.send(csvData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete single lead
// @route   DELETE /api/leads/:id
// @access  Private (Admin & Staff)
export const deleteLead = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    if (id === 'bulk-delete' || id === 'bulk') {
      return bulkDeleteLeads(req, res);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    await ActivityLog.deleteMany({ leadId: id, tenantId });
    await Lead.findOneAndDelete({ _id: id, tenantId });

    return res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk Delete Leads (Specific IDs or All Matching Active Filters)
// @route   POST /api/leads/bulk-delete
// @access  Private (Admin & Staff)
export const bulkDeleteLeads = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const {
      leadIds,
      selectAllMatching,
      excludeLeadIds,
      search,
      statusId,
      assignedTo,
      source,
      priority,
      isConverted,
    } = req.body || {};

    if (selectAllMatching) {
      const query = { tenantId };

      if (req.user.role === 'staff') {
        query.assignedTo = req.user._id;
      } else if (assignedTo) {
        if (assignedTo === 'unassigned') {
          query.assignedTo = null;
        } else if (mongoose.Types.ObjectId.isValid(assignedTo)) {
          query.assignedTo = assignedTo;
        }
      }

      if (statusId && mongoose.Types.ObjectId.isValid(statusId)) query.statusId = statusId;
      if (source) query.source = source;
      if (priority) query.priority = priority;
      if (isConverted !== undefined) {
        query.isConverted = isConverted === 'true' || isConverted === true;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
        ];
      }

      if (Array.isArray(excludeLeadIds) && excludeLeadIds.length > 0) {
        const validExcludes = excludeLeadIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
        if (validExcludes.length > 0) {
          query._id = { $nin: validExcludes };
        }
      }

      // Find matching lead IDs first to delete associated activity logs
      const matchingLeads = await Lead.find(query).select('_id').lean();
      const idsToDelete = matchingLeads.map((l) => l._id);

      if (idsToDelete.length === 0) {
        return res.json({ success: true, message: 'No matching leads found to delete', deletedCount: 0 });
      }

      await ActivityLog.deleteMany({ leadId: { $in: idsToDelete }, tenantId });
      const result = await Lead.deleteMany({ _id: { $in: idsToDelete }, tenantId });

      return res.json({
        success: true,
        message: `Successfully deleted all ${result.deletedCount} matching leads`,
        deletedCount: result.deletedCount,
      });
    }

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of lead IDs to delete' });
    }

    const validLeadIds = leadIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validLeadIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid lead IDs provided to delete' });
    }

    const deleteQuery = { _id: { $in: validLeadIds }, tenantId };
    if (req.user.role === 'staff') {
      deleteQuery.assignedTo = req.user._id;
    }

    // Delete associated ActivityLogs
    await ActivityLog.deleteMany({ leadId: { $in: validLeadIds }, tenantId });

    // Delete leads belonging to this tenant
    const result = await Lead.deleteMany(deleteQuery);

    return res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} leads`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Bulk Delete Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

