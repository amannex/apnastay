import React from 'react';
import { VALUE_PROPS } from '../../data/staticProperties';
import { ShieldCheck, BadgePercent, FileText, Key, Zap, CheckCircle2, Sparkles } from 'lucide-react';

const ICON_MAP = {
  ShieldCheck: ShieldCheck,
  BadgePercent: BadgePercent,
  FileText: FileText,
  Key: Key,
  Zap: Zap
};

export default function WhyOwnStayGrid() {
  return (
    <section id="why-ownstay" className="py-24 bg-[#FAFAFA] border-y border-[#EDEDED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER WITH RELEVANT CONTEXTUAL TAG */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            OwnStay Zero-Brokerage Promise
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A] mb-4">
            Real Rental Transparency That Matters More Than Fancy UI.
          </h2>
          <p className="text-[#6B7280] text-base sm:text-lg">
            We rebuilt the Indian rental journey from scratch. No 1-month brokerage, no offline middlemen, no running after landlords.
          </p>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUE_PROPS.map((item, idx) => {
            const Icon = ICON_MAP[item.icon] || CheckCircle2;
            const isWide = idx === 0 || idx === 3 || idx === 4;
            return (
              <div
                key={item.id}
                className={`group relative bg-white p-8 rounded-3xl border border-[#EDEDED] shadow-sm hover:shadow-apple-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${
                  isWide ? 'md:col-span-2' : 'md:col-span-1'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-[#E1224D] group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold border bg-rose-50 text-[#E1224D] border-rose-100">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[#6B7280] text-sm sm:text-base leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-[#FAFAFA] flex items-center justify-between text-xs font-semibold text-[#6B7280]">
                  <span>OwnStay Standard Guarantee</span>
                  <span className="text-[#E1224D] group-hover:translate-x-1 transition-transform">
                    Learn more →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
