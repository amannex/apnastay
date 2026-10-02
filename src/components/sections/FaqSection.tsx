'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const REAL_FAQS = [
  {
    id: 1,
    question: 'How is ApnaStay different from short-term stay platforms?',
    answer:
      'ApnaStay is built specifically for long-term accommodation (months and years) rather than vacation or one-night stays. We connect tenants looking for a real home with genuine property owners, cutting out broker commissions and providing upfront clarity on living costs.'
  },
  {
    id: 2,
    question: 'Is ApnaStay truly zero brokerage?',
    answer:
      'Yes, 100%. We believe charging tenants a full month’s rent simply to find a place to live is outdated. You deal directly with property owners without middleman commissions.'
  },
  {
    id: 3,
    question: 'Which areas and localities are currently live?',
    answer:
      'We are in our early validation stage and prioritize verified depth over nationwide clutter. Our initial focus includes high-demand rental hubs like Indirapuram (Ghaziabad / NCR), DLF & Cyber City (Gurugram), Vijay Nagar (Indore), and C-Scheme (Jaipur).'
  },
  {
    id: 4,
    question: 'How do I visit a property I like?',
    answer:
      'When you find a home that matches your needs, you can review its photo gallery, exact location, and amenity checklist, then connect directly with the owner to schedule a convenient in-person visit.'
  },
  {
    id: 5,
    question: 'How can property owners list their space?',
    answer:
      'Homeowners can list their space for free in minutes. Simply upload genuine photographs, set your expected monthly rent and deposit, specify your preferences, and start receiving direct inquiries from serious tenants.'
  }
];

export default function FaqSection() {
  const [openId, setOpenId] = useState<number | null>(1);

  return (
    <section id="faq" className="py-20 sm:py-24 bg-white border-b border-[#EDEDED]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EDEDED] text-xs font-semibold text-[#4B5563] tracking-tight mb-3 shadow-xs">
            <HelpCircle className="w-3.5 h-3.5 text-[#ED3258]" />
            <span>Common Questions</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#6B7280] mt-2">
            Clear, honest answers about long-term renting on ApnaStay.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3.5">
          {REAL_FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#FAFAFA] border-[#ED3258]/40 shadow-xs'
                    : 'bg-white border-[#EDEDED] hover:border-[#D1D5DB]'
                }`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-semibold text-[#1A1A1A] pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                      isOpen ? 'bg-[#ED3258] text-white rotate-180' : 'bg-[#FAFAFA] text-[#6B7280]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-[#6B7280] leading-relaxed border-t border-[#EDEDED]/60">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
