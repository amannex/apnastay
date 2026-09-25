'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, MapPin, Heart, Bed, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getSimilarProperties } from '../../recommendations';
import { slugify } from '../../adapter';
import type { NormalizedProperty } from '../../adapter';

interface SimilarPropertiesSectionProps {
  property: NormalizedProperty;
}

export default function SimilarPropertiesSection({ property }: SimilarPropertiesSectionProps) {
  const { wishlistIds, onToggleWishlist } = useApp();

  // Multi-factor prioritized similarity logic (same city, locality, type, price, bedrooms, amenities)
  const similarList = getSimilarProperties(property, undefined, { limit: 3 });

  // Gracefully hide the section if no verified similar recommendations exist
  if (similarList.length === 0) {
    return null;
  }

  return (
    <section aria-label="Similar property recommendations" className="pt-10 border-t border-gray-200 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Recommendations
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            You may also like
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Verified zero-brokerage residences in {property.location.city} matching your preferences
          </p>
        </div>

        <Link
          href={`/properties?city=${encodeURIComponent(property.location.city.toLowerCase())}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E1224D] hover:text-[#b8183d] transition-colors shrink-0"
        >
          <span>Explore all in {property.location.city}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Responsive Layout: Mobile Horizontal Carousel / Desktop 3-Column Grid */}
      <div className="flex overflow-x-auto pb-4 pt-1 gap-5 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible scrollbar-thin">
        {similarList.map((item) => {
          const itemCity = (item.city || 'indore').toLowerCase();
          const itemSlug = slugify(item.title || item.id);
          const itemPrice = item.price ? Number(item.price) : (item.costBreakdown?.monthlyRent || 0);
          const imageSrc = item.images?.[0] || item.image || item.coverImage;
          const isWishlisted = wishlistIds.includes(item.id);

          return (
            <div
              key={item.id}
              className="w-[82vw] max-w-[340px] shrink-0 snap-center sm:w-auto sm:max-w-none flex flex-col"
            >
              <Link
                href={`/${itemCity}/${itemSlug}`}
                className="group bg-white rounded-3xl border border-[#EDEDED] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full cursor-pointer"
              >
                {/* Image & Badges */}
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

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[#E1224D] text-[10px] font-bold shadow-xs flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                      ₹0 Brokerage
                    </span>
                  </div>

                  {/* Wishlist Action Button */}
                  <div className="absolute top-3 right-3 z-10" onClick={(e) => e.preventDefault()}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(item.id);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isWishlisted
                          ? 'bg-[#E1224D] text-white shadow-md'
                          : 'bg-white/90 backdrop-blur-xs text-[#6B7280] hover:text-[#E1224D]'
                      }`}
                      aria-label={isWishlisted ? 'Saved' : 'Save to wishlist'}
                      title={isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-[11px] font-medium text-[#6B7280] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#E1224D] shrink-0" />
                      <span className="truncate">{item.neighborhood || item.city}</span>
                    </p>

                    <h3 className="text-sm sm:text-base font-bold text-[#1A1A1A] group-hover:text-[#E1224D] transition-colors line-clamp-1 mt-1.5">
                      {item.title}
                    </h3>

                    {/* Room Type / Specs */}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                      {item.specs?.bedrooms ? (
                        <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md text-[11px] font-medium">
                          <Bed className="w-3 h-3 text-gray-500" />
                          {item.specs.bedrooms} BHK
                        </span>
                      ) : (
                        <span className="bg-gray-100 px-2 py-0.5 rounded-md text-[11px] font-medium truncate">
                          {item.roomType || 'Residence'}
                        </span>
                      )}

                      {item.specs?.furnishing && (
                        <span className="bg-gray-50 text-gray-600 border border-gray-100 px-2 py-0.5 rounded-md text-[11px] truncate max-w-[120px]">
                          {item.specs.furnishing.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Action */}
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
