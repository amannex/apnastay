import type { Metadata } from 'next';
import AboutPage from '@/views/AboutPage';

export const metadata: Metadata = {
  title: 'Who We Are | ApnaStay India',
  description: 'Learn who we are: connecting verified residential property owners with tenants in Tier-2 Indian hubs with zero brokerage.'
};

export default function Page() {
  return <AboutPage />;
}
