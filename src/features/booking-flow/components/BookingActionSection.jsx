import { ArrowRight, Banknote, Bell, Check, Flame, Landmark, Mail, ReceiptText } from 'lucide-react';
import { getActionButtonStyle } from '../utils/bookingFlowUtils';

export const BookingActionSection = ({
    actionButtonStyle,
    canSubmitBooking,
    emailOptInEnabled,
    formData,
    handleAction,
    inspectClass,
    isPreview,
    isSubmitting,
    isWaitlistMode,
    manualPaymentOptions,
    nativeAccentBorderClass,
    nativeAccentButtonClass,
    nativeAccentFillClass,
    onInstallApp,
    selectedManualPayment,
    selectedManualPaymentOption,
    setFormData,
    setSelectedManualPayment,
    settings,
    submitError
}) => (
    <>
        {emailOptInEnabled && (
            <label
                className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${inspectClass}`}
                style={{
                    borderColor: `${settings.headingColor || '#000000'}18`,
                    backgroundColor: `${settings.headingColor || '#000000'}08`
                }}
            >
                <input
                    type="checkbox"
                    checked={Boolean(formData.emailOptIn)}
                    onChange={(event) => setFormData({ ...formData, emailOptIn: event.target.checked })}
                    className="sr-only"
                />
                <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all ${formData.emailOptIn ? nativeAccentFillClass : ''}`}
                    style={{
                        backgroundColor: formData.emailOptIn ? (settings.primaryColor || '#39FF14') : 'transparent',
                        borderColor: formData.emailOptIn ? (settings.primaryColor || '#39FF14') : `${settings.headingColor || '#000000'}35`,
                        color: settings.buttonTextColor || '#000000'
                    }}
                >
                    {formData.emailOptIn && <Check size={14} strokeWidth={4} />}
                </span>
                <span className="min-w-0">
                    <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.25em]" style={{ color: settings.headingColor }}>
                        <Mail size={13} /> Email updates
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed opacity-60" style={{ color: settings.bodyColor }}>
                        Send booking confirmations, schedule changes, and helpful updates to the email entered above.
                    </span>
                </span>
            </label>
        )}
        {manualPaymentOptions.length > 0 && (
            <div
                className="mb-5 rounded-2xl border px-4 py-4 text-left"
                style={{
                    borderColor: `${settings.headingColor || '#000000'}14`,
                    backgroundColor: `${settings.headingColor || '#000000'}05`
                }}
            >
                <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.25em]" style={{ color: settings.headingColor }}>
                        <ReceiptText size={14} /> Payment option
                    </span>
                    <button
                        type="button"
                        onClick={() => setSelectedManualPayment('')}
                        className="text-[9px] font-bold uppercase tracking-widest opacity-45 hover:opacity-100"
                        style={{ color: settings.headingColor }}
                    >
                        Pay later
                    </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                    {manualPaymentOptions.map((option) => {
                        const isSelected = selectedManualPayment === option.id;
                        const Icon = option.id === 'cash' ? Banknote : Landmark;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setSelectedManualPayment(isSelected ? '' : option.id)}
                                className={`rounded-xl border p-3 text-left transition-all ${isSelected ? nativeAccentBorderClass : ''}`}
                                style={{
                                    borderColor: isSelected ? (settings.primaryColor || settings.headingColor || '#000000') : `${settings.headingColor || '#000000'}16`,
                                    backgroundColor: isSelected ? `${settings.primaryColor || settings.headingColor || '#000000'}12` : `${settings.backgroundColor || '#ffffff'}AA`
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${isSelected ? nativeAccentFillClass : ''}`} style={{ backgroundColor: isSelected ? (settings.primaryColor || '#000000') : `${settings.headingColor || '#000000'}08`, color: isSelected ? (settings.buttonTextColor || '#000000') : settings.headingColor }}>
                                        <Icon size={15} />
                                    </span>
                                    <span>
                                        <span className="block text-xs font-black" style={{ color: settings.headingColor }}>{option.name}</span>
                                        <span className="block text-[10px] font-bold uppercase tracking-widest opacity-45" style={{ color: settings.bodyColor }}>{option.id === 'manual_eft' ? 'Bank transfer' : 'Pay at venue'}</span>
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>
                {selectedManualPaymentOption && (
                    <div className="mt-3 rounded-xl border p-3 text-xs leading-relaxed" style={{ borderColor: `${settings.headingColor || '#000000'}12`, color: settings.bodyColor }}>
                        {selectedManualPaymentOption.id === 'manual_eft' ? (
                            <>
                                <p className="font-bold" style={{ color: settings.headingColor }}>Use your booking ID as payment reference after submitting.</p>
                                {selectedManualPaymentOption.credentialSummary?.bankName && <p className="mt-1">Bank: {selectedManualPaymentOption.credentialSummary.bankName}</p>}
                                {selectedManualPaymentOption.credentialSummary?.accountHolder && <p>Account holder: {selectedManualPaymentOption.credentialSummary.accountHolder}</p>}
                                {selectedManualPaymentOption.credentialSummary?.accountNumber && <p>Account: {selectedManualPaymentOption.credentialSummary.accountNumber}</p>}
                                {selectedManualPaymentOption.credentialSummary?.branchCode && <p>Branch: {selectedManualPaymentOption.credentialSummary.branchCode}</p>}
                            </>
                        ) : (
                            <p>Pay in cash when the business confirms your booking. They can mark the booking paid once received.</p>
                        )}
                        {selectedManualPaymentOption.instructions && <p className="mt-2 opacity-70">{selectedManualPaymentOption.instructions}</p>}
                    </div>
                )}
            </div>
        )}
        <div
            className="mb-5 rounded-2xl border px-4 py-3.5 md:py-4 text-left"
            style={{
                borderColor: `${settings.headingColor || '#000000'}12`,
                backgroundColor: `${settings.headingColor || '#000000'}05`
            }}
        >
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] mb-2" style={{ color: settings.headingColor }}>
                What happens next
            </p>
            <p className="text-xs leading-relaxed opacity-60" style={{ color: settings.bodyColor }}>
                Send the request and the business will review it. After that, Build A Booking keeps your updates, reschedule requests, and messages with this business in one simple place.
            </p>
        </div>
        <div
            className="mb-5 rounded-2xl border px-4 py-4 text-left"
            style={{
                borderColor: `${settings.primaryColor || settings.headingColor || '#000000'}22`,
                backgroundColor: `${settings.primaryColor || settings.headingColor || '#000000'}0A`
            }}
        >
            <div className="flex items-start gap-3">
                <span
                    className={`mt-0.5 flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-xl ${nativeAccentFillClass}`}
                    style={{ backgroundColor: settings.primaryColor || settings.headingColor || '#000000', color: settings.buttonTextColor || '#000000' }}
                >
                    <Bell size={15} />
                </span>
                <span className="min-w-0">
                    <span className="block text-[10px] font-extrabold uppercase tracking-[0.26em]" style={{ color: settings.headingColor }}>Your Booking Companion</span>
                    <span className="mt-1 block text-xs leading-relaxed opacity-60" style={{ color: settings.bodyColor }}>
                        Add the app or open the client portal to track your booking, get updates, ask for changes, and chat with the place you booked with.
                    </span>
                </span>
            </div>
            {!isPreview && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => { window.location.href = `${window.location.origin}/#/client`; }}
                        className="h-10 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5"
                        style={{ borderColor: `${settings.headingColor || '#000000'}20`, color: settings.headingColor, backgroundColor: settings.backgroundColor || '#ffffff' }}
                    >
                        Client Portal
                    </button>
                    {onInstallApp && (
                        <button
                            type="button"
                            onClick={onInstallApp}
                            className={`h-10 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 ${nativeAccentButtonClass}`}
                            style={{ backgroundColor: settings.primaryColor || settings.headingColor || '#000000', color: settings.buttonTextColor || '#000000' }}
                        >
                            Add App
                        </button>
                    )}
                </div>
            )}
        </div>
        {submitError && (
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-red-500">{submitError}</p>
        )}
        <button onClick={handleAction} disabled={(isSubmitting || !canSubmitBooking) && !isPreview} className={`group relative appearance-none outline-none focus:outline-none w-full py-6 md:py-8 text-xs md:text-sm font-extrabold uppercase tracking-[0.3em] transition-all duration-700 flex items-center justify-center gap-4 overflow-hidden ${(isSubmitting || !canSubmitBooking) && !isPreview ? 'opacity-20 grayscale cursor-not-allowed' : actionButtonStyle === 'minimal' ? 'hover:opacity-70 active:scale-95' : 'hover:-translate-y-1 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] active:translate-y-0 active:scale-95'} ${nativeAccentButtonClass} ${inspectClass}`} style={getActionButtonStyle({ settings, actionButtonStyle })}>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-in-out"></div>
            <span className="relative z-10">{isSubmitting ? 'Sending Request' : isWaitlistMode ? "Join Waitlist" : (settings.confirmButtonText || "Confirm Booking")}</span>
            <ArrowRight size={20} className="relative z-10 transition-transform duration-500 group-hover:translate-x-3" />
        </button>
        {settings.features?.socialProof && (
            <p className="mt-6 text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: settings.bodyColor }}><Flame size={12} className="inline mr-1 -mt-0.5" /> 4 People secured slots this week</p>
        )}
    </>
);
