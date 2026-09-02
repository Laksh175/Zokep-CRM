import fs from 'fs';
import csv from 'csv-parser';
import { Parser as Json2CsvParser } from 'json2csv';
import Lead from '../models/Lead.js';
import LeadStatus from '../models/LeadStatus.js';
import CustomField from '../models/CustomField.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';
import { formatDate } from '../utils/dateFormatter.js';

// @desc    Get all leads with advanced filtering & role scoping
// @route   GET /api/leads
// @access  Private (Admin & Staff)
export const getLeads = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const {
      search,
      statusId,
      assignedTo,
      source,
      priority,
      isConverted,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { tenantId };

    // Staff can only view their own assigned leads
    if (req.user.role === 'staff') {
      query.assignedTo = req.user._id;
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

    if (isConverted !== undefined) {
      query.isConverted = isConverted === 'true';
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

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('statusId', 'name color isConvertedState isLostState')
      .populate('assignedTo', 'name email phone')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    return res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
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
      source: req.user.role === 'staff' ? 'staff_added' : source || 'manual',
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
    } = req.body;

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
    if (tags !== undefined) {
      lead.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (customFieldsData) {
      lead.customFieldsData = { ...lead.customFieldsData, ...customFieldsData };
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
      .populate('statusId', 'name color isConvertedState')
      .populate('assignedTo', 'name email');

    return res.json({ success: true, message: 'Lead updated successfully', data: updated });
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
      return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
    }

    const customFields = await CustomField.find({ tenantId });
    const defaultStatus = await LeadStatus.findOne({ tenantId, isDefault: true }) || (await LeadStatus.findOne({ tenantId }).sort({ order: 1 }));

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          fs.unlinkSync(req.file.path); // remove temp file

          let importedCount = 0;
          let skippedCount = 0;

          for (const row of results) {
            // Find fields flexibly (case insensitive keys)
            const getVal = (possibleKeys) => {
              for (const k of Object.keys(row)) {
                if (possibleKeys.includes(k.toLowerCase().trim())) return row[k];
              }
              return '';
            };

            const name = getVal(['name', 'lead name', 'full name', 'contact name']);
            const phone = getVal(['phone', 'mobile', 'contact', 'phone number', 'cell']);
            const email = getVal(['email', 'email address', 'mail']);
            const company = getVal(['company', 'organization', 'company name', 'business']);
            const dealValue = getVal(['deal value', 'dealvalue', 'value', 'budget', 'amount', 'price']);
            const notes = getVal(['notes', 'note', 'remarks', 'requirement', 'description']);

            if (!name || !phone) {
              skippedCount++;
              continue;
            }

            // Map custom fields
            const customData = {};
            for (const cf of customFields) {
              const cfVal = getVal([cf.fieldName.toLowerCase(), cf.fieldLabel.toLowerCase()]);
              if (cfVal) customData[cf.fieldName] = cfVal;
            }

            const lead = await Lead.create({
              tenantId,
              name: name.trim(),
              phone: String(phone).trim(),
              email: email ? String(email).trim().toLowerCase() : '',
              company: company ? String(company).trim() : '',
              dealValue: Number(dealValue) || 0,
              source: 'csv_import',
              notes: notes ? String(notes).trim() : '',
              statusId: defaultStatus?._id || null,
              customFieldsData: customData,
            });

            await ActivityLog.create({
              tenantId,
              leadId: lead._id,
              performedBy: req.user._id,
              type: 'created',
              title: 'Bulk Imported Lead',
              note: 'Imported via CSV batch upload',
            });

            importedCount++;
          }

          return res.json({
            success: true,
            message: `Successfully imported ${importedCount} leads (${skippedCount} skipped due to missing name/phone).`,
            importedCount,
            skippedCount,
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

// @desc    Export Leads to CSV
// @route   GET /api/leads/export-csv
// @access  Private (Admin & Staff)
export const exportLeadsCSV = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const query = { tenantId };

    if (req.user.role === 'staff') {
      query.assignedTo = req.user._id;
    }

    const leads = await Lead.find(query)
      .populate('statusId', 'name')
      .populate('assignedTo', 'name email');

    const customFields = await CustomField.find({ tenantId });

    const flatData = leads.map((l) => {
      const row = {
        'Lead ID': l._id.toString(),
        Name: l.name,
        Phone: l.phone,
        Email: l.email || '',
        Company: l.company || '',
        'Deal Value': l.dealValue || 0,
        Status: l.statusId?.name || 'New',
        'Assigned To': l.assignedTo?.name || 'Unassigned',
        Source: l.source,
        'Is Converted': l.isConverted ? 'Yes' : 'No',
        'Converted Amount': l.convertedDealAmount || 0,
        'Next Followup': l.nextFollowupDate ? formatDate(l.nextFollowupDate) : '',
        'Created Date': formatDate(l.createdAt),
        Notes: l.notes || '',
      };

      // Append custom fields
      for (const cf of customFields) {
        row[cf.fieldLabel] = l.customFieldsData?.[cf.fieldName] || '';
      }

      return row;
    });

    const json2csvParser = new Json2CsvParser();
    const csvData = json2csvParser.parse(flatData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`zokep_crm_leads_${Date.now()}.csv`);
    return res.send(csvData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete single lead
// @route   DELETE /api/leads/:id
// @access  Private (Admin Only)
export const deleteLead = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    await ActivityLog.deleteMany({ leadId: id, tenantId });
    await Lead.findOneAndDelete({ _id: id, tenantId });

    return res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
