import React from 'react';
import { PropertyErrorView } from '@/features/properties/components/detail';

export default function NotFound() {
  return (
    <PropertyErrorView
      title="Property Not Found"
      message="This property may have been unlisted, rented out, or the link has changed."
      type="not_found"
    />
  );
}
