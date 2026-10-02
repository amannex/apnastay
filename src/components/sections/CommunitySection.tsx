'use client';

import React, { useState } from 'react';
import { Users, Mail, CheckCircle2, MessageCircle, ArrowRight } from 'lucide-react';

export default function CommunitySection() {
  const [email, setEmail] = useState('');
  const [localityInterest, setLocalityInterest] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section id="community" className="py-20 sm:py-24 bg-[#FAFAFA] border-b border-[#EDEDED]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EDEDED] shadow-xs text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#ED3258] text-xs font-semibold tracking-tight mb-4">
            <Users className="w-3.5 h-3.5" />
            <span>Early ApnaStay Community</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A]">
            Be part of how ApnaStay is built.
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[#6B7280] max-w-xl mx-auto leading-relaxed">
            We are in our early validation stage. Join tenants and homeowners who want an honest, long-term rental platform in India. Get direct updates when new homes open in your locality.
          </p>

          {submitted ? (
            <div className="mt-8 p-6 bg-rose-50/50 border border-rose-100 rounded-2xl max-w-md mx-auto text-center animate-slide-up">
              <CheckCircle2 className="w-8 h-8 text-[#ED3258] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#1A1A1A]">Welcome to the community!</p>
              <p className="text-xs text-[#6B7280] mt-1">
                We&apos;ve noted your interest{localityInterest ? ` for ${localityInterest}` : ''}. We&apos;ll notify you directly as genuine listings and owner openings go live.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#EDEDED] rounded-2xl text-xs sm:text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#ED3258] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#ED3258] text-white text-xs sm:text-sm font-semibold rounded-2xl transition-all shadow-xs shrink-0 flex items-center justify-center gap-1.5"
                >
                  <span>Join Community</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                type="text"
                value={localityInterest}
                onChange={(e) => setLocalityInterest(e.target.value)}
                placeholder="Preferred locality (e.g. Indirapuram, DLF Gurugram)"
                className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#EDEDED] rounded-xl text-xs text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#ED3258] transition-colors"
              />

              <p className="text-[11px] text-[#9CA3AF] text-center pt-1">
                No spam. Only updates regarding genuine rental openings and community discussions.
              </p>
            </form>
          )}

          {/* Direct Community Chat Link */}
          <div className="mt-8 pt-6 border-t border-[#F5F5F7] flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-[#6B7280]">
            <span>Have questions or want to partner with us in your area?</span>
            <a
              href="https://instagram.com/apnastay.in_"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#ED3258] hover:text-[#C71B42] font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Connect on Instagram @apnastay.in_</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
