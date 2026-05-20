export const EMAIL_TEMPLATE_KEYS = ['confirmed', 'review', 'waitlist', 'runningLate'];

export const createDefaultEmailConfig = () => ({
  serviceId: '',
  publicKey: '',
  universalTemplateId: '',
  testEmail: '',
  templates: {
    confirmed: '',
    review: '',
    waitlist: '',
    runningLate: ''
  }
});

export const getEmailConfig = (communications = {}) => ({
  ...createDefaultEmailConfig(),
  ...(communications.emailProvider || {}),
  templates: {
    ...createDefaultEmailConfig().templates,
    ...(communications.emailProvider?.templates || {})
  }
});

export const getEmailTemplateId = (communications, templateKey) => {
  const config = getEmailConfig(communications);
  return config.templates?.[templateKey] || config.universalTemplateId || '';
};

export const isEmailConfigured = (communications, templateKey = 'confirmed') => {
  const config = getEmailConfig(communications);
  return Boolean(config.serviceId && config.publicKey && getEmailTemplateId(communications, templateKey));
};

const stripHtml = (value = '') => String(value).replace(/<[^>]*>/g, '').trim();

export const buildEmailParams = ({ settings, communications, booking, templateKey, extra = {} }) => {
  const message = communications?.[templateKey]?.text || '';
  const clientName = booking?.clientName || booking?.name || 'Client';
  const clientEmail = booking?.clientEmail || booking?.email || '';
  const businessName = settings?.brandName || 'Build A Booking';
  const bookingDate = booking?.date || extra.date || '';
  const bookingTime = booking?.time || extra.time || '';
  const subjectByType = {
    confirmed: `${businessName} booking confirmed`,
    review: `Thank you for visiting ${businessName}`,
    waitlist: `${businessName} waitlist update`,
    runningLate: `${businessName} schedule update`
  };

  return {
    to_email: clientEmail,
    to_name: clientName,
    client_name: clientName,
    client_phone: booking?.clientPhone || booking?.phone || '',
    business_name: businessName,
    business_address: settings?.address || '',
    business_logo: settings?.logo || '',
    business_banner: settings?.bannerImage || '',
    business_instagram: settings?.socials?.instagram || '',
    business_website: settings?.socials?.website || '',
    booking_date: bookingDate,
    booking_time: bookingTime,
    email_type: templateKey,
    subject: extra.subject || subjectByType[templateKey] || `${businessName} update`,
    message: stripHtml(message),
    running_late_minutes: extra.minutes || '',
    reply_to: extra.replyTo || '',
    ...extra
  };
};

export const sendClientEmail = async ({ communications, settings, booking, templateKey, extra }) => {
  const config = getEmailConfig(communications);
  const templateId = getEmailTemplateId(communications, templateKey);
  const clientEmail = booking?.clientEmail || booking?.email;

  if (booking?.notificationChannels?.email === false) {
    return { ok: false, skipped: true, reason: 'Client email updates are off for this booking' };
  }

  if (!clientEmail) {
    return { ok: false, skipped: true, reason: 'Missing client email' };
  }

  if (!config.serviceId || !config.publicKey || !templateId) {
    return { ok: false, skipped: true, reason: 'Email delivery is not connected yet' };
  }

  const params = buildEmailParams({ settings, communications, booking, templateKey, extra });
  const { default: emailjs } = await import('@emailjs/browser');
  await emailjs.send(config.serviceId, templateId, params, { publicKey: config.publicKey });
  return { ok: true };
};
