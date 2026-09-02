import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  Check,
} from 'lucide-react';
import Header from '../../components/Header';
import StatsCard from '../../components/StatsCard';
import Badge from '../../components/Badge';
import RazorpayCheckoutModal from '../../components/RazorpayCheckoutModal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const SubscriptionPlanPage = () => {
  const { refreshMe } = useAuth();
  const { error } = useToast();
  const [subData, setSubData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Razorpay Checkout Modal
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState(null);

  useEffect(() => {
    fetchSubscriptionAndPlans();
  }, []);

  const fetchSubscriptionAndPlans = async () => {
    try {
      setLoading(true);
      const [subRes, plansRes] = await Promise.all([
        api.get('/subscriptions/my-subscription'),
        api.get('/superadmin/plans'),
      ]);
      if (subRes.success) setSubData(subRes.data);
      if (plansRes.success) setPlans(plansRes.data);
    } catch (err) {
      error(err.message || 'Failed to load subscription info');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCheckout = (plan) => {
    setSelectedPlanToBuy(plan);
    setCheckoutModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    fetchSubscriptionAndPlans();
    refreshMe();
  };

  const current = subData?.current;
  const isExpired = current?.isExpired ?? false;

  return (
    <div>
      <Header
        title="Subscription & Billing Console"
        subtitle="Manage your CRM subscription plan, renew license, and view payment receipts."
      />

      <div className="page-wrapper">
        {/* Current Active Plan Status Banner */}
        <div
          className="glass-panel"
          style={{
            padding: '28px',
            marginBottom: '32px',
            borderLeft: `5px solid ${isExpired ? '#ef4444' : '#10b981'}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
                  {current?.plan?.name || 'Standard Pro Tier'}
                </h2>
                <Badge color={isExpired ? '#ef4444' : '#10b981'}>
                  {isExpired ? 'Subscription Expired' : 'Active Subscription'}
                </Badge>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '6px 0 0' }}>
                {isExpired
                  ? 'Your subscription expired. Renew now to restore full write capabilities.'
                  : `Your plan is valid until ${new Date(current?.endDate).toLocaleDateString()} (${current?.daysRemaining} days remaining)`}
              </p>
            </div>

            {current?.plan && (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => handleOpenCheckout(current.plan)}
              >
                <Zap size={18} />
                {isExpired ? 'Renew Subscription Now' : 'Extend / Renew Plan'}
              </button>
            )}
          </div>
        </div>

        {/* Upgrade / Change Plan Section */}
        <div style={{ marginBottom: '36px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
            Available Plans & Upgrades
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            Upgrade anytime with secure Razorpay payment.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {plans.map((plan) => {
              const isCurrentPlan = current?.plan?._id === plan._id;

              return (
                <div
                  key={plan._id}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: isCurrentPlan ? '2px solid #10b981' : '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{plan.name}</h4>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {plan.durationMonths || (plan.billingCycle === 'yearly' ? 12 : 1)} { (plan.durationMonths || (plan.billingCycle === 'yearly' ? 12 : 1)) === 1 ? 'Month' : 'Months' } Duration
                      </span>
                    </div>
                    {isCurrentPlan && <Badge color="#10b981">Current</Badge>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '14px 0' }}>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{plan.price}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      / {plan.durationMonths || (plan.billingCycle === 'yearly' ? 12 : 1)} { (plan.durationMonths || (plan.billingCycle === 'yearly' ? 12 : 1)) === 1 ? 'mo' : 'mos' }
                    </span>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {plan.features?.map((f, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <Check size={14} color="#10b981" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`btn ${isCurrentPlan ? 'btn-success' : 'btn-primary'}`}
                    onClick={() => handleOpenCheckout(plan)}
                  >
                    <CreditCard size={16} />
                    {isCurrentPlan ? 'Renew This Plan' : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoice & Payment History */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>
            Payment History & Invoices
          </h3>

          <div className="table-container">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Invoice Ref</th>
                  <th>Plan Name</th>
                  <th>Amount Paid</th>
                  <th>Payment Gateway</th>
                  <th>Period Covered</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {subData?.history?.map((hist) => (
                  <tr key={hist._id}>
                    <td>
                      <code>{hist.invoiceNumber || `INV-${hist._id.slice(-6)}`}</code>
                    </td>
                    <td>
                      <strong>{hist.planId?.name || 'Standard'}</strong>
                    </td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>
                      ₹{hist.amountPaid}
                    </td>
                    <td>
                      <Badge color="#6366f1">Razorpay Verified</Badge>
                    </td>
                    <td>
                      {new Date(hist.startDate).toLocaleDateString()} &rarr; {new Date(hist.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {new Date(hist.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Razorpay Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        plan={selectedPlanToBuy}
        billingCycle={selectedPlanToBuy?.billingCycle || 'monthly'}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default SubscriptionPlanPage;
