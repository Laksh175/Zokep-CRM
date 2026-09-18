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
  FileText,
  Printer,
  Download,
} from 'lucide-react';
import Header from '../../components/Header';
import StatsCard from '../../components/StatsCard';
import Badge from '../../components/Badge';
import RazorpayCheckoutModal from '../../components/RazorpayCheckoutModal';
import InvoiceReceiptModal from '../../components/InvoiceReceiptModal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/date';

export const SubscriptionPlanPage = () => {
  const { user, refreshMe } = useAuth();
  const { error } = useToast();
  const [subData, setSubData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Razorpay Checkout Modal
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState(null);

  // Invoice / Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedInvoiceSubId, setSelectedInvoiceSubId] = useState(null);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState(null);

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
  const history = subData?.history;
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
                  : `Your plan is valid until ${formatDate(current?.endDate)} (${current?.daysRemaining} days remaining)`}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {current?.id && (
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => {
                    setSelectedInvoiceSubId(current.id);
                    setSelectedInvoiceData({
                      ...current,
                      _id: current.id,
                      tenantId: user,
                      planId: current.plan,
                    });
                    setReceiptModalOpen(true);
                  }}
                  title="View / Download Latest Tax Receipt"
                >
                  <FileText size={18} />
                  <span>Download Receipt</span>
                </button>
              )}

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
        </div>

        {/* Upgrade / Change Plan Section */}
        <div style={{ marginBottom: '36px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
            Available Plans & Upgrades
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            Choose a plan that scales with your sales velocity and team requirements.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {plans.map((plan) => {
              const isCurrent = current?.plan?._id === plan._id || current?.plan?.name === plan.name;
              return (
                <div
                  key={plan._id}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: isCurrent ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
                    position: 'relative',
                  }}
                >
                  {isCurrent && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                      }}
                    >
                      <Badge color="#10b981">Your Plan</Badge>
                    </div>
                  )}

                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px' }}>{plan.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '28px', fontWeight: 900 }}>₹{plan.price}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        /{plan.billingCycle || 'month'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <Check size={16} color="#10b981" />
                        <span>
                          {plan.staffLimit === -1 ? 'Unlimited' : plan.staffLimit} Team Staff Accounts
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <Check size={16} color="#10b981" />
                        <span>
                          {plan.leadLimit === -1 ? 'Unlimited' : plan.leadLimit} Ingested Leads
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <Check size={16} color="#10b981" />
                        <span>Direct WhatsApp & Meta Ads Ingestion</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <Check size={16} color="#10b981" />
                        <span>Custom SMTP Email Dispatcher</span>
                      </div>
                    </div>
                  </div>

                  <button
                    className={`btn ${isCurrent ? 'btn-secondary' : 'btn-primary'} btn-block`}
                    onClick={() => handleOpenCheckout(plan)}
                  >
                    {isCurrent ? 'Extend / Renew' : 'Upgrade Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subscription & Billing Ledger History */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            Subscription & Payment History
          </h3>

          <div className="table-container">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment Type</th>
                  <th>Coverage Period</th>
                  <th>Date</th>
                  <th>Invoice Receipt</th>
                </tr>
              </thead>
              <tbody>
                {(!history || history.length === 0) && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No past billing transactions found.
                    </td>
                  </tr>
                )}
                {history?.map((hist) => (
                  <tr key={hist._id}>
                    <td>
                      <strong>{hist.planId?.name || 'CRM Plan'}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {hist.planId?.billingCycle || 'Monthly'}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{hist.amountPaid}</td>
                    <td>
                      <Badge color={hist.status === 'active' ? '#10b981' : '#64748b'}>
                        {hist.status}
                      </Badge>
                    </td>
                    <td>
                      <Badge color="#6366f1">Razorpay Verified</Badge>
                    </td>
                    <td>
                      {formatDate(hist.startDate)} &rarr; {formatDate(hist.endDate)}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {formatDate(hist.createdAt)}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedInvoiceSubId(hist._id);
                          setSelectedInvoiceData({
                            ...hist,
                            tenantId: user,
                          });
                          setReceiptModalOpen(true);
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                      >
                        <FileText size={14} color="#4f46e5" />
                        <span>Receipt</span>
                      </button>
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

      {/* Invoice / Receipt Download Modal */}
      <InvoiceReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setSelectedInvoiceSubId(null);
          setSelectedInvoiceData(null);
        }}
        subscriptionId={selectedInvoiceSubId}
        initialData={selectedInvoiceData}
      />
    </div>
  );
};

export default SubscriptionPlanPage;
