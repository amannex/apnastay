'use client';

import React, { useState } from 'react';
import { ChevronDown, Sparkles, HelpCircle } from 'lucide-react';

const STATIC_FAQS = [
  {
    id: 1,
    question: 'How does OwnStay guarantee ₹0 Brokerage across India?',
    answer:
      'We connect verified Indian landlords directly with renters. By cutting out offline middlemen and traditional realtors in Indore, Jaipur, Coimbatore, Kochi, Chandigarh, and Pune, you save 1 to 2 months of rent.'
  },
  {
    id: 2,
    question: 'What is the 25-Point Physical Engineering Inspection?',
    answer:
      'Our on-site engineering team visits every apartment before listing. We measure decibel levels (acoustics), test broadband fiber internet speeds, check water pressure, and verify legal ownership deeds.'
  },
  {
    id: 3,
    question: 'How does Aadhaar and PAN digital e-signing work?',
    answer:
      'Once you choose a home, you and the owner complete an Indian Registration Act compliant rental agreement on your smartphone using Aadhaar OTP e-signing in under 10 minutes.'
  },
  {
    id: 4,
    question: 'How do instant NFC smart-lock self-tours work?',
    answer:
      'You can schedule an unaccompanied tour anytime. We issue an encrypted, ephemeral NFC pass to your phone that opens the apartment smart-lock for a 45-minute window.'
  },
  {
    id: 5,
    question: 'What happens to my security deposit when I vacate?',
    answer:
      'Your deposit is held securely with a 360-degree move-in digital photo inventory. When you vacate, you receive a 100% refund within 48 hours.'
  }
];

export default function FaqSection() {
  const [openId, setOpenId] = useState<number | null>(1);

  return (
    <section id="faq" className="py-24 bg-white border-b border-[#EDEDED]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER WITH CONTEXTUAL INDIAN TAG */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            OwnStay Tenant FAQ & Legal Rights
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A]">
            Frequently Asked Questions
          </h2>
          <p className="text-[#6B7280] text-base mt-2">
            Everything you need to know about ₹0 brokerage rentals and Aadhaar e-signing in India.
          </p>
        </div>

        {/* FAQ ACCORDION */}
        <div className="space-y-4">
          {STATIC_FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-3xl border transition-all duration-300 ${
                  isOpen
                    ? 'bg-[#FAFAFA] border-[#E1224D] shadow-sm'
                    : 'bg-white border-[#EDEDED] hover:border-[#D1D5DB]'
                }`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <span className="text-base sm:text-lg font-bold text-[#1A1A1A] pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                      isOpen ? 'bg-[#E1224D] text-white rotate-180' : 'bg-[#FAFAFA] text-[#6B7280]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-[#6B7280] leading-relaxed border-t border-[#EDEDED]/50 animate-slide-down">
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
