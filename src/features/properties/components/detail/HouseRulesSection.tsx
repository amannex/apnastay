'use client';

import React from 'react';
import { BookOpen, Check, X, AlertCircle } from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface HouseRulesSectionProps {
  property: NormalizedProperty;
}

export default function HouseRulesSection({ property }: HouseRulesSectionProps) {
  const rules = property.rules || [];

  if (rules.length === 0) {
    return (
      <section aria-label="House rules" className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDEDED] shadow-sm">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-3">House Rules & Terms</h2>
        <p className="text-xs sm:text-sm text-[#6B7280]">Standard ApnaStay respectful co-living and community guidelines apply.</p>
      </section>
    );
  }

  return (
    <section aria-label="House rules & requirements" className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDEDED] shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#E1224D]" />
          <span>House Rules & Requirements</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {rules.map((rule, idx) => (
          <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAFAFA] border border-gray-100">
            <span className="text-xs sm:text-sm text-[#6B7280] font-medium">{rule.label}</span>
            <span className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5 ml-2">
              {rule.allowed === true && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              {rule.allowed === false && <X className="w-3.5 h-3.5 text-rose-600" />}
              {rule.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
