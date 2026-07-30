import React, { useState, useMemo } from 'react';
import FeaturedProperties from './FeaturedProperties';
import { STATIC_PROPERTIES } from '../../data/staticProperties';
import { Building2, Sparkles } from 'lucide-react';

export default function PropertiesSection({
  activeTab = 'All',
  onTabChange,
  onOpenModal,
  onOpenCompare,
  showSectionHeader = true
}) {
  const [selectedCityTab, setSelectedCityTab] = useState('All');

  const filteredProperties = useMemo(() => {
    return STATIC_PROPERTIES.filter((p) => {
      if (selectedCityTab !== 'All' && p.city !== selectedCityTab) {
        return false;
      }
      return true;
    });
  }, [selectedCityTab]);

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
          {['All', 'Indore', 'Jaipur', 'Coimbatore', 'Kochi', 'Chandigarh', 'Pune'].map((c) => (
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
        wishlistIds={['rm-101']}
        compareIds={['rm-101', 'rm-102']}
        onToggleWishlist={() => {}}
        onToggleCompare={onOpenCompare ? () => onOpenCompare('rm-101') : () => {}}
        onSelectProperty={onOpenModal}
        showHeader={false}
      />
    </div>
  );
}
