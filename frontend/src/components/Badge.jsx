import React from 'react';

export const Badge = ({ children, color = '#6366f1', variant = 'soft', size = 'md' }) => {
  // Convert HEX to RGBA for soft background
  const hexToRgba = (hex, alpha) => {
    let c = hex ? hex.replace('#', '') : '6366f1';
    if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const style = {
    backgroundColor: variant === 'soft' ? hexToRgba(color, 0.16) : color,
    color: variant === 'soft' ? color : '#ffffff',
    border: `1px solid ${hexToRgba(color, 0.35)}`,
    padding: size === 'sm' ? '2px 8px' : '4px 10px',
    fontSize: size === 'sm' ? '11px' : '12px',
  };

  return (
    <span className="badge" style={style}>
      <span className="badge-dot" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
};

export default Badge;
