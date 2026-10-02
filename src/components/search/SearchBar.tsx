'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, IndianRupee, Home, X, ChevronDown, Check } from 'lucide-react';

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
  const [openDropdown, setOpenDropdown] = useState<'city' | 'budget' | 'room' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setOpenDropdown(null);
  };

  const handlePriceChange = (val: number) => {
    if (onChange) onChange('price', val);
    if (onPriceChange) onPriceChange(val);
    setOpenDropdown(null);
  };

  const handleRoomTypeChange = (val: string) => {
    if (onChange) onChange('roomType', val);
    if (onRoomTypeChange) onRoomTypeChange(val);
    setOpenDropdown(null);
  };

  const handleResetFilters = () => {
    if (onReset) onReset();
    if (onChange) {
      onChange('city', 'all');
      onChange('price', 50000);
      onChange('roomType', 'all');
    }
    setOpenDropdown(null);
  };

  const handleSearchClick = () => {
    setOpenDropdown(null);
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

  const currentBudgetLabel = budgetOptions.find((b) => b.value === activePrice)?.label || 'Max Budget';
  const currentRoomLabel = roomTypes.find((r) => r.id === activeRoomType)?.label || 'Room Type';

  const hasActiveFilters = activeCity !== 'all' || activePrice < 50000 || activeRoomType !== 'all';

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto px-4 relative z-40">
      <div className="bg-white rounded-3xl md:rounded-full p-2 sm:p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-[#EDEDED] hover:border-[#D1D5DB] transition-all">
        <div className="flex flex-col md:flex-row items-center justify-between gap-1 sm:gap-2">
          
          {/* STEP 1: CITY SELECTOR */}
          <div className="w-full md:w-auto flex-1 relative">
            <button
              type="button"
              onClick={() => setOpenDropdown((prev) => (prev === 'city' ? null : 'city'))}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 sm:py-3 rounded-full hover:bg-[#FAFAFA] transition-colors cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <MapPin className="w-5 h-5 text-[#ED3258] shrink-0" />
                <span
                  className={`truncate text-sm ${
                    activeCity === 'all' ? 'text-[#6B7280] font-medium' : 'text-[#1A1A1A] font-bold'
                  }`}
                >
                  {activeCity === 'all' ? 'City / Locality' : activeCity}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#9CA3AF] shrink-0 group-hover:text-[#1A1A1A] transition-transform duration-200 ${
                  openDropdown === 'city' ? 'rotate-180 text-[#1A1A1A]' : ''
                }`}
              />
            </button>

            {/* City Dropdown Menu Below Tab */}
            {openDropdown === 'city' && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full sm:min-w-[260px] bg-white rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.14)] border border-[#EDEDED] py-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => handleCityChange('all')}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                    activeCity === 'all'
                      ? 'bg-[#ED3258]/[0.08] text-[#ED3258] font-bold'
                      : 'text-[#4B5563] hover:text-[#1A1A1A] hover:bg-[#FAFAFA]'
                  }`}
                >
                  <span>City / Locality (All)</span>
                  {activeCity === 'all' && <Check className="w-4 h-4 text-[#ED3258]" />}
                </button>
                <div className="my-1 border-t border-[#F3F4F6]" />
                {activeCities.map((c: any) => {
                  const cityName = typeof c === 'string' ? c : c.name;
                  const isSelected = activeCity === cityName;
                  return (
                    <button
                      key={c.id || cityName}
                      type="button"
                      onClick={() => handleCityChange(cityName)}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-[#ED3258]/[0.08] text-[#ED3258] font-bold'
                          : 'text-[#1A1A1A] hover:bg-[#FAFAFA]'
                      }`}
                    >
                      <span>{cityName}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#ED3258]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="hidden md:block w-px h-8 bg-[#EDEDED]" />

          {/* STEP 2: BUDGET SELECTOR */}
          <div className="w-full md:w-auto flex-1 relative">
            <button
              type="button"
              onClick={() => setOpenDropdown((prev) => (prev === 'budget' ? null : 'budget'))}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 sm:py-3 rounded-full hover:bg-[#FAFAFA] transition-colors cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <IndianRupee className="w-5 h-5 text-[#ED3258] shrink-0" />
                <span
                  className={`truncate text-sm ${
                    activePrice >= 50000 ? 'text-[#6B7280] font-medium' : 'text-[#1A1A1A] font-bold'
                  }`}
                >
                  {activePrice >= 50000 ? 'Max Budget' : currentBudgetLabel}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#9CA3AF] shrink-0 group-hover:text-[#1A1A1A] transition-transform duration-200 ${
                  openDropdown === 'budget' ? 'rotate-180 text-[#1A1A1A]' : ''
                }`}
              />
            </button>

            {/* Budget Dropdown Menu Below Tab */}
            {openDropdown === 'budget' && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full sm:min-w-[260px] bg-white rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.14)] border border-[#EDEDED] py-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
                {budgetOptions.map((b) => {
                  const isSelected = activePrice === b.value;
                  return (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => handlePriceChange(b.value)}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-[#ED3258]/[0.08] text-[#ED3258] font-bold'
                          : 'text-[#1A1A1A] hover:bg-[#FAFAFA]'
                      }`}
                    >
                      <span>{b.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#ED3258]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="hidden md:block w-px h-8 bg-[#EDEDED]" />

          {/* STEP 3: ROOM TYPE SELECTOR */}
          <div className="w-full md:w-auto flex-1 relative">
            <button
              type="button"
              onClick={() => setOpenDropdown((prev) => (prev === 'room' ? null : 'room'))}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 sm:py-3 rounded-full hover:bg-[#FAFAFA] transition-colors cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Home className="w-5 h-5 text-[#ED3258] shrink-0" />
                <span
                  className={`truncate text-sm ${
                    activeRoomType === 'all' ? 'text-[#6B7280] font-medium' : 'text-[#1A1A1A] font-bold'
                  }`}
                >
                  {activeRoomType === 'all' ? 'Room Type' : currentRoomLabel}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#9CA3AF] shrink-0 group-hover:text-[#1A1A1A] transition-transform duration-200 ${
                  openDropdown === 'room' ? 'rotate-180 text-[#1A1A1A]' : ''
                }`}
              />
            </button>

            {/* Room Type Dropdown Menu Below Tab */}
            {openDropdown === 'room' && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full sm:min-w-[260px] bg-white rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.14)] border border-[#EDEDED] py-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
                {roomTypes.map((t) => {
                  const isSelected = activeRoomType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleRoomTypeChange(t.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-[#ED3258]/[0.08] text-[#ED3258] font-bold'
                          : 'text-[#1A1A1A] hover:bg-[#FAFAFA]'
                      }`}
                    >
                      <span>{t.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#ED3258]" />}
                    </button>
                  );
                })}
              </div>
            )}
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


