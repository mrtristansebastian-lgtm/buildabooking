import { normalizeHexColor } from '../../../utils/theme';

export const getDetectedBrandSwatches = (detectedBrandSignal) => Array.from(new Set([
  detectedBrandSignal?.brandColor,
  detectedBrandSignal?.accentColor,
  detectedBrandSignal?.dominantColor,
  ...(detectedBrandSignal?.colors || [])
].map(color => normalizeHexColor(color, '')).filter(Boolean))).slice(0, 8);

export const buildEditorColourFineTuneGroups = ({ settings, applyColorPatch }) => [
  {
    id: 'base',
    title: 'Base',
    controls: [
      { id: 'background', label: 'Background', note: 'Main booking page surface.', value: settings.backgroundColor, fallback: '#ffffff', onApply: (color) => applyColorPatch({ backgroundColor: color }) },
      { id: 'heading', label: 'Heading text', note: 'Business name and section titles.', value: settings.headingColor, fallback: '#050505', onApply: (color) => applyColorPatch({ headingColor: color }) },
      { id: 'body', label: 'Body text', note: 'Descriptions, labels, and helper copy.', value: settings.bodyColor, fallback: '#666666', onApply: (color) => applyColorPatch({ bodyColor: color }) },
      { id: 'primary', label: 'Brand accent', note: 'Global accent used by selected states.', value: settings.primaryColor, fallback: '#050505', onApply: (color) => applyColorPatch({ primaryColor: color, accentColor: color }) }
    ]
  },
  {
    id: 'action',
    title: 'Action',
    controls: [
      { id: 'button-fill', label: 'Button fill', note: 'Confirm booking button background.', value: settings.buttonColor || settings.primaryColor, fallback: '#050505', onApply: (color) => applyColorPatch({ buttonColor: color, primaryColor: color }) },
      { id: 'button-text', label: 'Button text', note: 'Confirm booking button label.', value: settings.buttonTextColor, fallback: '#ffffff', onApply: (color) => applyColorPatch({ buttonTextColor: color }) }
    ]
  },
  {
    id: 'calendar',
    title: 'Calendar',
    controls: [
      { id: 'date-active-bg', label: 'Active day', note: 'Selected date background.', value: settings.dateActiveBgColor, fallback: settings.primaryColor || '#050505', onApply: (color) => applyColorPatch({ dateActiveBgColor: color }) },
      { id: 'date-active-text', label: 'Active day text', note: 'Selected date label.', value: settings.dateActiveTextColor, fallback: '#ffffff', onApply: (color) => applyColorPatch({ dateActiveTextColor: color }) },
      { id: 'date-bg', label: 'Day tile', note: 'Unselected date background.', value: settings.dateBgColor === 'transparent' ? '' : settings.dateBgColor, fallback: '#f8fafc', onApply: (color) => applyColorPatch({ dateBgColor: color }) },
      { id: 'date-text', label: 'Day tile text', note: 'Unselected date label.', value: settings.dateTextColor, fallback: '#64748b', onApply: (color) => applyColorPatch({ dateTextColor: color }) }
    ]
  },
  {
    id: 'time',
    title: 'Time',
    controls: [
      { id: 'slot-bg', label: 'Slot fill', note: 'Available time background.', value: settings.slotBgColor, fallback: '#f8fafc', onApply: (color) => applyColorPatch({ slotBgColor: color }) },
      { id: 'slot-text', label: 'Slot text', note: 'Available time label.', value: settings.slotTextColor, fallback: '#050505', onApply: (color) => applyColorPatch({ slotTextColor: color }) },
      { id: 'slot-active-bg', label: 'Selected slot', note: 'Chosen time background.', value: settings.slotActiveBgColor, fallback: settings.primaryColor || '#050505', onApply: (color) => applyColorPatch({ slotActiveBgColor: color }) },
      { id: 'slot-active-text', label: 'Selected text', note: 'Chosen time label.', value: settings.slotActiveTextColor, fallback: '#ffffff', onApply: (color) => applyColorPatch({ slotActiveTextColor: color }) }
    ]
  },
  {
    id: 'faq',
    title: 'FAQ',
    controls: [
      { id: 'faq-bg', label: 'FAQ surface', note: 'Question area background.', value: settings.faqBgColor === 'transparent' ? '' : settings.faqBgColor, fallback: '#ffffff', onApply: (color) => applyColorPatch({ faqBgColor: color }) },
      { id: 'faq-border', label: 'FAQ line', note: 'Accordion and card border.', value: settings.faqBorderColor, fallback: '#000000', onApply: (color) => applyColorPatch({ faqBorderColor: color }) },
      { id: 'faq-question', label: 'Question text', note: 'FAQ question copy.', value: settings.faqTextColor || settings.headingColor, fallback: '#050505', onApply: (color) => applyColorPatch({ faqTextColor: color }) },
      { id: 'faq-answer', label: 'Answer text', note: 'FAQ answer copy.', value: settings.faqAnswerColor || settings.bodyColor, fallback: '#666666', onApply: (color) => applyColorPatch({ faqAnswerColor: color }) }
    ]
  },
  {
    id: 'social',
    title: 'Social footer',
    controls: [
      { id: 'social-bg', label: 'Icon fill', note: 'Social icon background.', value: settings.socialIconBgColor === 'transparent' ? '' : settings.socialIconBgColor, fallback: '#ffffff', onApply: (color) => applyColorPatch({ socialIconBgColor: color }) },
      { id: 'social-icon', label: 'Icon mark', note: 'Social icon symbol.', value: settings.socialIconColor || settings.primaryColor, fallback: '#050505', onApply: (color) => applyColorPatch({ socialIconColor: color }) },
      { id: 'social-text', label: 'Icon label', note: 'Social footer text.', value: settings.socialIconTextColor || settings.bodyColor, fallback: '#666666', onApply: (color) => applyColorPatch({ socialIconTextColor: color }) }
    ]
  }
];
