import React from 'react';
import type { Metadata } from 'next';
import PropertiesPage from '../../views/PropertiesPage';

export const metadata: Metadata = {
  title: 'Verified Indian Rental Properties | OwnStay',
  description: 'Explore verified zero-brokerage rental apartments across Indore, Jaipur, Coimbatore, Kochi, Chandigarh, and Pune.'
};

export default function Page() {
  return <PropertiesPage />;
}
