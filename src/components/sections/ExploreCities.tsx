'use client';

import React from 'react';
import Link from 'next/link';
import {
  GurugramIllustration,
  GhaziabadIllustration,
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
    href: '/gurugram',
    Illustration: GurugramIllustration,
  },
  {
    id: 'ghaziabad',
    name: 'Ghaziabad',
    href: '/ghaziabad',
    Illustration: GhaziabadIllustration,
  },
  {
    id: 'noida',
    name: 'Noida',
    href: '/noida',
    Illustration: NoidaIllustration,
  },
  {
    id: 'delhi',
    name: 'Delhi',
    href: '/delhi',
    Illustration: DelhiIllustration,
  },
  {
    id: 'more-cities',
    name: 'More Cities',
    href: '/cities',
    Illustration: MoreCitiesIllustration,
  },
];

export default function ExploreCities({ selectedCity, onSelectCity }: ExploreCitiesProps) {
  return (
    <div id="cities" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. LEFT-ALIGNED SECTION HEADER */}
      <div className="text-left mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[rgb(17,24,39)]">
          We are currently building in
        </h2>
        <p className="mt-2 text-[17px] text-[rgb(107,114,128)] leading-relaxed">
          Explore cities, discover localities, and find a place to call home.
        </p>
      </div>

      {/* 2. LEFT-ALIGNED CITIES DISCOVERY ROW */}
      <div className="flex flex-wrap items-center justify-start gap-[25px] sm:gap-[33px] md:gap-[41px] lg:gap-[45px]">
        {ACTIVE_CITIES.map((city) => {
          const isSelected = selectedCity?.toLowerCase() === city.name.toLowerCase();

          return (
            <Link
              key={city.id}
              href={city.href}
              onClick={() => onSelectCity?.(city.name)}
              className="group flex flex-col items-center outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 active:outline-none rounded-full cursor-pointer transition-all duration-300 select-none [-webkit-tap-highlight-color:transparent]"
              aria-label={`Explore ${city.name}`}
            >
              {/* Circular Outlined Container with slightly reduced radius */}
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-full bg-white border border-[#E5E7EB] group-hover:border-[#E1224D] transition-all duration-300 flex items-center justify-center p-2.5 sm:p-3 shadow-2xs group-hover:shadow-apple-hover group-hover:-translate-y-1 outline-none ring-0"
              >
                <city.Illustration className="w-full h-full text-[#334155] group-hover:text-[#E1224D] transition-all duration-300 group-hover:scale-105" />
              </div>

              {/* City Name */}
              <span
                className="mt-2.5 sm:mt-3 text-[13px] sm:text-[15px] font-semibold tracking-tight transition-colors text-center text-[#1A1A1A] group-hover:text-[#E1224D]"
              >
                {city.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
