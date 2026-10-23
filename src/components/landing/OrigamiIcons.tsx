/**
 * High-fidelity SVG Origami & 3D faceted paper assets for the landing page.
 */
import React from 'react';

export const PaperPlaneLogo: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 22L44 6L28 42L22 28L4 22Z" fill="url(#plane-grad-1)" />
    <path d="M44 6L22 28L28 42L44 6Z" fill="url(#plane-grad-2)" />
    <path d="M22 28L18 36L24 33L22 28Z" fill="#bae6fd" opacity="0.9" />
    <path d="M22 28L28 42L25 34L22 28Z" fill="#38bdf8" opacity="0.6" />
    <defs>
      <linearGradient id="plane-grad-1" x1="4" y1="6" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" />
        <stop offset="1" stopColor="#e0f2fe" />
      </linearGradient>
      <linearGradient id="plane-grad-2" x1="44" y1="6" x2="22" y2="35" gradientUnits="userSpaceOnUse">
        <stop stopColor="#e2e8f0" />
        <stop offset="1" stopColor="#93c5fd" />
      </linearGradient>
    </defs>
  </svg>
);

export const LargeOrigamiAirplane: React.FC<{ className?: string }> = ({ className = 'w-72 h-72' }) => (
  <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g filter="url(#plane-shadow)">
      <polygon points="12,110 210,24 135,168 110,118" fill="#FFFFFF" />
      <polygon points="210,24 135,168 110,118" fill="#DDEAF8" />
      <polygon points="110,118 90,154 122,142" fill="#BAE6FD" />
      <polygon points="110,118 135,168 118,144" fill="#7DD3FC" opacity="0.75" />
      <line x1="210" y1="24" x2="110" y2="118" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.8" />
    </g>
    <defs>
      <filter id="plane-shadow" x="0" y="16" width="230" height="175" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feDropShadow dx="-4" dy="8" stdDeviation="12" floodColor="#0284c7" floodOpacity="0.25" />
      </filter>
    </defs>
  </svg>
);

export const OrigamiHeart: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <polygon points="50,28 32,14 16,25 18,48 50,82" fill="#FFFFFF" />
    <polygon points="50,28 68,14 84,25 82,48 50,82" fill="#E2E8F0" />
    <polygon points="50,28 32,14 50,18" fill="#F8FAFC" />
    <polygon points="50,28 68,14 50,18" fill="#CBD5E1" />
    <polygon points="16,25 32,14 36,36 18,48" fill="#F1F5F9" />
    <polygon points="84,25 68,14 64,36 82,48" fill="#94A3B8" />
    <polygon points="50,28 36,36 50,82" fill="#E2E8F0" />
    <polygon points="50,28 64,36 50,82" fill="#CBD5E1" />
  </svg>
);

export const OrigamiPinIcon: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g filter="url(#pin-shadow)">
      <polygon points="30,8 14,24 30,52" fill="#0284C7" />
      <polygon points="30,8 46,24 30,52" fill="#38BDF8" />
      <polygon points="30,16 22,24 30,36" fill="#BAE6FD" />
      <polygon points="30,16 38,24 30,36" fill="#E0F2FE" />
      <circle cx="30" cy="24" r="5" fill="#FFFFFF" />
    </g>
    <defs>
      <filter id="pin-shadow" x="8" y="4" width="44" height="52" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0284c7" floodOpacity="0.25" />
      </filter>
    </defs>
  </svg>
);

export const OrigamiBoxIcon: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g filter="url(#box-shadow)">
      <polygon points="30,12 50,24 30,36 10,24" fill="#FFFFFF" />
      <polygon points="10,24 30,36 30,50 10,38" fill="#BAE6FD" />
      <polygon points="50,24 30,36 30,50 50,38" fill="#7DD3FC" />
      <polygon points="30,12 20,6 30,18 40,6" fill="#E0F2FE" />
      <polygon points="30,12 40,6 44,14 30,18" fill="#0284C7" opacity="0.6" />
    </g>
    <defs>
      <filter id="box-shadow" x="6" y="4" width="48" height="50" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0284c7" floodOpacity="0.25" />
      </filter>
    </defs>
  </svg>
);

export const OrigamiCardIcon: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g filter="url(#card-shadow)">
      <polygon points="12,18 48,14 46,42 10,46" fill="#38BDF8" />
      <polygon points="14,18 48,14 46,24 12,28" fill="#0284C7" />
      <polygon points="10,28 46,24 45,34 9,38" fill="#BAE6FD" />
      <polygon points="9,38 45,34 44,42 8,46" fill="#FFFFFF" />
      <rect x="14" y="22" width="10" height="6" rx="1" fill="#FEF08A" />
    </g>
    <defs>
      <filter id="card-shadow" x="4" y="10" width="50" height="42" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0284c7" floodOpacity="0.25" />
      </filter>
    </defs>
  </svg>
);

export const OrigamiPlaneIconSmall: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g filter="url(#small-plane-shadow)">
      <polygon points="10,34 52,14 34,48 28,38" fill="#FFFFFF" />
      <polygon points="52,14 34,48 28,38" fill="#7DD3FC" />
      <polygon points="28,38 22,44 26,42" fill="#0284C7" />
      <polygon points="10,34 52,14 28,38" fill="#BAE6FD" />
    </g>
    <defs>
      <filter id="small-plane-shadow" x="6" y="10" width="48" height="42" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0284c7" floodOpacity="0.3" />
      </filter>
    </defs>
  </svg>
);
