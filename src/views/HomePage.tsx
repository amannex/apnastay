'use client';

import React from 'react';
import AppleSimpleHero from '../components/hero/AppleSimpleHero';
import SearchBar from '../components/search/SearchBar';
import CitiesCarousel from '../components/sections/CitiesCarousel';
import WhyApnaStayGrid from '../components/sections/WhyApnaStayGrid';
import PropertiesSection from '../components/properties/PropertiesSection';
import BlogSection from '../components/sections/BlogSection';
import FAQSection from '../components/sections/FaqSection';
import RentalCategoriesShowcase from '../components/sections/RentalCategoriesShowcase';
import ManagedServicesShowcase from '../components/sections/ManagedServicesShowcase';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AppLaunchBanner from '../components/sections/AppLaunchBanner';
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
  const onOpenAiMatchmaker = props.onOpenAiMatchmaker || app.onOpenAiMatchmaker;
  const activeTab = props.activeTab || app.activeTab || 'All';
  const onTabChange = props.onTabChange || app.onTabChange || (() => { });
  return (
    <main className="min-h-screen bg-white">
      {/* 1. APPLE SIMPLE LIGHT THEME HERO */}
      <AppleSimpleHero />

      {/* 2. SEARCH & FILTER SECTION & CITIES CAROUSEL ON SEAMLESS WHITE BACKGROUND */}
      <section className="bg-white pb-12 border-b border-[#EDEDED]">
        <div className="relative z-30 pt-4 pb-6">
          <SearchBar filters={searchFilters} onChange={onSearchChange} onReset={onReset} />
        </div>

        <div className="pt-2">
          <CitiesCarousel onCityClick={onCitySelect} />
        </div>
      </section>

      {/* 3.5. INDIAN RENTAL STAY CATEGORIES */}
      <RentalCategoriesShowcase />

      {/* 4. WHY APNASTAY ZERO-BROKERAGE PROMISE */}
      <WhyApnaStayGrid />

      {/* 5. FEATURED VERIFIED ROOMS WITH LINK TO MULTI-PAGE EXPLORER */}
      <section className="pt-16 pb-12 bg-[#FAFAFA] border-b border-[#EDEDED]">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-2 text-center">
          <Link
            href="/properties"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#E1224D] text-white font-bold text-xs sm:text-sm shadow-apple hover:bg-[#C71B42] transition-all hover:scale-105 whitespace-nowrap max-w-full"
          >
            <span className="sm:hidden">Browse All 1,200+ Verified Homes</span>
            <span className="hidden sm:inline">Browse All 1,200+ Verified Homes Across India</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>
      </section>

      {/* 5.5. MANAGED LIVING SERVICES & TRUST (bg-[#FAFAFA]) */}
      <ManagedServicesShowcase />

      {/* 6. APNASTAY JOURNAL & URBAN LIVING GUIDE */}
      <BlogSection />

      {/* 6.5. GOOGLE PLAY STORE MOBILE APP COMING SOON BANNER */}
      <AppLaunchBanner />

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <FAQSection />
    </main>
  );
}
