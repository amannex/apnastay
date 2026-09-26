'use client';

import React, { useEffect } from 'react';
import PropertyErrorView from '@/features/properties/components/detail/PropertyErrorView';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[SinglePropertyPage] Unhandled route error:', error);
  }, [error]);

  return (
    <PropertyErrorView
      title="We couldn't load this property."
      message="Please try again."
      type="error"
      onRetry={reset}
    />
  );
}
