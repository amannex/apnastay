import React from 'react';

interface CityIllustrationProps {
  className?: string;
}

/**
 * 1. GURUGRAM (Outlined line-art: Cyber City, Angular Corporate Towers & Spire)
 */
export function GurugramIllustration({ className = 'w-full h-full' }: CityIllustrationProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Distant background building outlines */}
      <rect
        x="13"
        y="35"
        width="11"
        height="33"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.4"
      />
      <line x1="16.5" y1="41" x2="16.5" y2="64" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="1.5 2" />
      <line x1="20.5" y1="41" x2="20.5" y2="64" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="1.5 2" />

      <rect
        x="57"
        y="32"
        width="11"
        height="36"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.4"
      />
      <line x1="60.5" y1="38" x2="60.5" y2="64" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="1.5 2" />
      <line x1="64.5" y1="38" x2="64.5" y2="64" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="1.5 2" />

      {/* Left Angular Cyber Tower */}
      <path
        d="M21 68V34L32 28V68"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Diagonal mullion lines */}
      <line x1="21" y1="38" x2="32" y2="45" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
      <line x1="21" y1="48" x2="32" y2="55" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
      <line x1="21" y1="58" x2="32" y2="65" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
      <line x1="32" y1="38" x2="21" y2="45" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
      <line x1="32" y1="48" x2="21" y2="55" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
      <line x1="32" y1="58" x2="21" y2="65" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />

      {/* Center Main Skyscraper */}
      <path
        d="M33 68V23C33 21 35 19.5 37 18L49 14C51 13.5 53 15 53 17V68"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {/* Antenna / Beacon */}
      <line x1="43" y1="16" x2="43" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="43" cy="7" r="1.5" fill="#E1224D" />

      {/* Main Tower Vertical Mullions */}
      <line x1="37" y1="23" x2="37" y2="68" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <line x1="41" y1="21" x2="41" y2="68" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <line x1="45" y1="19" x2="45" y2="68" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <line x1="49" y1="18" x2="49" y2="68" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />

      {/* Horizontal Floor Accents */}
      <line x1="33" y1="32" x2="53" y2="28" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.6" />
      <line x1="33" y1="42" x2="53" y2="38" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.6" />
      <line x1="33" y1="52" x2="53" y2="48" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.6" />
      <line x1="33" y1="61" x2="53" y2="57" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.6" />

      {/* Right Modern Tower */}
      <path
        d="M53 68V29L64 35V68"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <line x1="57" y1="35" x2="57" y2="68" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
      <line x1="60.5" y1="37" x2="60.5" y2="68" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />

      {/* Skybridge */}
      <rect x="29.5" y="44" width="5" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.1" fill="white" />

      {/* Base ground line */}
      <line x1="10" y1="68" x2="70" y2="68" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 2. GHAZIABAD (Outlined line-art: Gateway Arch, Clock Tower Dome & Elevated Metro Line)
 */
export function GhaziabadIllustration({ className = 'w-full h-full' }: CityIllustrationProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background Residential Buildings */}
      <rect
        x="13"
        y="36"
        width="12"
        height="32"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.4"
      />
      <circle cx="16.5" cy="42" r="0.8" fill="currentColor" opacity="0.4" />
      <circle cx="21" cy="42" r="0.8" fill="currentColor" opacity="0.4" />
      <circle cx="16.5" cy="48" r="0.8" fill="currentColor" opacity="0.4" />
      <circle cx="21" cy="48" r="0.8" fill="currentColor" opacity="0.4" />

      <rect
        x="55"
        y="35"
        width="12"
        height="33"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.4"
      />
      <circle cx="58.5" cy="41" r="0.8" fill="currentColor" opacity="0.4" />
      <circle cx="63" cy="41" r="0.8" fill="currentColor" opacity="0.4" />
      <circle cx="58.5" cy="47" r="0.8" fill="currentColor" opacity="0.4" />
      <circle cx="63" cy="47" r="0.8" fill="currentColor" opacity="0.4" />

      {/* Central Gateway Arch & Clock Tower */}
      {/* Finial / Dome */}
      <line x1="40" y1="12" x2="40" y2="16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="40" cy="11" r="1.3" fill="#E1224D" />
      <path
        d="M35 22C35 17 45 17 45 22H35Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Clock Tower Box */}
      <rect x="33" y="22" width="14" height="15" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="40" cy="28.5" r="3.2" stroke="currentColor" strokeWidth="1" />
      {/* Clock Hands */}
      <line x1="40" y1="28.5" x2="40" y2="26.8" stroke="#E1224D" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="40" y1="28.5" x2="41.5" y2="28.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />

      {/* Cornice */}
      <rect x="31" y="37" width="18" height="2.5" rx="0.5" stroke="currentColor" strokeWidth="1.3" />

      {/* Grand Entry Arch Base */}
      <path
        d="M26 68V40H54V68"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {/* Central Arch Portal Opening */}
      <path
        d="M33 68V51C33 46.5 47 46.5 47 51V68"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {/* Recessed Inner Arch Depth Line */}
      <path
        d="M35.5 68V52C35.5 48.5 44.5 48.5 44.5 52V68"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.55"
      />

      {/* Arch Pier vertical lines */}
      <line x1="29.5" y1="42" x2="29.5" y2="68" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <line x1="50.5" y1="42" x2="50.5" y2="68" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />

      {/* Elevated Metro Rail Viaduct (Ghaziabad Rapid Transit) */}
      <path
        d="M10 60C25 58.5 55 58.5 70 60"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line x1="10" y1="62" x2="70" y2="62" stroke="#E1224D" strokeWidth="0.8" strokeOpacity="0.7" />
      {/* Metro Support Pillars */}
      <line x1="19" y1="62" x2="19" y2="68" stroke="currentColor" strokeWidth="1.3" />
      <line x1="61" y1="62" x2="61" y2="68" stroke="currentColor" strokeWidth="1.3" />

      {/* Base ground line */}
      <line x1="10" y1="68" x2="70" y2="68" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 3. NOIDA (Outlined line-art: Expressway Towers & Cable-Stayed Bridge)
 */
export function NoidaIllustration({ className = 'w-full h-full' }: CityIllustrationProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Distant background corporate tower */}
      <rect
        x="58"
        y="30"
        width="10"
        height="38"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.4"
      />
      <line x1="63" y1="34" x2="63" y2="64" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="1.5 2" />

      {/* Left Tower of Noida Twin Towers */}
      <path
        d="M17 68V26C17 23.5 19.5 22 22 22H27C29.5 22 31 23.5 31 26V68"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {/* Tower Spire */}
      <line x1="24" y1="22" x2="24" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="11" r="1.5" fill="#E1224D" />

      {/* Window mullions left tower */}
      <line x1="24" y1="25" x2="24" y2="68" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <line x1="17" y1="33" x2="31" y2="33" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <line x1="17" y1="42" x2="31" y2="42" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <line x1="17" y1="51" x2="31" y2="51" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <line x1="17" y1="60" x2="31" y2="60" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />

      {/* Right Twin Tower */}
      <path
        d="M33 68V31C33 29 35 27.5 37 27.5H42C44 27.5 45.5 29 45.5 31V68"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <line x1="39.25" y1="30" x2="39.25" y2="68" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <line x1="33" y1="39" x2="45.5" y2="39" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <line x1="33" y1="48" x2="45.5" y2="48" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <line x1="33" y1="57" x2="45.5" y2="57" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />

      {/* Connecting Skyway bridge */}
      <rect x="30" y="44" width="4" height="2.5" stroke="currentColor" strokeWidth="1" fill="white" />

      {/* Cable-Stayed Expressway Bridge Pylon (Noida Signature Landmark) */}
      <path
        d="M50 68L55 38C55.5 36.5 57 36.5 57.5 38L62 68"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="56.25" cy="37" r="1.3" fill="#E1224D" />

      {/* Radiating stay cables */}
      <line x1="56.25" y1="41" x2="44" y2="64" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" />
      <line x1="56.25" y1="45" x2="47" y2="64" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="56.25" y1="41" x2="68" y2="64" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" />
      <line x1="56.25" y1="45" x2="65" y2="64" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" />

      {/* Expressway Deck */}
      <line x1="10" y1="64" x2="70" y2="64" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="14" y1="64" x2="66" y2="64" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" strokeOpacity="0.7" />

      {/* Trees / Green Corridor silhouette */}
      <path
        d="M13 68C13 65.5 15 65.5 16 68"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M67 68C67 65.5 69 65.5 70 68"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Base ground line */}
      <line x1="10" y1="68" x2="70" y2="68" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 4. DELHI (Outlined line-art: India Gate Architectural Monument)
 */
export function DelhiIllustration({ className = 'w-full h-full' }: CityIllustrationProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Subtle Birds soaring in the sky */}
      <path
        d="M20 22C21.5 20.5 23 22 24.5 21C23.5 22.5 22 22 20 22Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />
      <path
        d="M59 18C60.5 16.5 62 18 63.5 17C62.5 18.5 61 18 59 18Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />

      {/* Top Urn / Flame of India Gate */}
      <path
        d="M38.5 17.5C38.5 15.5 40 14 40 14C40 14 41.5 15.5 41.5 17.5H38.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <ellipse cx="40" cy="18" rx="3.5" ry="1.2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="40" cy="15.5" r="1.2" fill="#E1224D" />

      {/* Stepped Upper Attic Tier */}
      <rect x="29" y="19" width="22" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="27" y="24" width="26" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.4" />

      {/* Main Entablature / Architrave */}
      <rect x="23" y="27" width="34" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="25" y1="29" x2="55" y2="29" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.6" />

      {/* Main India Gate Arch Structure */}
      {/* Outer Outline */}
      <path
        d="M24 68V31H56V68"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {/* Central Arch Opening */}
      <path
        d="M33 68V48C33 42.5 47 42.5 47 48V68"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {/* Recessed Inner Arch Line (Depth Effect) */}
      <path
        d="M35.5 68V49C35.5 45 44.5 45 44.5 49V68"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeOpacity="0.55"
      />

      {/* Amar Jawan Jyoti Base / Eternal Flame pedestal */}
      <rect x="38.5" y="63" width="3" height="4" rx="0.5" stroke="currentColor" strokeWidth="1" />
      <circle cx="40" cy="62" r="1" fill="#E1224D" />

      {/* Classical Pilaster Vertical Grooves */}
      <line x1="26" y1="33" x2="26" y2="65" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <line x1="29" y1="33" x2="29" y2="65" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <line x1="51" y1="33" x2="51" y2="65" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <line x1="54" y1="33" x2="54" y2="65" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />

      {/* Stepped Plinth Base */}
      <rect x="21" y="65" width="38" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.5" />

      {/* Ground line */}
      <line x1="10" y1="68" x2="70" y2="68" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 5. MORE CITIES (Outlined line-art: Multi-City Skyline Panorama & Explore Compass/Plus)
 */
export function MoreCitiesIllustration({ className = 'w-full h-full' }: CityIllustrationProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Plus / Discover Badge in top right */}
      <circle cx="58" cy="22" r="7" stroke="currentColor" strokeWidth="1.4" strokeDasharray="1.5 2" strokeOpacity="0.6" />
      <line x1="58" y1="18.5" x2="58" y2="25.5" stroke="#E1224D" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="54.5" y1="22" x2="61.5" y2="22" stroke="#E1224D" strokeWidth="1.6" strokeLinecap="round" />

      {/* Background Skyline 1 (Tiered Highrise) */}
      <path
        d="M13 68V42H22V68"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.4"
      />
      <line x1="17.5" y1="45" x2="17.5" y2="64" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="1.5 2" />

      {/* Background Skyline 2 (Classical Arch / Monument Dome) */}
      <path
        d="M24 68V45C24 40 33 40 33 45V68"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeOpacity="0.5"
      />
      <line x1="28.5" y1="40" x2="28.5" y2="35" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5" />

      {/* Center Skyline Tower (Modern Slanted Roof) */}
      <path
        d="M33 68V28L44 23V68"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <line x1="38.5" y1="27" x2="38.5" y2="68" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <line x1="33" y1="36" x2="44" y2="32" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <line x1="33" y1="46" x2="44" y2="42" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <line x1="33" y1="56" x2="44" y2="52" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />

      {/* Right Skyline Building */}
      <path
        d="M44 68V34H54V68"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <line x1="49" y1="38" x2="49" y2="68" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
      <line x1="44" y1="44" x2="54" y2="44" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
      <line x1="44" y1="54" x2="54" y2="54" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />

      {/* Far Right Stepped Tower */}
      <path
        d="M54 68V46H64V68"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeOpacity="0.45"
      />
      <line x1="59" y1="49" x2="59" y2="64" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="1.5 2" />

      {/* Panoramic Connecting Horizon Line */}
      <line x1="10" y1="68" x2="70" y2="68" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />

      {/* Subtle Network / Exploration dots */}
      <circle cx="17.5" cy="36" r="1.2" fill="#E1224D" opacity="0.8" />
      <circle cx="28.5" cy="31" r="1.2" fill="#E1224D" opacity="0.8" />
      <line x1="18.5" y1="36" x2="27.5" y2="31.5" stroke="#E1224D" strokeWidth="0.8" strokeDasharray="1.5 1.5" opacity="0.5" />
    </svg>
  );
}
