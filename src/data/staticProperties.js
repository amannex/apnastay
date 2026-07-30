// ============================================================================
// OWNSTAY STATIC DATA LAYER — ZERO-BROKERAGE INDIAN RENTAL PLATFORM
// Curated for India's Fastest-Growing Tier-2 & Tier-1 Hubs
// ============================================================================

export const STATIC_CITIES = [
  {
    id: 'indore',
    name: 'Indore',
    tagline: "India's Cleanest City & IT Hub",
    count: 248,
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    livabilityScore: 98,
    avgRent: '₹16,500/mo',
    description: 'Home to Crystal IT Park and Vijay Nagar, offering pristine green avenues and zero-brokerage modern apartments.'
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    tagline: 'Heritage Charm meets Emerging Tech',
    count: 184,
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
    livabilityScore: 94,
    avgRent: '₹17,200/mo',
    description: 'Malviya Nagar and C-Scheme residences combining classic Rajasthani aesthetics with high-speed fiber connectivity.'
  },
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    tagline: 'Manchester of South India',
    count: 196,
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    livabilityScore: 96,
    avgRent: '₹15,800/mo',
    description: 'Serene living in RS Puram and Saravanampatti near major tech campuses and Western Ghats fresh air.'
  },
  {
    id: 'kochi',
    name: 'Kochi',
    tagline: 'Coastal Serenity & Infopark Hub',
    count: 162,
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    livabilityScore: 95,
    avgRent: '₹18,500/mo',
    description: 'Waterfront apartments in Kakkanad and Marine Drive with smart-lock access and soundproof acoustic glass.'
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh',
    tagline: "India's Greenest Planned City",
    count: 210,
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    livabilityScore: 97,
    avgRent: '₹20,000/mo',
    description: 'Architect Le Corbusier inspired sectors with wide boulevards, dedicated cycling tracks, and executive WFH suites.'
  },
  {
    id: 'pune',
    name: 'Pune',
    tagline: 'Oxford of the East & IT Powerhouse',
    count: 312,
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
    livabilityScore: 96,
    avgRent: '₹22,500/mo',
    description: 'Vibrant living in Koregaon Park and Baner with private balconies, gym access, and 100% verified zero brokerage.'
  }
];

export const STATIC_PROPERTIES = [
  {
    id: 'prop-101',
    title: 'The Vijay Nagar Glass Panorama',
    neighborhood: 'Vijay Nagar, Indore',
    city: 'Indore',
    price: 16500,
    currency: '₹',
    period: '/month',
    roomType: 'Executive 1BHK Suite',
    rating: 4.96,
    reviewsCount: 42,
    verified: true,
    isInstantBook: true,
    nfcSelfTour: true,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
    ],
    costBreakdown: {
      monthlyRent: 16500,
      maintenance: 1200,
      brokerage: 0,
      securityDeposit: 30000,
      totalMoveIn: 47700
    },
    specs: {
      bedrooms: 1,
      bathrooms: 1,
      sqft: 650,
      floor: '6th Floor (Elevator)',
      furnishing: 'Fully Furnished (Herman Miller WFH Desk & Bed)'
    },
    amenities: [
      { name: '300 Mbps JioFiber Wi-Fi', icon: 'Wifi', verified: true },
      { name: 'Double-Glazed Soundproofing (32 dB)', icon: 'ShieldCheck', verified: true },
      { name: 'NFC Smart-Lock Keyless Entry', icon: 'Key', verified: true },
      { name: '100% Power Backup', icon: 'Zap', verified: true },
      { name: 'Private Sunlit Balcony', icon: 'Sun', verified: true },
      { name: 'In-building Fitness Studio', icon: 'Dumbbell', verified: true }
    ],
    nearby: [
      { name: 'Crystal IT Park', distance: '1.2 km (5 min drive)' },
      { name: 'Vijay Nagar Metro / BRTS', distance: '300 m (4 min walk)' },
      { name: 'Phoenix Citadel Mall', distance: '2.5 km (8 min drive)' },
      { name: 'Apollo Hospital Indore', distance: '900 m (10 min walk)' }
    ],
    owner: {
      name: 'Aditya Sharma',
      role: 'Verified OwnStay Partner',
      responseTime: 'Under 10 mins',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    auditTimeline: [
      { date: 'July 24, 2026', event: 'Acoustics & Wi-Fi Speed Certified by OwnStay Field Engineer', status: 'pass' },
      { date: 'July 26, 2026', event: 'NFC Smart Lock Firmware Verified v4.2', status: 'pass' },
      { date: 'July 28, 2026', event: 'Sanitization & HVAC Filter Replacement Complete', status: 'pass' }
    ],
    aiAttributes: {
      matchScore: 98,
      commuteTag: '5 min to Crystal IT Park',
      acousticsScore: '32 dB Whisper Quiet'
    }
  },
  {
    id: 'prop-102',
    title: 'Malviya Nagar Heritage Sanctuary',
    neighborhood: 'Malviya Nagar, Jaipur',
    city: 'Jaipur',
    price: 18000,
    currency: '₹',
    period: '/month',
    roomType: '2BHK Designer Residence',
    rating: 4.92,
    reviewsCount: 38,
    verified: true,
    isInstantBook: true,
    nfcSelfTour: true,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80'
    ],
    costBreakdown: {
      monthlyRent: 18000,
      maintenance: 1500,
      brokerage: 0,
      securityDeposit: 35000,
      totalMoveIn: 54500
    },
    specs: {
      bedrooms: 2,
      bathrooms: 2,
      sqft: 980,
      floor: '3rd Floor (Park Facing)',
      furnishing: 'Fully Furnished (Artisan Teak & WFH Setup)'
    },
    amenities: [
      { name: '250 Mbps Fiber Internet', icon: 'Wifi', verified: true },
      { name: 'NFC Keyless Entry', icon: 'Key', verified: true },
      { name: 'Acoustic Wall Panels (34 dB)', icon: 'ShieldCheck', verified: true },
      { name: 'Solar Water Heating', icon: 'Sun', verified: true }
    ],
    nearby: [
      { name: 'World Trade Park Jaipur', distance: '800 m (10 min walk)' },
      { name: 'Malviya Nagar Tech Park', distance: '1.5 km (6 min drive)' },
      { name: 'Jawahar Circle Garden', distance: '1.0 km (12 min walk)' }
    ],
    owner: {
      name: 'Priya Rathore',
      role: 'Verified OwnStay Partner',
      responseTime: 'Under 15 mins',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80'
    },
    auditTimeline: [
      { date: 'July 22, 2026', event: 'Water pressure & Solar heating tested by OwnStay Engineer', status: 'pass' },
      { date: 'July 25, 2026', event: 'Smart-lock NFC key programmed', status: 'pass' }
    ],
    aiAttributes: {
      matchScore: 96,
      commuteTag: '10 min walk to WTP Jaipur',
      acousticsScore: '34 dB Peaceful Park View'
    }
  },
  {
    id: 'prop-103',
    title: 'RS Puram Executive Zen Haven',
    neighborhood: 'RS Puram, Coimbatore',
    city: 'Coimbatore',
    price: 15800,
    currency: '₹',
    period: '/month',
    roomType: 'Modern 1BHK Studio',
    rating: 4.95,
    reviewsCount: 54,
    verified: true,
    isInstantBook: true,
    nfcSelfTour: true,
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    costBreakdown: {
      monthlyRent: 15800,
      maintenance: 1000,
      brokerage: 0,
      securityDeposit: 30000,
      totalMoveIn: 46800
    },
    specs: {
      bedrooms: 1,
      bathrooms: 1,
      sqft: 600,
      floor: '4th Floor',
      furnishing: 'Fully Furnished (Scandinavian Minimalist)'
    },
    amenities: [
      { name: '300 Mbps Airtel Xstream Fiber', icon: 'Wifi', verified: true },
      { name: 'Whisper-Quiet Inverter AC', icon: 'Zap', verified: true },
      { name: 'NFC Smart Door Access', icon: 'Key', verified: true }
    ],
    nearby: [
      { name: 'DB Road Shopping Hub', distance: '400 m (5 min walk)' },
      { name: 'Tidel Park Coimbatore', distance: '4.8 km (14 min drive)' },
      { name: 'Ganga Hospital', distance: '1.2 km (5 min drive)' }
    ],
    owner: {
      name: 'Siddharth Iyer',
      role: 'Verified OwnStay Partner',
      responseTime: 'Under 5 mins',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    },
    auditTimeline: [
      { date: 'July 27, 2026', event: 'Air Quality Index & Fiber speed validated', status: 'pass' }
    ],
    aiAttributes: {
      matchScore: 97,
      commuteTag: '5 min to DB Road',
      acousticsScore: '30 dB Ultra Quiet'
    }
  },
  {
    id: 'prop-104',
    title: 'Kakkanad Waterfront Tech Residence',
    neighborhood: 'Kakkanad, Kochi',
    city: 'Kochi',
    price: 19500,
    currency: '₹',
    period: '/month',
    roomType: 'Luxury 2BHK Waterfront',
    rating: 4.98,
    reviewsCount: 29,
    verified: true,
    isInstantBook: true,
    nfcSelfTour: true,
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ],
    costBreakdown: {
      monthlyRent: 19500,
      maintenance: 1500,
      brokerage: 0,
      securityDeposit: 40000,
      totalMoveIn: 61000
    },
    specs: {
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1050,
      floor: '9th Floor (River View)',
      furnishing: 'Fully Furnished (Wipro Home Automation)'
    },
    amenities: [
      { name: '500 Mbps Gigabit Fiber', icon: 'Wifi', verified: true },
      { name: 'Riverfront Balcony Deck', icon: 'Sun', verified: true },
      { name: 'NFC Smart-Lock Keyless Access', icon: 'Key', verified: true }
    ],
    nearby: [
      { name: 'Infopark Kochi Phase 1 & 2', distance: '900 m (10 min walk)' },
      { name: 'SmartCity Kochi', distance: '1.4 km (4 min drive)' },
      { name: 'Kochi Water Metro Station', distance: '600 m (7 min walk)' }
    ],
    owner: {
      name: 'Ananya Nair',
      role: 'Verified OwnStay Partner',
      responseTime: 'Under 10 mins',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    auditTimeline: [
      { date: 'July 26, 2026', event: 'Acoustic double glazing & Water Metro connectivity verified', status: 'pass' }
    ],
    aiAttributes: {
      matchScore: 99,
      commuteTag: '10 min walk to Infopark',
      acousticsScore: '29 dB Waterfront Serenity'
    }
  },
  {
    id: 'prop-105',
    title: 'Sector 17 Green Boulevard Suite',
    neighborhood: 'Sector 17, Chandigarh',
    city: 'Chandigarh',
    price: 21000,
    currency: '₹',
    period: '/month',
    roomType: 'Executive 2BHK Residence',
    rating: 4.94,
    reviewsCount: 33,
    verified: true,
    isInstantBook: true,
    nfcSelfTour: true,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80'
    ],
    costBreakdown: {
      monthlyRent: 21000,
      maintenance: 1800,
      brokerage: 0,
      securityDeposit: 40000,
      totalMoveIn: 62800
    },
    specs: {
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1100,
      floor: '2nd Floor (Boulevard Facing)',
      furnishing: 'Fully Furnished (Le Corbusier Minimalist)'
    },
    amenities: [
      { name: '300 Mbps High-Speed Wi-Fi', icon: 'Wifi', verified: true },
      { name: 'NFC Keyless Entry', icon: 'Key', verified: true },
      { name: 'Dedicated Covered Car Parking', icon: 'ShieldCheck', verified: true }
    ],
    nearby: [
      { name: 'Sector 17 Commercial Plaza', distance: '300 m (3 min walk)' },
      { name: 'Rajiv Gandhi Chandigarh IT Park', distance: '6.5 km (15 min drive)' },
      { name: 'Sukhna Lake Promenade', distance: '3.2 km (8 min drive)' }
    ],
    owner: {
      name: 'Harpreet Singh',
      role: 'Verified OwnStay Partner',
      responseTime: 'Under 12 mins',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    },
    auditTimeline: [
      { date: 'July 25, 2026', event: 'Engineering inspection completed', status: 'pass' }
    ],
    aiAttributes: {
      matchScore: 95,
      commuteTag: '3 min walk to Sector 17 Plaza',
      acousticsScore: '33 dB Peaceful Boulevard'
    }
  },
  {
    id: 'prop-106',
    title: 'Koregaon Park Luxury Studio',
    neighborhood: 'Koregaon Park, Pune',
    city: 'Pune',
    price: 23500,
    currency: '₹',
    period: '/month',
    roomType: 'Designer Studio Residence',
    rating: 4.97,
    reviewsCount: 61,
    verified: true,
    isInstantBook: true,
    nfcSelfTour: true,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
    ],
    costBreakdown: {
      monthlyRent: 23500,
      maintenance: 2000,
      brokerage: 0,
      securityDeposit: 45000,
      totalMoveIn: 70500
    },
    specs: {
      bedrooms: 1,
      bathrooms: 1,
      sqft: 720,
      floor: '5th Floor (Canopy View)',
      furnishing: 'Fully Furnished (Apple WFH Aesthetic)'
    },
    amenities: [
      { name: '400 Mbps Tata Play Fiber', icon: 'Wifi', verified: true },
      { name: 'NFC Smart-Lock Keyless Access', icon: 'Key', verified: true },
      { name: 'Acoustic Double Glazing', icon: 'ShieldCheck', verified: true }
    ],
    nearby: [
      { name: 'Osho International Meditation Resort', distance: '500 m (6 min walk)' },
      { name: 'EON Free Zone Kharadi', distance: '7.8 km (18 min drive)' },
      { name: 'Pune Junction Railway Station', distance: '3.5 km (10 min drive)' }
    ],
    owner: {
      name: 'Rohan Deshmukh',
      role: 'Verified OwnStay Partner',
      responseTime: 'Under 5 mins',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80'
    },
    auditTimeline: [
      { date: 'July 28, 2026', event: 'Wi-Fi speed & acoustic seal verified by OwnStay Engineer', status: 'pass' }
    ],
    aiAttributes: {
      matchScore: 98,
      commuteTag: '6 min walk to Osho Gardens',
      acousticsScore: '31 dB Lush Green Canopy'
    }
  }
];

export const VALUE_PROPS = [
  {
    id: 'vp-01',
    title: '₹0 Brokerage across India. Keep 100% of Your Money.',
    description: 'We connect verified landlords directly with tenants in Indore, Jaipur, Coimbatore, Kochi, Chandigarh, and Pune. No more 1-month or 2-month broker commissions.',
    icon: 'BadgePercent',
    badge: '100% Free for Tenants',
    color: 'bg-rose-50 text-[#E1224D] border-rose-100'
  },
  {
    id: 'vp-02',
    title: '25-Point Physical Engineering Inspection',
    description: 'Every apartment is visited by an OwnStay field engineer to test acoustic decibels, Wi-Fi fiber speeds, water pressure, and legal deed authenticity.',
    icon: 'ShieldCheck',
    badge: 'Physically Inspected',
    color: 'bg-blue-50 text-blue-600 border-blue-100'
  },
  {
    id: 'vp-03',
    title: 'Aadhaar & PAN Digital Rental Agreements',
    description: 'Legally binding e-stamped tenancy agreements completed on your phone in 10 minutes. Fully compliant with Indian Registration Act.',
    icon: 'FileText',
    badge: 'E-Stamped in 10 Mins',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  },
  {
    id: 'vp-04',
    title: 'Instant NFC Smart-Lock Self-Touring',
    description: 'Tour apartments on your own schedule using encrypted ephemeral NFC keys. Experience the space peacefully without any broker rushing you.',
    icon: 'Key',
    badge: 'Self-Tour Anytime',
    color: 'bg-amber-50 text-amber-600 border-amber-100'
  },
  {
    id: 'vp-05',
    title: '100% Refundable Security Deposit',
    description: 'Transparent 360-degree digital inventory check at move-in. Receive your full deposit back within 48 hours when you vacate.',
    icon: 'Zap',
    badge: 'Guaranteed Refund',
    color: 'bg-purple-50 text-purple-600 border-purple-100'
  },
  {
    id: 'vp-06',
    title: '24/7 App Maintenance & Police Verification',
    description: 'Every stay comes with instant Aadhaar tenant police verification and an in-app 4-hour SLA warranty for plumbing, electrical, and Wi-Fi repairs.',
    icon: 'ShieldCheck',
    badge: '4-Hr Repair SLA',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100'
  }
];

export const INDIAN_CITIES = STATIC_CITIES;
export const INDIAN_PROPERTIES = STATIC_PROPERTIES;

