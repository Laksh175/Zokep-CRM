// Lead Source Configurations & Helpers for Zokep CRM

export const LEAD_SOURCE_CONFIG = {
  website: {
    label: 'Website Inquiry',
    shortLabel: 'Website',
    color: '#0284c7', // Sky Blue
    bg: 'rgba(2, 132, 199, 0.12)',
    border: 'rgba(2, 132, 199, 0.3)',
    icon: 'Globe',
    emoji: '🌐',
  },
  google_ads: {
    label: 'Google Ads (PPC)',
    shortLabel: 'Google Ads',
    color: '#ea4335', // Google Red
    bg: 'rgba(234, 67, 53, 0.12)',
    border: 'rgba(234, 67, 53, 0.3)',
    icon: 'Search',
    emoji: '🎯',
  },
  facebook_ads: {
    label: 'Facebook & IG Ads (Meta)',
    shortLabel: 'Meta Ads',
    color: '#1877f2', // Meta Blue
    bg: 'rgba(24, 119, 242, 0.12)',
    border: 'rgba(24, 119, 242, 0.3)',
    icon: 'Megaphone',
    emoji: '📣',
  },
  whatsapp: {
    label: 'WhatsApp Direct',
    shortLabel: 'WhatsApp',
    color: '#25d366', // WhatsApp Green
    bg: 'rgba(37, 211, 102, 0.12)',
    border: 'rgba(37, 211, 102, 0.3)',
    icon: 'MessageSquare',
    emoji: '💬',
  },
  referral: {
    label: 'Referral / Word of Mouth',
    shortLabel: 'Referral',
    color: '#8b5cf6', // Violet
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.3)',
    icon: 'Users',
    emoji: '🤝',
  },
  cold_call: {
    label: 'Cold Calling / Tele-calling',
    shortLabel: 'Cold Call',
    color: '#f59e0b', // Amber
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    icon: 'PhoneCall',
    emoji: '📞',
  },
  social_media: {
    label: 'Organic Social Media',
    shortLabel: 'Social Media',
    color: '#ec4899', // Pink
    bg: 'rgba(236, 72, 153, 0.12)',
    border: 'rgba(236, 72, 153, 0.3)',
    icon: 'Share2',
    emoji: '📱',
  },
  walk_in: {
    label: 'Walk-in / Direct Visit',
    shortLabel: 'Walk-in',
    color: '#10b981', // Emerald Green
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
    icon: 'MapPin',
    emoji: '🏢',
  },
  exhibition: {
    label: 'Exhibition / Trade Fair',
    shortLabel: 'Event / Expo',
    color: '#d97706', // Ochre
    bg: 'rgba(217, 119, 6, 0.12)',
    border: 'rgba(217, 119, 6, 0.3)',
    icon: 'Award',
    emoji: '🎪',
  },
  public_form: {
    label: 'Public Shareable Form',
    shortLabel: 'Public Form',
    color: '#6366f1', // Indigo
    bg: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.3)',
    icon: 'FileText',
    emoji: '📝',
  },
  csv_import: {
    label: 'Bulk CSV Import',
    shortLabel: 'CSV Import',
    color: '#64748b', // Slate
    bg: 'rgba(100, 116, 139, 0.12)',
    border: 'rgba(100, 116, 139, 0.3)',
    icon: 'FileSpreadsheet',
    emoji: '📊',
  },
  staff_added: {
    label: 'Sales Staff Direct Entry',
    shortLabel: 'Staff Entry',
    color: '#0d9488', // Teal
    bg: 'rgba(13, 148, 136, 0.12)',
    border: 'rgba(13, 148, 136, 0.3)',
    icon: 'UserCheck',
    emoji: '👤',
  },
  manual: {
    label: 'Manual Direct Entry',
    shortLabel: 'Manual',
    color: '#003865', // Zokep Deep Navy
    bg: 'rgba(0, 56, 101, 0.1)',
    border: 'rgba(0, 56, 101, 0.25)',
    icon: 'Edit3',
    emoji: '✍️',
  },
  other: {
    label: 'Other Channel',
    shortLabel: 'Other',
    color: '#64748b', // Slate
    bg: 'rgba(100, 116, 139, 0.1)',
    border: 'rgba(100, 116, 139, 0.25)',
    icon: 'HelpCircle',
    emoji: '🏷️',
  },
};

// Dropdown options for CRM Internal Add/Edit Lead forms
export const LEAD_SOURCE_OPTIONS = [
  { value: 'website', label: '🌐 Website Inquiry' },
  { value: 'google_ads', label: '🎯 Google Ads (PPC)' },
  { value: 'facebook_ads', label: '📣 Facebook & IG Ads (Meta)' },
  { value: 'whatsapp', label: '💬 WhatsApp Direct' },
  { value: 'referral', label: '🤝 Referral / Word of Mouth' },
  { value: 'cold_call', label: '📞 Cold Calling / Tele-calling' },
  { value: 'social_media', label: '📱 Organic Social Media' },
  { value: 'walk_in', label: '🏢 Walk-in / Direct Visit' },
  { value: 'exhibition', label: '🎪 Exhibition / Event' },
  { value: 'public_form', label: '📝 Public Lead Form' },
  { value: 'csv_import', label: '📊 Bulk CSV Import' },
  { value: 'staff_added', label: '👤 Sales Staff Entry' },
  { value: 'manual', label: '✍️ Manual Direct Entry' },
  { value: 'other', label: '🏷️ Other Channel' },
];

// Dropdown options for Filter Bars (with "All Sources" at top)
export const LEAD_SOURCE_FILTER_OPTIONS = [
  { value: '', label: 'All Lead Sources' },
  ...LEAD_SOURCE_OPTIONS,
];

// Simplified options for Public Lead Capture Form ("How did you hear about us?")
export const PUBLIC_LEAD_SOURCE_OPTIONS = [
  { value: '', label: '-- Select an option (Optional) --' },
  { value: 'website', label: 'Google Search / Website' },
  { value: 'google_ads', label: 'Google Advertisement' },
  { value: 'facebook_ads', label: 'Instagram / Facebook Ad' },
  { value: 'whatsapp', label: 'WhatsApp Message / Group' },
  { value: 'social_media', label: 'LinkedIn / Social Media' },
  { value: 'referral', label: 'Friend / Colleague Recommendation' },
  { value: 'exhibition', label: 'Event / Exhibition' },
  { value: 'other', label: 'Other' },
];

export const getLeadSourceConfig = (sourceKey) => {
  const normalizedKey = (sourceKey || 'manual').toLowerCase().trim();
  return (
    LEAD_SOURCE_CONFIG[normalizedKey] || {
      label: sourceKey ? sourceKey.charAt(0).toUpperCase() + sourceKey.slice(1).replace(/_/g, ' ') : 'Manual',
      shortLabel: sourceKey ? sourceKey.replace(/_/g, ' ') : 'Manual',
      color: '#64748b',
      bg: 'rgba(100, 116, 139, 0.1)',
      border: 'rgba(100, 116, 139, 0.25)',
      emoji: '🏷️',
    }
  );
};

export const getLeadSourceLabel = (sourceKey, useShort = false) => {
  const config = getLeadSourceConfig(sourceKey);
  return useShort ? config.shortLabel : config.label;
};
