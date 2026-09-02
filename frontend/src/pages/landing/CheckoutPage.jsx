import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  Layers,
  ArrowLeft,
  Sparkles,
  Zap,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

export const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { registerAdmin } = useAuth();
  const { success, error } = useToast();

  const planIdParam = searchParams.get('planId');
  const billingParam = searchParams.get('billing') || 'monthly';

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    businessType: 'Real Estate',
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/superadmin/plans');
      if (res.success && res.data.length > 0) {
        setPlans(res.data);
        const match = res.data.find((p) => p._id === planIdParam) || res.data[0];
        setSelectedPlan(match);
      }
    } catch (err) {
      console.warn('Failed to load plans:', err.message);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckoutAndRegister = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.companyName) {
      error('Please complete all mandatory fields');
      return;
    }

    if (!selectedPlan) {
      error('Please select a valid subscription plan');
      return;
    }

    try {
      setLoading(true);

      // 1. Create Razorpay order on backend
      const orderRes = await api.post('/subscriptions/create-order', {
        planId: selectedPlan._id,
        billingCycle: selectedPlan.billingCycle || billingParam,
      });

      const { order, keyId } = orderRes;

      // 2. If live Razorpay is active
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
          description: `Subscription: ${selectedPlan.name}`,
          order_id: order.id,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          handler: async (response) => {
            try {
              // Complete registration with verified payment details
              const regRes = await registerAdmin({
                ...formData,
                planId: selectedPlan._id,
                billingCycle: selectedPlan.billingCycle || billingParam,
                paymentMethod: 'razorpay',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
              success('🎉 Account created and subscription activated! Welcome to Zokep CRM.');
              navigate('/admin');
            } catch (err) {
              error(err.message || 'Registration failed after payment');
            }
          },
          theme: { color: '#4f46e5' },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
      } else {
        // Run Instant Simulator & Register
        setTimeout(async () => {
          try {
            const regRes = await registerAdmin({
              ...formData,
              planId: selectedPlan._id,
              billingCycle: selectedPlan.billingCycle || billingParam,
              paymentMethod: 'razorpay',
              paymentReference: `PAY_SIM_${Date.now()}`,
              razorpayOrderId: order.id,
              razorpayPaymentId: `pay_sim_${Date.now()}`,
              razorpaySignature: `sig_sim_${Date.now()}`,
            });

            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            success('🎉 Subscription purchase successful! Login credentials sent to your email.');
            navigate('/admin');
          } catch (err) {
            error(err.message || 'Registration error');
          } finally {
            setLoading(false);
          }
        }, 1000);
      }
    } catch (err) {
      error(err.message || 'Checkout failed');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: '1080px', margin: '40px auto', padding: '0 24px' }}>
        <Link
          to="/#pricing"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}
        >
          <ArrowLeft size={16} />
          Back to Plans
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {/* Left Column: Tenant Admin Registration Form */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>
              Create Your Admin Account
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Your login credentials will be generated and emailed via Nodemailer.
            </p>

            <form onSubmit={handleCheckoutAndRegister}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Vikram Malhotra"
                    className="form-input"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Work Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@company.com"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  className="form-input"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 9876543210"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company / Organization Name *</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  placeholder="e.g. Skyline Luxury Realty"
                  className="form-input"
                  value={formData.companyName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Industry / Business Workflow *</label>
                <select
                  name="businessType"
                  className="form-select"
                  value={formData.businessType}
                  onChange={handleInputChange}
                >
                  <option value="Real Estate">Real Estate (Site visits, bookings, property types)</option>
                  <option value="Manufacturing">Manufacturing (RFQ, samples, POs, quantities)</option>
                  <option value="Agencies & IT">Agencies & Consulting (Discovery, proposals)</option>
                  <option value="Healthcare">Healthcare & Clinical Services</option>
                  <option value="Financial & Insurance">Financial & Insurance Services</option>
                  <option value="General Sales">General B2B / B2C Sales</option>
                </select>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  We'll pre-load customized industry lead stages and form fields for your business.
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '16px' }}
                disabled={loading}
              >
                <CreditCard size={18} />
                {loading ? 'Processing via Razorpay...' : `Pay ₹${selectedPlan?.price || 0} & Start Using CRM`}
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary & Plan Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Subscription Summary</h3>

              {plans.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Selected Plan</label>
                  <select
                    className="form-select"
                    value={selectedPlan?._id || ''}
                    onChange={(e) => {
                      const p = plans.find((pl) => pl._id === e.target.value);
                      if (p) setSelectedPlan(p);
                    }}
                  >
                    {plans.map((pl) => {
                      const m = pl.durationMonths || (pl.billingCycle === 'yearly' ? 12 : 1);
                      return (
                        <option key={pl._id} value={pl._id}>
                          {pl.name} - ₹{pl.price} ({m} {m === 1 ? 'Month' : 'Months'})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {selectedPlan && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <span>Plan Duration</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {selectedPlan.durationMonths || (selectedPlan.billingCycle === 'yearly' ? 12 : 1)} { (selectedPlan.durationMonths || (selectedPlan.billingCycle === 'yearly' ? 12 : 1)) === 1 ? 'Month' : 'Months' }
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <span>Team Members</span>
                    <strong style={{ color: '#10b981' }}>
                      Unlimited Staff
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <span>Leads Capacity</span>
                    <strong style={{ color: '#10b981' }}>
                      Unlimited Leads & Deals
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', marginTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700 }}>Total Amount Due:</span>
                    <span style={{ fontSize: '26px', fontWeight: 800, color: '#10b981' }}>
                      ₹{selectedPlan.price}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <ShieldCheck size={32} color="#10b981" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Razorpay Secure Checkout</h4>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  256-bit encrypted checkout with instant invoice & credentials dispatch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
