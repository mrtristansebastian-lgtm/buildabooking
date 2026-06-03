export function IntroductionRoom({ settings, onSettingChange }) {
  return (
    <div className="cinema-intro-editor">
      <div className="cinema-intro-fields">
        <label className="cinema-text-card is-hero">
          <span>Booking page name</span>
          <input value={settings.brandName || ''} onChange={(event) => onSettingChange('brandName', event.target.value)} placeholder={`Welcome to ${settings.businessName || 'your business'}`} />
        </label>
        <label className="cinema-text-card">
          <span>Text above heading</span>
          <input value={settings.tagline || ''} onChange={(event) => onSettingChange('tagline', event.target.value)} placeholder="Private bookings / by appointment" />
        </label>
        <label className="cinema-text-card cinema-subtext-card">
          <span>Subtext under heading</span>
          <textarea rows={1} value={settings.welcomeMessage || ''} onChange={(event) => onSettingChange('welcomeMessage', event.target.value)} placeholder="Choose a time that works for you." />
        </label>
      </div>
    </div>
  );
}
