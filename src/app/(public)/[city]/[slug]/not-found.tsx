import React from 'react';
import PropertyErrorView from '@/features/properties/components/detail/PropertyErrorView';

export default function NotFound() {
  return (
    <PropertyErrorView
      title="Property not found"
      message="This property may have been removed or is no longer available."
      type="not_found"
    />
  );
}
