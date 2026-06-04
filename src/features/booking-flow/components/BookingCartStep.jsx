import { BookingCheckoutSummary } from './BookingCheckoutSummary';
import { getActionButtonStyle } from '../utils/bookingFlowUtils';

export const BookingCartStep = ({
  actionButtonStyle,
  activeDate,
  isPreview,
  isWaitlistMode,
  nativeAccentButtonClass,
  onBack,
  onContinue,
  previewStepMotionClass,
  selectedService,
  selectedStaff,
  selectedTime,
  settings
}) => (
  <div className={`booking-cart-step ${previewStepMotionClass} ${isPreview ? 'booking-flow-preview-shell' : 'booking-flow-public-shell'}`}>
    <div className="booking-cart-container">
      <button
        type="button"
        onClick={onBack}
        className="booking-funnel-back"
      >
        <span aria-hidden="true">&lt;</span> Edit selection
      </button>
      <div className="booking-cart-grid grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <section className="booking-cart-hero rounded-3xl border border-black/10 bg-white p-5 md:p-7">
          <span className="booking-cart-badge flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-[11px] font-black uppercase text-white">
            Bag
          </span>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.34em] text-black/35">Your cart</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-black md:text-5xl">Review cart.</h2>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-black/50">
            Check your item before checkout. You can edit the booking if anything looks off.
          </p>
        </section>
        <div className="booking-cart-actions space-y-3">
          <BookingCheckoutSummary
            activeDate={activeDate}
            isWaitlistMode={isWaitlistMode}
            selectedService={selectedService}
            selectedStaff={selectedStaff}
            selectedTime={selectedTime}
            settings={settings}
          />
          <button
            type="button"
            onClick={onContinue}
            className={`booking-funnel-primary ${nativeAccentButtonClass}`}
            style={getActionButtonStyle({ settings, actionButtonStyle })}
          >
            <span>Next: fill in your details</span>
            <span aria-hidden="true">&gt;</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);
