import React, { useState, useEffect } from 'react';
import { Clock, Calendar, FileText, CheckCircle2, AlertCircle, Edit3 } from 'lucide-react';
import Modal from './Modal';
import CustomSelect from './CustomSelect';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { toDateTimeLocalInput } from '../utils/date';

export const EditFollowupModal = ({
  isOpen,
  onClose,
  lead,
  activity = null,
  statuses = [],
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [note, setNote] = useState('');
  const [nextFollowupDate, setNextFollowupDate] = useState('');
  const [statusId, setStatusId] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen && lead) {
      setErrorMessage('');
      // If editing a specific activity, use activity's note and date
      if (activity) {
        setNote(activity.note || '');
        setNextFollowupDate(
          activity.nextFollowupDate
            ? toDateTimeLocalInput(activity.nextFollowupDate)
            : lead.nextFollowupDate
            ? toDateTimeLocalInput(lead.nextFollowupDate)
            : ''
        );
      } else {
        // Otherwise use lead's current followup note and nextFollowupDate
        setNote(lead.lastFollowupNote || '');
        setNextFollowupDate(
          lead.nextFollowupDate ? toDateTimeLocalInput(lead.nextFollowupDate) : ''
        );
      }

      const currentStatus =
        lead.statusId?._id ||
        lead.statusId?.id ||
        (typeof lead.statusId === 'string' ? lead.statusId : '');
      setStatusId(currentStatus);
    }
  }, [isOpen, lead, activity]);

  if (!lead) return null;

  // Preset date shortcut helpers
  const handleSetPresetDate = (daysFromNow, hour = 11, minute = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, minute, 0, 0);
    setNextFollowupDate(toDateTimeLocalInput(d.toISOString()));
  };

  const handleClearDate = () => {
    setNextFollowupDate('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lead) return;

    try {
      setSaving(true);
      setErrorMessage('');

      const parsedFollowupDate = nextFollowupDate
        ? new Date(nextFollowupDate).toISOString()
        : null;

      let res;
      if (activity?._id) {
        // Update specific activity log entry
        res = await api.put(`/leads/${lead._id}/activities/${activity._id}`, {
          note: note.trim(),
          nextFollowupDate: parsedFollowupDate,
        });
      } else {
        // Update lead's follow-up note and next followup date
        res = await api.put(`/leads/${lead._id}/followup`, {
          note: note.trim(),
          nextFollowupDate: parsedFollowupDate,
          statusId: statusId || undefined,
        });
      }

      if (res.success) {
        success('Follow-up updated successfully!');
        if (onSuccess) {
          const updatedLead = res.data?.lead || res.data;
          const updatedActivity = res.data?.activity || null;
          onSuccess(updatedLead, updatedActivity);
        }
        onClose();
      } else {
        setErrorMessage(res.message || 'Failed to update follow-up');
      }
    } catch (err) {
      const msg = err.message || 'Failed to update follow-up';
      setErrorMessage(msg);
      error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? 'Edit Activity Note' : 'Edit Follow-up'}
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Lead Info Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            backgroundColor: 'rgba(0, 56, 101, 0.05)',
            border: '1px solid rgba(0, 56, 101, 0.12)',
            borderRadius: '8px',
          }}
        >
          <div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {lead.name}
            </span>
            {lead.company && (
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                ({lead.company})
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              color: 'var(--primary-600)',
              backgroundColor: 'rgba(0, 56, 101, 0.08)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 600,
            }}
          >
            {lead.phone}
          </span>
        </div>

        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '6px',
              fontSize: '13px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Follow-up Note Textarea */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Follow-up Note / Remark</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {activity ? 'Update timeline note' : 'Updates latest follow-up note'}
            </span>
          </label>
          <textarea
            className="form-textarea"
            style={{ minHeight: '95px', fontSize: '13px', lineHeight: '1.4' }}
            placeholder="e.g. Message him regarding documents, client requested quotation..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
          />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Tip: Correcting a mistake here updates the note directly without cluttering the timeline with duplicate entries.
          </span>
        </div>

        {/* Next Follow-up Date & Time */}
        <div>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="var(--primary-600)" />
            <span>Next Follow-up (Date & Time)</span>
          </label>
          <input
            type="datetime-local"
            className="form-input"
            value={nextFollowupDate}
            onChange={(e) => setNextFollowupDate(e.target.value)}
          />

          {/* Quick preset chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => handleSetPresetDate(0, 17, 0)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 8px', fontSize: '11px', height: 'auto' }}
            >
              Today 5 PM
            </button>
            <button
              type="button"
              onClick={() => handleSetPresetDate(1, 10, 0)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 8px', fontSize: '11px', height: 'auto' }}
            >
              Tomorrow 10 AM
            </button>
            <button
              type="button"
              onClick={() => handleSetPresetDate(2, 11, 0)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 8px', fontSize: '11px', height: 'auto' }}
            >
              In 2 Days
            </button>
            <button
              type="button"
              onClick={() => handleSetPresetDate(7, 11, 0)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 8px', fontSize: '11px', height: 'auto' }}
            >
              In 1 Week
            </button>
            {nextFollowupDate && (
              <button
                type="button"
                onClick={handleClearDate}
                className="btn btn-secondary btn-sm"
                style={{ padding: '3px 8px', fontSize: '11px', height: 'auto', color: '#ef4444' }}
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        {/* Status Stage dropdown (if statuses provided and not editing sub-activity) */}
        {!activity && statuses && statuses.length > 0 && (
          <div>
            <label className="form-label">Status Stage</label>
            <CustomSelect
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
              options={statuses.map((st) => ({
                value: st._id,
                label: st.name,
                color: st.color,
              }))}
            />
          </div>
        )}

        {/* Modal Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '8px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: '130px', justifyContent: 'center' }}
          >
            {saving ? (
              <>
                <span className="btn-spinner" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Edit3 size={14} />
                <span>Update Follow-up</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditFollowupModal;
