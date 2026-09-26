'use client';

import React from 'react';
import {
  Users,
  Home,
  UserCheck,
  Calendar,
  Clock,
  FileCheck,
  ShieldAlert,
  Briefcase,
  FileText,
  Dog,
  Cigarette,
  CigaretteOff,
  UserX,
  Utensils,
  Soup,
  Coffee,
  Moon,
  Key,
  Info,
  LucideIcon
} from 'lucide-react';
import type { NormalizedProperty, NormalizedRule } from '../../adapter';

interface HouseRulesSectionProps {
  property: NormalizedProperty;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Home,
  UserCheck,
  Calendar,
  Clock,
  FileCheck,
  ShieldAlert,
  Briefcase,
  FileText,
  Dog,
  Cigarette,
  CigaretteOff,
  UserX,
  Utensils,
  Soup,
  Coffee,
  Moon,
  Key,
  Info
};

function getRuleIcon(rule: NormalizedRule): LucideIcon {
  if (rule.iconName && ICON_MAP[rule.iconName]) {
    return ICON_MAP[rule.iconName];
  }

  const idOrLabel = `${rule.id || ''} ${rule.label || ''} ${rule.value || ''}`.toLowerCase();

  if (/pet|dog|cat|animal/i.test(idOrLabel)) return Dog;
  if (/smoke|smoking|cigarette/i.test(idOrLabel)) {
    return rule.allowed === false ? CigaretteOff : Cigarette;
  }
  if (/visitor|guest/i.test(idOrLabel)) return Users;
  if (/food|cook|kitchen|meal|veg/i.test(idOrLabel)) return Utensils;
  if (/quiet|night|sleep|sound|noise/i.test(idOrLabel)) return Moon;
  if (/bachelor|single|student/i.test(idOrLabel)) return UserCheck;
  if (/minimum|stay|lease|month|duration/i.test(idOrLabel)) return Calendar;
  if (/notice|period|day|time|curfew|timing/i.test(idOrLabel)) return Clock;
  if (/police|verify|verification/i.test(idOrLabel)) return ShieldAlert;
  if (/id|aadhaar|passport|identity|proof/i.test(idOrLabel)) return FileCheck;
  if (/agreement|contract|stamp/i.test(idOrLabel)) return FileText;
  if (/work|office|job|employment|corporate|college/i.test(idOrLabel)) return Briefcase;

  return Info;
}

function formatRuleText(rule: NormalizedRule): { label: string; value: string } {
  let label = (rule.label || '').trim();
  let value = (rule.value || '').trim();

  // If value is empty or same as label
  if (!value || value.toLowerCase() === label.toLowerCase()) {
    return { label, value: '' };
  }

  // If value starts with the label (e.g. label: "Police Verification", value: "Police Verification Required")
  if (value.toLowerCase().startsWith(label.toLowerCase())) {
    const remainder = value.slice(label.length).replace(/^[:\s-]+/, '').trim();
    if (remainder) {
      value = remainder;
    }
  }

  // If value is "Visitors permitted until 10:00 PM" and label is "Visitors"
  if (label.toLowerCase() === 'visitors' && /^visitors\s+/i.test(value)) {
    value = value.replace(/^visitors\s+/i, '').trim();
  }

  // Capitalize first character of value for clean typography
  if (value.length > 0) {
    value = value.charAt(0).toUpperCase() + value.slice(1);
  }

  return { label, value };
}

const EXCLUDED_RULE_KEYWORDS = ['visitor', 'quiet', 'police'];

function isExcludedRule(rule: NormalizedRule): boolean {
  const text = `${rule.id || ''} ${rule.label || ''} ${rule.value || ''}`.toLowerCase();
  return EXCLUDED_RULE_KEYWORDS.some((kw) => text.includes(kw));
}

export default function HouseRulesSection({ property }: HouseRulesSectionProps) {
  const houseRules = (property.houseRules || []).filter((r) => !isExcludedRule(r));
  const tenantRequirements = (property.tenantRequirements || []).filter((r) => !isExcludedRule(r));
  const allRules = (property.rules || []).filter((r) => !isExcludedRule(r));

  if (houseRules.length === 0 && tenantRequirements.length === 0 && allRules.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="House rules & tenant requirements"
      className="py-6 sm:py-8 space-y-6"
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
          House Rules & Requirements
        </h2>
      </div>

      <div className="space-y-8">
        {/* 1. LIVING GUIDELINES / HOUSE RULES */}
        {houseRules.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-medium text-[#1A1A1A]">
              Living Guidelines
            </h3>
            <div className="space-y-4 sm:space-y-5 pt-2">
              {houseRules.map((rule, idx) => {
                const IconComponent = getRuleIcon(rule);
                const { label, value } = formatRuleText(rule);
                return (
                  <div
                    key={`${rule.id || rule.label}-${idx}`}
                    className="flex items-center justify-between text-[#1A1A1A] gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-black shrink-0 stroke-[1.6]" />
                      <span className="text-sm sm:text-base font-normal text-[rgb(31,41,55)] truncate">
                        {label}
                      </span>
                    </div>
                    {value && (
                      <span className="text-sm sm:text-base font-normal text-[rgb(107,114,128)] shrink-0 text-right">
                        {value}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. TENANT & STAY REQUIREMENTS */}
        {tenantRequirements.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-medium text-[#1A1A1A]">
              Tenant & Stay Requirements
            </h3>
            <div className="space-y-4 sm:space-y-5 pt-2">
              {tenantRequirements.map((rule, idx) => {
                const IconComponent = getRuleIcon(rule);
                const { label, value } = formatRuleText(rule);
                return (
                  <div
                    key={`${rule.id || rule.label}-${idx}`}
                    className="flex items-center justify-between text-[#1A1A1A] gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-black shrink-0 stroke-[1.6]" />
                      <span className="text-sm sm:text-base font-normal text-[rgb(31,41,55)] truncate">
                        {label}
                      </span>
                    </div>
                    {value && (
                      <span className="text-sm sm:text-base font-normal text-[rgb(107,114,128)] shrink-0 text-right">
                        {value}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fallback if allRules exists but not categorized into subsets */}
        {houseRules.length === 0 && tenantRequirements.length === 0 && allRules.length > 0 && (
          <div className="space-y-4 sm:space-y-5 pt-2">
            {allRules.map((rule, idx) => {
              const IconComponent = getRuleIcon(rule);
              const { label, value } = formatRuleText(rule);
              return (
                <div
                  key={`${rule.id || rule.label}-${idx}`}
                  className="flex items-center justify-between text-[#1A1A1A] gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-black shrink-0 stroke-[1.6]" />
                    <span className="text-sm sm:text-base font-normal text-[rgb(31,41,55)] truncate">
                      {label}
                    </span>
                  </div>
                  {value && (
                    <span className="text-sm sm:text-base font-normal text-[rgb(107,114,128)] shrink-0 text-right">
                      {value}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
