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
} from 'lucide-react';
import Header from '../../components/Header';
import StatsCard from '../../components/StatsCard';
import Badge from '../../components/Badge';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/date';
import { Link } from 'react-router-dom';

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
            color="#6366f1"
          />
          <StatsCard
            title="Total Pipeline Value"
            value={`₹${(data?.totalPipelineValue || 0).toLocaleString('en-IN')}`}
            subtitle="Combined potential deal value"
            icon={DollarSign}
            color="#06b6d4"
          />
          <StatsCard
            title="Won Customer Revenue"
            value={`₹${(data?.wonRevenue || 0).toLocaleString('en-IN')}`}
            subtitle={`${data?.convertedLeads || 0} deals successfully closed`}
            icon={TrendingUp}
            color="#10b981"
          />
          <StatsCard
            title="Sales Team Members"
            value={data?.totalStaff || 0}
            subtitle={`${data?.conversionRate || 0}% overall conversion rate`}
            icon={Users}
            color="#f59e0b"
          />
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
