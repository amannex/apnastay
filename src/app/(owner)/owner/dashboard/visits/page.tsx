import React from 'react';
import type { Metadata } from 'next';
import OwnerSubPagePlaceholder from '@/views/OwnerSubPagePlaceholder';

export const metadata: Metadata = {
  title: 'NFC Tour Logs & Visits | OwnStay India',
  description: 'Monitor NFC self-guided tour logs and scheduled prospective tenant visits.',
};

export default function VisitsPage() {
  return (
    <OwnerSubPagePlaceholder
      title="NFC Tour Logs & Visits"
      description="Track NFC smart-lock entry times, prospective tenant visits, and self-guided tour history in real time."
      activeTab="visits"
      badgeText="Smart-Lock Logs"
      iconType="visits"
    />
  );
}
