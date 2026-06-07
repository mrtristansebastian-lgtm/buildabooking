import { getFontFamily } from '../../../data/fonts';
import { withColorAlpha } from '../../../utils/theme';

const alignments = ['left', 'center', 'right'];
const visualStyles = ['minimal', 'outline', 'solid'];
const displayLooks = {
  calendar: ['studio', 'classic', 'editorial', 'compact', 'glow'],
  time: ['pill', 'blocks', 'minimal', 'luxury', 'compact'],
  faq: ['accordion', 'cards', 'minimal', 'numbered', 'split'],
  venue: ['mosaic', 'editorial', 'filmstrip', 'postcard', 'minimal'],
  maps: ['button', 'card', 'footer', 'dock', 'none'],
  social: ['icons', 'labels', 'dock', 'minimal', 'solid']
};

export const clampNumber = (value, min, max, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

export const getOptionalLetterSpacing = (value, min, max) => {
  if (value === '' || value === null || value === undefined) return undefined;
  return `${clampNumber(value, min, max, 0)}px`;
};

export const getAlign = (value) => alignments.includes(value) ? value : 'left';

export const getVisualStyle = (value, fallback = 'minimal') => (
  visualStyles.includes(value) ? value : fallback
);

export const getDisplayLook = (group, value, fallback) => (
  displayLooks[group]?.includes(value) ? value : fallback
);

export const getBlockMargins = (align) => ({
  marginLeft: align === 'left' ? 0 : 'auto',
  marginRight: align === 'right' ? 0 : 'auto'
});

export const normalizeHandle = (value = '') => (
  value.trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')
);

export const normalizeWebsite = (value = '') => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const getDateSlotStyle = ({ isActive, settings, dateStyle }) => {
  const radius = settings.buttonStyle === 'pill' ? '32px' : '12px';
  const activeColor = settings.primaryColor || '#000000';
  const baseTextColor = settings.dateTextColor || '#666666';
  const activeTextColor = settings.dateActiveTextColor || activeColor;
  const activeBg = settings.dateActiveBgColor && settings.dateActiveBgColor !== 'transparent' ? settings.dateActiveBgColor : withColorAlpha(activeColor, 10, '#000000');
  const baseBg = settings.dateBgColor && settings.dateBgColor !== 'transparent' ? settings.dateBgColor : 'transparent';
  const fontFamily = getFontFamily(settings.dateFontFamily || settings.fontFamily);
  const activeShadow = settings.calendarShadow === false
    ? 'none'
    : settings.calendarGlow
      ? `0 0 0 2px ${withColorAlpha(activeColor, 34, '#000000')}, 0 18px 44px -18px ${activeColor}`
      : `0 16px 34px -22px ${activeColor}`;

  if (dateStyle === 'solid') {
    return {
      backgroundColor: isActive ? activeBg : (baseBg === 'transparent' ? `${settings.headingColor || '#000000'}08` : baseBg),
      color: isActive ? activeTextColor : baseTextColor,
      borderRadius: radius,
      border: '1px solid transparent',
      boxShadow: isActive ? activeShadow : 'none',
      fontFamily
    };
  }
  if (dateStyle === 'outline') {
    return {
      backgroundColor: isActive ? withColorAlpha(activeColor, 5, '#000000') : 'transparent',
      color: isActive ? activeColor : baseTextColor,
      borderRadius: radius,
      border: `1px solid ${isActive ? activeColor : withColorAlpha(baseTextColor, 14, '#666666')}`,
      boxShadow: isActive ? activeShadow : 'none',
      fontFamily
    };
  }
  return {
    backgroundColor: 'transparent',
    color: isActive ? activeColor : baseTextColor,
    borderRadius: '0px',
    border: '1px solid transparent',
    fontFamily
  };
};

export const getTimeSlotStyle = ({ isActive, settings, timeSlotStyle }) => {
  const isSolid = timeSlotStyle === 'solid';
  const isOutline = timeSlotStyle === 'outline';
  const radius = settings.buttonStyle === 'pill' ? '9999px' : '12px';
  const activeColor = settings.primaryColor;
  const baseTextColor = settings.slotTextColor || '#000000';
  const fontF = getFontFamily(settings.slotFontFamily || settings.fontFamily);
  const activeBg = settings.slotActiveBgColor || activeColor;
  const activeText = settings.slotActiveTextColor || '#000000';
  const activeShadow = settings.timeSlotShadow === false
    ? 'none'
    : settings.timeSlotGlow
      ? `0 0 0 2px ${withColorAlpha(activeColor, 34, '#000000')}, 0 14px 38px -18px ${activeColor}`
      : `0 14px 34px -24px ${withColorAlpha(activeColor, 45, '#000000')}`;

  if (isSolid) {
    return {
      backgroundColor: isActive ? activeBg : (settings.slotBgColor && settings.slotBgColor !== 'transparent' ? settings.slotBgColor : '#ffffff'),
      color: isActive ? activeText : baseTextColor,
      borderRadius: radius,
      border: `1px solid ${isActive ? withColorAlpha(activeBg, 28, '#000000') : withColorAlpha(baseTextColor, 9, '#000000')}`,
      boxShadow: isActive ? activeShadow : '0 6px 16px -16px rgba(15, 23, 42, 0.24)',
      fontFamily: fontF
    };
  }
  if (isOutline) {
    return {
      backgroundColor: isActive ? withColorAlpha(activeBg, 10, '#000000') : '#ffffff',
      color: isActive ? activeColor : baseTextColor,
      borderRadius: radius,
      border: `1px solid ${isActive ? activeColor : withColorAlpha(baseTextColor, 9, '#000000')}`,
      boxShadow: isActive ? activeShadow : '0 6px 16px -16px rgba(15, 23, 42, 0.24)',
      fontFamily: fontF
    };
  }
  return { backgroundColor: 'transparent', color: isActive ? activeColor : baseTextColor, border: '1px solid transparent', borderRadius: '0px', fontFamily: fontF };
};

export const getActionButtonStyle = ({ settings, actionButtonStyle }) => {
  const radius = settings.buttonStyle === 'pill' ? '9999px' : '8px';
  const accent = settings.buttonColor || settings.primaryColor || '#000000';
  const textColor = settings.buttonTextColor || '#000000';
  const fontFamily = getFontFamily(settings.buttonFontFamily || settings.fontFamily);
  if (actionButtonStyle === 'outline') {
    return { backgroundColor: 'transparent', color: accent, border: `1px solid ${accent}`, borderRadius: radius, fontFamily };
  }
  if (actionButtonStyle === 'minimal') {
    return { backgroundColor: 'transparent', color: settings.headingColor || accent, border: '1px solid transparent', borderBottom: `2px solid ${accent}`, borderRadius: '0px', boxShadow: 'none', fontFamily };
  }
  return { backgroundColor: accent, color: textColor, border: '1px solid transparent', borderRadius: radius, fontFamily };
};

export const getFaqItemStyle = ({ settings, faqStyle }) => {
  const bg = settings.faqBgColor || 'transparent';
  const borderColor = settings.faqBorderColor || `${settings.headingColor || '#000000'}18`;
  if (faqStyle === 'solid') return { backgroundColor: bg === 'transparent' ? `${settings.headingColor || '#000000'}08` : bg, border: '1px solid transparent', borderRadius: '16px', padding: '18px' };
  if (faqStyle === 'outline') return { backgroundColor: 'transparent', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '18px' };
  return { backgroundColor: 'transparent', borderBottom: `1px solid ${borderColor}`, borderRadius: '0px', paddingBottom: '16px' };
};

export const getSocialLinkStyle = ({ settings, socialIconStyle }) => {
  const accent = settings.socialIconColor || settings.primaryColor || settings.headingColor || '#000000';
  const bg = settings.socialIconBgColor || 'transparent';
  if (socialIconStyle === 'solid') return { backgroundColor: bg === 'transparent' ? accent : bg, color: settings.socialIconTextColor || settings.buttonTextColor || '#000000', border: '1px solid transparent' };
  if (socialIconStyle === 'outline') return { backgroundColor: 'transparent', color: accent, border: `1px solid ${accent}55` };
  return { backgroundColor: 'transparent', color: accent, border: '1px solid transparent' };
};

export const getServiceCardStyle = ({ isActive, settings, nativeAccent, serviceBorderStyle }) => {
  const accent = settings.primaryColor || '#000000';
  const heading = settings.headingColor || '#000000';
  const inactiveBg = settings.serviceBgColor && settings.serviceBgColor !== 'transparent'
    ? settings.serviceBgColor
    : withColorAlpha(heading, 2, '#000000');
  const inactiveBorder = settings.serviceBorderColor || withColorAlpha(heading, 9, '#000000');
  const activeBg = settings.serviceActiveBgColor || (nativeAccent ? (settings.serviceBgColor || settings.slotBgColor || '#FFFFFF') : withColorAlpha(accent, 7, '#000000'));
  const activeBorder = settings.serviceActiveBorderColor || settings.serviceBorderColor || (nativeAccent ? accent : withColorAlpha(accent, 80, '#000000'));
  if (serviceBorderStyle === 'minimal') {
    return {
      borderColor: isActive ? activeBorder : 'transparent',
      backgroundColor: isActive ? activeBg : 'transparent',
      borderBottomColor: isActive ? activeBorder : inactiveBorder
    };
  }
  if (serviceBorderStyle === 'outline') {
    return {
      borderColor: isActive ? activeBorder : inactiveBorder,
      backgroundColor: isActive ? activeBg : 'transparent'
    };
  }
  return {
    borderColor: isActive ? activeBorder : inactiveBorder,
    backgroundColor: isActive ? activeBg : inactiveBg
  };
};
