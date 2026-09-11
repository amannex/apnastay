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
    <div className={`bg-white rounded-3xl border border-[#EDEDED] shadow-apple-sm overflow-hidden text-left ${className}`}>
      {/* ==================================================================== */}
      {/* 1. MEDIA HERO & GALLERY PREVIEW */}
      {/* ==================================================================== */}
      <div className="relative aspect-video sm:aspect-[21/9] w-full bg-[#1D1D1F] overflow-hidden">
        {currentCover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentCover.url}
              alt={property.title || 'Property view'}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Badges Over Image */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-sm">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{property.customPropertyType || template.label}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold shadow-sm">
                <Check className="w-3.5 h-3.5" />
                <span>Verified Listing</span>
              </span>
            </div>

            <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20">
              <Camera className="w-3.5 h-3.5" />
              <span>{photos.length} Photo{photos.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Title & Location Overlay */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
                {property.title}
              </h1>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-200 mt-1">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-medium truncate">
                  {[property.location?.locality, property.location?.city, property.location?.state]
                    .filter(Boolean)
                    .join(', ') || 'Location details pending'}
                </span>
              </div>
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

      {/* Gallery Thumbnail Strip */}
      {photos.length > 1 && (
        <div className="p-3 bg-[#F5F5F7] border-b border-[#EDEDED] flex items-center gap-2 overflow-x-auto">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActivePhoto(photo)}
              className={`relative rounded-xl overflow-hidden shrink-0 w-16 h-12 border-2 transition-all ${
                (activePhoto?.id || initialPhoto?.id) === photo.id
                  ? 'border-[#1D1D1F] ring-2 ring-[#1D1D1F]/20 scale-105'
                  : 'border-transparent opacity-75 hover:opacity-100'
              }`}
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

      {/* ==================================================================== */}
      {/* 2. CORE DETAILS & PRICE BANNER */}
      {/* ==================================================================== */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#EDEDED]">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-100">
                {formatRentalLabel()}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100 inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>{getPropertyAvailabilityLabel(property.availability)}</span>
              </span>
              {property.rules?.genderPreference && property.rules.genderPreference !== 'any' && (
                <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold border border-purple-100">
                  {property.rules.genderPreference === 'female_only' ? 'Women Only' : 'Men Only'}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed max-w-2xl whitespace-pre-line">
              {property.description || 'No description provided for this listing yet.'}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] shrink-0 min-w-[240px]">
            <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider block mb-1">
              Rental Terms
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 flex items-baseline gap-1">
              <span>{formatPricingDisplay(property.pricing, property.pricing?.monthlyRent || 0)}</span>
            </div>

            <div className="mt-3 pt-3 border-t border-[#EDEDED] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#86868B] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Deposit:</span>
                </span>
                <span className="font-bold text-[#1D1D1F]">
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
                  <span className="text-[#86868B] flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-[#86868B]" />
                    <span>Maintenance:</span>
                  </span>
                  <span className="font-medium text-[#1D1D1F]">
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
                  <span className="text-[#86868B] flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Electricity:</span>
                  </span>
                  <span className="font-medium text-[#1D1D1F]">
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
          <div className="space-y-3 pb-6 border-b border-[#EDEDED]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Available {term.plural} ({property.units.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {property.units.map((unit) => (
                <div key={unit.id} className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-[#1D1D1F]">{unit.nameOrNumber}</span>
                    {unit.furnishing && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#EDEDED] text-[#1D1D1F]">
                        {unit.furnishing.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#86868B]">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Capacity: {unit.capacity || 1}</span>
                    </span>
                    {term.hasBeds && unit.beds && unit.beds.length > 0 && (
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{unit.beds.length} Beds</span>
                      </span>
                    )}
                  </div>

                  {unit.pricing?.monthlyRent ? (
                    <div className="pt-1 text-xs font-extrabold text-emerald-600">
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
          <div className="space-y-3 pb-6 border-b border-[#EDEDED]">
            <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Amenities & Highlights</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {property.amenities?.map((amenityId) => {
                const def = AMENITY_REGISTRY[amenityId];
                return (
                  <span
                    key={amenityId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{def?.name || amenityId}</span>
                  </span>
                );
              })}

              {property.customAmenities?.map((custom, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 text-xs font-bold border border-teal-100"
                >
                  <Sparkles className="w-3 h-3 text-teal-600" />
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
          <div className="space-y-4 pb-6 border-b border-[#EDEDED]">
            <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              <span>House Rules & Guidelines</span>
            </h3>

            {/* Preferred Profiles */}
            {property.rules.suitableFor && property.rules.suitableFor.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#86868B] block">Suitable Residents</span>
                <div className="flex flex-wrap gap-1.5">
                  {property.rules.suitableFor.map((suitability) => (
                    <span
                      key={suitability}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-100"
                    >
                      {formatResidentSuitability(suitability)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Policies Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[#EDEDED] text-xs">
                <span className="text-[#86868B] block text-[11px] mb-0.5">Guests</span>
                <span className="font-bold text-[#1D1D1F]">
                  {getPolicyBadgeInfo(property.rules.guestPolicy).label}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[#EDEDED] text-xs">
                <span className="text-[#86868B] block text-[11px] mb-0.5">Pets</span>
                <span className="font-bold text-[#1D1D1F]">
                  {getPolicyBadgeInfo(property.rules.petPolicy).label}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[#EDEDED] text-xs">
                <span className="text-[#86868B] block text-[11px] mb-0.5">Smoking</span>
                <span className="font-bold text-[#1D1D1F]">
                  {getPolicyBadgeInfo(property.rules.smokingPolicy).label}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[#EDEDED] text-xs">
                <span className="text-[#86868B] block text-[11px] mb-0.5">Alcohol</span>
                <span className="font-bold text-[#1D1D1F]">
                  {getPolicyBadgeInfo(property.rules.alcoholPolicy).label}
                </span>
              </div>
            </div>

            {/* Timing & Food Summary */}
            <div className="flex flex-wrap gap-3 text-xs text-[#1D1D1F]">
              {property.rules.timingType && (
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#86868B]" />
                  <span>{formatTimingPolicy(property.rules.timingType, property.rules.gateClosingTime)}</span>
                </span>
              )}
              {property.rules.foodPolicy && property.rules.foodPolicy !== 'not_specified' && (
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Utensils className="w-3.5 h-3.5 text-[#86868B]" />
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
                <span className="text-xs font-bold text-[#86868B] block">Community Guidelines</span>
                <ul className="list-disc list-inside text-xs text-[#1D1D1F] space-y-1 pl-1">
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
          <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Neighborhood & Address</span>
          </h3>

          <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] space-y-1.5 text-xs">
            <div className="font-bold text-[#1D1D1F]">
              {[property.location?.locality, property.location?.city, property.location?.state, property.location?.pincode]
                .filter(Boolean)
                .join(', ') || 'Address on request'}
            </div>

            {property.location?.landmark && (
              <div className="text-[#86868B]">
                Landmark: <span className="font-medium text-[#1D1D1F]">{property.location.landmark}</span>
              </div>
            )}

            {property.location?.hideExactAddress ? (
              <div className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
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
