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
  Image as ImageIcon,
  BedDouble,
  Zap,
  Wrench,
  Tag,
  ShieldAlert,
  Users,
  Utensils,
  PawPrint,
  Cigarette,
  Wine,
  FileCheck2,
  ListPlus,
  Bookmark
} from 'lucide-react';
import type {
  Property,
  PropertyType,
  RentalStructure,
  PropertyAvailability,
  PropertyPhoto,
  PropertyUnit,
  PropertyPricing,
  PropertyRules
} from '../../types';
import { getPropertyTemplate } from '../../templates';
import {
  createPropertyDraft,
  updateProperty,
  getProperty,
  updatePropertyAmenities,
  updatePropertyUnits,
  updatePropertyPricing,
  updatePropertyRules,
  publishProperty
} from '../../api';
import { AMENITY_REGISTRY } from '../../amenities';
import { getUnitTerminology, calculateUnitAvailability } from '../../units';
import {
  formatCurrency,
  calculateEffectiveDeposit,
  getPropertyAvailabilityLabel,
  formatPricingDisplay
} from '../../pricing';
import {
  getPolicyBadgeInfo,
  formatFoodPolicy,
  formatKitchenPolicy,
  formatTimingPolicy,
  formatResidentSuitability
} from '../../rules';
import StepPropertyType from './StepPropertyType';
import StepRentalStructure from './StepRentalStructure';
import StepBasicDetails, { BasicDetailsFormData } from './StepBasicDetails';
import StepLocation, { LocationFormData } from './StepLocation';
import StepPhotos from './StepPhotos';
import StepAmenities from './StepAmenities';
import StepUnits from './StepUnits';
import StepPricing from './StepPricing';
import StepRules from './StepRules';
import StepReview from './StepReview';
import { determineNextIncompleteStep } from '../../completeness';

export default function AddPropertyWizard() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>(1);
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null);
  const [customPropertyType, setCustomPropertyType] = useState<string>('');
  const [selectedStructure, setSelectedStructure] = useState<RentalStructure | null>(null);

  // Basic Details draft form state (preserved on back navigation)
  const [basicDetails, setBasicDetails] = useState<Partial<BasicDetailsFormData>>({});

  // Location draft form state (preserved on back navigation)
  const [locationData, setLocationData] = useState<Partial<LocationFormData>>({});

  // Photos draft state (Phase 5)
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);

  // Amenities draft state (Phase 6)
  const [amenities, setAmenities] = useState<string[]>([]);
  const [customAmenities, setCustomAmenities] = useState<string[]>([]);

  // Units draft state (Phase 7)
  const [units, setUnits] = useState<PropertyUnit[]>([]);

  // Rules draft state (Phase 9)
  const [rules, setRules] = useState<PropertyRules | null>(null);

  const [isLoadingDraft, setIsLoadingDraft] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isPublishedSuccess, setIsPublishedSuccess] = useState<boolean>(false);
  const [hasResumedDraft, setHasResumedDraft] = useState<boolean>(false);
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

          // Restore amenities form fields (Phase 6)
          if (prop.amenities && prop.amenities.length > 0) {
            setAmenities(prop.amenities);
          }
          if (prop.customAmenities && prop.customAmenities.length > 0) {
            setCustomAmenities(prop.customAmenities);
          }

          // Restore units state (Phase 7)
          if (prop.units && prop.units.length > 0) {
            setUnits(prop.units);
          }

          // Restore rules state (Phase 9)
          if (prop.rules) {
            setRules(prop.rules);
          }

          // Determine step from URL or intelligent progress evaluation
          const stepParam = Number(params.get('step'));
          if (stepParam >= 1 && stepParam <= 10) {
            setCurrentStep(stepParam as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10);
          } else {
            const nextStep = determineNextIncompleteStep(prop);
            setCurrentStep(nextStep);
          }
          setHasResumedDraft(true);
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
  const syncDraftState = (prop: Property, step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10) => {
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

  // --------------------------------------------------------------------------
  // Step 6: Amenities Back & Save Handlers (Phase 6)
  // --------------------------------------------------------------------------
  const handleBackFromAmenities = (currentAmenities: string[], currentCustom: string[]) => {
    setAmenities(currentAmenities);
    setCustomAmenities(currentCustom);
    setCurrentStep(5);
    if (createdProperty && typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=5`;
      window.history.replaceState(null, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAmenities = async (currentAmenities: string[], currentCustom: string[]) => {
    if (!createdProperty) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await updatePropertyAmenities(
        createdProperty.id,
        currentAmenities,
        currentCustom
      );

      if (res.success && res.data) {
        setAmenities(currentAmenities);
        setCustomAmenities(currentCustom);
        syncDraftState(res.data, 7);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res.error || 'Failed to save property amenities.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error while saving amenities.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Step 7: Units & Rooms Back & Save Handlers (Phase 7)
  // --------------------------------------------------------------------------
  const handleBackFromUnits = (currentUnits: PropertyUnit[]) => {
    setUnits(currentUnits);
    setCurrentStep(6);
    if (createdProperty && typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=6`;
      window.history.replaceState(null, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveUnits = async (currentUnits: PropertyUnit[]) => {
    if (!createdProperty) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Explicitly persist the latest units array to the property draft
      const res = await updatePropertyUnits(createdProperty.id, currentUnits);

      if (res.success && res.data) {
        setUnits(res.data.units || currentUnits);
        syncDraftState(res.data, 8);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Safe local state fallback so wizard never halts
        setUnits(currentUnits);
        syncDraftState({ ...createdProperty, units: currentUnits }, 8);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      // Safe fallback
      setUnits(currentUnits);
      syncDraftState({ ...createdProperty, units: currentUnits }, 8);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipUnits = async () => {
    if (!createdProperty) return;
    // Simply advance to pricing without requiring units
    syncDraftState(createdProperty, 8);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --------------------------------------------------------------------------
  // Step 8: Pricing & Availability Back & Save Handlers (Phase 8)
  // --------------------------------------------------------------------------
  const handleBackFromPricing = () => {
    setCurrentStep(7);
    if (createdProperty && typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=7`;
      window.history.replaceState(null, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSavePricing = async (data: {
    propertyPricing: PropertyPricing;
    propertyAvailability: PropertyAvailability;
    units?: PropertyUnit[];
  }) => {
    if (!createdProperty) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (data.units && data.units.length > 0) {
        setUnits(data.units);
        await updatePropertyUnits(createdProperty.id, data.units);
      }

      const res = await updatePropertyPricing(
        createdProperty.id,
        data.propertyPricing,
        data.propertyAvailability
      );

      if (res.success && res.data) {
        syncDraftState(res.data, 9);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res.error || 'Failed to save property pricing.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error while saving pricing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Step 9: Rules & Preferences Handlers (Phase 9)
  // --------------------------------------------------------------------------
  const handleBackFromRules = () => {
    setCurrentStep(8);
    if (createdProperty && typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=8`;
      window.history.replaceState(null, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveRules = async (rulesPayload: PropertyRules) => {
    if (!createdProperty) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await updatePropertyRules(createdProperty.id, rulesPayload);

      if (res.success && res.data) {
        setRules(res.data);
        const updated = { ...createdProperty, rules: res.data };
        syncDraftState(updated, 10);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res.error || 'Failed to save property rules.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error while saving rules.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Step 10: Review & Publishing (Phase 10)
  // --------------------------------------------------------------------------
  const handlePublishListing = async () => {
    if (!createdProperty) return;

    setIsPublishing(true);
    setErrorMsg(null);

    try {
      const res = await publishProperty(createdProperty.id, { strict: true });

      if (res.success && res.data) {
        setCreatedProperty(res.data);
        setIsPublishedSuccess(true);
        if (typeof window !== 'undefined') {
          window.sessionStorage?.removeItem('apnastay_active_draft_id');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res.error || 'Failed to publish listing. Please check required fields.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error while publishing listing.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveIncompleteDraft = async () => {
    if (createdProperty && typeof window !== 'undefined') {
      window.sessionStorage?.setItem('apnastay_active_draft_id', createdProperty.id);
    }
    router.push('/owner/dashboard/properties');
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
    setAmenities([]);
    setCustomAmenities([]);
    setUnits([]);
    setRules(null);
    setCreatedProperty(null);
    setIsPublishedSuccess(false);
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#EDEDED]">
        <div className="flex items-center justify-between gap-4">
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

          {/* Mobile Save Draft & Exit */}
          {createdProperty && createdProperty.status === 'draft' && (
            <button
              type="button"
              onClick={handleSaveIncompleteDraft}
              disabled={isSubmitting}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] transition-all shadow-apple-xs active:scale-[0.98] disabled:opacity-50"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#86868B]" />
              <span>Save & Exit</span>
            </button>
          )}
        </div>

        {/* PROGRESS STEPPER (10 STEPS) & DESKTOP SAVE DRAFT */}
        <div className="flex items-center gap-4 flex-wrap justify-between lg:justify-end">
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

          {/* Step 5: Photos */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep > 5
                  ? 'bg-emerald-600 text-white'
                  : currentStep === 5
                  ? 'bg-[#1D1D1F] text-white shadow-sm'
                  : 'bg-[#EDEDED] text-[#86868B]'
              }`}
            >
              {currentStep > 5 ? <CheckCircle2 className="w-4 h-4" /> : '5'}
            </div>
            <span
              className={`text-xs font-bold hidden sm:inline ${
                currentStep >= 5 ? 'text-[#1D1D1F]' : 'text-[#86868B]'
              }`}
            >
              Photos
            </span>
          </div>

          <div className="w-3 sm:w-5 h-[2px] bg-[#EDEDED]" />

          {/* Step 6: Amenities */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep > 6
                  ? 'bg-emerald-600 text-white'
                  : currentStep === 6
                  ? 'bg-[#1D1D1F] text-white shadow-sm'
                  : 'bg-[#EDEDED] text-[#86868B]'
              }`}
            >
              {currentStep > 6 ? <CheckCircle2 className="w-4 h-4" /> : '6'}
            </div>
            <span
              className={`text-xs font-bold hidden sm:inline ${
                currentStep >= 6 ? 'text-[#1D1D1F]' : 'text-[#86868B]'
              }`}
            >
              Amenities
            </span>
          </div>

          <div className="w-3 sm:w-5 h-[2px] bg-[#EDEDED]" />

          {/* Step 7: Units & Rooms */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep > 7
                  ? 'bg-emerald-600 text-white'
                  : currentStep === 7
                  ? 'bg-[#1D1D1F] text-white shadow-sm'
                  : 'bg-[#EDEDED] text-[#86868B]'
              }`}
            >
              {currentStep > 7 ? <CheckCircle2 className="w-4 h-4" /> : '7'}
            </div>
            <span
              className={`text-xs font-bold hidden sm:inline ${
                currentStep >= 7 ? 'text-[#1D1D1F]' : 'text-[#86868B]'
              }`}
            >
              Units
            </span>
          </div>

          <div className="w-3 sm:w-5 h-[2px] bg-[#EDEDED]" />

          {/* Step 8: Pricing */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep > 8
                  ? 'bg-emerald-600 text-white'
                  : currentStep === 8
                  ? 'bg-[#1D1D1F] text-white shadow-sm'
                  : 'bg-[#EDEDED] text-[#86868B]'
              }`}
            >
              {currentStep > 8 ? <CheckCircle2 className="w-4 h-4" /> : '8'}
            </div>
            <span
              className={`text-xs font-bold hidden sm:inline ${
                currentStep >= 8 ? 'text-[#1D1D1F]' : 'text-[#86868B]'
              }`}
            >
              Pricing
            </span>
          </div>

          <div className="w-3 sm:w-5 h-[2px] bg-[#EDEDED]" />

          {/* Step 9: Rules */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep > 9
                  ? 'bg-emerald-600 text-white'
                  : currentStep === 9
                  ? 'bg-[#1D1D1F] text-white shadow-sm'
                  : 'bg-[#EDEDED] text-[#86868B]'
              }`}
            >
              {currentStep > 9 ? <CheckCircle2 className="w-4 h-4" /> : '9'}
            </div>
            <span
              className={`text-xs font-bold hidden sm:inline ${
                currentStep >= 9 ? 'text-[#1D1D1F]' : 'text-[#86868B]'
              }`}
            >
              Rules
            </span>
          </div>

          <div className="w-3 sm:w-5 h-[2px] bg-[#EDEDED]" />

          {/* Step 10: Review */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                createdProperty?.status === 'published' || isPublishedSuccess
                  ? 'bg-emerald-600 text-white'
                  : currentStep === 10
                  ? 'bg-[#1D1D1F] text-white shadow-sm'
                  : 'bg-[#EDEDED] text-[#86868B]'
              }`}
            >
              {createdProperty?.status === 'published' || isPublishedSuccess ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                '10'
              )}
            </div>
            <span
              className={`text-xs font-bold hidden sm:inline ${
                currentStep >= 10 ? 'text-[#1D1D1F]' : 'text-[#86868B]'
              }`}
            >
              Review
            </span>
          </div>
        </div>

        {/* Desktop Save Draft & Exit */}
        {createdProperty && createdProperty.status === 'draft' && (
          <button
            type="button"
            onClick={handleSaveIncompleteDraft}
            disabled={isSubmitting}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] transition-all shadow-apple-xs active:scale-[0.98] disabled:opacity-50 shrink-0"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#86868B]" />
            <span>Save Draft & Exit</span>
          </button>
        )}
      </div>
    </div>


      {/* RESUMED DRAFT NOTIFICATION BANNER */}
      {hasResumedDraft && createdProperty && (
        <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between gap-3 text-xs text-sky-900 animate-fade-in shadow-apple-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              Resumed draft for <strong>{createdProperty.title || 'Untitled Property'}</strong> at Step {currentStep}.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setHasResumedDraft(false)}
            className="text-sky-700 hover:text-sky-950 font-semibold underline text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

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

      {/* STEP 6: AMENITIES & FEATURES (PHASE 6) */}
      {currentStep === 6 && createdProperty && !isLoadingDraft && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm">
          <StepAmenities
            propertyType={selectedType}
            customPropertyType={customPropertyType}
            initialAmenities={amenities.length > 0 ? amenities : createdProperty.amenities || []}
            initialCustomAmenities={
              customAmenities.length > 0 ? customAmenities : createdProperty.customAmenities || []
            }
            onBack={handleBackFromAmenities}
            onSave={handleSaveAmenities}
            isSaving={isSubmitting}
          />
        </div>
      )}

      {/* STEP 7: UNITS & ROOMS (PHASE 7) */}
      {currentStep === 7 && createdProperty && !isLoadingDraft && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm">
          <StepUnits
            propertyId={createdProperty.id}
            propertyType={selectedType}
            rentalStructure={selectedStructure}
            initialUnits={units.length > 0 ? units : createdProperty.units || []}
            onBack={handleBackFromUnits}
            onSave={handleSaveUnits}
            onSkip={handleSkipUnits}
            isSaving={isSubmitting}
          />
        </div>
      )}

      {/* STEP 8: PRICING & AVAILABILITY (PHASE 8) */}
      {currentStep === 8 && createdProperty && !isLoadingDraft && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm">
          <StepPricing
            property={createdProperty}
            onBack={handleBackFromPricing}
            onSave={handleSavePricing}
            isSaving={isSubmitting}
          />
        </div>
      )}

      {/* STEP 9: RULES & TENANT PREFERENCES (PHASE 9) */}
      {currentStep === 9 && createdProperty && !isLoadingDraft && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm">
          <StepRules
            property={createdProperty}
            onBack={handleBackFromRules}
            onSave={handleSaveRules}
            isSaving={isSubmitting}
          />
        </div>
      )}

      {/* STEP 10: LISTING REVIEW & PUBLISHING (PHASE 10) */}
      {currentStep === 10 && createdProperty && !isLoadingDraft && (
        <>
          {isPublishedSuccess || createdProperty.status === 'published' ? (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EDEDED] shadow-apple-sm text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Listing is Live!</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
                  Congratulations! Your Property is Published
                </h2>
                <p className="text-xs sm:text-sm text-[#86868B] mt-2 leading-relaxed">
                  &ldquo;{createdProperty.title}&rdquo; is now active and ready to welcome prospective tenants on ApnaStay.
                </p>
              </div>

              {/* PUBLISHED SUMMARY CARD */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] text-left space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#86868B] font-semibold">Status</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Published</span>
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
                  <span className="text-[#86868B] font-semibold">Monthly Rent</span>
                  <span className="font-extrabold text-emerald-600">
                    {formatPricingDisplay(createdProperty.pricing, createdProperty.pricing?.monthlyRent || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#86868B] font-semibold">Location</span>
                  <span className="font-semibold text-[#1D1D1F]">
                    {[createdProperty.location?.locality, createdProperty.location?.city].filter(Boolean).join(', ') || '—'}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link
                  href="/owner/dashboard/properties"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span>Go to My Properties</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsPublishedSuccess(false)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all"
                >
                  <Eye className="w-4 h-4 text-[#86868B]" />
                  <span>Review Details Again</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl text-[#86868B] hover:text-[#1D1D1F] text-xs sm:text-sm font-semibold transition-all"
                >
                  List Another Property
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm">
              <StepReview
                property={createdProperty}
                onBack={() => {
                  setCurrentStep(9);
                  if (typeof window !== 'undefined') {
                    const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=9`;
                    window.history.replaceState(null, '', newUrl);
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onEditSection={(step) => {
                  setCurrentStep(step as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10);
                  if (typeof window !== 'undefined') {
                    const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=${step}`;
                    window.history.replaceState(null, '', newUrl);
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSaveDraft={handleSaveIncompleteDraft}
                onPublish={handlePublishListing}
                isSaving={isSubmitting}
                isPublishing={isPublishing}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
