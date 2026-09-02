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
} from 'lucide-react';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import DynamicFieldRenderer from '../../components/DynamicFieldRenderer';
import WhatsAppModal from '../../components/WhatsAppModal';
import EmailModal from '../../components/EmailModal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

export const StaffLeadsPage = () => {
  const { success, error } = useToast();

  const [leads, setLeads] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchMyLeads();
  }, [statusFilter, priorityFilter]);

  const fetchMetadata = async () => {
    try {
      const [statusRes, fieldsRes] = await Promise.all([
        api.get('/settings/statuses'),
        api.get('/settings/custom-fields'),
      ]);
      if (statusRes.success) setStatuses(statusRes.data);
      if (fieldsRes.success) setCustomFields(fieldsRes.data);
    } catch (err) {
      console.warn('Metadata load warning:', err.message);
    }
  };

  const fetchMyLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leads', {
        search,
        statusId: statusFilter,
        priority: priorityFilter,
      });
      if (res.success) {
        setLeads(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch your leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMyLeads();
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
      const res = await api.post('/leads', leadForm);
      if (res.success) {
        success('Lead added and assigned to you!');
        setAddModalOpen(false);
        fetchMyLeads();
      }
    } catch (err) {
      error(err.message || 'Failed to add lead');
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
        const fresh = await api.get(`/leads/${activeLead._id}`);
        if (fresh.success) setActivities(fresh.data.activities || []);
        fetchMyLeads();
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
        fetchMyLeads();
        if (activeLead?._id === lead._id) {
          openLeadDetails(res.data);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to convert lead');
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
          </div>
        </div>

        {/* Leads Table */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '24px 0' }}>Loading your leads...</p>
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
                        <Badge color={lead.statusId?.color || '#3b82f6'}>
                          {lead.statusId?.name || 'New'}
                        </Badge>
                      </td>
                      <td>
                        {lead.nextFollowupDate ? (
                          <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                            {new Date(lead.nextFollowupDate).toLocaleDateString()}
                          </span>
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
                            <MessageSquare size={13} />
                            WA
                          </button>

                          {lead.email && (
                            <button
                              onClick={() => {
                                setQuickActionLead(lead);
                                setEmailModalOpen(true);
                              }}
                              className="btn btn-secondary btn-sm"
                              title="1-Click Email"
                            >
                              <Mail size={13} />
                            </button>
                          )}

                          {!lead.isConverted && (
                            <button
                              onClick={() => handleConvertToCustomer(lead)}
                              className="btn btn-success btn-sm"
                              title="Convert to Customer"
                            >
                              <UserCheck size={13} />
                            </button>
                          )}

                          <button
                            onClick={() => openLeadDetails(lead)}
                            className="btn btn-secondary btn-sm"
                            title="Update Follow-up"
                          >
                            <Clock size={13} />
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
              {submittingLead ? 'Saving...' : 'Add Lead'}
            </button>
          </>
        }
      >
        <form onSubmit={handleAddLead} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  📞 {activeLead.phone} {activeLead.email && `• ✉️ ${activeLead.email}`}
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
                  <MessageSquare size={14} /> WhatsApp
                </button>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                <div>
                  <label className="form-label">Status Stage</label>
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
                  <label className="form-label">Next Contact Date</label>
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
                {savingFollowup ? 'Saving...' : 'Save Follow-up'}
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
                      <span style={{ color: 'var(--text-muted)' }}>{new Date(act.createdAt).toLocaleDateString()}</span>
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
      <WhatsAppModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        lead={quickActionLead}
        onFollowupSuccess={fetchMyLeads}
      />

      {/* 1-CLICK EMAIL MODAL */}
      <EmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        lead={quickActionLead}
        onEmailSuccess={fetchMyLeads}
      />
    </div>
  );
};

export default StaffLeadsPage;
