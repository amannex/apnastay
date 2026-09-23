'use client';

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import type { PropertyType, RentalStructure } from '../../types';
import { getBasicFieldsConfig } from '../../templates';

export interface StepTitleDescriptionProps {
  propertyType: PropertyType;
  customPropertyType?: string;
  rentalStructure: RentalStructure;
  initialTitle?: string;
  initialDescription?: string;
  onBack?: (title?: string, description?: string) => void;
  onSave: (data: { title: string; description: string }) => Promise<void> | void;
  isSaving?: boolean;
}

export default function StepTitleDescription({
  propertyType,
  customPropertyType,
  rentalStructure,
  initialTitle = '',
  initialDescription = '',
  onBack,
  onSave,
  isSaving = false
}: StepTitleDescriptionProps) {
  const config = getBasicFieldsConfig(propertyType, rentalStructure, customPropertyType);

  const [title, setTitle] = useState<string>(initialTitle);
  const [description, setDescription] = useState<string>(initialDescription);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  React.useEffect(() => {
    if (initialTitle) setTitle(initialTitle);
  }, [initialTitle]);

  React.useEffect(() => {
    if (initialDescription) setDescription(initialDescription);
  }, [initialDescription]);

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

  const validate = (): boolean => {
    const newErrors: { title?: string; description?: string } = {};
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        title: title.trim(),
        description: description.trim()
      });
    }
  };

  return (
    <form
      id="title-description-form"
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto animate-fade-in py-2 space-y-8"
      noValidate
    >
      {/* SECTION HEADING (Airbnb Style) */}
      <div className="space-y-1">
        <h1 className="font-outfit text-2xl sm:text-[30px] font-semibold text-[#222222] tracking-tight">
          Now, let&apos;s give your {getShortPropertyType()} a title &amp; description
        </h1>
        <p className="font-inter text-sm sm:text-base text-[#717171] leading-normal">
          Short titles and clear descriptions work best. You can always change them later.
        </p>
      </div>

      {/* FORM FIELDS */}
      <div className="space-y-6 pt-2 font-inter">
        {/* 1. PROPERTY NAME / TITLE */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="property-title"
              className={`font-outfit text-sm sm:text-base font-semibold tracking-tight transition-colors ${
                errors.title ? 'text-primary' : 'text-[#222222]'
              }`}
            >
              {config.titleLabel} <span className="text-primary ml-0.5" title="Required">*</span>
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
            placeholder={config.titlePlaceholder}
            maxLength={120}
            className={`w-full px-4 py-3 sm:py-3.5 rounded-xl bg-white border text-sm sm:text-base text-[#222222] placeholder:text-[#86868B] focus:outline-none transition-all ${
              errors.title
                ? 'border-primary focus:border-primary ring-1 ring-primary/20'
                : 'border-[#DDDDDD] hover:border-[#222222] focus:border-[#222222]'
            }`}
          />

          {errors.title && (
            <p className="text-xs text-primary font-medium flex items-center gap-1 mt-1 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span>{errors.title}</span>
            </p>
          )}
        </div>

        {/* 2. DESCRIPTION */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="property-description"
              className={`font-outfit text-sm sm:text-base font-semibold tracking-tight transition-colors ${
                errors.description ? 'text-primary' : 'text-[#222222]'
              }`}
            >
              {config.descriptionLabel} <span className="text-primary ml-0.5" title="Required">*</span>
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
            placeholder={config.descriptionPlaceholder}
            className={`w-full px-4 py-3 sm:py-3.5 rounded-xl bg-white border text-sm sm:text-base text-[#222222] placeholder:text-[#86868B] focus:outline-none transition-all resize-y min-h-[140px] ${
              errors.description
                ? 'border-primary focus:border-primary ring-1 ring-primary/20'
                : 'border-[#DDDDDD] hover:border-[#222222] focus:border-[#222222]'
            }`}
          />

          {errors.description && (
            <p className="text-xs text-primary font-medium flex items-center gap-1 mt-1 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span>{errors.description}</span>
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
