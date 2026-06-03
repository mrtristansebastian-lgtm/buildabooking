import { CalendarCheck, Check, RefreshCw } from 'lucide-react';

export const ScheduleTopBar = ({
  googleCalendarState = {},
  googleSyncCount = 0,
  onConnectGoogleCalendar,
  onSave,
  onSyncGoogleCalendar,
  selectedCalendarId
}) => {
  const connected = Boolean(googleCalendarState.connected);
  const label = connected ? 'Connected' : googleCalendarState.email ? 'Reconnect' : 'Connect';

  return (
    <div className="schedule-top-bar">
      <div className="schedule-google-state">
        <span className={connected ? 'is-connected' : ''} />
        <div>
          <p>Google Calendar</p>
          <strong>{connected ? (googleCalendarState.email || 'Connected') : 'Sync confirmed bookings when ready'}</strong>
        </div>
      </div>
      <div className="schedule-top-actions">
        <button type="button" onClick={() => onConnectGoogleCalendar?.()}>
          <CalendarCheck size={15} />
          {label}
        </button>
        <button type="button" onClick={() => onSyncGoogleCalendar?.(selectedCalendarId)} disabled={googleCalendarState.syncing}>
          <RefreshCw size={15} className={googleCalendarState.syncing ? 'animate-spin' : ''} />
          {googleCalendarState.syncing ? 'Syncing' : `Sync ${googleSyncCount}`}
        </button>
        <button type="button" className="is-primary" onClick={onSave}>
          <Check size={15} />
          Save
        </button>
      </div>
    </div>
  );
};
