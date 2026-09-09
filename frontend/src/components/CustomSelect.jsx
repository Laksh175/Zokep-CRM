import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  disabled = false,
  showArrow = true,
  className = '',
  style = {},
  title = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Format options normalized with defensive array check
  const safeOptions = Array.isArray(options) ? options : [];
  const normalizedOptions = safeOptions.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value ?? opt._id ?? opt.id ?? '',
        label: opt.label ?? opt.name ?? String(opt.value ?? ''),
        color: opt.color,
      };
    }
    return { value: opt, label: String(opt) };
  });

  const selectedOption = normalizedOptions.find((o) => String(o.value) === String(value));

  const handleSelect = (optValue) => {
    if (disabled) return;
    onChange({ target: { value: optValue } });
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${disabled ? 'disabled' : ''} ${className}`}
      style={{ position: 'relative', width: '100%', ...style }}
      title={title}
    >
      {/* Trigger Button */}
      <button
        type="button"
        className={`form-select custom-select-trigger ${isOpen ? 'focused' : ''}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left',
          width: '100%',
          opacity: disabled ? 0.7 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundImage: 'none',
          padding: showArrow ? '10px 14px' : '6px 12px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: isOpen ? '8px 8px 0 0' : '8px',
          boxShadow: isOpen ? '0 2px 8px rgba(0, 56, 101, 0.08)' : 'none',
          transition: 'all 150ms ease',
        }}
      >
        <span
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {selectedOption?.color && (
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: selectedOption.color,
                flexShrink: 0,
              }}
            />
          )}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {showArrow && (
          <ChevronDown
            size={15}
            color="#003865"
            style={{
              flexShrink: 0,
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              marginLeft: '6px',
            }}
          />
        )}
      </button>

      {/* Floating Attached Dropdown Menu (Style matching Image 2 & ZOKEP theme) */}
      {isOpen && !disabled && (
        <div
          className="custom-select-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-medium)',
            borderTop: 'none',
            borderRadius: '0 0 10px 10px',
            boxShadow: '0 12px 25px -4px rgba(0, 34, 68, 0.16)',
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '4px',
            animation: 'fadeIn 120ms ease-out',
          }}
        >
          {normalizedOptions.length === 0 ? (
            <div style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
              No options available
            </div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={String(opt.value)}
                  className={`custom-select-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 14px',
                    fontSize: '13px',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#003865' : 'var(--text-primary)',
                    backgroundColor: isSelected ? '#f0f6fc' : 'transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 120ms ease',
                    marginBottom: '2px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    {opt.color && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: opt.color,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {opt.label}
                    </span>
                  </span>
                  {isSelected && <Check size={15} color="#00a651" style={{ flexShrink: 0 }} />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
