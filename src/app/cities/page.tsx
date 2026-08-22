import React from 'react';
import type { Metadata } from 'next';
import CitiesPage from '../../views/CitiesPage';

export const metadata: Metadata = {
  title: "India's Fastest-Growing Tier-2 Tech Hubs | ApnaStay Cities",
  description: 'Explore rental yields, average acoustic decibel levels, and gigabit fiber availability across Indian Tier-2 cities.'
};

export default function Page() {
  return <CitiesPage />;
}
