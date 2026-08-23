'use client';

import React from 'react';
import BlogSection from '../components/sections/BlogSection';
import { Sparkles, BookOpen, Mail } from 'lucide-react';

interface JournalPageProps {
  initialPosts: any[];
}

export default function JournalPage({ initialPosts }: JournalPageProps) {
  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* DEDICATED JOURNAL HEADER */}
        <div className="py-10 border-b border-[#EDEDED] mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Indian Urban Living & Rent Law Guides
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A]">
            The ApnaStay Knowledge Hub.
          </h1>
          <p className="text-[#6B7280] text-sm sm:text-base mt-2 max-w-2xl">
            Everything you need to know about Indian rental agreements, security deposit refund laws, acoustic soundproofing, and moving into Tier-2 tech hubs.
          </p>
        </div>

        {/* ARTICLES GRID */}
        <BlogSection initialPosts={initialPosts} />

        {/* NEWSLETTER SUBSCRIBE BANNER */}
        <div className="mt-16 bg-white rounded-3xl p-8 sm:p-12 border border-[#EDEDED] shadow-sm max-w-3xl mx-auto text-center">
          <BookOpen className="w-10 h-10 text-[#E1224D] mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            Subscribe to ApnaStay Tier-2 Market Reports
          </h3>
          <p className="text-sm text-[#6B7280] mb-6">
            Get monthly data on rental yield trends in Indore, Jaipur, Coimbatore, Kochi, Chandigarh, and Pune.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full px-4 py-3 rounded-xl border border-[#EDEDED] bg-[#FAFAFA] text-xs font-medium focus:outline-none focus:border-[#E1224D]"
            />
            <button
              onClick={() => alert('Subscribed to ApnaStay Indian Rental Market Reports!')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E1224D] text-white text-xs font-bold shadow-apple hover:bg-[#C71B42] transition-colors shrink-0"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
