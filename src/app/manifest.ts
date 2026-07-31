import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OwnStay — Zero-Brokerage Indian Rental Platform',
    short_name: 'OwnStay',
    description: "India's first verified zero-brokerage rental platform for Tier-1 & Tier-2 cities with NFC smart-locks and 100% online rental agreements.",
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#E1224D',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
