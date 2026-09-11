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
  Edit3,
  Compass,
  Navigation,
  Eye,
  EyeOff,
  Camera,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import type { Property, PropertyType, RentalStructure, PropertyAvailability, PropertyPhoto } from '../../types';
import { getPropertyTemplate } from '../../templates';
import { createPropertyDraft, updateProperty, getProperty } from '../../api';
import StepPropertyType from './StepPropertyType';
import StepRentalStructure from './StepRentalStructure';
import StepBasicDetails, { BasicDetailsFormData } from './StepBasicDetails';
import StepLocation, { LocationFormData } from './StepLocation';
import StepPhotos from './StepPhotos';

export default function AddPropertyWizard() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null);
  const [customPropertyType, setCustomPropertyType] = useState<string>('');
  const [selectedStructure, setSelectedStructure] = useState<RentalStructure | null>(null);

  // Basic Details draft form state (preserved on back navigation)
  const [basicDetails, setBasicDetails] = useState<Partial<BasicDetailsFormData>>({});

  // Location draft form state (preserved on back navigation)
  const [locationData, setLocationData] = useState<Partial<LocationFormData>>({});

  // Photos draft state (Phase 5)
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);

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

          // Restore location form fields
          if (prop.location) {
            setLocationData({
              addressLine1: prop.location.addressLine1 || '',
              locality: prop.location.locality || '',
              city: prop.location.city || '',
              state: prop.location.state || '',
              pincode: prop.location.pincode || '',
              landmark: prop.location.landmark || '',
              latitude: prop.location.latitude,
              longitude: prop.location.longitude,
              hideExactAddress: prop.location.hideExactAddress
            });
          }

          // Restore photos form fields (Phase 5)
          if (prop.photos && prop.photos.length > 0) {
            setPhotos(prop.photos);
          }

          // Determine step from URL or progress
          const stepParam = Number(params.get('step'));
          if (stepParam >= 1 && stepParam <= 6) {
            setCurrentStep(stepParam as 1 | 2 | 3 | 4 | 5 | 6);
          } else if (prop.photos && prop.photos.length > 0) {
            setCurrentStep(5);
          } else if (prop.location?.city && prop.location?.addressLine1 && prop.location?.pincode) {
            setCurrentStep(5);
          } else if (prop.pricing?.monthlyRent && prop.pricing.monthlyRent > 0) {
            setCurrentStep(4);
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
  const syncDraftState = (prop: Property, step: 1 | 2 | 3 | 4 | 5 | 6) => {
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

  // --------------------------------------------------------------------------
  // Step 4: Location Back & Save Handlers
  // --------------------------------------------------------------------------
  const handleBackFromLocation = (currentValues: LocationFormData) => {
    setLocationData(currentValues);
    setCurrentStep(3);
    if (createdProperty && typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=3`;
      window.history.replaceState(null, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveLocation = async (data: LocationFormData) => {
    if (!createdProperty) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await updateProperty(createdProperty.id, {
        location: {
          addressLine1: data.addressLine1,
          locality: data.locality,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          landmark: data.landmark,
          latitude: data.latitude,
          longitude: data.longitude,
          hideExactAddress: data.hideExactAddress
        }
      });

      if (res.success && res.data) {
        setLocationData(data);
        syncDraftState(res.data, 5);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res.error || 'Failed to save property location.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error while saving location.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Step 5: Photos Back & Save Handlers (Phase 5)
  // --------------------------------------------------------------------------
  const handleBackFromPhotos = (currentPhotos: PropertyPhoto[]) => {
    setPhotos(currentPhotos);
    setCurrentStep(4);
    if (createdProperty && typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=4`;
      window.history.replaceState(null, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSavePhotos = async (currentPhotos: PropertyPhoto[]) => {
    if (!createdProperty) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await updateProperty(createdProperty.id, {
        photos: currentPhotos
      });

      if (res.success && res.data) {
        setPhotos(currentPhotos);
        syncDraftState(res.data, 6);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res.error || 'Failed to save property photos.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error while saving photos.');
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
    setLocationData({});
    setPhotos([]);
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

        {/* PROGRESS STEPPER (5 STEPS) */}
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

          <div className="w-3 sm:w-5 h-[2px] bg-[#EDEDED]" />

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

          <div className="w-3 sm:w-5 h-[2px] bg-[#EDEDED]" />

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

          <div className="w-3 sm:w-5 h-[2px] bg-[#EDEDED]" />

          {/* Step 4: Location */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep > 4
                  ? 'bg-emerald-600 text-white'
                  : currentStep === 4
                  ? 'bg-[#1D1D1F] text-white shadow-sm'
                  : 'bg-[#EDEDED] text-[#86868B]'
              }`}
            >
              {currentStep > 4 ? <CheckCircle2 className="w-4 h-4" /> : '4'}
            </div>
            <span
              className={`text-xs font-bold hidden sm:inline ${
                currentStep >= 4 ? 'text-[#1D1D1F]' : 'text-[#86868B]'
              }`}
            >
              Location
            </span>
          </div>

          <div className="w-3 sm:w-5 h-[2px] bg-[#EDEDED]" />

          {/* Step 5: Upcoming Phase (Photos & Amenities) */}
          <div className="flex items-center gap-1.5 opacity-40">
            <div className="w-7 h-7 rounded-full bg-[#EDEDED] text-[#86868B] flex items-center justify-center text-xs font-bold">
              5
            </div>
            <span className="text-xs font-semibold text-[#86868B] hidden sm:inline">
              Photos
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

      {/* STEP 4: LOCATION */}
      {currentStep === 4 && selectedType && selectedStructure && !isLoadingDraft && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm">
          <StepLocation
            propertyType={selectedType}
            customPropertyType={customPropertyType}
            rentalStructure={selectedStructure}
            initialValues={{
              addressLine1: locationData.addressLine1 ?? createdProperty?.location?.addressLine1,
              locality: locationData.locality ?? createdProperty?.location?.locality,
              city: locationData.city ?? createdProperty?.location?.city,
              state: locationData.state ?? createdProperty?.location?.state,
              pincode: locationData.pincode ?? createdProperty?.location?.pincode,
              landmark: locationData.landmark ?? createdProperty?.location?.landmark,
              latitude: locationData.latitude ?? createdProperty?.location?.latitude,
              longitude: locationData.longitude ?? createdProperty?.location?.longitude,
              hideExactAddress:
                locationData.hideExactAddress ?? createdProperty?.location?.hideExactAddress
            }}
            onBack={handleBackFromLocation}
            onSave={handleSaveLocation}
            isSaving={isSubmitting}
          />
        </div>
      )}

      {/* STEP 5: PHOTOS (PHASE 5) */}
      {currentStep === 5 && createdProperty && !isLoadingDraft && (
        <div className="space-y-6 animate-fade-in">
          <StepPhotos
            propertyId={createdProperty.id}
            initialPhotos={photos.length > 0 ? photos : createdProperty.photos || []}
            onBack={handleBackFromPhotos}
            onSave={handleSavePhotos}
            isSaving={isSubmitting}
          />
        </div>
      )}

      {/* STEP 6: PHASE 5 COMPLETION SUMMARY CARD */}
      {currentStep === 6 && createdProperty && !isLoadingDraft && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EDEDED] shadow-apple-sm text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 5 Complete — Photos & Listing Saved</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
              Property Photos Saved!
            </h2>
            <p className="text-xs sm:text-sm text-[#86868B] mt-2 leading-relaxed">
              Your photos and listing information have been safely stored with your property draft.
              Tenants can now visually explore your listing with high-quality media.
            </p>
          </div>

          {/* DRAFT OVERVIEW CARD */}
          <div className="max-w-lg mx-auto p-5 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] text-left space-y-4">
            {/* COVER PHOTO THUMBNAIL IF AVAILABLE */}
            {(() => {
              const currentPhotos = photos.length > 0 ? photos : createdProperty.photos || [];
              const cover = currentPhotos.find((p) => p.isCover) || currentPhotos[0];
              if (cover) {
                return (
                  <div className="relative rounded-2xl overflow-hidden aspect-video w-full bg-[#EDEDED] border border-[#EDEDED]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover.thumbnailUrl || cover.url}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-extrabold shadow-sm">
                      <Star className="w-3 h-3 fill-white" />
                      <span>Cover Photo</span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-bold inline-flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{currentPhotos.length} photo{currentPhotos.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#86868B] font-semibold">Property Title</span>
                <span className="font-bold text-[#1D1D1F] text-right truncate max-w-[240px]">
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
                <span className="text-[#86868B] font-semibold">Monthly Starting Rent</span>
                <span className="font-extrabold text-emerald-600">
                  ₹{createdProperty.pricing?.monthlyRent?.toLocaleString('en-IN') || '0'}
                </span>
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

              {/* LOCATION DETAILS SECTION */}
              <div className="pt-3 border-t border-[#EDEDED] space-y-2">
                <div className="flex items-start justify-between text-xs gap-3">
                  <span className="text-[#86868B] font-semibold shrink-0 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Locality & City</span>
                  </span>
                  <span className="font-bold text-[#1D1D1F] text-right">
                    {[createdProperty.location?.locality, createdProperty.location?.city]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </span>
                </div>

                <div className="flex items-start justify-between text-xs gap-3">
                  <span className="text-[#86868B] font-semibold shrink-0">State & PIN Code</span>
                  <span className="font-bold text-[#1D1D1F] text-right">
                    {[createdProperty.location?.state, createdProperty.location?.pincode]
                      .filter(Boolean)
                      .join(' - ') || '—'}
                  </span>
                </div>

                {createdProperty.location?.landmark && (
                  <div className="flex items-start justify-between text-xs gap-3">
                    <span className="text-[#86868B] font-semibold shrink-0 flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-[#86868B]" />
                      <span>Landmark</span>
                    </span>
                    <span className="font-medium text-[#1D1D1F] text-right">
                      {createdProperty.location.landmark}
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between text-xs gap-3">
                  <span className="text-[#86868B] font-semibold shrink-0">Address Privacy</span>
                  <span className="font-semibold text-right">
                    {createdProperty.location?.hideExactAddress ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px]">
                        <EyeOff className="w-3 h-3" />
                        <span>Protected (Private)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                        <Eye className="w-3 h-3" />
                        <span>Public on listing</span>
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* MEDIA DETAILS */}
              <div className="pt-3 border-t border-[#EDEDED] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#86868B] font-semibold flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Gallery Media</span>
                  </span>
                  <span className="font-bold text-[#1D1D1F]">
                    {(photos.length > 0 ? photos.length : createdProperty.photos?.length) || 0} Photos Attached
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-[#EDEDED]">
                <span className="text-[#86868B] font-semibold">Listing Completeness</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  <span>Draft ({createdProperty.completenessScore}% complete)</span>
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(5);
                if (typeof window !== 'undefined') {
                  const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=5`;
                  window.history.replaceState(null, '', newUrl);
                }
              }}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Camera className="w-4 h-4" />
              <span>Manage Photos</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentStep(4);
                if (typeof window !== 'undefined') {
                  const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=4`;
                  window.history.replaceState(null, '', newUrl);
                }
              }}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Location</span>
            </button>

            <Link
              href="/owner/dashboard/properties"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all"
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
