import type { Metadata } from 'next';
import HowItWorksPage from '@/views/HowItWorksPage';

export const metadata: Metadata = {
  title: 'How It Works | ApnaStay India',
  description: 'Understand how ApnaStay works: 25-point engineering audits, instant NFC smart-lock tours, Aadhaar digital leases, and ₹0 brokerage across Tier-2 Indian hubs.'
};

export default function Page() {
  return <HowItWorksPage />;
}
