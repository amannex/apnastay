import React from 'react';
import { PropertyErrorView } from '@/features/properties/components/detail';

export default function NotFound() {
  return (
    <PropertyErrorView
      title="Property Not Found"
      message="The requested property may have been unlisted, rented out, or the link has expired."
      type="not_found"
    />
  );
}
