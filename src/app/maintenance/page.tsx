import type { Metadata } from 'next';
import MaintenanceView from './MaintenanceView';

export const metadata: Metadata = {
  title: "We're getting things ready | ApnaStay",
  description:
    "ApnaStay is currently under maintenance while we're preparing a better way to find your next place to stay.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function MaintenancePage() {
  return <MaintenanceView />;
}
