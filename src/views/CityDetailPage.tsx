'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  ShieldCheck,
  ChevronRight,
  Train,
  Tag,
  ArrowRight,
  Users,
  CheckCircle2,
  Sparkles,
  Send,
  Building2,
  PhoneCall,
  Clock,
  Compass,
} from 'lucide-react';
import type { CityHierarchy, Locality } from '@/data/locations';
import {
  GurugramIllustration,
  GhaziabadIllustration,
  NoidaIllustration,
  DelhiIllustration,
  MoreCitiesIllustration,
} from '@/components/sections/CityIllustrations';
import { STATIC_PROPERTIES } from '@/data/staticProperties';
import FeaturedProperties from '@/components/properties/FeaturedProperties';

interface CityDetailPageProps {
  city: CityHierarchy;
  initialLocalitySlug?: string;
}

export default function CityDetailPage({
  city,
  initialLocalitySlug,
}: CityDetailPageProps) {
  const [selectedLocalitySlug, setSelectedLocalitySlug] = useState<string>(
    initialLocalitySlug || 'all'
  );

  // Tenant inquiry form state
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantBhk, setTenantBhk] = useState('1 BHK');
  const [tenantSubmitted, setTenantSubmitted] = useState(false);

  // Community join state
  const [communityJoined, setCommunityJoined] = useState(false);

  // Selected locality object
  const activeLocality: Locality | undefined =
    selectedLocalitySlug !== 'all'
      ? city.localities.find((l) => l.slug === selectedLocalitySlug)
      : undefined;

  // Filter properties matching this city and locality if available
  const cityProperties = STATIC_PROPERTIES.filter((p) => {
    const matchesCity =
      p.city?.toLowerCase() === city.name.toLowerCase() ||
      p.city?.toLowerCase() === city.slug.toLowerCase();

    if (!matchesCity) return false;

    if (activeLocality) {
      const propNeighborhood = (p.neighborhood || '').toLowerCase();
      const locName = activeLocality.name.toLowerCase();
      return propNeighborhood.includes(locName);
    }

    return true;
  });

  // Illustration lookup
  const getCityIllustration = (slug: string) => {
    switch (slug) {
      case 'gurugram':
        return <GurugramIllustration className="w-full h-full text-[#1E293B]" />;
      case 'ghaziabad':
        return <GhaziabadIllustration className="w-full h-full text-[#1E293B]" />;
      case 'noida':
        return <NoidaIllustration className="w-full h-full text-[#1E293B]" />;
      case 'delhi':
        return <DelhiIllustration className="w-full h-full text-[#1E293B]" />;
      default:
        return <MoreCitiesIllustration className="w-full h-full text-[#1E293B]" />;
    }
  };

  const handleTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim() || !tenantPhone.trim()) return;
    setTenantSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] pt-24 sm:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. BREADCRUMBS NAVIGATION (Country -> City -> Locality) */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#6B7280] mb-8 overflow-x-auto whitespace-nowrap"
        >
          <Link href="/" className="hover:text-[#111827] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <Link href="/cities" className="hover:text-[#111827] transition-colors">
            {city.country}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-semibold text-[rgb(17,24,39)]">{city.name}</span>
          {activeLocality && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-[#E1224D] font-medium">{activeLocality.name}</span>
            </>
          )}
        </nav>

        {/* 2. CITY HERO SECTION */}
        <div className="bg-white rounded-3xl border border-[#EDEDED] p-6 sm:p-8 md:p-10 shadow-xs mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4 sm:gap-6">
              {/* City Outlined Circular Icon */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] p-3 shrink-0 flex items-center justify-center shadow-xs">
                {getCityIllustration(city.slug)}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold uppercase tracking-wider">
                    <MapPin className="w-3 h-3" />
                    {city.country}
                  </span>
                  {city.stage === 'validation' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
                      <Clock className="w-3 h-3" />
                      Expanding Locality-by-Locality
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Hub Active
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[rgb(17,24,39)]">
                  {city.name}
                </h1>
                <p className="mt-1 text-sm sm:text-base text-[rgb(107,114,128)] font-medium">
                  {city.tagline}
                </p>
              </div>
            </div>

            {/* Quick Community CTA */}
            <div className="flex sm:flex-col sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 gap-2 shrink-0">
              <span className="text-xs text-[#6B7280]">ApnaStay Promise</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ₹0 Brokerage Guaranteed
              </span>
            </div>
          </div>

          <p className="mt-6 text-sm sm:text-base text-[#4B5563] leading-relaxed max-w-4xl border-t border-[#F3F4F6] pt-5">
            {city.description}
          </p>

          {/* City Key Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#F3F4F6]">
            <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#EDEDED]">
              <span className="text-xs text-[#6B7280] font-medium block">Localities</span>
              <span className="text-lg sm:text-xl font-bold text-[rgb(17,24,39)] mt-0.5 block">
                {city.stats.localitiesCount} Focused Hubs
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#EDEDED]">
              <span className="text-xs text-[#6B7280] font-medium block">Avg. Long-Term Rent</span>
              <span className="text-lg sm:text-xl font-bold text-[rgb(17,24,39)] mt-0.5 block">
                {city.stats.avgRentDisplay}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#EDEDED]">
              <span className="text-xs text-[#6B7280] font-medium block">Livability Score</span>
              <span className="text-lg sm:text-xl font-bold text-[rgb(17,24,39)] mt-0.5 block">
                {city.stats.livabilityScore} / 100
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#EDEDED]">
              <span className="text-xs text-[#6B7280] font-medium block">Verified Renters</span>
              <span className="text-lg sm:text-xl font-bold text-[#E1224D] mt-0.5 block">
                {city.stats.verifiedWaitlistCount}+ Members
              </span>
            </div>
          </div>
        </div>

        {/* 3. LOCALITY DISCOVERY & FILTERING (Step 2: City -> Locality) */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
            <div>
              <span className="text-xs font-bold text-[#E1224D] uppercase tracking-wider">
                Discover By Locality
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[rgb(17,24,39)] mt-1">
                Explore Top Localities in {city.name}
              </h2>
              <p className="text-sm text-[rgb(107,114,128)] mt-0.5">
                Select a locality to view community trends, transit links, and verified homes.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setSelectedLocalitySlug('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedLocalitySlug === 'all'
                    ? 'bg-[#111827] text-white shadow-xs'
                    : 'bg-white border border-[#EDEDED] text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                All Localities ({city.localities.length})
              </button>
              {city.localities.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setSelectedLocalitySlug(loc.slug)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedLocalitySlug === loc.slug
                      ? 'bg-[#E1224D] text-white shadow-xs'
                      : 'bg-white border border-[#EDEDED] text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Locality Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {city.localities.map((locality) => {
              const isSelected = selectedLocalitySlug === locality.slug;

              return (
                <div
                  key={locality.id}
                  onClick={() =>
                    setSelectedLocalitySlug(isSelected ? 'all' : locality.slug)
                  }
                  className={`group bg-white rounded-2xl p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#E1224D] ring-2 ring-rose-100 shadow-md scale-[1.01]'
                      : 'border-[#EDEDED] hover:border-gray-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold text-[#E1224D] bg-rose-50 px-2 py-0.5 rounded-full">
                        {locality.avgRent}
                      </span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isSelected ? 'bg-[#E1224D]' : 'bg-gray-300 group-hover:bg-gray-400'
                        }`}
                      />
                    </div>

                    <h3 className="text-base font-bold text-[rgb(17,24,39)] group-hover:text-[#E1224D] transition-colors">
                      {locality.name}
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">
                      {locality.tagline}
                    </p>

                    {/* Transit highlight */}
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-[#4B5563] bg-[#F8F9FA] px-2.5 py-1.5 rounded-lg border border-gray-100">
                      <Train className="w-3.5 h-3.5 text-[#E1224D] shrink-0" />
                      <span className="truncate">{locality.transitHighlight}</span>
                    </div>

                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {locality.popularTags.slice(0, 2).map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-100"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#6B7280] group-hover:text-[#E1224D]">
                    <span>{isSelected ? 'Selected' : 'View Hub'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. PROPERTIES SECTION (Step 3: Locality -> Properties) */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-[#E1224D] uppercase tracking-wider">
                Available Homes
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[rgb(17,24,39)] mt-1">
                {activeLocality
                  ? `Homes in ${activeLocality.name}, ${city.name}`
                  : `Rental Inventory in ${city.name}`}
              </h2>
            </div>
            {cityProperties.length > 0 && (
              <span className="text-xs font-semibold text-[#6B7280] bg-white px-3 py-1.5 rounded-full border border-gray-200">
                {cityProperties.length} Verified Rooms
              </span>
            )}
          </div>

          {cityProperties.length > 0 ? (
            <FeaturedProperties properties={cityProperties} showHeader={false} />
          ) : (
            /* VALIDATION STAGE NOTICE */
            <div className="bg-white rounded-3xl border border-[#EDEDED] p-8 sm:p-10 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#E1224D] flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[rgb(17,24,39)]">
                {activeLocality
                  ? `Active Landlord Audits in ${activeLocality.name}`
                  : `Localities Under Active Validation in ${city.name}`}
              </h3>
              <p className="mt-2 text-sm text-[#6B7280] max-w-xl mx-auto leading-relaxed">
                Rather than listing unverified broker inventory, our field team physically inspects
                each property in {activeLocality ? activeLocality.name : city.name} for 100% genuine
                direct-owner agreements.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#tenant-intent"
                  className="px-5 py-2.5 rounded-full bg-[#E1224D] text-white text-xs font-bold shadow-xs hover:bg-[#C71B42] transition-colors"
                >
                  Post Room Requirement in {city.name}
                </a>
                <a
                  href="#community-hub"
                  className="px-5 py-2.5 rounded-full bg-white border border-[#EDEDED] text-xs font-semibold text-[#111827] hover:border-gray-400 transition-colors"
                >
                  Join {city.name} Waitlist Community
                </a>
              </div>
            </div>
          )}
        </section>

        {/* 5. TENANT & OWNER INTENT MODULE (Step 4: Intent Capture) */}
        <section id="tenant-intent" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          {/* Tenant Intent Card */}
          <div className="bg-white rounded-3xl border border-[#EDEDED] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E1224D] flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#E1224D] uppercase tracking-wider">
                For Renters
              </span>
              <h3 className="text-xl font-bold text-[rgb(17,24,39)] mt-1 mb-2">
                Looking to rent in {city.name}?
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed mb-6">
                Tell us your preferred locality, budget, and configuration. When genuine owner listings
                are certified, you get first priority with zero broker spam.
              </p>

              {tenantSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Requirement Recorded!
                  </div>
                  Our {city.name} on-ground coordinator will notify you as soon as verified listings match
                  your preferences.
                </div>
              ) : (
                <form onSubmit={handleTenantSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E1224D]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765..."
                        value={tenantPhone}
                        onChange={(e) => setTenantPhone(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E1224D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Stay Type
                      </label>
                      <select
                        value={tenantBhk}
                        onChange={(e) => setTenantBhk(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E1224D] bg-white"
                      >
                        <option value="Single Room / Studio">Single Room / Studio</option>
                        <option value="1 BHK">1 BHK Apartment</option>
                        <option value="2 BHK">2 BHK Apartment</option>
                        <option value="Co-Living Suite">Co-Living Suite</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#111827] text-white text-xs font-bold hover:bg-black transition-colors"
                  >
                    <span>Request Verified Home Connect</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Owner Intent Card */}
          <div className="bg-white rounded-3xl border border-[#EDEDED] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                For Property Owners
              </span>
              <h3 className="text-xl font-bold text-[rgb(17,24,39)] mt-1 mb-2">
                Have a flat or floor in {city.name}?
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed mb-6">
                List with 100% zero brokerage. Direct connect with verified corporate & tech tenants,
                free digital Aadhaar rent agreement, and zero broker commission deductions.
              </p>

              <div className="space-y-3 p-4 rounded-2xl bg-[#F8F9FA] border border-gray-100 text-xs text-gray-700 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No 1-month brokerage fee to middlemen</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified police & background checked tenants</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct rent deposit straight to your bank account</span>
                </div>
              </div>
            </div>

            <Link
              href="/list-apnastay"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#E1224D] text-white text-xs font-bold shadow-xs hover:bg-[#C71B42] transition-colors"
            >
              <span>List Your {city.name} Home (₹0 Brokerage)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* 6. RELEVANT LOCAL COMMUNITY HUB (Step 5: Local Community) */}
        <section id="community-hub" className="bg-white rounded-3xl border border-[#EDEDED] p-8 sm:p-10 shadow-xs">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-4">
              <Users className="w-3.5 h-3.5" />
              {city.community.badge}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[rgb(17,24,39)] tracking-tight">
              {city.community.name}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#6B7280] leading-relaxed">
              {city.community.description}
            </p>

            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500 font-medium">
              <span>✓ {city.community.memberCount}+ Local Members</span>
              <span>✓ Verified Flatmates & Rooms</span>
              <span>✓ No Broker Spam Allowed</span>
            </div>

            <div className="mt-8">
              {communityJoined ? (
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  You&apos;re on the {city.name} Community priority list! Invitation link sent via SMS.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCommunityJoined(true)}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#111827] text-white text-xs font-bold hover:bg-black transition-transform hover:scale-105 shadow-sm"
                >
                  <Users className="w-4 h-4 text-[#E1224D]" />
                  <span>{city.community.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
