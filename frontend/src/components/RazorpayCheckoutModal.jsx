import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import Modal from './Modal';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

export const RazorpayCheckoutModal = ({ isOpen, onClose, plan, billingCycle = 'monthly', onPaymentSuccess }) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('summary'); // 'summary' | 'simulating'

  if (!plan) return null;

  const triggerRazorpayCheckout = async () => {
    try {
      setLoading(true);

      // 1. Create order on backend
      const orderRes = await api.post('/subscriptions/create-order', {
        planId: plan._id || plan.id,
        billingCycle,
      });

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to create payment order');
      }

      const { order, keyId } = orderRes;

      // 2. Check if live Razorpay SDK is available and key is configured
      if (
        window.Razorpay &&
        keyId &&
        keyId !== 'rzp_test_placeholder_key_id' &&
        !order.mockMode
      ) {
        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'Zokep CRM',
          description: `Subscription: ${plan.name} (${billingCycle})`,
          order_id: order.id,
          handler: async (response) => {
            try {
              const verifyRes = await api.post('/subscriptions/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan._id || plan.id,
                billingCycle,
              });

              if (verifyRes.success) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                success('🎉 Payment verified and subscription activated!');
                if (onPaymentSuccess) onPaymentSuccess(verifyRes);
                onClose();
              }
            } catch (err) {
              error(err.message || 'Payment verification failed');
            }
          },
          theme: {
            color: '#4f46e5',
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
        setLoading(false);
      } else {
        // Run Instant Razorpay Simulator
        setStep('simulating');
        setTimeout(async () => {
          try {
            const verifyRes = await api.post('/subscriptions/verify-payment', {
              razorpay_order_id: order.id,
              razorpay_payment_id: `pay_sim_${Date.now()}`,
              razorpay_signature: `sig_sim_${Date.now()}`,
              planId: plan._id || plan.id,
              billingCycle,
            });

            if (verifyRes.success) {
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              success(`🎉 Payment verified! Subscription upgraded to ${plan.name}!`);
              if (onPaymentSuccess) onPaymentSuccess(verifyRes);
              onClose();
            }
          } catch (err) {
            error(err.message || 'Payment simulation failed');
          } finally {
            setLoading(false);
            setStep('summary');
          }
        }, 1200);
      }
    } catch (err) {
      error(err.message || 'Checkout failed');
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Subscription with Razorpay"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={triggerRazorpayCheckout} disabled={loading}>
            <CreditCard size={16} />
            {loading ? 'Processing via Razorpay...' : `Pay ₹${plan.price} Now`}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: 'var(--bg-surface-elevated)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Selected Plan:</span>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{plan.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Billing Cycle:</span>
            <span style={{ fontSize: '14px', fontWeight: 600, textTransform: 'capitalize', color: '#06b6d4' }}>
              {billingCycle} (Renews automatically)
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Total Due:</span>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#10b981' }}>₹{plan.price}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(99, 102, 241, 0.1)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <ShieldCheck size={24} color="#6366f1" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Secured by <strong>Razorpay Payment Gateway</strong>. All standard UPI, Credit/Debit Cards, NetBanking, and Wallets are supported.
          </p>
        </div>

        {step === 'simulating' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Zap size={32} color="#f59e0b" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>
              Simulating Razorpay Transaction & Signature Verification...
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RazorpayCheckoutModal;
