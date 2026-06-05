import { formatServiceDuration, formatServicePrice } from '../../../utils/services';
import { getPaymentOptionDisplay } from '../utils/checkoutUtils';

const SummaryRow = ({ label, value, settings }) => (
  <div className="flex items-start gap-3 rounded-xl border px-3 py-3" style={{ backgroundColor: `${settings.headingColor || '#000000'}05`, borderColor: settings.pageBorderColor || `${settings.headingColor || '#000000'}0D` }}>
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-black shadow-sm shadow-black/5" style={{ backgroundColor: settings.pageSurfaceColor || '#ffffff', color: settings.headingColor }}>
      {label.slice(0, 1)}
    </span>
    <span className="min-w-0">
      <span className="block text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: `${settings.bodyColor || '#666666'}80` }}>{label}</span>
      <span className="mt-0.5 block text-sm font-black leading-tight" style={{ color: settings.headingColor }}>{value || 'Not selected'}</span>
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
    <aside className="booking-checkout-summary rounded-2xl border p-4 md:p-5" style={{ backgroundColor: settings.pageSurfaceColor || '#ffffff', borderColor: settings.pageBorderColor || '#0000001A' }}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.32em]" style={{ color: `${settings.bodyColor || '#666666'}80` }}>Cart summary</p>
          <h3 className="mt-1 text-2xl font-black tracking-tight" style={{ color: settings.headingColor }}>{selectedService?.name || settings.brandName || 'Booking'}</h3>
          {(duration || price) && (
            <p className="mt-1 text-xs font-bold" style={{ color: settings.bodyColor }}>{[duration, price].filter(Boolean).join(' / ')}</p>
          )}
        </div>
        <span className="rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-widest" style={{ backgroundColor: settings.primaryColor || settings.headingColor, color: settings.buttonTextColor || '#ffffff' }}>1 item</span>
      </div>
      <div className="grid gap-2">
        <SummaryRow label="Item" value={selectedService?.name || 'Selected booking'} settings={settings} />
        {selectedStaff?.name && <SummaryRow label="Staff" value={selectedStaff.name} settings={settings} />}
        <SummaryRow label="Date" value={dateText} settings={settings} />
        <SummaryRow label="Time" value={timeText} settings={settings} />
        {payment && <SummaryRow label="Payment" value={payment.label} settings={settings} />}
      </div>
      <div className="mt-4 flex items-center justify-between border-t pt-4" style={{ borderColor: settings.pageBorderColor || '#0000001A' }}>
        <span className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: `${settings.bodyColor || '#666666'}80` }}>Total</span>
        <span className="text-xl font-black tracking-tight" style={{ color: settings.headingColor }}>{price || 'Confirmed after review'}</span>
      </div>
    </aside>
  );
};
