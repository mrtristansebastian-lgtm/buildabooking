export function BuildABookingBrand({ className = '', title = 'Build A Booking', variant = 'dark' }) {
  const isLight = variant === 'light';

  return (
    <svg
      className={`build-booking-brand block overflow-visible ${className}`}
      viewBox="0 0 288 56"
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <image
        href={isLight ? '/build-a-booking-icon-light.png' : '/build-a-booking-icon.png'}
        x="0"
        y="2"
        width="48"
        height="48"
        preserveAspectRatio="xMidYMid meet"
      />
      <text
        x="62"
        y="36"
        fill={isLight ? '#ffffff' : '#050505'}
        fontFamily="'Plus Jakarta Sans', Inter, Manrope, Arial, sans-serif"
        fontSize="25"
        fontWeight="760"
        letterSpacing="-0.8"
      >
        Build A Booking
      </text>
    </svg>
  );
}
