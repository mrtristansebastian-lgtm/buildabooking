const funnelRoomFields = {
  introduction: [
    ['input', 'brandName', 'Booking page name', 'Welcome to your business', true],
    ['input', 'tagline', 'Text above heading', 'Private bookings / by appointment'],
    ['textarea', 'welcomeMessage', 'Subtext under heading', 'Choose a time that works for you.'],
    ['input', 'bookingCtaLabel', 'Button text', 'Add booking to cart']
  ],
  cart: [
    ['input', 'cartBackLabel', 'Back link', 'Edit selection'],
    ['input', 'cartEyebrow', 'Text above heading', 'Your cart'],
    ['input', 'cartTitle', 'Cart heading', 'Review cart.', true],
    ['textarea', 'cartCopy', 'Cart copy', 'Check your item before checkout. You can edit the booking if anything looks off.'],
    ['input', 'cartCtaLabel', 'Button text', 'Next: fill in your details']
  ],
  checkout: [
    ['input', 'checkoutTitle', 'Checkout title', 'Fill in your details.', true],
    ['textarea', 'checkoutCopy', 'Checkout copy', 'Request the booking first. If payment is needed, the next step will take care of it cleanly.'],
    ['input', 'detailsHeading', 'Section label', 'Your Details'],
    ['input', 'detailsSubHeading', 'Form heading', 'Secure Your Slot'],
    ['textarea', 'checkoutNote', 'Checkout note', 'The business reviews your request, confirms the slot, and keeps updates in your client portal.'],
    ['input', 'checkoutSubmitLabel', 'Button text', 'Request booking']
  ],
  success: [
    ['input', 'successStatusLabel', 'Status label', 'Booking Status'],
    ['input', 'successHeading', 'Success heading', 'Request sent.', true],
    ['textarea', 'successCopy', 'Success copy', 'We have your request and will review the booking details shortly.'],
    ['input', 'successNextTitle', 'Next title', 'Business review'],
    ['textarea', 'successNextCopy', 'Next copy', 'We will confirm the slot, follow up if needed, or help adjust the booking.'],
    ['input', 'successNewRequestLabel', 'Restart link', 'New Request']
  ]
};

export function FunnelTextRoom({
  onSettingChange,
  page,
  settings
}) {
  const fields = funnelRoomFields[page] || funnelRoomFields.introduction;

  return (
    <div className={`cinema-intro-editor cinema-${page}-room`}>
      <div className="cinema-intro-fields">
        {fields.map(([type, key, label, placeholder, hero]) => (
          <label key={key} className={`cinema-text-card ${hero ? 'is-hero' : ''} ${type === 'textarea' ? 'cinema-subtext-card' : ''}`}>
            <span>{label}</span>
            {type === 'textarea' ? (
              <textarea rows={1} value={settings[key] || ''} onChange={(event) => onSettingChange(key, event.target.value)} placeholder={placeholder} />
            ) : (
              <input value={settings[key] || ''} onChange={(event) => onSettingChange(key, event.target.value)} placeholder={placeholder} />
            )}
          </label>
        ))}
      </div>

    </div>
  );
}
