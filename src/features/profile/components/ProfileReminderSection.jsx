import { BellRing, Check } from 'lucide-react';

const defaultReminders = { enabled: true, client24h: true, client2h: true };

const ReminderToggle = ({ active, disabled, label, note, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`group flex min-h-[4.75rem] items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left transition-all ${active ? 'border-black bg-black text-white' : 'border-neutral-200 bg-white text-black hover:border-black'} ${disabled ? 'cursor-not-allowed opacity-35' : ''}`}
  >
    <span className="min-w-0">
      <span className="block text-sm font-black tracking-tight">{label}</span>
      <span className={`mt-1 block text-xs font-semibold leading-relaxed ${active ? 'text-white/55' : 'text-neutral-500'}`}>{note}</span>
    </span>
    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${active ? 'border-white/25 bg-white text-black' : 'border-neutral-200 bg-neutral-50 text-transparent group-hover:text-black'}`}>
      <Check size={14} strokeWidth={3} />
    </span>
  </button>
);

export const ProfileReminderSection = ({ onSettingChange, settings }) => {
  const reminders = { ...defaultReminders, ...(settings.reminders || {}) };
  const updateReminder = (key, value) => {
    onSettingChange('reminders', { ...reminders, [key]: value });
  };

  return (
    <section className="rounded-lg bg-neutral-50/80 p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-100 bg-neutral-50 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-neutral-400">
            <BellRing size={13} className="text-black" />
            Client reminders
          </div>
          <h4 className="text-xl font-bold tracking-tight text-black">In-app booking reminders</h4>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-500">
            Send portal notifications before confirmed bookings. No emails are sent from this setting.
          </p>
        </div>
        <button
          type="button"
          onClick={() => updateReminder('enabled', !reminders.enabled)}
          className={`h-11 rounded-full px-5 text-[10px] font-black uppercase tracking-widest transition-all ${reminders.enabled ? 'bg-black text-white' : 'border border-neutral-200 bg-white text-neutral-500 hover:border-black hover:text-black'}`}
        >
          {reminders.enabled ? 'Reminders on' : 'Reminders off'}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ReminderToggle
          active={Boolean(reminders.client24h)}
          disabled={!reminders.enabled}
          label="24 hours before"
          note="Clients see a reminder in their portal the day before."
          onClick={() => updateReminder('client24h', !reminders.client24h)}
        />
        <ReminderToggle
          active={Boolean(reminders.client2h)}
          disabled={!reminders.enabled}
          label="2 hours before"
          note="Clients get a closer reminder shortly before arrival."
          onClick={() => updateReminder('client2h', !reminders.client2h)}
        />
      </div>
    </section>
  );
};
