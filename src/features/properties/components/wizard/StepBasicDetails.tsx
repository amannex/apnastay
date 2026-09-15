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
  onBack: (currentValues: BasicDetailsFormData) => void;
  onSave: (data: BasicDetailsFormData) => Promise<void> | void;
  isSaving?: boolean;
}

export default function StepBasicDetails({
  propertyType,
  customPropertyType,
  rentalStructure,
  initialValues,
  onBack,
  onSave,
  isSaving = false
}: StepBasicDetailsProps) {
  const config = getBasicFieldsConfig(propertyType, rentalStructure, customPropertyType);
  const template = getPropertyTemplate(propertyType);

  // Today's date string YYYY-MM-DD for min date in picker
  const todayStr = new Date().toISOString().split('T')[0];

  // Capacity state (Matching Screenshot 2)
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
      : ''
  );

  // Validation errors
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    monthlyRent?: string;
    availDate?: string;
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
    const parsedRent = Number(monthlyRent.replace(/[^0-9.]/g, '')) || 0;
    return {
      title: title.trim(),
      description: description.trim(),
      availability: {
        type: availType,
        availableFrom: availType === 'specific_date' ? availDate : undefined
      },
      monthlyRent: parsedRent,
      guests,
      bedrooms,
      beds,
      bathrooms,
      hasLock
    };
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    const parsedRent = Number(monthlyRent.replace(/[^0-9.]/g, ''));

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

    if (!monthlyRent || isNaN(parsedRent) || parsedRent <= 0) {
      newErrors.monthlyRent = 'Please enter a valid positive monthly rent amount.';
    }

    if (availType === 'specific_date') {
      if (!availDate) {
        newErrors.availDate = 'Please choose the date when this property will be available.';
      } else if (availDate < todayStr) {
        newErrors.availDate = 'Availability date cannot be in the past.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(getCurrentFormData());
    }
  };

  const handleBackClick = () => {
    onBack(getCurrentFormData());
  };

  return (
    <form id="basic-details-form" onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto animate-fade-in py-2 space-y-8" noValidate>
      {/* SECTION HEADING (Matching Screenshot 2) */}
      <div>
        <h1 className="text-2xl sm:text-[32px] font-semibold text-[#222222] tracking-tight">
          Let&apos;s start with the basics
        </h1>
      </div>

      {/* ==================================================================== */}
      {/* 1. CAPACITY & ROOMS COUNTERS (Screenshot 2)                          */}
      {/* ==================================================================== */}
      <div>
        <h2 className="text-base sm:text-lg font-medium text-[#222222] mb-2">
          How many people can stay here?
        </h2>

        <div className="space-y-0">
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

        {/* Does every bedroom have a lock? (From Screenshot 2) */}
        <div className="mt-8 space-y-3">
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

      <div className="space-y-5">
        {/* 1. PROPERTY NAME / TITLE */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="property-title" className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1">
              <span>{config.titleLabel}</span>
              <span className="text-primary">*</span>
            </label>
            <span className="text-xs text-[#86868B]">
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
            className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none transition-all ${
              errors.title
                ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-50'
                : 'border-[#EDEDED] focus:border-primary focus:ring-2 focus:ring-primary/10'
            }`}
          />

          {errors.title && (
            <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.title}</span>
            </p>
          )}
        </div>

        {/* 2. DESCRIPTION */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="property-description" className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1">
              <span>{config.descriptionLabel}</span>
              <span className="text-primary">*</span>
            </label>
            <span className="text-xs text-[#86868B]">
              {description.length} chars
            </span>
          </div>

          <textarea
            id="property-description"
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            onBlur={() => handleBlur('description')}
            placeholder={config.descriptionPlaceholder}
            className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none transition-all resize-y ${
              errors.description
                ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-50'
                : 'border-[#EDEDED] focus:border-primary focus:ring-2 focus:ring-primary/10'
            }`}
          />

          {errors.description && (
            <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.description}</span>
            </p>
          )}
        </div>

        {/* 3. AVAILABILITY */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1">
            <span>{config.availabilityLabel}</span>
            <span className="text-primary">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option A: Available Now */}
            <button
              type="button"
              onClick={() => {
                setAvailType('immediate');
                if (errors.availDate) setErrors((prev) => ({ ...prev, availDate: undefined }));
              }}
              className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                availType === 'immediate'
                  ? 'border-primary bg-primary/[0.03] ring-1 ring-primary shadow-sm'
                  : 'bg-white border-[#EDEDED] hover:border-[#D1D1D6]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  availType === 'immediate'
                    ? 'bg-primary text-white'
                    : 'bg-[#F5F5F7] text-[#86868B]'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#1D1D1F]">
                  Available Now
                </div>
                <div className="text-xs text-[#86868B] mt-0.5">
                  Ready for immediate move-in
                </div>
              </div>
            </button>

            {/* Option B: Specific Date */}
            <button
              type="button"
              onClick={() => {
                setAvailType('specific_date');
              }}
              className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                availType === 'specific_date'
                  ? 'border-primary bg-primary/[0.03] ring-1 ring-primary shadow-sm'
                  : 'bg-white border-[#EDEDED] hover:border-[#D1D1D6]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  availType === 'specific_date'
                    ? 'bg-primary text-white'
                    : 'bg-[#F5F5F7] text-[#86868B]'
                }`}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#1D1D1F]">
                  Future Date
                </div>
                <div className="text-xs text-[#86868B] mt-0.5">
                  Available from a specific date
                </div>
              </div>
            </button>
          </div>

          {/* Conditional Date Input */}
          {availType === 'specific_date' && (
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#EDEDED] space-y-2 animate-fade-in">
              <label htmlFor="avail-date-input" className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Move-In Date</span>
                <span className="text-primary">*</span>
              </label>

              <input
                id="avail-date-input"
                type="date"
                min={todayStr}
                value={availDate}
                onChange={(e) => {
                  setAvailDate(e.target.value);
                  if (errors.availDate) setErrors((prev) => ({ ...prev, availDate: undefined }));
                }}
                onBlur={() => handleBlur('availDate')}
                className={`w-full sm:w-64 px-4 py-2.5 rounded-xl bg-white border text-sm text-[#1D1D1F] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all ${
                  errors.availDate
                    ? 'border-rose-300 focus:border-rose-500'
                    : 'border-[#EDEDED]'
                }`}
              />

              {errors.availDate && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.availDate}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* 4. BASIC STARTING RENT */}
        <div className="space-y-1.5 pt-1">
          <label htmlFor="property-rent" className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1">
            <span>{config.priceLabel}</span>
            <span className="text-primary">*</span>
          </label>

          <div className="relative max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base font-bold text-[#1D1D1F]">
              ₹
            </div>
            <input
              id="property-rent"
              type="text"
              inputMode="numeric"
              value={monthlyRent}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setMonthlyRent(val);
                if (errors.monthlyRent) setErrors((prev) => ({ ...prev, monthlyRent: undefined }));
              }}
              onBlur={() => handleBlur('monthlyRent')}
              placeholder={config.pricePlaceholder}
              className={`w-full pl-9 pr-4 py-3 rounded-xl bg-white border text-base font-bold text-[#1D1D1F] placeholder:text-[#86868B] placeholder:font-normal focus:outline-none transition-all ${
                errors.monthlyRent
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-50'
                  : 'border-[#EDEDED] focus:border-primary focus:ring-2 focus:ring-primary/10'
              }`}
            />
          </div>

          {errors.monthlyRent && (
            <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.monthlyRent}</span>
            </p>
          )}
        </div>
      </div>

    </form>
  );
}
