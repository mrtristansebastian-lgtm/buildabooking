import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getFontFamily } from '../../../data/fonts';
import { getDateSlotStyle } from '../utils/bookingFlowUtils';

export const BookingDateSection = ({
    activeDate,
    calendarDisplayStyle,
    calendarNativeFillLooks,
    dateStepNumber,
    dateStyle,
    displayDates,
    handleFirstAvailable,
    headingLetterSpacing,
    inspectClass,
    isPreview,
    nativeAccent,
    nativeAccentBorderClass,
    nativeAccentButtonClass,
    nativeAccentFillClass,
    onInspect,
    onSettingChange,
    pageAlignment,
    pageItems,
    pageJustify,
    pageTextClass,
    previewInspectEnabled,
    selectedDateIdx,
    setSelectedDateIdx,
    settings,
    showServiceStep
}) => (
    <section data-preview-section="calendar" style={{ order: showServiceStep ? 2 : 1 }}>
        <div className={`flex ${pageAlignment === 'left' ? 'items-end justify-between' : `flex-col ${pageItems} gap-4`} mb-6 px-1 ${inspectClass}`} onClick={() => previewInspectEnabled && onInspect('calendar')}>
            <div className={`flex flex-col ${pageItems} ${pageTextClass}`}>
                <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] mb-2 opacity-40" style={{ color: settings.bodyColor }} contentEditable={previewInspectEnabled} suppressContentEditableWarning onBlur={(event) => isPreview && onSettingChange?.('dateLabel', event.currentTarget.textContent.replace(/^\d+\s*\/\/\s*/i, '').trim())}>{dateStepNumber} // {settings.dateLabel || "Which day?"}</h3>
                <div className="flex flex-wrap items-center gap-4" style={{ justifyContent: pageJustify }}>
                    <h4 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: settings.headingColor, fontFamily: getFontFamily(settings.headingFontFamily || settings.fontFamily), ...(headingLetterSpacing ? { letterSpacing: headingLetterSpacing } : {}) }}>
                        {activeDate.month} <span className="font-light italic opacity-40">{activeDate.year}</span>
                    </h4>
                    {settings.features?.firstAvailable && (
                        <button onClick={handleFirstAvailable} className={`px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-full transition-all ${nativeAccentButtonClass}`} style={{ backgroundColor: settings.primaryColor, color: settings.buttonTextColor || '#000', fontFamily: getFontFamily(settings.buttonFontFamily || settings.fontFamily) }}>First Available</button>
                    )}
                </div>
            </div>
            <div className="flex gap-2" style={{ justifyContent: pageJustify }}>
                <button className="appearance-none outline-none focus:outline-none w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-20 hover:opacity-100 border" style={{ borderColor: (settings.headingColor || '#000') + '30', color: settings.headingColor }}><ChevronLeft size={14} /></button>
                <button className="appearance-none outline-none focus:outline-none w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-20 hover:opacity-100 border" style={{ borderColor: (settings.headingColor || '#000') + '30', color: settings.headingColor }}><ChevronRight size={14} /></button>
            </div>
        </div>

        <div className="relative w-full overflow-hidden h-[130px] md:h-[150px]">
            <div className={`booking-calendar-look booking-calendar-${calendarDisplayStyle} flex gap-3 md:gap-4 overflow-x-auto h-[180px] md:h-[200px] pt-4 px-2 snap-x ${isPreview ? 'cursor-pointer' : ''} [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`} onClick={() => previewInspectEnabled && onInspect('calendar')}>
                {displayDates.map((date, index) => {
                    const isActive = selectedDateIdx === index;
                    const nativeDateClass = nativeAccent && isActive
                        ? (dateStyle === 'solid' && calendarNativeFillLooks.has(calendarDisplayStyle) ? nativeAccentButtonClass : nativeAccentBorderClass)
                        : '';
                    return (
                        <button key={index} aria-pressed={isActive} onClick={() => setSelectedDateIdx(index)} className={`appearance-none outline-none focus:outline-none snap-center flex-shrink-0 w-16 h-[96px] md:w-20 md:h-[112px] flex flex-col items-center justify-center gap-1.5 transition-all duration-500 relative ${isActive ? 'shadow-xl scale-105 z-10' : 'opacity-60 hover:opacity-100'} ${nativeDateClass}`} style={getDateSlotStyle({ isActive, settings, dateStyle })}>
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] transition-all">{date.dayName}</span>
                            <span className="text-3xl md:text-4xl font-bold tracking-tighter transition-all">{date.dayNum}</span>
                            {dateStyle === 'minimal' && isActive && <div className={`absolute -bottom-3 w-10 h-[2px] rounded-full ${nativeAccentFillClass}`} style={{ backgroundColor: settings.primaryColor }} />}
                        </button>
                    );
                })}
            </div>
        </div>
    </section>
);
