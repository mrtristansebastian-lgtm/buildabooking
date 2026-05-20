import { useId } from 'react';

export function BuildABookingBrand({ className = '', showWordmark = true, title = 'Build A Booking' }) {
  const rawId = useId().replace(/:/g, '');
  const accentId = `${rawId}-brand-accent`;
  const viewWidth = showWordmark ? 318 : 76;

  return (
    <svg
      className={`build-booking-brand block overflow-visible ${className}`}
      viewBox={`0 0 ${viewWidth} 76`}
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={accentId} x1="0" y1="76" x2={showWordmark ? '274' : '70'} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#39ff14" />
          <stop offset="0.12" stopColor="#eaff32" />
          <stop offset="0.24" stopColor="#39ff14" />
          <stop offset="0.38" stopColor="#12f0cf" />
          <stop offset="0.52" stopColor="#14a7ff" />
          <stop offset="0.66" stopColor="#755cff" />
          <stop offset="0.8" stopColor="#ff4fd8" />
          <stop offset="0.88" stopColor="#755cff" />
          <stop offset="0.94" stopColor="#14a7ff" />
          <stop offset="0.98" stopColor="#12f0cf" />
          <stop offset="1" stopColor="#39ff14" />
        </linearGradient>
      </defs>

      <g stroke={`url(#${accentId})`} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 13v50" strokeWidth="5.2" />
        <path
          d="M20 13.5h22.2c9.6 0 16.4 6.2 16.4 14.5S51.8 42.5 42 42.5H20"
          strokeWidth="5.2"
        />
        <path
          d="M30.4 42.5h15.2c10.2 0 17.2 6.1 17.2 15.1 0 8.8-6.9 14.9-17.2 14.9H20"
          strokeWidth="5.2"
        />
        <path d="M8.5 28.2h15.2" strokeWidth="4.4" />
        <path d="M8.5 52.2h15.2" strokeWidth="4.4" />
      </g>

      <g stroke={`url(#${accentId})`} strokeLinecap="round" strokeLinejoin="round" transform="translate(11 41)">
        <rect x="0.5" y="0.5" width="29" height="24" rx="7" strokeWidth="3.2" />
        <path d="M7.4 0.5v-5M22.6 0.5v-5" strokeWidth="3.2" />
        <path d="M8.4 13.1l4.7 4.8 9.5-10.1" strokeWidth="3.5" />
      </g>

      {showWordmark && (
        <g transform="translate(90 0)">
          <text
            x="0"
            y="45"
            fill={`url(#${accentId})`}
            fontFamily="'Plus Jakarta Sans', Inter, Manrope, Arial, sans-serif"
            fontSize="24"
            fontWeight="760"
            letterSpacing="-0.9"
          >
            Build A Booking
          </text>
        </g>
      )}
    </svg>
  );
}
