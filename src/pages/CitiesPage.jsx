import React from 'react';
import { INDIAN_CITIES } from '../data/staticProperties';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, ArrowRight, Sparkles, Building2, Wifi, DollarSign } from 'lucide-react';

export default function CitiesPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Indian Urban Livability Guide
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1A1A1A] mb-4">
            India&apos;s Fastest-Growing Tier-2 Tech Hubs.
          </h1>
          <p className="text-[#6B7280] text-base sm:text-lg leading-relaxed">
            We analyze rental yields, acoustic decibel averages, and gigabit fiber availability across India&apos;s premier Tier-2 cities so you can choose where to live peacefully.
          </p>
        </div>

        {/* CITY GUIDES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {INDIAN_CITIES.map((city) => (
            <div
              key={city.id}
              className="group bg-white rounded-3xl border border-[#EDEDED] shadow-sm hover:shadow-apple-hover transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* CITY HERO IMAGE */}
                <div className="relative h-60 overflow-hidden bg-gray-100">
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-300 block">
                        {city.tag}
                      </span>
                      <h3 className="text-2xl font-bold">{city.name}</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
                      {city.listings} Homes
                    </span>
                  </div>
                </div>

                {/* LIVABILITY & RENT STATS */}
                <div className="p-6 space-y-4">
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    {city.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-2xl bg-[#FAFAFA] border border-[#EDEDED]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                        Average Rent / Mo
                      </span>
                      <span className="text-sm font-bold text-[#1A1A1A]">
                        {city.avgRent}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#FAFAFA] border border-[#EDEDED]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                        Livability Score
                      </span>
                      <span className="text-sm font-bold text-[#E1224D]">
                        {city.livabilityScore} / 100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="p-6 pt-0">
                <Link
                  to="/properties"
                  className="w-full py-3.5 rounded-2xl bg-[#FAFAFA] hover:bg-[#E1224D] hover:text-white border border-[#EDEDED] text-xs font-bold text-[#1A1A1A] transition-all flex items-center justify-center gap-2 group/btn"
                >
                  <span>Explore Rooms in {city.name}</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
