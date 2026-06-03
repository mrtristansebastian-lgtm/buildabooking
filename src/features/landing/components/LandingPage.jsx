import { ArrowRight, Check, Eye, MessageCircle, Sparkles, X } from 'lucide-react';
import { BuildABookingBrand } from '../../../components/BuildABookingBrand';
import { LandingFeatureBook } from '../../../components/LandingFeatureBook';
import { LandingPaymentRail } from '../../../components/LandingPaymentRail';
import { landingGainActions, landingStopActions } from '../../../config/appConfig';

export const LandingPage = ({
  authDialog,
  legalDialog,
  onHome,
  onOwnerSignIn,
  onClientLogin,
  onGuestDashboard,
  onSignupOrDashboard,
  onLegalPanel
}) => (
  <div className="native-ui native-home min-h-screen font-sans selection:bg-black selection:text-white overflow-x-hidden bg-white text-black">
    <nav className="fixed w-full z-50 bg-white/82 backdrop-blur-xl border-b border-neutral-200/50 transition-all native-home-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center cursor-pointer" onClick={onHome}>
          <BuildABookingBrand className="w-[156px] md:w-[188px] h-auto" variant="dark" />
        </div>
        <div className="flex items-center gap-2 md:gap-6">
          <button onClick={onOwnerSignIn} className="block text-[11px] md:text-sm font-semibold text-neutral-500 hover:text-black transition-colors">Sign In</button>
          <button onClick={onClientLogin} className="hidden md:block text-sm font-semibold text-neutral-500 hover:text-black transition-colors">Client Login</button>
          <button onClick={onGuestDashboard} className="hidden sm:block h-10 px-4 rounded-full bg-white border border-neutral-200 text-black font-bold text-[11px] hover:border-black transition-colors">Guest Mode</button>
          <button onClick={onSignupOrDashboard} className="h-10 px-3 md:px-6 rounded-full bg-[#39FF14] text-black font-bold text-[10px] md:text-xs hover:scale-105 transition-transform shadow-lg shadow-[#39FF14]/20">Get Started</button>
        </div>
      </div>
    </nav>

    {authDialog}
    {legalDialog}

    <section className="relative pt-32 md:pt-56 pb-20 md:pb-32 px-4 sm:px-6 flex flex-col items-center text-center border-b border-neutral-100">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-neutral-600">
        <span className="w-5 h-5 rounded-full bg-[#39FF14] text-black flex items-center justify-center"><Sparkles size={13} /></span> The next generation of scheduling
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-[90px] lg:text-[110px] font-bold tracking-tighter leading-[0.95] md:leading-[0.9] max-w-6xl mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
        Schedule like a studio. <br className="hidden md:block" />
        <span className="native-accent-text">Not a spreadsheet.</span>
      </h1>

      <p className="text-lg md:text-2xl font-medium text-neutral-500 max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
        Give clients a booking page that feels premium from the first click, then manage every request, message, client, and open slot from one clean workspace.
      </p>

      <div className="flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 w-full md:w-auto">
        <button onClick={onSignupOrDashboard} className="h-14 px-10 rounded-full bg-[#39FF14] text-black font-bold text-sm hover:scale-105 transition-transform shadow-2xl shadow-[#39FF14]/20 flex items-center gap-2 w-full md:w-auto justify-center">
          Start Building Now <ArrowRight size={16} />
        </button>
        <button onClick={onGuestDashboard} className="h-14 px-10 rounded-full bg-white text-black border border-neutral-200 font-bold text-sm hover:border-black transition-colors flex items-center gap-2 w-full md:w-auto justify-center">
          Browse Dashboard <Eye size={16} />
        </button>
        <button onClick={onClientLogin} className="h-14 px-10 rounded-full bg-white text-black border border-neutral-200 font-bold text-sm hover:border-black transition-colors flex items-center gap-2 w-full md:w-auto justify-center">
          Client Login <MessageCircle size={16} />
        </button>
      </div>
    </section>

    <LandingFeatureBook />

    <section className="landing-stop-section px-4 sm:px-6 py-16 md:py-24 border-b border-neutral-100">
      <div className="landing-stop-panel max-w-7xl mx-auto">
        <div className="landing-benefits-layout">
          <article className="landing-benefits-command">
            <div className="landing-benefits-command-head">
              <div>
                <span>Replace the busywork</span>
                <strong>10<br />problems<br />gone</strong>
              </div>
            </div>
            <div className="landing-benefit-chip-grid" aria-label="Problems Build A Booking helps stop">
              {landingStopActions.map(action => (
                <span key={action} className="landing-benefit-chip">
                  <X size={13} />
                  {action}
                </span>
              ))}
            </div>
          </article>

          <article className="landing-benefits-gain">
            <div className="landing-benefits-gain-head">
              <div>
                <span>Let your software work</span>
                <strong>10<br />wins<br />gained</strong>
              </div>
            </div>
            <div className="landing-gain-chip-grid" aria-label="Benefits Build A Booking gives your business">
              {landingGainActions.map(action => (
                <span key={action} className="landing-gain-chip">
                  <Check size={13} />
                  {action}
                </span>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>

    <section className="py-20 md:py-32 px-4 sm:px-6 text-center border-t border-neutral-200/50 bg-neutral-50/50">
      <div className="flex flex-col items-center max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-7xl font-bold tracking-tighter mb-8 text-black leading-[0.95] md:leading-[0.9]">Ready to upgrade your booking flow?</h2>
        <p className="text-xl text-neutral-500 font-medium mb-10">Build a booking experience that feels clean, premium, easy for you to manage, and effortless for clients to use.</p>
        <button onClick={onSignupOrDashboard} className="h-16 px-12 rounded-full bg-[#39FF14] text-black font-bold text-sm hover:scale-105 transition-transform shadow-2xl shadow-[#39FF14]/20">
          Build Your Booking Flow
        </button>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          <button type="button" onClick={() => onLegalPanel('privacy')} className="hover:text-black transition-colors">Privacy</button>
          <span className="h-1 w-1 rounded-full bg-neutral-300" />
          <button type="button" onClick={() => onLegalPanel('terms')} className="hover:text-black transition-colors">Terms</button>
          <span className="h-1 w-1 rounded-full bg-neutral-300" />
          <button type="button" onClick={() => onLegalPanel('support')} className="hover:text-black transition-colors">Support</button>
        </div>
      </div>
    </section>

    <LandingPaymentRail />
  </div>
);
