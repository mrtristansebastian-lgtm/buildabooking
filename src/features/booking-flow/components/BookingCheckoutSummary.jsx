import { formatServiceDuration, formatServicePrice } from '../../../utils/services';
import { getPaymentOptionDisplay } from '../utils/checkoutUtils';

const SummaryRow = ({ label, value }) => (
  <div className="flex items-start gap-3 rounded-xl border border-black/5 bg-black/[0.02] px-3 py-3">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[10px] font-black text-black shadow-sm shadow-black/5">
      {label.slice(0, 1)}
    </span>
    <span className="min-w-0">
      <span className="block text-[9px] font-black uppercase tracking-[0.24em] text-black/35">{label}</span>
      <span className="mt-0.5 block text-sm font-black leading-tight text-black">{value || 'Not selected'}</span>
    </span>
  </div>
);

export const BookingCheckoutSummary = ({
  activeDate,
  isWaitlistMode,
  selectedPaymentOption,
  selectedService,
  selectedStaff,
  selectedTime,
  settings
}) => {
  const price = formatServicePrice(selectedService || {});
  const duration = formatServiceDuration(selectedService?.duration);
  const payment = selectedPaymentOption ? getPaymentOptionDisplay(selectedPaymentOption) : null;
  const dateText = activeDate ? `${activeDate.dayName}, ${activeDate.month} ${activeDate.dayNum}` : '';
  const timeText = isWaitlistMode ? 'Join waitlist' : selectedTime;

  return (
    <aside className="booking-checkout-summary rounded-2xl border border-black/10 bg-white p-4 md:p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.32em] text-black/35">Cart summary</p>
          <h3 className="mt-1 text-2xl font-black tracking-tight text-black">{selectedService?.name || settings.brandName || 'Booking'}</h3>
          {(duration || price) && (
            <p className="mt-1 text-xs font-bold text-black/45">{[duration, price].filter(Boolean).join(' / ')}</p>
          )}
        </div>
        <span className="rounded-full bg-black px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white">1 item</span>
      </div>
      <div className="grid gap-2">
        <SummaryRow label="Item" value={selectedService?.name || 'Selected booking'} />
        {selectedStaff?.name && <SummaryRow label="Staff" value={selectedStaff.name} />}
        <SummaryRow label="Date" value={dateText} />
        <SummaryRow label="Time" value={timeText} />
        {payment && <SummaryRow label="Payment" value={payment.label} />}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
        <span className="text-[10px] font-black uppercase tracking-[0.28em] text-black/35">Total</span>
        <span className="text-xl font-black tracking-tight text-black">{price || 'Confirmed after review'}</span>
      </div>
    </aside>
  );
};
