import {
  Briefcase,
  CalendarCheck,
  CreditCard,
  Heart,
  Layout,
  MessageSquare,
  Monitor,
  Palette,
  ShieldCheck,
  User,
  Users
} from 'lucide-react';

export function LandingFeatureBook({ onGuestDashboard }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-32">
      <div className="text-center mb-16 md:mb-24">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tighter mb-6">Everything your booking app needs.</h2>
        <p className="text-neutral-500 font-medium text-lg md:text-xl max-w-2xl mx-auto">
          Each page has one job: make the business easier to run, easier to book, and easier to trust.
        </p>
      </div>

      <div className="native-feature-wave-list grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="native-feature-card md:col-span-2 bg-[#fafafa] rounded-lg p-6 sm:p-8 md:p-14 border border-neutral-200/60 hover:shadow-xl transition-all group relative overflow-hidden">
          <Monitor className="mb-6 text-black relative z-10" size={36} strokeWidth={1.5} />
          <h3 className="text-2xl md:text-4xl font-bold tracking-tight mb-4 text-black relative z-10">Dashboard.</h3>
          <p className="text-neutral-500 font-medium text-lg max-w-md relative z-10">
            Start with today’s bookings, requests, earnings, clients, messages, and schedule movement in one clean command view.
          </p>
        </div>

        <div className="native-feature-card bg-[#fafafa] rounded-lg p-6 sm:p-8 md:p-14 border border-neutral-200/60 hover:shadow-xl transition-all group flex flex-col">
          <Palette className="mb-6 text-black" size={36} strokeWidth={1.5} />
          <h3 className="text-2xl font-bold tracking-tight mb-4 text-black">Editor.</h3>
          <p className="text-neutral-500 font-medium flex-1">
            Tune the public booking page with live preview, fonts, colors, copy, logo, banner, gallery, FAQs, slots, and service display styles.
          </p>
        </div>

        <div className="native-feature-card bg-[#fafafa] rounded-lg p-6 sm:p-8 md:p-14 border border-neutral-200/60 hover:shadow-xl transition-all group">
          <Briefcase className="mb-6 text-black" size={36} strokeWidth={1.5} />
          <h3 className="text-2xl font-bold tracking-tight mb-4 text-black">Services.</h3>
          <p className="text-neutral-500 font-medium">
            Build a bookable menu with prices, durations, categories, images, notes, live or hidden status, add-ons, packages, and staff assignment.
          </p>
        </div>

        <div className="native-feature-card bg-[#fafafa] rounded-lg p-6 sm:p-8 md:p-14 border border-neutral-200/60 hover:shadow-xl transition-all group">
          <CalendarCheck className="mb-6 text-black" size={36} strokeWidth={1.5} />
          <h3 className="text-2xl font-bold tracking-tight mb-4 text-black">Schedule.</h3>
          <p className="text-neutral-500 font-medium">
            Manage day, week, and month availability, open or close days, inspect full day detail, hide past times, and keep staff calendars aligned.
          </p>
        </div>

        <div className="native-feature-card bg-[#fafafa] rounded-lg p-6 sm:p-8 md:p-14 border border-neutral-200/60 hover:shadow-xl transition-all group">
          <ShieldCheck className="mb-6 text-black" size={36} strokeWidth={1.5} />
          <h3 className="text-2xl font-bold tracking-tight mb-4 text-black">Bookings.</h3>
          <p className="text-neutral-500 font-medium">
            Review upcoming, confirmed, waitlist, history, and manual bookings with search, sorting, payment status, client links, and quick actions.
          </p>
        </div>

        <div className="native-feature-card native-feature-hero-card md:col-span-2 bg-[#39FF14] text-black rounded-lg p-6 sm:p-8 md:p-16 relative overflow-hidden group shadow-2xl shadow-[#39FF14]/20">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
            <div className="max-w-xl">
              <Heart className="mb-6 text-black" size={36} strokeWidth={1.5} />
              <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Clients.</h3>
              <p className="text-black/65 font-medium text-lg">
                Keep client files, notes, booking history, chats, contact details, preferences, spend, and follow-up context together.
              </p>
            </div>
          </div>
        </div>

        <div className="native-feature-card bg-[#fafafa] rounded-lg p-6 sm:p-8 md:p-14 border border-neutral-200/60 hover:shadow-xl transition-all group flex flex-col">
          <MessageSquare className="mb-6 text-black" size={36} strokeWidth={1.5} />
          <h3 className="text-2xl font-bold tracking-tight mb-4 text-black">Support.</h3>
          <p className="text-neutral-500 font-medium flex-1">
            Run support chats like a premium inbox with unread, requests, confirmed, waitlist, reschedule tabs, system notes, and booking-linked threads.
          </p>
        </div>

        <div className="native-feature-card bg-[#fafafa] rounded-lg p-6 sm:p-8 md:p-14 border border-neutral-200/60 hover:shadow-xl transition-all group">
          <CreditCard className="mb-6 text-black" size={36} strokeWidth={1.5} />
          <h3 className="text-2xl font-bold tracking-tight mb-4 text-black">Finance.</h3>
          <p className="text-neutral-500 font-medium">
            See earnings over time, switch currencies, filter transactions, and connect cash, EFT, Stripe, Payfast, Yoco, Ozow, and Paystack.
          </p>
        </div>

        <div className="native-feature-card bg-[#fafafa] rounded-lg p-6 sm:p-8 md:p-14 border border-neutral-200/60 hover:shadow-xl transition-all group">
          <Users className="mb-6 text-black" size={36} strokeWidth={1.5} />
          <h3 className="text-2xl font-bold tracking-tight mb-4 text-black">Teams.</h3>
          <p className="text-neutral-500 font-medium">
            Manage staff, team calendars, business details, venue identity, working rhythm, and the operational setup behind the booking page.
          </p>
        </div>

        <div className="native-feature-card bg-[#fafafa] rounded-lg p-6 sm:p-8 md:p-14 border border-neutral-200/60 hover:shadow-xl transition-all group">
          <User className="mb-6 text-black" size={36} strokeWidth={1.5} />
          <h3 className="text-2xl font-bold tracking-tight mb-4 text-black">Profile.</h3>
          <p className="text-neutral-500 font-medium">
            Update owner access, brand identity, socials, billing, help resources, account controls, and the details clients recognize.
          </p>
        </div>

        <div className="native-feature-card bg-[#fafafa] rounded-lg p-6 sm:p-8 md:p-14 border border-neutral-200/60 hover:shadow-xl transition-all group">
          <Layout className="mb-6 text-black" size={36} strokeWidth={1.5} />
          <h3 className="text-2xl font-bold tracking-tight mb-4 text-black">Client Portal.</h3>
          <p className="text-neutral-500 font-medium">
            Give clients a focused place to sign in, view booking details, manage updates, and message the business without friction.
          </p>
        </div>

        <div className="native-feature-card md:col-span-3 bg-[#fafafa] rounded-lg p-6 sm:p-8 md:p-12 border border-neutral-200/60 hover:shadow-xl transition-all flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 text-center md:text-left">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-black shadow-sm shrink-0">
              <Briefcase size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-black mb-1">Guest showroom included</h3>
              <p className="text-neutral-500 font-medium">Explore a full demo business, then sign in to a clean real workspace with no example data leaking through.</p>
            </div>
          </div>
          <button onClick={onGuestDashboard} className="h-14 px-8 rounded-full bg-[#39FF14] text-black font-bold text-sm hover:scale-105 transition-transform shrink-0 w-full md:w-auto shadow-xl shadow-[#39FF14]/20">
            Explore The App
          </button>
        </div>
      </div>
    </section>
  );
}
