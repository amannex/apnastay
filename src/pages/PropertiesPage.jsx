import React, { useState } from 'react';
import PropertiesSection from '../components/properties/PropertiesSection';
import { Sparkles, Filter, MapPin, Search, ShieldCheck } from 'lucide-react';

export default function PropertiesPage({
  activeTab,
  onTabChange,
  onOpenModal,
  onOpenCompare
}) {
  const [selectedCity, setSelectedCity] = useState('All');

  const cities = ['All', 'Indore', 'Jaipur', 'Coimbatore', 'Kochi', 'Chandigarh', 'Pune'];

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* DEDICATED PAGE HEADER */}
        <div className="py-10 border-b border-[#EDEDED] mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Indian Homes • Zero Brokerage
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A]">
              Browse Verified Rooms Across India.
            </h1>
            <p className="text-[#6B7280] text-sm sm:text-base mt-2 max-w-2xl">
              Every room listed here has undergone a 25-point physical acoustic and Wi-Fi inspection by OwnStay field engineers.
            </p>
          </div>
        </div>

        {/* FULL PAGE PROPERTIES LIST WITH CITY FILTER BAR */}
        <PropertiesSection
          activeTab={activeTab}
          onTabChange={onTabChange}
          onOpenModal={onOpenModal}
          onOpenCompare={onOpenCompare}
          showSectionHeader={false}
        />
      </div>
    </main>
  );
}
