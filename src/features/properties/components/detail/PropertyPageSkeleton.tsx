'use client';

import React from 'react';

export default function PropertyPageSkeleton() {
  return (
    <div
      className="min-h-screen bg-[#FAFAFA] pt-20 sm:pt-24 lg:pt-28 pb-32 sm:pb-36 lg:pb-20 animate-[pulse_3s_ease-in-out_infinite]"
      aria-label="Loading property details"
      aria-busy="true"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 1. BREADCRUMB SKELETON */}
        <div className="flex items-center space-x-2 py-1">
          <div className="h-3.5 w-16 bg-gray-200 rounded-md" />
          <div className="h-3.5 w-3 bg-gray-200 rounded-md" />
          <div className="h-3.5 w-16 bg-gray-200 rounded-md" />
          <div className="h-3.5 w-3 bg-gray-200 rounded-md" />
          <div className="h-3.5 w-24 bg-gray-200 rounded-md" />
          <div className="h-3.5 w-3 bg-gray-200 rounded-md hidden sm:inline-block" />
          <div className="h-3.5 w-36 bg-gray-200 rounded-md hidden sm:inline-block" />
        </div>

        {/* 2. HERO & GALLERY SKELETON (RESPONSIVE ORDERING) */}
        <div className="flex flex-col">
          {/* Desktop Hero Information */}
          <div className="order-2 lg:order-1 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <div className="h-6 w-24 bg-gray-200 rounded-full" />
                <div className="h-6 w-32 bg-gray-200 rounded-full hidden sm:block" />
                <div className="h-6 w-28 bg-gray-200 rounded-full" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-gray-200 rounded-xl" />
                <div className="h-8 w-16 bg-gray-200 rounded-xl" />
              </div>
            </div>
            <div className="h-8 sm:h-10 w-3/4 bg-gray-200 rounded-xl" />
            <div className="h-4 w-1/2 bg-gray-200 rounded-md" />
          </div>

          {/* Gallery Skeleton */}
          <div className="order-1 lg:order-2 pb-6">
            {/* Mobile single image skeleton */}
            <div className="block md:hidden aspect-[4/3] sm:aspect-[16/9] w-full bg-gray-200 rounded-3xl" />
            {/* Desktop 3-column gallery skeleton */}
            <div className="hidden md:grid grid-cols-3 gap-2 h-[360px] md:h-[400px] lg:h-[480px] rounded-3xl overflow-hidden">
              <div className="col-span-2 h-full bg-gray-200" />
              <div className="col-span-1 grid grid-rows-2 gap-2 h-full">
                <div className="h-full bg-gray-200" />
                <div className="h-full bg-gray-200" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. MAIN CONTENT GRID (2 COLUMNS LEFT, 1 COLUMN RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pt-2">
          {/* LEFT 2 COLUMNS */}
          <div className="lg:col-span-2 space-y-8">
            {/* MOBILE ONLY PRICE SKELETON */}
            <div className="block lg:hidden bg-white rounded-3xl p-5 border border-gray-100 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-8 w-32 bg-gray-200 rounded-lg" />
                <div className="h-6 w-24 bg-gray-200 rounded-full" />
              </div>
              <div className="h-5 w-28 bg-gray-100 rounded-md" />
            </div>

            {/* SNAPSHOT SKELETON */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-7 border border-gray-100 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-6 w-36 bg-gray-200 rounded-md" />
                <div className="h-4 w-20 bg-gray-100 rounded-md" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-2xl" />
                ))}
              </div>
            </div>

            {/* DESCRIPTION SKELETON */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-100 space-y-3.5">
              <div className="h-6 w-44 bg-gray-200 rounded-md" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-100 rounded-md" />
                <div className="h-4 w-5/6 bg-gray-100 rounded-md" />
                <div className="h-4 w-4/5 bg-gray-100 rounded-md" />
                <div className="h-4 w-2/3 bg-gray-100 rounded-md" />
              </div>
            </div>

            {/* HIGHLIGHTS SKELETON */}
            <div className="bg-[#FAFAFA] rounded-3xl p-5 sm:p-7 border border-gray-100 space-y-4">
              <div className="h-6 w-40 bg-gray-200 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-white rounded-2xl border border-gray-100" />
                ))}
              </div>
            </div>

            {/* AMENITIES SKELETON */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-100 space-y-5">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div className="h-6 w-48 bg-gray-200 rounded-md" />
                <div className="h-5 w-20 bg-gray-100 rounded-full" />
              </div>
              <div className="space-y-4">
                <div className="h-4 w-32 bg-gray-100 rounded-md" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-14 bg-gray-50 rounded-2xl border border-gray-100" />
                  ))}
                </div>
              </div>
            </div>

            {/* DETAILS & SPECIFICATIONS SKELETON */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-100 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div className="h-6 w-48 bg-gray-200 rounded-md" />
                <div className="h-5 w-24 bg-gray-100 rounded-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <div className="h-4 w-24 bg-gray-100 rounded-md" />
                    <div className="h-4 w-32 bg-gray-100 rounded-md" />
                  </div>
                ))}
              </div>
            </div>

            {/* LOCATION SKELETON */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-100 space-y-5">
              <div className="h-6 w-28 bg-gray-200 rounded-md" />
              <div className="h-5 w-64 bg-gray-100 rounded-md" />
              <div className="h-64 sm:h-80 w-full bg-gray-100 rounded-2xl" />
            </div>

            {/* OWNER CARD SKELETON */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-100 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-36 bg-gray-200 rounded-md" />
                  <div className="h-4 w-24 bg-gray-100 rounded-md" />
                  <div className="h-4 w-28 bg-gray-100 rounded-full" />
                </div>
              </div>
              <div className="h-12 w-full bg-gray-100 rounded-2xl" />
            </div>
          </div>

          {/* RIGHT 1 COLUMN: DESKTOP STICKY CTA SKELETON */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-28">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 space-y-6">
              <div className="space-y-2 pb-5 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="h-9 w-32 bg-gray-200 rounded-lg" />
                  <div className="h-6 w-24 bg-gray-100 rounded-full" />
                </div>
                <div className="h-4 w-28 bg-gray-100 rounded-md" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-100 rounded-md" />
                  <div className="h-4 w-16 bg-gray-100 rounded-md" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-28 bg-gray-100 rounded-md" />
                  <div className="h-4 w-16 bg-gray-100 rounded-md" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-100 rounded-md" />
                  <div className="h-4 w-16 bg-gray-100 rounded-md" />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="h-12 w-full bg-gray-200 rounded-2xl" />
                <div className="h-11 w-full bg-gray-100 rounded-2xl" />
              </div>
            </div>
          </aside>
        </div>

        {/* 4. SIMILAR PROPERTIES SKELETON */}
        <div className="pt-10 border-t border-gray-200 space-y-6">
          <div className="space-y-2">
            <div className="h-5 w-36 bg-gray-200 rounded-full" />
            <div className="h-7 w-48 bg-gray-200 rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden space-y-4 pb-5">
                <div className="aspect-[16/10] w-full bg-gray-200" />
                <div className="px-5 space-y-2">
                  <div className="h-4 w-28 bg-gray-100 rounded-md" />
                  <div className="h-5 w-48 bg-gray-200 rounded-md" />
                  <div className="h-4 w-32 bg-gray-100 rounded-md" />
                  <div className="pt-3 border-t border-gray-50 flex justify-between">
                    <div className="h-5 w-20 bg-gray-200 rounded-md" />
                    <div className="h-4 w-14 bg-gray-100 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { PropertyPageSkeleton as PropertyDetailSkeleton };
