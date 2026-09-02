import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layers, Send, CheckCircle2, AlertCircle, Building2, Sparkles, Sun, Moon } from 'lucide-react';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import DynamicFieldRenderer from '../../components/DynamicFieldRenderer';
import confetti from 'canvas-confetti';

export const PublicLeadFormPage = () => {
  const { tenantId } = useParams();
  const { toggleTheme, isDark } = useTheme();

  const [formConfig, setFormConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    notes: '',
  });

  const [customFieldsData, setCustomFieldsData] = useState({});

  useEffect(() => {
    fetchConfig();
  }, [tenantId]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/public/form/${tenantId}`);
      if (res.success) {
        setFormConfig(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'This lead form is currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please provide Name and Phone number');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/public/form/${tenantId}`, {
        ...formData,
        customFieldsData,
      });

      if (res.success) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setSubmitted(true);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
        <p>Loading inquiry form...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-primary)', padding: '24px' }}>
        <div className="glass-panel" style={{ maxWidth: '460px', padding: '32px', textAlign: 'center', borderRadius: '16px' }}>
          <AlertCircle size={40} color="#f43f5e" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Form Unavailable</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Top Right Theme Toggle */}
      <div style={{ position: 'absolute', top: 20, right: 24 }}>
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-sm"
          style={{ width: 38, height: 38, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#6366f1" />}
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '600px' }}>
        {/* Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              fontSize: '13px',
              fontWeight: 700,
              color: '#818cf8',
              marginBottom: '12px',
            }}
          >
            <Building2 size={16} />
            <span>{formConfig?.companyName || 'Lead Inquiry'}</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            Get in Touch With Our Team
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Fill out the form below and one of our consultants will contact you shortly.
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Inquiry Submitted!</h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 24px' }}>
                Thank you for contacting <strong>{formConfig?.companyName}</strong>. Your inquiry has been routed to our team and we'll reach out to you soon.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', phone: '', email: '', company: '', notes: '' });
                  setCustomFieldsData({});
                }}
                className="btn btn-secondary"
              >
                Submit Another Response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Base Mandatory Fields */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  Your Full Name <span style={{ color: '#f43f5e' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  Phone Number <span style={{ color: '#f43f5e' }}>*</span>
                </label>
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

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Company / Business Name</label>
                <input
                  type="text"
                  name="company"
                  placeholder="Your organization (if applicable)"
                  className="form-input"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>

              {/* Dynamic Custom Fields configured by Tenant Admin */}
              {formConfig?.customFields?.length > 0 && (
                <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                  <DynamicFieldRenderer
                    fields={formConfig.customFields}
                    values={customFieldsData}
                    onChange={setCustomFieldsData}
                  />
                </div>
              )}

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Requirement Details / Notes</label>
                <textarea
                  name="notes"
                  className="form-textarea"
                  placeholder="Tell us more about your specific requirements..."
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '8px' }}
                disabled={submitting}
              >
                <Send size={18} />
                {submitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </form>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
          Powered by{' '}
          <Link to="/" style={{ color: 'var(--primary-500)', fontWeight: 600 }}>
            Zokep CRM
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicLeadFormPage;
