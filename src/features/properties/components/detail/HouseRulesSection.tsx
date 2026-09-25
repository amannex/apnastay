'use client';

import React from 'react';
import {
  BookOpen,
  Check,
  X,
  Info,
  Clock,
  Users,
  Home,
  UserCheck,
  Calendar,
  Dog,
  Cigarette,
  CigaretteOff,
  UserX,
  Utensils,
  Soup,
  Coffee,
  Moon,
  Key,
  FileCheck,
  ShieldAlert,
  Briefcase,
  FileText,
  UserCheck2,
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

function getRuleIcon(iconName?: string): LucideIcon {
  if (iconName && ICON_MAP[iconName]) {
    return ICON_MAP[iconName];
  }
  return Info;
}

export default function HouseRulesSection({ property }: HouseRulesSectionProps) {
  const houseRules = property.houseRules || [];
  const tenantRequirements = property.tenantRequirements || [];
  const allRules = property.rules || [];

  if (allRules.length === 0) {
    return (
      <section
        aria-label="House rules & tenant requirements"
        className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDEDED] shadow-sm space-y-3"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#E1224D]" />
          <h2 className="text-xl font-bold text-[#1A1A1A]">House Rules & Requirements</h2>
        </div>
        <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-gray-100 text-xs sm:text-sm text-[#6B7280]">
          No custom house rules or special tenant restrictions specified by the owner. Standard ApnaStay community etiquette and local tenancy norms apply.
        </div>
      </section>
    );
  }

  const renderRuleCard = (rule: NormalizedRule, index: number) => {
    const IconComponent = getRuleIcon(rule.iconName);

    return (
      <div
        key={`${rule.id || rule.label}-${index}`}
        className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAFAFA] border border-gray-100 hover:border-gray-200 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="p-2 rounded-xl bg-white border border-gray-100 text-gray-600 shadow-2xs shrink-0">
            <IconComponent className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm text-[#4B5563] font-medium truncate">
            {rule.label}
          </span>
        </div>

        <div className="shrink-0">
          {rule.allowed === true && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{rule.value}</span>
            </span>
          )}

          {rule.allowed === false && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200/80">
              <X className="w-3.5 h-3.5 text-rose-600" />
              <span>{rule.value}</span>
            </span>
          )}

          {rule.allowed === 'restricted' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>{rule.value}</span>
            </span>
          )}

          {rule.allowed === undefined && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
              {rule.value}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <section
      aria-label="House rules & tenant requirements"
      className="bg-white rounded-3xl p-5 sm:p-6 lg:p-7 border border-[#EDEDED] shadow-sm space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#E1224D]" />
            <span>House Rules & Requirements</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Guidelines and move-in terms specified directly by the property owner
          </p>
        </div>
      </div>

      {/* 1. HOUSE RULES SUBSECTION */}
      {houseRules.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <span>Living Guidelines</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {houseRules.map((rule, idx) => renderRuleCard(rule, idx))}
          </div>
        </div>
      )}

      {/* 2. TENANT & STAY REQUIREMENTS SUBSECTION */}
      {tenantRequirements.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <span>Tenant & Stay Requirements</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tenantRequirements.map((rule, idx) => renderRuleCard(rule, idx))}
          </div>
        </div>
      )}

      {/* Fallback if allRules exists but not categorized into subsets */}
      {houseRules.length === 0 && tenantRequirements.length === 0 && allRules.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allRules.map((rule, idx) => renderRuleCard(rule, idx))}
        </div>
      )}
    </section>
  );
}
