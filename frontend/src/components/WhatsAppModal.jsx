import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, ExternalLink } from 'lucide-react';
import Modal from './Modal';
import WhatsAppIcon from './WhatsAppIcon';
import CustomSelect from './CustomSelect';
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
      if (lead) {
        setMessageText(`Hello ${lead.name || 'there'}, this is ${user?.name || 'Representative'} from ${user?.companyName || 'our team'}. Hope you are doing well!`);
      }
      fetchTemplates();
    }
  }, [isOpen, lead]);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/settings/templates', { type: 'whatsapp' });
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setTemplates(res.data);
        applyTemplate(res.data[0]);
        setSelectedTemplateId(res.data[0]._id);
      } else {
        setTemplates([]);
        if (lead) {
          setMessageText(`Hello ${lead.name || 'there'}, this is ${user?.name || 'Representative'} from ${user?.companyName || 'our team'}. Hope you are doing well!`);
        }
      }
    } catch (err) {
      console.warn('Failed to load templates:', err.message);
      if (lead) {
        setMessageText(`Hello ${lead.name || 'there'}, this is ${user?.name || 'Representative'} from ${user?.companyName || 'our team'}. Hope you are doing well!`);
      }
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

    // Replace custom field tokens safely
    if (lead.customFieldsData && typeof lead.customFieldsData === 'object') {
      Object.keys(lead.customFieldsData).forEach((key) => {
        try {
          const val = lead.customFieldsData[key];
          const stringVal = Array.isArray(val) ? val.join(', ') : String(val ?? '');
          const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          body = body.replace(new RegExp(`{{${escapedKey}}}`, 'gi'), stringVal);
        } catch (e) {
          console.warn('Token replace warning:', e);
        }
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
    let cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '').replace(/^0+/, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`; // default to India country code 91 if 10 digits
    }

    if (!cleanPhone) {
      error('Invalid phone number format');
      return;
    }

    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

    // Open WhatsApp in a NEW tab using programmatic link click to guarantee CRM tab never navigates or turns blank
    try {
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    // Record follow-up activity log in background
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
            <WhatsAppIcon size={16} color="#ffffff" />
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
            <CustomSelect
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              options={templates.map((tpl) => ({
                value: tpl._id,
                label: tpl.title,
              }))}
            />
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
