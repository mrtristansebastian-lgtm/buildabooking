import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, X } from 'lucide-react';
import { getFontFamily } from '../../../data/fonts';
import { getLocalDateStr } from '../../../utils/dates';
import { getDateSlotStyle } from '../utils/bookingFlowUtils';

export const BookingDateSection = ({
    activeDate,
    calendarDisplayStyle,
    calendarNativeFillLooks,
    dateStepNumber,
    dateStyle,
    displayDates,
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
    sectionOrder,
    setSelectedDateIdx,
    settings,
    showServiceStep
}) => {
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerMonth, setPickerMonth] = useState(() => (
        activeDate?.localDateStr ? new Date(`${activeDate.localDateStr}T00:00:00`) : new Date()
    ));
    const selectedDateKey = activeDate?.localDateStr || '';
    const todayKey = getLocalDateStr(new Date());
    const availableDateIndex = useMemo(() => {
        const entries = new Map();
        displayDates.forEach((date, index) => {
            if (date.localDateStr) entries.set(date.localDateStr, index);
        });
        return entries;
    }, [displayDates]);
    const pickerMonthLabel = pickerMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const pickerDays = useMemo(() => {
        const firstDay = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), 1);
        const lastDay = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 0);
        const leadingDays = (firstDay.getDay() + 6) % 7;
        return [
            ...Array.from({ length: leadingDays }, (_, index) => ({ key: `empty-${index}`, empty: true })),
            ...Array.from({ length: lastDay.getDate() }, (_, index) => {
                const date = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), index + 1);
                const dateStr = getLocalDateStr(date);
                return { key: dateStr, date, dateStr, empty: false };
            })
        ];
    }, [pickerMonth]);
    const openPicker = (event) => {
        event.stopPropagation();
        setPickerMonth(activeDate?.localDateStr ? new Date(`${activeDate.localDateStr}T00:00:00`) : new Date());
        setPickerOpen(true);
    };
    const closePicker = (event) => {
        event?.stopPropagation?.();
        setPickerOpen(false);
    };
    const selectPickerDate = (dateStr) => {
        const nextIndex = availableDateIndex.get(dateStr);
        if (typeof nextIndex !== 'number') return;
        setSelectedDateIdx(nextIndex);
        setPickerOpen(false);
    };

    return (
        <section data-preview-section="calendar" style={{ order: sectionOrder ?? (showServiceStep ? 2 : 1) }}>
            <div className={`flex ${pageAlignment === 'left' ? 'items-end justify-between' : `flex-col ${pageItems} gap-4`} mb-6 px-1 ${inspectClass}`} onClick={() => previewInspectEnabled && onInspect('calendar')}>
                <div className={`flex flex-col ${pageItems} ${pageTextClass}`}>
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] mb-2 opacity-40" style={{ color: settings.bodyColor }} contentEditable={previewInspectEnabled} suppressContentEditableWarning onBlur={(event) => isPreview && onSettingChange?.('dateLabel', event.currentTarget.textContent.replace(/^\d+\s*\/\/\s*/i, '').trim())}>{dateStepNumber} // {settings.dateLabel || "Which day?"}</h3>
                    <div className="flex flex-wrap items-center gap-4" style={{ justifyContent: pageJustify }}>
                        <h4 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: settings.headingColor, fontFamily: getFontFamily(settings.headingFontFamily || settings.fontFamily), ...(headingLetterSpacing ? { letterSpacing: headingLetterSpacing } : {}) }}>
                            {activeDate.month} <span className="font-light italic opacity-40">{activeDate.year}</span>
                        </h4>
                    </div>
                </div>
                <div className="booking-calendar-actions flex gap-2" style={{ justifyContent: pageJustify }}>
                    <button className="appearance-none outline-none focus:outline-none w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-20 hover:opacity-100 border" style={{ borderColor: (settings.headingColor || '#000') + '30', color: settings.headingColor }}><ChevronLeft size={14} /></button>
                    <button type="button" onClick={openPicker} aria-label="Edit selected day" title="Edit selected day" className="booking-calendar-picker-trigger appearance-none outline-none focus:outline-none w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-60 hover:opacity-100 border" style={{ borderColor: (settings.headingColor || '#000') + '30', color: settings.headingColor }}>
                        <Pencil size={13} />
                    </button>
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

            {pickerOpen && (
                <div className="booking-date-picker-backdrop" onClick={closePicker}>
                    <div className="booking-date-picker-modal" role="dialog" aria-modal="true" aria-label="Select booking day" onClick={(event) => event.stopPropagation()}>
                        <div className="booking-date-picker-title">
                            <div>
                                <p>Select Day</p>
                                <h3>{pickerMonthLabel}</h3>
                            </div>
                            <button type="button" onClick={closePicker} aria-label="Close date picker">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="booking-date-picker-nav">
                            <button type="button" onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1, 1))}>
                                <ChevronLeft size={16} />
                                Previous
                            </button>
                            <button type="button" onClick={() => setPickerMonth(new Date())}>Today</button>
                            <button type="button" onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1))}>
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="booking-date-picker-weekdays" aria-hidden="true">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <span key={day}>{day}</span>)}
                        </div>
                        <div className="booking-date-picker-grid">
                            {pickerDays.map(day => {
                                if (day.empty) return <span key={day.key} className="is-empty" />;
                                const isAvailable = availableDateIndex.has(day.dateStr);
                                return (
                                    <button
                                        key={day.key}
                                        type="button"
                                        disabled={!isAvailable}
                                        className={`${day.dateStr === selectedDateKey ? 'is-active' : ''} ${day.dateStr === todayKey ? 'is-today' : ''}`}
                                        onClick={() => selectPickerDate(day.dateStr)}
                                    >
                                        {day.date.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
