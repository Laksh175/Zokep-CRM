import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, Shield, CreditCard, Sparkles, Clock, Infinity } from 'lucide-react';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const DEFAULT_FEATURE_LIST = [
  'Unlimited Leads & Deals Pipeline',
  'Unlimited Staff & Sales Consultants',
  'Custom Lead Statuses & HEX Colors',
  'Dynamic Form Custom Fields Builder',
  '1-Click WhatsApp Direct Launcher',
  '1-Click Nodemailer Email Dispatcher',
  'Public Shareable Lead Capture Form Link',
  'HTML Website Iframe Embeds',
  'Bulk CSV Import & CSV Export',
  'Sales Pipeline & Staff Leaderboard Analytics',
].join('\n');

export const PlanManagementPage = () => {
  const { success, error } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Plan Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    durationMonths: 1,
    price: 1999,
    featuresText: DEFAULT_FEATURE_LIST,
    isPopular: false,
    isActive: true,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/superadmin/plans');
      if (res.success) {
        setPlans(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPlanId(null);
    setFormData({
      name: '',
      durationMonths: 1,
      price: 1999,
      featuresText: DEFAULT_FEATURE_LIST,
      isPopular: false,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlanId(plan._id);
    const months = plan.durationMonths || (plan.billingCycle === 'yearly' ? 12 : 1);
    setFormData({
      name: plan.name,
      durationMonths: months,
      price: plan.price,
      featuresText: (plan.features && plan.features.length > 0) ? plan.features.join('\n') : DEFAULT_FEATURE_LIST,
      isPopular: !!plan.isPopular,
      isActive: plan.isActive !== undefined ? plan.isActive : true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.price === undefined || !formData.durationMonths) {
      error('Please provide plan name, duration in months, and price');
      return;
    }

    try {
      setSubmitting(true);
      const features = formData.featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name,
        durationMonths: Number(formData.durationMonths),
        price: Number(formData.price),
        features,
        isPopular: formData.isPopular,
        isActive: formData.isActive,
      };

      if (editingPlanId) {
        const res = await api.put(`/superadmin/plans/${editingPlanId}`, payload);
        if (res.success) success('Plan updated successfully');
      } else {
        const res = await api.post('/superadmin/plans', payload);
        if (res.success) success('Plan created successfully');
      }

      setModalOpen(false);
      fetchPlans();
    } catch (err) {
      error(err.message || 'Failed to save plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan?')) return;
    try {
      const res = await api.delete(`/superadmin/plans/${id}`);
      if (res.success) {
        success('Plan deleted');
        fetchPlans();
      }
    } catch (err) {
      error(err.message || 'Failed to delete plan');
    }
  };

  return (
    <div>
      <Header
        title="Subscription Plans Builder"
        subtitle="Configure duration-based plans. All tenants receive 100% unlimited access to all features."
        actions={
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Add New Plan
          </button>
        }
      />

      <div className="page-wrapper">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {plans.map((plan) => {
            const months = plan.durationMonths || (plan.billingCycle === 'yearly' ? 12 : 1);
            return (
              <div
                key={plan._id}
                className="glass-panel"
                style={{
                  padding: '28px',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  border: plan.isPopular ? '2px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                  position: 'relative',
                }}
              >
                {plan.isPopular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-11px',
                      left: '24px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 12px',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', marginTop: plan.isPopular ? '6px' : '0' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{plan.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <Clock size={13} color="var(--primary-400)" />
                      <span style={{ fontSize: '13px', color: 'var(--primary-400)', fontWeight: 600 }}>
                        {months} {months === 1 ? 'Month' : 'Months'} Duration
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => openEditModal(plan)} className="btn-icon btn-secondary" title="Edit Plan" style={{ width: 32, height: 32 }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(plan._id)} className="btn-icon btn-danger" title="Delete Plan" style={{ width: 32, height: 32 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '14px 0 16px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{plan.price}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ {months} {months === 1 ? 'month' : 'months'}</span>
                </div>

                {/* Unlimited Entitlements Badge */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
                  <Badge color="#10b981">
                    <Infinity size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    Unlimited Leads & Staff
                  </Badge>
                  {plan.isActive ? (
                    <Badge color="#06b6d4">Active</Badge>
                  ) : (
                    <Badge color="#64748b">Inactive</Badge>
                  )}
                </div>

                {/* Features List */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {plan.features?.map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0 }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPlanId ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : editingPlanId ? 'Update Plan' : 'Publish Plan'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 1. Plan Name */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Plan Name *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. 1 Month Starter, 6 Months Pro, Annual Unlimited"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* 2. Plan Duration in Month */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Plan Duration (in Months) *</label>
              <input
                type="number"
                required
                min={1}
                max={120}
                className="form-input"
                placeholder="e.g. 1, 3, 6, 12, 24"
                value={formData.durationMonths}
                onChange={(e) => setFormData({ ...formData, durationMonths: Math.max(1, Number(e.target.value)) })}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Duration in months (1 = 1 month, 12 = 1 year)
              </span>
            </div>

            {/* 3. Price (INR ₹) */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Price (INR ₹) *</label>
              <input
                type="number"
                required
                min={0}
                className="form-input"
                placeholder="e.g. 1999"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Total price for {formData.durationMonths} month(s)
              </span>
            </div>
          </div>

          {/* 4. Feature List */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Features List (1 feature per line) *</label>
            <textarea
              className="form-textarea"
              rows={8}
              style={{ minHeight: '140px', lineHeight: '1.5' }}
              value={formData.featuresText}
              onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
              placeholder="Unlimited Leads & Deals&#10;Unlimited Staff Members&#10;1-Click WhatsApp Direct..."
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              All plans have unlimited leads & staff. Features will be displayed on the pricing and checkout page.
            </span>
          </div>

          {/* Additional display options */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
              />
              Badge as 'Most Popular'
            </label>
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Active on Landing Page
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PlanManagementPage;
