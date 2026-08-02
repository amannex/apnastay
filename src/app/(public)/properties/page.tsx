import React from 'react';
import type { Metadata } from 'next';
import PropertiesPage from '@/views/PropertiesPage';

export const metadata: Metadata = {
  title: 'Verified Properties | OwnStay India',
  description: 'Browse engineering verified apartments for rent in Indore, Pune, Chandigarh, Jaipur, and Coimbatore with zero brokerage.'
};

export default function Page() {
  return <PropertiesPage />;
}
