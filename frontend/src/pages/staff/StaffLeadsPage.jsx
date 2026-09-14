import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Mail,
  UserCheck,
  Calendar,
  Phone,
  Building2,
  ExternalLink,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
import { formatDate, formatTime, formatDateTime, toDateTimeLocalInput, isToday, isOverdue } from '../../utils/date';
import confetti from 'canvas-confetti';

export const StaffLeadsPage = () => {
  const { success, error } = useToast();

  const [leads, setLeads] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Add Lead Modal (Auto-assigned to self)
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    dealValue: 0,
    notes: '',
    priority: 'medium',
    statusId: '',
    nextFollowupDate: '',
    customFieldsData: {},
  });

  // Lead Details & Follow-up Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeLead, setActiveLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [followupNote, setFollowupNote] = useState('');
  const [newStatusId, setNewStatusId] = useState('');
  const [newNextFollowup, setNewNextFollowup] = useState('');
  const [savingFollowup, setSavingFollowup] = useState(false);

  // Quick Action Modals
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [quickActionLead, setQuickActionLead] = useState(null);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchMyLeads(1, limit);
  }, [statusFilter, priorityFilter]);

  const fetchMetadata = async () => {
    try {
      const [statusRes, fieldsRes] = await Promise.all([
        api.get('/settings/statuses'),
        api.get('/settings/custom-fields'),
      ]);
      if (statusRes && statusRes.success && Array.isArray(statusRes.data)) setStatuses(statusRes.data);
      if (fieldsRes && fieldsRes.success && Array.isArray(fieldsRes.data)) setCustomFields(fieldsRes.data);
    } catch (err) {
      console.warn('Metadata load warning:', err.message);
    }
  };

  const fetchMyLeads = async (pageToFetch = page, limitToFetch = limit) => {
    try {
      setLoading(true);
      const res = await api.get('/leads', {
        search,
        statusId: statusFilter,
        priority: priorityFilter,
        page: pageToFetch,
        limit: limitToFetch,
      });

      if (res && res.success) {
        if (Array.isArray(res.data)) {
          setLeads(res.data);
          setTotalLeads(res.data.length);
          setTotalPages(1);
        } else if (res.data && Array.isArray(res.data.leads)) {
          setLeads(res.data.leads);
          setTotalLeads(res.data.totalLeads || 0);
          setTotalPages(res.data.totalPages || 1);
          setPage(res.data.page || pageToFetch);
        }
      } else {
        setLeads([]);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch your leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMyLeads(1, limit);
  };

  const openAddModal = () => {
    setLeadForm({
      name: '',
      phone: '',
      email: '',
      company: '',
      dealValue: 0,
      notes: '',
      priority: 'medium',
      statusId: statuses[0]?._id || '',
      nextFollowupDate: '',
      customFieldsData: {},
    });
    setAddModalOpen(true);
  };

  const handleAddLead = async (e) => {
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
      const res = await api.post('/leads', payload);
      if (res.success) {
        success('Lead added and assigned to you!');
        setAddModalOpen(false);
        fetchMyLeads(1, limit);
      }
    } catch (err) {
      error(err.message || 'Failed to add lead');
    } finally {
      setSubmittingLead(false);
    }
  };

  const openLeadDetails = async (lead) => {
    setActiveLead(lead);
    setNewStatusId(lead.statusId?._id || lead.statusId?.id || (typeof lead.statusId === 'string' ? lead.statusId : ''));
    setNewNextFollowup(lead.nextFollowupDate ? toDateTimeLocalInput(lead.nextFollowupDate) : '');
    setFollowupNote('');
    setDetailsModalOpen(true);

    try {
      const res = await api.get(`/leads/${lead._id}`);
      if (res.success) {
        setActiveLead(res.data.lead);
        setActivities(res.data.activities || []);
      }
    } catch (err) {
      console.warn('Activity load error:', err.message);
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

        // 0ms Optimistic UI update in current table view
        setLeads((prev) =>
          prev.map((ld) => (ld._id === activeLead._id ? res.data : ld))
        );

        const fresh = await api.get(`/leads/${activeLead._id}`);
        if (fresh.success) setActivities(fresh.data.activities || []);
      }
    } catch (err) {
      error(err.message || 'Failed to update follow-up');
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
        note: 'Deal closed by consultant.',
      });

      if (res.success) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        success('🎉 Congratulations on closing this deal!');
        // 0ms Optimistic UI update
        setLeads((prev) =>
          prev.map((ld) =>
            ld._id === lead._id
              ? { ...ld, isConverted: true, dealValue: Number(amountStr) || lead.dealValue }
              : ld
          )
        );
        if (activeLead?._id === lead._id) {
          openLeadDetails(res.data);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to convert lead');
    }
  };

  const handleQuickStatusChange = async (leadId, newStatusIdVal) => {
    const previousLeads = [...leads];
    const targetStatusObj = statuses.find((s) => s._id === newStatusIdVal);

    // 0ms Optimistic UI update - eliminates UI lag
    setLeads((prev) =>
      prev.map((ld) =>
        ld._id === leadId
          ? { ...ld, statusId: targetStatusObj || newStatusIdVal }
          : ld
      )
    );

    try {
      const res = await api.put(`/leads/${leadId}`, { statusId: newStatusIdVal });
      if (res && res.success) {
        success(res.message || 'Status updated successfully');
        if (activeLead && activeLead._id === leadId) {
          setActiveLead(res.data);
          setNewStatusId(newStatusIdVal);
        }
      }
    } catch (err) {
      setLeads(previousLeads);
      error(err.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <Header
        title="My Assigned Leads"
        subtitle="Manage and follow up on your assigned leads with 1-click WhatsApp and Email tools."
        actions={
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} />
            Add New Lead
          </button>
        }
      />

      <div className="page-wrapper">
        {/* Filter Bar */}
        <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by name, phone, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary">
              <Search size={16} />
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
          </div>
        </div>

        {/* Leads Table */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>Loading your leads...</p>
          ) : leads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CheckCircle2 size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No Leads Assigned</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                You can add new leads yourself or wait for your team admin to assign leads.
              </p>
              <button className="btn btn-primary" onClick={openAddModal}>
                <Plus size={16} /> Add Lead for Myself
              </button>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Lead Contact</th>
                      <th>Company</th>
                      <th>Deal Value</th>
                      <th>Status</th>
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
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {lead.phone} {lead.email && `• ${lead.email}`}
                          </div>
                        </td>
                        <td>{lead.company || '-'}</td>
                        <td style={{ fontWeight: 700, color: lead.isConverted ? '#10b981' : 'var(--text-primary)' }}>
                          ₹{(lead.dealValue || 0).toLocaleString('en-IN')}
                        </td>
                        <td>
                          <CustomSelect
                            value={lead.statusId?._id || lead.statusId?.id || (typeof lead.statusId === 'string' ? lead.statusId : '')}
                            onChange={(e) => handleQuickStatusChange(lead._id, e.target.value)}
                            style={{ minWidth: '135px' }}
                            options={statuses.map((st) => ({
                              value: st._id,
                              label: st.name,
                              color: st.color,
                            }))}
                          />
                        </td>
                        <td>
                          {lead.nextFollowupDate ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: isOverdue(lead.nextFollowupDate)
                                    ? '#ef4444'
                                    : isToday(lead.nextFollowupDate)
                                    ? '#10b981'
                                    : '#f59e0b',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Calendar size={13} />
                                {formatDate(lead.nextFollowupDate)}
                                {isToday(lead.nextFollowupDate) && (
                                  <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '10px', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                                    TODAY
                                  </span>
                                )}
                                {isOverdue(lead.nextFollowupDate) && !isToday(lead.nextFollowupDate) && (
                                  <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '10px', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                                    OVERDUE
                                  </span>
                                )}
                              </span>
                              {formatTime(lead.nextFollowupDate) && (
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={11} />
                                  {formatTime(lead.nextFollowupDate)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>None</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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

                            {!lead.isConverted && (
                              <button
                                onClick={() => handleConvertToCustomer(lead)}
                                className="btn btn-success btn-action"
                                title="Convert to Customer Deal"
                              >
                                <UserCheck size={15} color="#ffffff" />
                              </button>
                            )}

                            <button
                              onClick={() => openLeadDetails(lead)}
                              className="btn btn-secondary btn-action"
                              title="Update Follow-up & View Activity"
                            >
                              <Clock size={15} color="#475569" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              {totalPages > 0 && totalLeads > 0 && (
                <div className="pagination-bar">
                  <div className="pagination-info">
                    Showing <strong>{leads.length > 0 ? (page - 1) * limit + 1 : 0}</strong> to{' '}
                    <strong>{Math.min(page * limit, totalLeads)}</strong> of <strong>{totalLeads}</strong> leads
                  </div>

                  <div className="pagination-controls">
                    <button
                      className="pagination-btn"
                      disabled={page <= 1}
                      onClick={() => {
                        const next = page - 1;
                        setPage(next);
                        fetchMyLeads(next, limit);
                      }}
                      title="Previous Page"
                    >
                      <ChevronLeft size={16} />
                      <span>Prev</span>
                    </button>

                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', padding: '0 6px' }}>
                      Page {page} of {totalPages}
                    </span>

                    <button
                      className="pagination-btn"
                      disabled={page >= totalPages}
                      onClick={() => {
                        const next = page + 1;
                        setPage(next);
                        fetchMyLeads(next, limit);
                      }}
                      title="Next Page"
                    >
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </button>

                    <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Show:</span>
                      <select
                        className="pagination-select"
                        value={limit}
                        onChange={(e) => {
                          const newLim = Number(e.target.value);
                          setLimit(newLim);
                          setPage(1);
                          fetchMyLeads(1, newLim);
                        }}
                      >
                        <option value={10}>10 / page</option>
                        <option value={25}>25 / page</option>
                        <option value={50}>50 / page</option>
                        <option value={100}>100 / page</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ADD LEAD MODAL (Auto-assigned to Self) */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Lead (Auto-assigned to You)"
        maxWidth="640px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setAddModalOpen(false)} disabled={submittingLead}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddLead} disabled={submittingLead}>
              {submittingLead ? (
                <>
                  <span className="btn-spinner" />
                  Saving...
                </>
              ) : (
                'Add Lead'
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleAddLead} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-grid-2">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Lead Full Name *</label>
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
              <label className="form-label">Phone Number *</label>
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
              <label className="form-label">Company</label>
              <input
                type="text"
                placeholder="Business name"
                className="form-input"
                value={leadForm.company}
                onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Deal Value (₹)</label>
              <input
                type="number"
                min={0}
                className="form-input"
                value={leadForm.dealValue}
                onChange={(e) => setLeadForm({ ...leadForm, dealValue: Number(e.target.value) })}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Initial Pipeline Stage</label>
              <CustomSelect
                value={leadForm.statusId}
                onChange={(e) => setLeadForm({ ...leadForm, statusId: e.target.value })}
                options={statuses.map((st) => ({
                  value: st._id,
                  label: st.name,
                  color: st.color,
                }))}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Schedule Next Follow-up (Date & Time)</label>
            <input
              type="datetime-local"
              className="form-input"
              value={leadForm.nextFollowupDate}
              onChange={(e) => setLeadForm({ ...leadForm, nextFollowupDate: e.target.value })}
            />
          </div>

          {/* Dynamic Extra Custom Fields */}
          {customFields.length > 0 && (
            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <DynamicFieldRenderer
                fields={customFields}
                values={leadForm.customFieldsData}
                onChange={(up) => setLeadForm({ ...leadForm, customFieldsData: up })}
              />
            </div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Notes & Requirements</label>
            <textarea
              className="form-textarea"
              placeholder="Client requirement details..."
              value={leadForm.notes}
              onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* LEAD DETAILS & FOLLOW-UP MODAL */}
      {activeLead && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={`Follow up: ${activeLead.name}`}
          maxWidth="700px"
          footer={
            <button className="btn btn-secondary" onClick={() => setDetailsModalOpen(false)}>
              Close
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <strong style={{ fontSize: '17px' }}>{activeLead.name}</strong>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
                    <UserCheck size={14} /> Convert
                  </button>
                )}
              </div>
            </div>

            {/* Followup Log Form */}
            <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Log Status & Next Follow-up</h4>
              <div className="form-grid-2" style={{ marginBottom: '10px' }}>
                <div>
                  <label className="form-label">Status Stage</label>
                  <CustomSelect
                    value={newStatusId}
                    onChange={(e) => setNewStatusId(e.target.value)}
                    options={statuses.map((st) => ({
                      value: st._id,
                      label: st.name,
                      color: st.color,
                    }))}
                  />
                </div>
                <div>
                  <label className="form-label">Next Follow-up (Date & Time)</label>
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
                  placeholder="Note on client reaction, next action plan..."
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
                    Saving...
                  </>
                ) : (
                  'Save Follow-up'
                )}
              </button>
            </div>

            {/* Activity History */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Timeline History</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {activities.map((act) => (
                  <div key={act._id} style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <strong>{act.title}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>{formatDateTime(act.createdAt)}</span>
                    </div>
                    {act.note && <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{act.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* 1-CLICK WHATSAPP MODAL */}
      {quickActionLead && (
        <WhatsAppModal
          isOpen={whatsAppModalOpen}
          onClose={() => {
            setWhatsAppModalOpen(false);
            setQuickActionLead(null);
          }}
          lead={quickActionLead}
          onFollowupSuccess={() => fetchMyLeads(page, limit)}
        />
      )}

      {/* 1-CLICK EMAIL MODAL */}
      {quickActionLead && (
        <EmailModal
          isOpen={emailModalOpen}
          onClose={() => {
            setEmailModalOpen(false);
            setQuickActionLead(null);
          }}
          lead={quickActionLead}
          onEmailSuccess={() => fetchMyLeads(page, limit)}
        />
      )}
    </div>
  );
};

export default StaffLeadsPage;
