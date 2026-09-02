import React, { useState, useEffect } from 'react';
import { UserCheck, DollarSign, Calendar, Search } from 'lucide-react';
import Header from '../../components/Header';
import StatsCard from '../../components/StatsCard';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/date';

export const StaffCustomersPage = () => {
  const { error } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyWonDeals();
  }, []);

  const fetchMyWonDeals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leads', { isConverted: 'true' });
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to load won deals');
    } finally {
      setLoading(false);
    }
  };

  const totalWonRevenue = customers.reduce(
    (sum, c) => sum + (c.convertedDealAmount || c.dealValue || 0),
    0
  );

  return (
    <div>
      <Header
        title="My Converted Customers"
        subtitle="Track your closed deals and personal sales revenue performance."
      />

      <div className="page-wrapper">
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <StatsCard
            title="My Closed Deals"
            value={customers.length}
            subtitle="Successfully converted customers"
            icon={UserCheck}
            color="#10b981"
          />
          <StatsCard
            title="My Generated Revenue"
            value={`₹${totalWonRevenue.toLocaleString('en-IN')}`}
            subtitle="Total value of deals closed by you"
            icon={DollarSign}
            color="#06b6d4"
          />
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '24px 0' }}>Loading your converted deals...</p>
          ) : customers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <UserCheck size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No Deals Converted Yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Follow up with your assigned leads and mark them as converted when deals close!
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Company</th>
                    <th>Closed Deal Amount</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Closed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <strong>{c.name}</strong>
                      </td>
                      <td>{c.company || '-'}</td>
                      <td style={{ fontWeight: 800, color: '#10b981', fontSize: '15px' }}>
                        ₹{(c.convertedDealAmount || c.dealValue || 0).toLocaleString('en-IN')}
                      </td>
                      <td>{c.phone}</td>
                      <td>{c.email || '-'}</td>
                      <td>{c.convertedAt ? formatDate(c.convertedAt) : 'Recent'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffCustomersPage;
