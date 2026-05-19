export const normalizeHandle = (value = '') => (
  value
    .trim()
    .replace(/^https?:\/\/(www\.)?/i, '')
    .replace(/^(instagram\.com|tiktok\.com|facebook\.com|fb\.com)\//i, '')
    .replace(/^@/, '')
    .replace(/\/$/, '')
);

export const normalizeWebsite = (value = '') => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const buildBookingSlug = (businessName = '', instagram = '') => {
  const source = normalizeHandle(instagram) || businessName || 'my-business';
  return source
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 42) || 'my-business';
};

export const prepareOnboardingSettings = (settings, draft, metadata = {}) => {
  const businessName = (draft.businessName || '').trim() || settings.brandName || 'My Business';
  const industry = (draft.industry || '').trim() || 'Private Studio';
  const instagram = normalizeHandle(draft.instagram || '');
  const tiktok = normalizeHandle(draft.tiktok || '');
  const facebook = normalizeHandle(draft.facebook || '');
  const website = normalizeWebsite(draft.website || '');
  const slug = buildBookingSlug(businessName, instagram);

  return {
    ...settings,
    brandName: businessName,
    slug,
    tagline: industry,
    welcomeMessage: `Welcome to ${businessName}. Choose a time that works for you and we will take care of the rest.`,
    socials: {
      ...(settings.socials || {}),
      instagram,
      tiktok,
      facebook,
      website
    },
    onboarding: {
      ...(settings.onboarding || {}),
      version: 2,
      industry,
      completedAt: metadata.completedAt || Date.now(),
      skippedAt: metadata.skippedAt || null
    }
  };
};
