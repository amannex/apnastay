import React from 'react';
import type { Metadata } from 'next';
import '../styles/index.css';
import { AppProvider } from '../context/AppContext';
import AppShell from '../components/layout/AppShell';

export const metadata: Metadata = {
  title: 'OwnStay | Zero-Brokerage Rental Platform in India',
  description: "India's first verified zero-brokerage rental platform for Tier-1 & Tier-2 cities with NFC smart-locks and 100% online rental agreements.",
  keywords: ['rentals india', 'zero brokerage', 'apartments indore', 'rent jaipur', 'ownstay', 'no brokerage flat']
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
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
