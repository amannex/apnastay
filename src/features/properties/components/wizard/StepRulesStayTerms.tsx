'use client';

import React, { useState } from 'react';
import {
  Cigarette,
  Wine,
  Users,
  PawPrint,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import type { PropertyRules } from '../../types';
import { sanitizePropertyRules } from '../../rules';

export interface StepRulesStayTermsProps {
  propertyId: string;
  initialRules?: PropertyRules | null;
  onBack: () => void;
  onSave: (rules: PropertyRules) => Promise<void> | void;
  isSaving?: boolean;
}

export default function StepRulesStayTerms({
  initialRules,
  onSave,
}: StepRulesStayTermsProps) {
  // 1. Smoking: Allowed / Not allowed / Designated area
  const [smokingRule, setSmokingRule] = useState<'allowed' | 'not_allowed' | 'designated_area'>(() => {
    if (initialRules?.smokingRule) return initialRules.smokingRule;
    if (initialRules?.smokingPolicy === 'with_restrictions') return 'designated_area';
    if (initialRules?.smokingPolicy === 'allowed' || initialRules?.smokingAllowed) return 'allowed';
    return 'not_allowed';
  });

  // 2. Alcohol: Allowed / Not allowed / Designated area
  const [alcoholRule, setAlcoholRule] = useState<'allowed' | 'not_allowed' | 'designated_area'>(() => {
    if (initialRules?.alcoholRule) return initialRules.alcoholRule;
    if (initialRules?.alcoholPolicy === 'with_restrictions') return 'designated_area';
    if (initialRules?.alcoholPolicy === 'allowed' || initialRules?.alcoholAllowed) return 'allowed';
    return 'not_allowed';
  });

  // 3. Visitors: Allowed / Not allowed / Restricted
  const [visitorsRule, setVisitorsRule] = useState<'allowed' | 'not_allowed' | 'restricted'>(() => {
    if (initialRules?.visitorsRule) return initialRules.visitorsRule;
    if (initialRules?.guestPolicy === 'with_restrictions') return 'restricted';
    if (initialRules?.guestPolicy === 'not_allowed' || initialRules?.visitorsAllowed === false) return 'not_allowed';
    return 'allowed';
  });

  // 4. Pets: Allowed / Not allowed / With approval
  const [petsRule, setPetsRule] = useState<'allowed' | 'not_allowed' | 'with_approval'>(() => {
    if (initialRules?.petsRule) return initialRules.petsRule;
    if (initialRules?.petPolicy === 'with_restrictions') return 'with_approval';
    if (initialRules?.petPolicy === 'allowed' || initialRules?.petsAllowed) return 'allowed';
    return 'not_allowed';
  });

  // 5. Parties: Allowed / Not allowed / With permission
  const [partiesRule, setPartiesRule] = useState<'allowed' | 'not_allowed' | 'with_permission'>(() => {
    if (initialRules?.partiesRule) return initialRules.partiesRule;
    return 'not_allowed';
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: PropertyRules = sanitizePropertyRules({
      ...(initialRules || {}),
      smokingRule,
      alcoholRule,
      visitorsRule,
      petsRule,
      partiesRule
    });

    onSave(payload);
  };

  const RULES_DATA = [
    {
      id: 'smoking',
      label: 'Smoking',
      icon: Cigarette,
      value: smokingRule,
      onChange: (val: any) => setSmokingRule(val),
      options: [
        { id: 'allowed', label: 'Allowed' },
        { id: 'not_allowed', label: 'Not allowed' },
        { id: 'designated_area', label: 'Designated area' }
      ]
    },
    {
      id: 'alcohol',
      label: 'Alcohol',
      icon: Wine,
      value: alcoholRule,
      onChange: (val: any) => setAlcoholRule(val),
      options: [
        { id: 'allowed', label: 'Allowed' },
        { id: 'not_allowed', label: 'Not allowed' },
        { id: 'designated_area', label: 'Designated area' }
      ]
    },
    {
      id: 'visitors',
      label: 'Visitors',
      icon: Users,
      value: visitorsRule,
      onChange: (val: any) => setVisitorsRule(val),
      options: [
        { id: 'allowed', label: 'Allowed' },
        { id: 'not_allowed', label: 'Not allowed' },
        { id: 'restricted', label: 'Restricted' }
      ]
    },
    {
      id: 'pets',
      label: 'Pets',
      icon: PawPrint,
      value: petsRule,
      onChange: (val: any) => setPetsRule(val),
      options: [
        { id: 'allowed', label: 'Allowed' },
        { id: 'not_allowed', label: 'Not allowed' },
        { id: 'with_approval', label: 'With approval' }
      ]
    },
    {
      id: 'parties',
      label: 'Parties',
      icon: Sparkles,
      value: partiesRule,
      onChange: (val: any) => setPartiesRule(val),
      options: [
        { id: 'allowed', label: 'Allowed' },
        { id: 'not_allowed', label: 'Not allowed' },
        { id: 'with_permission', label: 'With permission' }
      ]
    }
  ];

  return (
    <form
      id="rules-terms-form"
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto py-2 space-y-8 animate-fade-in"
      noValidate
    >
      {/* SECTION HEADING (Airbnb Style) */}
      <div className="space-y-1">
        <h1 className="font-outfit text-2xl sm:text-[30px] font-semibold text-[#222222] tracking-tight">
          Rules & stay terms
        </h1>
        <p className="font-inter text-sm sm:text-base text-[#717171] leading-normal">
          Guests must agree to your rules before they book or check in.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-primary flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-primary" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* PROPERTY RULES SECTION */}
      <div className="space-y-4">
        <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
          Property rules
        </h2>

        <div className="space-y-3 sm:space-y-4">
          {RULES_DATA.map((rule) => {
            const Icon = rule.icon;
            return (
              <div
                key={rule.id}
                className="py-2 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
              >
                {/* RULE NAME & ICON */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F7F7F7] flex items-center justify-center text-[#222222] shrink-0">
                    <Icon className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <span className="font-inter text-sm sm:text-base font-medium text-[#222222]">
                    {rule.label}
                  </span>
                </div>

                {/* OPTIONS PILL BUTTONS */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap justify-start sm:justify-end">
                  {rule.options.map((option) => {
                    const isSelected = rule.value === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => rule.onChange(option.id)}
                        className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
                          isSelected
                            ? 'border border-[#717171] bg-[#F7F7F7] font-semibold text-[#222222]'
                            : 'border border-[#E0E0E0] bg-white font-medium text-[#222222] hover:border-[#717171]'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </form>
  );
}
