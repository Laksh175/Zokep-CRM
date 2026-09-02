import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Users,
  Building2,
  AlertTriangle,
  Clock,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import Header from '../../components/Header';
import StatsCard from '../../components/StatsCard';
import Badge from '../../components/Badge';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/date';

export const SuperAdminDashboard = () => {
  const { success, error } = useToast();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/superadmin/analytics');
      if (res.success) {
        setMetrics(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to load platform analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickExtend = async (adminId) => {
    try {
      const res = await api.post(`/superadmin/admins/${adminId}/extend-subscription`, { days: 30 });
      if (res.success) {
        success(res.message);
        fetchAnalytics();
      }
    } catch (err) {
      error(err.message || 'Failed to extend subscription');
    }
  };

  if (loading) {
    return <div className="page-wrapper"><p>Loading Platform Analytics...</p></div>;
  }

  return (
    <div>
      <Header
        title="SaaS Platform Overview"
        subtitle="Real-time recurring revenue, tenant health, and subscription metrics across Zokep CRM."
      />

      <div className="page-wrapper">
        {/* KPI Cards */}
        <div className="grid-cards">
          <StatsCard
            title="Total Platform Revenue"
            value={`₹${(metrics?.totalRevenue || 0).toLocaleString('en-IN')}`}
            subtitle="All-time subscription volume"
            icon={DollarSign}
            color="#10b981"
            trend="+24%"
          />
          <StatsCard
            title="Monthly Recurring (MRR)"
            value={`₹${(metrics?.mrrRevenue || 0).toLocaleString('en-IN')}`}
            subtitle="Last 30 days subscriptions"
            icon={TrendingUp}
            color="#6366f1"
          />
          <StatsCard
            title="Active Tenant Admins"
            value={metrics?.activeAdmins || 0}
            subtitle={`${metrics?.totalAdmins || 0} total registered businesses`}
            icon={Building2}
            color="#06b6d4"
          />
          <StatsCard
            title="Expired Subscriptions"
            value={metrics?.expiredSubscriptions || 0}
            subtitle={`${metrics?.expiringSoonSubscriptions || 0} expiring in next 7 days`}
            icon={AlertTriangle}
            color="#f43f5e"
          />
        </div>

        {/* Expired Subscriptions Alerts Box */}
        {metrics?.expiredTenantSubs?.length > 0 && (
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px', borderLeft: '4px solid #f43f5e' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} color="#f43f5e" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                  Tenants with Expired Subscriptions ({metrics.expiredTenantSubs.length})
                </h3>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Write actions are paused for these tenants
              </span>
            </div>

            <div className="table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Business / Admin</th>
                    <th>Contact</th>
                    <th>Plan</th>
                    <th>Expired Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.expiredTenantSubs.map((sub) => (
                    <tr key={sub._id}>
                      <td>
                        <strong>{sub.tenantId?.companyName || 'Business'}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{sub.tenantId?.name}</div>
                      </td>
                      <td>
                        <div>{sub.tenantId?.email}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub.tenantId?.phone}</div>
                      </td>
                      <td>
                        <Badge color="#f59e0b">{sub.planId?.name || 'Standard'}</Badge>
                      </td>
                      <td style={{ color: '#f87171', fontWeight: 600 }}>
                        {formatDate(sub.endDate)}
                      </td>
                      <td>
                        <button
                          onClick={() => handleQuickExtend(sub.tenantId?._id)}
                          className="btn btn-secondary btn-sm"
                        >
                          +30 Days Grace
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Subscriptions Ledger */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Recent Subscription Purchases & Invoices</h3>
          </div>

          <div className="table-container">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Invoice Ref</th>
                  <th>Tenant Company</th>
                  <th>Plan & Cycle</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Valid Until</th>
                  <th>Purchased On</th>
                </tr>
              </thead>
              <tbody>
                {metrics?.recentSubscriptions?.map((sub) => (
                  <tr key={sub._id}>
                    <td>
                      <code>{sub.invoiceNumber || `INV-${sub._id.slice(-6)}`}</code>
                    </td>
                    <td>
                      <strong>{sub.tenantId?.companyName || 'Tenant'}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub.tenantId?.email}</div>
                    </td>
                    <td>
                      <div>{sub.planId?.name || 'Plan'}</div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {sub.planId?.billingCycle || 'monthly'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>
                      ₹{sub.amountPaid}
                    </td>
                    <td>
                      <Badge color={sub.status === 'active' ? '#10b981' : '#f43f5e'}>
                        {sub.status}
                      </Badge>
                    </td>
                    <td>{formatDate(sub.endDate)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {formatDate(sub.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
