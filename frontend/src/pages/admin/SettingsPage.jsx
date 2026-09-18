import React, { useState, useEffect } from 'react';
import {
  Palette,
  FormInput,
  MessageSquare,
  Link as LinkIcon,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Code,
  Sparkles,
  Check,
  Loader2,
  Zap,
  Megaphone,
  Radio,
  Share2,
  Send,
  Smartphone,
  ShieldCheck,
  Play,
  HelpCircle,
  QrCode,
  Key,
} from 'lucide-react';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import CustomSelect from '../../components/CustomSelect';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('statuses'); // 'statuses' | 'fields' | 'templates' | 'public_form' | 'integrations'

  // Data states
  const [statuses, setStatuses] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [statusForm, setStatusForm] = useState({ name: '', color: '#3b82f6', isDefault: false, isConvertedState: false, isLostState: false });
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Custom Field Modal State
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [fieldForm, setFieldForm] = useState({
    fieldLabel: '',
    fieldType: 'text',
    optionsText: '',
    placeholder: '',
    isRequired: false,
    showInTable: true,
  });
  const [submittingField, setSubmittingField] = useState(false);

  // Template Modal State
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    type: 'whatsapp',
    title: '',
    subject: '',
    body: '',
  });
  const [submittingTemplate, setSubmittingTemplate] = useState(false);

  // Public form copy states
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Integrations states
  const [copiedMetaUrl, setCopiedMetaUrl] = useState(false);
  const [copiedMetaToken, setCopiedMetaToken] = useState(false);
  const [copiedWaUrl, setCopiedWaUrl] = useState(false);
  const [copiedWaToken, setCopiedWaToken] = useState(false);
  const [copiedUniversalUrl, setCopiedUniversalUrl] = useState(false);
  const [copiedWaLink, setCopiedWaLink] = useState(false);
  const [testingMeta, setTestingMeta] = useState(false);
  const [testingWa, setTestingWa] = useState(false);
  const [waCustomPhone, setWaCustomPhone] = useState(user?.phone || '919876543210');
  const [waCustomMessage, setWaCustomMessage] = useState('Hi! I saw your campaign and would like to know more details.');

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      const [stRes, cfRes, tpRes] = await Promise.all([
        api.get('/settings/statuses'),
        api.get('/settings/custom-fields'),
        api.get('/settings/templates'),
      ]);
      if (stRes.success) setStatuses(stRes.data);
      if (cfRes.success) setCustomFields(cfRes.data);
      if (tpRes.success) setTemplates(tpRes.data);
    } catch (err) {
      error(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Status Actions
  const openCreateStatusModal = () => {
    setEditingStatusId(null);
    setStatusForm({ name: '', color: '#3b82f6', isDefault: false, isConvertedState: false, isLostState: false });
    setStatusModalOpen(true);
  };

  const openEditStatusModal = (status) => {
    setEditingStatusId(status._id);
    setStatusForm({
      name: status.name,
      color: status.color || '#3b82f6',
      isDefault: !!status.isDefault,
      isConvertedState: !!status.isConvertedState,
      isLostState: !!status.isLostState,
    });
    setStatusModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!statusForm.name) {
      error('Status name is required');
      return;
    }

    try {
      setSubmittingStatus(true);
      if (editingStatusId) {
        const res = await api.put(`/settings/statuses/${editingStatusId}`, statusForm);
        if (res.success) {
          success('Status updated successfully');
        }
      } else {
        const res = await api.post('/settings/statuses', statusForm);
        if (res.success) {
          success('Status created successfully');
        }
      }
      setStatusModalOpen(false);
      setStatusForm({ name: '', color: '#3b82f6', isDefault: false, isConvertedState: false, isLostState: false });
      setEditingStatusId(null);
      fetchAllSettings();
    } catch (err) {
      error(err.message || 'Failed to save status');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleDeleteStatus = async (id) => {
    if (!window.confirm('Delete this status?')) return;
    try {
      const res = await api.delete(`/settings/statuses/${id}`);
      if (res.success) {
        success('Status deleted');
        fetchAllSettings();
      }
    } catch (err) {
      error(err.message || 'Failed to delete status');
    }
  };

  // Custom Field Actions
  const openCreateFieldModal = () => {
    setEditingFieldId(null);
    setFieldForm({ fieldLabel: '', fieldType: 'text', optionsText: '', placeholder: '', isRequired: false, showInTable: true });
    setFieldModalOpen(true);
  };

  const openEditFieldModal = (field) => {
    setEditingFieldId(field._id);
    setFieldForm({
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      optionsText: (field.options || []).join(', '),
      placeholder: field.placeholder || '',
      isRequired: !!field.isRequired,
      showInTable: !!field.showInTable,
    });
    setFieldModalOpen(true);
  };

  const handleSaveField = async (e) => {
    e.preventDefault();
    if (!fieldForm.fieldLabel) {
      error('Field label is required');
      return;
    }

    try {
      setSubmittingField(true);
      const payload = {
        ...fieldForm,
        options: fieldForm.optionsText ? fieldForm.optionsText.split(',').map((o) => o.trim()).filter(Boolean) : [],
      };

      if (editingFieldId) {
        const res = await api.put(`/settings/custom-fields/${editingFieldId}`, payload);
        if (res.success) success('Custom field updated');
      } else {
        const res = await api.post('/settings/custom-fields', payload);
        if (res.success) success('Custom form field created');
      }

      setFieldModalOpen(false);
      setEditingFieldId(null);
      fetchAllSettings();
    } catch (err) {
      error(err.message || 'Failed to save field');
    } finally {
      setSubmittingField(false);
    }
  };

  const handleDeleteField = async (id) => {
    if (!window.confirm('Delete this custom field?')) return;
    try {
      const res = await api.delete(`/settings/custom-fields/${id}`);
      if (res.success) {
        success('Custom field deleted');
        fetchAllSettings();
      }
    } catch (err) {
      error(err.message || 'Failed to delete field');
    }
  };

  // Template Actions
  const openCreateTemplateModal = () => {
    setEditingTemplateId(null);
    setTemplateForm({ type: 'whatsapp', title: '', subject: '', body: '' });
    setTemplateModalOpen(true);
  };

  const openEditTemplateModal = (template) => {
    setEditingTemplateId(template._id);
    setTemplateForm({
      type: template.type,
      title: template.title,
      subject: template.subject || '',
      body: template.body,
    });
    setTemplateModalOpen(true);
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!templateForm.title || !templateForm.body) {
      error('Template title and body are required');
      return;
    }

    try {
      setSubmittingTemplate(true);
      if (editingTemplateId) {
        const res = await api.put(`/settings/templates/${editingTemplateId}`, templateForm);
        if (res.success) success('Template updated successfully');
      } else {
        const res = await api.post('/settings/templates', templateForm);
        if (res.success) success('Template created successfully');
      }

      setTemplateModalOpen(false);
      setEditingTemplateId(null);
      fetchAllSettings();
    } catch (err) {
      error(err.message || 'Failed to save template');
    } finally {
      setSubmittingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Delete this message template?')) return;
    try {
      const res = await api.delete(`/settings/templates/${id}`);
      if (res.success) {
        success('Template deleted');
        fetchAllSettings();
      }
    } catch (err) {
      error(err.message || 'Failed to delete template');
    }
  };

  const tenantId = user?.tenantId || user?.id || user?._id;
  const backendBaseUrl = window.location.origin;
  const publicFormUrl = `${backendBaseUrl}/f/${tenantId}`;
  const embedCode = `<iframe src="${publicFormUrl}" width="100%" height="650" frameborder="0" style="border-radius: 12px; border: 1px solid #e2e8f0;"></iframe>`;

  const metaWebhookUrl = `${backendBaseUrl}/api/public/webhook/meta/${tenantId}`;
  const metaVerifyToken = `zokep_meta_${tenantId}`;
  const waWebhookUrl = `${backendBaseUrl}/api/public/webhook/whatsapp/${tenantId}`;
  const waVerifyToken = `zokep_wa_${tenantId}`;
  const universalWebhookUrl = `${backendBaseUrl}/api/public/webhook/lead/${tenantId}`;

  const generatedWaLink = `https://wa.me/${waCustomPhone.replace(/\D/g, '')}?text=${encodeURIComponent(waCustomMessage)}`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
      success('Public form link copied to clipboard!');
    } else if (type === 'embed') {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2500);
      success('HTML Embed code copied to clipboard!');
    } else if (type === 'meta_url') {
      setCopiedMetaUrl(true);
      setTimeout(() => setCopiedMetaUrl(false), 2500);
      success('Meta Webhook URL copied!');
    } else if (type === 'meta_token') {
      setCopiedMetaToken(true);
      setTimeout(() => setCopiedMetaToken(false), 2500);
      success('Meta Verify Token copied!');
    } else if (type === 'wa_url') {
      setCopiedWaUrl(true);
      setTimeout(() => setCopiedWaUrl(false), 2500);
      success('WhatsApp Webhook URL copied!');
    } else if (type === 'wa_token') {
      setCopiedWaToken(true);
      setTimeout(() => setCopiedWaToken(false), 2500);
      success('WhatsApp Verify Token copied!');
    } else if (type === 'universal_url') {
      setCopiedUniversalUrl(true);
      setTimeout(() => setCopiedUniversalUrl(false), 2500);
      success('Universal Webhook URL copied!');
    } else if (type === 'wa_link') {
      setCopiedWaLink(true);
      setTimeout(() => setCopiedWaLink(false), 2500);
      success('Click-to-WhatsApp link copied!');
    }
  };

  const handleTestMetaLead = async () => {
    try {
      setTestingMeta(true);
      const res = await api.post(`/public/webhook/meta/${tenantId}`, {
        full_name: 'Simulated Meta Ad Lead',
        phone_number: `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
        email: 'meta.prospect@example.com',
        company: 'Apex Design & Infra',
        campaign_name: 'Meta Ads Summer Promo 2026',
        ad_name: 'Luxury 3BHK Lead Form Ad',
        notes: 'Submitted instant inquiry form via Instagram sponsored post.',
        dealValue: 35000,
      });
      if (res.success) {
        success('🎉 Test Meta Lead Ingested! Check your Leads page.');
      }
    } catch (err) {
      error(err.message || 'Failed to simulate Meta lead');
    } finally {
      setTestingMeta(false);
    }
  };

  const handleTestWaLead = async () => {
    try {
      setTestingWa(true);
      const res = await api.post(`/public/webhook/whatsapp/${tenantId}`, {
        senderName: 'WhatsApp Prospect (Demo)',
        sender: `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
        message: 'Hi! I saw your WhatsApp advertisement and would like to schedule a consultation call today.',
      });
      if (res.success) {
        success('💬 Test WhatsApp Lead Ingested! Check your Leads page.');
      }
    } catch (err) {
      error(err.message || 'Failed to simulate WhatsApp lead');
    } finally {
      setTestingWa(false);
    }
  };

  return (
    <div>
      <Header
        title="CRM Customization & Settings"
        subtitle="Configure custom lead stages & colors, dynamic form fields, WhatsApp/Email templates, direct webhooks, and public capture forms."
      />

      <div className="page-wrapper">
        {/* Settings Navigation Tabs */}
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'statuses' ? 'active' : ''}`}
            onClick={() => setActiveTab('statuses')}
          >
            <Palette size={16} style={{ display: 'inline', marginRight: 6 }} />
            Lead Statuses & Colors
          </button>
          <button
            className={`tab-btn ${activeTab === 'fields' ? 'active' : ''}`}
            onClick={() => setActiveTab('fields')}
          >
            <FormInput size={16} style={{ display: 'inline', marginRight: 6 }} />
            Dynamic Form Fields
          </button>
          <button
            className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <MessageSquare size={16} style={{ display: 'inline', marginRight: 6 }} />
            Message Templates (WA & Email)
          </button>
          <button
            className={`tab-btn ${activeTab === 'public_form' ? 'active' : ''}`}
            onClick={() => setActiveTab('public_form')}
          >
            <LinkIcon size={16} style={{ display: 'inline', marginRight: 6 }} />
            Public Lead Form Link
          </button>
          <button
            className={`tab-btn ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('integrations')}
          >
            <Zap size={16} style={{ display: 'inline', marginRight: 6, color: '#f59e0b' }} />
            Meta & WhatsApp Webhooks
          </button>
        </div>

        {/* TAB 1: LEAD STATUSES & COLORS */}
        {activeTab === 'statuses' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Custom Lead Stages & Badges</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Define custom pipeline stages for your business (e.g. Site Visit Scheduled, RFQ, Token Received) and assign custom colors.
                </p>
              </div>
              <button className="btn btn-primary" onClick={openCreateStatusModal}>
                <Plus size={16} /> Add Status
              </button>
            </div>

            <div className="table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Status Name</th>
                    <th>Badge Color Preview</th>
                    <th>Default Stage</th>
                    <th>Won / Converted State</th>
                    <th>Lost State</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {statuses.map((st) => (
                    <tr key={st._id}>
                      <td>
                        <strong>{st.name}</strong>
                      </td>
                      <td>
                        <Badge color={st.color}>{st.name}</Badge>
                        <code style={{ fontSize: '11px', marginLeft: 8 }}>{st.color}</code>
                      </td>
                      <td>{st.isDefault ? <Badge color="#10b981">Default (Inflow)</Badge> : '-'}</td>
                      <td>{st.isConvertedState ? <Badge color="#10b981">Converts to Customer 🎉</Badge> : '-'}</td>
                      <td>{st.isLostState ? <Badge color="#ef4444">Closed / Lost</Badge> : '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditStatusModal(st)}
                            className="btn-icon btn-secondary"
                            style={{ width: 30, height: 30 }}
                            title="Edit Status"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteStatus(st._id)}
                            className="btn-icon btn-danger"
                            style={{ width: 30, height: 30 }}
                            title="Delete Status"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DYNAMIC CUSTOM FIELDS */}
        {activeTab === 'fields' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Extra Lead Form Fields</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Add extra custom fields specific to your industry (e.g. Property Type, Required Quantity, Budget Bracket).
                </p>
              </div>
              <button className="btn btn-primary" onClick={openCreateFieldModal}>
                <Plus size={16} /> Add Custom Field
              </button>
            </div>

            {customFields.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No extra fields added. Standard fields (Name, Phone, Email, Company, Deal Value, Notes) will be used.</p>
            ) : (
              <div className="table-container">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Field Label</th>
                      <th>Slug Key</th>
                      <th>Input Type</th>
                      <th>Dropdown Options</th>
                      <th>Mandatory</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customFields.map((cf) => (
                      <tr key={cf._id}>
                        <td>
                          <strong>{cf.fieldLabel}</strong>
                        </td>
                        <td>
                          <code>{cf.fieldName}</code>
                        </td>
                        <td>
                          <Badge color="#6366f1">{cf.fieldType.toUpperCase()}</Badge>
                        </td>
                        <td>
                          {cf.options?.length > 0 ? (
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              {cf.options.join(', ')}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>{cf.isRequired ? <Badge color="#f43f5e">Required</Badge> : 'Optional'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => openEditFieldModal(cf)}
                              className="btn-icon btn-secondary"
                              style={{ width: 30, height: 30 }}
                              title="Edit Custom Field"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteField(cf._id)}
                              className="btn-icon btn-danger"
                              style={{ width: 30, height: 30 }}
                              title="Delete Field"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MESSAGE TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>WhatsApp & Nodemailer Email Templates</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Use placeholders: <code>{'{{lead_name}}'}</code>, <code>{'{{phone}}'}</code>, <code>{'{{email}}'}</code>, <code>{'{{company}}'}</code>, <code>{'{{staff_name}}'}</code>, <code>{'{{deal_value}}'}</code>.
                </p>
              </div>
              <button className="btn btn-primary" onClick={openCreateTemplateModal}>
                <Plus size={16} /> Create Template
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {templates.map((tpl) => (
                <div
                  key={tpl._id}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <Badge color={tpl.type === 'whatsapp' ? '#25d366' : '#6366f1'}>
                        {tpl.type === 'whatsapp' ? 'WhatsApp Template' : 'Email Template'}
                      </Badge>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, marginTop: '8px' }}>{tpl.title}</h4>
                      {tpl.subject && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sub: {tpl.subject}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => openEditTemplateModal(tpl)}
                        className="btn-icon btn-secondary"
                        style={{ width: 30, height: 30 }}
                        title="Edit Template"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(tpl._id)}
                        className="btn-icon btn-danger"
                        style={{ width: 30, height: 30 }}
                        title="Delete Template"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace', flex: 1, whiteSpace: 'pre-wrap' }}>
                    {tpl.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PUBLIC LEAD FORM LINK & EMBED */}
        {activeTab === 'public_form' && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
              Public Shareable Lead Capture Form
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Share this standalone public link with prospective clients or embed the lead form directly on your official website. Submissions automatically appear in your CRM inbox.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <ExternalLink size={19} color="var(--primary-500)" style={{ flexShrink: 0 }} />
                  <strong style={{ fontSize: '15px' }}>Direct Link (Share with Clients)</strong>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  Send this URL via WhatsApp, SMS, or bio links:
                </p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    readOnly
                    className="form-input"
                    value={publicFormUrl}
                    style={{ flex: 1, minWidth: '220px', background: 'var(--bg-surface)', fontFamily: 'monospace', fontSize: '13px' }}
                  />
                  <button
                    className={`btn ${copiedUrl ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => copyToClipboard(publicFormUrl, 'url')}
                    style={{ flexShrink: 0, padding: '10px 18px', minWidth: '120px' }}
                  >
                    {copiedUrl ? <Check size={18} /> : <Copy size={18} />}
                    <span>{copiedUrl ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                  <a
                    href={publicFormUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ flexShrink: 0, padding: '10px 18px', textDecoration: 'none', color: '#ffffff' }}
                  >
                    <ExternalLink size={18} />
                    <span>Open Form</span>
                  </a>
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Code size={19} color="#10b981" style={{ flexShrink: 0 }} />
                  <strong style={{ fontSize: '15px' }}>HTML Embed Code (For Your Website)</strong>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  Paste this iframe into your WordPress, Webflow, or custom website:
                </p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <textarea
                    readOnly
                    className="form-textarea"
                    rows={3}
                    value={embedCode}
                    style={{ flex: 1, minWidth: '220px', background: 'var(--bg-surface)', fontFamily: 'monospace', fontSize: '12px' }}
                  />
                  <button
                    className={`btn ${copiedEmbed ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => copyToClipboard(embedCode, 'embed')}
                    style={{ flexShrink: 0, padding: '10px 18px', minWidth: '125px' }}
                  >
                    {copiedEmbed ? <Check size={18} /> : <Copy size={18} />}
                    <span>{copiedEmbed ? 'Copied!' : 'Copy Embed'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: META ADS & WHATSAPP DIRECT WEBHOOKS */}
        {activeTab === 'integrations' && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={20} color="#f59e0b" />
                  Direct Lead Ingestion & Automated Webhooks
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Capture leads straight into Zokep CRM in real-time from Meta (Facebook & Instagram) Lead Ads, WhatsApp Business, and custom API webhooks.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* INTEGRATION 1: META ADS (FACEBOOK & INSTAGRAM) */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-medium)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(24, 119, 242, 0.12)', border: '1px solid rgba(24, 119, 242, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1877f2' }}>
                      <Megaphone size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '16px' }}>Meta (Facebook & Instagram) Instant Lead Ads</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Auto-push leads when users submit forms on Facebook or Instagram</div>
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleTestMetaLead}
                    disabled={testingMeta}
                    style={{ borderColor: 'rgba(24, 119, 242, 0.4)', color: '#1877f2' }}
                  >
                    {testingMeta ? <Loader2 size={14} className="spin-icon" /> : <Play size={14} />}
                    <span>{testingMeta ? 'Simulating...' : '🧪 Send Test Meta Lead'}</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  {/* Webhook URL */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>Meta Webhook Callback URL</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        readOnly
                        className="form-input"
                        value={metaWebhookUrl}
                        style={{ fontFamily: 'monospace', fontSize: '12px', background: 'var(--bg-surface)' }}
                      />
                      <button
                        className={`btn ${copiedMetaUrl ? 'btn-success' : 'btn-secondary'} btn-sm`}
                        onClick={() => copyToClipboard(metaWebhookUrl, 'meta_url')}
                      >
                        {copiedMetaUrl ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Verify Token */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>Meta Webhook Verify Token</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        readOnly
                        className="form-input"
                        value={metaVerifyToken}
                        style={{ fontFamily: 'monospace', fontSize: '12px', background: 'var(--bg-surface)' }}
                      />
                      <button
                        className={`btn ${copiedMetaToken ? 'btn-success' : 'btn-secondary'} btn-sm`}
                        onClick={() => copyToClipboard(metaVerifyToken, 'meta_token')}
                      >
                        {copiedMetaToken ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Meta Integration Instructions */}
                <div style={{ background: 'var(--bg-surface)', padding: '14px 18px', borderRadius: '10px', fontSize: '13px', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                    📖 How to connect Facebook & Instagram Lead Ads:
                  </strong>
                  <ol style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.6 }}>
                    <li>Open <strong>Meta App Dashboard</strong> or <strong>Meta Events Manager / Leads Center</strong>.</li>
                    <li>Add the <strong>Webhooks</strong> product and subscribe to the <code>leadgen</code> object.</li>
                    <li>Paste the <strong>Callback URL</strong> and <strong>Verify Token</strong> shown above.</li>
                    <li><em>Or connect in 60 seconds via Zapier / Make.com</em>: Use our Universal Webhook endpoint below to route leads from Facebook Lead Ads with 0 code.</li>
                  </ol>
                </div>
              </div>

              {/* INTEGRATION 2: WHATSAPP BUSINESS & DIRECT INBOUND CHAT */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-medium)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(37, 211, 102, 0.12)', border: '1px solid rgba(37, 211, 102, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25d366' }}>
                      <WhatsAppIcon size={20} color="#25d366" />
                    </div>
                    <div>
                      <strong style={{ fontSize: '16px' }}>WhatsApp Business Direct Ingestion & Chat Link</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Auto-create leads when prospects send WhatsApp messages or click your direct WhatsApp link</div>
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleTestWaLead}
                    disabled={testingWa}
                    style={{ borderColor: 'rgba(37, 211, 102, 0.4)', color: '#25d366' }}
                  >
                    {testingWa ? <Loader2 size={14} className="spin-icon" /> : <Play size={14} />}
                    <span>{testingWa ? 'Simulating...' : '🧪 Send Test WhatsApp Lead'}</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  {/* WhatsApp Webhook URL */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>WhatsApp Inbound Webhook URL</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        readOnly
                        className="form-input"
                        value={waWebhookUrl}
                        style={{ fontFamily: 'monospace', fontSize: '12px', background: 'var(--bg-surface)' }}
                      />
                      <button
                        className={`btn ${copiedWaUrl ? 'btn-success' : 'btn-secondary'} btn-sm`}
                        onClick={() => copyToClipboard(waWebhookUrl, 'wa_url')}
                      >
                        {copiedWaUrl ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp Verify Token */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>WhatsApp Verify Token</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        readOnly
                        className="form-input"
                        value={waVerifyToken}
                        style={{ fontFamily: 'monospace', fontSize: '12px', background: 'var(--bg-surface)' }}
                      />
                      <button
                        className={`btn ${copiedWaToken ? 'btn-success' : 'btn-secondary'} btn-sm`}
                        onClick={() => copyToClipboard(waVerifyToken, 'wa_token')}
                      >
                        {copiedWaToken ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 1-Click WhatsApp Direct Chat Link Generator */}
                <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Share2 size={16} color="#25d366" />
                    1-Click Direct WhatsApp Lead Generator Link
                  </strong>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Place this link on your Instagram bio, Google Ads Sitelinks, or marketing buttons. When clicked, prospects open WhatsApp directly with your pre-filled inquiry text:
                  </p>
                  
                  <div className="form-grid-2" style={{ marginBottom: '10px' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '11px' }}>Your WhatsApp Number (With Country Code)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 919876543210"
                        value={waCustomPhone}
                        onChange={(e) => setWaCustomPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '11px' }}>Pre-filled Inbound Message</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Inquiry message..."
                        value={waCustomMessage}
                        onChange={(e) => setWaCustomMessage(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      readOnly
                      className="form-input"
                      value={generatedWaLink}
                      style={{ flex: 1, minWidth: '220px', fontFamily: 'monospace', fontSize: '12px', background: 'var(--bg-surface-elevated)' }}
                    />
                    <button
                      className={`btn ${copiedWaLink ? 'btn-success' : 'btn-secondary'} btn-sm`}
                      onClick={() => copyToClipboard(generatedWaLink, 'wa_link')}
                    >
                      {copiedWaLink ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedWaLink ? 'Copied Link!' : 'Copy WhatsApp Link'}</span>
                    </button>
                    <a
                      href={generatedWaLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-whatsapp btn-sm"
                      style={{ textDecoration: 'none', color: '#ffffff' }}
                    >
                      <ExternalLink size={14} />
                      <span>Test Link</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* INTEGRATION 3: UNIVERSAL INBOUND API / ZAPIER / MAKE */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-medium)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                    <Code size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '16px' }}>Universal Inbound Webhook (Zapier, Make.com, WordPress, Custom APIs)</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Send JSON directly from any landing page, custom form, or automation tool</div>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Universal POST Endpoint</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      readOnly
                      className="form-input"
                      value={universalWebhookUrl}
                      style={{ fontFamily: 'monospace', fontSize: '12px', background: 'var(--bg-surface)' }}
                    />
                    <button
                      className={`btn ${copiedUniversalUrl ? 'btn-success' : 'btn-secondary'} btn-sm`}
                      onClick={() => copyToClipboard(universalWebhookUrl, 'universal_url')}
                    >
                      {copiedUniversalUrl ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedUniversalUrl ? 'Copied' : 'Copy Endpoint'}</span>
                    </button>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <label className="form-label" style={{ fontSize: '12px', marginBottom: '6px' }}>Sample JSON Request Payload:</label>
                  <pre style={{ margin: 0, padding: '10px 12px', background: 'var(--bg-surface-elevated)', borderRadius: '8px', fontSize: '12px', color: '#10b981', overflowX: 'auto', fontFamily: 'monospace' }}>
{`POST ${universalWebhookUrl}
Content-Type: application/json

{
  "name": "Kiran Rao",
  "phone": "+91 9876543210",
  "email": "kiran@example.com",
  "company": "Rao Enterprises",
  "dealValue": 50000,
  "source": "facebook_ads",  // 'facebook_ads' | 'whatsapp' | 'website' | 'google_ads' | 'referral'
  "notes": "Interested in premium package",
  "priority": "high"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT STATUS MODAL */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={editingStatusId ? 'Edit Lead Status' : 'Add Custom Lead Status'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setStatusModalOpen(false)} disabled={submittingStatus}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveStatus} disabled={submittingStatus}>
              {submittingStatus ? (
                <>
                  <span className="btn-spinner" />
                  <span>Saving...</span>
                </>
              ) : (
                editingStatusId ? 'Update Status' : 'Save Status'
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveStatus} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Status Stage Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Site Visit Done or RFQ Approved"
              className="form-input"
              value={statusForm.name}
              onChange={(e) => setStatusForm({ ...statusForm, name: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Badge HEX Color (Click to Pick) *</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="color"
                style={{ width: 44, height: 38, border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                value={statusForm.color}
                onChange={(e) => setStatusForm({ ...statusForm, color: e.target.value })}
              />
              <input
                type="text"
                className="form-input"
                value={statusForm.color}
                onChange={(e) => setStatusForm({ ...statusForm, color: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={statusForm.isDefault}
                onChange={(e) => setStatusForm({ ...statusForm, isDefault: e.target.checked })}
              />
              Set as Default Status for incoming new leads
            </label>
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={statusForm.isConvertedState}
                onChange={(e) => setStatusForm({ ...statusForm, isConvertedState: e.target.checked })}
              />
              Won / Converted State (marks lead converted upon selecting this)
            </label>
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={statusForm.isLostState}
                onChange={(e) => setStatusForm({ ...statusForm, isLostState: e.target.checked })}
              />
              Closed / Lost State
            </label>
          </div>
        </form>
      </Modal>

      {/* CREATE / EDIT CUSTOM FIELD MODAL */}
      <Modal
        isOpen={fieldModalOpen}
        onClose={() => setFieldModalOpen(false)}
        title={editingFieldId ? 'Edit Custom Field' : 'Add Dynamic Custom Form Field'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setFieldModalOpen(false)} disabled={submittingField}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveField} disabled={submittingField}>
              {submittingField ? (
                <>
                  <span className="btn-spinner" />
                  <span>Saving...</span>
                </>
              ) : (
                editingFieldId ? 'Update Field' : 'Save Field'
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveField} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Field Label (Display Name) *</label>
            <input
              type="text"
              required
              placeholder="e.g. Property Type or Required Tonnage"
              className="form-input"
              value={fieldForm.fieldLabel}
              onChange={(e) => setFieldForm({ ...fieldForm, fieldLabel: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Field Type *</label>
            <CustomSelect
              value={fieldForm.fieldType}
              onChange={(e) => setFieldForm({ ...fieldForm, fieldType: e.target.value })}
              options={[
                { value: 'text', label: 'Text Box (Single Line)' },
                { value: 'number', label: 'Numeric Number' },
                { value: 'select', label: 'Dropdown Select' },
                { value: 'radio', label: 'Radio Buttons' },
                { value: 'checkbox', label: 'Multiple Checkboxes' },
                { value: 'date', label: 'Date Picker' },
                { value: 'textarea', label: 'Textarea (Multi-line)' },
              ]}
            />
          </div>

          {['select', 'radio', 'checkbox'].includes(fieldForm.fieldType) && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Options (Comma separated) *</label>
              <input
                type="text"
                required
                placeholder="e.g. 1 BHK, 2 BHK, 3 BHK Luxury, Commercial Space"
                className="form-input"
                value={fieldForm.optionsText}
                onChange={(e) => setFieldForm({ ...fieldForm, optionsText: e.target.value })}
              />
            </div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Placeholder Text</label>
            <input
              type="text"
              placeholder="e.g. Select preferred option..."
              className="form-input"
              value={fieldForm.placeholder}
              onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '4px' }}>
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={fieldForm.isRequired}
                onChange={(e) => setFieldForm({ ...fieldForm, isRequired: e.target.checked })}
              />
              Required Field
            </label>
          </div>
        </form>
      </Modal>

      {/* CREATE / EDIT TEMPLATE MODAL */}
      <Modal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        title={editingTemplateId ? 'Edit Message Template' : 'Create Message Template'}
        maxWidth="620px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setTemplateModalOpen(false)} disabled={submittingTemplate}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveTemplate} disabled={submittingTemplate}>
              {submittingTemplate ? (
                <>
                  <span className="btn-spinner" />
                  <span>Saving...</span>
                </>
              ) : (
                editingTemplateId ? 'Update Template' : 'Save Template'
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-grid-2">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Channel Type *</label>
              <CustomSelect
                value={templateForm.type}
                onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
                options={[
                  { value: 'whatsapp', label: '1-Click WhatsApp' },
                  { value: 'email', label: 'Nodemailer Email' },
                ]}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Template Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Site Visit Confirmation"
                className="form-input"
                value={templateForm.title}
                onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
              />
            </div>
          </div>

          {templateForm.type === 'email' && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Subject Line</label>
              <input
                type="text"
                placeholder="e.g. Project Details for {{lead_name}} from {{company}}"
                className="form-input"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
              />
            </div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Message Content / Body *</label>
            <textarea
              required
              className="form-textarea"
              style={{ minHeight: '120px' }}
              placeholder="Hi {{lead_name}}, thank you for reaching out to {{company}}. I am {{staff_name}}..."
              value={templateForm.body}
              onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Tags: {'{{lead_name}}'}, {'{{phone}}'}, {'{{email}}'}, {'{{company}}'}, {'{{staff_name}}'}, {'{{deal_value}}'}
            </span>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SettingsPage;
