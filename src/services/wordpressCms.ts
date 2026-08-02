// ============================================================================
// OWNSTAY STATIC & CMS LAYER — INDIA'S ZERO-BROKERAGE RENTAL PLATFORM
// Connects to headless CMS endpoints with rich Indian rental fallback data
// ============================================================================

import type { BlogPost } from '../types';

const WP_API_BASE = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WP_API_URL) || 'https://demo.wp-api.org/wp-json/wp/v2';

export const STATIC_BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    slug: 'the-death-of-brokerage-fees-india',
    title: 'The End of 1-Month Brokerage in India: Why Tenants Are Moving to OwnStay',
    excerpt: 'For decades, Indian brokers charged 1 to 2 months rent just for unlocking an apartment door. Here is how NFC smart-locks and digital e-agreements are saving renters lakhs of rupees.',
    date: 'July 28, 2026',
    readTime: '4 min read',
    category: 'Indian Rental Trends',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    author: {
      name: 'Rajat Verma',
      role: 'Principal Urban Economist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    }
  },
  {
    id: 2,
    slug: 'tier-2-cities-it-boom',
    title: 'Why Tier-2 Hubs Like Indore, Jaipur & Coimbatore Are Becoming India\'s Favorite IT Havens',
    excerpt: 'With better air quality, 40% lower rents than Bengaluru or Mumbai, and gigabit fiber infrastructure, professionals are discovering a superior quality of life.',
    date: 'July 24, 2026',
    readTime: '6 min read',
    category: 'Tier-2 Livability',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    author: {
      name: 'Neelam Kulkarni',
      role: 'Head of Field Inspections',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    }
  },
  {
    id: 3,
    slug: 'how-ownstay-25-point-audit-works',
    title: 'How OwnStay Inspects Every Property: From Acoustic Soundproofing to Wi-Fi Speeds',
    excerpt: 'Take a technical deep-dive into our 25-point physical audit where engineers test decibel insulation, water pressure, and legal title deed authenticity before listing.',
    date: 'July 18, 2026',
    readTime: '5 min read',
    category: 'Engineering & Trust',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
    author: {
      name: 'Vikramaditya Rao',
      role: 'Staff IoT Security Engineer',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80'
    }
  }
];

export const STATIC_FAQS = [
  {
    id: 'f1',
    question: 'How is OwnStay able to guarantee ₹0 brokerage fees across India?',
    answer: 'OwnStay connects verified property owners directly with screened tenants using automated Aadhaar/PAN e-signing and NFC smart-lock self-touring. Because we eliminate traditional property brokers and offline middlemen, you pay ₹0 brokerage—saving a full month of rent.'
  },
  {
    id: 'f2',
    question: 'What does "100% Verified by OwnStay Engineers" mean?',
    answer: 'Before any home is listed in Indore, Jaipur, Coimbatore, Kochi, Chandigarh, or Pune, an OwnStay field engineer visits the property for a 25-point inspection. We verify sound insulation (dB testing), Wi-Fi fiber speed, inverter power backup, water pressure, and legal property deed authenticity.'
  },
  {
    id: 'f3',
    question: 'How do instant NFC smart-lock self-tours work?',
    answer: 'Once you select a time slot on the OwnStay app, you receive an ephemeral encrypted NFC token. When you arrive at the property, tap your phone on the smart-lock to enter and tour the apartment at your own pace without any broker hovering.'
  },
  {
    id: 'f4',
    question: 'How fast can I move in after signing the rental agreement?',
    answer: 'Our digital agreements are e-stamped and legally binding under the Indian Registration Act within 10 minutes. Most tenants complete move-in and receive their permanent digital NFC key within 24 hours of their first tour.'
  },
  {
    id: 'f5',
    question: 'Is the security deposit 100% refundable without unfair deductions?',
    answer: 'Yes! OwnStay records an automated 360-degree digital inventory check on move-in day. When you vacate, your security deposit is refunded directly to your bank account within 48 hours without arbitrary painting or wear-and-tear cuts.'
  }
];

export const STATIC_ADMIN_ANALYTICS = {
  kpiCards: [
    { label: 'Total Gross Monthly Volume', value: '₹4.82 Cr', change: '+32.4% vs last month', positive: true },
    { label: 'Active Verified Listings', value: '1,428', change: '+140 across Tier-2 Hubs', positive: true },
    { label: 'Avg Move-in Time', value: '16.8 hrs', change: '-5.2 hrs faster', positive: true },
    { label: 'Brokerage Saved for Indians', value: '₹2,84,00,000', change: '100% Zero-Brokerage', positive: true }
  ],
  cityDistribution: [
    { city: 'Indore', count: 340, percentage: 28, revenue: '₹1.15 Cr', color: '#E1224D' },
    { city: 'Pune', count: 312, percentage: 26, revenue: '₹1.08 Cr', color: '#F43F5E' },
    { city: 'Jaipur', count: 220, percentage: 18, revenue: '₹0.74 Cr', color: '#FB7185' },
    { city: 'Chandigarh', count: 180, percentage: 15, revenue: '₹0.62 Cr', color: '#FDA4AF' },
    { city: 'Coimbatore & Kochi', count: 176, percentage: 13, revenue: '₹0.53 Cr', color: '#FFE4EA' }
  ],
  monthlyBookings: [
    { month: 'Jan', bookings: 140, revenue: 3800000 },
    { month: 'Feb', bookings: 165, revenue: 4200000 },
    { month: 'Mar', bookings: 210, revenue: 5400000 },
    { month: 'Apr', bookings: 245, revenue: 6300000 },
    { month: 'May', bookings: 310, revenue: 7800000 },
    { month: 'Jun', bookings: 380, revenue: 9500000 }
  ],
  recentInspections: [
    { id: 'INSP-901', property: 'Vijay Nagar Glass Panorama', engineer: 'Neelam K.', status: 'PASSED_25_POINT', score: '98/100', date: 'July 28, 2026' },
    { id: 'INSP-902', property: 'Malviya Nagar Sanctuary', engineer: 'Vikram R.', status: 'PASSED_25_POINT', score: '95/100', date: 'July 28, 2026' },
    { id: 'INSP-903', property: 'RS Puram Executive Haven', engineer: 'Arjun P.', status: 'PASSED_25_POINT', score: '97/100', date: 'July 27, 2026' },
    { id: 'INSP-904', property: 'Kakkanad Waterfront Residence', engineer: 'Meera S.', status: 'PENDING_ACOUSTICS', score: '92/100', date: 'July 27, 2026' }
  ]
};

export async function fetchBlogPosts() {
  if (!process.env.NEXT_PUBLIC_WP_API_URL) {
    return STATIC_BLOG_POSTS;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${WP_API_BASE}/posts?_embed&per_page=3`, {
      signal: controller.signal,
    }).catch(() => null);
    clearTimeout(timeoutId);

    if (!res || !res.ok) {
      return STATIC_BLOG_POSTS;
    }
    const data = await res.json();
    return data.map((post: any) => ({
      id: post.id,
      slug: post.slug,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 140) + '...',
      date: new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: '5 min read',
      category: 'Indian Rentals',
      image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || STATIC_BLOG_POSTS[0].image,
      author: {
        name: 'Rajat Verma',
        role: 'OwnStay Editor',
        avatar: (STATIC_BLOG_POSTS[0]?.author as any)?.avatar || ''
      }
    }));
  } catch (err) {
    return STATIC_BLOG_POSTS;
  }
}

export async function fetchFaqItems() {
  return STATIC_FAQS;
}

export async function fetchAdminAnalytics() {
  return STATIC_ADMIN_ANALYTICS;
}
