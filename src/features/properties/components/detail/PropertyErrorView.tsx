'use client';

import React from 'react';
import Link from 'next/link';
import { Search, RotateCcw, AlertTriangle, ArrowRight, ShieldCheck, MapPin, Bed } from 'lucide-react';
import { slugify } from '../../adapter';

export interface PropertyAlternative {
  id: string;
  title?: string;
  city?: string;
  neighborhood?: string;
  price?: number | string;
  images?: string[];
  image?: string;
  coverImage?: string;
  roomType?: string;
  specs?: {
    bedrooms?: number;
    furnishing?: string;
  };
}

interface PropertyErrorViewProps {
  title?: string;
  message?: string;
  type?: 'not_found' | 'removed' | 'unavailable' | 'error';
  city?: string;
  alternatives?: PropertyAlternative[];
  onRetry?: () => void;
}

export default function PropertyErrorView({
  title,
  message,
  type = 'not_found',
  city,
  alternatives = [],
  onRetry
}: PropertyErrorViewProps) {
  // 1. NOT FOUND STATE
  if (type === 'not_found') {
    return (
      <main className="min-h-[75vh] flex items-center justify-center bg-[#FAFAFA] px-4 pt-24 pb-16">
        <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 sm:p-10 border border-[#EDEDED] shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#E1224D] flex items-center justify-center mx-auto mb-6 shadow-2xs">
            <Search className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight mb-2">
            {title || 'Property not found'}
          </h1>

          <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
            {message || 'This property may have been removed or is no longer available.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/properties"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#E1224D] hover:bg-[#c91d43] text-white text-xs font-bold transition-all shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Find ApnaStay</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 2. REMOVED PROPERTY STATE (OFFERS ALTERNATIVES)
  if (type === 'removed' || type === 'unavailable') {
    const cityName = city ? city.charAt(0).toUpperCase() + city.slice(1).toLowerCase() : 'your city';

    return (
      <main className="min-h-[80vh] bg-[#FAFAFA] px-4 pt-24 sm:pt-28 pb-20">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Header Card */}
          <div className="text-center bg-white rounded-3xl p-8 sm:p-10 border border-[#EDEDED] shadow-sm max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
              {title || 'This property is no longer available.'}
            </h1>

            <p className="text-sm text-[#6B7280] leading-relaxed">
              {message || `This residence has been leased or unlisted by the owner. Explore these verified, zero-brokerage alternatives in ${cityName}:`}
            </p>

            <div className="pt-2">
              <Link
                href={city ? `/properties?city=${encodeURIComponent(city.toLowerCase())}` : '/properties'}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#E1224D] hover:bg-[#c91d43] text-white text-xs font-bold transition-all shadow-sm"
              >
                <Search className="w-4 h-4" />
                <span>Find ApnaStay in {cityName}</span>
              </Link>
            </div>
          </div>

          {/* Alternatives Grid if provided */}
          {alternatives.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A]">
                    Recommended Alternatives
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6B7280]">
                    Verified available properties with zero brokerage
                  </p>
                </div>

                <Link
                  href={city ? `/properties?city=${encodeURIComponent(city.toLowerCase())}` : '/properties'}
                  className="text-xs font-bold text-[#E1224D] hover:underline flex items-center gap-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {alternatives.slice(0, 3).map((item) => {
                  const itemCity = (item.city || city || 'indore').toLowerCase();
                  const itemSlug = slugify(item.title || item.id);
                  const imageSrc = item.images?.[0] || item.image || item.coverImage;
                  const itemPrice = typeof item.price === 'number' ? item.price : Number(item.price) || 0;

                  return (
                    <Link
                      key={item.id}
                      href={`/${itemCity}/${itemSlug}`}
                      className="group bg-white rounded-3xl border border-[#EDEDED] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                            ApnaStay Verified
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-[#E1224D] text-[10px] font-bold shadow-xs flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                            ₹0 Brokerage
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <p className="text-[11px] font-medium text-[#6B7280] flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#E1224D] shrink-0" />
                            <span className="truncate">{item.neighborhood || item.city}</span>
                          </p>

                          <h3 className="text-sm sm:text-base font-bold text-[#1A1A1A] group-hover:text-[#E1224D] transition-colors line-clamp-1 mt-1.5">
                            {item.title}
                          </h3>

                          {item.specs?.bedrooms && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                              <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md text-[11px] font-medium">
                                <Bed className="w-3 h-3 text-gray-500" />
                                {item.specs.bedrooms} BHK
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <span className="text-sm sm:text-base font-extrabold text-gray-900">
                              ₹{itemPrice.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-gray-500 font-normal"> /mo</span>
                          </div>
                          <span className="text-xs font-bold text-[#E1224D] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            View <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  // 3. API / GENERAL ERROR STATE
  return (
    <main className="min-h-[75vh] flex items-center justify-center bg-[#FAFAFA] px-4 pt-24 pb-16">
      <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 sm:p-10 border border-[#EDEDED] shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#E1224D] flex items-center justify-center mx-auto mb-6 shadow-2xs">
          <RotateCcw className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight mb-2">
          {title || "We couldn't load this property."}
        </h1>

        <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
          {message || 'Please try again.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (onRetry) {
                onRetry();
              } else if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#E1224D] hover:bg-[#c91d43] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/properties"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Find ApnaStay</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
