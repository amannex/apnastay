'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Check,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Eye,
  ListChecks,
  Building2,
  FileText,
  MapPin,
  Camera,
  Layers,
  IndianRupee,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Info,
  ExternalLink,
  Lock,
  Globe
} from 'lucide-react';
import type { Property } from '../../types';
import {
  evaluateListingCompleteness,
  CompletenessSectionKey,
  ListingCompletenessResult
} from '../../completeness';
import PropertyTenantPreview from '../preview/PropertyTenantPreview';
import { formatCurrency } from '../../pricing';

interface StepReviewProps {
  property: Property;
  onBack: () => void;
  onEditSection: (stepNumber: number) => void;
  onSaveDraft: () => Promise<void> | void;
  onPublish: () => Promise<void> | void;
  isSaving?: boolean;
  isPublishing?: boolean;
}

export default function StepReview({
  property,
  onBack,
  onEditSection,
  onSaveDraft,
  onPublish,
  isSaving = false,
  isPublishing = false
}: StepReviewProps) {
  const [viewMode, setViewMode] = useState<'audit' | 'preview'>('audit');

  const evaluation: ListingCompletenessResult = useMemo(
    () => evaluateListingCompleteness(property),
    [property]
  );

  const getSectionIcon = (key: CompletenessSectionKey) => {
    switch (key) {
      case 'property_type':
      case 'rental_structure':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      case 'basic_details':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'location':
        return <MapPin className="w-4 h-4 text-rose-500" />;
      case 'photos':
        return <Camera className="w-4 h-4 text-amber-500" />;
      case 'amenities':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'units':
        return <Layers className="w-4 h-4 text-violet-600" />;
      case 'pricing':
        return <IndianRupee className="w-4 h-4 text-emerald-600" />;
      case 'availability':
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case 'rules':
        return <ShieldAlert className="w-4 h-4 text-purple-600" />;
    }
  };

  const renderSectionSummary = (key: CompletenessSectionKey) => {
    switch (key) {
      case 'property_type':
        return (
          <span className="font-semibold text-xs text-[#1D1D1F]">
            {property.customPropertyType || property.propertyType}
          </span>
        );
      case 'rental_structure':
        return (
          <span className="font-semibold text-xs text-[#1D1D1F]">
            {property.rentalStructure.replace('_', ' ')}
          </span>
        );
      case 'basic_details':
        return (
          <div className="space-y-0.5">
            <p className="font-bold text-xs text-[#1D1D1F] truncate">{property.title || 'Untitled Listing'}</p>
            <p className="text-[11px] text-[#86868B] truncate max-w-md">
              {property.description || 'No description provided'}
            </p>
          </div>
        );
      case 'location':
        return (
          <span className="font-semibold text-xs text-[#1D1D1F]">
            {[property.location?.locality, property.location?.city, property.location?.pincode]
              .filter(Boolean)
              .join(', ') || 'No address specified'}
          </span>
        );
      case 'photos':
        return (
          <span className="font-semibold text-xs text-[#1D1D1F]">
            {property.photos?.length || 0} photo{property.photos?.length !== 1 ? 's' : ''} uploaded
          </span>
        );
      case 'amenities':
        const total = (property.amenities?.length || 0) + (property.customAmenities?.length || 0);
        return (
          <span className="font-semibold text-xs text-[#1D1D1F]">
            {total} amenit{total !== 1 ? 'ies' : 'y'} selected
          </span>
        );
      case 'units':
        return (
          <span className="font-semibold text-xs text-[#1D1D1F]">
            {property.units?.length || 0} unit{property.units?.length !== 1 ? 's' : ''} configured
          </span>
        );
      case 'pricing':
        return (
          <span className="font-bold text-xs text-emerald-600">
            {property.pricing?.pricingMode === 'on_request'
              ? 'Price on Request'
              : property.pricing?.monthlyRent
              ? `${formatCurrency(property.pricing.monthlyRent)} /month`
              : 'Rent not configured'}
          </span>
        );
      case 'availability':
        return (
          <span className="font-semibold text-xs text-[#1D1D1F]">
            {property.availability?.type === 'immediate'
              ? 'Available Immediately'
              : property.availability?.availableFrom
              ? `Available from ${property.availability.availableFrom}`
              : 'Move-in date not set'}
          </span>
        );
      case 'rules':
        const customCount = property.rules?.customRules?.length || 0;
        const suitability = property.rules?.suitableFor?.length || 0;
        return (
          <span className="font-semibold text-xs text-[#1D1D1F]">
            {suitability > 0 ? `${suitability} profile preferences` : 'Rules configured'}{' '}
            {customCount > 0 ? `(${customCount} custom rules)` : ''}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ==================================================================== */}
      {/* HEADER & VIEW MODE SWITCHER */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F7] border border-[#EDEDED] text-[11px] font-bold text-[#1D1D1F] uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Step 10: Final Review & Publish Readiness</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1D1D1F] tracking-tight">
            Review Your Property Listing
          </h2>
          <p className="text-xs sm:text-sm text-[#86868B] mt-1">
            Audit listing completeness, view what tenants see, and publish when ready.
          </p>
        </div>

        {/* View Switcher Segmented Control */}
        <div className="flex items-center p-1 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('audit')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'audit'
                ? 'bg-white text-[#1D1D1F] shadow-apple-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5 text-indigo-600" />
            <span>Owner Audit</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'preview'
                ? 'bg-white text-[#1D1D1F] shadow-apple-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tenant Preview</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. TENANT PREVIEW VIEW */}
      {/* ==================================================================== */}
      {viewMode === 'preview' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
            <span className="font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>This is how your live listing appears to prospective tenants on ApnaStay.</span>
            </span>
            <button
              type="button"
              onClick={() => setViewMode('audit')}
              className="font-bold underline hover:text-indigo-700"
            >
              Back to Checklist
            </button>
          </div>

          <PropertyTenantPreview property={property} />
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. OWNER AUDIT & COMPLETENESS CHECKLIST */}
      {/* ==================================================================== */}
      {viewMode === 'audit' && (
        <div className="space-y-6 animate-fade-in">
          {/* COMPLETENESS PROGRESS BAR & PUBLISH STATUS BANNER */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#F5F5F7] to-white border border-[#EDEDED] shadow-apple-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F]">
                    {evaluation.score}% Complete
                  </span>
                  {evaluation.isPublishable ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ready to Publish</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Action Required to Publish</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#86868B] mt-1">
                  {evaluation.isPublishable
                    ? 'All required publishing requirements are satisfied. Recommended details can still be added to boost tenant inquiries.'
                    : `${evaluation.missingRequired.length} essential item${evaluation.missingRequired.length > 1 ? 's' : ''} must be completed before publishing.`}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="text-center px-3 py-1.5 rounded-xl bg-white border border-[#EDEDED]">
                  <span className="text-rose-600 block text-base font-extrabold">
                    {evaluation.missingRequired.length}
                  </span>
                  <span className="text-[#86868B] text-[10px]">Required</span>
                </div>
                <div className="text-center px-3 py-1.5 rounded-xl bg-white border border-[#EDEDED]">
                  <span className="text-amber-600 block text-base font-extrabold">
                    {evaluation.recommendedImprovements.length}
                  </span>
                  <span className="text-[#86868B] text-[10px]">Suggestions</span>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  evaluation.score >= 90
                    ? 'bg-emerald-500'
                    : evaluation.score >= 60
                    ? 'bg-indigo-600'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${evaluation.score}%` }}
              />
            </div>
          </div>

          {/* MISSING REQUIRED ITEMS CALLOUT ALERT */}
          {!evaluation.isPublishable && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Required Items Missing Before Publishing</span>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                You can still save this listing as an in-progress draft at any time. However, to publish and make it visible to prospective tenants, please complete the following:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {evaluation.missingRequired.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onEditSection(item.stepNumber)}
                    className="p-3 rounded-xl bg-white border border-rose-200 hover:border-rose-400 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-rose-900 block">{item.label}</span>
                      <span className="text-[11px] text-rose-700 block mt-0.5">{item.message}</span>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-rose-100 text-rose-800 font-extrabold text-[10px] shrink-0">
                      Step {item.stepNumber} →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RECOMMENDED IMPROVEMENTS (IF ANY) */}
          {evaluation.recommendedImprovements.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Recommended Improvements ({evaluation.recommendedImprovements.length})</span>
                </div>
                <span className="text-[11px] font-semibold text-amber-700">Optional for publishing</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {evaluation.recommendedImprovements.slice(0, 4).map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => onEditSection(rec.stepNumber)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-200 hover:border-amber-400 text-xs font-medium text-amber-950 transition-all text-left"
                  >
                    <span>{rec.label}</span>
                    <span className="text-[10px] font-bold text-amber-600 underline">Step {rec.stepNumber}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* SECTION-BY-SECTION AUDIT CARDS (10 SECTIONS) */}
          {/* ==================================================================== */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#86868B] uppercase tracking-wider">
              Listing Sections Audit
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {(Object.keys(evaluation.sections) as CompletenessSectionKey[]).map((key) => {
                const sec = evaluation.sections[key];
                return (
                  <div
                    key={key}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EDEDED] hover:border-gray-300 transition-all shadow-apple-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[#EDEDED] shrink-0 mt-0.5">
                        {getSectionIcon(key)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#F5F5F7] text-[#86868B]">
                            Step {sec.stepNumber}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-[#1D1D1F]">
                            {sec.title}
                          </h4>
                          {sec.isComplete ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>Required info missing</span>
                            </span>
                          )}
                        </div>

                        <div>{renderSectionSummary(key)}</div>

                        {sec.missingRecommendedCount > 0 && (
                          <div className="text-[11px] text-amber-700 font-medium">
                            💡 {sec.missingRecommendedCount} suggestion available
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section Edit Action */}
                    <button
                      type="button"
                      onClick={() => onEditSection(sec.stepNumber)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-xs font-bold text-[#1D1D1F] transition-all self-end sm:self-center shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#86868B]" />
                      <span>Edit</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* BOTTOM NAVIGATION & ACTIONS */}
      {/* ==================================================================== */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EDEDED]">
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving || isPublishing}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Rules</span>
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Save as Draft (Always Allowed) */}
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving || isPublishing}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-[#1D1D1F] border-t-transparent rounded-full animate-spin" />
                <span>Saving Draft...</span>
              </>
            ) : (
              <span>Save Incomplete Draft</span>
            )}
          </button>

          {/* Publish Listing Button */}
          <button
            type="button"
            onClick={onPublish}
            disabled={!evaluation.isPublishable || isPublishing || isSaving}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2 transition-all shadow-apple-sm ${
              evaluation.isPublishable
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isPublishing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Publishing Listing...</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                <span>Publish Listing Live</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
