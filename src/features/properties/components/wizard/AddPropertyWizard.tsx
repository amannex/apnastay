'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Clock,
  Layers,
  MapPin,
  IndianRupee,
  Calendar,
  Loader2,
  Edit3
} from 'lucide-react';
import type { Property, PropertyType, RentalStructure, PropertyAvailability } from '../../types';
import { getPropertyTemplate } from '../../templates';
import { createPropertyDraft, updateProperty, getProperty } from '../../api';
import StepPropertyType from './StepPropertyType';
import StepRentalStructure from './StepRentalStructure';
import StepBasicDetails, { BasicDetailsFormData } from './StepBasicDetails';

export default function AddPropertyWizard() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null);
  const [customPropertyType, setCustomPropertyType] = useState<string>('');
  const [selectedStructure, setSelectedStructure] = useState<RentalStructure | null>(null);

  // Basic Details draft form state (preserved on back navigation)
  const [basicDetails, setBasicDetails] = useState<Partial<BasicDetailsFormData>>({});

  const [isLoadingDraft, setIsLoadingDraft] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdProperty, setCreatedProperty] = useState<Property | null>(null);

  // --------------------------------------------------------------------------
  // Draft Restoration on Mount / Page Refresh
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const draftIdFromUrl = params.get('draftId');
    const savedDraftId = draftIdFromUrl || window.sessionStorage?.getItem('apnastay_active_draft_id');

    if (!savedDraftId) return;

    setIsLoadingDraft(true);
    getProperty(savedDraftId)
      .then((res) => {
        if (res.success && res.data) {
          const prop = res.data;
          setCreatedProperty(prop);
          setSelectedType(prop.propertyType);
          if (prop.customPropertyType) {
            setCustomPropertyType(prop.customPropertyType);
          }
          setSelectedStructure(prop.rentalStructure);

          // Restore basic details form fields
          setBasicDetails({
            title: prop.title?.startsWith('New ') && prop.title?.endsWith('Draft') ? '' : prop.title,
            description: prop.description || '',
            availability: prop.availability || { type: 'immediate' },
            monthlyRent: prop.pricing?.monthlyRent || 0
          });

          // Determine step from URL or progress
          const stepParam = Number(params.get('step'));
          if (stepParam >= 1 && stepParam <= 4) {
            setCurrentStep(stepParam as 1 | 2 | 3 | 4);
          } else {
            setCurrentStep(3);
          }
        }
      })
      .catch(() => {
        // Fallback silently if draft fetch failed
      })
      .finally(() => {
        setIsLoadingDraft(false);
      });
  }, []);

  // Update browser history and session storage whenever draft or step updates
  const syncDraftState = (prop: Property, step: 1 | 2 | 3 | 4) => {
    setCreatedProperty(prop);
    setCurrentStep(step);
    if (typeof window !== 'undefined') {
      window.sessionStorage?.setItem('apnastay_active_draft_id', prop.id);
      const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(prop.id)}&step=${step}`;
      window.history.replaceState(null, '', newUrl);
    }
  };

  // --------------------------------------------------------------------------
  // Step 1: Type Selection
  // --------------------------------------------------------------------------
  const handleSelectType = (type: PropertyType) => {
    setSelectedType(type);
    setErrorMsg(null);
    const template = getPropertyTemplate(type);
    setSelectedStructure(template.defaultRentalStructure);
  };

  const handleProceedToRentalStructure = () => {
    if (!selectedType) return;
    setCurrentStep(2);
    if (createdProperty && typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=2`;
      window.history.replaceState(null, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToPropertyType = () => {
    setCurrentStep(1);
    if (createdProperty && typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=1`;
      window.history.replaceState(null, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --------------------------------------------------------------------------
  // Step 2: Rental Structure & Draft Creation/Update
  // --------------------------------------------------------------------------
  const handleCreateOrUpdateDraft = async () => {
    if (!selectedType || !selectedStructure) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const template = getPropertyTemplate(selectedType);

      // If a draft was already initialized, update it instead of creating a duplicate
      if (createdProperty?.id) {
        const res = await updateProperty(createdProperty.id, {
          propertyType: selectedType,
          customPropertyType: selectedType === 'other' ? customPropertyType.trim() : undefined,
          rentalStructure: selectedStructure
        });

        if (res.success && res.data) {
          syncDraftState(res.data, 3);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setErrorMsg(res.error || 'Failed to update property draft.');
        }
      } else {
        // Create new draft
        const defaultTitle =
          selectedType === 'other' && customPropertyType
            ? `New ${customPropertyType} Draft`
            : `New ${template.label} Draft`;

        const res = await createPropertyDraft({
          propertyType: selectedType,
          customPropertyType: selectedType === 'other' ? customPropertyType.trim() : undefined,
          rentalStructure: selectedStructure,
          title: defaultTitle
        });

        if (res.success && res.data) {
          syncDraftState(res.data, 3);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setErrorMsg(res.error || 'Failed to create property draft. Please try again.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error while initializing draft.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Step 3: Basic Details Back & Save Handlers
  // --------------------------------------------------------------------------
  const handleBackFromBasicDetails = (currentValues: BasicDetailsFormData) => {
    setBasicDetails(currentValues);
    setCurrentStep(2);
    if (createdProperty && typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=2`;
      window.history.replaceState(null, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveBasicDetails = async (data: BasicDetailsFormData) => {
    if (!createdProperty) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await updateProperty(createdProperty.id, {
        title: data.title,
        description: data.description,
        availability: data.availability,
        pricing: {
          monthlyRent: data.monthlyRent
        }
      });

      if (res.success && res.data) {
        setBasicDetails(data);
        syncDraftState(res.data, 4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res.error || 'Failed to save basic property details.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error while saving details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset wizard to create another property
  const handleReset = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage?.removeItem('apnastay_active_draft_id');
      window.history.replaceState(null, '', window.location.pathname);
    }
    setCurrentStep(1);
    setSelectedType(null);
    setCustomPropertyType('');
    setSelectedStructure(null);
    setBasicDetails({});
    setCreatedProperty(null);
    setErrorMsg(null);
  };

  const getFormatLabel = () => {
    if (selectedType === 'other' && customPropertyType) {
      return customPropertyType;
    }
    return selectedType ? getPropertyTemplate(selectedType).label : '';
  };

  const getRentalLabel = () => {
    switch (selectedStructure) {
      case 'entire_property':
        return 'Entire Property';
      case 'individual_unit':
        return 'Individual Unit (Flat)';
      case 'individual_room':
        return 'Individual Room';
      case 'individual_bed':
        return 'Individual Bed';
      case 'multiple_units':
        return 'Multiple Units';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* TOP HEADER & BREADCRUMBS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDEDED]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#86868B] mb-1">
            <Link
              href="/owner/dashboard/properties"
              className="hover:text-[#1D1D1F] transition-colors"
            >
              My Properties
            </Link>
            <span>/</span>
            <span className="text-[#1D1D1F] font-bold">List New Property</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1D1D1F] tracking-tight">
            Add Property
          </h1>
        </div>

        {/* PROGRESS STEPPER */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Step 1: Format */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep > 1
                  ? 'bg-emerald-600 text-white'
                  : currentStep === 1
                  ? 'bg-[#1D1D1F] text-white shadow-sm'
                  : 'bg-[#EDEDED] text-[#86868B]'
              }`}
            >
              {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <span
              className={`text-xs font-bold hidden sm:inline ${
                currentStep >= 1 ? 'text-[#1D1D1F]' : 'text-[#86868B]'
              }`}
            >
              Format
            </span>
          </div>

          <div className="w-4 sm:w-6 h-[2px] bg-[#EDEDED]" />

          {/* Step 2: Rental Model */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep > 2
                  ? 'bg-emerald-600 text-white'
                  : currentStep === 2
                  ? 'bg-[#1D1D1F] text-white shadow-sm'
                  : 'bg-[#EDEDED] text-[#86868B]'
              }`}
            >
              {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
            </div>
            <span
              className={`text-xs font-bold hidden sm:inline ${
                currentStep >= 2 ? 'text-[#1D1D1F]' : 'text-[#86868B]'
              }`}
            >
              Rental Model
            </span>
          </div>

          <div className="w-4 sm:w-6 h-[2px] bg-[#EDEDED]" />

          {/* Step 3: Basic Details */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep > 3
                  ? 'bg-emerald-600 text-white'
                  : currentStep === 3
                  ? 'bg-[#1D1D1F] text-white shadow-sm'
                  : 'bg-[#EDEDED] text-[#86868B]'
              }`}
            >
              {currentStep > 3 ? <CheckCircle2 className="w-4 h-4" /> : '3'}
            </div>
            <span
              className={`text-xs font-bold hidden sm:inline ${
                currentStep >= 3 ? 'text-[#1D1D1F]' : 'text-[#86868B]'
              }`}
            >
              Basic Details
            </span>
          </div>

          <div className="w-4 sm:w-6 h-[2px] bg-[#EDEDED]" />

          {/* Step 4: Location (Upcoming) */}
          <div className="flex items-center gap-1.5 opacity-40">
            <div className="w-7 h-7 rounded-full bg-[#EDEDED] text-[#86868B] flex items-center justify-center text-xs font-bold">
              4
            </div>
            <span className="text-xs font-semibold text-[#86868B] hidden sm:inline">
              Location
            </span>
          </div>
        </div>
      </div>

      {/* DRAFT LOADING INDICATOR */}
      {isLoadingDraft && (
        <div className="p-4 rounded-2xl bg-white border border-[#EDEDED] shadow-apple-sm flex items-center justify-center gap-2 text-xs font-semibold text-[#86868B]">
          <Loader2 className="w-4 h-4 animate-spin text-[#1D1D1F]" />
          <span>Restoring your saved property draft...</span>
        </div>
      )}

      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: PROPERTY TYPE */}
      {currentStep === 1 && !isLoadingDraft && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm">
          <StepPropertyType
            selectedType={selectedType}
            customPropertyType={customPropertyType}
            onSelectType={handleSelectType}
            onChangeCustomType={setCustomPropertyType}
            onContinue={handleProceedToRentalStructure}
          />
        </div>
      )}

      {/* STEP 2: RENTAL STRUCTURE */}
      {currentStep === 2 && selectedType && !isLoadingDraft && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm">
          <StepRentalStructure
            selectedType={selectedType}
            selectedStructure={selectedStructure}
            onSelectStructure={setSelectedStructure}
            onBack={handleBackToPropertyType}
            onContinue={handleCreateOrUpdateDraft}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* STEP 3: BASIC DETAILS */}
      {currentStep === 3 && selectedType && selectedStructure && !isLoadingDraft && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm">
          <StepBasicDetails
            propertyType={selectedType}
            customPropertyType={customPropertyType}
            rentalStructure={selectedStructure}
            initialValues={{
              title: basicDetails.title ?? createdProperty?.title,
              description: basicDetails.description ?? createdProperty?.description,
              availability: basicDetails.availability ?? createdProperty?.availability,
              monthlyRent: basicDetails.monthlyRent ?? createdProperty?.pricing?.monthlyRent
            }}
            onBack={handleBackFromBasicDetails}
            onSave={handleSaveBasicDetails}
            isSaving={isSubmitting}
          />
        </div>
      )}

      {/* STEP 4: PHASE 3 COMPLETION SUMMARY CARD */}
      {currentStep === 4 && createdProperty && !isLoadingDraft && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EDEDED] shadow-apple-sm text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 3 Complete — Basic Details Saved</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
              Property Details Saved!
            </h2>
            <p className="text-xs sm:text-sm text-[#86868B] mt-2 leading-relaxed">
              Your basic property information has been successfully updated on your draft. You can safely exit and return anytime.
            </p>
          </div>

          {/* DRAFT SUMMARY CARD */}
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] text-left space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#86868B] font-semibold">Property Title</span>
              <span className="font-bold text-[#1D1D1F] text-right truncate max-w-[200px]">
                {createdProperty.title}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#86868B] font-semibold">Property Format</span>
              <span className="font-bold text-[#1D1D1F]">{getFormatLabel()}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#86868B] font-semibold">Rental Offering</span>
              <span className="font-bold text-[#1D1D1F]">{getRentalLabel()}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#86868B] font-semibold">Move-In Availability</span>
              <span className="font-bold text-[#1D1D1F] inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {createdProperty.availability?.type === 'immediate'
                    ? 'Available Now'
                    : `From ${createdProperty.availability?.availableFrom}`}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#86868B] font-semibold">Monthly Starting Rent</span>
              <span className="font-extrabold text-emerald-600">
                ₹{createdProperty.pricing?.monthlyRent?.toLocaleString('en-IN') || '0'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#EDEDED]">
              <span className="text-[#86868B] font-semibold">Listing Completeness</span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                <span>Draft ({createdProperty.completenessScore}% complete)</span>
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(3);
                if (typeof window !== 'undefined') {
                  const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=3`;
                  window.history.replaceState(null, '', newUrl);
                }
              }}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Basic Details</span>
            </button>

            <Link
              href="/owner/dashboard/properties"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>View in My Properties</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl text-[#86868B] hover:text-[#1D1D1F] text-xs sm:text-sm font-semibold transition-all"
            >
              List Another Property
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
