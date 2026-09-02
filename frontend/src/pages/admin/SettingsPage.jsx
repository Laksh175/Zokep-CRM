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
} from 'lucide-react';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('statuses'); // 'statuses' | 'fields' | 'templates' | 'public_form'

  // Data states
  const [statuses, setStatuses] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [statusForm, setStatusForm] = useState({ name: '', color: '#3b82f6', isDefault: false, isConvertedState: false, isLostState: false });

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

  // Template Modal State
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    type: 'whatsapp',
    title: '',
    subject: '',
    body: '',
  });

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

  const publicFormUrl = `${window.location.origin}/f/${user?.tenantId || user?.id}`;
  const iframeEmbedCode = `<iframe src="${publicFormUrl}" width="100%" height="650" frameborder="0" style="border-radius: 12px; border: 1px solid #e2e8f0;"></iframe>`;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    success(`${label} copied to clipboard!`);
  };

  return (
    <div>
      <Header
        title="CRM Customization & Settings"
        subtitle="Configure custom lead stages & colors, dynamic form fields, WhatsApp/Email templates, and public capture forms."
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
                  <ExternalLink size={18} color="var(--primary-500)" />
                  <strong style={{ fontSize: '15px' }}>Direct Link (Share with Clients)</strong>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Send this URL via WhatsApp, SMS, or bio links:
                </p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    readOnly
                    className="form-input"
                    value={publicFormUrl}
                    style={{ background: 'var(--bg-surface)', fontFamily: 'monospace', fontSize: '13px' }}
                  />
                  <button className="btn btn-secondary" onClick={() => copyToClipboard(publicFormUrl, 'Public form link')}>
                    <Copy size={16} /> Copy
                  </button>
                  <a href={publicFormUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
                    <ExternalLink size={16} /> Open
                  </a>
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Code size={18} color="#10b981" />
                  <strong style={{ fontSize: '15px' }}>HTML Embed Code (For Your Website)</strong>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Paste this iframe into your WordPress, Webflow, or custom website:
                </p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <textarea
                    readOnly
                    className="form-textarea"
                    rows={3}
                    value={embedCode}
                    style={{ background: 'var(--bg-surface)', fontFamily: 'monospace', fontSize: '12px' }}
                  />
                  <button className="btn btn-secondary" onClick={() => copyToClipboard(embedCode, 'Embed code')}>
                    <Copy size={16} /> Copy
                  </button>
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
            <button className="btn btn-secondary" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveStatus}>
              {editingStatusId ? 'Update Status' : 'Save Status'}
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
            <button className="btn btn-secondary" onClick={() => setFieldModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveField}>
              {editingFieldId ? 'Update Field' : 'Save Field'}
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
            <select
              className="form-select"
              value={fieldForm.fieldType}
              onChange={(e) => setFieldForm({ ...fieldForm, fieldType: e.target.value })}
            >
              <option value="text">Text Box (Single Line)</option>
              <option value="number">Numeric Number</option>
              <option value="select">Dropdown Select</option>
              <option value="radio">Radio Buttons</option>
              <option value="checkbox">Multiple Checkboxes</option>
              <option value="date">Date Picker</option>
              <option value="textarea">Textarea (Multi-line)</option>
            </select>
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
            <button className="btn btn-secondary" onClick={() => setTemplateModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveTemplate}>
              {editingTemplateId ? 'Update Template' : 'Save Template'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Channel Type *</label>
              <select
                className="form-select"
                value={templateForm.type}
                onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
              >
                <option value="whatsapp">1-Click WhatsApp</option>
                <option value="email">Nodemailer Email</option>
              </select>
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
