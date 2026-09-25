'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Camera } from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface PropertyGallerySectionProps {
  property: NormalizedProperty;
}

export default function PropertyGallerySection({ property }: PropertyGallerySectionProps) {
  const images = property.images && property.images.length > 0 ? property.images : [property.coverImage];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const activeImage = images[activeImageIndex] || images[0];

  return (
    <section aria-label="Property gallery" className="rounded-3xl overflow-hidden bg-[#FAFAFA] border border-[#EDEDED] shadow-sm">
      {/* Primary Display */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] md:aspect-[16/8] max-h-[500px] w-full overflow-hidden bg-gray-100">
        <img
          src={activeImage}
          alt={`${property.title} - View ${activeImageIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Image count badge */}
        <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
          <Camera className="w-3.5 h-3.5 text-rose-400" />
          <span>{activeImageIndex + 1} / {images.length} Photos</span>
        </div>

        {/* Phase notice / View all indicator */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[#1A1A1A] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
          <span>{property.propertyTypeLabel}</span>
        </div>
      </div>

      {/* Thumbnails Row if more than 1 image */}
      {images.length > 1 && (
        <div className="p-3 bg-white border-t border-[#EDEDED] flex items-center gap-2 overflow-x-auto scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImageIndex(idx)}
              className={`relative h-16 w-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                activeImageIndex === idx ? 'border-[#E1224D] shadow-sm scale-95' : 'border-transparent opacity-75 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${property.title} preview thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
