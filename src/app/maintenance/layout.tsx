import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Under Scheduled Maintenance | ApnaStay India',
  description:
    'ApnaStay is temporarily undergoing scheduled performance and database upgrades. We will be back online shortly.',
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

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
