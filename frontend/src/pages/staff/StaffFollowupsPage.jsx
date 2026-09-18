import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  CalendarClock,
  UserCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import CustomSelect from '../../components/CustomSelect';
import WhatsAppModal from '../../components/WhatsAppModal';
import EmailModal from '../../components/EmailModal';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import LeadSourceBadge from '../../components/LeadSourceBadge';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatTime, formatDateTime, toDateTimeLocalInput, isToday, isOverdue } from '../../utils/date';
import confetti from 'canvas-confetti';

export const StaffFollowupsPage = () => {
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'overdue' | 'upcoming' | 'all'
  const [leads, setLeads] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Search filter
  const [search, setSearch] = useState('');

  // Counts summary for badge indicators
  const [tabCounts, setTabCounts] = useState({ today: 0, overdue: 0, upcoming: 0 });

  // Reschedule / Log Followup Modal
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [activeLead, setActiveLead] = useState(null);
  const [newStatusId, setNewStatusId] = useState('');
  const [newNextFollowup, setNewNextFollowup] = useState('');
  const [followupNote, setFollowupNote] = useState('');
  const [savingFollowup, setSavingFollowup] = useState(false);

  // Quick WhatsApp / Email modals
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [quickActionLead, setQuickActionLead] = useState(null);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchFollowupLeads(1, limit, activeTab);
  }, [activeTab]);

  const fetchMetadata = async () => {
    try {
      const res = await api.get('/settings/statuses');
      if (res && res.success && Array.isArray(res.data)) {
        setStatuses(res.data);
      }
    } catch (err) {
      console.warn('Status load error:', err.message);
    }
  };

  const fetchFollowupLeads = async (pageToFetch = page, limitToFetch = limit, tab = activeTab) => {
    try {
      setLoading(true);
      const params = {
        page: pageToFetch,
        limit: limitToFetch,
        search,
      };

      if (tab !== 'all') {
        params.followupFilter = tab;
      }

      const res = await api.get('/leads', params);

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
      error(err.message || 'Failed to fetch follow-ups');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFollowupLeads(1, limit, activeTab);
  };

  const openRescheduleModal = (lead) => {
    setActiveLead(lead);
    setNewStatusId(lead.statusId?._id || lead.statusId?.id || (typeof lead.statusId === 'string' ? lead.statusId : ''));
    setNewNextFollowup(lead.nextFollowupDate ? toDateTimeLocalInput(lead.nextFollowupDate) : toDateTimeLocalInput(new Date()));
    setFollowupNote('');
    setRescheduleModalOpen(true);
  };

  const handleSaveFollowup = async (e) => {
    e.preventDefault();
    if (!activeLead) return;

    try {
      setSavingFollowup(true);
      const res = await api.post(`/leads/${activeLead._id}/followup`, {
        statusId: newStatusId,
        note: followupNote,
        nextFollowupDate: newNextFollowup ? new Date(newNextFollowup).toISOString() : null,
      });

      if (res.success) {
        success('Follow-up scheduled successfully!');
        setRescheduleModalOpen(false);

        // Optimistically update lead in list
        setLeads((prev) =>
          prev.map((ld) => (ld._id === activeLead._id ? res.data : ld))
        );

        // If filtering by 'today' and new date is not today, refresh to keep list clean
        if (activeTab === 'today' && !isToday(newNextFollowup)) {
          fetchFollowupLeads(page, limit, activeTab);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to reschedule follow-up');
    } finally {
      setSavingFollowup(false);
    }
  };

  const handleQuickStatusChange = async (leadId, newStatusIdVal) => {
    const previousLeads = [...leads];
    const targetStatusObj = statuses.find((s) => s._id === newStatusIdVal);

    // 0ms Optimistic UI update
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
        success('Status updated');
      }
    } catch (err) {
      setLeads(previousLeads);
      error(err.message || 'Failed to update status');
    }
  };

  const handleConvertToCustomer = async (lead) => {
    const amountStr = window.prompt(`Confirm deal closed revenue amount (₹):`, lead.dealValue || 0);
    if (amountStr === null) return;

    try {
      const res = await api.post(`/leads/${lead._id}/convert`, {
        dealAmount: Number(amountStr) || lead.dealValue || 0,
        note: 'Deal closed from Follow-up Workspace.',
      });

      if (res.success) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        success('🎉 Congratulations on closing this deal!');
        // Optimistic UI update
        setLeads((prev) =>
          prev.map((ld) =>
            ld._id === lead._id
              ? { ...ld, isConverted: true, dealValue: Number(amountStr) || lead.dealValue }
              : ld
          )
        );
      }
    } catch (err) {
      error(err.message || 'Failed to convert lead');
    }
  };

  return (
    <div>
      <Header
        title="Follow-up Workspace"
        subtitle="Manage today's scheduled client calls, overdue follow-ups, and 1-click communications."
        actions={
          <button
            className="btn btn-secondary"
            onClick={() => fetchFollowupLeads(page, limit, activeTab)}
            title="Refresh List"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        }
      />

      <div className="page-wrapper">
        {/* Navigation Tabs Bar */}
        <div
          className="glass-panel"
          style={{
            padding: '8px 12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('today')}
              className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '13px' }}
            >
              <CalendarCheck size={16} color={activeTab === 'today' ? '#00a651' : 'currentColor'} />
              Today's Follow-ups
            </button>

            <button
              onClick={() => setActiveTab('overdue')}
              className={`tab-btn ${activeTab === 'overdue' ? 'active' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '13px' }}
            >
              <AlertCircle size={16} color={activeTab === 'overdue' ? '#ef4444' : 'currentColor'} />
              Overdue
            </button>

            <button
              onClick={() => setActiveTab('upcoming')}
              className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '13px' }}
            >
              <CalendarClock size={16} color={activeTab === 'upcoming' ? '#3b82f6' : 'currentColor'} />
              Upcoming (Next 7 Days)
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '13px' }}
            >
              <Calendar size={16} />
              All Scheduled
            </button>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search follow-ups..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '7px 12px', fontSize: '13px' }}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">
              <Search size={14} />
            </button>
          </form>
        </div>

        {/* Leads Table Container */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-secondary)' }}>Loading scheduled follow-ups...</p>
          ) : leads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                {activeTab === 'today'
                  ? "You're All Caught Up for Today!"
                  : activeTab === 'overdue'
                  ? 'No Overdue Follow-ups! Great job.'
                  : 'No Scheduled Follow-ups Found'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '440px', margin: '0 auto 18px' }}>
                {activeTab === 'today'
                  ? 'There are no pending follow-up calls scheduled for today. Check upcoming follow-ups or manage your leads.'
                  : 'All your lead follow-ups are up to date.'}
              </p>
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
                      <th>Lead Source</th>
                      <th>Scheduled Follow-up Time</th>
                      <th>Pipeline Status</th>
                      <th>1-Click Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => {
                      const todayCheck = isToday(lead.nextFollowupDate);
                      const overdueCheck = isOverdue(lead.nextFollowupDate);

                      return (
                        <tr key={lead._id}>
                          <td>
                            <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{lead.name}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                              <span>{lead.phone}</span>
                              {lead.email && <span>• {lead.email}</span>}
                            </div>
                          </td>
                          <td>{lead.company || '-'}</td>
                          <td style={{ fontWeight: 700, color: lead.isConverted ? '#10b981' : 'var(--text-primary)' }}>
                            ₹{(lead.dealValue || 0).toLocaleString('en-IN')}
                          </td>
                          <td>
                            <LeadSourceBadge source={lead.source} />
                          </td>
                          <td>
                            {lead.nextFollowupDate ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <span
                                  style={{
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: overdueCheck && !todayCheck
                                      ? '#ef4444'
                                      : todayCheck
                                      ? '#10b981'
                                      : '#3b82f6',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                  }}
                                >
                                  <Calendar size={14} />
                                  {formatDate(lead.nextFollowupDate)}
                                  {todayCheck && (
                                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                      TODAY
                                    </span>
                                  )}
                                  {overdueCheck && !todayCheck && (
                                    <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                      OVERDUE
                                    </span>
                                  )}
                                </span>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={12} />
                                  {formatTime(lead.nextFollowupDate) || 'Time not specified'}
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Not Scheduled</span>
                            )}
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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

                              {/* 1-Click Call */}
                              <a
                                href={`tel:${lead.phone}`}
                                className="btn btn-secondary btn-action"
                                title={`Call ${lead.name} (${lead.phone})`}
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <Phone size={14} color="var(--primary-600)" />
                              </a>

                              {/* Reschedule / Log Followup */}
                              <button
                                onClick={() => openRescheduleModal(lead)}
                                className="btn btn-secondary btn-action"
                                title="Reschedule Date & Time / Log Note"
                              >
                                <Clock size={14} color="#475569" />
                              </button>

                              {/* Convert to Customer */}
                              {!lead.isConverted && (
                                <button
                                  onClick={() => handleConvertToCustomer(lead)}
                                  className="btn btn-success btn-action"
                                  title="Convert to Won Customer"
                                >
                                  <UserCheck size={14} color="#ffffff" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              {totalPages > 0 && totalLeads > 0 && (
                <div className="pagination-bar">
                  <div className="pagination-info">
                    Showing <strong>{leads.length > 0 ? (page - 1) * limit + 1 : 0}</strong> to{' '}
                    <strong>{Math.min(page * limit, totalLeads)}</strong> of <strong>{totalLeads}</strong> follow-ups
                  </div>

                  <div className="pagination-controls">
                    <button
                      className="pagination-btn"
                      disabled={page <= 1}
                      onClick={() => {
                        const next = page - 1;
                        setPage(next);
                        fetchFollowupLeads(next, limit, activeTab);
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
                        fetchFollowupLeads(next, limit, activeTab);
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
                          fetchFollowupLeads(1, newLim, activeTab);
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

      {/* RESCHEDULE & LOG FOLLOWUP MODAL */}
      {activeLead && (
        <Modal
          isOpen={rescheduleModalOpen}
          onClose={() => setRescheduleModalOpen(false)}
          title={`Follow-up: ${activeLead.name}`}
          maxWidth="560px"
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setRescheduleModalOpen(false)}
                disabled={savingFollowup}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveFollowup}
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
            </>
          }
        >
          <form onSubmit={handleSaveFollowup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px 14px', borderRadius: '8px', fontSize: '13px' }}>
              <strong>Contact:</strong> {activeLead.name} ({activeLead.phone})
              {activeLead.company && <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Company: {activeLead.company}</div>}
            </div>

            <div className="form-grid-2">
              <div>
                <label className="form-label">Next Follow-up Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  className="form-input"
                  value={newNextFollowup}
                  onChange={(e) => setNewNextFollowup(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Update Status Stage</label>
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
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Follow-up Call Notes / Outcome</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '80px' }}
                placeholder="Discussed pricing, requested demo for tomorrow 3 PM..."
                value={followupNote}
                onChange={(e) => setFollowupNote(e.target.value)}
              />
            </div>
          </form>
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
          onFollowupSuccess={() => fetchFollowupLeads(page, limit, activeTab)}
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
          onEmailSuccess={() => fetchFollowupLeads(page, limit, activeTab)}
        />
      )}
    </div>
  );
};

export default StaffFollowupsPage;
