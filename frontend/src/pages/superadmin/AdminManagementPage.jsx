import React, { useState, useEffect } from 'react';
import {
  Search,
  Building2,
  Users,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Plus,
} from 'lucide-react';
import Header from '../../components/Header';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/date';

export const AdminManagementPage = () => {
  const { success, error } = useToast();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [subFilter, setSubFilter] = useState('');

  // Deactivation Modal State
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [toggling, setToggling] = useState(false);

  // Extend Subscription Modal State
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [extendDays, setExtendDays] = useState(30);
  const [extending, setExtending] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, [statusFilter, subFilter]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/superadmin/admins', {
        search,
        status: statusFilter,
        subStatus: subFilter,
      });
      if (res.success) {
        setAdmins(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch tenant admins');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdmins();
  };

  const openToggleStatusModal = (admin) => {
    setSelectedAdmin(admin);
    setDeactivationReason(admin.deactivationReason || '');
    setToggleModalOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!selectedAdmin) return;
    const newStatus = !selectedAdmin.isActive;

    if (!newStatus && !deactivationReason) {
      error('Please provide a reason for suspending this account.');
      return;
    }

    try {
      setToggling(true);
      const res = await api.put(`/superadmin/admins/${selectedAdmin.id}/toggle-status`, {
        isActive: newStatus,
        deactivationReason: newStatus ? '' : deactivationReason,
      });

      if (res.success) {
        success(res.message);
        setToggleModalOpen(false);
        fetchAdmins();
      }
    } catch (err) {
      error(err.message || 'Failed to update status');
    } finally {
      setToggling(false);
    }
  };

  const openExtendModal = (admin) => {
    setSelectedAdmin(admin);
    setExtendDays(30);
    setExtendModalOpen(true);
  };

  const handleConfirmExtend = async () => {
    if (!selectedAdmin) return;
    try {
      setExtending(true);
      const res = await api.post(`/superadmin/admins/${selectedAdmin.id}/extend-subscription`, {
        days: extendDays,
      });
      if (res.success) {
        success(res.message);
        setExtendModalOpen(false);
        fetchAdmins();
      }
    } catch (err) {
      error(err.message || 'Failed to extend subscription');
    } finally {
      setExtending(false);
    }
  };

  return (
    <div>
      <Header
        title="Tenant Admin Directory"
        subtitle="Manage all business tenants, toggle account activation, and inspect subscription health."
      />

      <div className="page-wrapper">
        {/* Filter Toolbar */}
        <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by company, name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary">
              <Search size={16} />
              Search
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ width: '160px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Accounts</option>
              <option value="active">Active Only</option>
              <option value="inactive">Suspended</option>
            </select>

            <select
              className="form-select"
              style={{ width: '170px' }}
              value={subFilter}
              onChange={(e) => setSubFilter(e.target.value)}
            >
              <option value="">All Subscriptions</option>
              <option value="active">Active Subscriptions</option>
              <option value="expired">Expired Subscriptions</option>
            </select>
          </div>
        </div>

        {/* Admins Table */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '24px 0' }}>Loading tenant records...</p>
          ) : (
            <div className="table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Business / Company</th>
                    <th>Admin User</th>
                    <th>Industry</th>
                    <th>Plan & Expiry</th>
                    <th>Team Size</th>
                    <th>Total Leads</th>
                    <th>Account State</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => {
                    const sub = admin.subscription;
                    const isSubExpired = sub?.isExpired ?? true;

                    return (
                      <tr key={admin.id}>
                        <td>
                          <strong>{admin.companyName || 'N/A'}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{admin.email}</div>
                        </td>
                        <td>
                          <div>{admin.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{admin.phone || 'No phone'}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {admin.businessType || 'General'}
                          </span>
                        </td>
                        <td>
                          {sub ? (
                            <div>
                              <Badge color={isSubExpired ? '#ef4444' : '#10b981'}>
                                {sub.planName} ({isSubExpired ? 'Expired' : 'Active'})
                              </Badge>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                Ends: {formatDate(sub.endDate)}
                              </div>
                            </div>
                          ) : (
                            <Badge color="#64748b">No Active Plan</Badge>
                          )}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{admin.staffCount}</span> staff
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{admin.leadCount}</span> leads
                        </td>
                        <td>
                          <Badge color={admin.isActive ? '#10b981' : '#f43f5e'}>
                            {admin.isActive ? 'Active' : 'Suspended'}
                          </Badge>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => openToggleStatusModal(admin)}
                              className={`btn btn-sm ${admin.isActive ? 'btn-danger' : 'btn-success'}`}
                              title={admin.isActive ? 'Suspend Account' : 'Activate Account'}
                            >
                              {admin.isActive ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              onClick={() => openExtendModal(admin)}
                              className="btn btn-secondary btn-sm"
                              title="Extend Subscription"
                            >
                              +Days
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Account Deactivation / Activation Modal */}
      <Modal
        isOpen={toggleModalOpen}
        onClose={() => setToggleModalOpen(false)}
        title={selectedAdmin?.isActive ? `Suspend Account: ${selectedAdmin?.companyName}` : `Activate Account: ${selectedAdmin?.companyName}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setToggleModalOpen(false)} disabled={toggling}>
              Cancel
            </button>
            <button
              className={`btn ${selectedAdmin?.isActive ? 'btn-danger' : 'btn-success'}`}
              onClick={handleConfirmToggleStatus}
              disabled={toggling}
            >
              {toggling ? 'Updating...' : selectedAdmin?.isActive ? 'Confirm Suspension' : 'Activate Account'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
            {selectedAdmin?.isActive
              ? `Suspending this account will block both the Admin (${selectedAdmin?.email}) and all their associated staff members from logging in or modifying CRM leads.`
              : `Reactivating this account will restore full CRM access for ${selectedAdmin?.companyName} and all associated team members.`}
          </p>

          {selectedAdmin?.isActive && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Mandatory Reason for Suspension *</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Non-payment, violation of terms, customer request..."
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Extend Subscription Modal */}
      <Modal
        isOpen={extendModalOpen}
        onClose={() => setExtendModalOpen(false)}
        title={`Extend Subscription: ${selectedAdmin?.companyName}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setExtendModalOpen(false)} disabled={extending}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleConfirmExtend} disabled={extending}>
              {extending ? 'Extending...' : `Grant ${extendDays} Days Extension`}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Extension Period (Days)</label>
            <select
              className="form-select"
              value={extendDays}
              onChange={(e) => setExtendDays(Number(e.target.value))}
            >
              <option value={7}>7 Days Trial</option>
              <option value={15}>15 Days Grace Period</option>
              <option value={30}>30 Days (1 Month)</option>
              <option value={60}>60 Days (2 Months)</option>
              <option value={90}>90 Days (Quarterly)</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminManagementPage;
