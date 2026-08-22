import React from 'react';
import type { Metadata } from 'next';
import TenantSubPagePlaceholder from '@/views/TenantSubPagePlaceholder';

export const metadata: Metadata = {
  title: 'NFC Smart-Lock Visits | ApnaStay India',
  description: 'Manage your scheduled self-guided apartment tours and active NFC unlock tokens.',
};

export default function VisitsPage() {
  return (
    <TenantSubPagePlaceholder
      title="Scheduled Visits & NFC Keys"
      description="Access your smart-lock tokens to self-tour verified properties at your convenience without a broker."
      activeTab="visits"
      badgeText="NFC Access Tokens"
      iconType="visits"
    />
  );
}
