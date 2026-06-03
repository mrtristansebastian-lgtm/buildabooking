import { Bell } from 'lucide-react';
import { getFontFamily } from '../../../data/fonts';
import { getTimeSlotStyle } from '../utils/bookingFlowUtils';

export const BookingTimeSection = ({
    displayTimesForActiveDate,
    headingLetterSpacing,
    inspectClass,
    isPreview,
    isPreviewTimePlaceholder,
    isWaitlistMode,
    nativeAccent,
    nativeAccentBorderClass,
    nativeAccentButtonClass,
    nativeAccentFillClass,
    onInspect,
    onSettingChange,
    pageItems,
    pageTextClass,
    previewInspectEnabled,
    selectedTime,
    setSelectedTime,
    settings,
    showServiceStep,
    timeDisplayStyle,
    timeSlotStyle,
    timeStepNumber
}) => (
    <section data-preview-section="time" style={{ order: showServiceStep ? 3 : 2 }}>
        <div className={`flex flex-col ${pageItems} ${pageTextClass} mb-6 px-1 ${inspectClass}`} data-preview-section="time" onClick={() => previewInspectEnabled && onInspect('time')}>
            <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] mb-2 opacity-40" style={{ color: settings.bodyColor }} contentEditable={previewInspectEnabled} suppressContentEditableWarning onBlur={(event) => isPreview && onSettingChange?.('timeLabel', event.currentTarget.textContent.replace(/^\d+\s*\/\/\s*/i, '').trim())}>{timeStepNumber} // {settings.timeLabel || "Select Time"}</h3>
            <h4 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: settings.headingColor, fontFamily: getFontFamily(settings.headingFontFamily || settings.fontFamily), ...(headingLetterSpacing ? { letterSpacing: headingLetterSpacing } : {}) }}>
                {isWaitlistMode ? 'Day Full - Join Waitlist' : 'Available Slots'}
            </h4>
        </div>

        {displayTimesForActiveDate.length === 0 ? (
            isWaitlistMode ? (
                <div className={`p-8 border border-dashed rounded-lg text-center ${nativeAccentBorderClass}`} style={{ borderColor: settings.primaryColor }}>
                    <Bell size={24} className="mx-auto mb-4" style={{ color: settings.primaryColor }} />
                    <p className="text-sm font-bold mb-2" style={{ color: settings.headingColor, fontFamily: getFontFamily(settings.headingFontFamily || settings.fontFamily) }}>Standby List Active</p>
                    <p className="text-xs opacity-60">Enter your details below. We'll notify you instantly if a slot opens.</p>
                </div>
            ) : (
                <div className="py-8 text-center text-sm font-bold tracking-widest uppercase opacity-20">Fully Booked</div>
            )
        ) : (
            <div className={`booking-time-look booking-time-${timeDisplayStyle} ${isPreviewTimePlaceholder ? 'booking-time-preview-empty' : ''} grid grid-cols-3 gap-3 md:gap-4 ${isPreview ? 'cursor-pointer' : ''}`} onClick={() => previewInspectEnabled && onInspect('time')}>
                {displayTimesForActiveDate.map((time, index) => {
                    const isActive = isPreviewTimePlaceholder ? index === 0 : selectedTime === time;
                    const nativeTimeClass = nativeAccent && isActive
                        ? (timeSlotStyle === 'solid' ? nativeAccentButtonClass : nativeAccentBorderClass)
                        : '';
                    return (
                        <button
                            key={time}
                            onClick={() => {
                                if (isPreviewTimePlaceholder) return;
                                setSelectedTime(time);
                            }}
                            className={`appearance-none outline-none focus:outline-none group relative transition-all duration-500 flex items-center justify-center w-full ${isPreviewTimePlaceholder ? 'is-preview-empty' : ''} ${timeSlotStyle !== 'minimal' ? 'py-4 md:py-5' : 'py-3'} ${timeSlotStyle !== 'minimal' && isActive ? 'shadow-xl scale-105 z-10' : ''} ${nativeTimeClass}`}
                            style={getTimeSlotStyle({ isActive, settings, timeSlotStyle })}
                        >
                            <div className="flex items-center justify-center relative w-full">
                                <span className={`text-lg md:text-xl font-bold tracking-tighter transition-all duration-500 ${isActive && timeSlotStyle === 'minimal' ? '-translate-y-1 scale-110' : ''}`} style={{ fontFeatureSettings: '"tnum" on, "lnum" on' }}>{time}</span>
                                {timeSlotStyle === 'minimal' && isActive && <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-lg ${nativeAccentFillClass}`} style={{ backgroundColor: settings.primaryColor }} />}
                            </div>
                        </button>
                    );
                })}
            </div>
        )}
    </section>
);
