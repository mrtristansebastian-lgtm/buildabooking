import { Check, Users } from 'lucide-react';

export const StaffCalendarSwitcher = ({
  calendars,
  getStaffInitials,
  onSelectCalendar,
  selectedCalendarId
}) => (
  <aside className="schedule-staff-switcher" aria-label="Staff calendars">
    <div className="schedule-section-head">
      <div>
        <p>Calendars</p>
        <strong>Staff views</strong>
      </div>
      <Users size={16} />
    </div>
    <div className="schedule-staff-list" role="list">
      {calendars.map(calendar => {
        const active = calendar.id === selectedCalendarId;
        const initial = calendar.id === 'workspace' ? 'B' : getStaffInitials(calendar.name);
        return (
          <button
            key={calendar.id}
            type="button"
            role="listitem"
            className={`schedule-staff-row ${active ? 'is-active' : ''}`}
            onClick={() => onSelectCalendar(calendar.id)}
          >
            <span className="schedule-staff-avatar" style={{ '--staff-color': calendar.color || '#111827' }}>
              {calendar.photoURL ? <img src={calendar.photoURL} alt="" /> : initial}
            </span>
            <span className="schedule-staff-copy">
              <strong>{calendar.shortName || calendar.name}</strong>
              <small>{calendar.role || calendar.username || 'Calendar'}</small>
            </span>
            {active && <Check size={15} />}
          </button>
        );
      })}
    </div>
  </aside>
);
