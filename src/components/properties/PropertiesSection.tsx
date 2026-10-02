'use client';

import React, { useState, useMemo, useEffect } from 'react';
import FeaturedProperties from './FeaturedProperties';
import { STATIC_PROPERTIES } from '../../data/staticProperties';
import { getPublicProperties } from '../../features/properties/api';
import { Building2, Sparkles, Loader2 } from 'lucide-react';

function mapApiPropertyToCard(apiProp: any) {
  const photoUrls = (apiProp.photos || [])
    .map((p: any) => (typeof p === 'string' ? p : p.url))
    .filter(Boolean);

  const images =
    photoUrls.length > 0
      ? photoUrls
      : apiProp.coverPhotoUrl
      ? [apiProp.coverPhotoUrl]
      : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'];

  const city = apiProp.location?.city || apiProp.city || 'Jhansi';
  const locality = apiProp.location?.locality || apiProp.location?.addressLine1 || '';
  const neighborhood = locality ? `${locality}, ${city}` : city;
  const price = apiProp.pricing?.monthlyRent || apiProp.rent || apiProp.price || 0;

  const rawAmenities = apiProp.amenities || [];
  const amenities = rawAmenities.map((a: any) =>
    typeof a === 'string' ? { name: a.replace(/_/g, ' '), icon: 'ShieldCheck', verified: true } : a
  );

  const rawId = String(apiProp.id || apiProp.numericId || '');
  const id = rawId.startsWith('prop-') ? rawId : `prop-${rawId}`;

  return {
    id,
    title: apiProp.title || 'Verified Property',
    tagline: apiProp.description
      ? apiProp.description.length > 120
        ? `${apiProp.description.slice(0, 120)}...`
        : apiProp.description
      : 'Zero-brokerage verified accommodation with verified amenities.',
    neighborhood,
    city,
    price,
    rating: 4.95,
    reviewsCount: 12,
    reviewCount: 12,
    verified: true,
    isInstantBook: true,
    nfcSelfTour: true,
    images,
    amenities:
      amenities.length > 0
        ? amenities
        : [
            { name: 'Zero Brokerage', icon: 'ShieldCheck', verified: true },
            { name: 'Verified Amenities', icon: 'ShieldCheck', verified: true }
          ],
    roomType: apiProp.propertyType ? apiProp.propertyType.replace(/_/g, ' ').toUpperCase() : 'Apartment',
    type: apiProp.propertyType || 'apartment',
    rawApiProperty: apiProp
  };
}

export default function PropertiesSection({
  activeTab = 'All',
  onTabChange,
  onOpenModal,
  onOpenCompare,
  showSectionHeader = true,
  searchFilters = null as any,
  compareIds = [] as string[],
  wishlistIds = [] as string[],
  onToggleCompare,
  onToggleWishlist
}: any) {
  const [selectedCityTab, setSelectedCityTab] = useState('All');
  const [liveProperties, setLiveProperties] = useState<any[]>([]);
  const [loadingLive, setLoadingLive] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveProperties() {
      try {
        const res = await getPublicProperties();
        if (isMounted && res.success && res.data) {
          const mapped = (res.data as any[]).map(mapApiPropertyToCard);
          setLiveProperties(mapped);
        }
      } catch (err) {
        console.warn('Failed to load dynamic properties, using static showcase:', err);
      } finally {
        if (isMounted) setLoadingLive(false);
      }
    }
    loadLiveProperties();
    return () => {
      isMounted = false;
    };
  }, []);

  // Combine live published listings first, followed by static curated listings
  const combinedProperties = useMemo(() => {
    const liveIds = new Set(liveProperties.map((p) => p.id));
    const nonDuplicatedStatic = STATIC_PROPERTIES.filter((p) => !liveIds.has(p.id));
    return [...liveProperties, ...nonDuplicatedStatic];
  }, [liveProperties]);

  // Dynamically compute city tabs including cities from published listings (e.g. Jhansi)
  const availableCities = useMemo(() => {
    const citySet = new Set<string>();
    combinedProperties.forEach((p) => {
      if (p.city && typeof p.city === 'string' && p.city.trim()) {
        // Capitalize city name
        const normalized = p.city.trim();
        citySet.add(normalized);
      }
    });

    const standardCities = ['Indore', 'Jaipur', 'Coimbatore', 'Kochi', 'Chandigarh', 'Pune'];
    const otherCities = Array.from(citySet).filter((c) => !standardCities.includes(c));

    return ['All', ...otherCities, ...standardCities];
  }, [combinedProperties]);

  const filteredProperties = useMemo(() => {
    return combinedProperties.filter((p) => {
      // 1. City tab filter
      if (selectedCityTab !== 'All' && p.city?.toLowerCase() !== selectedCityTab.toLowerCase()) {
        return false;
      }
      // 2. SearchBar city filter
      if (
        searchFilters?.selectedCity &&
        searchFilters.selectedCity !== 'all' &&
        p.city?.toLowerCase() !== searchFilters.selectedCity.toLowerCase()
      ) {
        return false;
      }
      // 3. SearchBar maxPrice filter
      if (searchFilters?.maxPrice && (Number(p.price) || 0) > searchFilters.maxPrice) {
        return false;
      }
      // 4. SearchBar roomType filter
      if (searchFilters?.roomType && searchFilters.roomType !== 'all') {
        const query = searchFilters.roomType.toLowerCase();
        if (!(p.roomType || p.type || '').toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [combinedProperties, selectedCityTab, searchFilters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. SECTION HEADER: TITLE + SUBTITLE (ONLY SHOWN ON HOME PAGE / WHEN ENABLED) */}
      {showSectionHeader && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Verified & Zero Brokerage
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A]">
              Featured Properties
            </h2>
            <p className="text-[#6B7280] text-base mt-2">
              Physically audited apartments ready for instant NFC smart-lock self-touring.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] shrink-0">
            <span>Showing {filteredProperties.length} verified listings</span>
          </div>
        </div>
      )}

      {/* 2. SLEEK FILTER OPTION PILL BAR BELOW HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[#EDEDED]">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 max-w-full">
          {availableCities.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCityTab(c)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                selectedCityTab === c
                  ? 'bg-[#E1224D] text-white shadow-apple'
                  : 'bg-white text-[#6B7280] border border-[#EDEDED] hover:text-[#1A1A1A] hover:border-[#D1D5DB]'
              }`}
            >
              {c === 'All' ? 'All Verified Rooms' : `${c} Hub`}
            </button>
          ))}
        </div>
      </div>

      {/* 3. PROPERTY CARDS GRID */}
      <FeaturedProperties
        properties={filteredProperties}
        wishlistIds={wishlistIds}
        compareIds={compareIds}
        onToggleWishlist={onToggleWishlist || (() => {})}
        onToggleCompare={onToggleCompare || onOpenCompare || (() => {})}
        onSelectProperty={onOpenModal}
        showHeader={false}
      />
    </div>
  );
}
