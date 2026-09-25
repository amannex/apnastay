'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { STATIC_PROPERTIES } from '@/data/staticProperties';
import { slugify } from '../../adapter';
import type { NormalizedProperty } from '../../adapter';

interface SimilarPropertiesSectionProps {
  property: NormalizedProperty;
}

export default function SimilarPropertiesSection({ property }: SimilarPropertiesSectionProps) {
  const currentId = property.id;
  const currentCity = property.location.city.toLowerCase();

  // Find similar properties: same city or same property type, excluding current
  const similarList = STATIC_PROPERTIES.filter((p) => {
    if (p.id === currentId) return false;
    return p.city?.toLowerCase() === currentCity;
  }).slice(0, 3);

  if (similarList.length === 0) {
    return null;
  }

  return (
    <section aria-label="Similar properties" className="pt-8 border-t border-gray-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
            Similar Verified Residences in {property.location.city}
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Other zero-brokerage audited properties you might like in this area.
          </p>
        </div>

        <Link
          href={`/properties?city=${encodeURIComponent(currentCity)}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E1224D] hover:text-[#c91d43] transition-colors"
        >
          <span>View all in {property.location.city}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {similarList.map((item) => {
          const itemCity = (item.city || 'indore').toLowerCase();
          const itemSlug = slugify(item.title || item.id);
          const itemPrice = item.price ? Number(item.price) : 0;
          const imageSrc = item.images?.[0] || item.image;

          return (
            <Link
              key={item.id}
              href={`/${itemCity}/${itemSlug}`}
              className="group bg-white rounded-3xl border border-[#EDEDED] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-white/95 text-[#E1224D] text-[10px] font-bold shadow-xs flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                    ₹0 Brokerage
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-medium text-[#6B7280] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#E1224D]" />
                    {item.neighborhood || item.city}
                  </p>
                  <h3 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#E1224D] transition-colors line-clamp-1 mt-1">
                    {item.title}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">
                    ₹{itemPrice.toLocaleString()}<span className="text-[11px] font-normal text-gray-500"> /mo</span>
                  </span>
                  <span className="text-xs font-semibold text-[#E1224D] group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
