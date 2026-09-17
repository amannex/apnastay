'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  IndianRupee,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  HelpCircle
} from 'lucide-react';
import type {
  PropertyType,
  RentalStructure,
  PropertyAvailability,
  PropertyAvailabilityType
} from '../../types';
import { getBasicFieldsConfig, getPropertyTemplate } from '../../templates';

export interface BasicDetailsFormData {
  title: string;
  description: string;
  availability: PropertyAvailability;
  monthlyRent: number;
  guests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  hasLock?: boolean;
}

interface StepBasicDetailsProps {
  propertyType: PropertyType;
  customPropertyType?: string;
  rentalStructure: RentalStructure;
  initialValues?: Partial<BasicDetailsFormData>;
  subStep?: 'basics' | 'title_description';
  onSubStepChange?: (subStep: 'basics' | 'title_description') => void;
  onBack: (currentValues: BasicDetailsFormData) => void;
  onSave: (data: BasicDetailsFormData) => Promise<void> | void;
  isSaving?: boolean;
}

export default function StepBasicDetails({
  propertyType,
  customPropertyType,
  rentalStructure,
  initialValues,
  subStep: controlledSubStep,
  onSubStepChange,
  onBack,
  onSave,
  isSaving = false
}: StepBasicDetailsProps) {
  const config = getBasicFieldsConfig(propertyType, rentalStructure, customPropertyType);
  const template = getPropertyTemplate(propertyType);

  // Today's date string YYYY-MM-DD for min date in picker
  const todayStr = new Date().toISOString().split('T')[0];

  // Internal substep state if not controlled by parent
  const [internalSubStep, setInternalSubStep] = useState<'basics' | 'title_description'>('basics');
  const activeSubStep = controlledSubStep ?? internalSubStep;

  // Capacity state
  const [guests, setGuests] = useState<number>(initialValues?.guests ?? 2);
  const [bedrooms, setBedrooms] = useState<number>(initialValues?.bedrooms ?? 1);
  const [beds, setBeds] = useState<number>(initialValues?.beds ?? 1);
  const [bathrooms, setBathrooms] = useState<number>(initialValues?.bathrooms ?? 1);
  const [hasLock, setHasLock] = useState<boolean>(initialValues?.hasLock ?? true);

  // Form State
  const [title, setTitle] = useState<string>(initialValues?.title || '');
  const [description, setDescription] = useState<string>(initialValues?.description || '');
  const [availType, setAvailType] = useState<PropertyAvailabilityType>(
    initialValues?.availability?.type || 'immediate'
  );
  const [availDate, setAvailDate] = useState<string>(
    initialValues?.availability?.availableFrom || todayStr
  );
  const [monthlyRent, setMonthlyRent] = useState<string>(
    initialValues?.monthlyRent && initialValues.monthlyRent > 0
      ? String(initialValues.monthlyRent)
      : '15000'
  );

  // Validation errors
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const initializedRef = React.useRef(false);

  // Sync state if initialValues change upon asynchronous draft load
  useEffect(() => {
    if (!initializedRef.current && initialValues) {
      if (initialValues.title) setTitle(initialValues.title);
      if (initialValues.description) setDescription(initialValues.description);
      if (initialValues.availability?.type) setAvailType(initialValues.availability.type);
      if (initialValues.availability?.availableFrom) setAvailDate(initialValues.availability.availableFrom);
      if (initialValues.monthlyRent && initialValues.monthlyRent > 0) {
        setMonthlyRent(String(initialValues.monthlyRent));
      }
      if (initialValues.guests) setGuests(initialValues.guests);
      if (initialValues.bedrooms) setBedrooms(initialValues.bedrooms);
      if (initialValues.beds) setBeds(initialValues.beds);
      if (initialValues.bathrooms) setBathrooms(initialValues.bathrooms);
      if (typeof initialValues.hasLock === 'boolean') setHasLock(initialValues.hasLock);

      if (initialValues.title || initialValues.description || initialValues.monthlyRent) {
        initializedRef.current = true;
      }
    }
  }, [initialValues]);

  const getCurrentFormData = (): BasicDetailsFormData => {
    const parsedRent = Number(monthlyRent.replace(/[^0-9.]/g, '')) || 15000;
    return {
      title: title.trim(),
      description: description.trim(),
      availability: {
        type: availType,
        availableFrom: availType === 'specific_date' ? availDate : undefined
      },
      monthlyRent: parsedRent > 0 ? parsedRent : 15000,
      guests,
      bedrooms,
      beds,
      bathrooms,
      hasLock
    };
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (!trimmedTitle) {
      newErrors.title = 'Please enter a property name or title.';
    } else if (trimmedTitle.length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    }

    if (!trimmedDesc) {
      newErrors.description = 'Please provide a short description for tenants.';
    } else if (trimmedDesc.length < 10) {
      newErrors.description = 'Please write at least 10 characters describing your property.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSubStep === 'basics') {
      if (onSubStepChange) {
        onSubStepChange('title_description');
      } else {
        setInternalSubStep('title_description');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (validate()) {
        onSave(getCurrentFormData());
      }
    }
  };

  const handleBackClick = () => {
    onBack(getCurrentFormData());
  };

  const getShortPropertyType = () => {
    switch (propertyType) {
      case 'apartment':
        return 'flat';
      case 'house':
        return 'house';
      case 'villa':
        return 'villa';
      case 'pg':
        return 'PG';
      case 'hostel':
        return 'hostel';
      case 'independent_floor':
        return 'floor';
      case 'room':
        return 'room';
      case 'building':
        return 'building';
      case 'commercial':
        return 'space';
      default:
        return 'place';
    }
  };

  return (
    <form id="basic-details-form" onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto animate-fade-in py-2 space-y-8" noValidate>
      {activeSubStep === 'basics' ? (
        <>
          {/* SECTION HEADING (Matching Airbnb basics step) */}
          <div>
            <h1 className="font-outfit text-2xl sm:text-[30px] font-semibold text-[#222222] tracking-tight">
              Let&apos;s start with the basics
            </h1>
          </div>

          {/* CAPACITY & ROOMS COUNTERS */}
          <div>
            <h2 className="font-inter text-base sm:text-lg font-medium text-[#222222] mb-2">
              How many people can stay here?
            </h2>

            <div className="space-y-0 font-inter">
              {/* Guests */}
              <div className="flex items-center justify-between py-4 border-b border-[#EBEBEB]">
                <span className="text-base text-[#222222] font-normal">Guests</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    disabled={guests <= 1}
                    className="w-8 h-8 rounded-full border border-[#B0B0B0] flex items-center justify-center text-lg text-[#717171] hover:border-[#222222] hover:text-[#222222] disabled:opacity-30 disabled:hover:border-[#B0B0B0] transition-colors select-none"
                  >
                    –
                  </button>
                  <span className="text-base font-normal text-[#222222] w-6 text-center">{guests}</span>
                  <button
                    type="button"
                    onClick={() => setGuests((g) => g + 1)}
                    className="w-8 h-8 rounded-full border border-[#B0B0B0] flex items-center justify-center text-lg text-[#717171] hover:border-[#222222] hover:text-[#222222] transition-colors select-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Bedrooms */}
              <div className="flex items-center justify-between py-4 border-b border-[#EBEBEB]">
                <span className="text-base text-[#222222] font-normal">Bedrooms</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBedrooms((b) => Math.max(1, b - 1))}
                    disabled={bedrooms <= 1}
                    className="w-8 h-8 rounded-full border border-[#B0B0B0] flex items-center justify-center text-lg text-[#717171] hover:border-[#222222] hover:text-[#222222] disabled:opacity-30 disabled:hover:border-[#B0B0B0] transition-colors select-none"
                  >
                    –
                  </button>
                  <span className="text-base font-normal text-[#222222] w-6 text-center">{bedrooms}</span>
                  <button
                    type="button"
                    onClick={() => setBedrooms((b) => b + 1)}
                    className="w-8 h-8 rounded-full border border-[#B0B0B0] flex items-center justify-center text-lg text-[#717171] hover:border-[#222222] hover:text-[#222222] transition-colors select-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Beds */}
              <div className="flex items-center justify-between py-4 border-b border-[#EBEBEB]">
                <span className="text-base text-[#222222] font-normal">Beds</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBeds((b) => Math.max(1, b - 1))}
                    disabled={beds <= 1}
                    className="w-8 h-8 rounded-full border border-[#B0B0B0] flex items-center justify-center text-lg text-[#717171] hover:border-[#222222] hover:text-[#222222] disabled:opacity-30 disabled:hover:border-[#B0B0B0] transition-colors select-none"
                  >
                    –
                  </button>
                  <span className="text-base font-normal text-[#222222] w-6 text-center">{beds}</span>
                  <button
                    type="button"
                    onClick={() => setBeds((b) => b + 1)}
                    className="w-8 h-8 rounded-full border border-[#B0B0B0] flex items-center justify-center text-lg text-[#717171] hover:border-[#222222] hover:text-[#222222] transition-colors select-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Bathrooms */}
              <div className="flex items-center justify-between py-4 border-b border-[#EBEBEB]">
                <span className="text-base text-[#222222] font-normal">Bathrooms</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBathrooms((b) => Math.max(1, b - 1))}
                    disabled={bathrooms <= 1}
                    className="w-8 h-8 rounded-full border border-[#B0B0B0] flex items-center justify-center text-lg text-[#717171] hover:border-[#222222] hover:text-[#222222] disabled:opacity-30 disabled:hover:border-[#B0B0B0] transition-colors select-none"
                  >
                    –
                  </button>
                  <span className="text-base font-normal text-[#222222] w-6 text-center">{bathrooms}</span>
                  <button
                    type="button"
                    onClick={() => setBathrooms((b) => b + 1)}
                    className="w-8 h-8 rounded-full border border-[#B0B0B0] flex items-center justify-center text-lg text-[#717171] hover:border-[#222222] hover:text-[#222222] transition-colors select-none"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Does every bedroom have a lock? */}
            <div className="mt-8 space-y-3 font-inter">
              <h3 className="text-base sm:text-lg font-semibold text-[#222222]">
                Does every bedroom have a lock?
              </h3>
              <div className="space-y-2.5">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="hasLock"
                    checked={hasLock === true}
                    onChange={() => setHasLock(true)}
                    className="w-5 h-5 accent-[#222222] cursor-pointer"
                  />
                  <span className="text-base text-[#222222]">Yes</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="hasLock"
                    checked={hasLock === false}
                    onChange={() => setHasLock(false)}
                    className="w-5 h-5 accent-[#222222] cursor-pointer"
                  />
                  <span className="text-base text-[#222222]">No</span>
                </label>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* SECTION HEADING (Single line, Outfit font for main title, Inter for description) */}
          <div className="space-y-1">
            <h1 className="font-outfit text-xl sm:text-2xl lg:text-[28px] font-semibold text-[#222222] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
              Now, let&apos;s give your {getShortPropertyType()} a title &amp; description
            </h1>
            <p className="font-inter text-xs sm:text-sm text-[#717171] leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
              Short titles and clear descriptions work best. You can always change them later.
            </p>
          </div>

          {/* FORM FIELDS WITH CLEAN HIERARCHY */}
          <div className="space-y-6 pt-2 font-inter">
            {/* 1. PROPERTY NAME / TITLE */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="property-title" className="font-outfit text-sm sm:text-base font-semibold text-[#222222] tracking-tight">
                  {config.titleLabel}
                </label>
                <span className={`text-xs font-normal font-inter ${title.length > 110 ? 'text-amber-600 font-medium' : 'text-[#717171]'}`}>
                  {title.length} / 120
                </span>
              </div>

              <input
                id="property-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                onBlur={() => handleBlur('title')}
                placeholder={config.titlePlaceholder}
                maxLength={120}
                className={`w-full px-4 py-3 sm:py-3.5 rounded-xl bg-white border text-sm sm:text-base text-[#222222] placeholder:text-[#86868B] focus:outline-none transition-all ${
                  errors.title
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-[#DDDDDD] hover:border-[#222222] focus:border-[#222222]'
                }`}
              />

              {errors.title && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* 2. DESCRIPTION */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="property-description" className="font-outfit text-sm sm:text-base font-semibold text-[#222222] tracking-tight">
                  {config.descriptionLabel}
                </label>
                <span className="text-xs font-normal font-inter text-[#717171]">
                  {description.length} chars
                </span>
              </div>

              <textarea
                id="property-description"
                rows={5}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                onBlur={() => handleBlur('description')}
                placeholder={config.descriptionPlaceholder}
                className={`w-full px-4 py-3 sm:py-3.5 rounded-xl bg-white border text-sm sm:text-base text-[#222222] placeholder:text-[#86868B] focus:outline-none transition-all resize-y min-h-[140px] ${
                  errors.description
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-[#DDDDDD] hover:border-[#222222] focus:border-[#222222]'
                }`}
              />

              {errors.description && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.description}</span>
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </form>
  );
}
