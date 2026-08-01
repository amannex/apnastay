'use client';

import React from 'react';
import {
  Users,
  Sparkles,
  Home,
  BedDouble,
  Utensils,
  FileText,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const STAY_CATEGORIES = [
  {
    id: 'pg-hostel',
    title: 'Managed PG & Hostels',
    price: 'From ₹5,500 / mo',
    icon: Users,
    description: 'Safe, hygienic stays with biometric security, CCTV, and daily housekeeping.',
    tag: 'Jaipur & Indore'
  },
  {
    id: 'coliving',
    title: 'Co-Living Suites',
    price: 'From ₹8,500 / mo',
    icon: Sparkles,
    description: 'Private suites with 300 Mbps Wi-Fi, community lounges, and zero lock-in period.',
    tag: 'Tech Corridors'
  },
  {
    id: 'family-flats',
    title: 'Family Flats (1-3 BHK)',
    price: 'From ₹14,000 / mo',
    icon: Home,
    description: 'Furnished independent homes with modular kitchen, chimney, and society parking.',
    tag: 'Families & Couples'
  },
  {
    id: 'independent-rooms',
    title: 'Single & Studio Rooms',
    price: 'From ₹6,000 / mo',
    icon: BedDouble,
    description: 'Private single rooms with attached washroom and balcony for college students & IT freshers.',
    tag: 'Zero Curfew'
  },
  {
    id: 'tiffin-services',
    title: 'Tiffin & Homely Meals',
    price: '₹2,200 / mo add-on',
    icon: Utensils,
    description: 'Fresh 3x daily home-cooked North Indian & Rajasthani meals delivered to your room.',
    tag: 'Hygienic Kitchens'
  },
  {
    id: 'legal-verification',
    title: 'Tenant Police Verification',
    price: '100% Free Service',
    icon: FileText,
    description: 'Instant Aadhaar e-signed legal rent agreement valid for address proof and HRA claims.',
    tag: '10-Min Online KYC'
  }
];

export default function RentalCategoriesShowcase() {
  return (
    <section className="py-20 bg-[#FAFAFA] border-b border-[#EDEDED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* CLEAN MINIMAL HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-[#E1224D] uppercase tracking-wider">
              Explore Stay Categories
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-1">
              Tailored living spaces for every renter.
            </h2>
          </div>

          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#E1224D] hover:underline shrink-0"
          >
            <span>Browse All 1,200+ Homes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* MINIMALIST 3-COLUMN GRID (MAX-W-7XL) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STAY_CATEGORIES.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href="/properties"
                className="group bg-[#FAFAFA] hover:bg-white border border-gray-200/80 hover:border-gray-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#E1224D]/10 group-hover:bg-[#E1224D] text-[#E1224D] group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-700 bg-white px-2.5 py-1 rounded-full border border-gray-200">
                      {item.price}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E1224D]">
                    {item.tag}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-0.5 mb-2 group-hover:text-[#E1224D] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-200/50 flex items-center justify-between text-xs font-semibold text-gray-500 group-hover:text-gray-900">
                  <span>Explore rooms</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform text-[#E1224D]" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
