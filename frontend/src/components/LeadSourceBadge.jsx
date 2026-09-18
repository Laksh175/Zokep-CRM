import React from 'react';
import { getLeadSourceConfig } from '../utils/leadSources';

export const LeadSourceBadge = ({ source, showEmoji = true, short = false, style = {} }) => {
  const config = getLeadSourceConfig(source);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '11px',
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: '12px',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        whiteSpace: 'nowrap',
        ...style,
      }}
      title={`Acquisition Channel: ${config.label}`}
    >
      {showEmoji && <span style={{ fontSize: '11px', lineHeight: 1 }}>{config.emoji}</span>}
      <span>{short ? config.shortLabel : config.label}</span>
    </span>
  );
};

export default LeadSourceBadge;
