import React from 'react';
import type { Metadata } from 'next';
import '../styles/index.css';
import { AppProvider } from '../context/AppContext';
import AppShell from '../components/layout/AppShell';

export const metadata: Metadata = {
  metadataBase: new URL('https://ownstay-eight.vercel.app'),
  title: {
    default: 'OwnStay | Zero-Brokerage Rental Platform in India',
    template: '%s | OwnStay India',
  },
  description:
    "India's first verified zero-brokerage rental platform for Tier-1 & Tier-2 cities with NFC smart-locks, 25-point engineering audits, and 100% online rental agreements.",
  keywords: [
    'rentals india',
    'zero brokerage',
    'apartments indore',
    'rent jaipur',
    'ownstay',
    'no brokerage flat india',
    'coimbatore rentals',
    'kochi apartments',
    'pune flats for rent',
    'chandigarh rentals',
  ],
  authors: [{ name: 'OwnStay India Team', url: 'https://ownstay-eight.vercel.app' }],
  creator: 'OwnStay India',
  publisher: 'OwnStay Technologies Pvt Ltd',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://ownstay-eight.vercel.app',
    siteName: 'OwnStay India',
    title: 'OwnStay | Zero-Brokerage Rental Platform in India',
    description:
      "India's first verified zero-brokerage rental platform for Tier-1 & Tier-2 cities with NFC smart-locks and 100% online rental agreements.",
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'OwnStay India — Luxury Co-Living & Zero Brokerage Rentals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OwnStay | Zero-Brokerage Rental Platform in India',
    description:
      "India's first verified zero-brokerage rental platform for Tier-1 & Tier-2 cities with NFC smart-locks and 100% online rental agreements.",
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
    creator: '@ownstayindia',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'OwnStay India',
    url: 'https://ownstay-eight.vercel.app',
    logo: 'https://ownstay-eight.vercel.app/favicon.ico',
    description:
      "India's premier verified zero-brokerage residential rental platform serving Tier-1 & Tier-2 cities including Indore, Jaipur, Coimbatore, Kochi, Chandigarh, and Pune.",
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressLocality: 'Indore',
      addressRegion: 'Madhya Pradesh',
    },
    priceRange: '₹16,500 - ₹50,000',
    sameAs: [
      'https://twitter.com/ownstayindia',
      'https://www.linkedin.com/company/ownstayindia',
      'https://www.instagram.com/ownstayindia',
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="min-h-screen bg-white text-[#1A1A1A] font-sans antialiased"
        suppressHydrationWarning
      >
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
