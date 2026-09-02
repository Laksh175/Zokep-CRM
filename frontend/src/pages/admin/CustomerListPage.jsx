import React, { useState, useEffect } from 'react';
import { UserCheck, DollarSign, Calendar, Mail, Phone, Building2, Search, ArrowUpRight } from 'lucide-react';
import Header from '../../components/Header';
import StatsCard from '../../components/StatsCard';
import Badge from '../../components/Badge';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/date';

export const CustomerListPage = () => {
  const { error } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leads', { isConverted: 'true', search });
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch customer list');
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
        title="Converted Customers & Closed Deals"
        subtitle="Ledger of all won leads, closed revenue amounts, and winning sales consultants."
      />

      <div className="page-wrapper">
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <StatsCard
            title="Total Closed Deals"
            value={customers.length}
            subtitle="Successfully converted customers"
            icon={UserCheck}
            color="#10b981"
          />
          <StatsCard
            title="Total Won Revenue"
            value={`₹${totalWonRevenue.toLocaleString('en-IN')}`}
            subtitle="Closed customer deal value"
            icon={DollarSign}
            color="#06b6d4"
          />
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', maxWidth: '360px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search customer name, company, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-secondary" onClick={fetchCustomers}>
              <Search size={16} />
            </button>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '24px 0' }}>Loading customers...</p>
          ) : customers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <UserCheck size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No Won Customers Yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                When you or your staff mark a lead as Converted, they will appear here with final revenue numbers.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Customer Contact</th>
                    <th>Company</th>
                    <th>Closed Deal Value</th>
                    <th>Closing Consultant</th>
                    <th>Conversion Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <strong>{c.name}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {c.phone} {c.email && `• ${c.email}`}
                        </div>
                      </td>
                      <td>{c.company || '-'}</td>
                      <td style={{ fontWeight: 800, color: '#10b981', fontSize: '15px' }}>
                        ₹{(c.convertedDealAmount || c.dealValue || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        {c.assignedTo?.name || 'Admin'}
                      </td>
                      <td>
                        {c.convertedAt ? formatDate(c.convertedAt) : 'Recent'}
                      </td>
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

export default CustomerListPage;
