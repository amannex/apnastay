import type { Metadata } from 'next';
import UpcomingFeaturesPage from '@/views/UpcomingFeaturesPage';

export const metadata: Metadata = {
  title: 'Upcoming Features | ApnaStay Product Roadmap',
  description: 'Explore upcoming features on ApnaStay: native mobile app, AI matchmaker 2.0, acoustic dB noise heatmaps, and smart deposit escrow.'
};

export default function Page() {
  return <UpcomingFeaturesPage />;
}
