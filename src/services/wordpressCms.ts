// ============================================================================
// APNASTAY STATIC & CMS LAYER — INDIA'S ZERO-BROKERAGE RENTAL PLATFORM
// Connects to headless CMS endpoints with rich Indian rental fallback data
// ============================================================================

import type { BlogPost } from '../types';

const WP_API_BASE = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WP_API_URL) || 'https://demo.wp-api.org/wp-json/wp/v2';

export const STATIC_BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    slug: 'the-death-of-brokerage-fees-india',
    title: 'The End of 1-Month Brokerage in India: Why Tenants Are Moving to ApnaStay',
    excerpt: 'For decades, Indian brokers charged 1 to 2 months rent just for unlocking an apartment door. Here is how NFC smart-locks and digital e-agreements are saving renters lakhs of rupees.',
    date: 'July 28, 2026',
    readTime: '4 min read',
    category: 'Indian Rental Trends',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    author: {
      name: 'Rajat Verma',
      role: 'Principal Urban Economist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    content: `
      <p class="lead text-lg text-gray-700 mb-6 font-medium">For decades, the Indian rental market has been gatekept by an archaic middleman system. To find a decent flat in any major Indian hub, tenants have had to pay a mandatory "1-month brokerage fee"—often amounting to tens of thousands or even lakhs of rupees—simply for a broker to unlock a door and hand over a template agreement.</p>
      
      <p class="mb-4">At ApnaStay, we believe this model is not just obsolete; it is actively holding back the mobility of India's professional workforce. As tech talent increasingly moves to Tier-2 hubs like Indore, Jaipur, and Coimbatore, the friction of paying heavy upfront costs is becoming a major bottleneck.</p>
      
      <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">The Real Cost of Traditional Brokerage</h3>
      <p class="mb-4">When a tenant relocates, the financial load is already immense: packing and moving charges, security deposits (often spanning 3 to 6 months in many cities), and the initial month's rent. Adding a 1-month brokerage fee on top of this creates an artificial barrier to relocation.</p>
      
      <blockquote class="border-l-4 border-rose-500 pl-4 my-6 italic text-gray-600">
        "I was asked to pay ₹35,000 as brokerage for a flat in Indore where the broker spent exactly 5 minutes showing me the place and did not even help with the registration. That is when I looked for zero-brokerage alternatives." — Ankit S., Software Engineer
      </blockquote>

      <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">How Technology Eliminates the Middleman</h3>
      <p class="mb-4">ApnaStay eliminates the need for brokers entirely by automating the search, touring, and legal processes:</p>
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>NFC-Enabled Self Tours:</strong> No more waiting for brokers. Tenants get an ephemeral digital key on their smartphones to unlock and inspect properties independently.</li>
        <li><strong>Instant Aadhaar-linked e-Signatures:</strong> Legal agreements are digitally stamped and e-signed under the Indian Registration Act in under 10 minutes.</li>
        <li><strong>Automated Inventories:</strong> Digital, high-resolution condition logs are taken at check-in and check-out, leaving no room for arbitrary deposit deductions.</li>
      </ul>

      <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">The Financial Impact</h3>
      <p class="mb-4">By bringing brokerage fees down to absolute zero, ApnaStay has saved renters over ₹2.84 crores in the last few quarters alone. This capital is instead staying in the pockets of young professionals and families, boosting urban consumption and making relocation frictionless.</p>
    `
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
    },
    content: `
      <p class="lead text-lg text-gray-700 mb-6 font-medium">The geographical center of India's tech workforce is shifting. While Bengaluru, Pune, and Hyderabad remain massive tech clusters, the rise of remote-first policies, hybrid models, and localized office hubs has triggered a mass migration to Tier-2 cities.</p>

      <p class="mb-4">Indore, Jaipur, Coimbatore, Kochi, and Chandigarh are no longer just tourist destinations or retirement towns. They are thriving, high-tech urban centers that offer a standard of living that traditional tier-1 hubs struggle to match.</p>

      <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">1. The Rents are 40% to 50% Lower</h3>
      <p class="mb-4">The primary driver for relocation remains financial health. A premium 2BHK in a high-end society in Indore or Jaipur costs between ₹18,000 and ₹25,000 per month. In comparison, a similar configuration in Bengaluru's Outer Ring Road or Mumbai's suburban corridor easily commands ₹45,000 to ₹65,000, often alongside astronomical security deposit demands.</p>

      <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">2. Infrastructure That Rivals Tier-1</h3>
      <p class="mb-4">With high-speed gigabit fiber internet widely available and major co-working brands establishing outposts, Tier-2 cities easily support remote engineering workflows. ApnaStay verifies Wi-Fi fiber speeds and power backup on all its properties to ensure professionals never miss a sprint planning call.</p>

      <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">3. Better Livability Metrics</h3>
      <p class="mb-4">Shorter commute times mean professionals regain 2 to 3 hours of their day. Clean air, green spaces, and a lower cost of organic groceries create a healthier environment for families and young professionals alike.</p>

      <p class="mb-4">ApnaStay is building the rental infrastructure for this new migration wave, ensuring that finding a premium verified flat in Jaipur or Coimbatore is as easy as booking a cab.</p>
    `
  },
  {
    id: 3,
    slug: 'how-apnastay-25-point-audit-works',
    title: 'How ApnaStay Inspects Every Property: From Acoustic Soundproofing to Wi-Fi Speeds',
    excerpt: 'Take a technical deep-dive into our 25-point physical audit where engineers test decibel insulation, water pressure, and legal title deed authenticity before listing.',
    date: 'July 18, 2026',
    readTime: '5 min read',
    category: 'Engineering & Trust',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
    author: {
      name: 'Vikramaditya Rao',
      role: 'Staff IoT Security Engineer',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80'
    },
    content: `
      <p class="lead text-lg text-gray-700 mb-6 font-medium">When you rent an apartment online, the biggest risk is the delta between the pictures and reality. Low water pressure, noisy neighbors, fake landlords, and spotty internet are issues that you only discover after you have paid the deposit and moved in.</p>

      <p class="mb-4">At ApnaStay, we solve this by executing a rigorous <strong>25-point engineering audit</strong> on every single property before it is activated on our platform. Here is how our field engineering team audits homes to guarantee peak livability.</p>

      <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">1. Acoustic Decibel Testing</h3>
      <p class="mb-4">We use professional decibel meters to test sound insulation during peak traffic hours. We measure the ambient noise inside the master bedroom and living room with windows closed, ensuring noise levels do not exceed 45dB. This ensures a peaceful environment for deep focus and sleep.</p>

      <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">2. Connectivity and Power Inspections</h3>
      <p class="mb-4">We test internet routing stability and verify that the property has active, functional backup power. Our engineers run speed tests to ensure gigabit fibers actually deliver the promised speeds and test automatic cut-over times for inverters.</p>

      <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">3. Water Pressure & Plumb Audits</h3>
      <p class="mb-4">Using pressure gauges, we verify that showers and taps maintain a minimum of 1.5 bar pressure. We check for hidden water seepage, pipeline scaling, and verify that Geysers are fully functional and safe.</p>

      <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">4. Structural and Legal Sanity Checks</h3>
      <p class="mb-4">Finally, our legal team runs background verification on the property title deeds to confirm ownership authenticity, preventing sub-letting scams and illegal tenant contracts.</p>
    `
  }
];

export const STATIC_FAQS = [
  {
    id: 'f1',
    question: 'How is ApnaStay able to guarantee ₹0 brokerage fees across India?',
    answer: 'ApnaStay connects verified property owners directly with screened tenants using automated Aadhaar/PAN e-signing and NFC smart-lock self-touring. Because we eliminate traditional property brokers and offline middlemen, you pay ₹0 brokerage—saving a full month of rent.'
  },
  {
    id: 'f2',
    question: 'What does "100% Verified by ApnaStay Engineers" mean?',
    answer: 'Before any home is listed in Indore, Jaipur, Coimbatore, Kochi, Chandigarh, or Pune, an ApnaStay field engineer visits the property for a 25-point inspection. We verify sound insulation (dB testing), Wi-Fi fiber speed, inverter power backup, water pressure, and legal property deed authenticity.'
  },
  {
    id: 'f3',
    question: 'How do instant NFC smart-lock self-tours work?',
    answer: 'Once you select a time slot on the ApnaStay app, you receive an ephemeral encrypted NFC token. When you arrive at the property, tap your phone on the smart-lock to enter and tour the apartment at your own pace without any broker hovering.'
  },
  {
    id: 'f4',
    question: 'How fast can I move in after signing the rental agreement?',
    answer: 'Our digital agreements are e-stamped and legally binding under the Indian Registration Act within 10 minutes. Most tenants complete move-in and receive their permanent digital NFC key within 24 hours of their first tour.'
  },
  {
    id: 'f5',
    question: 'Is the security deposit 100% refundable without unfair deductions?',
    answer: 'Yes! ApnaStay records an automated 360-degree digital inventory check on move-in day. When you vacate, your security deposit is refunded directly to your bank account within 48 hours without arbitrary painting or wear-and-tear cuts.'
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
      next: { 
        revalidate: 60, // Fallback revalidation window
        tags: ['blog']  // Cache tag for on-demand WordPress purge
      }
    }).catch(() => null);
    clearTimeout(timeoutId);

    if (!res || !res.ok) {
      return STATIC_BLOG_POSTS;
    }
    const data = await res.json();
    return data.map((post: any) => {
      const staticMatch = STATIC_BLOG_POSTS.find(sp => sp.slug === post.slug);
      return {
        id: post.id,
        slug: post.slug,
        title: post.title.rendered,
        excerpt: post.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 140) + '...',
        content: post.content?.rendered || staticMatch?.content || '',
        date: new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        readTime: '5 min read',
        category: 'Indian Rentals',
        image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || (staticMatch?.image || STATIC_BLOG_POSTS[0].image),
        author: {
          name: post._embedded?.['author']?.[0]?.name || 'Rajat Verma',
          role: 'ApnaStay Editor',
          avatar: post._embedded?.['author']?.[0]?.avatar_urls?.['96'] || ((staticMatch?.author as any)?.avatar || '')
        }
      };
    });
  } catch (err) {
    return STATIC_BLOG_POSTS;
  }
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const staticPost = STATIC_BLOG_POSTS.find(p => p.slug === slug);
  if (!process.env.NEXT_PUBLIC_WP_API_URL) {
    return staticPost || null;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const apiBase = WP_API_BASE.includes('wp/v2') ? WP_API_BASE : `${WP_API_BASE}/wp/v2`;
    const res = await fetch(`${apiBase}/posts?slug=${slug}&_embed`, {
      signal: controller.signal,
      next: { 
        revalidate: 60, // Fallback revalidation window
        tags: ['blog', `blog-${slug}`] // Cache tags for slug-specific purge
      }
    }).catch(() => null);
    clearTimeout(timeoutId);

    if (!res || !res.ok) {
      return staticPost || null;
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return staticPost || null;
    }
    const post = data[0];
    return {
      id: post.id,
      slug: post.slug,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 140) + '...',
      content: post.content.rendered,
      date: new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: '5 min read',
      category: 'Indian Rentals',
      image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || (staticPost?.image || STATIC_BLOG_POSTS[0].image),
      author: {
        name: post._embedded?.['author']?.[0]?.name || 'Rajat Verma',
        role: 'ApnaStay Editor',
        avatar: post._embedded?.['author']?.[0]?.avatar_urls?.['96'] || ((staticPost?.author as any)?.avatar || '')
      }
    };
  } catch (err) {
    return staticPost || null;
  }
}

export async function fetchFaqItems() {
  return STATIC_FAQS;
}

export async function fetchAdminAnalytics() {
  return STATIC_ADMIN_ANALYTICS;
}

