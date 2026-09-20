import type { Metadata } from 'next';
import AboutPage from '@/views/AboutPage';

export const metadata: Metadata = {
  title: 'About ApnaStay | 100% Zero-Brokerage Rentals in India',
  description: 'Learn how ApnaStay connects verified property owners with tenants in Tier-2 Indian cities with 25-point engineering audits and zero brokerage.'
};

export default function Page() {
  return <AboutPage />;
}
