import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Upload,
  Download,
  Filter,
  Columns,
  List,
  Phone,
  Mail,
  Building2,
  Calendar,
  DollarSign,
  User,
  MessageSquare,
  Send,
  MoreVertical,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Trash2,
  Edit2,
  UserCheck,
  RefreshCw,
  FolderKanban,
} from 'lucide-react';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import DynamicFieldRenderer from '../../components/DynamicFieldRenderer';
import WhatsAppModal from '../../components/WhatsAppModal';
import EmailModal from '../../components/EmailModal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatDateTime } from '../../utils/date';
import confetti from 'canvas-confetti';

export const LeadManagementPage = () => {
  const { success, error } = useToast();

  const [leads, setLeads] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Add/Edit Lead Modal State
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    dealValue: 0,
    source: 'manual',
    notes: '',
    priority: 'medium',
    statusId: '',
    assignedTo: '',
    nextFollowupDate: '',
    customFieldsData: {},
  });

  // Lead Details & Followup Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeLead, setActiveLead] = useState(null);
  const [leadActivities, setLeadActivities] = useState([]);
  const [followupNote, setFollowupNote] = useState('');
  const [newStatusId, setNewStatusId] = useState('');
  const [newNextFollowup, setNewNextFollowup] = useState('');
  const [savingFollowup, setSavingFollowup] = useState(false);

  // Quick Action Modals
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [quickActionLead, setQuickActionLead] = useState(null);

  // Bulk CSV Upload State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, assigneeFilter, sourceFilter, priorityFilter]);

  const fetchMetadata = async () => {
    try {
      const [statusRes, staffRes, fieldsRes] = await Promise.all([
        api.get('/settings/statuses'),
        api.get('/admin/staff'),
        api.get('/settings/custom-fields'),
      ]);
      if (statusRes.success) setStatuses(statusRes.data);
      if (staffRes.success) setStaffList(staffRes.data);
      if (fieldsRes.success) setCustomFields(fieldsRes.data);
    } catch (err) {
      console.warn('Metadata load error:', err.message);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leads', {
        search,
        statusId: statusFilter,
        assignedTo: assigneeFilter,
        source: sourceFilter,
        priority: priorityFilter,
      });
      if (res.success) {
        setLeads(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLeads();
  };

  const openAddLeadModal = () => {
    setEditingLeadId(null);
    setLeadForm({
      name: '',
      phone: '',
      email: '',
      company: '',
      dealValue: 0,
      source: 'manual',
      notes: '',
      priority: 'medium',
      statusId: statuses[0]?._id || '',
      assignedTo: '',
      nextFollowupDate: '',
      customFieldsData: {},
    });
    setLeadModalOpen(true);
  };

  const openEditLeadModal = (lead) => {
    setEditingLeadId(lead._id);
    setLeadForm({
      name: lead.name,
      phone: lead.phone,
      email: lead.email || '',
      company: lead.company || '',
      dealValue: lead.dealValue || 0,
      source: lead.source || 'manual',
      notes: lead.notes || '',
      priority: lead.priority || 'medium',
      statusId: lead.statusId?._id || '',
      assignedTo: lead.assignedTo?._id || '',
      nextFollowupDate: lead.nextFollowupDate ? String(lead.nextFollowupDate).split('T')[0] : '',
      customFieldsData: lead.customFieldsData || {},
    });
    setLeadModalOpen(true);
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) {
      error('Name and Phone number are required');
      return;
    }

    try {
      setSubmittingLead(true);
      if (editingLeadId) {
        const res = await api.put(`/leads/${editingLeadId}`, leadForm);
        if (res.success) success('Lead updated successfully');
      } else {
        const res = await api.post('/leads', leadForm);
        if (res.success) success('Lead created successfully');
      }
      setLeadModalOpen(false);
      fetchLeads();
    } catch (err) {
      error(err.message || 'Failed to save lead');
    } finally {
      setSubmittingLead(false);
    }
  };

  const openLeadDetails = async (lead) => {
    setActiveLead(lead);
    setNewStatusId(lead.statusId?._id || '');
    setNewNextFollowup(lead.nextFollowupDate ? String(lead.nextFollowupDate).split('T')[0] : '');
    setFollowupNote('');
    setDetailsModalOpen(true);

    try {
      const res = await api.get(`/leads/${lead._id}`);
      if (res.success) {
        setActiveLead(res.data.lead);
        setLeadActivities(res.data.activities || []);
      }
    } catch (err) {
      console.warn('Activity fetch error:', err.message);
    }
  };

  const handleSaveFollowup = async () => {
    if (!activeLead) return;
    try {
      setSavingFollowup(true);
      const res = await api.post(`/leads/${activeLead._id}/followup`, {
        statusId: newStatusId,
        note: followupNote,
        nextFollowupDate: newNextNextDateFormatted(newNextFollowup),
      });

      if (res.success) {
        success('Follow-up and status updated!');
        setActiveLead(res.data);
        setFollowupNote('');
        // Refresh activities
        const fresh = await api.get(`/leads/${activeLead._id}`);
        if (fresh.success) setLeadActivities(fresh.data.activities || []);
        fetchLeads();
      }
    } catch (err) {
      error(err.message || 'Failed to record follow-up');
    } finally {
      setSavingFollowup(false);
    }
  };

  const newNextNextDateFormatted = (dt) => {
    if (!dt) return null;
    return new Date(dt).toISOString();
  };

  const handleConvertToCustomer = async (lead) => {
    const amountStr = window.prompt(`Confirm deal closed revenue amount (₹):`, lead.dealValue || 0);
    if (amountStr === null) return;

    try {
      const res = await api.post(`/leads/${lead._id}/convert`, {
        dealAmount: Number(amountStr) || lead.dealValue || 0,
        note: 'Deal marked converted via CRM workspace.',
      });

      if (res.success) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        success('🎉 Lead successfully converted to Customer!');
        fetchLeads();
        if (activeLead?._id === lead._id) {
          openLeadDetails(res.data);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to convert lead');
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this lead?')) return;
    try {
      const res = await api.delete(`/leads/${id}`);
      if (res.success) {
        success('Lead deleted');
        setDetailsModalOpen(false);
        fetchLeads();
      }
    } catch (err) {
      error(err.message || 'Failed to delete lead');
    }
  };

  const handleQuickReassign = async (leadId, newAssignedTo) => {
    try {
      const res = await api.put(`/leads/${leadId}/reassign`, {
        assignedTo: newAssignedTo || null,
        assignedToId: newAssignedTo || null,
      });
      if (res.success) {
        success(res.message || 'Lead assignee updated successfully');
        fetchLeads();
        if (activeLead && activeLead._id === leadId) {
          setActiveLead(res.data);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to reassign lead');
    }
  };

  const handleQuickStatusChange = async (leadId, newStatusId) => {
    try {
      const res = await api.put(`/leads/${leadId}/status`, { statusId: newStatusId });
      if (res.success) {
        success(res.message || 'Status updated successfully');
        fetchLeads();
        if (activeLead && activeLead._id === leadId) {
          setActiveLead(res.data);
          setNewStatusId(newStatusId);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to update status');
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await api.get('/leads/export-csv');
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `zokep_leads_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('CSV exported successfully!');
    } catch (err) {
      error('Failed to export CSV');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      error('Please select a CSV file to upload');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', csvFile);

      const res = await api.upload('/leads/bulk-upload', formData);
      if (res.success) {
        success(res.message);
        setUploadModalOpen(false);
        setCsvFile(null);
        fetchLeads();
      }
    } catch (err) {
      error(err.message || 'Bulk upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Header
        title="Leads Pipeline Management"
        subtitle="Track, assign, filter, and convert leads with 1-click WhatsApp and Email tools."
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => setUploadModalOpen(true)}>
              <Upload size={16} />
              Bulk CSV Import
            </button>
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              <Download size={16} />
              Export CSV
            </button>
            <button className="btn btn-primary" onClick={openAddLeadModal}>
              <Plus size={16} />
              Add Lead
            </button>
          </>
        }
      />

      <div className="page-wrapper">
        {/* Filter & View Switcher Bar */}
        <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search name, phone, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary">
              <Search size={16} />
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Status Filter */}
            <select
              className="form-select"
              style={{ width: '160px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {statuses.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.name}
                </option>
              ))}
            </select>

            {/* Staff Filter */}
            <select
              className="form-select"
              style={{ width: '160px' }}
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <option value="">All Team Members</option>
              <option value="unassigned">Unassigned Only</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              className="form-select"
              style={{ width: '130px' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* View Toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-medium)' }}>
              <button
                className={`btn-icon ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: 32, height: 32, borderRadius: '6px' }}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button
                className={`btn-icon ${viewMode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: 32, height: 32, borderRadius: '6px' }}
                onClick={() => setViewMode('kanban')}
                title="Kanban Board View"
              >
                <Columns size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: DATA TABLE */}
        {viewMode === 'table' && (
          <div className="glass-panel" style={{ padding: '20px' }}>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '24px 0' }}>Loading leads...</p>
            ) : leads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <FolderKanban size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No Leads Found</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                  Create your first lead or import via CSV to get started.
                </p>
                <button className="btn btn-primary" onClick={openAddLeadModal}>
                  <Plus size={16} /> Add First Lead
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Lead Contact</th>
                      <th>Company</th>
                      <th>Deal Value</th>
                      <th>Pipeline Status</th>
                      <th>Assigned To</th>
                      <th>Next Follow-up</th>
                      <th>1-Click Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead._id}>
                        <td>
                          <a
                            href="#details"
                            onClick={(e) => {
                              e.preventDefault();
                              openLeadDetails(lead);
                            }}
                            style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}
                          >
                            {lead.name}
                          </a>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {lead.phone} {lead.email && `• ${lead.email}`}
                          </div>
                        </td>
                        <td>{lead.company || '-'}</td>
                        <td style={{ fontWeight: 700, color: lead.isConverted ? '#10b981' : 'var(--text-primary)' }}>
                          ₹{(lead.dealValue || 0).toLocaleString('en-IN')}
                        </td>
                        <td>
                          <select
                            className="form-select"
                            style={{
                              fontSize: '12px',
                              padding: '4px 8px',
                              height: 'auto',
                              minWidth: '125px',
                              fontWeight: 600,
                              background: 'var(--bg-surface)',
                              borderLeft: `4px solid ${lead.statusId?.color || '#3b82f6'}`,
                              borderRadius: '6px',
                            }}
                            value={lead.statusId?._id || lead.statusId?.id || (typeof lead.statusId === 'string' ? lead.statusId : '')}
                            onChange={(e) => handleQuickStatusChange(lead._id, e.target.value)}
                            title="Change Lead Pipeline Status"
                          >
                            {statuses.map((st) => (
                              <option key={st._id || st.id} value={st._id || st.id}>
                                {st.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            className="form-select"
                            style={{
                              fontSize: '12px',
                              padding: '4px 8px',
                              height: 'auto',
                              minWidth: '130px',
                              background: 'var(--bg-surface)',
                              borderRadius: '6px',
                            }}
                            value={lead.assignedTo?._id || lead.assignedTo?.id || (typeof lead.assignedTo === 'string' ? lead.assignedTo : '')}
                            onChange={(e) => handleQuickReassign(lead._id, e.target.value)}
                            title="Assign to staff member"
                          >
                            <option value="">-- Unassigned --</option>
                            {staffList.map((s) => (
                              <option key={s._id || s.id} value={s._id || s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          {lead.nextFollowupDate ? (
                            <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                              {formatDate(lead.nextFollowupDate)}
                            </span>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>None</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {/* Edit Lead */}
                            <button
                              onClick={() => openEditLeadModal(lead)}
                              className="btn btn-secondary btn-sm"
                              title="Edit Lead Information"
                            >
                              <Edit2 size={13} />
                            </button>

                            {/* 1-Click WhatsApp */}
                            <button
                              onClick={() => {
                                setQuickActionLead(lead);
                                setWhatsAppModalOpen(true);
                              }}
                              className="btn btn-whatsapp btn-sm"
                              title="1-Click WhatsApp"
                            >
                              <MessageSquare size={13} />
                              WA
                            </button>

                            {/* 1-Click Email */}
                            {lead.email && (
                              <button
                                onClick={() => {
                                  setQuickActionLead(lead);
                                  setEmailModalOpen(true);
                                }}
                                className="btn btn-secondary btn-sm"
                                title="1-Click Nodemailer Email"
                              >
                                <Mail size={13} />
                              </button>
                            )}

                            {/* Convert */}
                            {!lead.isConverted && (
                              <button
                                onClick={() => handleConvertToCustomer(lead)}
                                className="btn btn-success btn-sm"
                                title="Convert to Customer"
                              >
                                <UserCheck size={13} />
                              </button>
                            )}

                            {/* Details */}
                            <button
                              onClick={() => openLeadDetails(lead)}
                              className="btn btn-secondary btn-sm"
                              title="Open Details & Timeline"
                            >
                              <ExternalLink size={13} />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteLead(lead._id)}
                              className="btn btn-danger btn-sm"
                              title="Delete Lead"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: KANBAN BOARD */}
        {viewMode === 'kanban' && (
          <div className="kanban-board">
            {statuses.map((status) => {
              const columnLeads = leads.filter((l) => String(l.statusId?._id) === String(status._id));

              return (
                <div key={status._id} className="kanban-col">
                  <div className="kanban-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: status.color }} />
                      <strong style={{ fontSize: '14px' }}>{status.name}</strong>
                    </div>
                    <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                      {columnLeads.length}
                    </span>
                  </div>

                  <div className="kanban-cards">
                    {columnLeads.map((lead) => (
                      <div
                        key={lead._id}
                        className="kanban-card"
                        onClick={() => openLeadDetails(lead)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{lead.name}</strong>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontWeight: 700, color: '#10b981', fontSize: '13px' }}>
                              ₹{lead.dealValue || 0}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditLeadModal(lead);
                              }}
                              className="btn-icon btn-secondary"
                              style={{ width: 22, height: 22, padding: 0 }}
                              title="Edit Lead"
                            >
                              <Edit2 size={11} />
                            </button>
                          </div>
                        </div>
                        <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {lead.company || lead.phone}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                          <select
                            className="form-select"
                            style={{ fontSize: '11px', padding: '2px 4px', height: 'auto', maxWidth: '110px' }}
                            value={lead.statusId?._id || lead.statusId?.id || (typeof lead.statusId === 'string' ? lead.statusId : '')}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleQuickStatusChange(lead._id, e.target.value)}
                            title="Move Stage"
                          >
                            {statuses.map((st) => (
                              <option key={st._id || st.id} value={st._id || st.id}>
                                {st.name}
                              </option>
                            ))}
                          </select>
                          <select
                            className="form-select"
                            style={{ fontSize: '11px', padding: '2px 4px', height: 'auto', maxWidth: '110px' }}
                            value={lead.assignedTo?._id || lead.assignedTo?.id || (typeof lead.assignedTo === 'string' ? lead.assignedTo : '')}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleQuickReassign(lead._id, e.target.value)}
                            title="Assign to staff"
                          >
                            <option value="">-- Unassigned --</option>
                            {staffList.map((s) => (
                              <option key={s._id || s.id} value={s._id || s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                          {lead.isConverted && <span style={{ color: '#10b981', fontWeight: 700 }}>Won 🎉</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT LEAD MODAL */}
      <Modal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        title={editingLeadId ? 'Edit Lead Information' : 'Add New Lead to CRM'}
        maxWidth="680px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setLeadModalOpen(false)} disabled={submittingLead}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleLeadSubmit} disabled={submittingLead}>
              {submittingLead ? 'Saving...' : editingLeadId ? 'Update Lead' : 'Create Lead'}
            </button>
          </>
        }
      >
        <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Base Mandatory Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Full Name <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                className="form-input"
                value={leadForm.name}
                onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Phone Number <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+91 9876543210"
                className="form-input"
                value={leadForm.phone}
                onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                className="form-input"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Company / Business</label>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                className="form-input"
                value={leadForm.company}
                onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Potential Deal Value (₹)</label>
              <input
                type="number"
                min={0}
                className="form-input"
                value={leadForm.dealValue}
                onChange={(e) => setLeadForm({ ...leadForm, dealValue: Number(e.target.value) })}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Lead Priority</label>
              <select
                className="form-select"
                value={leadForm.priority}
                onChange={(e) => setLeadForm({ ...leadForm, priority: e.target.value })}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent 🔥</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Assign to Staff Member</label>
              <select
                className="form-select"
                value={leadForm.assignedTo}
                onChange={(e) => setLeadForm({ ...leadForm, assignedTo: e.target.value })}
              >
                <option value="">-- Unassigned --</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Pipeline Stage / Status</label>
              <select
                className="form-select"
                value={leadForm.statusId}
                onChange={(e) => setLeadForm({ ...leadForm, statusId: e.target.value })}
              >
                {statuses.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Extra Custom Fields defined by Admin */}
          {customFields.length > 0 && (
            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Industry Custom Fields:
              </h4>
              <DynamicFieldRenderer
                fields={customFields}
                values={leadForm.customFieldsData}
                onChange={(updated) => setLeadForm({ ...leadForm, customFieldsData: updated })}
              />
            </div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Initial Notes / Requirement Overview</label>
            <textarea
              className="form-textarea"
              placeholder="Requirement details or client preferences..."
              value={leadForm.notes}
              onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* LEAD DETAILS & TIMELINE DRAWER MODAL */}
      {activeLead && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={`Lead Details: ${activeLead.name}`}
          maxWidth="760px"
          footer={
            <>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteLead(activeLead._id)}
                style={{ marginRight: 'auto' }}
              >
                <Trash2 size={14} /> Delete
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setDetailsModalOpen(false);
                  openEditLeadModal(activeLead);
                }}
              >
                <Edit2 size={14} /> Edit Info
              </button>
              <button className="btn btn-secondary" onClick={() => setDetailsModalOpen(false)}>
                Close
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Quick Action Banner */}
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>{activeLead.name}</h3>
                  <Badge color={activeLead.statusId?.color || '#3b82f6'}>
                    {activeLead.statusId?.name || 'New'}
                  </Badge>
                  {activeLead.isConverted && (
                    <Badge color="#10b981">Won Customer 🎉</Badge>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  📞 {activeLead.phone} {activeLead.email && `• ✉️ ${activeLead.email}`} {activeLead.company && `• 🏢 ${activeLead.company}`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setQuickActionLead(activeLead);
                    setWhatsAppModalOpen(true);
                  }}
                  className="btn btn-whatsapp btn-sm"
                >
                  <MessageSquare size={14} />
                  WhatsApp
                </button>
                {activeLead.email && (
                  <button
                    onClick={() => {
                      setQuickActionLead(activeLead);
                      setEmailModalOpen(true);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <Mail size={14} />
                    Email
                  </button>
                )}
                {!activeLead.isConverted && (
                  <button
                    onClick={() => handleConvertToCustomer(activeLead)}
                    className="btn btn-success btn-sm"
                  >
                    <UserCheck size={14} />
                    Convert to Customer
                  </button>
                )}
              </div>
            </div>

            {/* Custom Fields Values Display */}
            {activeLead.customFieldsData && Object.keys(activeLead.customFieldsData).length > 0 && (
              <div style={{ background: 'var(--bg-surface)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Custom Business Fields:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {Object.entries(activeLead.customFieldsData).map(([k, v]) => (
                    <div key={k} style={{ fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                        {k.replace(/_/g, ' ')}:
                      </span>{' '}
                      <strong>{Array.isArray(v) ? v.join(', ') : String(v)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lead Assignment Card */}
            <div style={{ background: 'var(--bg-surface)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} color="var(--primary-400)" />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Assigned Consultant:</span>
              </div>
              <select
                className="form-select"
                style={{ maxWidth: '220px', fontSize: '13px', padding: '4px 8px' }}
                value={activeLead.assignedTo?._id || activeLead.assignedTo?.id || (typeof activeLead.assignedTo === 'string' ? activeLead.assignedTo : '')}
                onChange={(e) => handleQuickReassign(activeLead._id, e.target.value)}
              >
                <option value="">-- Unassigned --</option>
                {staffList.map((s) => (
                  <option key={s._id || s.id} value={s._id || s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Log Followup & Update Status Section */}
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>
                Log Follow-up & Update Pipeline Status
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                <div>
                  <label className="form-label">Update Status</label>
                  <select
                    className="form-select"
                    value={newStatusId}
                    onChange={(e) => setNewStatusId(e.target.value)}
                  >
                    {statuses.map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Next Follow-up Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newNextFollowup}
                    onChange={(e) => setNewNextFollowup(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: '0 0 10px' }}>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '60px' }}
                  placeholder="Enter meeting notes, call feedback, or client response..."
                  value={followupNote}
                  onChange={(e) => setFollowupNote(e.target.value)}
                />
              </div>

              <button
                onClick={handleSaveFollowup}
                className="btn btn-primary btn-sm"
                disabled={savingFollowup}
              >
                {savingFollowup ? 'Saving...' : 'Save Follow-up & Activity'}
              </button>
            </div>

            {/* Activity History Timeline */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Activity & Timeline History</h4>
              {leadActivities.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No activities logged yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {leadActivities.map((act) => (
                    <div
                      key={act._id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '13px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong>{act.title}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {formatDateTime(act.createdAt)} • by {act.performedBy?.name || 'User'}
                        </span>
                      </div>
                      {act.note && <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{act.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* BULK CSV UPLOAD MODAL */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Bulk Import Leads via CSV"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setUploadModalOpen(false)} disabled={uploading}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleBulkUpload} disabled={uploading || !csvFile}>
              <Upload size={16} />
              {uploading ? 'Importing CSV...' : 'Start Import'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Upload a CSV file containing lead records. Columns supported include <code>Name</code>, <code>Phone</code>, <code>Email</code>, <code>Company</code>, <code>Deal Value</code>, <code>Notes</code>, and custom fields.
          </p>

          <div style={{ border: '2px dashed var(--border-medium)', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
              style={{ display: 'block', margin: '0 auto' }}
            />
            {csvFile && (
              <p style={{ marginTop: '8px', fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* 1-CLICK WHATSAPP MODAL */}
      <WhatsAppModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        lead={quickActionLead}
        onFollowupSuccess={fetchLeads}
      />

      {/* 1-CLICK EMAIL (NODEMAILER) MODAL */}
      <EmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        lead={quickActionLead}
        onEmailSuccess={fetchLeads}
      />
    </div>
  );
};

export default LeadManagementPage;
