import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, ExternalLink } from 'lucide-react';
import Modal from './Modal';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const WhatsAppModal = ({ isOpen, onClose, lead, onFollowupSuccess }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/settings/templates', { type: 'whatsapp' });
      if (res.success && res.data.length > 0) {
        setTemplates(res.data);
        applyTemplate(res.data[0]);
        setSelectedTemplateId(res.data[0]._id);
      } else {
        setMessageText(`Hello ${lead?.name || 'there'}, this is ${user?.name} from ${user?.companyName || 'our team'}. Hope you are doing well!`);
      }
    } catch (err) {
      console.warn('Failed to load templates:', err.message);
    }
  };

  const applyTemplate = (tpl) => {
    if (!tpl || !lead) return;
    let body = tpl.body || '';
    body = body
      .replace(/{{lead_name}}/gi, lead.name || '')
      .replace(/{{phone}}/gi, lead.phone || '')
      .replace(/{{email}}/gi, lead.email || '')
      .replace(/{{company}}/gi, lead.company || user?.companyName || '')
      .replace(/{{business_name}}/gi, user?.companyName || 'Our Business')
      .replace(/{{staff_name}}/gi, user?.name || 'Representative')
      .replace(/{{deal_value}}/gi, lead.dealValue ? `₹${lead.dealValue}` : '');

    // Replace custom field tokens if present
    if (lead.customFieldsData) {
      Object.keys(lead.customFieldsData).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'gi');
        body = body.replace(regex, lead.customFieldsData[key] || '');
      });
    }

    setMessageText(body);
  };

  const handleTemplateChange = (id) => {
    setSelectedTemplateId(id);
    const tpl = templates.find((t) => t._id === id);
    if (tpl) applyTemplate(tpl);
  };

  const handleSend = async () => {
    if (!lead?.phone) {
      error('Lead phone number is missing');
      return;
    }

    // Sanitize phone number for WhatsApp wa.me/ link (e.g. wa.me/919876543210)
    let cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`; // default to India country code 91 if 10 digits
    }

    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');

    // Record follow-up activity log
    try {
      setLoading(true);
      await api.post(`/leads/${lead._id}/followup`, {
        activityType: 'whatsapp',
        note: `WhatsApp message sent: "${messageText.slice(0, 150)}..."`,
      });
      success('WhatsApp chat opened and activity logged!');
      if (onFollowupSuccess) onFollowupSuccess();
      onClose();
    } catch (err) {
      console.error('Followup log error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="1-Click WhatsApp Message"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-whatsapp" onClick={handleSend} disabled={loading}>
            <ExternalLink size={16} />
            Open WhatsApp Chat
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            Recipient: <strong style={{ color: 'var(--text-primary)' }}>{lead?.name}</strong> (<code>{lead?.phone}</code>)
          </p>
        </div>

        {templates.length > 0 && (
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Select WhatsApp Template</label>
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
          <label className="form-label">Message Content (You can customize before sending)</label>
          <textarea
            className="form-textarea"
            style={{ minHeight: '120px' }}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Placeholders like lead name, phone, company, and sales rep are already replaced.
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default WhatsAppModal;
