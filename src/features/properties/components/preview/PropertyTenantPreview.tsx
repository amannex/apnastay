'use client';

import React, { useState } from 'react';
import {
  MapPin,
  IndianRupee,
  ShieldCheck,
  Calendar,
  Building2,
  BedDouble,
  Users,
  Sparkles,
  Zap,
  Wrench,
  Clock,
  UserCheck,
  PawPrint,
  Cigarette,
  Wine,
  Utensils,
  FileCheck2,
  Check,
  EyeOff,
  Camera,
  Star,
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import type { Property, PropertyPhoto, PropertyUnit } from '../../types';
import { getPropertyTemplate } from '../../templates';
import { getUnitTerminology } from '../../units';
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
import { AMENITY_REGISTRY } from '../../amenities';

interface PropertyTenantPreviewProps {
  property: Property;
  className?: string;
}

export default function PropertyTenantPreview({ property, className = '' }: PropertyTenantPreviewProps) {
  const template = getPropertyTemplate(property.propertyType);
  const term = getUnitTerminology(property.propertyType, property.rentalStructure);
  const photos = property.photos || [];

  // Active viewing photo
  const initialPhoto = photos.find((p) => p.isCover) || photos[0];
  const [activePhoto, setActivePhoto] = useState<PropertyPhoto | undefined>(initialPhoto);

  const formatRentalLabel = () => {
    switch (property.rentalStructure) {
      case 'entire_property':
        return 'Entire Property';
      case 'individual_unit':
        return 'Private Flat / Unit';
      case 'individual_room':
        return 'Private Room';
      case 'individual_bed':
        return 'Shared Room / Bed';
      case 'multiple_units':
        return 'Multiple Units';
      default:
        return property.rentalStructure;
    }
  };

  const currentCover = activePhoto || initialPhoto;

  return (
    <div className={`w-full text-left space-y-4 sm:space-y-5 text-[#222222] font-inter ${className}`}>
      {/* ==================================================================== */}
      {/* 1. TITLE & LOCATION HEADER (Airbnb Listing Style) */}
      {/* ==================================================================== */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#222222]">
          {property.title || 'Untitled Property'}
        </h1>
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#717171]">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <span className="font-medium truncate">
            {[property.location?.locality, property.location?.city, property.location?.state]
              .filter(Boolean)
              .join(', ') || 'Location details pending'}
          </span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. MEDIA HERO & GALLERY PREVIEW (Main Hero with Vertical Side Thumbnails) */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row gap-3 w-full items-start">
        {/* Main Featured Photo */}
        <div className="relative flex-1 min-w-0 aspect-video sm:aspect-[21/9] w-full bg-[#1D1D1F] rounded-2xl overflow-hidden border border-[#EBEBEB] shadow-apple-sm">
          {currentCover ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentCover.url}
                alt={property.title || 'Property view'}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Badges Over Image */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-sm">
                  <Building2 className="w-3.5 h-3.5 text-white/90" />
                  <span>{property.customPropertyType || template.label}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary backdrop-blur-md text-white text-xs font-semibold shadow-sm">
                  <Check className="w-3.5 h-3.5" />
                  <span>Verified Listing</span>
                </span>
              </div>

              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
                <Camera className="w-3.5 h-3.5" />
                <span>{photos.length} Photo{photos.length !== 1 ? 's' : ''}</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
              <Camera className="w-12 h-12 stroke-[1.5] mb-2 opacity-50" />
              <p className="text-sm font-semibold">No photographs uploaded yet</p>
              <p className="text-xs text-gray-500">Upload at least one photo to preview your hero display.</p>
            </div>
          )}
        </div>

        {/* Vertical Side Thumbnails */}
        {photos.length > 1 && (
          <div className="flex sm:flex-col gap-2 shrink-0 overflow-x-auto sm:overflow-y-auto max-h-[320px] py-1 sm:py-0 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActivePhoto(photo)}
                className={`relative rounded-xl overflow-hidden shrink-0 w-16 h-12 border-2 transition-all cursor-pointer ${
                  (activePhoto?.id || initialPhoto?.id) === photo.id
                    ? 'border-[#222222] ring-2 ring-[#222222]/20 scale-105'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
                title="Click to view photo"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.thumbnailUrl || photo.url} alt="Thumbnail" className="w-full h-full object-cover" />
                {photo.isCover && (
                  <div className="absolute top-1 left-1 bg-amber-500 rounded-full p-0.5 shadow-sm">
                    <Star className="w-2.5 h-2.5 fill-white text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 2. CORE DETAILS & PRICE BANNER */}
      {/* ==================================================================== */}
      <div className="space-y-6 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#EBEBEB]">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full bg-[#F7F7F7] text-[#222222] text-xs font-medium border border-[#EBEBEB]">
                {formatRentalLabel()}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#F7F7F7] text-[#222222] text-xs font-medium border border-[#EBEBEB] inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#717171]" />
                <span>{getPropertyAvailabilityLabel(property.availability)}</span>
              </span>
              {property.rules?.genderPreference && property.rules.genderPreference !== 'any' && (
                <span className="px-2.5 py-1 rounded-full bg-[#F7F7F7] text-[#222222] text-xs font-medium border border-[#EBEBEB]">
                  {property.rules.genderPreference === 'female_only' ? 'Women Only' : 'Men Only'}
                </span>
              )}
            </div>

            <p className="text-sm text-[#717171] leading-relaxed max-w-2xl whitespace-pre-line">
              {property.description || 'No description provided for this listing yet.'}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] shrink-0 min-w-[240px]">
            <span className="text-[11px] font-semibold text-[#717171] uppercase tracking-wider block mb-1">
              Rental Terms
            </span>
            <div className="text-2xl font-bold text-[#222222] flex items-baseline gap-1">
              <span>{formatPricingDisplay(property.pricing, property.pricing?.monthlyRent || 0)}</span>
            </div>

            <div className="mt-3 pt-3 border-t border-[#EBEBEB] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#717171] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#717171]" />
                  <span>Deposit:</span>
                </span>
                <span className="font-semibold text-[#222222]">
                  {formatCurrency(
                    calculateEffectiveDeposit(
                      property.pricing?.monthlyRent || 0,
                      property.pricing?.securityDepositConfig,
                      property.pricing?.securityDeposit
                    )
                  )}
                </span>
              </div>

              {property.pricing?.maintenanceChargesConfig && (
                <div className="flex items-center justify-between">
                  <span className="text-[#717171] flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[#717171]" />
                    <span>Maintenance:</span>
                  </span>
                  <span className="font-medium text-[#222222]">
                    {property.pricing.maintenanceChargesConfig.type === 'included'
                      ? 'Included'
                      : property.pricing.maintenanceChargesConfig.type === 'fixed'
                      ? formatCurrency(property.pricing.maintenanceChargesConfig.amount)
                      : property.pricing.maintenanceChargesConfig.type.replace('_', ' ')}
                  </span>
                </div>
              )}

              {property.pricing?.electricityChargesConfig && (
                <div className="flex items-center justify-between">
                  <span className="text-[#717171] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#717171]" />
                    <span>Electricity:</span>
                  </span>
                  <span className="font-medium text-[#222222]">
                    {property.pricing.electricityChargesConfig.type === 'included'
                      ? 'Included'
                      : property.pricing.electricityChargesConfig.type === 'meter_based'
                      ? 'As per meter'
                      : property.pricing.electricityChargesConfig.type}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 3. UNITS & ROOM INVENTORY (IF APPLICABLE) */}
        {/* ==================================================================== */}
        {property.units && property.units.length > 0 && (
          <div className="space-y-3 pb-6 border-b border-[#EBEBEB]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#222222] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#717171]" />
                <span>Available {term.plural} ({property.units.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {property.units.map((unit) => (
                <div key={unit.id} className="p-3.5 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#222222]">{unit.nameOrNumber}</span>
                    {unit.furnishing && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white border border-[#EBEBEB] text-[#717171]">
                        {unit.furnishing.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#717171]">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Capacity: {unit.capacity || 1}</span>
                    </span>
                    {term.hasBeds && unit.beds && unit.beds.length > 0 && (
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-[#717171]" />
                        <span>{unit.beds.length} Beds</span>
                      </span>
                    )}
                  </div>

                  {unit.pricing?.monthlyRent ? (
                    <div className="pt-1 text-xs font-bold text-[#222222]">
                      {formatCurrency(unit.pricing.monthlyRent)} /month
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 4. AMENITIES & FEATURES */}
        {/* ==================================================================== */}
        {((property.amenities && property.amenities.length > 0) ||
          (property.customAmenities && property.customAmenities.length > 0)) && (
          <div className="space-y-3 pb-6 border-b border-[#EBEBEB]">
            <h3 className="text-sm font-semibold text-[#222222] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#717171]" />
              <span>Amenities & Highlights</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {property.amenities?.map((amenityId) => {
                const def = AMENITY_REGISTRY[amenityId];
                return (
                  <span
                    key={amenityId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F7F7] text-[#222222] text-xs font-medium border border-[#EBEBEB]"
                  >
                    <Check className="w-3.5 h-3.5 text-[#717171]" />
                    <span>{def?.name || amenityId}</span>
                  </span>
                );
              })}

              {property.customAmenities?.map((custom, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F7F7] text-[#222222] text-xs font-medium border border-[#EBEBEB]"
                >
                  <Sparkles className="w-3 h-3 text-[#717171]" />
                  <span>{custom}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 5. HOUSE RULES & TENANT PREFERENCES */}
        {/* ==================================================================== */}
        {property.rules && (
          <div className="space-y-4 pb-6 border-b border-[#EBEBEB]">
            <h3 className="text-sm font-semibold text-[#222222] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#717171]" />
              <span>House Rules & Guidelines</span>
            </h3>

            {/* Preferred Profiles */}
            {property.rules.suitableFor && property.rules.suitableFor.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-[#717171] block">Suitable Residents</span>
                <div className="flex flex-wrap gap-1.5">
                  {property.rules.suitableFor.map((suitability) => (
                    <span
                      key={suitability}
                      className="px-2.5 py-1 rounded-lg bg-[#F7F7F7] text-[#222222] text-xs font-medium border border-[#EBEBEB]"
                    >
                      {formatResidentSuitability(suitability)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Policies Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] text-xs">
                <span className="text-[#717171] block text-[11px] mb-0.5">Guests</span>
                <span className="font-semibold text-[#222222]">
                  {getPolicyBadgeInfo(property.rules.guestPolicy).label}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] text-xs">
                <span className="text-[#717171] block text-[11px] mb-0.5">Pets</span>
                <span className="font-semibold text-[#222222]">
                  {getPolicyBadgeInfo(property.rules.petPolicy).label}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] text-xs">
                <span className="text-[#717171] block text-[11px] mb-0.5">Smoking</span>
                <span className="font-semibold text-[#222222]">
                  {getPolicyBadgeInfo(property.rules.smokingPolicy).label}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] text-xs">
                <span className="text-[#717171] block text-[11px] mb-0.5">Alcohol</span>
                <span className="font-semibold text-[#222222]">
                  {getPolicyBadgeInfo(property.rules.alcoholPolicy).label}
                </span>
              </div>
            </div>

            {/* Timing & Food Summary */}
            <div className="flex flex-wrap gap-3 text-xs text-[#222222]">
              {property.rules.timingType && (
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#717171]" />
                  <span>{formatTimingPolicy(property.rules.timingType, property.rules.gateClosingTime)}</span>
                </span>
              )}
              {property.rules.foodPolicy && property.rules.foodPolicy !== 'not_specified' && (
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Utensils className="w-3.5 h-3.5 text-[#717171]" />
                  <span>{formatFoodPolicy(property.rules.foodPolicy)}</span>
                </span>
              )}
              {property.rules.kitchenAccess && property.rules.kitchenAccess !== 'not_specified' && (
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span>{formatKitchenPolicy(property.rules.kitchenAccess, property.rules.cookingPolicy)}</span>
                </span>
              )}
            </div>

            {/* Custom Rules List */}
            {property.rules.customRules && property.rules.customRules.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-xs font-medium text-[#717171] block">Community Guidelines</span>
                <ul className="list-disc list-inside text-xs text-[#222222] space-y-1 pl-1">
                  {property.rules.customRules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* 6. LOCATION & NEIGHBORHOOD MAP SUMMARY */}
        {/* ==================================================================== */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[#222222] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#717171]" />
            <span>Neighborhood & Address</span>
          </h3>

          <div className="p-3.5 sm:p-4 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] space-y-1.5 text-xs">
            <div className="font-semibold text-[#222222]">
              {[property.location?.locality, property.location?.city, property.location?.state, property.location?.pincode]
                .filter(Boolean)
                .join(', ') || 'Address on request'}
            </div>

            {property.location?.landmark && (
              <div className="text-[#717171]">
                Landmark: <span className="font-medium text-[#222222]">{property.location.landmark}</span>
              </div>
            )}

            {property.location?.hideExactAddress ? (
              <div className="inline-flex items-center gap-1 text-[11px] text-[#717171] bg-white border border-[#EBEBEB] px-2 py-0.5 rounded-full font-medium">
                <EyeOff className="w-3 h-3" />
                <span>Exact street address shared after booking confirmation</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
