'use client';

import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';

interface LocalityDiscoveryProps {
  onSelectLocality?: (localityName: string) => void;
}

export default function LocalityDiscovery({ onSelectLocality }: LocalityDiscoveryProps) {
  const localities = [
    {
      id: 'indirapuram',
      name: 'Indirapuram',
      region: 'Ghaziabad / Delhi NCR',
      city: 'Delhi NCR',
      highlight: 'Established Residential Pockets',
      description:
        'Peaceful multi-storey apartments with quick transit access to Noida Sector 62 and East Delhi.',
      type: '1BHK & 2BHK Apartments',
    },
    {
      id: 'dlf-gurugram',
      name: 'DLF / Cyber City',
      region: 'Gurugram',
      city: 'Gurugram',
      highlight: 'Corporate Tech Corridors',
      description:
        'Walk-to-work residences, modern studio suites, and gated communities for corporate and tech professionals.',
      type: 'Executive Suites & Studios',
    },
    {
      id: 'vijay-nagar',
      name: 'Vijay Nagar',
      region: 'Indore',
      city: 'Indore',
      highlight: 'IT Park & Educational Belt',
      description:
        'Clean avenues, BRTS transit, and vibrant rental supply close to Crystal IT Park.',
      type: 'Furnished Flats & Rooms',
    },
    {
      id: 'c-scheme',
      name: 'C-Scheme & Malviya Nagar',
      region: 'Jaipur',
      city: 'Jaipur',
      highlight: 'Central Cultural District',
      description:
        'Quiet leafy residential avenues combined with modern work-from-home infrastructure.',
      type: 'Independent Floors & Suites',
    }
  ];

  const handleLocalityClick = (city: string) => {
    if (onSelectLocality) {
      onSelectLocality(city);
    }
    const el = document.getElementById('properties');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="localities" className="py-20 sm:py-24 bg-white border-b border-[#EDEDED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-14 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#ED3258] text-xs font-semibold tracking-tight mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>Initial Focus Hubs</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A]">
              Starting where long-term housing demand is highest.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#6B7280] leading-relaxed">
              We focus on building genuine, verified rental supply in select high-density neighbourhoods instead of spreading thin across unverified listings.
            </p>
          </div>

          <div className="text-xs text-[#6B7280] md:text-right">
            <span className="font-semibold text-[#1A1A1A]">Early Validation Phase:</span> More localities opening as community supply grows.
          </div>
        </div>

        {/* Localities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {localities.map((loc) => (
            <div
              key={loc.id}
              onClick={() => handleLocalityClick(loc.city)}
              className="group bg-white p-6 rounded-3xl border border-[#EDEDED] shadow-xs hover:border-[#ED3258] hover:shadow-apple-hover transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#ED3258] bg-rose-50 px-2.5 py-1 rounded-full">
                    {loc.region}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#6B7280] group-hover:bg-[#ED3258] group-hover:text-white transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#ED3258] transition-colors mb-1">
                  {loc.name}
                </h3>
                <p className="text-xs font-semibold text-[#6B7280] mb-3">
                  {loc.highlight}
                </p>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {loc.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F5F5F7] flex items-center justify-between text-[11px] text-[#6B7280]">
                <span>{loc.type}</span>
                <span className="font-semibold text-[#1A1A1A] group-hover:text-[#ED3258]">Explore →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
