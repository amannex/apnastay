'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Building2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function FinalCtaSection() {
  const { currentUser } = useApp();

  const listPropertyUrl = currentUser
    ? '/owner/dashboard/properties/new'
    : '/register?role=property_owner&redirect=/owner/dashboard/properties/new';

  const handleSearchScroll = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A]">
          Ready to find your next home?
        </h2>
        <p className="mt-4 text-sm sm:text-base text-[#6B7280] max-w-xl mx-auto leading-relaxed">
          Skip the endless classifieds and broker commissions. Find a genuine long-term stay or list your space directly on ApnaStay.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={handleSearchScroll}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#1A1A1A] hover:bg-[#ED3258] text-white text-xs sm:text-sm font-semibold shadow-apple hover:shadow-apple-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search Available Homes</span>
          </button>

          <Link
            href={listPropertyUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-[#FAFAFA] text-[#1A1A1A] border border-[#EDEDED] hover:border-[#D1D5DB] text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <Building2 className="w-4 h-4 text-[#ED3258]" />
            <span>List Your Space</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
