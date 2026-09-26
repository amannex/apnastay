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
  const label = (rule.label || '').trim();
  let value = (rule.value || '').trim();

  // If value is empty or same as label
  if (!value || value.toLowerCase() === label.toLowerCase()) {
    return { label, value: '' };
  }

  // If value starts with the label (e.g. label: "Police Verification", value: "Police Verification Required")
  if (value.toLowerCase().startsWith(label.toLowerCase())) {
    const remainder = value.slice(label.length).replace(/^[:\s-]+/, '').trim();
    if (remainder) {
      return { label, value: remainder };
    }
  }

  // If value is "Visitors permitted until 10:00 PM" and label is "Visitors"
  if (label.toLowerCase() === 'visitors' && /^visitors\s+/i.test(value)) {
    return { label: 'Visitors', value: value.replace(/^visitors\s+/i, '').trim() };
  }

  return { label, value };
}

export default function HouseRulesSection({ property }: HouseRulesSectionProps) {
  const houseRules = property.houseRules || [];
  const tenantRequirements = property.tenantRequirements || [];
  const allRules = property.rules || [];

  if (allRules.length === 0) {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-5 gap-x-8 sm:gap-x-16 pt-1">
              {houseRules.map((rule, idx) => {
                const IconComponent = getRuleIcon(rule);
                const { label, value } = formatRuleText(rule);
                return (
                  <div
                    key={`${rule.id || rule.label}-${idx}`}
                    className="flex items-center gap-4 text-[#1A1A1A]"
                  >
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-black shrink-0 stroke-[1.6]" />
                    <span className="text-sm sm:text-base font-normal">
                      <span className="text-[rgb(31,41,55)]">{label}: </span>
                      {value && <span className="text-[rgb(107,114,128)]">{value}</span>}
                    </span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-5 gap-x-8 sm:gap-x-16 pt-1">
              {tenantRequirements.map((rule, idx) => {
                const IconComponent = getRuleIcon(rule);
                const { label, value } = formatRuleText(rule);
                return (
                  <div
                    key={`${rule.id || rule.label}-${idx}`}
                    className="flex items-center gap-4 text-[#1A1A1A]"
                  >
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-black shrink-0 stroke-[1.6]" />
                    <span className="text-sm sm:text-base font-normal">
                      <span className="text-[rgb(31,41,55)]">{label}: </span>
                      {value && <span className="text-[rgb(107,114,128)]">{value}</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fallback if allRules exists but not categorized into subsets */}
        {houseRules.length === 0 && tenantRequirements.length === 0 && allRules.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-5 gap-x-8 sm:gap-x-16 pt-1">
            {allRules.map((rule, idx) => {
              const IconComponent = getRuleIcon(rule);
              const { label, value } = formatRuleText(rule);
              return (
                <div
                  key={`${rule.id || rule.label}-${idx}`}
                  className="flex items-center gap-4 text-[#1A1A1A]"
                >
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-black shrink-0 stroke-[1.6]" />
                  <span className="text-sm sm:text-base font-normal">
                    <span className="text-[rgb(31,41,55)]">{label}: </span>
                    {value && <span className="text-[rgb(107,114,128)]">{value}</span>}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
