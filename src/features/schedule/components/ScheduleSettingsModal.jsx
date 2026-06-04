import { useEffect, useState } from 'react';
import { CalendarCheck, Check, Pencil, Plus, Save, Trash2, X } from 'lucide-react';

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
  const [newSlot, setNewSlot] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setCustomRange({ startDate: '', endDate: '' });
      setNewSlot('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const addSlot = () => {
    onAddSlot(newSlot);
    setNewSlot('');
  };

  const rangePayload = applyScope === 'custom'
    ? {
      startDate: customRange.startDate || selectedDate,
      endDate: customRange.endDate || customRange.startDate || selectedDate
    }
    : {};

  return (
    <div className="schedule-settings-backdrop">
      <div className="schedule-settings-modal" role="dialog" aria-modal="true" aria-label="Schedule settings">
        <div className="schedule-panel-title">
          <div>
            <p>Schedule Settings</p>
            <h3>Default slots</h3>
            <small>{selectedCalendarName}</small>
          </div>
          <button type="button" className="schedule-icon-button" onClick={onClose} aria-label="Close schedule settings">
            <X size={16} />
          </button>
        </div>

        <div className="schedule-default-slot-editor">
          <div className="schedule-section-head">
            <div>
              <p>Available Times</p>
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
          </div>
          <div className="schedule-add-slot-row">
            <input
              value={newSlot}
              onChange={event => setNewSlot(event.target.value)}
              placeholder="09:00 or 09:00 - 10:00"
              aria-label="New default slot"
            />
            <button type="button" onClick={addSlot}>
              <Plus size={15} />
              Add slot
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
                <input
                  type="date"
                  value={customRange.startDate || selectedDate || ''}
                  onChange={event => setCustomRange(prev => ({ ...prev, startDate: event.target.value }))}
                />
              </label>
              <label>
                <span>Until</span>
                <input
                  type="date"
                  value={customRange.endDate || customRange.startDate || selectedDate || ''}
                  onChange={event => setCustomRange(prev => ({ ...prev, endDate: event.target.value }))}
                />
              </label>
            </div>
          )}
          <button type="button" className={`schedule-check-row ${waitlistEnabled ? 'is-active' : ''}`} onClick={onToggleWaitlist}>
            <span>{waitlistEnabled && <Check size={13} />}</span>
            Waitlist
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
    </div>
  );
};
