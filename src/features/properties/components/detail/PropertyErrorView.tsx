'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Search, AlertCircle, ArrowLeft } from 'lucide-react';

interface PropertyErrorViewProps {
  title?: string;
  message?: string;
  type?: 'not_found' | 'unavailable' | 'error';
}

export default function PropertyErrorView({
  title = 'Property Not Found',
  message = 'This property may have been removed, rented, or is no longer available.',
  type = 'not_found'
}: PropertyErrorViewProps) {
  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-[#FAFAFA] px-4 py-16">
      <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 sm:p-10 border border-[#EDEDED] shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#E1224D] flex items-center justify-center mx-auto mb-6 shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight mb-2">
          {title}
        </h1>

        <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/properties"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#E1224D] hover:bg-[#c91d43] text-white text-xs font-bold transition-all shadow-sm"
          >
            <Search className="w-4 h-4" />
            <span>Find ApnaStay</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
