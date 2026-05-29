import {
  BriefcaseBusiness,
  CalendarDays,
  BookOpenCheck,
  DollarSign,
  HeartHandshake,
  IdCard,
  LayoutDashboard,
  MessagesSquare,
  Palette,
  Settings2,
  UsersRound
} from 'lucide-react';

const landingFeatureItems = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    copy: 'See today, requests, earnings, clients, messages, and schedule movement in one calm command view.',
    featureClass: 'is-wide',
    tone: '#ff1744'
  },
  {
    icon: Palette,
    title: 'Editor',
    copy: 'Shape the public booking page with live preview, fonts, colors, copy, logo, banner, FAQs, and service styles.',
    featureClass: 'is-wide',
    tone: '#3f51ff'
  },
  {
    icon: BriefcaseBusiness,
    title: 'Services',
    copy: 'Build a menu with prices, durations, categories, add-ons, packages, status, notes, and staff assignment.',
    tone: '#ff6f00'
  },
  {
    icon: CalendarDays,
    title: 'Schedule',
    copy: 'Control availability by day, week, month, staff member, closed days, and full day detail.',
    tone: '#00a9d6'
  },
  {
    icon: BookOpenCheck,
    title: 'Bookings',
    copy: 'Review upcoming, confirmed, waitlist, history, manual bookings, payment status, and quick actions.',
    tone: '#00c853'
  },
  {
    icon: HeartHandshake,
    title: 'Clients',
    copy: 'Keep client files, notes, chats, booking history, contact details, birthdays, spend, and context together.',
    featureClass: 'is-accent',
    tone: '#ff2bd6'
  },
  {
    icon: MessagesSquare,
    title: 'Support',
    copy: 'Run a booking-linked inbox for unread chats, requests, reschedules, waitlist, and system notes.',
    featureClass: 'is-accent',
    tone: '#9c27ff'
  },
  {
    icon: DollarSign,
    title: 'Finance',
    copy: 'Track revenue, currencies, transactions, paid and pending payments, and gateway history.',
    tone: '#f4c400'
  },
  {
    icon: UsersRound,
    title: 'Teams',
    copy: 'Manage staff profiles, team schedules, booking ownership, working rhythm, and business setup.',
    tone: '#061a40'
  },
  {
    icon: Settings2,
    title: 'Profile',
    copy: 'Update owner access, brand identity, socials, billing, account controls, help, and migration studio.',
    tone: '#4b5563'
  },
  {
    icon: IdCard,
    title: 'Client Portal',
    copy: 'Give clients a focused place to sign in, view bookings, manage updates, and message you.',
    featureClass: 'is-final',
    tone: '#b07a45'
  }
];

export function LandingFeatureBook() {
  return (
    <section className="landing-feature-list-section max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
      <div className="landing-feature-list-head">
        <h2>Everything your booking-based business needs.</h2>
        <p>Meet your new all-in-one business ecosystem.</p>
      </div>

      <div className="native-feature-wave-list native-feature-compact-grid">
        {landingFeatureItems.map(({ icon: Icon, title, copy, featureClass = '', tone }) => (
          <article
            key={title}
            className={`native-feature-card native-feature-compact-card ${featureClass}`}
            style={{ '--feature-icon-color': tone, '--feature-tile-color': tone }}
          >
            <div className="native-feature-card-topline">
              <span className="native-feature-compact-icon" aria-hidden="true">
                <Icon size={22} strokeWidth={2.25} />
              </span>
              <h3>{title}</h3>
            </div>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
