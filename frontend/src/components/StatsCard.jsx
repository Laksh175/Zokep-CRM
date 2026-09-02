import React from 'react';

export const StatsCard = ({ title, value, subtitle, icon: Icon, color = '#6366f1', trend }) => {
  return (
    <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              backgroundColor: `${color}20`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${color}40`,
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '4px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</h2>
        {trend && (
          <span style={{ fontSize: '12px', fontWeight: 600, color: trend.startsWith('+') ? '#10b981' : '#f43f5e' }}>
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{subtitle}</p>}
    </div>
  );
};

export default StatsCard;
