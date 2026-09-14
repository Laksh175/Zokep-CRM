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
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import DynamicFieldRenderer from '../../components/DynamicFieldRenderer';
import WhatsAppModal from '../../components/WhatsAppModal';
import EmailModal from '../../components/EmailModal';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import CustomSelect from '../../components/CustomSelect';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatDateTime, formatTime, toDateTimeLocalInput } from '../../utils/date';
import confetti from 'canvas-confetti';

export const LeadManagementPage = () => {
  const { success, error } = useToast();

  const [leads, setLeads] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

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
  const [deletingLeadId, setDeletingLeadId] = useState(null);

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
    setPage(1);
    fetchLeads(1, limit);
  }, [statusFilter, assigneeFilter, sourceFilter, priorityFilter]);

  const fetchMetadata = async () => {
    try {
      const [statusRes, staffRes, fieldsRes] = await Promise.all([
        api.get('/settings/statuses'),
        api.get('/admin/staff'),
        api.get('/settings/custom-fields'),
      ]);
      if (statusRes && statusRes.success && Array.isArray(statusRes.data)) setStatuses(statusRes.data);
      if (staffRes && staffRes.success && Array.isArray(staffRes.data)) setStaffList(staffRes.data);
      if (fieldsRes && fieldsRes.success && Array.isArray(fieldsRes.data)) setCustomFields(fieldsRes.data);
    } catch (err) {
      console.warn('Metadata load error:', err.message);
    }
  };

  const fetchLeads = async (targetPage = page, targetLimit = limit) => {
    try {
      setLoading(true);
      const res = await api.get('/leads', {
        search,
        statusId: statusFilter,
        assignedTo: assigneeFilter,
        source: sourceFilter,
        priority: priorityFilter,
        page: targetPage,
        limit: targetLimit,
      });
      if (res && res.success && Array.isArray(res.data)) {
        setLeads(res.data);
        setTotalLeads(res.total ?? res.data.length);
        setTotalPages(res.totalPages || 1);
        setPage(res.page || targetPage);
      } else {
        setLeads([]);
        setTotalLeads(0);
        setTotalPages(1);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      fetchLeads(newPage, limit);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeads(1, limit);
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
      statusId: lead.statusId?._id || lead.statusId || '',
      assignedTo: lead.assignedTo?._id || lead.assignedTo || '',
      nextFollowupDate: toDateTimeLocalInput(lead.nextFollowupDate),
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
      const payload = {
        ...leadForm,
        nextFollowupDate: leadForm.nextFollowupDate ? new Date(leadForm.nextFollowupDate).toISOString() : null,
      };

      if (editingLeadId) {
        const res = await api.put(`/leads/${editingLeadId}`, payload);
        if (res.success) {
          success('Lead updated successfully');
          // Optimistically update in place
          if (res.data) {
            setLeads((prev) => prev.map((l) => (l._id === editingLeadId ? res.data : l)));
          }
        }
      } else {
        const res = await api.post('/leads', payload);
        if (res.success) {
          success('Lead created successfully');
          fetchLeads(1, limit);
        }
      }
      setLeadModalOpen(false);
    } catch (err) {
      error(err.message || 'Failed to save lead');
    } finally {
      setSubmittingLead(false);
    }
  };

  const openLeadDetails = async (lead) => {
    setActiveLead(lead);
    setNewStatusId(lead.statusId?._id || lead.statusId || '');
    setNewNextFollowup(toDateTimeLocalInput(lead.nextFollowupDate));
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
        nextFollowupDate: newNextFollowup ? new Date(newNextFollowup).toISOString() : null,
      });

      if (res.success) {
        success('Follow-up and status updated!');
        setActiveLead(res.data);
        setFollowupNote('');
        // Optimistically update lead in table
        if (res.data) {
          setLeads((prev) => prev.map((l) => (l._id === activeLead._id ? res.data : l)));
        }
        // Refresh activities
        const fresh = await api.get(`/leads/${activeLead._id}`);
        if (fresh.success) setLeadActivities(fresh.data.activities || []);
      }
    } catch (err) {
      error(err.message || 'Failed to record follow-up');
    } finally {
      setSavingFollowup(false);
    }
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
        fetchLeads(page, limit);
        if (activeLead?._id === lead._id) {
          openLeadDetails(res.data);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to convert lead');
    }
  };

  const handleDeleteLead = async (id, e) => {
    if (e && e.currentTarget) e.currentTarget.blur();
    if (!window.confirm('Are you sure you want to permanently delete this lead?')) return;
    try {
      setDeletingLeadId(id);
      const res = await api.delete(`/leads/${id}`);
      if (res.success) {
        success('Lead deleted');
        setLeads((prev) => prev.filter((l) => l._id !== id));
        setTotalLeads((prev) => Math.max(0, prev - 1));
        if (activeLead?._id === id) setDetailsModalOpen(false);
      }
    } catch (err) {
      error(err.message || 'Failed to delete lead');
    } finally {
      setDeletingLeadId(null);
    }
  };

  const handleQuickReassign = async (leadId, newAssignedTo) => {
    const previousLeads = [...leads];
    const staffObj = staffList.find((s) => s._id === newAssignedTo || s.id === newAssignedTo);

    // Optimistic UI update (0ms instant response)
    setLeads((prev) =>
      prev.map((l) =>
        l._id === leadId
          ? { ...l, assignedTo: staffObj ? { _id: staffObj._id || staffObj.id, name: staffObj.name, email: staffObj.email } : null }
          : l
      )
    );

    try {
      const res = await api.put(`/leads/${leadId}/reassign`, {
        assignedTo: newAssignedTo || null,
        assignedToId: newAssignedTo || null,
      });
      if (res.success) {
        success(res.message || 'Lead assignee updated successfully');
        if (res.data) {
          setLeads((prev) => prev.map((l) => (l._id === leadId ? res.data : l)));
        }
        if (activeLead && activeLead._id === leadId) {
          setActiveLead(res.data);
        }
      }
    } catch (err) {
      setLeads(previousLeads);
      error(err.message || 'Failed to reassign lead');
    }
  };

  const handleQuickStatusChange = async (leadId, newStatusId) => {
    const previousLeads = [...leads];
    const statusObj = statuses.find((s) => s._id === newStatusId);

    // Optimistic UI update (0ms instant response)
    setLeads((prev) =>
      prev.map((l) =>
        l._id === leadId
          ? { ...l, statusId: statusObj || l.statusId, isConverted: statusObj?.isConvertedState ? true : l.isConverted }
          : l
      )
    );

    try {
      const res = await api.put(`/leads/${leadId}/status`, { statusId: newStatusId });
      if (res && res.success) {
        success(res.message || 'Status updated successfully');
        if (res.data) {
          setLeads((prev) => prev.map((l) => (l._id === leadId ? res.data : l)));
        }
        if (activeLead && activeLead._id === leadId) {
          setActiveLead(res.data);
          setNewStatusId(newStatusId);
        }
      }
    } catch (err) {
      setLeads(previousLeads);
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
        fetchLeads(1, limit);
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
            <CustomSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="All Statuses"
              style={{ width: '160px' }}
              options={[
                { value: '', label: 'All Statuses' },
                ...statuses.map((st) => ({
                  value: st._id,
                  label: st.name,
                  color: st.color,
                })),
              ]}
            />

            {/* Staff Filter */}
            <CustomSelect
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              placeholder="All Team Members"
              style={{ width: '160px' }}
              options={[
                { value: '', label: 'All Team Members' },
                { value: 'unassigned', label: 'Unassigned Only' },
                ...staffList.map((s) => ({
                  value: s.id || s._id,
                  label: s.name,
                })),
              ]}
            />

            {/* Priority Filter */}
            <CustomSelect
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              placeholder="All Priority"
              style={{ width: '130px' }}
              options={[
                { value: '', label: 'All Priority' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
            />

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
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              padding: '4px 10px',
                              borderRadius: '20px',
                              backgroundColor: `${lead.statusId?.color || '#3b82f6'}18`,
                              color: lead.statusId?.color || '#3b82f6',
                              border: `1px solid ${lead.statusId?.color || '#3b82f6'}40`,
                              whiteSpace: 'nowrap',
                            }}
                            title="Pipeline status is updated by assigned Sales Staff"
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: lead.statusId?.color || '#3b82f6',
                              }}
                            />
                            {lead.statusId?.name || 'New Lead'}
                          </span>
                        </td>
                        <td>
                          <CustomSelect
                            value={lead.assignedTo?._id || lead.assignedTo?.id || (typeof lead.assignedTo === 'string' ? lead.assignedTo : '')}
                            onChange={(e) => handleQuickReassign(lead._id, e.target.value)}
                            placeholder="-- Unassigned --"
                            showArrow={true}
                            style={{ minWidth: '130px' }}
                            title="Assign to staff member"
                            options={[
                              { value: '', label: '-- Unassigned --' },
                              ...staffList.map((s) => ({
                                value: s._id || s.id,
                                label: s.name,
                              })),
                            ]}
                          />
                        </td>
                        <td>
                          {lead.nextFollowupDate ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '12px', color: '#d97706', fontWeight: 600 }}>
                                📅 {formatDate(lead.nextFollowupDate)}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                ⏰ {formatTime(lead.nextFollowupDate)}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>None</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {/* Edit Lead */}
                            <button
                              onClick={() => openEditLeadModal(lead)}
                              className="btn btn-secondary btn-action"
                              title="Edit Lead Information"
                            >
                              <Edit2 size={15} color="#003865" />
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
                              <WhatsAppIcon size={14} color="#ffffff" />
                              <span>WA</span>
                            </button>

                            {/* 1-Click Email */}
                            {lead.email && (
                              <button
                                onClick={() => {
                                  setQuickActionLead(lead);
                                  setEmailModalOpen(true);
                                }}
                                className="btn btn-secondary btn-action"
                                title="1-Click Email"
                              >
                                <Mail size={15} color="#0284c7" />
                              </button>
                            )}

                            {/* Convert */}
                            {!lead.isConverted && (
                              <button
                                onClick={() => handleConvertToCustomer(lead)}
                                className="btn btn-success btn-action"
                                title="Convert to Customer Deal"
                              >
                                <UserCheck size={15} color="#ffffff" />
                              </button>
                            )}

                            {/* Details */}
                            <button
                              onClick={() => openLeadDetails(lead)}
                              className="btn btn-secondary btn-action"
                              title="Open Details & Activity Log"
                            >
                              <ExternalLink size={15} color="#475569" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={(e) => handleDeleteLead(lead._id, e)}
                              className="btn btn-danger btn-action"
                              title="Delete Lead"
                              disabled={deletingLeadId === lead._id}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalLeads > 0 && (
              <div className="pagination-bar" style={{ marginTop: '16px' }}>
                <div className="pagination-info">
                  Showing <strong>{leads.length > 0 ? (page - 1) * limit + 1 : 0}</strong> to{' '}
                  <strong>{Math.min(page * limit, totalLeads)}</strong> of <strong>{totalLeads}</strong> leads
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <span>Per page:</span>
                    <select
                      className="pagination-select"
                      value={limit}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        setLimit(newLimit);
                        setPage(1);
                        fetchLeads(1, newLimit);
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div className="pagination-controls">
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      title="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2))
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        return (
                          <React.Fragment key={p}>
                            {prev && p - prev > 1 && <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>...</span>}
                            <button
                              className={`pagination-btn ${page === p ? 'active' : ''}`}
                              onClick={() => handlePageChange(p)}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      title="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
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
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              backgroundColor: `${status.color}18`,
                              color: status.color,
                              border: `1px solid ${status.color}30`,
                            }}
                            title="Pipeline status is updated by assigned Sales Staff"
                          >
                            {status.name}
                          </span>
                          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '140px' }}>
                            <CustomSelect
                              value={lead.assignedTo?._id || lead.assignedTo?.id || (typeof lead.assignedTo === 'string' ? lead.assignedTo : '')}
                              onChange={(e) => handleQuickReassign(lead._id, e.target.value)}
                              placeholder="-- Unassigned --"
                              title="Assign to staff"
                              options={[
                                { value: '', label: '-- Unassigned --' },
                                ...staffList.map((s) => ({
                                  value: s._id || s.id,
                                  label: s.name,
                                })),
                              ]}
                            />
                          </div>
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
          <div className="form-grid-2">
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

          <div className="form-grid-2">
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

          <div className="form-grid-2">
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
              <CustomSelect
                value={leadForm.priority}
                onChange={(e) => setLeadForm({ ...leadForm, priority: e.target.value })}
                options={[
                  { value: 'low', label: 'Low Priority' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High Priority' },
                  { value: 'urgent', label: 'Urgent 🔥' },
                ]}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Assign to Staff Member</label>
              <CustomSelect
                value={leadForm.assignedTo}
                onChange={(e) => setLeadForm({ ...leadForm, assignedTo: e.target.value })}
                placeholder="-- Unassigned --"
                options={[
                  { value: '', label: '-- Unassigned --' },
                  ...staffList.map((s) => ({
                    value: s.id || s._id,
                    label: `${s.name} (${s.email})`,
                  })),
                ]}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Pipeline Stage / Status <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>(Sales Staff Only)</span>
              </label>
              <CustomSelect
                value={leadForm.statusId}
                disabled={true}
                title="Pipeline status can only be updated by Sales Staff"
                options={statuses.map((st) => ({
                  value: st._id,
                  label: st.name,
                  color: st.color,
                }))}
              />
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
            <label className="form-label">Next Scheduled Follow-up (Date & Time)</label>
            <input
              type="datetime-local"
              className="form-input"
              value={leadForm.nextFollowupDate}
              onChange={(e) => setLeadForm({ ...leadForm, nextFollowupDate: e.target.value })}
            />
          </div>

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
                disabled={deletingLeadId === activeLead._id}
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
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={13} color="var(--primary-500)" />
                    {activeLead.phone}
                  </span>
                  {activeLead.email && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={13} color="#0284c7" />
                      {activeLead.email}
                    </span>
                  )}
                  {activeLead.company && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Building2 size={13} color="var(--text-muted)" />
                      {activeLead.company}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setQuickActionLead(activeLead);
                    setWhatsAppModalOpen(true);
                  }}
                  className="btn btn-whatsapp btn-sm"
                >
                  <WhatsAppIcon size={14} color="#ffffff" />
                  <span>WhatsApp</span>
                </button>
                {activeLead.email && (
                  <button
                    onClick={() => {
                      setQuickActionLead(activeLead);
                      setEmailModalOpen(true);
                    }}
                    className="btn btn-email btn-sm"
                  >
                    <Mail size={14} color="#ffffff" />
                    <span>Email</span>
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
              <CustomSelect
                value={activeLead.assignedTo?._id || activeLead.assignedTo?.id || (typeof activeLead.assignedTo === 'string' ? activeLead.assignedTo : '')}
                onChange={(e) => handleQuickReassign(activeLead._id, e.target.value)}
                placeholder="-- Unassigned --"
                style={{ width: '220px' }}
                options={[
                  { value: '', label: '-- Unassigned --' },
                  ...staffList.map((s) => ({
                    value: s._id || s.id,
                    label: `${s.name} (${s.email})`,
                  })),
                ]}
              />
            </div>

            {/* Log Followup & Update Status Section */}
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>
                Log Follow-up & Update Pipeline Status
              </h4>
              <div className="form-grid-2" style={{ marginBottom: '10px' }}>
                <div>
                  <label className="form-label">
                    Update Status <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>(Sales Staff Only)</span>
                  </label>
                  <CustomSelect
                    value={newStatusId}
                    disabled={true}
                    title="Pipeline status can only be updated by Sales Staff"
                    options={statuses.map((st) => ({
                      value: st._id,
                      label: st.name,
                      color: st.color,
                    }))}
                  />
                </div>
                <div>
                  <label className="form-label">Next Follow-up Date & Time</label>
                  <input
                    type="datetime-local"
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
                {savingFollowup ? (
                  <>
                    <span className="btn-spinner" />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save Follow-up & Activity'
                )}
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
              {uploading ? (
                <>
                  <span className="btn-spinner" />
                  <span>Importing CSV...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Start Import</span>
                </>
              )}
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
      {quickActionLead && (
        <WhatsAppModal
          isOpen={whatsAppModalOpen}
          onClose={() => {
            setWhatsAppModalOpen(false);
            setQuickActionLead(null);
          }}
          lead={quickActionLead}
          onFollowupSuccess={fetchLeads}
        />
      )}

      {/* 1-CLICK EMAIL (NODEMAILER) MODAL */}
      {quickActionLead && (
        <EmailModal
          isOpen={emailModalOpen}
          onClose={() => {
            setEmailModalOpen(false);
            setQuickActionLead(null);
          }}
          lead={quickActionLead}
          onEmailSuccess={fetchLeads}
        />
      )}
    </div>
  );
};

export default LeadManagementPage;
