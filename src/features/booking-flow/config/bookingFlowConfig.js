export const bookingStyleDirections = ['native-precision', 'command-flow'];

export const previewTimeSlots = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'];

export const previewServiceSamples = [
  {
    id: 'preview-service-primary',
    name: 'Service name',
    category: 'Category',
    description: 'Short service description appears here.',
    duration: '60',
    price: '',
    active: true,
    imageUrls: [],
    isPreviewPlaceholder: true
  },
  {
    id: 'preview-service-secondary',
    name: 'Second service',
    category: 'Category',
    description: 'Use this empty state to tune service layout.',
    duration: '30',
    price: '',
    active: true,
    imageUrls: [],
    isPreviewPlaceholder: true
  }
];

export const previewFaqItems = [
  {
    q: 'Question title',
    a: 'Helpful answer text appears here so FAQ styling can be tuned before real questions are added.',
    isPreviewPlaceholder: true
  },
  {
    q: 'Booking policy',
    a: 'Add the real policy later.',
    isPreviewPlaceholder: true
  },
  {
    q: 'Before you arrive',
    a: 'Add preparation notes later.',
    isPreviewPlaceholder: true
  }
];

export const createPreviewSocialLinks = ({ Instagram, Globe }) => [
  { key: 'preview-instagram', label: 'Instagram', href: '#', icon: Instagram, isPreviewPlaceholder: true },
  { key: 'preview-tiktok', label: 'TikTok', href: '#', icon: Globe, isPreviewPlaceholder: true },
  { key: 'preview-website', label: 'Website', href: '#', icon: Globe, isPreviewPlaceholder: true }
];
