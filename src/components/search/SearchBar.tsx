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
    { id: 'all', label: 'All Room Types' },
    { id: '1BHK', label: '1BHK Suite / Loft' },
    { id: '2BHK', label: '2BHK Residence' },
    { id: 'Studio', label: 'Studio Apartment' },
    { id: 'Executive', label: 'Executive Suite' },
    { id: 'Luxury', label: 'Luxury Waterfront' }
  ];

  const budgetOptions = [
    { value: 50000, label: '₹50,000+/mo (All Budgets)' },
    { value: 35000, label: 'Under ₹35,000 / month' },
    { value: 25000, label: 'Under ₹25,000 / month' },
    { value: 20000, label: 'Under ₹20,000 / month' },
    { value: 15000, label: 'Under ₹15,000 / month' }
  ];

  const hasActiveFilters = activeCity !== 'all' || activePrice < 50000 || activeRoomType !== 'all';

  return (
    <div className="w-full max-w-6xl mx-auto px-4 relative z-40">
      <div className="bg-white rounded-[2rem] p-3 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-[#EDEDED] hover:border-[#D1D5DB] transition-all">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* STEP 1: CITY SELECTOR */}
          <div className="w-full md:w-auto flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-[#FAFAFA] transition-colors border border-transparent hover:border-[#EDEDED] relative">
            <MapPin className="w-5 h-5 text-[#E1224D] shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                City / Location
              </label>
              <select
                value={activeCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#1A1A1A] focus:outline-none cursor-pointer appearance-none pr-6"
              >
                <option value="all">All Indian Cities</option>
                {activeCities.map((c: any) => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-4 h-4 text-[#6B7280] pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
          </div>

          <div className="hidden md:block w-px h-10 bg-[#EDEDED]" />

          {/* STEP 2: BUDGET SELECTOR */}
          <div className="w-full md:w-auto flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-[#FAFAFA] transition-colors border border-transparent hover:border-[#EDEDED] relative">
            <IndianRupee className="w-5 h-5 text-[#E1224D] shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                Max Budget
              </label>
              <select
                value={activePrice}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#1A1A1A] focus:outline-none cursor-pointer appearance-none pr-6"
              >
                {budgetOptions.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-4 h-4 text-[#6B7280] pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
          </div>

          <div className="hidden md:block w-px h-10 bg-[#EDEDED]" />

          {/* STEP 3: ROOM TYPE SELECTOR */}
          <div className="w-full md:w-auto flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-[#FAFAFA] transition-colors border border-transparent hover:border-[#EDEDED] relative">
            <Home className="w-5 h-5 text-[#E1224D] shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                Room Type
              </label>
              <select
                value={activeRoomType}
                onChange={(e) => handleRoomTypeChange(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#1A1A1A] focus:outline-none cursor-pointer appearance-none pr-6"
              >
                {roomTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-4 h-4 text-[#6B7280] pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
          </div>

          {/* SEARCH BUTTON & MATCH COUNT */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleSearchClick}
              className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[#E1224D] text-white font-bold text-sm shadow-apple hover:bg-[#C71B42] transition-all cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>Search</span>
              {activeResults > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 font-bold ml-0.5">
                  {activeResults} {activeResults === 1 ? 'Home' : 'Homes'}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-3.5 rounded-2xl bg-[#FAFAFA] hover:bg-[#EDEDED] text-[#6B7280] hover:text-[#1A1A1A] transition-colors border border-[#EDEDED]"
                title="Reset filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

