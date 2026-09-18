import React, { useState, useEffect } from 'react';
import {
  Printer,
  Download,
  CheckCircle2,
  Building2,
  CreditCard,
  ShieldCheck,
  Calendar,
  X,
  Loader2,
  FileText,
} from 'lucide-react';
import Modal from './Modal';
import Badge from './Badge';
import api from '../services/api';
import { formatDate } from '../utils/date';

export const InvoiceReceiptModal = ({ isOpen, onClose, subscriptionId }) => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (isOpen && subscriptionId) {
      fetchInvoice();
    }
  }, [isOpen, subscriptionId]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const res = await api.get(`/subscriptions/invoice/${subscriptionId}`);
      if (res.success) {
        setInvoiceData(res.data);
      } else {
        setFetchError(res.message || 'Invoice details not found');
      }
    } catch (err) {
      setFetchError(err.message || 'Failed to load invoice receipt');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const tenant = invoiceData?.tenantId;
  const plan = invoiceData?.planId;
  const amountPaid = invoiceData?.amountPaid || 0;
  const subtotal = (amountPaid / 1.18).toFixed(2);
  const gstAmount = (amountPaid - parseFloat(subtotal)).toFixed(2);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Receipt & Tax Invoice"
      maxWidth="850px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Official electronic receipt • Verified by Razorpay
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              className="btn btn-primary"
              onClick={handlePrint}
              disabled={loading || !invoiceData}
            >
              <Printer size={16} />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Loader2 size={32} className="spin-icon" style={{ color: 'var(--primary-500)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading invoice data...</p>
        </div>
      ) : fetchError ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#ef4444' }}>
          <p>{fetchError}</p>
        </div>
      ) : invoiceData ? (
        <div className="invoice-printable-container">
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              .invoice-printable-container, .invoice-printable-container * {
                visibility: visible !important;
              }
              .invoice-printable-container {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 20px !important;
                background: #ffffff !important;
                color: #0f172a !important;
                box-shadow: none !important;
                border: none !important;
              }
              .modal-backdrop, .modal-header, .modal-footer {
                display: none !important;
              }
            }
          `}</style>

          <div
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '12px',
              padding: '32px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f1f5f9', paddingBottom: '24px', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px', color: '#4f46e5' }}>
                    ZOKEP<span style={{ color: '#06b6d4' }}>.</span>CRM
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>SaaS Lead Management & Growth Engine</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>support@zokepcrm.com • www.zokepcrm.com</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'inline-block', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  ● PAID / ACTIVE
                </span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  TAX INVOICE & RECEIPT
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  {invoiceData.invoiceNumber || `INV-${invoiceData._id.slice(-6)}`}
                </div>
              </div>
            </div>

            {/* Billed To / From & Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px', background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  Billed To (Customer):
                </span>
                <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>
                  {tenant?.companyName || tenant?.name || 'Valued Client'}
                </strong>
                <div style={{ fontSize: '13px', color: '#334155' }}>Attn: {tenant?.name}</div>
                <div style={{ fontSize: '13px', color: '#334155' }}>Email: {tenant?.email}</div>
                {tenant?.phone && <div style={{ fontSize: '13px', color: '#334155' }}>Phone: {tenant?.phone}</div>}
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  Payment Details:
                </span>
                <div style={{ fontSize: '13px', color: '#334155' }}>
                  <strong>Date:</strong> {formatDate(invoiceData.createdAt || invoiceData.startDate)}
                </div>
                <div style={{ fontSize: '13px', color: '#334155' }}>
                  <strong>Gateway:</strong> Razorpay Secure Gateway
                </div>
                {invoiceData.razorpayPaymentId && (
                  <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                    Payment ID: {invoiceData.razorpayPaymentId}
                  </div>
                )}
                {invoiceData.razorpayOrderId && (
                  <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                    Order ID: {invoiceData.razorpayOrderId}
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div style={{ marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Description / Subscription Plan</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Coverage Period</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>
                        {plan?.name || 'CRM Subscription Plan'}
                      </strong>
                      <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>
                        {plan?.billingCycle || 'Monthly'} Billing ({plan?.durationMonths || 1} { (plan?.durationMonths || 1) === 1 ? 'month' : 'months' } validity)
                      </span>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        • Team Limit: {plan?.staffLimit === -1 ? 'Unlimited Staff' : `${plan?.staffLimit || 5} Staff Accounts`}
                        <br />
                        • Lead Ingestion Limit: {plan?.leadLimit === -1 ? 'Unlimited Leads' : `${plan?.leadLimit || 1000} Leads`}
                      </div>
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'top', color: '#334155' }}>
                      {formatDate(invoiceData.startDate)} <br />
                      &rarr; <strong>{formatDate(invoiceData.endDate)}</strong>
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'top', textAlign: 'right', fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                      ₹{amountPaid.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculations & Total Summary */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Taxable Amount (Net):</span>
                  <span>₹{subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Estimated GST (18%):</span>
                  <span>₹{gstAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '2px solid #e2e8f0', fontSize: '16px', fontWeight: 800, color: '#10b981' }}>
                  <span>Total Amount Paid:</span>
                  <span>₹{amountPaid.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer / Disclaimer */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', fontSize: '11px', color: '#94a3b8', lineHeight: 1.5, textAlign: 'center' }}>
              This is a computer-generated tax invoice and payment receipt for digital SaaS services provided by Zokep CRM.
              <br />
              All subscriptions are governed by the Zokep CRM Terms of Service. For any billing questions, contact support@zokepcrm.com.
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default InvoiceReceiptModal;
