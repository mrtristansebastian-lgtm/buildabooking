import { useEffect, useState } from 'react';
import { CalendarCheck, Check, ChevronLeft, ChevronRight, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { getLocalDateStr } from '../../../utils/dates';

export const ScheduleSettingsModal = ({
  applyScope,
  defaultSlots,
  isOpen,
  onAddSlot,
  onApplyDefaults,
  onChangeApplyScope,
  onClose,
  onDeleteSlot,
  onEditSlot,
  onSaveDefaults,
  onToggleWaitlist,
  selectedDate,
  selectedCalendarName,
  waitlistEnabled
}) => {
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });
  const [rangePicker, setRangePicker] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setCustomRange({ startDate: '', endDate: '' });
      setRangePicker(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rangePayload = applyScope === 'custom'
    ? {
      startDate: customRange.startDate || selectedDate,
      endDate: customRange.endDate || customRange.startDate || selectedDate
    }
    : {};
  const formatRangeDate = (dateStr) => (
    dateStr
      ? new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Choose day'
  );
  const openRangePicker = (field) => {
    const dateStr = customRange[field] || selectedDate;
    setRangePicker({ field, month: new Date(`${dateStr}T00:00:00`) });
  };
  const rangePickerMonthLabel = rangePicker?.month?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const rangePickerDays = rangePicker ? (() => {
    const firstDay = new Date(rangePicker.month.getFullYear(), rangePicker.month.getMonth(), 1);
    const lastDay = new Date(rangePicker.month.getFullYear(), rangePicker.month.getMonth() + 1, 0);
    const leadingDays = (firstDay.getDay() + 6) % 7;
    return [
      ...Array.from({ length: leadingDays }, (_, index) => ({ key: `empty-${index}`, empty: true })),
      ...Array.from({ length: lastDay.getDate() }, (_, index) => {
        const date = new Date(rangePicker.month.getFullYear(), rangePicker.month.getMonth(), index + 1);
        return { key: getLocalDateStr(date), date, dateStr: getLocalDateStr(date), empty: false };
      })
    ];
  })() : [];
  const selectRangeDate = (dateStr) => {
    setCustomRange(prev => {
      const next = { ...prev, [rangePicker.field]: dateStr };
      if (rangePicker.field === 'startDate' && next.endDate && next.endDate < dateStr) next.endDate = dateStr;
      if (rangePicker.field === 'endDate' && (next.startDate || selectedDate) > dateStr) next.startDate = dateStr;
      return next;
    });
    setRangePicker(null);
  };

  return (
    <div className="schedule-settings-backdrop">
      <div className="schedule-settings-modal" role="dialog" aria-modal="true" aria-label="Schedule settings">
        <div className="schedule-panel-title">
          <div>
            <h3>Schedule settings</h3>
            <small>{selectedCalendarName}</small>
          </div>
          <button type="button" className="schedule-icon-button" onClick={onClose} aria-label="Close schedule settings">
            <X size={16} />
          </button>
        </div>

        <div className="schedule-default-slot-editor">
          <div className="schedule-section-head">
            <div>
              <strong>{defaultSlots.length} default slots</strong>
            </div>
          </div>
          <div className="schedule-slot-bubble-grid" aria-label="Default slots">
            {defaultSlots.map(slot => (
              <div key={slot} className="schedule-slot-bubble">
                <span>{slot}</span>
                <button type="button" onClick={() => onEditSlot?.(slot)} aria-label={`Edit ${slot}`}>
                  <Pencil size={13} />
                </button>
                <button type="button" onClick={() => onDeleteSlot(slot)} aria-label={`Delete ${slot}`}>
                  <Trash2 size={13} />
                </button>
              </div>
              ))}
              <button type="button" className="schedule-slot-bubble is-add" onClick={() => onAddSlot?.()} aria-label="Add default slot">
                <Plus size={16} />
              </button>
            </div>
        </div>

        <div className="schedule-settings-options">
          <label>
            <span>Apply defaults for</span>
            <select value={applyScope} onChange={event => onChangeApplyScope(event.target.value)}>
              <option value="day">Selected day</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="always">Always</option>
              <option value="custom">Custom period</option>
            </select>
          </label>
          {applyScope === 'custom' && (
            <div className="schedule-custom-range">
              <label>
                <span>From</span>
                <button type="button" onClick={() => openRangePicker('startDate')}>
                  <CalendarCheck size={14} />
                  {formatRangeDate(customRange.startDate || selectedDate)}
                </button>
              </label>
              <label>
                <span>Until</span>
                <button type="button" onClick={() => openRangePicker('endDate')}>
                  <CalendarCheck size={14} />
                  {formatRangeDate(customRange.endDate || customRange.startDate || selectedDate)}
                </button>
              </label>
            </div>
          )}
          <button type="button" className={`schedule-check-row ${waitlistEnabled ? 'is-active' : ''}`} onClick={onToggleWaitlist}>
            <span>{waitlistEnabled && <Check size={13} />}</span>
            Offer waitlist
          </button>
        </div>

        <div className="schedule-settings-actions">
          <button type="button" className="is-primary" onClick={onSaveDefaults}>
            <Save size={15} />
            Save slots
          </button>
          <button type="button" onClick={() => onApplyDefaults(applyScope, rangePayload)}>
            <CalendarCheck size={15} />
            Apply defaults
          </button>
        </div>
      </div>
      {rangePicker && (
        <div className="schedule-date-picker-backdrop schedule-range-picker-backdrop">
          <div className="schedule-date-picker-modal" role="dialog" aria-modal="true" aria-label="Select custom period date">
            <div className="schedule-panel-title">
              <div>
                <p>{rangePicker.field === 'startDate' ? 'From' : 'Until'}</p>
                <h3>{rangePickerMonthLabel}</h3>
              </div>
              <button type="button" className="schedule-icon-button" onClick={() => setRangePicker(null)} aria-label="Close custom period calendar">
                <X size={16} />
              </button>
            </div>
            <div className="schedule-picker-month-nav">
              <button type="button" onClick={() => setRangePicker(prev => ({ ...prev, month: new Date(prev.month.getFullYear(), prev.month.getMonth() - 1, 1) }))}>
                <ChevronLeft size={16} />
                Previous
              </button>
              <button type="button" onClick={() => setRangePicker(prev => ({ ...prev, month: new Date() }))}>Today</button>
              <button type="button" onClick={() => setRangePicker(prev => ({ ...prev, month: new Date(prev.month.getFullYear(), prev.month.getMonth() + 1, 1) }))}>
                Next
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="schedule-picker-weekdays" aria-hidden="true">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <span key={day}>{day}</span>)}
            </div>
            <div className="schedule-picker-grid">
              {rangePickerDays.map(day => day.empty ? (
                <span key={day.key} className="is-empty" />
              ) : (
                <button
                  key={day.key}
                  type="button"
                  className={`${day.dateStr === (customRange[rangePicker.field] || selectedDate) ? 'is-active' : ''} ${day.dateStr === selectedDate ? 'is-today' : ''}`}
                  onClick={() => selectRangeDate(day.dateStr)}
                >
                  {day.date.getDate()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
