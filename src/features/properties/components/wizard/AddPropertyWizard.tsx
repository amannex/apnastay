'use client';

import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';
import type { Property, PropertyType, RentalStructure } from '../../types';
import { getPropertyTemplate } from '../../templates';
import { createPropertyDraft } from '../../api';
import StepPropertyType from './StepPropertyType';
import StepRentalStructure from './StepRentalStructure';

export default function AddPropertyWizard() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null);
  const [customPropertyType, setCustomPropertyType] = useState<string>('');
  const [selectedStructure, setSelectedStructure] = useState<RentalStructure | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdProperty, setCreatedProperty] = useState<Property | null>(null);

  // Handle Step 1 Type Selection
  const handleSelectType = (type: PropertyType) => {
    setSelectedType(type);
    setErrorMsg(null);
    // Pre-seed recommended structure for the chosen template
    const template = getPropertyTemplate(type);
    setSelectedStructure(template.defaultRentalStructure);
  };

  // Advance from Step 1 to Step 2
  const handleProceedToRentalStructure = () => {
    if (!selectedType) return;
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back from Step 2 to Step 1
  const handleBackToPropertyType = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit and create the Property Draft
  const handleCreateDraft = async () => {
    if (!selectedType || !selectedStructure) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const template = getPropertyTemplate(selectedType);
      const res = await createPropertyDraft({
        propertyType: selectedType,
        customPropertyType: selectedType === 'other' ? customPropertyType.trim() : undefined,
        rentalStructure: selectedStructure,
        title: selectedType === 'other' && customPropertyType
          ? `New ${customPropertyType} Draft`
          : `New ${template.label} Draft`
      });

      if (res.success && res.data) {
        setCreatedProperty(res.data);
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res.error || 'Failed to create property draft. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error while creating draft.');
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep >= 1
                  ? 'bg-[#1D1D1F] text-white shadow-sm'
                  : 'bg-[#EDEDED] text-[#86868B]'
              }`}
            >
              1
            </div>
            <span className="text-xs font-bold text-[#1D1D1F] hidden sm:inline">
              Format
            </span>
          </div>

          <div className="w-6 sm:w-10 h-[2px] bg-[#EDEDED]" />

          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep >= 2
                  ? 'bg-[#1D1D1F] text-white shadow-sm'
                  : 'bg-[#EDEDED] text-[#86868B]'
              }`}
            >
              2
            </div>
            <span
              className={`text-xs font-bold hidden sm:inline ${
                currentStep >= 2 ? 'text-[#1D1D1F]' : 'text-[#86868B]'
              }`}
            >
              Rental Model
            </span>
          </div>

          <div className="w-6 sm:w-10 h-[2px] bg-[#EDEDED]" />

          <div className="flex items-center gap-1.5 opacity-60">
            <div className="w-7 h-7 rounded-full bg-[#EDEDED] text-[#86868B] flex items-center justify-center text-xs font-bold">
              3
            </div>
            <span className="text-xs font-semibold text-[#86868B] hidden sm:inline">
              Details
            </span>
          </div>
        </div>
      </div>

      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: PROPERTY TYPE */}
      {currentStep === 1 && (
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
      {currentStep === 2 && selectedType && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm">
          <StepRentalStructure
            selectedType={selectedType}
            selectedStructure={selectedStructure}
            onSelectStructure={setSelectedStructure}
            onBack={handleBackToPropertyType}
            onContinue={handleCreateDraft}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* STEP 3: DRAFT CREATED / PHASE 2 COMPLETION CARD */}
      {currentStep === 3 && createdProperty && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EDEDED] shadow-apple-sm text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 2 Complete — Draft Initialized</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
              Property Draft Created!
            </h2>
            <p className="text-xs sm:text-sm text-[#86868B] mt-2 leading-relaxed">
              Your property has been saved to your landlord portfolio as a draft. You can safely leave and return anytime without losing progress.
            </p>
          </div>

          {/* DRAFT SUMMARY CARD */}
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] text-left space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#86868B] font-semibold">Draft ID</span>
              <span className="font-mono font-bold text-[#1D1D1F]">{createdProperty.id}</span>
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
              <span className="text-[#86868B] font-semibold">Listing Status</span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                <span>Draft (15% Complete)</span>
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/owner/dashboard/properties"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>View in My Properties</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => {
                // Reset to create another property
                setCurrentStep(1);
                setSelectedType(null);
                setCustomPropertyType('');
                setSelectedStructure(null);
                setCreatedProperty(null);
              }}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs sm:text-sm font-bold transition-all"
            >
              List Another Property
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
