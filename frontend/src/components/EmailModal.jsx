import React, { useState, useEffect } from 'react';
import { Mail, Send, Check } from 'lucide-react';
import Modal from './Modal';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const EmailModal = ({ isOpen, onClose, lead, onEmailSuccess }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/settings/templates', { type: 'email' });
      if (res.success && res.data.length > 0) {
        setTemplates(res.data);
        applyTemplate(res.data[0]);
        setSelectedTemplateId(res.data[0]._id);
      } else {
        setSubject(`Regarding your inquiry with ${user?.companyName || 'our team'}`);
        setBody(`<p>Hi ${lead?.name || ''},</p><p>Thank you for connecting with us. Please let us know when you would like to discuss next steps.</p><p>Best regards,<br>${user?.name}<br>${user?.companyName || ''}</p>`);
      }
    } catch (err) {
      console.warn('Failed to load email templates:', err.message);
    }
  };

  const applyTemplate = (tpl) => {
    if (!tpl || !lead) return;
    const replaceTokens = (text) => {
      if (!text) return '';
      return text
        .replace(/{{lead_name}}/gi, lead.name || '')
        .replace(/{{phone}}/gi, lead.phone || '')
        .replace(/{{email}}/gi, lead.email || '')
        .replace(/{{company}}/gi, lead.company || user?.companyName || '')
        .replace(/{{business_name}}/gi, user?.companyName || 'Our Business')
        .replace(/{{staff_name}}/gi, user?.name || 'Representative')
        .replace(/{{deal_value}}/gi, lead.dealValue ? `₹${lead.dealValue}` : '');
    };

    setSubject(replaceTokens(tpl.subject || ''));
    setBody(replaceTokens(tpl.body || ''));
  };

  const handleTemplateChange = (id) => {
    setSelectedTemplateId(id);
    const tpl = templates.find((t) => t._id === id);
    if (tpl) applyTemplate(tpl);
  };

  const handleSendEmail = async () => {
    if (!lead?.email) {
      error('Lead email address is missing');
      return;
    }
    if (!subject || !body) {
      error('Please provide both subject and email body');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/settings/send-lead-email', {
        leadId: lead._id,
        customSubject: subject,
        customBody: body,
      });

      if (res.success) {
        success('Email dispatched successfully via Nodemailer! 🚀');
        if (onEmailSuccess) onEmailSuccess();
        onClose();
      }
    } catch (err) {
      error(err.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Email to Lead (Nodemailer)"
      maxWidth="650px"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSendEmail} disabled={loading}>
            <Send size={16} />
            {loading ? 'Sending Email...' : 'Send Email Now'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            Recipient: <strong style={{ color: 'var(--text-primary)' }}>{lead?.name}</strong> (<code>{lead?.email || 'No email provided'}</code>)
          </p>
        </div>

        {templates.length > 0 && (
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Choose Email Template</label>
            <select
              className="form-select"
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              {templates.map((tpl) => (
                <option key={tpl._id} value={tpl._id}>
                  {tpl.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Subject</label>
          <input
            type="text"
            className="form-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Email Message / HTML Body</label>
          <textarea
            className="form-textarea"
            style={{ minHeight: '160px', fontFamily: 'monospace', fontSize: '13px' }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default EmailModal;
