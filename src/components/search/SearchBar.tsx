'use client';

import React from 'react';
import { Search, MapPin, IndianRupee, Home, X, ChevronDown } from 'lucide-react';

export default function SearchBar({
  filters,
  onChange,
  onReset,
  cities = [],
  selectedCity = 'all',
  onCityChange,
  maxPrice = 50000,
  onPriceChange,
  roomType = 'all',
  onRoomTypeChange,
  totalResults = 0
}: any) {
  // Support both HomePage object-style props (filters/onChange) and standalone props
  const activeCities = (filters && filters.cities && filters.cities.length > 0)
    ? filters.cities
    : cities;
  const activeCity = (filters && filters.selectedCity !== undefined)
    ? filters.selectedCity
    : selectedCity;
  const activePrice = (filters && filters.maxPrice !== undefined)
    ? filters.maxPrice
    : (maxPrice !== 3000 ? maxPrice : 50000);
  const activeRoomType = (filters && filters.roomType !== undefined)
    ? filters.roomType
    : roomType;
  const activeResults = (filters && filters.totalResults !== undefined)
    ? filters.totalResults
    : totalResults;

  const handleCityChange = (val: string) => {
    if (onChange) onChange('city', val);
    if (onCityChange) onCityChange(val);
  };

  const handlePriceChange = (val: string) => {
    if (onChange) onChange('price', Number(val));
    if (onPriceChange) onPriceChange(Number(val));
  };

  const handleRoomTypeChange = (val: string) => {
    if (onChange) onChange('roomType', val);
    if (onRoomTypeChange) onRoomTypeChange(val);
  };

  const handleResetFilters = () => {
    if (onReset) onReset();
    if (onChange) {
      onChange('city', 'all');
      onChange('price', 50000);
      onChange('roomType', 'all');
    }
  };

  const handleSearchClick = () => {
    const el = document.getElementById('properties');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/properties';
    }
  };

  const roomTypes = [
    { id: 'all', label: 'Room Type' },
    { id: '1BHK', label: '1BHK Suite / Loft' },
    { id: '2BHK', label: '2BHK Residence' },
    { id: 'Studio', label: 'Studio Apartment' },
    { id: 'Executive', label: 'Executive Suite' },
    { id: 'Luxury', label: 'Luxury Waterfront' }
  ];

  const budgetOptions = [
    { value: 50000, label: 'Max Budget' },
    { value: 35000, label: 'Under ₹35,000 / month' },
    { value: 25000, label: 'Under ₹25,000 / month' },
    { value: 20000, label: 'Under ₹20,000 / month' },
    { value: 15000, label: 'Under ₹15,000 / month' }
  ];

  const hasActiveFilters = activeCity !== 'all' || activePrice < 50000 || activeRoomType !== 'all';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 relative z-40">
      <div className="bg-white rounded-3xl md:rounded-full p-2 sm:p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-[#EDEDED] hover:border-[#D1D5DB] transition-all">
        <div className="flex flex-col md:flex-row items-center justify-between gap-1 sm:gap-2">
          {/* STEP 1: CITY SELECTOR */}
          <div className="w-full md:w-auto flex-1 flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-full hover:bg-[#FAFAFA] transition-colors relative cursor-pointer group">
            <MapPin className="w-5 h-5 text-[#ED3258] shrink-0" />
            <div className="flex-1 min-w-0">
              <select
                value={activeCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className={`w-full bg-transparent text-sm focus:outline-none cursor-pointer appearance-none pr-6 ${
                  activeCity === 'all' ? 'text-[#6B7280] font-medium' : 'text-[#1A1A1A] font-bold'
                }`}
              >
                <option value="all">City / Locality</option>
                {activeCities.map((c: any) => (
                  <option key={c.id || c.name} value={c.name} className="text-[#1A1A1A]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-4 h-4 text-[#9CA3AF] pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 group-hover:text-[#1A1A1A] transition-colors" />
          </div>

          <div className="hidden md:block w-px h-8 bg-[#EDEDED]" />

          {/* STEP 2: BUDGET SELECTOR */}
          <div className="w-full md:w-auto flex-1 flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-full hover:bg-[#FAFAFA] transition-colors relative cursor-pointer group">
            <IndianRupee className="w-5 h-5 text-[#ED3258] shrink-0" />
            <div className="flex-1 min-w-0">
              <select
                value={activePrice}
                onChange={(e) => handlePriceChange(e.target.value)}
                className={`w-full bg-transparent text-sm focus:outline-none cursor-pointer appearance-none pr-6 ${
                  activePrice >= 50000 ? 'text-[#6B7280] font-medium' : 'text-[#1A1A1A] font-bold'
                }`}
              >
                {budgetOptions.map((b) => (
                  <option key={b.value} value={b.value} className="text-[#1A1A1A]">
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-4 h-4 text-[#9CA3AF] pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 group-hover:text-[#1A1A1A] transition-colors" />
          </div>

          <div className="hidden md:block w-px h-8 bg-[#EDEDED]" />

          {/* STEP 3: ROOM TYPE SELECTOR */}
          <div className="w-full md:w-auto flex-1 flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-full hover:bg-[#FAFAFA] transition-colors relative cursor-pointer group">
            <Home className="w-5 h-5 text-[#ED3258] shrink-0" />
            <div className="flex-1 min-w-0">
              <select
                value={activeRoomType}
                onChange={(e) => handleRoomTypeChange(e.target.value)}
                className={`w-full bg-transparent text-sm focus:outline-none cursor-pointer appearance-none pr-6 ${
                  activeRoomType === 'all' ? 'text-[#6B7280] font-medium' : 'text-[#1A1A1A] font-bold'
                }`}
              >
                {roomTypes.map((t) => (
                  <option key={t.id} value={t.id} className="text-[#1A1A1A]">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-4 h-4 text-[#9CA3AF] pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 group-hover:text-[#1A1A1A] transition-colors" />
          </div>

          {/* SEARCH BUTTON (CIRCULAR IN PRIMARY COLOR) */}
          <div className="w-full md:w-auto flex items-center justify-end gap-2 shrink-0 pr-1">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2.5 rounded-full bg-[#FAFAFA] hover:bg-[#EDEDED] text-[#6B7280] hover:text-[#1A1A1A] transition-colors border border-[#EDEDED] cursor-pointer"
                title="Reset filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleSearchClick}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#ED3258] hover:bg-[#C71B42] text-white flex items-center justify-center shadow-apple hover:shadow-apple-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Search properties"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

