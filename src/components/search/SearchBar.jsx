import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Home, SlidersHorizontal, X } from 'lucide-react';

export default function SearchBar({
  cities = [],
  selectedCity = 'all',
  onCityChange,
  maxPrice = 3000,
  onPriceChange,
  roomType = 'all',
  onRoomTypeChange,
  totalResults = 0,
  onReset
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const roomTypes = [
    { id: 'all', label: 'All Room Types' },
    { id: 'Private Suite', label: 'Private Suite' },
    { id: 'Private Studio', label: 'Studio' },
    { id: 'Private 1BHK', label: '1BHK Loft' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 -mt-16 sm:-mt-10 relative z-40">
      <div className="glass-panel rounded-3xl p-3 sm:p-4 shadow-apple-lg border border-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* STEP 1: CITY SELECTOR */}
          <div className="w-full md:w-auto flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-[#FAFAFA] transition-colors border border-transparent hover:border-[#EDEDED]">
            <MapPin className="w-5 h-5 text-[#E1224D] shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                City / Location
              </label>
              <select
                value={selectedCity}
                onChange={(e) => onCityChange(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#1A1A1A] focus:outline-none cursor-pointer"
              >
                <option value="all">All Indian Cities</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.country})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-[#EDEDED]" />

          {/* STEP 2: BUDGET SLIDER (INR) */}
          <div className="w-full md:w-auto flex-1 flex items-center gap-3 px-4 py-2 rounded-2xl hover:bg-[#FAFAFA] transition-colors border border-transparent hover:border-[#EDEDED]">
            <DollarSign className="w-5 h-5 text-[#E1224D] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Max Budget
                </label>
                <span className="text-xs font-bold text-[#E1224D]">
                  {maxPrice >= 100000 ? '₹1,00,000+' : `₹${maxPrice}/mo`}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="100000"
                step="2500"
                value={maxPrice}
                onChange={(e) => onPriceChange(Number(e.target.value))}
                className="w-full h-1.5 bg-[#EDEDED] rounded-lg appearance-none cursor-pointer accent-[#E1224D] mt-1"
              />
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-[#EDEDED]" />

          {/* STEP 3: ROOM TYPE SELECTOR */}
          <div className="w-full md:w-auto flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-[#FAFAFA] transition-colors border border-transparent hover:border-[#EDEDED]">
            <Home className="w-5 h-5 text-[#E1224D] shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                Room Type
              </label>
              <select
                value={roomType}
                onChange={(e) => onRoomTypeChange(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#1A1A1A] focus:outline-none cursor-pointer"
              >
                {roomTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SEARCH BUTTON & MATCH COUNT */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <div className="flex-1 md:flex-none flex items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-[#E1224D] text-white font-semibold text-sm shadow-apple hover:bg-[#C71B42] transition-all cursor-pointer">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Search</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">
                {totalResults}
              </span>
            </div>

            {(selectedCity !== 'all' || maxPrice < 3000 || roomType !== 'all') && (
              <button
                onClick={onReset}
                className="p-3 rounded-2xl bg-[#FAFAFA] hover:bg-[#EDEDED] text-[#6B7280] hover:text-[#1A1A1A] transition-colors border border-[#EDEDED]"
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
