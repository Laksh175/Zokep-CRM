import React from 'react';

export const DynamicFieldRenderer = ({ fields = [], values = {}, onChange, disabled = false }) => {
  if (!fields || fields.length === 0) return null;

  const handleFieldChange = (fieldName, val) => {
    onChange({
      ...values,
      [fieldName]: val,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {fields.map((field) => {
        const val = values[field.fieldName] ?? '';

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
              <select
                className="form-select"
                value={val}
                required={field.isRequired}
                disabled={disabled}
                onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
              >
                <option value="">-- Select {field.fieldLabel} --</option>
                {field.options?.map((opt, idx) => (
                  <option key={idx} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
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
