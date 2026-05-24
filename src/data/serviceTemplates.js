import { THEME_FILTER_GROUPS } from '../utils/theme';

const service = (id, name, category, description, duration, price, priceType = 'fixed') => ({
  id,
  name,
  category,
  description,
  duration,
  price,
  priceType
});

export const SERVICE_TEMPLATE_GROUPS = {
  hair: {
    title: 'Hair Salon',
    tone: 'Cuts, colour, styling, and treatment menus.',
    templates: [
      service('hair-cut-style', 'Cut & Style', 'Haircuts', 'Consultation, wash, precision cut, and finish.', '60', '450'),
      service('hair-colour', 'Colour Session', 'Colour', 'Colour application with finish. Final timing may depend on hair length.', '120', '950', 'from'),
      service('hair-treatment', 'Repair Treatment', 'Treatments', 'Conditioning treatment for shine, moisture, and strength.', '45', '380'),
      service('hair-bridal', 'Event Styling', 'Styling', 'Polished styling for events, shoots, and special occasions.', '90', '700', 'from')
    ]
  },
  barber: {
    title: 'Barber',
    tone: 'Sharp grooming, quick cuts, and premium detail work.',
    templates: [
      service('barber-cut', 'Signature Cut', 'Haircuts', 'Consultation, cut, styling, and clean finish.', '45', '280'),
      service('barber-beard', 'Beard Shape & Line-up', 'Beard', 'Shape, fade, razor line-up, and finish.', '30', '180'),
      service('barber-combo', 'Cut + Beard Combo', 'Packages', 'Full haircut and beard service in one booking.', '75', '430'),
      service('barber-grooming', 'Premium Grooming Session', 'Packages', 'Cut, beard, wash, and styling for a polished finish.', '90', '620')
    ]
  },
  nails: {
    title: 'Nails',
    tone: 'Sets, fills, art, and clean appointment add-ons.',
    templates: [
      service('nails-gel', 'Gel Manicure', 'Manicure', 'Gel polish prep, application, and tidy finish.', '60', '300'),
      service('nails-acrylic', 'Acrylic Full Set', 'Extensions', 'Full acrylic set with shaping and polish.', '120', '650', 'from'),
      service('nails-fill', 'Fill / Rebalance', 'Maintenance', 'Refresh and rebalance existing acrylic or gel set.', '90', '420'),
      service('nails-art', 'Nail Art Add-on', 'Add-ons', 'Custom art, chrome, gems, or detailed accent work.', '30', '120', 'from')
    ]
  },
  beauty: {
    title: 'Beauty Studio',
    tone: 'Facials, brows, lashes, waxing, and beauty packages.',
    templates: [
      service('beauty-facial', 'Signature Facial', 'Facials', 'Cleanse, treatment mask, massage, and skin finish.', '60', '520'),
      service('beauty-brows', 'Brow Shape & Tint', 'Brows', 'Brow mapping, shaping, tint, and clean finish.', '45', '260'),
      service('beauty-lashes', 'Lash Lift & Tint', 'Lashes', 'Natural lash lift with tint for a lifted finish.', '60', '450'),
      service('beauty-waxing', 'Waxing Appointment', 'Waxing', 'Clean waxing session tailored to selected area.', '30', '220', 'from')
    ]
  },
  wellness: {
    title: 'Wellness',
    tone: 'Calm sessions, restorative care, and appointment packages.',
    templates: [
      service('wellness-consult', 'Wellness Consultation', 'Consultations', 'Goal review, lifestyle notes, and personalised next steps.', '45', '450'),
      service('wellness-session', 'Restorative Session', 'Treatments', 'Guided session designed around balance and recovery.', '60', '650'),
      service('wellness-package', 'Wellness Package', 'Packages', 'Multi-session package for ongoing support.', '60', '1800', 'from')
    ]
  },
  fitness: {
    title: 'Fitness / Training',
    tone: 'Sessions, packages, assessment, and coaching blocks.',
    templates: [
      service('fitness-assessment', 'Fitness Assessment', 'Assessment', 'Movement screen, goals, and programme direction.', '45', '350'),
      service('fitness-pt', 'Personal Training Session', 'Training', 'One-on-one coaching session tailored to the client.', '60', '450'),
      service('fitness-group', 'Small Group Class', 'Classes', 'Small group training with coaching and form support.', '60', '180'),
      service('fitness-package', 'Training Package', 'Packages', 'Block of sessions for consistent progress.', '60', '1800', 'from')
    ]
  },
  'tattoo-piercing': {
    title: 'Tattoo / Piercing',
    tone: 'Consults, hourly tattoo work, flash, and piercing sessions.',
    templates: [
      service('tattoo-consult', 'Tattoo Consultation', 'Consultation', 'Idea review, placement, sizing, and estimate.', '30', '0'),
      service('tattoo-hourly', 'Tattoo Session', 'Tattoo', 'Custom tattoo appointment billed by studio hourly rate.', '120', '850', 'hourly'),
      service('tattoo-flash', 'Flash Piece', 'Tattoo', 'Pre-designed flash tattoo with fixed pricing.', '90', '650', 'from'),
      service('piercing-basic', 'Piercing Appointment', 'Piercing', 'Piercing service with jewellery guidance.', '30', '350', 'from')
    ]
  },
  consulting: {
    title: 'Consulting',
    tone: 'Discovery, strategy, reviews, and implementation sessions.',
    templates: [
      service('consult-discovery', 'Discovery Call', 'Consultation', 'Understand the goal, context, and best next step.', '30', '0'),
      service('consult-strategy', 'Strategy Session', 'Strategy', 'Focused advisory session with clear action items.', '60', '950'),
      service('consult-review', 'Review Session', 'Review', 'Review current progress, gaps, and next priorities.', '45', '650'),
      service('consult-retainer', 'Monthly Advisory', 'Packages', 'Recurring advisory access for ongoing guidance.', '60', '3500', 'from')
    ]
  },
  creative: {
    title: 'Creative Studio',
    tone: 'Shoots, design sessions, content days, and production work.',
    templates: [
      service('creative-consult', 'Creative Consultation', 'Consultation', 'Concept, references, goals, and production plan.', '45', '450'),
      service('creative-shoot', 'Content Shoot', 'Production', 'Shoot session for product, brand, or personal content.', '120', '1800', 'from'),
      service('creative-editing', 'Editing Session', 'Post-production', 'Editing block for selected deliverables.', '60', '650', 'hourly'),
      service('creative-package', 'Brand Content Package', 'Packages', 'Creative direction, shoot time, and edited content bundle.', '180', '4500', 'from')
    ]
  },
  events: {
    title: 'Events',
    tone: 'Consults, planning blocks, venues, and event services.',
    templates: [
      service('events-consult', 'Event Planning Call', 'Consultation', 'Event goals, date, guest count, and planning needs.', '45', '400'),
      service('events-planning', 'Planning Session', 'Planning', 'Focused planning block for vendors, timelines, and details.', '90', '900'),
      service('events-dayof', 'Day-of Coordination', 'Coordination', 'Coordination support for the event day.', '480', '3500', 'from')
    ]
  },
  healthcare: {
    title: 'Healthcare',
    tone: 'Appointments, consultations, checkups, and follow-up care.',
    templates: [
      service('health-consult', 'Initial Consultation', 'Consultation', 'First appointment, assessment, and care plan.', '45', '650'),
      service('health-followup', 'Follow-up Appointment', 'Follow-up', 'Progress review and next steps.', '30', '420'),
      service('health-session', 'Treatment Session', 'Treatment', 'Scheduled treatment or therapy session.', '60', '750', 'from')
    ]
  },
  pets: {
    title: 'Pet Services',
    tone: 'Grooming, training, care sessions, and pet appointments.',
    templates: [
      service('pets-groom', 'Pet Grooming', 'Grooming', 'Wash, groom, trim, and tidy finish.', '90', '550', 'from'),
      service('pets-training', 'Training Session', 'Training', 'One-on-one behavioural or obedience coaching.', '60', '450'),
      service('pets-care', 'Pet Care Visit', 'Care', 'Scheduled visit for feeding, care, or check-ins.', '30', '220')
    ]
  },
  default: {
    title: 'Service Business',
    tone: 'Core services, add-ons, consultations, and packages.',
    templates: [
      service('default-consult', 'Consultation', 'Consultation', 'A focused appointment to understand what the client needs.', '30', '0'),
      service('default-session', 'Standard Session', 'Core Service', 'Your main bookable service for clients.', '60', '500'),
      service('default-package', 'Service Package', 'Packages', 'A bundled offer for clients who need more support.', '90', '1200', 'from'),
      service('default-custom', 'Custom Request', 'Custom', 'A flexible service quoted after reviewing the client request.', '60', '', 'quote')
    ]
  }
};

const INDUSTRY_ALIASES = {
  'hair-salon': 'hair',
  'brows-lashes': 'beauty',
  waxing: 'beauty',
  spa: 'beauty',
  medspa: 'beauty',
  massage: 'wellness',
  'personal-training': 'fitness',
  therapy: 'wellness',
  'physical-therapy': 'healthcare',
  tanning: 'beauty',
  food: 'events',
  trades: 'default',
  'home-services': 'default',
  automotive: 'default',
  education: 'consulting',
  retail: 'default',
  hospitality: 'events',
  property: 'consulting',
  finance: 'consulting',
  legal: 'consulting',
  technology: 'consulting'
};

export const getServiceIndustryOptions = () => {
  const industryGroup = THEME_FILTER_GROUPS.find(group => group.id === 'industry');
  const themeIndustries = industryGroup?.filters?.filter(filter => filter.id !== 'all-industries') || [];
  return themeIndustries.map(filter => ({
    id: filter.id,
    name: filter.name,
    hint: filter.hint || SERVICE_TEMPLATE_GROUPS[INDUSTRY_ALIASES[filter.id] || filter.id]?.tone || 'Tailored service templates'
  }));
};

export const getServiceTemplateGroup = (industryId = '') => {
  const key = INDUSTRY_ALIASES[industryId] || industryId || 'default';
  return SERVICE_TEMPLATE_GROUPS[key] || SERVICE_TEMPLATE_GROUPS.default;
};
