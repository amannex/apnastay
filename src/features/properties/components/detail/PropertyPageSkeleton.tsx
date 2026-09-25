'use client';

import React from 'react';

export default function PropertyPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-6 pb-20 animate-pulse" aria-label="Loading property details" aria-busy="true">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center space-x-2">
          <div className="h-4 w-16 bg-gray-200 rounded-md" />
          <div className="h-4 w-4 bg-gray-200 rounded-md" />
          <div className="h-4 w-20 bg-gray-200 rounded-md" />
          <div className="h-4 w-4 bg-gray-200 rounded-md" />
          <div className="h-4 w-32 bg-gray-200 rounded-md" />
        </div>

        {/* Gallery Skeleton */}
        <div className="h-72 sm:h-96 md:h-[460px] w-full bg-gray-200 rounded-3xl" />

        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left Content (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Skeleton */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 space-y-4">
              <div className="flex gap-2">
                <div className="h-5 w-24 bg-gray-200 rounded-full" />
                <div className="h-5 w-32 bg-gray-200 rounded-full" />
              </div>
              <div className="h-8 w-3/4 bg-gray-200 rounded-lg" />
              <div className="h-4 w-1/2 bg-gray-200 rounded-md" />
            </div>

            {/* Snapshot Skeleton */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 space-y-4">
              <div className="h-6 w-40 bg-gray-200 rounded-md" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-2xl" />
                ))}
              </div>
            </div>

            {/* Description Skeleton */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 space-y-3">
              <div className="h-6 w-48 bg-gray-200 rounded-md" />
              <div className="h-4 w-full bg-gray-100 rounded-md" />
              <div className="h-4 w-5/6 bg-gray-100 rounded-md" />
              <div className="h-4 w-2/3 bg-gray-100 rounded-md" />
            </div>

            {/* Amenities Skeleton */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 space-y-4">
              <div className="h-6 w-52 bg-gray-200 rounded-md" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Action Card Skeleton (1 Col) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 space-y-6">
              <div className="flex justify-between items-center">
                <div className="h-8 w-28 bg-gray-200 rounded-lg" />
                <div className="h-5 w-20 bg-gray-200 rounded-full" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-100 rounded-md" />
                <div className="h-4 w-full bg-gray-100 rounded-md" />
                <div className="h-4 w-full bg-gray-100 rounded-md" />
              </div>
              <div className="h-12 w-full bg-gray-200 rounded-2xl" />
              <div className="h-12 w-full bg-gray-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
