import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ShieldCheck,
  Sparkles,
  Key,
} from 'lucide-react';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const StaffManagementPage = () => {
  const { success, error } = useToast();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    isActive: true,
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/staff');
      if (res.success) {
        setStaffList(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingStaffId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (staff) => {
    setEditingStaffId(staff.id);
    setFormData({
      name: staff.name,
      email: staff.email,
      password: '', // leave empty unless resetting
      phone: staff.phone || '',
      isActive: staff.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      error('Name and Email are required');
      return;
    }
    if (!editingStaffId && !formData.password) {
      error('Password is required for new staff');
      return;
    }

    try {
      setSubmitting(true);
      if (editingStaffId) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        const res = await api.put(`/admin/staff/${editingStaffId}`, payload);
        if (res.success) success('Staff details updated');
      } else {
        const res = await api.post('/admin/staff', formData);
        if (res.success) {
          success('Staff member created! Credentials sent to their email. 🚀');
        }
      }
      setModalOpen(false);
      fetchStaff();
    } catch (err) {
      error(err.message || 'Failed to save staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member? Their leads will be unassigned.')) return;
    try {
      const res = await api.delete(`/admin/staff/${id}`);
      if (res.success) {
        success('Staff removed successfully');
        fetchStaff();
      }
    } catch (err) {
      error(err.message || 'Failed to delete staff member');
    }
  };

  return (
    <div>
      <Header
        title="Team & Sales Consultants"
        subtitle="Manage consultants, assign leads, and monitor individual conversion win-rates."
        actions={
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Add Staff Member
          </button>
        }
      />

      <div className="page-wrapper">
        <div className="glass-panel" style={{ padding: '20px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '24px 0' }}>Loading team members...</p>
          ) : staffList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No Staff Added Yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                Add sales consultants or managers to distribute lead follow-ups.
              </p>
              <button className="btn btn-primary" onClick={openCreateModal}>
                <Plus size={16} /> Add First Staff Member
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Consultant</th>
                    <th>Contact Info</th>
                    <th>Leads Assigned</th>
                    <th>Converted Deals</th>
                    <th>Account Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((staff) => (
                    <tr key={staff.id}>
                      <td>
                        <strong>{staff.name}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Joined: {new Date(staff.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div>{staff.email}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{staff.phone || 'No phone'}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: '15px' }}>{staff.leadsCount}</span> leads
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#10b981', fontSize: '15px' }}>{staff.convertedCount}</span> won
                      </td>
                      <td>
                        <Badge color={staff.isActive ? '#10b981' : '#f43f5e'}>
                          {staff.isActive ? 'Active' : 'Deactivated'}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditModal(staff)}
                            className="btn-icon btn-secondary"
                            style={{ width: 32, height: 32 }}
                            title="Edit Staff"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(staff.id)}
                            className="btn-icon btn-danger"
                            style={{ width: 32, height: 32 }}
                            title="Delete Staff"
                          >
                            <Trash2 size={14} />
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

      {/* ADD / EDIT STAFF MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStaffId ? 'Edit Staff Member' : 'Add Sales Consultant / Staff'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : editingStaffId ? 'Update Staff' : 'Add & Send Credentials'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Consultant Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Priya Sharma"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email Address (Login Username) *</label>
            <input
              type="email"
              required
              disabled={!!editingStaffId}
              placeholder="priya@company.com"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">
              {editingStaffId ? 'Change Password (leave empty to keep current)' : 'Login Password *'}
            </label>
            <input
              type="password"
              required={!editingStaffId}
              minLength={6}
              placeholder="Min 6 characters"
              className="form-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              placeholder="+91 9876543210"
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {editingStaffId && (
            <div style={{ marginTop: '6px' }}>
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Active Staff Member (uncheck to suspend consultant's login access)
              </label>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default StaffManagementPage;
