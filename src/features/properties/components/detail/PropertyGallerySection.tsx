'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  ShieldCheck,
  Building2,
  ImageOff
} from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface PropertyGallerySectionProps {
  property: NormalizedProperty;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

export default function PropertyGallerySection({ property }: PropertyGallerySectionProps) {
  const rawImages = property.images && property.images.length > 0 ? property.images : [];
  const [images, setImages] = useState<string[]>(rawImages);
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(new Set());

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Mobile carousel state
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Touch swipe handling in lightbox
  const touchStartX = useRef<number | null>(null);

  // Update images if property changes
  useEffect(() => {
    setImages(property.images || []);
  }, [property.images]);

  // Handle broken images gracefully
  const handleImageError = (url: string) => {
    setBrokenUrls((prev) => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  const validImages = images.map((url) => (brokenUrls.has(url) ? FALLBACK_IMAGE : url));
  const hasImages = validImages.length > 0;

  // Open Lightbox at specific index
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goToPrevious = useCallback(() => {
    setLightboxIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  }, [validImages.length]);

  const goToNext = useCallback(() => {
    setLightboxIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  }, [validImages.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, closeLightbox, goToPrevious, goToNext]);

  // Handle mobile scroll index update
  const handleMobileScroll = () => {
    if (!mobileScrollRef.current) return;
    const { scrollLeft, clientWidth } = mobileScrollRef.current;
    if (clientWidth > 0) {
      const index = Math.round(scrollLeft / clientWidth);
      setMobileActiveIndex(index);
    }
  };

  const scrollMobileTo = (index: number) => {
    if (!mobileScrollRef.current) return;
    const clientWidth = mobileScrollRef.current.clientWidth;
    mobileScrollRef.current.scrollTo({
      left: index * clientWidth,
      behavior: 'smooth'
    });
  };

  // --------------------------------------------------------------------------
  // EMPTY STATE: 0 IMAGES
  // --------------------------------------------------------------------------
  if (!hasImages) {
    return (
      <section
        aria-label="No property photos"
        className="rounded-3xl overflow-hidden bg-gray-50 border border-gray-200 p-8 sm:p-12 text-center"
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white text-gray-900 shadow-sm flex items-center justify-center mx-auto border border-gray-100">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A]">
              Photographs Pending Upload
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-1 leading-relaxed">
              This residence in {property.location.displayLocation} has been audited by ApnaStay field engineers. Official photographs will be published shortly.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // --------------------------------------------------------------------------
  // DESKTOP & MOBILE RENDER
  // --------------------------------------------------------------------------
  return (
    <>
      <section aria-label="Property photo gallery" className="relative group">
        {/* ================================================================== */}
        {/* ================================================================== */}
        {/* 1. MOBILE SWIPE-FRIENDLY GALLERY (< md screens)                     */}
        {/* ================================================================== */}
        <div className="block md:hidden relative rounded-3xl overflow-hidden bg-gray-900 shadow-sm aspect-[4/3] sm:aspect-[16/9]">
          <div
            ref={mobileScrollRef}
            onScroll={handleMobileScroll}
            className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
          >
            {validImages.map((img, idx) => (
              <div
                key={idx}
                role="button"
                tabIndex={0}
                onClick={() => openLightbox(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(idx);
                  }
                }}
                className="w-full h-full shrink-0 snap-center relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258]"
                aria-label={`View photo ${idx + 1} of ${validImages.length} in full screen`}
              >
                <img
                  src={img}
                  alt={`${property.title} - Photo ${idx + 1} of ${validImages.length} in ${property.location.displayLocation}`}
                  fetchPriority={idx === 0 ? "high" : "auto"}
                  loading={idx === 0 ? "eager" : "lazy"}
                  decoding="async"
                  onError={() => handleImageError(img)}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Floating Pill: Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md pointer-events-none flex items-center gap-1.5">
            <Camera className="w-3 h-3 text-rose-400" />
            <span>{mobileActiveIndex + 1} / {validImages.length}</span>
          </div>

          {/* Mobile Quick Arrows */}
          {validImages.length > 1 && (
            <>
              {mobileActiveIndex > 0 && (
                <button
                  type="button"
                  onClick={() => scrollMobileTo(mobileActiveIndex - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258]"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {mobileActiveIndex < validImages.length - 1 && (
                <button
                  type="button"
                  onClick={() => scrollMobileTo(mobileActiveIndex + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258]"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {/* Fullscreen Expand Action */}
          <button
            type="button"
            onClick={() => openLightbox(mobileActiveIndex)}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/75 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258]"
            aria-label="View photo in fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* ================================================================== */}
        {/* 2. DESKTOP MODERN RESPONSIVE GALLERY (>= md screens)                */}
        {/* Exact Layout: Large Main Image + Stacked Supporting Images        */}
        {/* ================================================================== */}
        <div className="hidden md:block relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100">
          {/* CASE A: 1 IMAGE ONLY */}
          {validImages.length === 1 && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => openLightbox(0)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openLightbox(0);
                }
              }}
              className="relative aspect-[21/9] max-h-[460px] w-full overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258]"
              aria-label={`View photo of ${property.title} in fullscreen`}
            >
              <img
                src={validImages[0]}
                alt={`${property.title} - Main photograph in ${property.location.displayLocation}`}
                fetchPriority="high"
                loading="eager"
                decoding="async"
                onError={() => handleImageError(validImages[0])}
                className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-md flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-400" />
                <span>1 Photo Available</span>
              </div>
            </div>
          )}

          {/* CASE B: 2 IMAGES ONLY */}
          {validImages.length === 2 && (
            <div className="grid grid-cols-2 gap-2 h-[420px]">
              {validImages.map((img, idx) => (
                <div
                  key={idx}
                  role="button"
                  tabIndex={0}
                  onClick={() => openLightbox(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openLightbox(idx);
                    }
                  }}
                  className="relative h-full overflow-hidden cursor-pointer group/item focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258]"
                  aria-label={`View photo ${idx + 1} of 2 in fullscreen`}
                >
                  <img
                    src={img}
                    alt={`${property.title} - Photo ${idx + 1} of 2 in ${property.location.displayLocation}`}
                    fetchPriority={idx === 0 ? "high" : "auto"}
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding="async"
                    onError={() => handleImageError(img)}
                    className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
          )}

          {/* CASE C: 3 OR MORE IMAGES (EXACT SPECIFICATION: Left Main + Right Stacked) */}
          {validImages.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 h-[360px] md:h-[400px] lg:h-[480px]">
              {/* Left Column: Primary Big Image (Spans 2 cols) */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => openLightbox(0)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(0);
                  }
                }}
                className="col-span-2 relative h-full overflow-hidden cursor-pointer group/main focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258]"
                aria-label={`Main photo of ${property.title}. Click to enlarge`}
              >
                <img
                  src={validImages[0]}
                  alt={`${property.title} - Primary showcase in ${property.location.displayLocation}`}
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  onError={() => handleImageError(validImages[0])}
                  className="w-full h-full object-cover group-hover/main:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/main:bg-black/10 transition-colors" />
              </div>

              {/* Right Column: Stack of 2 Supporting Images */}
              <div className="col-span-1 grid grid-rows-2 gap-2 h-full">
                {/* Supporting Image 2 */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => openLightbox(1)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openLightbox(1);
                    }
                  }}
                  className="relative h-full overflow-hidden cursor-pointer group/sub1 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  aria-label={`Photo 2 of ${validImages.length} in ${property.location.displayLocation}`}
                >
                  <img
                    src={validImages[1]}
                    alt={`${property.title} - Photo 2 of ${validImages.length}`}
                    loading="lazy"
                    decoding="async"
                    onError={() => handleImageError(validImages[1])}
                    className="w-full h-full object-cover group-hover/sub1:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/sub1:bg-black/10 transition-colors" />
                </div>

                {/* Supporting Image 3 (or with +N overlay if > 3 images) */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => openLightbox(2)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openLightbox(2);
                    }
                  }}
                  className="relative h-full overflow-hidden cursor-pointer group/sub2 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  aria-label={`Photo 3 of ${validImages.length}`}
                >
                  <img
                    src={validImages[2]}
                    alt={`${property.title} - Photo 3 of ${validImages.length}`}
                    loading="lazy"
                    decoding="async"
                    onError={() => handleImageError(validImages[2])}
                    className="w-full h-full object-cover group-hover/sub2:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/sub2:bg-black/15 transition-colors" />
                </div>
              </div>
            </div>
          )}

          {/* Global Desktop "View All Photos" Button */}
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="absolute bottom-3 right-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200/90 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <Camera className="w-3.5 h-3.5 text-gray-900" />
            <span>View All Photos</span>
          </button>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 3. ACCESSIBLE FULLSCREEN LIGHTBOX MODAL                             */}
      {/* ================================================================== */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Property photos viewer - photo ${lightboxIndex + 1} of ${validImages.length}`}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 text-white animate-fade-in"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX.current - touchEndX;
            if (Math.abs(diff) > 40) {
              if (diff > 0) goToNext();
              else goToPrevious();
            }
            touchStartX.current = null;
          }}
        >
          {/* Top Bar: Title, Counter & Close Button */}
          <header className="flex items-center justify-between gap-4 pb-4 border-b border-white/10 max-w-6xl mx-auto w-full">
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {property.title}
              </h2>
              <p className="text-xs text-gray-400">
                Photo {lightboxIndex + 1} of {validImages.length}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-400 hidden sm:inline">
                Use ← / → keys or swipe
              </span>
              <button
                type="button"
                onClick={closeLightbox}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258]"
                aria-label="Close fullscreen gallery"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Middle: Active High-Res Photo & Floating Arrow Buttons */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden max-w-5xl mx-auto w-full">
            <img
              src={validImages[lightboxIndex]}
              alt={`${property.title} - Lightbox view ${lightboxIndex + 1}`}
              onError={() => handleImageError(validImages[lightboxIndex])}
              className="max-h-[70vh] sm:max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl transition-opacity duration-200"
            />

            {/* Left Nav Arrow */}
            {validImages.length > 1 && (
              <button
                type="button"
                onClick={goToPrevious}
                className="absolute left-2 sm:left-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all shadow-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258]"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Right Nav Arrow */}
            {validImages.length > 1 && (
              <button
                type="button"
                onClick={goToNext}
                className="absolute right-2 sm:right-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all shadow-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258]"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom: Thumbnail Strip */}
          {validImages.length > 1 && (
            <footer className="pt-3 border-t border-white/10 max-w-4xl mx-auto w-full overflow-x-auto scrollbar-none flex items-center justify-center gap-2">
              {validImages.map((thumb, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative h-14 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258] ${
                    lightboxIndex === idx
                      ? 'border-[#ED3258] scale-105 shadow-md'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                  aria-label={`Jump to photo ${idx + 1}`}
                >
                  <img
                    src={thumb}
                    alt={`Thumbnail ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </footer>
          )}
        </div>
      )}
    </>
  );
}
