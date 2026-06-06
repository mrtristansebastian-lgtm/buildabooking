export const ClientPortalPrompt = ({
  formData,
  isPreview,
  onInstallApp,
  settings
}) => {
  const showPortalButton = Boolean(formData.email) || isPreview;
  const showInstallButton = Boolean(onInstallApp) || isPreview;

  if (!showPortalButton && !showInstallButton) return null;

  return (
    <div className="booking-portal-prompt mb-8 w-full max-w-lg rounded-2xl border p-4" style={{ borderColor: `${settings.primaryColor || settings.headingColor || '#000000'}22`, backgroundColor: `${settings.primaryColor || settings.headingColor || '#000000'}0A` }}>
      <div className="booking-portal-head flex items-start gap-3">
        <span className="booking-portal-icon mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: settings.primaryColor || settings.headingColor || '#000000', color: settings.buttonTextColor || '#000000' }}>
          <span className="h-2 w-2 rounded-full bg-current" />
        </span>
        <div className="booking-portal-copy min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.24em]" style={{ color: settings.headingColor }}>Track this booking</p>
          <p className="mt-1 text-xs leading-relaxed opacity-60" style={{ color: settings.bodyColor }}>
            Open the client portal or add the app to manage updates, reschedule requests, and chat.
          </p>
        </div>
      </div>
      <div className="booking-portal-actions mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {showPortalButton && (
          <button
            type="button"
            onClick={() => { if (!isPreview) window.location.href = `${window.location.origin}/#/client`; }}
            className="h-10 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5"
            style={{ borderColor: `${settings.headingColor || '#000000'}20`, color: settings.headingColor, backgroundColor: settings.backgroundColor || '#ffffff' }}
          >
            Client portal
          </button>
        )}
        {showInstallButton && (
          <button
            type="button"
            onClick={() => { if (!isPreview) onInstallApp?.(); }}
            className="h-10 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: settings.primaryColor || settings.headingColor || '#000000', color: settings.buttonTextColor || '#000000' }}
          >
            Add app
          </button>
        )}
      </div>
    </div>
  );
};
