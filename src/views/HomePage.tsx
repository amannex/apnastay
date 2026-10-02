'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import HeroSection from '../components/hero/HeroSection';
import WhatWeSolveSection from '../components/sections/WhatWeSolveSection';
import LocalityDiscovery from '../components/sections/LocalityDiscovery';
import PropertiesSection from '../components/properties/PropertiesSection';
import HowItWorksSimple from '../components/sections/HowItWorksSimple';
import OwnerCalloutSection from '../components/sections/OwnerCalloutSection';
import CommunitySection from '../components/sections/CommunitySection';
import FAQSection from '../components/sections/FaqSection';
import FinalCtaSection from '../components/sections/FinalCtaSection';
import { useApp } from '../context/AppContext';

export default function HomePage(props: any = {}) {
  const app = useApp();
  const searchFilters = props.searchFilters || app.searchFilters;
  const onSearchChange = props.onSearchChange || app.onSearchChange;
  const onReset = props.onReset || app.onReset;
  const onCitySelect = props.onCitySelect || app.onCitySelect;
  const onOpenModal = props.onOpenModal || app.onOpenModal;
  const onOpenCompare = props.onOpenCompare || app.onOpenCompare;
  const compareIds = props.compareIds || app.compareIds;
  const wishlistIds = props.wishlistIds || app.wishlistIds;
  const onToggleCompare = props.onToggleCompare || app.onToggleCompare;
  const onToggleWishlist = props.onToggleWishlist || app.onToggleWishlist;
  const activeTab = props.activeTab || app.activeTab || 'All';
  const onTabChange = props.onTabChange || app.onTabChange || (() => {});

  const handleLocalitySelect = (city: string) => {
    if (onSearchChange) {
      onSearchChange('city', city);
    }
    if (onCitySelect) {
      onCitySelect(city);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* 1. 100SVH TYPOGRAPHY-LED HERO WITH REPOSITIONED SEARCH BAR */}
      <HeroSection
        filters={searchFilters}
        onChange={onSearchChange}
        onReset={onReset}
      />

      {/* 2. WHAT WE'RE SOLVING: WHY APNASTAY IS BUILT FOR LONG-TERM RENTING */}
      <WhatWeSolveSection />

      {/* 3. LOCALITY-BASED DISCOVERY: EARLY VALIDATION FOCUS HUBS */}
      <LocalityDiscovery onSelectLocality={handleLocalitySelect} />

      {/* 4. GENUINE PROPERTIES: CURRENT AVAILABLE SUPPLY */}
      <section id="properties" className="pt-16 pb-12 bg-white border-b border-[#EDEDED]">
        <PropertiesSection
          activeTab={activeTab}
          onTabChange={onTabChange}
          onOpenModal={onOpenModal}
          onOpenCompare={onOpenCompare}
          compareIds={compareIds}
          wishlistIds={wishlistIds}
          onToggleCompare={onToggleCompare || onOpenCompare}
          onToggleWishlist={onToggleWishlist}
          searchFilters={searchFilters}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-2 text-center">
          <Link
            href="/properties"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#1A1A1A] hover:bg-[#ED3258] text-white font-semibold text-xs sm:text-sm shadow-apple hover:shadow-apple-md transition-all active:scale-[0.98]"
          >
            <span>Browse All Available Properties</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>
      </section>

      {/* 5. SIMPLE HOW IT WORKS FOR TENANTS & OWNERS */}
      <HowItWorksSimple />

      {/* 6. FOR PROPERTY OWNERS: DIRECT OWNER LISTING CALLOUT */}
      <OwnerCalloutSection />

      {/* 7. EARLY COMMUNITY & TRUST SECTION */}
      <CommunitySection />

      {/* 8. HONEST, GROUNDED FAQS */}
      <FAQSection />

      {/* 9. FINAL ACTION CTA */}
      <FinalCtaSection />
    </main>
  );
}
