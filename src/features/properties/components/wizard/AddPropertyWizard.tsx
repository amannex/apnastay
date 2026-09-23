'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  Check,
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
import StepWhoCanStay from './StepWhoCanStay';
import StepRulesStayTerms from './StepRulesStayTerms';
import StepUnits from './StepUnits';
import StepPricing from './StepPricing';
import StepRentCharges from './StepRentCharges';
import StepAvailability from './StepAvailability';
import StepRules from './StepRules';
import StepReview from './StepReview';
import PropertyIntroStep from './PropertyIntroStep';
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

  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hasExplicitDraft = params.get('draftId') || params.get('propertyId');
      if (!hasExplicitDraft && mode === 'create') {
        return 0;
      }
    }
    if (propInitialStep && propInitialStep >= 1 && propInitialStep <= 11) {
      return propInitialStep as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
    }
    if (mode === 'create') {
      return 0;
    }
    return 1;
  });
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null);
  const [customPropertyType, setCustomPropertyType] = useState<string>('');
  const [selectedStructure, setSelectedStructure] = useState<RentalStructure | null>(null);

  // Basic Details draft form state (preserved on back navigation)
  const [basicDetails, setBasicDetails] = useState<Partial<BasicDetailsFormData>>({});

  // Location draft form state (preserved on back navigation)
  const [locationData, setLocationData] = useState<Partial<LocationFormData>>({});
  const [confirmedLocationData, setConfirmedLocationData] = useState<LocationFormData | null>(null);

  // Photos & Video draft state (Parent Step 2 Substep 2)
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');

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
  const [errorState, setErrorState] = useState<NormalizedPropertyError | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const errorBannerRef = useRef<HTMLDivElement>(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState<boolean>(false);
  const [createdProperty, setCreatedProperty] = useState<Property | null>(null);
  const [showPhase2Intro, setShowPhase2Intro] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const rawStep = params.get('step');
      return rawStep === 'phase2' || rawStep === 'intro2';
    }
    return false;
  });
  const [showPhase3Intro, setShowPhase3Intro] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const rawStep = params.get('step');
      return rawStep === 'phase3' || rawStep === 'intro3';
    }
    return false;
  });

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

  // When at Step 0, ensure URL does not have stale ?step= params
  useEffect(() => {
    if (currentStep === 0 && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('step')) {
        params.delete('step');
        const query = params.toString();
        const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
        window.history.replaceState(null, '', newUrl);
      }
    }
  }, [currentStep]);

  // --------------------------------------------------------------------------
  // Draft Restoration & Existing Property Hydration
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const draftIdFromUrl = params.get('draftId') || params.get('propertyId');
    // Only target a property if explicitly passed as a prop or explicitly present in URL query
    const targetPropertyId = propPropertyId || draftIdFromUrl;

    if (!targetPropertyId) {
      try {
        const cached =
          window.sessionStorage?.getItem('apnastay_wizard_substep_draft') ||
          window.sessionStorage?.getItem('apnastay_wizard_substep1_draft');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.propertyType) {
            setSelectedType(parsed.propertyType);
          }
          if (parsed.customPropertyType) {
            setCustomPropertyType(parsed.customPropertyType);
          }
          if (parsed.rentalStructure) {
            setSelectedStructure(parsed.rentalStructure);
          }
        }
      } catch (_) {}
      return;
    }

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
            const restoredLoc: LocationFormData = {
              addressLine1: prop.location.addressLine1 || prop.location.address || '',
              address: prop.location.address || prop.location.addressLine1 || '',
              locality: prop.location.locality || '',
              city: prop.location.city || '',
              state: prop.location.state || '',
              pincode: prop.location.pincode || '',
              landmark: prop.location.landmark || '',
              latitude: prop.location.latitude ?? prop.location.coordinates?.latitude,
              longitude: prop.location.longitude ?? prop.location.coordinates?.longitude,
              coordinates: prop.location.coordinates,
              publicLocation:
                prop.location.publicLocation ||
                [prop.location.locality, prop.location.city].filter(Boolean).join(', '),
              hideExactAddress: prop.location.hideExactAddress ?? true
            };
            setLocationData(restoredLoc);
            if (restoredLoc.addressLine1 && restoredLoc.city && restoredLoc.state) {
              setConfirmedLocationData(restoredLoc);
            }
          }

          // Restore photos and video draft fields
          if (prop.photos && prop.photos.length > 0) {
            setPhotos(prop.photos);
          }
          if (prop.videoUrl) {
            setVideoUrl(prop.videoUrl);
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

          // If in fresh creation mode without an explicit step param, keep intro Step 0 active
          if (mode === 'create' && !draftIdFromUrl && !propInitialStep) {
            return;
          }

          // Check for Phase 2 or Phase 3 intro in URL query
          const rawStep = params.get('step');
          if (rawStep === 'phase2' || rawStep === 'intro2') {
            setShowPhase2Intro(true);
            setCurrentStep(5);
            return;
          }
          if (rawStep === 'phase3' || rawStep === 'intro3') {
            setShowPhase3Intro(true);
            setCurrentStep(7);
            return;
          }

          // Determine step from props, URL, or intelligent progress evaluation
          const stepParam = propInitialStep || Number(params.get('step'));
          if (stepParam >= 1 && stepParam <= 11) {
            setCurrentStep(stepParam as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11);
          } else if (mode === 'review') {
            setCurrentStep(11);
          } else if (mode === 'edit' || prop.status !== 'draft') {
            setCurrentStep(3); // Start on basic details for established listings
          } else {
            const nextStep = determineNextIncompleteStep(prop);
            setCurrentStep(nextStep);
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
  const syncDraftState = (prop: Property, step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11) => {
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
  const handleJumpToStep = (targetStep: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11) => {
    if (!createdProperty && targetStep > 2) return;
    setShowPhase2Intro(false);
    setShowPhase3Intro(false);
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
    const typeChanged = selectedType !== type;
    setSelectedType(type);
    setHasUnsavedChanges(true);
    clearError();
    if (typeChanged || !selectedStructure) {
      const template = getPropertyTemplate(type);
      setSelectedStructure(template.defaultRentalStructure);
    }
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
  // Step 3: Location Back & Save Handlers
  // --------------------------------------------------------------------------
  const handleBackFromLocation = (currentValues: LocationFormData) => {
    setLocationData(currentValues);
    setCurrentStep(2);
    if (createdProperty && typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=2`;
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
          address: data.address || data.addressLine1,
          locality: data.locality,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          landmark: data.landmark,
          latitude: data.latitude,
          longitude: data.longitude,
          coordinates: data.coordinates || (data.latitude && data.longitude ? { latitude: data.latitude, longitude: data.longitude } : undefined),
          hideExactAddress: data.hideExactAddress ?? true,
          publicLocation: data.publicLocation || [data.locality, data.city].filter(Boolean).join(', ')
        }
      });

      if (res.success && res.data) {
        setLocationData(data);
        setConfirmedLocationData(data);
        syncDraftState(res.data, 4);
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
  // Step 4: Basic Details Back & Save Handlers
  // --------------------------------------------------------------------------
  const handleBackFromBasicDetails = (currentValues: BasicDetailsFormData) => {
    setBasicDetails(currentValues);
    setCurrentStep(3);
    if (createdProperty && typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=3`;
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
        bedrooms: data.bedrooms,
        beds: data.beds,
        bathrooms: data.bathrooms,
        hasLock: data.hasLock,
        title: createdProperty.title || data.title,
        description: createdProperty.description || data.description,
        availability: createdProperty.availability || data.availability,
        pricing: {
          ...createdProperty.pricing,
          monthlyRent: createdProperty.pricing?.monthlyRent || data.monthlyRent || 15000
        }
      });

      if (res.success && res.data) {
        setBasicDetails(data);
        setCreatedProperty(res.data);
        setCurrentStep(5);
        setShowPhase2Intro(true);
        if (typeof window !== 'undefined') {
          const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(res.data.id)}&step=phase2`;
          window.history.replaceState(null, '', newUrl);
        }
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
  // Step 5: Amenities Back & Save Handlers (Parent Step 2 Substep 1)
  // --------------------------------------------------------------------------
  const handleBackFromAmenities = (currentAmenities: string[], currentCustom: string[]) => {
    setAmenities(currentAmenities);
    setCustomAmenities(currentCustom);
    setShowPhase2Intro(true);
    if (createdProperty && typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=phase2`;
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
        syncDraftState(res.data, 6);
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
  // Step 6: Photos & Video Handlers (Parent Step 2 Substep 2)
  // --------------------------------------------------------------------------
  const handleBackFromPhotos = (currentPhotos: PropertyPhoto[], currentVideoUrl?: string) => {
    setPhotos(currentPhotos);
    if (currentVideoUrl !== undefined) {
      setVideoUrl(currentVideoUrl);
    }
    handleJumpToStep(5);
  };

  const handleSavePhotos = async (currentPhotos: PropertyPhoto[], currentVideoUrl?: string) => {
    if (!createdProperty || isSubmitting) return;

    setIsSubmitting(true);
    clearError();

    try {
      const res = await updateProperty(createdProperty.id, {
        photos: currentPhotos,
        videoUrl: currentVideoUrl || ''
      });

      if (res.success && res.data) {
        setPhotos(currentPhotos);
        if (currentVideoUrl !== undefined) {
          setVideoUrl(currentVideoUrl);
        }
        syncDraftState(res.data, 7);
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
  // Step 7: Who Can Stay Here Handlers (Parent Step 2 Substep 3)
  // --------------------------------------------------------------------------
  const handleBackFromWhoCanStay = () => {
    handleJumpToStep(6);
  };

  const handleSaveWhoCanStay = async (rulesPayload: PropertyRules) => {
    if (!createdProperty || isSubmitting) return;

    setIsSubmitting(true);
    clearError();

    try {
      const mergedRules: PropertyRules = {
        ...(createdProperty.rules || {}),
        ...rulesPayload
      };
      const res = await updatePropertyRules(createdProperty.id, mergedRules);

      if (res.success && res.data) {
        setRules(res.data);
        const updated = { ...createdProperty, rules: res.data };
        syncDraftState(updated, 8);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setAppError(res, 'Failed to save resident preferences.');
      }
    } catch (err: any) {
      setAppError(err, 'Network error while saving resident preferences.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Step 8: Rules & Stay Terms Handlers (Parent Step 2 Substep 4)
  // --------------------------------------------------------------------------
  const handleBackFromRulesStayTerms = () => {
    handleJumpToStep(7);
  };

  const handleSaveRulesStayTerms = async (rulesPayload: PropertyRules) => {
    if (!createdProperty || isSubmitting) return;

    setIsSubmitting(true);
    clearError();

    try {
      const mergedRules: PropertyRules = {
        ...(createdProperty.rules || {}),
        ...rulesPayload
      };
      const res = await updatePropertyRules(createdProperty.id, mergedRules);

      if (res.success && res.data) {
        setRules(res.data);
        const updated = { ...createdProperty, rules: res.data };
        syncDraftState(updated, 9);
        setShowPhase3Intro(true);
        if (typeof window !== 'undefined') {
          const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(updated.id)}&step=phase3`;
          window.history.replaceState(null, '', newUrl);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setAppError(res, 'Failed to save property rules & stay terms.');
      }
    } catch (err: any) {
      setAppError(err, 'Network error while saving property rules & stay terms.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Optional Units & Rooms Back & Save Handlers
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
        setShowPhase3Intro(true);
        if (typeof window !== 'undefined') {
          const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(res.data.id)}&step=phase3`;
          window.history.replaceState(null, '', newUrl);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Safe local state fallback so wizard never halts
        setUnits(currentUnits);
        syncDraftState({ ...createdProperty, units: currentUnits }, 8);
        setShowPhase3Intro(true);
        if (typeof window !== 'undefined') {
          const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=phase3`;
          window.history.replaceState(null, '', newUrl);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      // Safe fallback
      setUnits(currentUnits);
      syncDraftState({ ...createdProperty, units: currentUnits }, 8);
      setShowPhase3Intro(true);
      if (typeof window !== 'undefined') {
        const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=phase3`;
        window.history.replaceState(null, '', newUrl);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipUnits = async () => {
    if (!createdProperty) return;
    // Simply advance to pricing without requiring units
    syncDraftState(createdProperty, 8);
    setShowPhase3Intro(true);
    if (typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=phase3`;
      window.history.replaceState(null, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --------------------------------------------------------------------------
  // Step 8: Pricing & Availability Back & Save Handlers (Phase 8)
  // --------------------------------------------------------------------------
  const handleBackFromPricing = () => {
    setShowPhase3Intro(true);
    if (createdProperty && typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=phase3`;
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
        syncDraftState(res.data, 10);
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
  // Step 10: Availability Back & Save Handlers (Parent Step 3 Substep 2)
  // --------------------------------------------------------------------------
  const handleBackFromAvailability = () => {
    handleJumpToStep(9);
  };

  const handleSaveAvailability = async (data: {
    availability: PropertyAvailability;
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

      const res = await updateProperty(createdProperty.id, {
        availability: data.availability
      });

      if (res.success && res.data) {
        syncDraftState(res.data, 11);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setAppError(res, 'Failed to save property availability.');
      }
    } catch (err: any) {
      setAppError(err, 'Network error while saving availability.');
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
    if (typeof window !== 'undefined') {
      if (createdProperty && createdProperty.status === 'draft') {
        window.sessionStorage?.setItem('apnastay_active_draft_id', createdProperty.id);
      } else if (selectedType || selectedStructure) {
        window.sessionStorage?.setItem(
          'apnastay_wizard_substep_draft',
          JSON.stringify({
            propertyType: selectedType,
            customPropertyType,
            rentalStructure: selectedStructure
          })
        );
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
      window.sessionStorage?.removeItem('apnastay_wizard_substep_draft');
      window.sessionStorage?.removeItem('apnastay_wizard_substep1_draft');
      window.history.replaceState(null, '', window.location.pathname);
    }
    setCurrentStep(1);
    setSelectedType(null);
    setCustomPropertyType('');
    setSelectedStructure(null);
    setBasicDetails({});
    setLocationData({});
    setPhotos([]);
    setVideoUrl('');
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
      case 'shared_room':
        return 'Shared Room';
      case 'individual_bed':
        return 'Individual Bed / Bed Space';
      case 'multiple_units':
        return 'Multiple Rooms / Units';
      default:
        return '';
    }
  };

  const handleGlobalBack = () => {
    if (currentStep === 1) {
      setCurrentStep(0);
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        params.delete('step');
        const query = params.toString();
        const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
        window.history.replaceState(null, '', newUrl);
      }
    } else if (currentStep === 2) {
      handleJumpToStep(1);
    } else if (currentStep === 3) {
      handleJumpToStep(2);
    } else if (currentStep === 4) {
      handleJumpToStep(3);
    } else if (currentStep === 5) {
      setShowPhase2Intro(true);
      if (createdProperty && typeof window !== 'undefined') {
        const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=phase2`;
        window.history.replaceState(null, '', newUrl);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 6) {
      handleJumpToStep(5);
    } else if (currentStep === 7) {
      handleJumpToStep(6);
    } else if (currentStep === 8) {
      handleJumpToStep(7);
    } else if (currentStep === 9) {
      setShowPhase3Intro(true);
      if (createdProperty && typeof window !== 'undefined') {
        const newUrl = `${window.location.pathname}?draftId=${encodeURIComponent(createdProperty.id)}&step=phase3`;
        window.history.replaceState(null, '', newUrl);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 10) {
      handleJumpToStep(9);
    } else if (currentStep === 11) {
      handleJumpToStep(10);
    }
  };

  const renderFooterNextButton = () => {
    if (currentStep === 1) {
      const canProceed =
        selectedType !== null &&
        (selectedType !== 'other' || customPropertyType.trim().length > 0);
      return (
        <button
          type="button"
          onClick={handleProceedToRentalStructure}
          disabled={!canProceed}
          className={`min-w-[120px] sm:min-w-[140px] py-3.5 px-7 sm:px-8 rounded-xl text-sm sm:text-base font-semibold inline-flex items-center justify-center transition-all active:scale-[0.98] shadow-apple-sm lg:translate-x-[10px] ${
            canProceed
              ? 'bg-[#222222] hover:bg-black text-white cursor-pointer'
              : 'bg-[#EBEBEB] text-[#717171] cursor-not-allowed opacity-60'
          }`}
        >
          <span>Next</span>
        </button>
      );
    }

    if (currentStep === 2) {
      const canProceed = selectedStructure !== null && !isSubmitting;
      return (
        <button
          type="button"
          onClick={handleCreateOrUpdateDraft}
          disabled={!canProceed}
          className={`min-w-[120px] sm:min-w-[140px] py-3.5 px-7 sm:px-8 rounded-xl text-sm sm:text-base font-semibold inline-flex items-center justify-center transition-all active:scale-[0.98] shadow-apple-sm lg:translate-x-[10px] ${
            canProceed
              ? 'bg-[#222222] hover:bg-black text-white cursor-pointer'
              : 'bg-[#EBEBEB] text-[#717171] cursor-not-allowed opacity-60'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </span>
          ) : (
            <span>Next</span>
          )}
        </button>
      );
    }

    if (currentStep === 3) {
      return (
        <button
          type="submit"
          form="location-form"
          disabled={isSubmitting}
          className={`min-w-[120px] sm:min-w-[140px] py-3.5 px-7 sm:px-8 rounded-xl text-sm sm:text-base font-semibold inline-flex items-center justify-center transition-all active:scale-[0.98] shadow-apple-sm lg:translate-x-[10px] ${
            isSubmitting
              ? 'bg-[#EBEBEB] text-[#717171] cursor-not-allowed'
              : 'bg-[#222222] hover:bg-black text-white cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </span>
          ) : (
            <span>Next</span>
          )}
        </button>
      );
    }

    if (currentStep === 4) {
      return (
        <button
          type="submit"
          form="basic-details-form"
          disabled={isSubmitting}
          className={`min-w-[120px] sm:min-w-[140px] py-3.5 px-7 sm:px-8 rounded-xl text-sm sm:text-base font-semibold inline-flex items-center justify-center transition-all active:scale-[0.98] shadow-apple-sm lg:translate-x-[10px] ${
            isSubmitting
              ? 'bg-[#EBEBEB] text-[#717171] cursor-not-allowed'
              : 'bg-[#222222] hover:bg-black text-white cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </span>
          ) : (
            <span>Next</span>
          )}
        </button>
      );
    }

    if (currentStep === 5) {
      return (
        <button
          type="submit"
          form="amenities-form"
          disabled={isSubmitting}
          className={`min-w-[120px] sm:min-w-[140px] py-3.5 px-7 sm:px-8 rounded-xl text-sm sm:text-base font-semibold inline-flex items-center justify-center transition-all active:scale-[0.98] shadow-apple-sm lg:translate-x-[10px] ${
            isSubmitting
              ? 'bg-[#EBEBEB] text-[#717171] cursor-not-allowed'
              : 'bg-[#222222] hover:bg-black text-white cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </span>
          ) : (
            <span>Next</span>
          )}
        </button>
      );
    }

    if (currentStep === 6) {
      return (
        <button
          type="submit"
          form="photos-form"
          disabled={isSubmitting}
          className={`min-w-[120px] sm:min-w-[140px] py-3.5 px-7 sm:px-8 rounded-xl text-sm sm:text-base font-semibold inline-flex items-center justify-center transition-all active:scale-[0.98] shadow-apple-sm lg:translate-x-[10px] ${
            isSubmitting
              ? 'bg-[#EBEBEB] text-[#717171] cursor-not-allowed'
              : 'bg-[#222222] hover:bg-black text-white cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </span>
          ) : (
            <span>Next</span>
          )}
        </button>
      );
    }

    if (currentStep === 7) {
      return (
        <button
          type="submit"
          form="who-can-stay-form"
          disabled={isSubmitting}
          className={`min-w-[120px] sm:min-w-[140px] py-3.5 px-7 sm:px-8 rounded-xl text-sm sm:text-base font-semibold inline-flex items-center justify-center transition-all active:scale-[0.98] shadow-apple-sm lg:translate-x-[10px] ${
            isSubmitting
              ? 'bg-[#EBEBEB] text-[#717171] cursor-not-allowed'
              : 'bg-[#222222] hover:bg-black text-white cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </span>
          ) : (
            <span>Next</span>
          )}
        </button>
      );
    }

    if (currentStep === 8) {
      return (
        <button
          type="submit"
          form="rules-terms-form"
          disabled={isSubmitting}
          className={`min-w-[120px] sm:min-w-[140px] py-3.5 px-7 sm:px-8 rounded-xl text-sm sm:text-base font-semibold inline-flex items-center justify-center transition-all active:scale-[0.98] shadow-apple-sm lg:translate-x-[10px] ${
            isSubmitting
              ? 'bg-[#EBEBEB] text-[#717171] cursor-not-allowed'
              : 'bg-[#222222] hover:bg-black text-white cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </span>
          ) : (
            <span>Next</span>
          )}
        </button>
      );
    }

    if (currentStep === 9) {
      return (
        <button
          type="submit"
          form="rent-charges-form"
          disabled={isSubmitting}
          className={`min-w-[120px] sm:min-w-[140px] py-3.5 px-7 sm:px-8 rounded-xl text-sm sm:text-base font-semibold inline-flex items-center justify-center transition-all active:scale-[0.98] shadow-apple-sm lg:translate-x-[10px] ${
            isSubmitting
              ? 'bg-[#EBEBEB] text-[#717171] cursor-not-allowed'
              : 'bg-[#222222] hover:bg-black text-white cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </span>
          ) : (
            <span>Next</span>
          )}
        </button>
      );
    }

    if (currentStep === 10) {
      return (
        <button
          type="submit"
          form="availability-form"
          disabled={isSubmitting}
          className={`min-w-[120px] sm:min-w-[140px] py-3.5 px-7 sm:px-8 rounded-xl text-sm sm:text-base font-semibold inline-flex items-center justify-center transition-all active:scale-[0.98] shadow-apple-sm lg:translate-x-[10px] ${
            isSubmitting
              ? 'bg-[#EBEBEB] text-[#717171] cursor-not-allowed'
              : 'bg-[#222222] hover:bg-black text-white cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </span>
          ) : (
            <span>Next</span>
          )}
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => {
          if (currentStep < 11) {
            handleJumpToStep((currentStep + 1) as any);
          }
        }}
        disabled={isSubmitting}
        className="min-w-[120px] sm:min-w-[140px] py-3.5 px-7 sm:px-8 rounded-xl text-sm sm:text-base font-semibold inline-flex items-center justify-center transition-all active:scale-[0.98] shadow-apple-sm lg:translate-x-[10px] bg-[#222222] hover:bg-black text-white cursor-pointer"
      >
        <span>{currentStep === 11 ? 'Publish' : 'Next'}</span>
      </button>
    );
  };

  if (currentStep === 0) {
    return (
      <PropertyIntroStep
        phase={1}
        onStart={() => {
          setCurrentStep(1);
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            params.set('step', '1');
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            window.history.replaceState(null, '', newUrl);
          }
        }}
        onExit={handleSaveAndExit}
      />
    );
  }

  if (showPhase2Intro) {
    return (
      <PropertyIntroStep
        phase={2}
        onStart={() => {
          setShowPhase2Intro(false);
          handleJumpToStep(5);
        }}
        onBack={() => {
          setShowPhase2Intro(false);
          handleJumpToStep(4);
        }}
        onExit={handleSaveAndExit}
      />
    );
  }

  if (showPhase3Intro) {
    return (
      <PropertyIntroStep
        phase={3}
        onStart={() => {
          setShowPhase3Intro(false);
          handleJumpToStep(9);
        }}
        onBack={() => {
          setShowPhase3Intro(false);
          handleJumpToStep(8);
        }}
        onExit={handleSaveAndExit}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between overflow-y-auto min-h-screen text-[#1D1D1F]">
      {/* ==================================================================== */}
      {/* 1. CLEAN TOP HEADER (Airbnb Style)                                  */}
      {/* ==================================================================== */}
      <header className="px-5 sm:px-12 py-4 sm:py-6 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-30 transition-all">
        {/* Mobile: Back icon + Logo */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={handleGlobalBack}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-[#F5F5F7] text-[#1D1D1F] transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img
            src="/logo-icon.png"
            alt="ApnaStay"
            className="h-7 w-auto object-contain"
          />
        </div>

        {/* Desktop: Logo on left */}
        <Link
          href="/owner/dashboard/properties"
          className="hidden sm:flex items-center gap-2.5 group transition-transform"
          title="ApnaStay Dashboard"
        >
          <img
            src="/logo-icon.png"
            alt="ApnaStay Logo"
            className="h-8 sm:h-9 w-auto group-hover:scale-105 transition-transform object-contain"
          />
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#1D1D1F]">
            ApnaStay<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Right: Questions? and Save & exit buttons */}
        <div className="flex items-center gap-2 sm:gap-3">

          <button
            type="button"
            onClick={() => setShowQuestionsModal(true)}
            className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full border border-[#E5E5EA] hover:border-[#D1D1D6] hover:bg-[#F8F8FA] text-xs sm:text-sm font-semibold text-[#1D1D1F] transition-all active:scale-[0.98] whitespace-nowrap inline-flex items-center justify-center shrink-0 shadow-apple-xs"
          >
            <span>Questions?</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndExit}
            disabled={isSubmitting}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-[#E5E5EA] hover:border-[#D1D1D6] hover:bg-[#F8F8FA] text-xs sm:text-sm font-semibold text-[#1D1D1F] transition-all active:scale-[0.98] whitespace-nowrap inline-flex items-center justify-center shrink-0 shadow-apple-xs disabled:opacity-50"
          >
            <span>Save & exit</span>
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. MAIN CONTENT WRAPPER                                              */}
      {/* ==================================================================== */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-5 sm:px-8 py-6 sm:py-10 flex flex-col justify-center">

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
        <div className="w-full">
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
        <div className="w-full">
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

      {/* STEP 3: LOCATION */}
      {currentStep === 3 && selectedType && selectedStructure && !isLoadingDraft && (
        <div className="w-full">
          <StepLocation
            propertyType={selectedType}
            customPropertyType={customPropertyType}
            rentalStructure={selectedStructure}
            initialValues={{
              addressLine1: locationData.addressLine1 ?? createdProperty?.location?.addressLine1,
              address: locationData.address ?? createdProperty?.location?.address,
              locality: locationData.locality ?? createdProperty?.location?.locality,
              city: locationData.city ?? createdProperty?.location?.city,
              state: locationData.state ?? createdProperty?.location?.state,
              pincode: locationData.pincode ?? createdProperty?.location?.pincode,
              landmark: locationData.landmark ?? createdProperty?.location?.landmark,
              latitude: locationData.latitude ?? createdProperty?.location?.latitude,
              longitude: locationData.longitude ?? createdProperty?.location?.longitude,
              coordinates: locationData.coordinates ?? createdProperty?.location?.coordinates,
              publicLocation: locationData.publicLocation ?? createdProperty?.location?.publicLocation,
              hideExactAddress:
                locationData.hideExactAddress ?? createdProperty?.location?.hideExactAddress
            }}
            onBack={handleBackFromLocation}
            lastConfirmedLocation={confirmedLocationData}
            onLocationConfirmed={(data) => setConfirmedLocationData(data)}
            onSave={handleSaveLocation}
            isSaving={isSubmitting}
          />
        </div>
      )}

      {/* STEP 4: BASIC DETAILS */}
      {currentStep === 4 && selectedType && selectedStructure && !isLoadingDraft && (
        <div className="w-full">
          <StepBasicDetails
            propertyType={selectedType}
            customPropertyType={customPropertyType}
            rentalStructure={selectedStructure}
            initialValues={{
              title: basicDetails.title ?? createdProperty?.title,
              description: basicDetails.description ?? createdProperty?.description,
              availability: basicDetails.availability ?? createdProperty?.availability,
              monthlyRent: basicDetails.monthlyRent ?? createdProperty?.pricing?.monthlyRent,
              guests: basicDetails.guests,
              bedrooms: basicDetails.bedrooms,
              beds: basicDetails.beds,
              bathrooms: basicDetails.bathrooms,
              hasLock: basicDetails.hasLock
            }}
            onBack={handleBackFromBasicDetails}
            onSave={handleSaveBasicDetails}
            isSaving={isSubmitting}
          />
        </div>
      )}

      {/* STEP 5: AMENITIES & FEATURES (PHASE 2 SUBSTEP 1) */}
      {currentStep === 5 && createdProperty && !isLoadingDraft && (
        <div className="w-full">
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

      {/* STEP 6: PHOTOS & OPTIONAL VIDEO (PARENT STEP 2 SUBSTEP 2) */}
      {currentStep === 6 && createdProperty && !isLoadingDraft && (
        <div className="w-full">
          <StepPhotos
            propertyId={createdProperty.id}
            initialPhotos={photos.length > 0 ? photos : createdProperty.photos || []}
            initialVideoUrl={videoUrl || createdProperty.videoUrl || ''}
            onBack={handleBackFromPhotos}
            onSave={handleSavePhotos}
            isSaving={isSubmitting}
          />
        </div>
      )}

      {/* STEP 7: WHO CAN STAY HERE (PARENT STEP 2 SUBSTEP 3) */}
      {currentStep === 7 && createdProperty && !isLoadingDraft && (
        <div className="w-full">
          <StepWhoCanStay
            propertyId={createdProperty.id}
            initialRules={createdProperty.rules || rules}
            onBack={handleBackFromWhoCanStay}
            onSave={handleSaveWhoCanStay}
            isSaving={isSubmitting}
          />
        </div>
      )}

      {/* STEP 8: RULES & STAY TERMS (PARENT STEP 2 SUBSTEP 4) */}
      {currentStep === 8 && createdProperty && !isLoadingDraft && (
        <div className="w-full">
          <StepRulesStayTerms
            propertyId={createdProperty.id}
            initialRules={createdProperty.rules || rules}
            onBack={handleBackFromRulesStayTerms}
            onSave={handleSaveRulesStayTerms}
            isSaving={isSubmitting}
          />
        </div>
      )}

      {/* STEP 9: RENT & CHARGES (PARENT STEP 3 SUBSTEP 1) */}
      {currentStep === 9 && createdProperty && !isLoadingDraft && (
        <div className="w-full">
          <StepRentCharges
            property={createdProperty}
            onBack={handleBackFromPricing}
            onSave={handleSavePricing}
            isSaving={isSubmitting}
          />
        </div>
      )}

      {/* STEP 10: AVAILABILITY (PARENT STEP 3 SUBSTEP 2) */}
      {currentStep === 10 && createdProperty && !isLoadingDraft && (
        <div className="w-full">
          <StepAvailability
            property={createdProperty}
            onBack={handleBackFromAvailability}
            onSave={handleSaveAvailability}
            isSaving={isSubmitting}
          />
        </div>
      )}

      {/* STEP 11: LISTING REVIEW & PUBLISHING (PARENT STEP 3 SUBSTEP 3) */}
      {currentStep === 11 && createdProperty && !isLoadingDraft && (
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
                onBack={() => handleJumpToStep(10)}
                onEditSection={(step) => handleJumpToStep(step as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11)}
                onSaveDraft={handleSaveIncompleteDraft}
                onPublish={handlePublishListing}
                isSaving={isSubmitting}
                isPublishing={isPublishing}
              />
            </div>
          )}
        </>
      )}
      </main>

      {/* ==================================================================== */}
      {/* 3. STICKY BOTTOM NAVIGATION BAR WITH 3-PHASE PROGRESS                */}
      {/* ==================================================================== */}
      <footer className="sticky bottom-0 bg-white z-50 shadow-lg border-t border-[#EDEDED]">
        {/* SEGMENTED PROGRESS TRACK (3 distinct portions with rounded ends) */}
        <div className="w-full grid grid-cols-3 gap-1 h-[4px] sm:h-[5px] bg-white">
          {/* Phase 1: Steps 1-4 (Parent Step 1: Tell us about your property - 4 substeps) */}
          <div className="h-full bg-[#E5E5EA] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#222222] rounded-full transition-all duration-500"
              style={{
                width: `${
                  currentStep >= 5
                    ? 100
                    : currentStep === 4
                    ? 100
                    : currentStep === 3
                    ? 75
                    : currentStep === 2
                    ? 50
                    : currentStep === 1
                    ? 25
                    : 0
                }%`,
              }}
            />
          </div>

          {/* Phase 2: Steps 5-8 (Parent Step 2: Make your place stand out - 4 substeps) */}
          <div className="h-full bg-[#E5E5EA] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#222222] rounded-full transition-all duration-500"
              style={{
                width: `${
                  currentStep >= 9
                    ? 100
                    : currentStep === 8
                    ? 100
                    : currentStep === 7
                    ? 75
                    : currentStep === 6
                    ? 50
                    : currentStep === 5
                    ? 25
                    : 0
                }%`,
              }}
            />
          </div>

          {/* Phase 3: Steps 9-11 (Parent Step 3: Finish up and publish - 3 substeps) */}
          <div className="h-full bg-[#E5E5EA] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#222222] rounded-full transition-all duration-500"
              style={{
                width: `${
                  currentStep >= 11
                    ? 100
                    : currentStep === 10
                    ? 66
                    : currentStep === 9
                    ? 33
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* BOTTOM NAV BAR */}
        <div className="max-w-7xl mx-auto px-5 sm:px-12 py-3.5 sm:py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleGlobalBack}
            className="text-sm sm:text-base font-semibold text-[#222222] underline underline-offset-4 hover:text-black transition-colors"
          >
            Back
          </button>

          {renderFooterNextButton()}
        </div>
      </footer>

      {/* QUESTIONS HELPER MODAL */}
      {showQuestionsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EDEDED] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1D1D1F]">Need Help Getting Started?</h3>
              <button
                type="button"
                onClick={() => setShowQuestionsModal(false)}
                className="text-[#86868B] hover:text-[#1D1D1F] text-xs font-bold px-2 py-1 rounded-lg hover:bg-[#F5F5F7]"
              >
                Close
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed">
              If you have questions about listing your property, pricing structures, or guest capacities, our host success team is here 24/7 to help.
            </p>
            <div className="pt-2 border-t border-[#EDEDED] flex justify-end">
              <button
                type="button"
                onClick={() => setShowQuestionsModal(false)}
                className="px-4 py-2 rounded-xl bg-[#1D1D1F] text-white text-xs font-semibold hover:bg-black transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
