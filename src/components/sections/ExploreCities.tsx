'use client';

import React from 'react';
import {
  GurugramIllustration,
  GhaziabadIllustration,
  NoidaIllustration,
  DelhiIllustration,
} from './CityIllustrations';

export interface ExploreCitiesProps {
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
}

const ACTIVE_CITIES = [
  {
    id: 'gurugram',
    name: 'Gurugram',
    Illustration: GurugramIllustration,
  },
  {
    id: 'ghaziabad',
    name: 'Ghaziabad',
    Illustration: GhaziabadIllustration,
  },
  {
    id: 'noida',
    name: 'Noida',
    Illustration: NoidaIllustration,
  },
  {
    id: 'delhi',
    name: 'Delhi',
    Illustration: DelhiIllustration,
  },
];

export default function ExploreCities({ selectedCity, onSelectCity }: ExploreCitiesProps) {
  return (
    <div id="cities" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. SECTION HEADER */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 md:mb-14">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#1A1A1A]">
          Explore Indian Cities
        </h2>
        <p className="mt-2.5 sm:mt-3 text-sm sm:text-base text-[#6B7280] leading-relaxed">
          Explore cities, discover localities, and find a place to call home.
        </p>
      </div>

      {/* 2. CITIES DISCOVERY ROW */}
      <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center sm:justify-center gap-6 sm:gap-10 md:gap-14 lg:gap-16 max-w-4xl mx-auto justify-items-center">
        {ACTIVE_CITIES.map((city) => {
          const isSelected = selectedCity?.toLowerCase() === city.name.toLowerCase();

          return (
            <button
              key={city.id}
              type="button"
              onClick={() => onSelectCity?.(city.name)}
              className="group flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E1224D] focus-visible:ring-offset-2 rounded-full cursor-pointer transition-all duration-300"
              aria-label={`Explore ${city.name}`}
            >
              {/* City Circular Illustration Container */}
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-white border-2 flex items-center justify-center p-2.5 sm:p-3 transition-all duration-300 shadow-xs group-hover:shadow-apple-hover group-hover:-translate-y-1.5 ${
                  isSelected
                    ? 'border-[#E1224D] ring-4 ring-rose-100 shadow-apple-hover scale-105'
                    : 'border-[#E5E7EB] group-hover:border-[#E1224D]'
                }`}
              >
                <city.Illustration className="w-full h-full transition-transform duration-300 group-hover:scale-105" />
              </div>

              {/* City Name */}
              <span
                className={`mt-3 text-sm sm:text-base font-semibold tracking-tight transition-colors text-center ${
                  isSelected
                    ? 'text-[#E1224D]'
                    : 'text-[#1A1A1A] group-hover:text-[#E1224D]'
                }`}
              >
                {city.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
