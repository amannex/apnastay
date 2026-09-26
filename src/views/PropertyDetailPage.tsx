'use client';
import React from 'react';
import { normalizeProperty } from '@/features/properties/adapter';
import { PropertyDetailContainer } from '@/features/properties/components/detail';
import type { Property } from '@/types';

interface PropertyDetailPageProps {
  property: Property | any;
}

export default function PropertyDetailPage({ property }: PropertyDetailPageProps) {
  const normalized = normalizeProperty(property);
  return <PropertyDetailContainer property={normalized} />;
}
