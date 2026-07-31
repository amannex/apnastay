import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/'],
    },
    sitemap: 'https://ownstay-eight.vercel.app/sitemap.xml',
    host: 'https://ownstay-eight.vercel.app',
  };
}
