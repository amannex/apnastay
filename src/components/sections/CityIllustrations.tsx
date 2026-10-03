import React from 'react';

interface CityIllustrationProps {
  className?: string;
}

/**
 * 1. GURUGRAM (Cyber City, Modern Commercial Towers & Tech Skyline)
 */
export function GurugramIllustration({ className = 'w-full h-full' }: CityIllustrationProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="gurugram-clip">
          <circle cx="50" cy="50" r="46" />
        </clipPath>
        <linearGradient id="ggn-sky" x1="50" y1="4" x2="50" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8FAFC" />
          <stop offset="0.65" stopColor="#EEF2F6" />
          <stop offset="1" stopColor="#FFE4EA" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="ggn-glow" x1="50" y1="20" x2="50" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E1224D" stopOpacity="0.12" />
          <stop offset="1" stopColor="#E1224D" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ggn-glass" x1="45" y1="25" x2="65" y2="85" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" stopOpacity="0.25" />
          <stop offset="1" stopColor="#0284C7" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <g clipPath="url(#gurugram-clip)">
        {/* Soft Sky Background */}
        <circle cx="50" cy="50" r="46" fill="url(#ggn-sky)" />
        <circle cx="50" cy="40" r="32" fill="url(#ggn-glow)" />

        {/* Distant background high-rises */}
        <rect x="18" y="44" width="12" height="38" rx="1.5" fill="#CBD5E1" opacity="0.65" />
        <rect x="70" y="40" width="14" height="42" rx="1.5" fill="#CBD5E1" opacity="0.65" />
        <line x1="22" y1="48" x2="22" y2="78" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
        <line x1="77" y1="46" x2="77" y2="78" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />

        {/* Left Cyber City Angular Tower */}
        <path
          d="M26 82V38L38 32V82H26Z"
          fill="#334155"
        />
        {/* Angular Glass Facade */}
        <path
          d="M28 40L36 35V80H28V40Z"
          fill="url(#ggn-glass)"
        />
        {/* Diagrid glass mullions */}
        <line x1="28" y1="44" x2="36" y2="52" stroke="#64748B" strokeWidth="0.8" opacity="0.7" />
        <line x1="28" y1="56" x2="36" y2="64" stroke="#64748B" strokeWidth="0.8" opacity="0.7" />
        <line x1="28" y1="68" x2="36" y2="76" stroke="#64748B" strokeWidth="0.8" opacity="0.7" />
        <line x1="36" y1="44" x2="28" y2="52" stroke="#64748B" strokeWidth="0.8" opacity="0.7" />
        <line x1="36" y1="56" x2="28" y2="64" stroke="#64748B" strokeWidth="0.8" opacity="0.7" />
        <line x1="36" y1="68" x2="28" y2="76" stroke="#64748B" strokeWidth="0.8" opacity="0.7" />

        {/* Center Main Iconic Skyscraper (Cyber Hub / Horizon Tower style) */}
        <path
          d="M40 82V26C40 23.5 42 22 45 20L58 16C60 15 62 16.5 62 19V82H40Z"
          fill="#1E293B"
        />
        {/* Antenna / Beacon */}
        <line x1="51" y1="18" x2="51" y2="10" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="51" cy="9" r="1.8" fill="#E1224D" />

        {/* Main Tower Glass Reflective Paneling */}
        <path
          d="M44 26L58 21V80H44V26Z"
          fill="url(#ggn-glass)"
        />
        {/* Vertical curtain wall fins */}
        <line x1="47" y1="28" x2="47" y2="80" stroke="#94A3B8" strokeWidth="0.8" opacity="0.6" />
        <line x1="51" y1="26" x2="51" y2="80" stroke="#94A3B8" strokeWidth="0.8" opacity="0.6" />
        <line x1="55" y1="24" x2="55" y2="80" stroke="#94A3B8" strokeWidth="0.8" opacity="0.6" />

        {/* Horizontal floor dividers */}
        <line x1="44" y1="36" x2="58" y2="33" stroke="#475569" strokeWidth="0.75" />
        <line x1="44" y1="46" x2="58" y2="43" stroke="#475569" strokeWidth="0.75" />
        <line x1="44" y1="56" x2="58" y2="53" stroke="#475569" strokeWidth="0.75" />
        <line x1="44" y1="66" x2="58" y2="63" stroke="#475569" strokeWidth="0.75" />
        <line x1="44" y1="74" x2="58" y2="71" stroke="#475569" strokeWidth="0.75" />

        {/* Right Tiered Commercial Complex */}
        <path
          d="M62 82V34L74 40V82H62Z"
          fill="#334155"
        />
        <rect x="65" y="44" width="6" height="34" fill="url(#ggn-glass)" />
        <line x1="68" y1="46" x2="68" y2="78" stroke="#94A3B8" strokeWidth="0.8" opacity="0.6" />

        {/* Skybridge connecting towers */}
        <rect x="36" y="52" width="6" height="4" rx="0.5" fill="#475569" />
        <line x1="36" y1="54" x2="42" y2="54" stroke="#38BDF8" strokeWidth="0.8" opacity="0.8" />

        {/* Ground Podium & Modern Avenue line */}
        <rect x="14" y="81" width="72" height="4" rx="2" fill="#0F172A" />
        <line x1="20" y1="83" x2="80" y2="83" stroke="#E1224D" strokeWidth="1" opacity="0.6" />
      </g>

      {/* Outer Subtle Frame */}
      <circle cx="50" cy="50" r="46" stroke="#E2E8F0" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * 2. GHAZIABAD (Gateway Arch, Clock Tower Dome & Rapid Metro Corridor)
 */
export function GhaziabadIllustration({ className = 'w-full h-full' }: CityIllustrationProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="ghaziabad-clip">
          <circle cx="50" cy="50" r="46" />
        </clipPath>
        <linearGradient id="gzb-sky" x1="50" y1="4" x2="50" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDFBF7" />
          <stop offset="0.65" stopColor="#F7EFE5" />
          <stop offset="1" stopColor="#FFE4EA" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="gzb-glow" x1="50" y1="20" x2="50" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E1224D" stopOpacity="0.12" />
          <stop offset="1" stopColor="#E1224D" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g clipPath="url(#ghaziabad-clip)">
        {/* Soft Warm Sky Background */}
        <circle cx="50" cy="50" r="46" fill="url(#gzb-sky)" />
        <circle cx="50" cy="38" r="28" fill="url(#gzb-glow)" />

        {/* Background Residential Buildings */}
        <rect x="16" y="44" width="14" height="38" rx="1" fill="#CBD5E1" opacity="0.6" />
        <rect x="70" y="42" width="14" height="40" rx="1" fill="#CBD5E1" opacity="0.6" />
        {/* Window dots */}
        <circle cx="21" cy="50" r="1" fill="#94A3B8" />
        <circle cx="25" cy="50" r="1" fill="#94A3B8" />
        <circle cx="21" cy="58" r="1" fill="#94A3B8" />
        <circle cx="25" cy="58" r="1" fill="#94A3B8" />
        <circle cx="75" cy="48" r="1" fill="#94A3B8" />
        <circle cx="79" cy="48" r="1" fill="#94A3B8" />
        <circle cx="75" cy="56" r="1" fill="#94A3B8" />
        <circle cx="79" cy="56" r="1" fill="#94A3B8" />

        {/* Central Gateway Arch & Tower Structure */}
        {/* Finial / Dome */}
        <path d="M50 14L50 19" stroke="#E1224D" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="50" cy="14" r="1.5" fill="#E1224D" />
        <path d="M44 26C44 20 56 20 56 26H44Z" fill="#334155" />
        
        {/* Clock Tower Section */}
        <rect x="42" y="26" width="16" height="18" fill="#1E293B" />
        <circle cx="50" cy="33" r="4" fill="#F8FAFC" />
        <circle cx="50" cy="33" r="3.2" stroke="#1E293B" strokeWidth="0.6" fill="#F1F5F9" />
        {/* Clock hands */}
        <line x1="50" y1="33" x2="50" y2="31" stroke="#E1224D" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="50" y1="33" x2="51.8" y2="33" stroke="#1E293B" strokeWidth="0.8" strokeLinecap="round" />

        {/* Tower Cornice */}
        <rect x="39" y="44" width="22" height="3" rx="0.5" fill="#475569" />

        {/* Grand Entry Arch Base */}
        <path
          d="M34 82V47H66V82H58V62C58 56 42 56 42 62V82H34Z"
          fill="#1E293B"
        />

        {/* Recessed Inner Arch Shadow */}
        <path
          d="M44 82V63C44 59 56 59 56 63V82H54V64C54 61 46 61 46 64V82H44Z"
          fill="#0F172A"
          opacity="0.8"
        />

        {/* Left & Right Flanking Arch Pillars */}
        <rect x="30" y="52" width="6" height="30" fill="#334155" />
        <rect x="64" y="52" width="6" height="30" fill="#334155" />
        <line x1="33" y1="54" x2="33" y2="80" stroke="#64748B" strokeWidth="0.8" />
        <line x1="67" y1="54" x2="67" y2="80" stroke="#64748B" strokeWidth="0.8" />

        {/* Elevated Metro Rail Viaduct (Symbol of Ghaziabad Rapid Transit) */}
        <path
          d="M12 73C28 71 72 71 88 73"
          stroke="#475569"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Track highlight line */}
        <path
          d="M14 72C30 70 70 70 86 72"
          stroke="#E1224D"
          strokeWidth="1.2"
        />
        {/* Metro support pillars */}
        <rect x="22" y="74" width="3" height="8" rx="0.5" fill="#64748B" />
        <rect x="75" y="74" width="3" height="8" rx="0.5" fill="#64748B" />

        {/* Ground Avenue Baseline */}
        <rect x="14" y="81" width="72" height="4" rx="2" fill="#0F172A" />
      </g>

      {/* Outer Subtle Frame */}
      <circle cx="50" cy="50" r="46" stroke="#E2E8F0" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * 3. NOIDA (Expressway Towers, Cable-Stayed Architectural Bridge & Green Corridor)
 */
export function NoidaIllustration({ className = 'w-full h-full' }: CityIllustrationProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="noida-clip">
          <circle cx="50" cy="50" r="46" />
        </clipPath>
        <linearGradient id="noida-sky" x1="50" y1="4" x2="50" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F6FBF9" />
          <stop offset="0.65" stopColor="#E9F5F1" />
          <stop offset="1" stopColor="#FFE4EA" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="noida-glow" x1="50" y1="20" x2="50" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E1224D" stopOpacity="0.12" />
          <stop offset="1" stopColor="#E1224D" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="noida-glass" x1="30" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2DD4BF" stopOpacity="0.25" />
          <stop offset="1" stopColor="#0F766E" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <g clipPath="url(#noida-clip)">
        {/* Soft Sky Background */}
        <circle cx="50" cy="50" r="46" fill="url(#noida-sky)" />
        <circle cx="50" cy="38" r="30" fill="url(#noida-glow)" />

        {/* Distant Corporate Skyscrapers */}
        <rect x="68" y="38" width="14" height="44" rx="1.5" fill="#CBD5E1" opacity="0.65" />
        <line x1="75" y1="42" x2="75" y2="78" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />

        {/* Noida Iconic Twin Towers / Expressway Tower (Left) */}
        <path
          d="M24 82V32C24 29 27 27 30 27H36C39 27 41 29 41 32V82H24Z"
          fill="#1E293B"
        />
        {/* Spire */}
        <line x1="32.5" y1="27" x2="32.5" y2="15" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="32.5" cy="14" r="1.6" fill="#E1224D" />

        {/* Left Tower Glass Facade */}
        <rect x="27" y="31" width="11" height="49" rx="1" fill="url(#noida-glass)" />
        <line x1="32.5" y1="31" x2="32.5" y2="80" stroke="#94A3B8" strokeWidth="0.8" opacity="0.7" />
        <line x1="27" y1="42" x2="38" y2="42" stroke="#475569" strokeWidth="0.7" />
        <line x1="27" y1="52" x2="38" y2="52" stroke="#475569" strokeWidth="0.7" />
        <line x1="27" y1="62" x2="38" y2="62" stroke="#475569" strokeWidth="0.7" />
        <line x1="27" y1="72" x2="38" y2="72" stroke="#475569" strokeWidth="0.7" />

        {/* Right Twin Tower (Connected Architecture) */}
        <path
          d="M43 82V38C43 35 46 33 49 33H54C57 33 59 35 59 38V82H43Z"
          fill="#334155"
        />
        <rect x="46" y="37" width="10" height="43" rx="1" fill="url(#noida-glass)" />
        <line x1="51" y1="37" x2="51" y2="80" stroke="#94A3B8" strokeWidth="0.8" opacity="0.7" />
        <line x1="46" y1="46" x2="56" y2="46" stroke="#475569" strokeWidth="0.7" />
        <line x1="46" y1="56" x2="56" y2="56" stroke="#475569" strokeWidth="0.7" />
        <line x1="46" y1="66" x2="56" y2="66" stroke="#475569" strokeWidth="0.7" />

        {/* Connecting Skybridge */}
        <rect x="40" y="48" width="4" height="3" fill="#64748B" />

        {/* Cable-Stayed Expressway Bridge Silhouette (Foreground Infrastructure) */}
        {/* Bridge Pylon / A-Frame Tower */}
        <path
          d="M62 82L67 48C67.5 46 69.5 46 70 48L75 82"
          stroke="#1E293B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="68.5" cy="47" r="1.5" fill="#E1224D" />

        {/* Stay cables radiating down */}
        <line x1="68.5" y1="52" x2="55" y2="76" stroke="#E1224D" strokeWidth="0.9" opacity="0.75" />
        <line x1="68.5" y1="56" x2="58" y2="76" stroke="#94A3B8" strokeWidth="0.75" opacity="0.7" />
        <line x1="68.5" y1="52" x2="82" y2="76" stroke="#E1224D" strokeWidth="0.9" opacity="0.75" />
        <line x1="68.5" y1="56" x2="79" y2="76" stroke="#94A3B8" strokeWidth="0.75" opacity="0.7" />

        {/* Expressway Roadway Deck */}
        <path
          d="M12 77H88"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line x1="16" y1="77" x2="84" y2="77" stroke="#F1F5F9" strokeWidth="0.8" strokeDasharray="3 3" />

        {/* Green Belt & Avenue Trees (Noida Green City Identity) */}
        <circle cx="18" cy="80" r="3.5" fill="#10B981" opacity="0.85" />
        <circle cx="23" cy="80.5" r="2.8" fill="#059669" opacity="0.8" />
        <circle cx="82" cy="80" r="3" fill="#10B981" opacity="0.85" />

        {/* Ground Baseline */}
        <rect x="14" y="81" width="72" height="4" rx="2" fill="#0F172A" />
      </g>

      {/* Outer Subtle Frame */}
      <circle cx="50" cy="50" r="46" stroke="#E2E8F0" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * 4. DELHI (India Gate Architectural Monument & Sunburst)
 */
export function DelhiIllustration({ className = 'w-full h-full' }: CityIllustrationProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="delhi-clip">
          <circle cx="50" cy="50" r="46" />
        </clipPath>
        <linearGradient id="delhi-sky" x1="50" y1="4" x2="50" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF7ED" />
          <stop offset="0.6" stopColor="#FEE2E2" />
          <stop offset="1" stopColor="#FFE4EA" />
        </linearGradient>
        <linearGradient id="delhi-sun" x1="50" y1="16" x2="50" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E1224D" stopOpacity="0.2" />
          <stop offset="1" stopColor="#F97316" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      <g clipPath="url(#delhi-clip)">
        {/* Soft Heritage Dawn Sky */}
        <circle cx="50" cy="50" r="46" fill="url(#delhi-sky)" />

        {/* Soft Radiant Sun behind India Gate */}
        <circle cx="50" cy="38" r="24" fill="url(#delhi-sun)" />

        {/* Flying swallows in the sky */}
        <path d="M26 24C28 22 30 24 32 23C30 25 28 24 26 24Z" fill="#64748B" opacity="0.6" />
        <path d="M70 20C71.5 18.5 73 20 74.5 19C73 20.5 71.5 19.5 70 20Z" fill="#64748B" opacity="0.6" />
        <path d="M64 27C65.5 25.5 67 27 68.5 26C67 27.5 65.5 26.5 64 27Z" fill="#64748B" opacity="0.5" />

        {/* Stepped Monument Cornice / Top Pavilion */}
        {/* Top Urn / Ceremonial Flame Bowl */}
        <ellipse cx="50" cy="22" rx="4.5" ry="1.5" fill="#E1224D" />
        <path d="M47.5 22C47.5 19.5 50 17 50 17C50 17 52.5 19.5 52.5 22H47.5Z" fill="#E1224D" />

        {/* Top Attic Tier (Upper Inscription Level) */}
        <rect x="36" y="24" width="28" height="6" rx="0.5" fill="#334155" />
        <rect x="34" y="30" width="32" height="3" rx="0.5" fill="#475569" />

        {/* Main Entablature / Molding */}
        <rect x="28" y="33" width="44" height="4.5" rx="0.5" fill="#1E293B" />
        <line x1="30" y1="35.5" x2="70" y2="35.5" stroke="#CBD5E1" strokeWidth="0.8" opacity="0.7" />

        {/* Main India Gate Arch Structure */}
        {/* Left & Right Pylons */}
        <path
          d="M29 82V37.5H71V82H59V56C59 47 41 47 41 56V82H29Z"
          fill="#1E293B"
        />

        {/* Deep Recessed Central Archway */}
        <path
          d="M43 82V57C43 49.5 57 49.5 57 57V82H54V58C54 53 46 53 46 58V82H43Z"
          fill="#0F172A"
        />

        {/* Inner Sky / Horizon seen through the archway */}
        <path
          d="M46 82V58C46 53 54 53 54 58V82H46Z"
          fill="#FDE68A"
          opacity="0.3"
        />

        {/* Amar Jawan Jyoti / Flame pedestal base silhouette */}
        <rect x="48" y="77" width="4" height="5" rx="0.5" fill="#0F172A" />
        <circle cx="50" cy="76" r="1.2" fill="#E1224D" />

        {/* Pilaster details on left and right piers */}
        <rect x="31" y="40" width="3.5" height="40" fill="#334155" />
        <rect x="65.5" y="40" width="3.5" height="40" fill="#334155" />

        {/* Stepped Plinth / Base Foundation */}
        <rect x="25" y="80" width="50" height="2.5" rx="0.5" fill="#475569" />
        <rect x="21" y="82" width="58" height="2" rx="0.5" fill="#334155" />

        {/* Rajpath / Kartavya Path Avenue Lawn */}
        <line x1="12" y1="83" x2="88" y2="83" stroke="#0F172A" strokeWidth="1.5" />
      </g>

      {/* Outer Subtle Frame */}
      <circle cx="50" cy="50" r="46" stroke="#E2E8F0" strokeWidth="1.5" />
    </svg>
  );
}
