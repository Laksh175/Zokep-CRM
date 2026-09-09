import React from 'react';
import CustomSelect from './CustomSelect';

export const DynamicFieldRenderer = ({ fields = [], values = {}, onChange, disabled = false }) => {
  const safeFields = Array.isArray(fields) ? fields : [];
  const safeValues = values || {};

  if (safeFields.length === 0) return null;

  const handleFieldChange = (fieldName, val) => {
    onChange({
      ...safeValues,
      [fieldName]: val,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {safeFields.map((field) => {
        const val = safeValues[field.fieldName] ?? '';

        return (
          <div key={field._id || field.fieldName} className="form-group" style={{ margin: 0 }}>
            <label className="form-label">
              {field.fieldLabel}
              {field.isRequired && <span style={{ color: '#f43f5e', marginLeft: 4 }}>*</span>}
            </label>

            {/* Field Type: Text */}
            {field.fieldType === 'text' && (
              <input
                type="text"
                className="form-input"
                placeholder={field.placeholder || `Enter ${field.fieldLabel.toLowerCase()}`}
                value={val}
                required={field.isRequired}
                disabled={disabled}
                onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
              />
            )}

            {/* Field Type: Number */}
            {field.fieldType === 'number' && (
              <input
                type="number"
                className="form-input"
                placeholder={field.placeholder || `Enter number`}
                value={val}
                required={field.isRequired}
                disabled={disabled}
                onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
              />
            )}

            {/* Field Type: Date */}
            {field.fieldType === 'date' && (
              <input
                type="date"
                className="form-input"
                value={val ? String(val).split('T')[0] : ''}
                required={field.isRequired}
                disabled={disabled}
                onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
              />
            )}

            {/* Field Type: Textarea */}
            {field.fieldType === 'textarea' && (
              <textarea
                className="form-textarea"
                placeholder={field.placeholder || `Enter details`}
                value={val}
                required={field.isRequired}
                disabled={disabled}
                onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
              />
            )}

            {/* Field Type: Select Dropdown */}
            {field.fieldType === 'select' && (
              <CustomSelect
                value={val}
                disabled={disabled}
                placeholder={`-- Select ${field.fieldLabel} --`}
                onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                options={[
                  { value: '', label: `-- Select ${field.fieldLabel} --` },
                  ...(field.options || []).map((opt) => ({ value: opt, label: opt })),
                ]}
              />
            )}

            {/* Field Type: Radio */}
            {field.fieldType === 'radio' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '4px' }}>
                {field.options?.map((opt, idx) => (
                  <label key={idx} className="form-checkbox-label">
                    <input
                      type="radio"
                      name={field.fieldName}
                      value={opt}
                      checked={val === opt}
                      disabled={disabled}
                      onChange={() => handleFieldChange(field.fieldName, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {/* Field Type: Checkbox */}
            {field.fieldType === 'checkbox' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '4px' }}>
                {field.options?.map((opt, idx) => {
                  const currentArr = Array.isArray(val) ? val : [];
                  const isChecked = currentArr.includes(opt);

                  const toggleCheck = () => {
                    if (isChecked) {
                      handleFieldChange(field.fieldName, currentArr.filter((item) => item !== opt));
                    } else {
                      handleFieldChange(field.fieldName, [...currentArr, opt]);
                    }
                  };

                  return (
                    <label key={idx} className="form-checkbox-label">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={disabled}
                        onChange={toggleCheck}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DynamicFieldRenderer;
