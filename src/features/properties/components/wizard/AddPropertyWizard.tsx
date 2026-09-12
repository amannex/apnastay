'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Bookmark,
  X
} from 'lucide-react';
import { normalizePropertyError, NormalizedPropertyError } from '../../errorMessages';
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
import {
  PropertyFormMode,
  WIZARD_STEPS,
  isStepApplicable
} from '../../form/formConfig';

export interface AddPropertyWizardProps {
  mode?: PropertyFormMode;
  propertyId?: string;
  initialStep?: number;
  onSaved?: (property: Property) => void;
  onExit?: () => void;
}

export default function AddPropertyWizard({
  mode = 'create',
  propertyId: propPropertyId,
  initialStep: propInitialStep,
  onSaved,
  onExit
}: AddPropertyWizardProps = {}) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>(
    (propInitialStep && propInitialStep >= 1 && propInitialStep <= 10 ? propInitialStep : 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  );
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
  const [errorState, setErrorState] = useState<NormalizedPropertyError | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const errorBannerRef = useRef<HTMLDivElement>(null);
  const [createdProperty, setCreatedProperty] = useState<Property | null>(null);

  // Phase 13: Structural change guard and unsaved changes tracking
  const [showStructuralGuard, setShowStructuralGuard] = useState<boolean>(false);
  const [pendingTypeChange, setPendingTypeChange] = useState<PropertyType | null>(null);
  const [pendingStructureChange, setPendingStructureChange] = useState<RentalStructure | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const isEditMode = mode === 'edit' || (createdProperty ? createdProperty.status !== 'draft' : false);

  const clearError = () => setErrorState(null);

  const setAppError = (errOrRes: any, fallback: string) => {
    const status = errOrRes?.status || (typeof errOrRes === 'number' ? errOrRes : null);
    const errorData = errOrRes?.error
      ? { code: errOrRes?.code, message: errOrRes?.error }
      : errOrRes?.message
      ? { message: errOrRes.message }
      : errOrRes;
    const norm = normalizePropertyError(status, errorData, fallback);
    setErrorState(norm);
  };

  // Auto-scroll to error banner whenever an error occurs
  useEffect(() => {
    if (errorState && errorBannerRef.current) {
      errorBannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errorState]);

  // --------------------------------------------------------------------------
  // Unsaved Changes Listener (beforeunload)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // --------------------------------------------------------------------------
  // Draft Restoration & Existing Property Hydration
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const draftIdFromUrl = params.get('draftId') || params.get('propertyId');
    const targetPropertyId = propPropertyId || draftIdFromUrl || (mode === 'create' ? window.sessionStorage?.getItem('apnastay_active_draft_id') : null);

    if (!targetPropertyId) return;

    setIsLoadingDraft(true);
    getProperty(targetPropertyId)
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

          // Determine step from props, URL, or intelligent progress evaluation
          const stepParam = propInitialStep || Number(params.get('step'));
          if (stepParam >= 1 && stepParam <= 10) {
            setCurrentStep(stepParam as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10);
          } else if (mode === 'review') {
            setCurrentStep(10);
          } else if (mode === 'edit' || prop.status !== 'draft') {
            setCurrentStep(3); // Start on basic details for established listings
          } else {
            const nextStep = determineNextIncompleteStep(prop);
            setCurrentStep(nextStep);
          }

          if (prop.status === 'draft') {
            setHasResumedDraft(true);
          }
        }
      })
      .catch(() => {
        // Fallback silently if draft fetch failed
      })
      .finally(() => {
        setIsLoadingDraft(false);
      });
  }, [propPropertyId, propInitialStep, mode]);

  // Update browser history and session storage whenever draft or step updates
  const syncDraftState = (prop: Property, step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10) => {
    setCreatedProperty(prop);
    setCurrentStep(step);
    setHasUnsavedChanges(false);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
    onSaved?.(prop);

    if (typeof window !== 'undefined') {
      if (prop.status === 'draft') {
        window.sessionStorage?.setItem('apnastay_active_draft_id', prop.id);
      }
      const params = new URLSearchParams(window.location.search);
      params.set('step', String(step));
      if (!window.location.pathname.includes(prop.id)) {
        params.set('draftId', prop.id);
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }
  };

  // Direct Stepper Navigation
  const handleJumpToStep = (targetStep: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10) => {
    if (!createdProperty && targetStep > 2) return;
    if (targetStep === 7 && !isStepApplicable(7, selectedType, selectedStructure)) {
      return;
    }
    setCurrentStep(targetStep);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('step', String(targetStep));
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --------------------------------------------------------------------------
  // Step 1: Type Selection with Structural Guard
  // --------------------------------------------------------------------------
  const handleSelectType = (type: PropertyType) => {
    if (units.length > 0 && selectedType && selectedType !== type) {
      setPendingTypeChange(type);
      setShowStructuralGuard(true);
      return;
    }
    setSelectedType(type);
    setHasUnsavedChanges(true);
    clearError();
    const template = getPropertyTemplate(type);
    setSelectedStructure(template.defaultRentalStructure);
  };

  const handleSelectStructure = (structure: RentalStructure) => {
    if (units.length > 0 && selectedStructure && selectedStructure !== structure) {
      setPendingStructureChange(structure);
      setShowStructuralGuard(true);
      return;
    }
    setSelectedStructure(structure);
    setHasUnsavedChanges(true);
  };

  const handleConfirmStructuralChange = () => {
    if (pendingTypeChange) {
      setSelectedType(pendingTypeChange);
      const template = getPropertyTemplate(pendingTypeChange);
      setSelectedStructure(template.defaultRentalStructure);
      setPendingTypeChange(null);
    }
    if (pendingStructureChange) {
      setSelectedStructure(pendingStructureChange);
      setPendingStructureChange(null);
    }
    setHasUnsavedChanges(true);
    setShowStructuralGuard(false);
  };

  const handleCancelStructuralChange = () => {
    setPendingTypeChange(null);
    setPendingStructureChange(null);
    setShowStructuralGuard(false);
  };

  const handleProceedToRentalStructure = () => {
    if (!selectedType) return;
    handleJumpToStep(2);
  };

  const handleBackToPropertyType = () => {
    handleJumpToStep(1);
  };

  // --------------------------------------------------------------------------
  // Step 2: Rental Structure & Draft Creation/Update
  // --------------------------------------------------------------------------
  const handleCreateOrUpdateDraft = async () => {
    if (!selectedType || !selectedStructure || isSubmitting) return;

    setIsSubmitting(true);
    clearError();

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
          setAppError(res, 'Failed to update property draft.');
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
          setAppError(res, 'Failed to create property draft. Please try again.');
        }
      }
    } catch (err: any) {
      setAppError(err, 'Network error while initializing draft.');
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
    if (!createdProperty || isSubmitting) return;

    setIsSubmitting(true);
    clearError();

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
        setAppError(res, 'Failed to save basic property details.');
      }
    } catch (err: any) {
      setAppError(err, 'Network error while saving details.');
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
    if (!createdProperty || isSubmitting) return;

    setIsSubmitting(true);
    clearError();

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
        setAppError(res, 'Failed to save property location.');
      }
    } catch (err: any) {
      setAppError(err, 'Network error while saving location.');
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
    if (!createdProperty || isSubmitting) return;

    setIsSubmitting(true);
    clearError();

    try {
      const res = await updateProperty(createdProperty.id, {
        photos: currentPhotos
      });

      if (res.success && res.data) {
        setPhotos(currentPhotos);
        syncDraftState(res.data, 6);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setAppError(res, 'Failed to save property photos.');
      }
    } catch (err: any) {
      setAppError(err, 'Network error while saving photos.');
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
    if (!createdProperty || isSubmitting) return;

    setIsSubmitting(true);
    clearError();

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
        setAppError(res, 'Failed to save property amenities.');
      }
    } catch (err: any) {
      setAppError(err, 'Network error while saving amenities.');
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
    if (!createdProperty || isSubmitting) return;

    setIsSubmitting(true);
    clearError();

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
    if (!createdProperty || isSubmitting) return;

    setIsSubmitting(true);
    clearError();

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
        setAppError(res, 'Failed to save property pricing.');
      }
    } catch (err: any) {
      setAppError(err, 'Network error while saving pricing.');
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
    if (!createdProperty || isSubmitting) return;

    setIsSubmitting(true);
    clearError();

    try {
      const res = await updatePropertyRules(createdProperty.id, rulesPayload);

      if (res.success && res.data) {
        setRules(res.data);
        const updated = { ...createdProperty, rules: res.data };
        syncDraftState(updated, 10);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setAppError(res, 'Failed to save property rules.');
      }
    } catch (err: any) {
      setAppError(err, 'Network error while saving rules.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Step 10: Review & Publishing (Phase 10)
  // --------------------------------------------------------------------------
  const handlePublishListing = async () => {
    if (!createdProperty || isPublishing) return;

    setIsPublishing(true);
    clearError();

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
        setAppError(res, 'Failed to publish listing. Please check required fields.');
      }
    } catch (err: any) {
      setAppError(err, 'Network error while publishing listing.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveAndExit = async () => {
    if (createdProperty && typeof window !== 'undefined') {
      if (createdProperty.status === 'draft') {
        window.sessionStorage?.setItem('apnastay_active_draft_id', createdProperty.id);
      }
    }
    if (onExit) {
      onExit();
    } else {
      router.push('/owner/dashboard/properties');
    }
  };

  const handleSaveIncompleteDraft = async () => {
    await handleSaveAndExit();
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
    clearError();
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
              <span className="text-[#1D1D1F] font-bold">
                {isEditMode ? `Edit: ${createdProperty?.title || 'Property'}` : 'List New Property'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1D1D1F] tracking-tight">
                {isEditMode ? 'Edit Property' : 'Add Property'}
              </h1>
              {createdProperty && (
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    createdProperty.status === 'published'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : createdProperty.status === 'draft'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : createdProperty.status === 'archived'
                      ? 'bg-slate-100 text-slate-700 border border-slate-200'
                      : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                  }`}
                >
                  {createdProperty.status === 'published' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  )}
                  <span>{createdProperty.status}</span>
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Draft saved</span>
                </span>
              )}
            </div>
          </div>

          {/* Mobile Save & Exit */}
          <button
            type="button"
            onClick={handleSaveAndExit}
            disabled={isSubmitting}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] transition-all shadow-apple-xs active:scale-[0.98] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:outline-none"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#86868B]" />
            <span>{isEditMode ? 'Exit' : 'Save & Exit'}</span>
          </button>
        </div>

        {/* PROGRESS STEPPER (10 STEPS) & DESKTOP SAVE DRAFT */}
        <div className="flex items-center gap-4 flex-wrap justify-between lg:justify-end">
          <div
            role="tablist"
            aria-label="Property listing wizard progress"
            className="flex items-center gap-1 sm:gap-1.5 flex-wrap"
          >
            {WIZARD_STEPS.map((stepDef, idx) => {
              const isCurrent = currentStep === stepDef.stepNumber;
              const isApplicable = stepDef.isApplicable(selectedType, selectedStructure);
              const isCompleted = createdProperty ? stepDef.isCompleted(createdProperty) : false;
              const canNavigate = isApplicable && (Boolean(createdProperty) || stepDef.stepNumber <= 2 || isEditMode);

              return (
                <React.Fragment key={stepDef.key}>
                  {idx > 0 && (
                    <div
                      className={`w-1.5 sm:w-2.5 md:w-3 h-[2px] transition-colors ${
                        isCompleted ? 'bg-emerald-500' : currentStep > stepDef.stepNumber ? 'bg-[#1D1D1F]' : 'bg-[#EDEDED]'
                      }`}
                    />
                  )}
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isCurrent}
                    aria-label={`${stepDef.title}: step ${stepDef.stepNumber} of 10 ${isCompleted ? '(completed)' : isCurrent ? '(current step)' : ''}`}
                    onClick={() => canNavigate && handleJumpToStep(stepDef.stepNumber)}
                    disabled={!canNavigate}
                    title={`${stepDef.title} (${isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Incomplete'})`}
                    className={`flex items-center gap-1 group transition-all text-left rounded-full focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:outline-none ${
                      !canNavigate ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-[#1D1D1F] text-white shadow-sm ring-2 ring-black/10 scale-105'
                          : isCompleted
                          ? 'bg-emerald-600 text-white group-hover:bg-emerald-700'
                          : canNavigate
                          ? 'bg-[#F5F5F7] text-[#1D1D1F] border border-[#EDEDED] group-hover:bg-[#EDEDED]'
                          : 'bg-[#EDEDED] text-[#86868B]'
                      }`}
                    >
                      {isCompleted && !isCurrent ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        stepDef.stepNumber
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-bold hidden xl:inline transition-colors ${
                        isCurrent
                          ? 'text-[#1D1D1F] underline decoration-2 underline-offset-4'
                          : isCompleted
                          ? 'text-emerald-700'
                          : canNavigate
                          ? 'text-[#86868B] group-hover:text-[#1D1D1F]'
                          : 'text-[#86868B]'
                      }`}
                    >
                      {stepDef.shortLabel}
                    </span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Desktop Save/Exit */}
          <button
            type="button"
            onClick={handleSaveAndExit}
            disabled={isSubmitting}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] transition-all shadow-apple-xs active:scale-[0.98] disabled:opacity-50 shrink-0 focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:outline-none"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#86868B]" />
            <span>{isEditMode ? 'Done & Exit' : 'Save Draft & Exit'}</span>
          </button>
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

      {/* STRUCTURAL CHANGE CONFIRMATION MODAL */}
      {showStructuralGuard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-[#EDEDED] shadow-apple-xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#1D1D1F]">
                Confirm Structural Change
              </h3>
              <p className="text-xs sm:text-sm text-[#86868B] mt-1.5 leading-relaxed">
                This property currently has <strong className="text-[#1D1D1F]">{units.length} unit(s) or room(s)</strong> configured. Changing the rental model or property format may alter unit availability and pricing hierarchy.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelStructuralChange}
                className="px-4 py-2.5 rounded-xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F] transition-all"
              >
                Keep Current Setup
              </button>
              <button
                type="button"
                onClick={handleConfirmStructuralChange}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white transition-all shadow-sm"
              >
                Proceed with Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ERROR BANNER */}
      {errorState && (
        <div
          ref={errorBannerRef}
          role="alert"
          aria-live="polite"
          className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-apple-xs animate-fade-in space-y-2"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-rose-950">{errorState.message}</p>
                {errorState.hint && (
                  <p className="text-xs text-rose-700 font-medium">{errorState.hint}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-rose-500 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-100 transition-colors shrink-0"
              aria-label="Dismiss error banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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
            onSelectStructure={handleSelectStructure}
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
          {isPublishedSuccess ? (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EDEDED] shadow-apple-sm text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEditMode ? 'Listing Updated!' : 'Listing is Live!'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
                  {isEditMode
                    ? 'Listing Updated Successfully'
                    : 'Congratulations! Your Property is Published'}
                </h2>
                <p className="text-xs sm:text-sm text-[#86868B] mt-2 leading-relaxed">
                  &ldquo;{createdProperty.title}&rdquo; changes have been saved live on ApnaStay.
                </p>
              </div>

              {/* PUBLISHED SUMMARY CARD */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] text-left space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#86868B] font-semibold">Status</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="capitalize">{createdProperty.status}</span>
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

                {!isEditMode && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl text-[#86868B] hover:text-[#1D1D1F] text-xs sm:text-sm font-semibold transition-all"
                  >
                    List Another Property
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm">
              <StepReview
                property={createdProperty}
                onBack={() => handleJumpToStep(9)}
                onEditSection={(step) => handleJumpToStep(step as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10)}
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
