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
    hint: 'Stylists, colour, blowouts',
    tone: 'Real salon menus for cuts, colour, treatments, styling, and maintenance.',
    templates: [
      service('hair-cut-finish', 'Cut, Wash & Finish', 'Cuts', 'Consultation, wash, precision cut, blow-dry, and styling finish.', '60', '450'),
      service('hair-blowout', 'Signature Blowout', 'Styling', 'Wash, smooth blow-dry, volume work, and polished finish.', '45', '320'),
      service('hair-root-touch', 'Root Touch-up', 'Colour', 'Regrowth colour refresh with wash and finish. Best for existing clients.', '90', '650', 'from'),
      service('hair-full-colour', 'Full Colour Session', 'Colour', 'All-over colour service with consultation and finish. Timing depends on length.', '150', '1100', 'from'),
      service('hair-highlights', 'Highlights / Balayage', 'Colour', 'Lightening session with toner and finish for dimensional colour.', '180', '1600', 'from'),
      service('hair-treatment', 'Repair Treatment', 'Treatments', 'Moisture, bond, or scalp treatment for strength, shine, and recovery.', '45', '380'),
      service('hair-event-style', 'Event Styling', 'Styling', 'Formal styling for weddings, shoots, events, and special occasions.', '75', '750', 'from')
    ]
  },
  barber: {
    title: 'Barber',
    hint: 'Cuts, grooming, shaves',
    tone: 'Fast, sharp grooming services with clear maintenance and premium options.',
    templates: [
      service('barber-signature-cut', 'Signature Cut', 'Haircuts', 'Consultation, clipper/scissor cut, styling, and clean finish.', '45', '280'),
      service('barber-skin-fade', 'Skin Fade', 'Haircuts', 'Detailed fade service with blend, line-up, and product finish.', '50', '330'),
      service('barber-beard-shape', 'Beard Shape & Line-up', 'Beard', 'Beard sculpting, razor line-up, and finish.', '30', '180'),
      service('barber-hot-towel', 'Hot Towel Shave', 'Shave', 'Traditional hot towel shave with razor finish and aftercare.', '40', '260'),
      service('barber-combo', 'Cut + Beard Combo', 'Packages', 'Full haircut and beard service booked together.', '75', '430'),
      service('barber-kids-cut', 'Kids Cut', 'Haircuts', 'Simple cut for younger clients with a tidy finish.', '30', '180')
    ]
  },
  nails: {
    title: 'Nails',
    hint: 'Sets, art, pedicures',
    tone: 'Nail services structured around sets, fills, art, removals, and maintenance.',
    templates: [
      service('nails-gel-mani', 'Gel Manicure', 'Manicure', 'Prep, cuticle care, gel polish, and clean finish.', '60', '300'),
      service('nails-gel-pedi', 'Gel Pedicure', 'Pedicure', 'Pedicure prep, gel polish, and foot finish.', '75', '380'),
      service('nails-acrylic-set', 'Acrylic Full Set', 'Extensions', 'Full acrylic set with shaping and polish.', '120', '650', 'from'),
      service('nails-fill', 'Acrylic / Gel Fill', 'Maintenance', 'Refresh, rebalance, and polish for existing sets.', '90', '420'),
      service('nails-art', 'Nail Art Add-on', 'Add-ons', 'Chrome, gems, detailed accents, or custom art.', '30', '120', 'from'),
      service('nails-removal', 'Safe Removal', 'Maintenance', 'Professional removal with tidy nail finish.', '35', '180')
    ]
  },
  'brows-lashes': {
    title: 'Brows & Lashes',
    hint: 'Lifts, tinting, shaping',
    tone: 'Clean appointment choices for brow mapping, tinting, lifts, lashes, and maintenance.',
    templates: [
      service('brows-shape', 'Brow Shape', 'Brows', 'Brow mapping, shaping, trim, and tidy finish.', '30', '180'),
      service('brows-laminate', 'Brow Lamination', 'Brows', 'Brow lamination with shape and finishing care.', '60', '420'),
      service('brows-tint', 'Brow Shape & Tint', 'Brows', 'Brow shaping with tint for fuller definition.', '45', '260'),
      service('lashes-lift', 'Lash Lift & Tint', 'Lashes', 'Natural lash lift with tint and aftercare guidance.', '60', '450'),
      service('lashes-classic', 'Classic Lash Set', 'Lashes', 'Classic lash extension set for natural definition.', '120', '700', 'from'),
      service('lashes-fill', 'Lash Fill', 'Maintenance', 'Fill and refresh existing lash extensions.', '75', '420', 'from')
    ]
  },
  waxing: {
    title: 'Waxing',
    hint: 'Smooth, quick, clean',
    tone: 'Quick, private waxing services with clear body-area choices.',
    templates: [
      service('wax-brow-lip', 'Brow / Lip Wax', 'Face', 'Quick facial waxing service for small areas.', '20', '120', 'from'),
      service('wax-underarm', 'Underarm Wax', 'Body', 'Clean underarm waxing appointment.', '20', '150'),
      service('wax-half-leg', 'Half Leg Wax', 'Body', 'Half-leg wax with tidy finish.', '35', '260'),
      service('wax-full-leg', 'Full Leg Wax', 'Body', 'Full leg wax with tidy finish.', '55', '420'),
      service('wax-bikini', 'Bikini Wax', 'Body', 'Bikini waxing service with private care.', '30', '280', 'from'),
      service('wax-package', 'Waxing Package', 'Packages', 'Bundle multiple waxing areas into one visit.', '75', '650', 'from')
    ]
  },
  beauty: {
    title: 'Beauty Studio',
    hint: 'Salon, makeup, skin',
    tone: 'Beauty menus for facials, brows, lashes, makeup, and glow-up packages.',
    templates: [
      service('beauty-facial', 'Signature Facial', 'Facials', 'Cleanse, treatment mask, massage, and skin finish.', '60', '520'),
      service('beauty-makeup', 'Makeup Application', 'Makeup', 'Professional makeup for events, shoots, or evenings out.', '75', '750', 'from'),
      service('beauty-brows', 'Brow Shape & Tint', 'Brows', 'Mapping, shaping, tinting, and clean finish.', '45', '260'),
      service('beauty-lashes', 'Lash Lift & Tint', 'Lashes', 'Natural lash lift with tint and aftercare.', '60', '450'),
      service('beauty-glow', 'Glow Package', 'Packages', 'Facial, brows, and finishing treatment in one visit.', '120', '950', 'from')
    ]
  },
  spa: {
    title: 'Spa & Sauna',
    hint: 'Quiet, premium, calm',
    tone: 'Calm, premium spa services built around relaxation, rituals, and longer sessions.',
    templates: [
      service('spa-relax-massage', 'Relaxation Massage', 'Massage', 'Gentle massage for calm, circulation, and relaxation.', '60', '650'),
      service('spa-deep-tissue', 'Deep Tissue Massage', 'Massage', 'Focused pressure massage for tension and recovery.', '75', '820'),
      service('spa-body-ritual', 'Body Ritual', 'Treatments', 'Body exfoliation, wrap, and hydration finish.', '90', '1050'),
      service('spa-sauna-session', 'Private Sauna Session', 'Sauna', 'Booked sauna time with setup and refresh.', '45', '320'),
      service('spa-couple', 'Couples Spa Session', 'Packages', 'Shared relaxation session for two clients.', '90', '1800', 'from')
    ]
  },
  medspa: {
    title: 'Medspa',
    hint: 'Clinical, luxe, trust',
    tone: 'Consult-first service templates for advanced skin and aesthetic appointments.',
    templates: [
      service('medspa-consult', 'Skin Consultation', 'Consultation', 'Skin goals, history, and treatment plan discussion.', '30', '350'),
      service('medspa-peel', 'Chemical Peel', 'Skin', 'Professional peel selected for skin type and goals.', '45', '750', 'from'),
      service('medspa-microneedling', 'Microneedling', 'Skin', 'Advanced collagen-stimulating treatment with aftercare.', '75', '1600', 'from'),
      service('medspa-injectables', 'Injectables Consultation', 'Consultation', 'Assessment and treatment planning for injectable services.', '30', '0'),
      service('medspa-followup', 'Treatment Follow-up', 'Follow-up', 'Progress review and post-treatment support.', '20', '0')
    ]
  },
  massage: {
    title: 'Massage',
    hint: 'Restorative, warm, slow',
    tone: 'Massage menus that separate relaxation, recovery, sports work, and focused care.',
    templates: [
      service('massage-relax', 'Relaxation Massage', 'Massage', 'Full-body relaxation massage for stress release.', '60', '600'),
      service('massage-deep', 'Deep Tissue Massage', 'Massage', 'Firm pressure massage for deeper tension.', '75', '760'),
      service('massage-sports', 'Sports Massage', 'Recovery', 'Performance and recovery-focused massage session.', '60', '700'),
      service('massage-focus', 'Focused Area Session', 'Recovery', 'Targeted session for neck, back, shoulders, or legs.', '30', '360'),
      service('massage-couples', 'Couples Massage', 'Packages', 'Shared massage experience for two clients.', '75', '1350', 'from')
    ]
  },
  wellness: {
    title: 'Wellness',
    hint: 'Therapy, yoga, recovery',
    tone: 'Wellness services that support ongoing care, coaching, and guided sessions.',
    templates: [
      service('wellness-intake', 'Wellness Intake', 'Consultation', 'Goal review, lifestyle notes, and personalised next steps.', '45', '450'),
      service('wellness-session', 'Guided Wellness Session', 'Sessions', 'Personal support session designed around balance and recovery.', '60', '650'),
      service('wellness-yoga-private', 'Private Yoga Session', 'Movement', 'One-on-one yoga session tailored to the client.', '60', '520'),
      service('wellness-breathwork', 'Breathwork Session', 'Recovery', 'Guided breathwork for regulation, calm, and reset.', '45', '420'),
      service('wellness-package', 'Wellness Package', 'Packages', 'Multi-session package for consistent support.', '60', '1800', 'from')
    ]
  },
  fitness: {
    title: 'Fitness Studio',
    hint: 'Gyms, classes, sport',
    tone: 'Fitness services for assessments, classes, PT, packages, and performance coaching.',
    templates: [
      service('fitness-assessment', 'Fitness Assessment', 'Assessment', 'Movement screen, goals, and programme direction.', '45', '350'),
      service('fitness-pt', 'Personal Training Session', 'Training', 'One-on-one coaching session tailored to the client.', '60', '450'),
      service('fitness-group', 'Small Group Class', 'Classes', 'Small group training with coaching and form support.', '60', '180'),
      service('fitness-strength', 'Strength Coaching', 'Training', 'Strength-focused training session with technique coaching.', '60', '480'),
      service('fitness-package', 'Training Package', 'Packages', 'Block of sessions for consistent progress.', '60', '1800', 'from')
    ]
  },
  'personal-training': {
    title: 'Personal Training',
    hint: 'Coaches, plans, results',
    tone: 'Coach-led templates for assessments, private training, plans, and accountability.',
    templates: [
      service('pt-consult', 'Goal Consultation', 'Consultation', 'Discuss goals, routine, training history, and plan options.', '30', '0'),
      service('pt-session', '1:1 Coaching Session', 'Training', 'Private coaching session with technique and workout guidance.', '60', '500'),
      service('pt-program', 'Training Programme', 'Programmes', 'Custom training plan review and walkthrough.', '45', '750', 'from'),
      service('pt-checkin', 'Progress Check-in', 'Check-ins', 'Progress review, measurements, and next adjustments.', '30', '250'),
      service('pt-transformation', 'Transformation Package', 'Packages', 'Multi-week coaching package with training and check-ins.', '60', '2800', 'from')
    ]
  },
  therapy: {
    title: 'Therapy Centre',
    hint: 'Care, privacy, trust',
    tone: 'Private, appointment-led services for intake, sessions, and follow-up care.',
    templates: [
      service('therapy-intake', 'Initial Intake Session', 'Consultation', 'First session to understand context, needs, and care direction.', '60', '850'),
      service('therapy-session', 'Therapy Session', 'Sessions', 'Standard private session with the practitioner.', '50', '780'),
      service('therapy-couples', 'Couples Session', 'Sessions', 'Shared session for couples or relationship work.', '75', '1100'),
      service('therapy-followup', 'Follow-up Session', 'Follow-up', 'Progress review and continued care session.', '45', '650'),
      service('therapy-online', 'Online Session', 'Virtual', 'Remote therapy session via secure video link.', '50', '720')
    ]
  },
  'physical-therapy': {
    title: 'Physical Therapy',
    hint: 'Recovery, movement, care',
    tone: 'Recovery-focused appointment templates for assessments, treatment, and rehab plans.',
    templates: [
      service('physio-assessment', 'Initial Assessment', 'Assessment', 'Movement assessment, history, and recovery plan.', '60', '750'),
      service('physio-treatment', 'Treatment Session', 'Treatment', 'Hands-on treatment and guided recovery work.', '45', '620'),
      service('physio-rehab', 'Rehab Programme Review', 'Rehab', 'Exercise review, progression, and technique support.', '45', '520'),
      service('physio-sports', 'Sports Injury Session', 'Sports', 'Focused assessment and treatment for sports-related injuries.', '60', '780'),
      service('physio-followup', 'Follow-up Appointment', 'Follow-up', 'Progress review and next steps.', '30', '420')
    ]
  },
  healthcare: {
    title: 'Health Practice',
    hint: 'Clinic, care, dental',
    tone: 'Clean, trust-building templates for consultations, checkups, and follow-up care.',
    templates: [
      service('health-initial', 'Initial Consultation', 'Consultation', 'First appointment, assessment, and care plan.', '45', '650'),
      service('health-checkup', 'Routine Checkup', 'Checkup', 'General review or routine appointment.', '30', '420'),
      service('health-treatment', 'Treatment Session', 'Treatment', 'Scheduled treatment or therapy session.', '60', '750', 'from'),
      service('health-followup', 'Follow-up Appointment', 'Follow-up', 'Progress review and next steps.', '30', '420'),
      service('health-telehealth', 'Virtual Consultation', 'Virtual', 'Remote consultation for advice and care guidance.', '30', '380')
    ]
  },
  'tattoo-piercing': {
    title: 'Tattoo & Piercing',
    hint: 'Ink, edge, portfolios',
    tone: 'Tattoo and piercing templates built around consults, hourly sessions, flash, and aftercare.',
    templates: [
      service('tattoo-consult', 'Tattoo Consultation', 'Consultation', 'Idea review, placement, sizing, references, and estimate.', '30', '0'),
      service('tattoo-hourly', 'Custom Tattoo Session', 'Tattoo', 'Custom tattoo appointment billed by studio hourly rate.', '120', '850', 'hourly'),
      service('tattoo-flash', 'Flash Piece', 'Tattoo', 'Pre-designed flash tattoo with fixed or from pricing.', '90', '650', 'from'),
      service('tattoo-touchup', 'Touch-up Session', 'Maintenance', 'Touch-up appointment for existing tattoo work.', '45', '0'),
      service('piercing-basic', 'Piercing Appointment', 'Piercing', 'Piercing service with jewellery guidance.', '30', '350', 'from'),
      service('piercing-change', 'Jewellery Change', 'Piercing', 'Professional jewellery change or checkup.', '20', '120', 'from')
    ]
  },
  tanning: {
    title: 'Tanning Studio',
    hint: 'Glow, bronze, sun',
    tone: 'Tanning templates for sprays, sunbeds, prep, and glow packages.',
    templates: [
      service('tan-spray', 'Spray Tan', 'Spray Tan', 'Professional spray tan with shade consultation.', '30', '280'),
      service('tan-express', 'Express Spray Tan', 'Spray Tan', 'Quick-developing spray tan session.', '25', '330'),
      service('tan-sunbed', 'Sunbed Session', 'Sunbed', 'Booked sunbed time slot.', '15', '90'),
      service('tan-prep', 'Prep & Tan Package', 'Packages', 'Exfoliation prep and spray tan booked together.', '60', '520'),
      service('tan-membership', 'Tanning Bundle', 'Packages', 'Multiple tanning sessions purchased as a bundle.', '15', '650', 'from')
    ]
  },
  pets: {
    title: 'Pet Grooming',
    hint: 'Friendly, fresh, care',
    tone: 'Pet services for grooming, training, care visits, and pet wellness appointments.',
    templates: [
      service('pets-full-groom', 'Full Groom', 'Grooming', 'Wash, groom, trim, nails, and tidy finish.', '120', '650', 'from'),
      service('pets-bath', 'Bath & Brush', 'Grooming', 'Wash, brush-out, dry, and fresh finish.', '75', '420', 'from'),
      service('pets-nails', 'Nail Trim', 'Maintenance', 'Quick nail trim appointment.', '15', '100'),
      service('pets-training', 'Training Session', 'Training', 'One-on-one behavioural or obedience coaching.', '60', '450'),
      service('pets-care', 'Pet Care Visit', 'Care', 'Scheduled visit for feeding, care, or check-ins.', '30', '220')
    ]
  },
  consulting: {
    title: 'Consulting',
    hint: 'Coaches, advisors',
    tone: 'Professional service templates for discovery, strategy, reviews, and retainers.',
    templates: [
      service('consult-discovery', 'Discovery Call', 'Consultation', 'Understand the goal, context, and best next step.', '30', '0'),
      service('consult-strategy', 'Strategy Session', 'Strategy', 'Focused advisory session with clear action items.', '60', '950'),
      service('consult-review', 'Review Session', 'Review', 'Review current progress, gaps, and next priorities.', '45', '650'),
      service('consult-workshop', 'Workshop Session', 'Workshop', 'Guided session for a team, project, or specific problem.', '120', '2200', 'from'),
      service('consult-retainer', 'Monthly Advisory', 'Packages', 'Recurring advisory access for ongoing guidance.', '60', '3500', 'from')
    ]
  },
  creative: {
    title: 'Creative Studio',
    hint: 'Studios, artists, photo',
    tone: 'Creative templates for consults, shoots, editing, production, and brand packages.',
    templates: [
      service('creative-consult', 'Creative Consultation', 'Consultation', 'Concept, references, goals, and production plan.', '45', '450'),
      service('creative-shoot', 'Content Shoot', 'Production', 'Shoot session for product, brand, or personal content.', '120', '1800', 'from'),
      service('creative-portrait', 'Portrait Session', 'Photography', 'Portrait shoot with simple direction and selected edits.', '90', '1200', 'from'),
      service('creative-editing', 'Editing Block', 'Post-production', 'Editing block for selected deliverables.', '60', '650', 'hourly'),
      service('creative-package', 'Brand Content Package', 'Packages', 'Creative direction, shoot time, and edited content bundle.', '180', '4500', 'from')
    ]
  },
  events: {
    title: 'Events',
    hint: 'Venues, DJs, planners',
    tone: 'Event templates for planning, venues, coordination, entertainment, and supplier services.',
    templates: [
      service('events-consult', 'Event Planning Call', 'Consultation', 'Event goals, date, guest count, and planning needs.', '45', '400'),
      service('events-planning', 'Planning Session', 'Planning', 'Focused planning block for vendors, timelines, and details.', '90', '900'),
      service('events-venue-tour', 'Venue Viewing', 'Venue', 'Guided venue viewing and availability discussion.', '45', '0'),
      service('events-dayof', 'Day-of Coordination', 'Coordination', 'Coordination support for the event day.', '480', '3500', 'from'),
      service('events-entertainment', 'Entertainment Booking', 'Entertainment', 'Booked performance, DJ, or event entertainment slot.', '180', '2500', 'from')
    ]
  },
  food: {
    title: 'Food & Tastings',
    hint: 'Chefs, cafes, popups',
    tone: 'Food business templates for tastings, private dining, catering, and prep sessions.',
    templates: [
      service('food-tasting', 'Menu Tasting', 'Tasting', 'Tasting session for menu choices and event planning.', '60', '450', 'from'),
      service('food-private-chef', 'Private Chef Booking', 'Private Dining', 'Private chef service for a home or event.', '180', '2500', 'from'),
      service('food-catering-call', 'Catering Consultation', 'Consultation', 'Discuss guest count, menu needs, and event logistics.', '30', '0'),
      service('food-class', 'Cooking Class', 'Classes', 'Guided cooking class for individuals or groups.', '120', '650', 'from'),
      service('food-popup', 'Pop-up Reservation', 'Reservations', 'Reserve a time for a pop-up dining experience.', '90', '350', 'from')
    ]
  },
  trades: {
    title: 'Trades',
    hint: 'Repair, auto, home',
    tone: 'Practical templates for call-outs, assessments, repairs, installations, and quotes.',
    templates: [
      service('trades-callout', 'Call-out Visit', 'Call-out', 'On-site visit to inspect the issue and advise next steps.', '60', '450', 'from'),
      service('trades-quote', 'Quote Appointment', 'Quote', 'Assessment appointment for a detailed quote.', '45', '0'),
      service('trades-repair', 'Repair Booking', 'Repair', 'Scheduled repair work after assessment.', '120', '850', 'from'),
      service('trades-install', 'Installation Booking', 'Installation', 'Installation service booked by job type.', '180', '1500', 'from'),
      service('trades-maintenance', 'Maintenance Visit', 'Maintenance', 'Routine maintenance visit for ongoing upkeep.', '90', '650', 'from')
    ]
  },
  'home-services': {
    title: 'Home Services',
    hint: 'Cleaning, repair, visits',
    tone: 'Home service templates for cleaning, inspections, visits, and recurring jobs.',
    templates: [
      service('home-clean-standard', 'Standard Clean', 'Cleaning', 'General home cleaning based on room count and condition.', '120', '650', 'from'),
      service('home-clean-deep', 'Deep Clean', 'Cleaning', 'Detailed cleaning for move-ins, events, or reset days.', '240', '1600', 'from'),
      service('home-inspection', 'Home Visit / Inspection', 'Visit', 'On-site visit to inspect and confirm service needs.', '45', '0'),
      service('home-garden', 'Garden Service', 'Garden', 'Garden maintenance visit based on property size.', '120', '750', 'from'),
      service('home-recurring', 'Recurring Service Setup', 'Packages', 'Plan a recurring home service schedule.', '30', '0')
    ]
  },
  automotive: {
    title: 'Automotive',
    hint: 'Detailing, repairs, fitment',
    tone: 'Automotive templates for detailing, diagnostics, fitment, repairs, and inspections.',
    templates: [
      service('auto-detail-basic', 'Basic Detail', 'Detailing', 'Exterior wash, interior vacuum, and tidy finish.', '90', '650', 'from'),
      service('auto-detail-full', 'Full Detail', 'Detailing', 'Deep interior and exterior detailing service.', '240', '1800', 'from'),
      service('auto-diagnostic', 'Diagnostic Check', 'Diagnostics', 'Vehicle diagnostic inspection and next-step advice.', '60', '550'),
      service('auto-fitment', 'Fitment Appointment', 'Fitment', 'Scheduled fitting for parts, tyres, or accessories.', '90', '750', 'from'),
      service('auto-repair', 'Repair Booking', 'Repair', 'Scheduled repair appointment after quote approval.', '180', '1200', 'from')
    ]
  },
  education: {
    title: 'Education',
    hint: 'Tutors, classes, workshops',
    tone: 'Learning services for tutoring, classes, workshops, reviews, and study support.',
    templates: [
      service('edu-intake', 'Learning Assessment', 'Assessment', 'Understand level, goals, and learning needs.', '45', '300'),
      service('edu-tutoring', 'Tutoring Session', 'Tutoring', 'One-on-one tutoring session.', '60', '350'),
      service('edu-group-class', 'Group Class', 'Classes', 'Small class session with guided teaching.', '90', '220'),
      service('edu-workshop', 'Workshop', 'Workshops', 'Focused workshop on a topic or skill.', '120', '650', 'from'),
      service('edu-exam-prep', 'Exam Prep Session', 'Exam Prep', 'Targeted support for exams, tests, and revision.', '90', '480')
    ]
  },
  retail: {
    title: 'Retail',
    hint: 'Boutiques, fittings',
    tone: 'Retail templates for fittings, styling, consultations, collections, and personal shopping.',
    templates: [
      service('retail-fitting', 'Private Fitting', 'Fittings', 'Private fitting appointment with style assistance.', '45', '0'),
      service('retail-styling', 'Personal Styling Session', 'Styling', 'Style guidance, outfit planning, and recommendations.', '60', '450'),
      service('retail-consult', 'Product Consultation', 'Consultation', 'Help choosing the right product, size, or package.', '30', '0'),
      service('retail-collection', 'Collection Appointment', 'Pickup', 'Scheduled item collection or handover.', '15', '0'),
      service('retail-custom', 'Custom Order Consult', 'Custom', 'Discuss custom order details, options, and quote.', '45', '0')
    ]
  },
  hospitality: {
    title: 'Hospitality',
    hint: 'Hotels, dining, tours',
    tone: 'Hospitality templates for reservations, tours, experiences, and guest services.',
    templates: [
      service('hospitality-table', 'Table Reservation', 'Reservation', 'Book a table for dining or drinks.', '90', '0'),
      service('hospitality-tour', 'Guided Tour', 'Tours', 'Guided property, venue, or experience tour.', '60', '250', 'from'),
      service('hospitality-experience', 'Guest Experience', 'Experiences', 'Book a hosted guest experience.', '120', '850', 'from'),
      service('hospitality-private', 'Private Dining', 'Private Dining', 'Private dining or room booking request.', '150', '1800', 'from'),
      service('hospitality-concierge', 'Concierge Appointment', 'Guest Services', 'Personal assistance for planning or guest needs.', '30', '0')
    ]
  },
  property: {
    title: 'Property',
    hint: 'Real estate, rentals',
    tone: 'Property service templates for viewings, valuations, inspections, and consultations.',
    templates: [
      service('property-viewing', 'Property Viewing', 'Viewings', 'Guided viewing for a property or rental.', '30', '0'),
      service('property-valuation', 'Valuation Appointment', 'Valuation', 'Property valuation and market discussion.', '45', '0'),
      service('property-consult', 'Buyer / Seller Consultation', 'Consultation', 'Discuss goals, budget, timeline, and next steps.', '45', '0'),
      service('property-inspection', 'Inspection Booking', 'Inspection', 'Scheduled property inspection appointment.', '60', '650', 'from'),
      service('property-photo', 'Property Media Session', 'Media', 'Photo or video shoot for property listing.', '90', '1200', 'from')
    ]
  },
  finance: {
    title: 'Finance',
    hint: 'Bookkeeping, tax, wealth',
    tone: 'Finance templates for consults, reviews, bookkeeping, tax, and planning sessions.',
    templates: [
      service('finance-consult', 'Financial Consultation', 'Consultation', 'Discuss financial needs and the best next step.', '45', '0'),
      service('finance-tax', 'Tax Review', 'Tax', 'Tax document review and filing guidance.', '60', '850', 'from'),
      service('finance-bookkeeping', 'Bookkeeping Session', 'Bookkeeping', 'Bookkeeping review or setup session.', '60', '750', 'from'),
      service('finance-planning', 'Planning Session', 'Planning', 'Budget, cash flow, or financial planning appointment.', '75', '1200'),
      service('finance-business', 'Business Finance Review', 'Business', 'Review business numbers, reports, and priorities.', '90', '1500')
    ]
  },
  legal: {
    title: 'Legal',
    hint: 'Consults, cases, advice',
    tone: 'Legal appointment templates for consultations, document review, and follow-ups.',
    templates: [
      service('legal-consult', 'Legal Consultation', 'Consultation', 'Initial discussion to understand the matter and next steps.', '45', '950'),
      service('legal-document', 'Document Review', 'Documents', 'Review contract, letter, or legal document.', '60', '1300', 'from'),
      service('legal-followup', 'Case Follow-up', 'Follow-up', 'Progress update and next action planning.', '30', '650'),
      service('legal-drafting', 'Drafting Session', 'Documents', 'Prepare or revise a document based on instructions.', '90', '1800', 'from'),
      service('legal-virtual', 'Virtual Legal Call', 'Virtual', 'Remote legal appointment for advice or updates.', '45', '850')
    ]
  },
  technology: {
    title: 'Technology',
    hint: 'IT, SaaS, demos',
    tone: 'Technology services for demos, support, implementation, audits, and consulting.',
    templates: [
      service('tech-discovery', 'Discovery Call', 'Consultation', 'Understand the technical need, system, or project.', '30', '0'),
      service('tech-demo', 'Product Demo', 'Demo', 'Guided product or software demonstration.', '45', '0'),
      service('tech-support', 'Technical Support Session', 'Support', 'Remote or in-person technical support appointment.', '60', '650', 'from'),
      service('tech-implementation', 'Implementation Session', 'Implementation', 'Setup, integration, or system configuration work.', '120', '1600', 'from'),
      service('tech-audit', 'Tech Audit', 'Audit', 'Review setup, workflow, security, or performance.', '90', '1400')
    ]
  },
  default: {
    title: 'Service Business',
    hint: 'Core services, add-ons',
    tone: 'Core service templates for consults, standard sessions, packages, and custom work.',
    templates: [
      service('default-consult', 'Consultation', 'Consultation', 'A focused appointment to understand what the client needs.', '30', '0'),
      service('default-session', 'Standard Session', 'Core Service', 'Your main bookable service for clients.', '60', '500'),
      service('default-package', 'Service Package', 'Packages', 'A bundled offer for clients who need more support.', '90', '1200', 'from'),
      service('default-custom', 'Custom Request', 'Custom', 'A flexible service quoted after reviewing the client request.', '60', '', 'quote')
    ]
  }
};

export const SERVICE_INDUSTRY_OPTIONS = [
  'hair',
  'barber',
  'nails',
  'brows-lashes',
  'waxing',
  'beauty',
  'spa',
  'medspa',
  'massage',
  'wellness',
  'fitness',
  'personal-training',
  'therapy',
  'physical-therapy',
  'healthcare',
  'tattoo-piercing',
  'tanning',
  'pets',
  'consulting',
  'creative',
  'events',
  'food',
  'trades',
  'home-services',
  'automotive',
  'education',
  'retail',
  'hospitality',
  'property',
  'finance',
  'legal',
  'technology'
].map(id => ({
  id,
  name: SERVICE_TEMPLATE_GROUPS[id]?.title || SERVICE_TEMPLATE_GROUPS.default.title,
  hint: SERVICE_TEMPLATE_GROUPS[id]?.hint || SERVICE_TEMPLATE_GROUPS.default.hint
}));

const INDUSTRY_ALIASES = {
  'hair-salon': 'hair',
  'skin-care': 'beauty',
  yoga: 'wellness',
  pilates: 'fitness',
  coaching: 'consulting',
  photography: 'creative',
  'pet-services': 'pets'
};

export const getServiceIndustryOptions = () => SERVICE_INDUSTRY_OPTIONS;

export const resolveServiceIndustryId = (industryId = '') => {
  const key = INDUSTRY_ALIASES[industryId] || industryId || 'hair';
  return SERVICE_TEMPLATE_GROUPS[key] ? key : 'default';
};

export const getServiceTemplateGroup = (industryId = '') => {
  const key = resolveServiceIndustryId(industryId);
  return SERVICE_TEMPLATE_GROUPS[key] || SERVICE_TEMPLATE_GROUPS.default;
};
