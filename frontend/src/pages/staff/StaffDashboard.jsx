import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  UserCheck,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  MessageSquare,
  Plus,
  ArrowRight,
} from 'lucide-react';
import Header from '../../components/Header';
import StatsCard from '../../components/StatsCard';
import Badge from '../../components/Badge';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';

export const StaffDashboard = () => {
  const { error } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/staff/dashboard');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to load staff dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-wrapper"><p>Loading Consultant Workspace...</p></div>;
  }

  return (
    <div>
      <Header
        title="Consultant Workspace"
        subtitle="Your assigned leads pipeline, today's scheduled follow-ups, and conversion metrics."
        actions={
          <Link to="/staff/leads" className="btn btn-primary">
            <Plus size={16} />
            My Leads
          </Link>
        }
      />

      <div className="page-wrapper">
        {/* KPI Metric Cards */}
        <div className="grid-cards">
          <StatsCard
            title="My Active Leads"
            value={data?.myTotalLeads || 0}
            subtitle="Leads currently assigned to you"
            icon={FolderKanban}
            color="#6366f1"
          />
          <StatsCard
            title="Today's Follow-ups"
            value={data?.todayFollowupsCount || 0}
            subtitle="Scheduled for today"
            icon={Clock}
            color="#06b6d4"
          />
          <StatsCard
            title="Overdue Tasks"
            value={data?.overdueCount || 0}
            subtitle="Follow-ups past due date"
            icon={AlertCircle}
            color="#f43f5e"
          />
          <StatsCard
            title="My Won Customers"
            value={data?.myConvertedLeads || 0}
            subtitle={`${data?.conversionRate || 0}% personal conversion rate`}
            icon={UserCheck}
            color="#10b981"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Today's Follow-up List */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Today's Scheduled Calls & Chats</h3>
              <Calendar size={16} color="var(--text-muted)" />
            </div>

            {data?.todayFollowups?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No follow-ups due today! You're all caught up.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data?.todayFollowups?.map((lead) => (
                  <div
                    key={lead._id}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      padding: '14px',
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
                        📞 {lead.phone} {lead.company && `• 🏢 ${lead.company}`}
                      </div>
                    </div>
                    <Link to="/staff/leads" className="btn btn-secondary btn-sm">
                      Follow up <ArrowRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Overdue Alerts Box */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#f87171' }}>Overdue Follow-ups</h3>
              <AlertCircle size={16} color="#f43f5e" />
            </div>

            {data?.overdueFollowups?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No overdue tasks. Excellent job staying on track!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data?.overdueFollowups?.map((lead) => (
                  <div
                    key={lead._id}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      padding: '14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(244, 63, 94, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <strong>{lead.name}</strong>
                      <div style={{ fontSize: '11px', color: '#f87171' }}>
                        Due since: {new Date(lead.nextFollowupDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Link to="/staff/leads" className="btn btn-secondary btn-sm">
                      Take Action
                    </Link>
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

export default StaffDashboard;
