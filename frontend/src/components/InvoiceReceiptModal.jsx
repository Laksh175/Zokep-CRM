import React, { useState, useEffect } from 'react';
import {
  Printer,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Modal from './Modal';
import api from '../services/api';
import { formatDate } from '../utils/date';

export const InvoiceReceiptModal = ({ isOpen, onClose, subscriptionId, initialData = null }) => {
  const [invoiceData, setInvoiceData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setInvoiceData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (isOpen && subscriptionId) {
      fetchInvoice();
    } else if (!isOpen) {
      setFetchError(null);
    }
  }, [isOpen, subscriptionId]);

  const fetchInvoice = async () => {
    try {
      if (!initialData) {
        setLoading(true);
      }
      setFetchError(null);

      let res;
      try {
        res = await api.get(`/subscriptions/invoice/${subscriptionId}`);
      } catch (err1) {
        try {
          res = await api.get(`/subscriptions/${subscriptionId}/invoice`);
        } catch (err2) {
          try {
            res = await api.get(`/subscription/invoice/${subscriptionId}`);
          } catch (err3) {
            if (initialData) {
              setInvoiceData(initialData);
              return;
            }
            throw err1;
          }
        }
      }

      if (res?.success && res?.data) {
        setInvoiceData(res.data);
      } else if (initialData) {
        setInvoiceData(initialData);
      } else {
        setFetchError(res?.message || 'Invoice details could not be retrieved.');
      }
    } catch (err) {
      if (initialData) {
        setInvoiceData(initialData);
      } else {
        setFetchError(err.message || 'Failed to load invoice receipt');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice-content');
    if (!printContent) return;

    // Use a dedicated hidden print iframe to prevent modal clipping, blank pages, and CSS conflicts
    let iframe = document.getElementById('invoice-print-iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'invoice-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice - ${invoiceData?.invoiceNumber || 'Receipt'}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body {
              background: #ffffff !important;
              color: #0f172a !important;
              padding: 20px !important;
            }
            @page {
              size: A4 portrait;
              margin: 12mm;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 350);
  };

  if (!isOpen) return null;

  const tenant = invoiceData?.tenantId || {};
  const plan = invoiceData?.planId || invoiceData?.plan || {};
  const amountPaid = Number(invoiceData?.amountPaid ?? invoiceData?.price ?? 0);
  const subtotal = (amountPaid / 1.18).toFixed(2);
  const gstAmount = (amountPaid - parseFloat(subtotal)).toFixed(2);
  const invoiceNum = invoiceData?.invoiceNumber || (invoiceData?._id ? `INV-${invoiceData._id.slice(-6).toUpperCase()}` : `INV-${Date.now().toString().slice(-6)}`);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Receipt & Tax Invoice"
      maxWidth="850px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
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
      {loading && !invoiceData ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Loader2 size={32} className="spin-icon" style={{ color: 'var(--primary-500)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading invoice data...</p>
        </div>
      ) : fetchError && !invoiceData ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#ef4444' }}>
          <AlertCircle size={32} style={{ margin: '0 auto 10px', color: '#ef4444' }} />
          <p style={{ fontWeight: 600 }}>{fetchError}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
            If you recently deployed, please ensure your backend server has finished redeploying.
          </p>
        </div>
      ) : invoiceData ? (
        <div id="printable-invoice-content" style={{ background: '#ffffff', color: '#1e293b', borderRadius: '12px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' }}>
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
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                <CheckCircle2 size={13} color="#059669" />
                <span>PAID / ACTIVE</span>
              </span>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                TAX INVOICE & RECEIPT
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                {invoiceNum}
              </div>
            </div>
          </div>

          {/* Billed To / From & Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px', background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Billed To (Customer):
              </span>
              <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>
                {tenant?.companyName || tenant?.name || invoiceData?.companyName || 'Valued Business Tenant'}
              </strong>
              {tenant?.name && <div style={{ fontSize: '13px', color: '#334155' }}>Attn: {tenant.name}</div>}
              {tenant?.email && <div style={{ fontSize: '13px', color: '#334155' }}>Email: {tenant.email}</div>}
              {tenant?.phone && <div style={{ fontSize: '13px', color: '#334155' }}>Phone: {tenant.phone}</div>}
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Payment Details:
              </span>
              <div style={{ fontSize: '13px', color: '#334155' }}>
                <strong>Issue Date:</strong> {formatDate(invoiceData.createdAt || invoiceData.startDate || new Date())}
              </div>
              <div style={{ fontSize: '13px', color: '#334155' }}>
                <strong>Payment Method:</strong> Razorpay Online Gateway
              </div>
              {invoiceData.paymentDetails?.razorpay_payment_id || invoiceData.razorpayPaymentId ? (
                <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                  Payment ID: {invoiceData.paymentDetails?.razorpay_payment_id || invoiceData.razorpayPaymentId}
                </div>
              ) : null}
              {invoiceData.paymentDetails?.razorpay_order_id || invoiceData.razorpayOrderId ? (
                <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                  Order ID: {invoiceData.paymentDetails?.razorpay_order_id || invoiceData.razorpayOrderId}
                </div>
              ) : null}
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 700 }}>Description / Subscription Plan</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700 }}>Coverage Period</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '14px', verticalAlign: 'top' }}>
                    <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>
                      {plan?.name || invoiceData.planName || 'CRM Subscription Plan'}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>
                      {plan?.billingCycle || invoiceData.billingCycle || 'Monthly'} Plan
                    </span>
                    {(plan?.leadLimit !== undefined || plan?.staffLimit !== undefined) && (
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        • Team Limit: {plan?.staffLimit === -1 ? 'Unlimited Staff' : `${plan?.staffLimit || 5} Staff Accounts`}
                        <br />
                        • Lead Ingestion Limit: {plan?.leadLimit === -1 ? 'Unlimited Leads' : `${plan?.leadLimit || 1000} Leads`}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px', verticalAlign: 'top', color: '#334155' }}>
                    {formatDate(invoiceData.startDate)} <br />
                    &rarr; <strong>{formatDate(invoiceData.endDate)}</strong>
                  </td>
                  <td style={{ padding: '14px', verticalAlign: 'top', textAlign: 'right', fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                    ₹{amountPaid.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calculations & Total Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
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
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', fontSize: '11px', color: '#94a3b8', lineHeight: 1.5, textAlign: 'center' }}>
            This is a computer-generated tax invoice and payment receipt for digital SaaS services provided by Zokep CRM.
            <br />
            All subscriptions are governed by the Zokep CRM Terms of Service. For any billing questions, contact support@zokepcrm.com.
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default InvoiceReceiptModal;
