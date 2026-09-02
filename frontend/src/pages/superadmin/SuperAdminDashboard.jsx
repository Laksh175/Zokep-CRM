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
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import Header from '../../components/Header';
import StatsCard from '../../components/StatsCard';
import Badge from '../../components/Badge';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/date';

const CustomRevenueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const fullDate = payload[0]?.payload?.fullDate || label;
    return (
      <div
        style={{
          background: '#ffffff',
          padding: '12px 16px',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 10px 15px -3px rgba(0, 34, 68, 0.08)',
          fontSize: '13px',
        }}
      >
        <p style={{ fontWeight: 700, marginBottom: '6px', color: '#002244' }}>
          📅 {fullDate}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {payload.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <span style={{ color: entry.color, fontWeight: 600 }}>{entry.name}:</span>
              <strong style={{ color: '#002244' }}>
                {entry.dataKey === 'revenue' ? `₹${entry.value.toLocaleString('en-IN')}` : entry.value}
              </strong>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

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

        {/* Platform Revenue & Growth Graph Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '28px' }}>
          {/* Revenue Growth Trend Area Chart */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>SaaS Revenue & Subscription Growth</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Daily recurring revenue timeline and new business subscriptions over last 14 days
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{ backgroundColor: '#e8f8ef', color: '#00a651', border: '1px solid #a7f3d0' }}>
                  ● Revenue (₹)
                </span>
                <span className="badge" style={{ backgroundColor: '#f0f6fc', color: '#003865', border: '1px solid #badcf5' }}>
                  ● Subscriptions
                </span>
              </div>
            </div>

            <div style={{ width: '100%', height: 280, marginTop: 'auto' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metrics?.revenueTrends || []}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00a651" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00a651" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#003865" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#003865" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip content={<CustomRevenueTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Daily Revenue"
                    stroke="#00a651"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="subscriptions"
                    name="New Subscriptions"
                    stroke="#003865"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorSubs)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Subscription Plan Bar Chart */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Revenue by Subscription Plan</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Platform earnings distribution across active subscription tiers
                </p>
              </div>
              <BarChart2 size={18} color="var(--primary-500)" />
            </div>

            <div style={{ width: '100%', height: 280, marginTop: 'auto' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics?.planDistribution || []}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0, 56, 101, 0.04)' }}
                    formatter={(val, name) => [
                      name === 'revenue' ? `₹${Number(val).toLocaleString('en-IN')}` : `${val} Tenants`,
                      name === 'revenue' ? 'Plan Revenue' : 'Active Subscribers',
                    ]}
                    contentStyle={{
                      background: '#ffffff',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      boxShadow: '0 10px 15px -3px rgba(0, 34, 68, 0.08)',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    name="revenue"
                    fill="#00a651"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
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
