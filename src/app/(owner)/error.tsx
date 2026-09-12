'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home, LifeBuoy } from 'lucide-react';

interface OwnerErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js App Router Error Boundary for all Owner Routes: /owner/*
 * Prevents unhandled exceptions from crashing the entire owner portal.
 */
export default function OwnerDashboardError({ error, reset }: OwnerErrorProps) {
  useEffect(() => {
    // Log unexpected errors to console or error monitoring service (Sentry, LogRocket, etc.)
    console.error('[OwnerDashboardError] Uncaught dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div
        role="alert"
        aria-live="assertive"
        className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 shadow-xl text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-6">
          <AlertCircle className="h-9 w-9" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
          Unable to Load Owner Dashboard
        </h1>

        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          We encountered an unexpected problem while loading your property management data.
          Your listings and draft changes remain safe and synchronized.
        </p>

        {process.env.NODE_ENV !== 'production' && (
          <div className="mb-6 rounded-xl bg-gray-50 p-4 border border-gray-200 text-left text-xs font-mono text-red-700 overflow-x-auto max-h-36">
            <p className="font-semibold">{error.name}: {error.message}</p>
            {error.digest && <p className="text-gray-500 mt-1 text-[11px]">Digest: {error.digest}</p>}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF385C] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#E00B41] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <Link
            href="/owner/dashboard/properties"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2"
          >
            <Home className="h-4 w-4 text-gray-500" />
            My Properties
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
          <LifeBuoy className="h-4 w-4 text-gray-400" />
          <span>Need help? Contact <a href="mailto:support@apnastay.in" className="font-medium text-[#FF385C] hover:underline">support@apnastay.in</a></span>
        </div>
      </div>
    </div>
  );
}
