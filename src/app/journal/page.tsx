import React from 'react';
import type { Metadata } from 'next';
import JournalPage from '../../views/JournalPage';

export const metadata: Metadata = {
  title: 'ApnaStay Journal | Indian Rental Laws & Urban Living Guides',
  description: 'Read expert guides on Indian rental agreement laws, security deposit refund rules, acoustic soundproofing, and moving into Indian Tier-2 tech hubs.'
};

export default function Page() {
  return <JournalPage />;
}
