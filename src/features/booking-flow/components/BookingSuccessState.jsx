import { Bell, Check } from 'lucide-react';
import { getFontFamily } from '../../../data/fonts';

export const BookingSuccessState = ({
    activeDate,
    formData,
    headingLetterSpacing,
    inspectClass,
    isPreview,
    isWaitlistMode,
    onInspect,
    onInstallApp,
    previewInspectEnabled,
    previewSuccessMotionClass,
    selectedManualPaymentOption,
    selectedTime,
    setStep,
    settings,
    submittedBooking,
    subtextLetterSpacing
}) => (
    <div className={`h-full flex flex-col items-start justify-center text-left ${previewSuccessMotionClass} p-8 md:p-16 relative z-10`}>
        <div className={`flex items-center gap-8 mb-20 ${inspectClass}`} onClick={() => previewInspectEnabled && onInspect('buttons')}>
            <div className="w-20 h-20 rounded-lg flex items-center justify-center shadow-2xl rotate-12" style={{ backgroundColor: settings.headingColor }}>
                {isWaitlistMode ? <Bell size={32} strokeWidth={3} style={{ color: settings.primaryColor }} /> : <Check size={40} strokeWidth={4} style={{ color: settings.primaryColor }} />}
            </div>
            <div><p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40" style={{ color: settings.bodyColor }}>Booking Status</p><p className="text-lg font-bold uppercase tracking-[0.2em]" style={{ color: settings.headingColor }}>{isWaitlistMode ? 'Standby' : 'Confirmed'}</p></div>
        </div>
        <h2 className={`text-7xl md:text-[8rem] font-bold mb-10 tracking-tighter leading-[0.8] ${inspectClass}`} style={{ color: settings.headingColor, fontFamily: getFontFamily(settings.headingFontFamily || settings.fontFamily), ...(headingLetterSpacing ? { letterSpacing: headingLetterSpacing } : {}) }} onClick={() => previewInspectEnabled && onInspect('introduction')}>
            {isWaitlistMode ? "On The List." : (settings.successHeading || "Confirmed!")}
        </h2>
        <p className="opacity-60 text-xl font-light mb-24 max-w-sm leading-relaxed" style={{ color: settings.bodyColor, ...(subtextLetterSpacing ? { letterSpacing: subtextLetterSpacing } : {}) }}>
            {isWaitlistMode ? `You are on the standby list for ${activeDate.month} ${activeDate.dayNum}. We will text you if a slot opens.` : `Access confirmed for ${selectedTime} on ${activeDate.dayNum} ${activeDate.month}.`}
        </p>
        {selectedManualPaymentOption && (
            <div className="mb-10 w-full max-w-lg rounded-3xl border p-5" style={{ borderColor: `${settings.primaryColor || settings.headingColor || '#000000'}24`, backgroundColor: `${settings.primaryColor || settings.headingColor || '#000000'}08` }}>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.28em]" style={{ color: settings.headingColor }}>Payment reference</p>
                <p className="mt-2 text-2xl font-black tracking-tight" style={{ color: settings.headingColor }}>{submittedBooking?.paymentReference || submittedBooking?.bookingId || 'Use your booking ID'}</p>
                <p className="mt-2 text-sm leading-relaxed opacity-60" style={{ color: settings.bodyColor }}>
                    {selectedManualPaymentOption.id === 'manual_eft'
                        ? 'Use this reference for your EFT so the business can match and mark the booking paid.'
                        : 'The business can mark the booking paid after receiving cash.'}
                </p>
            </div>
        )}
        <div className="mb-12 grid w-full max-w-lg grid-cols-1 gap-3 md:grid-cols-3">
            {[
                ['Saved', 'Your request is in the system.'],
                ['Reviewed', 'The team can confirm or follow up.'],
                ['App', 'Use Build A Booking to manage updates, reschedules, and chat.']
            ].map(([title, copy]) => (
                <div key={title} className="rounded-2xl border p-4" style={{ borderColor: `${settings.headingColor || '#000000'}12`, backgroundColor: `${settings.headingColor || '#000000'}05` }}>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.25em]" style={{ color: settings.headingColor }}>{title}</p>
                    <p className="mt-2 text-xs leading-relaxed opacity-55" style={{ color: settings.bodyColor }}>{copy}</p>
                </div>
            ))}
        </div>
        {(formData.email || onInstallApp) && !isPreview && (
            <div className="mb-8 flex flex-col sm:flex-row gap-3">
                {formData.email && (
                    <button
                        onClick={() => { window.location.href = `${window.location.origin}/#/client`; }}
                        className="appearance-none outline-none focus:outline-none px-7 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] border transition-all hover:-translate-y-0.5"
                        style={{ borderColor: settings.headingColor + '22', color: settings.headingColor, backgroundColor: settings.headingColor + '05' }}
                    >
                        Open Client Portal
                    </button>
                )}
                {onInstallApp && (
                    <button
                        onClick={onInstallApp}
                        className="appearance-none outline-none focus:outline-none px-7 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all hover:-translate-y-0.5"
                        style={{ color: settings.buttonTextColor || '#000000', backgroundColor: settings.primaryColor || settings.headingColor || '#000000' }}
                    >
                        Add Mobile App
                    </button>
                )}
            </div>
        )}
        <button onClick={() => setStep(1)} className="appearance-none outline-none focus:outline-none text-[10px] font-bold uppercase tracking-[0.6em] opacity-40 hover:opacity-100 transition-all border-b pb-4" style={{ color: settings.bodyColor, borderColor: settings.bodyColor + '40' }}>New Request</button>
    </div>
);
