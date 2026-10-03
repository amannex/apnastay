'use client';

import React from 'react';
import {
  GurugramIllustration,
  NoidaIllustration,
  DelhiIllustration,
  MoreCitiesIllustration,
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
    id: 'noida',
    name: 'Noida',
    Illustration: NoidaIllustration,
  },
  {
    id: 'delhi',
    name: 'Delhi',
    Illustration: DelhiIllustration,
  },
  {
    id: 'more-cities',
    name: 'More Cities',
    Illustration: MoreCitiesIllustration,
  },
];

export default function ExploreCities({ selectedCity, onSelectCity }: ExploreCitiesProps) {
  return (
    <div id="cities" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. LEFT-ALIGNED SECTION HEADER */}
      <div className="text-left mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#1A1A1A]">
          Explore Indian Cities
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#6B7280] leading-relaxed">
          Explore cities, discover localities, and find a place to call home.
        </p>
      </div>

      {/* 2. LEFT-ALIGNED CITIES DISCOVERY ROW */}
      <div className="flex flex-wrap items-center justify-start gap-6 sm:gap-8 md:gap-10 lg:gap-12">
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
              {/* Circular Outlined Container */}
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-white border transition-all duration-300 flex items-center justify-center p-3 sm:p-3.5 shadow-2xs group-hover:shadow-apple-hover group-hover:-translate-y-1 ${
                  isSelected
                    ? 'border-[#E1224D] ring-4 ring-rose-100 shadow-apple-hover scale-105'
                    : 'border-[#E5E7EB] group-hover:border-[#E1224D]'
                }`}
              >
                <city.Illustration className="w-full h-full text-[#334155] group-hover:text-[#E1224D] transition-all duration-300 group-hover:scale-105" />
              </div>

              {/* City Name */}
              <span
                className={`mt-2.5 sm:mt-3 text-sm sm:text-base font-semibold tracking-tight transition-colors text-center ${
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
