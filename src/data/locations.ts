// ============================================================================
// APNASTAY LOCATION HIERARCHY — COUNTRY -> CITY -> LOCALITY -> COMMUNITY
// ============================================================================

export interface Locality {
  id: string;
  slug: string;
  name: string;
  citySlug: string;
  tagline: string;
  description: string;
  popularTags: string[];
  avgRent: string;
  active: boolean;
  transitHighlight: string;
}

export interface LocalCommunity {
  name: string;
  tagline: string;
  description: string;
  memberCount: number;
  badge: string;
  channelType: 'whatsapp' | 'community' | 'telegram';
  ctaText: string;
}

export interface CityHierarchy {
  id: string;
  name: string;
  slug: string;
  country: string; // 'India'
  tagline: string;
  description: string;
  active: boolean; // active vs validation stage
  stage: 'validation' | 'active' | 'expanding';
  stats: {
    localitiesCount: number;
    avgRentDisplay: string;
    livabilityScore: number;
    verifiedWaitlistCount: number;
  };
  localities: Locality[];
  community: LocalCommunity;
  highlights: string[];
}

export const CITIES_HIERARCHY: Record<string, CityHierarchy> = {
  gurugram: {
    id: 'gurugram',
    name: 'Gurugram',
    slug: 'gurugram',
    country: 'India',
    tagline: 'Millennium City & Premier IT Tech Hub of Delhi NCR',
    description: 'Home to DLF Cyber City, global Fortune 500 headquarters, and modern gated co-living communities with rapid metro connectivity.',
    active: true,
    stage: 'validation',
    stats: {
      localitiesCount: 4,
      avgRentDisplay: '₹18,500/mo',
      livabilityScore: 94,
      verifiedWaitlistCount: 680,
    },
    highlights: [
      'Zero-Brokerage Direct Owner Homes',
      'Rapid Metro & Cyber Hub Connectivity',
      'Soundproofed Acoustic Living for WFH',
      'Verified Gated Security Standards',
    ],
    community: {
      name: 'Gurugram Tech & Co-Living Circle',
      tagline: 'Direct connection between tech professionals & genuine owners',
      description: 'Connect with over 680+ verified software engineers, corporate executives, and trusted property owners across Gurugram.',
      memberCount: 680,
      badge: 'Active Tech Group',
      channelType: 'whatsapp',
      ctaText: 'Join Gurugram Community',
    },
    localities: [
      {
        id: 'ggn-dlf-phase-3',
        slug: 'dlf-phase-3',
        name: 'DLF Phase 3',
        citySlug: 'gurugram',
        tagline: 'Cyber Hub Adjacent & Rapid Metro Hub',
        description: 'Prime choice for tech executives walking distance to Cyber City and Moulsari Avenue Rapid Metro.',
        popularTags: ['Walking to Cyber City', 'Rapid Metro S-line', 'Co-Living & 1BHK'],
        avgRent: '₹18,000 - ₹34,000',
        active: true,
        transitHighlight: '2 min to Moulsari Ave Metro',
      },
      {
        id: 'ggn-cyber-city',
        slug: 'cyber-city',
        name: 'Cyber City & DLF Phase 2',
        citySlug: 'gurugram',
        tagline: 'Corporate Core & Premium Executive Flats',
        description: 'High-end apartments and serviced residences adjacent to DLF Horizon, Cyber Hub, and NH-48.',
        popularTags: ['Fortune 500 Proximity', 'Fine Dining', 'Premium 2-3BHK'],
        avgRent: '₹28,000 - ₹55,000',
        active: true,
        transitHighlight: 'Direct Cyber City Walkway',
      },
      {
        id: 'ggn-sector-56',
        slug: 'sector-56',
        name: 'Sector 56 & Golf Course Ext.',
        citySlug: 'gurugram',
        tagline: 'Serene Green Living & Sector 55-56 Metro',
        description: 'Peaceful residential sectors with wide cycling paths, modern societies, and rapid metro terminal access.',
        popularTags: ['Golf Course Road', 'Family Friendly', 'Gated Societies'],
        avgRent: '₹22,000 - ₹42,000',
        active: true,
        transitHighlight: 'Sector 55-56 Metro Terminal',
      },
      {
        id: 'ggn-sohna-road',
        slug: 'sohna-road',
        name: 'Sohna Road & Subhash Chowk',
        citySlug: 'gurugram',
        tagline: 'Affordable Gated Townships & IT Corridors',
        description: 'Modern residential highrises near Vatika City and Subhash Chowk with dedicated shuttle routes.',
        popularTags: ['Affordable Rentals', 'Spacious Societies', 'Shopping Hubs'],
        avgRent: '₹15,000 - ₹28,000',
        active: true,
        transitHighlight: 'Subhash Chowk Expressway Link',
      },
    ],
  },

  ghaziabad: {
    id: 'ghaziabad',
    name: 'Ghaziabad',
    slug: 'ghaziabad',
    country: 'India',
    tagline: 'Gateway to East NCR with Direct Blue Line Metro Connectivity',
    description: 'Vibrant, established residential hub offering expansive apartments, rapid transit to Central Delhi, and warm community living.',
    active: true,
    stage: 'validation',
    stats: {
      localitiesCount: 4,
      avgRentDisplay: '₹14,200/mo',
      livabilityScore: 91,
      verifiedWaitlistCount: 520,
    },
    highlights: [
      'Direct Blue Line Metro to Connaught Place',
      '100% Brokerage-Free Direct Landlords',
      'Affordable High-Rise Family Apartments',
      'High-Speed JioFiber & Airtel Xstream',
    ],
    community: {
      name: 'Ghaziabad Verified Renters Club',
      tagline: 'Zero-brokerage living network across East NCR',
      description: 'Join 520+ verified tenants and homeowners sharing genuine rental openings in Indirapuram, Vaishali, and Vasundhara.',
      memberCount: 520,
      badge: 'Verified Resident Club',
      channelType: 'whatsapp',
      ctaText: 'Join Ghaziabad Community',
    },
    localities: [
      {
        id: 'gzb-indirapuram',
        slug: 'indirapuram',
        name: 'Indirapuram',
        citySlug: 'ghaziabad',
        tagline: 'Heart of Ghaziabad Living & Shipra Mall Hub',
        description: 'Flourishing township with top schools, hospitals, sprawling parks, and modern gated societies.',
        popularTags: ['Shipra Mall Hub', 'Family Societies', '1-3 BHK Flats'],
        avgRent: '₹14,000 - ₹28,000',
        active: true,
        transitHighlight: '10 min to Vaishali/Noida Sec 62 Metro',
      },
      {
        id: 'gzb-vaishali',
        slug: 'vaishali',
        name: 'Vaishali',
        citySlug: 'ghaziabad',
        tagline: 'Immediate Blue Line Metro & Commercial Hub',
        description: 'Prime location right at the border of East Delhi, featuring Vaishali Metro Station and Max Super Speciality Hospital.',
        popularTags: ['Blue Line Metro Walk', 'Healthcare Hub', 'Executive Stays'],
        avgRent: '₹16,000 - ₹32,000',
        active: true,
        transitHighlight: 'Walking to Vaishali Metro Station',
      },
      {
        id: 'gzb-vasundhara',
        slug: 'vasundhara',
        name: 'Vasundhara',
        citySlug: 'ghaziabad',
        tagline: 'Quiet Planned Sectors with Lush Greenery',
        description: 'Well-organized residential sectors with wide boulevards, local shopping plazas, and serene residential pace.',
        popularTags: ['Planned Sectors', 'Peaceful Living', 'Parks & Playgrounds'],
        avgRent: '₹12,000 - ₹24,000',
        active: true,
        transitHighlight: 'Quick access to Link Road & Delhi',
      },
      {
        id: 'gzb-raj-nagar-extension',
        slug: 'raj-nagar-extension',
        name: 'Raj Nagar Extension',
        citySlug: 'ghaziabad',
        tagline: 'Modern High-Rise Skyline on Elevated Highway',
        description: 'Newest development zone with high-amenity clubhouses, swimming pools, and Hindon Elevated Expressway connectivity.',
        popularTags: ['Gated Clubhouses', 'Elevated Highway Access', 'Budget Friendly'],
        avgRent: '₹10,000 - ₹20,000',
        active: true,
        transitHighlight: 'Direct Hindon Elevated Road Access',
      },
    ],
  },

  noida: {
    id: 'noida',
    name: 'Noida',
    slug: 'noida',
    country: 'India',
    tagline: 'High-Tech Planned City & Expressway Institutional Hub',
    description: 'Clean wide boulevards, green corporate tech parks, world-class metro networks, and serene gated high-rise towers.',
    active: true,
    stage: 'validation',
    stats: {
      localitiesCount: 4,
      avgRentDisplay: '₹16,800/mo',
      livabilityScore: 95,
      verifiedWaitlistCount: 740,
    },
    highlights: [
      'Aqua & Blue Line Dual Metro Corridors',
      'Modern High-Rise Societies with Full Power Backup',
      'Walking Distance to IT Tech Parks',
      'Zero Brokerage Owner Direct Connect',
    ],
    community: {
      name: 'Noida Expressway Professionals Group',
      tagline: 'Curated direct connections for tech & corporate residents',
      description: 'A network of 740+ verified techies, product managers, and verified flat owners across Sectors 62, 137, 76, and 18.',
      memberCount: 740,
      badge: 'Corporate Network',
      channelType: 'whatsapp',
      ctaText: 'Join Noida Community',
    },
    localities: [
      {
        id: 'noida-sector-62',
        slug: 'sector-62',
        name: 'Sector 62',
        citySlug: 'noida',
        tagline: 'IT Institutional Park & Electronic City Metro',
        description: 'Tech epicentre with major software campuses, engineering colleges, and Electronic City Metro terminal.',
        popularTags: ['Tech Park Hub', 'Electronic City Metro', 'Student & Bachelor Friendly'],
        avgRent: '₹12,000 - ₹26,000',
        active: true,
        transitHighlight: 'Sector 62 / Electronic City Metro',
      },
      {
        id: 'noida-sector-137',
        slug: 'sector-137',
        name: 'Sector 137 (Expressway)',
        citySlug: 'noida',
        tagline: 'Expressway Gated Highrises & Modern Amenities',
        description: 'Modern high-rise residential towers directly off the Noida-Greater Noida Expressway with an Aqua Line metro station.',
        popularTags: ['Aqua Line Metro', 'Full DG Backup', 'Clubhouse Living'],
        avgRent: '₹18,000 - ₹36,000',
        active: true,
        transitHighlight: 'Sector 137 Metro Station on premise',
      },
      {
        id: 'noida-sector-18',
        slug: 'sector-18',
        name: 'Sector 18 & Atta',
        citySlug: 'noida',
        tagline: 'Downtown Center, Mall of India & Blue Line',
        description: 'Vibrant city centre surrounded by DLF Mall of India, central offices, and Sector 18 Blue Line Metro.',
        popularTags: ['Downtown Living', 'Mall of India', 'High Footfall Core'],
        avgRent: '₹22,000 - ₹45,000',
        active: true,
        transitHighlight: 'Sector 18 Blue Line Metro',
      },
      {
        id: 'noida-sector-76',
        slug: 'sector-76',
        name: 'Sector 76 & 78',
        citySlug: 'noida',
        tagline: 'Family Residential Hub with Modern Highrises',
        description: 'Popular residential zone with established shopping complexes, gated security, and Sector 76 Metro connectivity.',
        popularTags: ['Gated Societies', 'Family Stays', 'Supermarkets & Parks'],
        avgRent: '₹16,000 - ₹30,000',
        active: true,
        transitHighlight: 'Sector 76 Metro Station',
      },
    ],
  },

  delhi: {
    id: 'delhi',
    name: 'Delhi',
    slug: 'delhi',
    country: 'India',
    tagline: 'Historic Capital & Cultural Metropolitan Heart of India',
    description: 'Timeless monuments blending with world-class Delhi Metro connectivity, bustling cafes, and lush heritage parks.',
    active: true,
    stage: 'validation',
    stats: {
      localitiesCount: 4,
      avgRentDisplay: '₹21,000/mo',
      livabilityScore: 92,
      verifiedWaitlistCount: 910,
    },
    highlights: [
      'Comprehensive Delhi Metro Network Coverage',
      'Historic & Cultural Corridor Neighbourhoods',
      'Direct Landlord Verification Without Middlemen',
      'Independent Builder Floors & Studios',
    ],
    community: {
      name: 'Delhi NCR Direct-Owner Collective',
      tagline: 'Bypassing aggressive middleman brokerage in the Capital',
      description: 'Join 910+ verified working professionals and genuine homeowners in South, Central, and North Delhi for 100% direct leasing.',
      memberCount: 910,
      badge: 'Premier Capital Hub',
      channelType: 'whatsapp',
      ctaText: 'Join Delhi Collective',
    },
    localities: [
      {
        id: 'delhi-saket',
        slug: 'saket',
        name: 'Saket',
        citySlug: 'delhi',
        tagline: 'South Delhi Premier Lifestyle & Yellow Line Hub',
        description: 'Upscale neighbourhood home to Select CITYWALK, Max Hospital, and fast Yellow Line access to Gurugram and Central Delhi.',
        popularTags: ['Select Citywalk', 'Yellow Line Metro', 'Independent Floors'],
        avgRent: '₹22,000 - ₹50,000',
        active: true,
        transitHighlight: 'Saket & Malviya Nagar Metro Stations',
      },
      {
        id: 'delhi-hauz-khas',
        slug: 'hauz-khas',
        name: 'Hauz Khas',
        citySlug: 'delhi',
        tagline: 'Creative Quarter, Heritage Lake & Enclave Stays',
        description: 'Serene residential enclaves bordering Hauz Khas Village, deer park, and top design/tech creative studios.',
        popularTags: ['Deer Park Views', 'Creative Enclave', 'Heritage Lake Walk'],
        avgRent: '₹25,000 - ₹60,000',
        active: true,
        transitHighlight: 'Hauz Khas Dual Interchange Metro',
      },
      {
        id: 'delhi-lajpat-nagar',
        slug: 'lajpat-nagar',
        name: 'Lajpat Nagar',
        citySlug: 'delhi',
        tagline: 'Central Delhi Connectivity & Dual Metro Lines',
        description: 'Unbeatable central connectivity with Pink and Violet line interchange stations and furnished independent builder floors.',
        popularTags: ['Central Location', 'Dual Metro Lines', 'Furnished Builder Floors'],
        avgRent: '₹18,000 - ₹38,000',
        active: true,
        transitHighlight: 'Lajpat Nagar Interchange Metro',
      },
      {
        id: 'delhi-rohini',
        slug: 'rohini',
        name: 'Rohini',
        citySlug: 'delhi',
        tagline: 'Planned Green Sectors & Red Line Connectivity',
        description: 'North Delhi planned sectors with wide avenues, peaceful family residential blocks, and abundant public gardens.',
        popularTags: ['Red Line Metro', 'Family Friendly', 'Affordable Builder Floors'],
        avgRent: '₹14,000 - ₹28,000',
        active: true,
        transitHighlight: 'Rohini West / Sector 18 Metro',
      },
    ],
  },

  indore: {
    id: 'indore',
    name: 'Indore',
    slug: 'indore',
    country: 'India',
    tagline: "India's Cleanest City & Fastest Growing IT Hub",
    description: 'Pristine green avenues, Crystal IT Park, modern apartments, and zero-brokerage transparent rentals.',
    active: true,
    stage: 'active',
    stats: {
      localitiesCount: 3,
      avgRentDisplay: '₹16,500/mo',
      livabilityScore: 98,
      verifiedWaitlistCount: 420,
    },
    highlights: ['India Cleanest City for 7 Years', 'Crystal IT Park Hub', 'BRTS Transit System'],
    community: {
      name: 'Indore Clean Tech Living',
      tagline: 'Verified homes across Vijay Nagar and Super Corridor',
      description: 'A growing circle of techies and residents in Indore living brokerage-free.',
      memberCount: 420,
      badge: 'Live Inventory',
      channelType: 'whatsapp',
      ctaText: 'Join Indore Community',
    },
    localities: [
      {
        id: 'ind-vijay-nagar',
        slug: 'vijay-nagar',
        name: 'Vijay Nagar',
        citySlug: 'indore',
        tagline: 'Modern Tech & BRTS Hub',
        description: 'The premier residential hub of Indore near malls and corporate offices.',
        popularTags: ['BRTS Corridor', 'Malls & Cafes', 'Corporate Stays'],
        avgRent: '₹14,000 - ₹28,000',
        active: true,
        transitHighlight: 'Vijay Nagar BRTS Station',
      },
    ],
  },
};

// ============================================================================
// HIERARCHY HELPER UTILITIES
// ============================================================================

export function getCityHierarchy(slugOrName: string): CityHierarchy | undefined {
  if (!slugOrName) return undefined;
  const clean = slugOrName.trim().toLowerCase();
  
  // Direct slug lookup
  if (CITIES_HIERARCHY[clean]) {
    return CITIES_HIERARCHY[clean];
  }

  // Name match fallback
  return Object.values(CITIES_HIERARCHY).find(
    (c) => c.name.toLowerCase() === clean || c.slug === clean
  );
}

export function getAllCityHierarchySlugs(): string[] {
  return Object.keys(CITIES_HIERARCHY);
}

export function getLocalityBySlug(citySlug: string, localitySlug: string): Locality | undefined {
  const city = getCityHierarchy(citySlug);
  if (!city) return undefined;

  const cleanLoc = localitySlug.trim().toLowerCase();
  return city.localities.find(
    (l) => l.slug === cleanLoc || l.name.toLowerCase() === cleanLoc
  );
}
