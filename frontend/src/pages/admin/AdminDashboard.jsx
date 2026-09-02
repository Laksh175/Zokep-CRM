import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  DollarSign,
  UserCheck,
  Users,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ExternalLink,
  Plus,
  BarChart2,
  PieChart as PieIcon,
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
  Legend,
  CartesianGrid,
} from 'recharts';
import Header from '../../components/Header';
import StatsCard from '../../components/StatsCard';
import Badge from '../../components/Badge';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/date';
import { Link } from 'react-router-dom';

const CustomTooltip = ({ active, payload, label }) => {
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
              <strong style={{ color: '#002244' }}>{entry.value}</strong>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const AdminDashboard = () => {
  const { error } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-wrapper"><p>Loading CRM Dashboard...</p></div>;
  }

  return (
    <div>
      <Header
        title="Admin Workspace Overview"
        subtitle="Live sales pipeline, staff performance metrics, and upcoming follow-ups."
        actions={
          <Link to="/admin/leads" className="btn btn-primary">
            <Plus size={16} />
            Manage Leads
          </Link>
        }
      />

      <div className="page-wrapper">
        {/* KPI Summary Cards */}
        <div className="grid-cards">
          <StatsCard
            title="Total Pipeline Leads"
            value={data?.totalLeads || 0}
            subtitle={`${data?.unassignedLeads || 0} unassigned leads`}
            icon={FolderKanban}
            color="#003865"
          />
          <StatsCard
            title="Today's Follow-ups"
            value={data?.todayFollowupsCount || 0}
            subtitle={`${data?.overdueFollowupsCount || 0} overdue follow-up tasks`}
            icon={Clock}
            color="#0284c7"
          />
          <StatsCard
            title="Total Pipeline Value"
            value={`₹${(data?.totalPipelineValue || 0).toLocaleString('en-IN')}`}
            subtitle="Combined potential deal value"
            icon={DollarSign}
            color="#0d9488"
          />
          <StatsCard
            title="Won Customer Revenue"
            value={`₹${(data?.wonRevenue || 0).toLocaleString('en-IN')}`}
            subtitle={`${data?.convertedLeads || 0} deals successfully closed`}
            icon={TrendingUp}
            color="#00a651"
          />
          <StatsCard
            title="Sales Team Members"
            value={data?.totalStaff || 0}
            subtitle={`${data?.conversionRate || 0}% overall conversion rate`}
            icon={Users}
            color="#d97706"
          />
        </div>

        {/* Lead Graph & Analytics Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '28px' }}>
          {/* Chart 1: 14-Day Lead Trends & Deals Won */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Lead Activity & Conversion Trend</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Daily comparison of inquiries captured vs. deals won over the last 14 days
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{ backgroundColor: '#f0f6fc', color: '#003865', border: '1px solid #badcf5' }}>
                  ● Inquiries
                </span>
                <span className="badge" style={{ backgroundColor: '#e8f8ef', color: '#00a651', border: '1px solid #a7f3d0' }}>
                  ● Won Deals
                </span>
              </div>
            </div>

            <div style={{ width: '100%', height: 280, marginTop: 'auto' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data?.leadTrends || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#003865" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#003865" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00a651" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#00a651" stopOpacity={0.0} />
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
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="newLeads"
                    name="New Leads"
                    stroke="#003865"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorLeads)"
                  />
                  <Area
                    type="monotone"
                    dataKey="converted"
                    name="Won Customers"
                    stroke="#00a651"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorConverted)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Lead Acquisition by Channel / Source */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Leads by Acquisition Channel</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Distribution of leads across public forms, WhatsApp, and manual sources
                </p>
              </div>
              <BarChart2 size={18} color="var(--primary-500)" />
            </div>

            <div style={{ width: '100%', height: 280, marginTop: 'auto' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.sourceBreakdown || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="source"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0, 56, 101, 0.04)' }}
                    formatter={(val) => [`${val} Leads`, 'Total Leads']}
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
                    dataKey="count"
                    name="Leads"
                    fill="#003865"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Dynamic Status Breakdown with Configured Colors */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            Lead Pipeline by Status
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
            {data?.statusCounts?.map((st) => (
              <div
                key={st.id}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  padding: '16px',
                  borderRadius: '12px',
                  borderTop: `4px solid ${st.color}`,
                  border: `1px solid var(--border-subtle)`,
                  borderTopWidth: '4px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {st.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>{st.count}</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>leads</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {/* Staff Performance Leaderboard */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Team Performance Leaderboard</h3>
              <Link to="/admin/staff" style={{ fontSize: '12px', color: 'var(--primary-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ExternalLink size={12} />
              </Link>
            </div>

            {data?.staffPerformance?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No staff members added yet.</p>
            ) : (
              <div className="table-container">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Consultant</th>
                      <th>Assigned</th>
                      <th>Converted</th>
                      <th>Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.staffPerformance?.map((staff) => (
                      <tr key={staff.id}>
                        <td>
                          <strong>{staff.name}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{staff.email}</div>
                        </td>
                        <td>{staff.assignedLeads}</td>
                        <td style={{ color: '#10b981', fontWeight: 700 }}>{staff.convertedLeads}</td>
                        <td>
                          <Badge color="#6366f1">{staff.conversionRate}%</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Upcoming Follow-ups Schedule */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Upcoming Team Follow-ups (7 Days)</h3>
              <Clock size={16} color="var(--text-muted)" />
            </div>

            {data?.upcomingFollowups?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No upcoming follow-ups scheduled for this week.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data?.upcomingFollowups?.map((lead) => (
                  <div
                    key={lead._id}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <strong>{lead.name}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Assigned to: {lead.assignedTo?.name || 'Unassigned'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b' }}>
                        {formatDate(lead.nextFollowupDate)}
                      </div>
                      <Badge color={lead.statusId?.color || '#3b82f6'} size="sm">
                        {lead.statusId?.name || 'In Progress'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
