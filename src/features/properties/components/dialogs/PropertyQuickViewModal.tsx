'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Building2,
  MapPin,
  IndianRupee,
  Calendar,
  Layers,
  Camera,
  CheckCircle2,
  Clock,
  EyeOff,
  Archive,
  ShieldAlert,
  Users,
  Utensils,
  PawPrint,
  Cigarette,
  Wine,
  Sparkles,
  Edit3
} from 'lucide-react';
import type { Property } from '../../types';
import { getPropertyTemplate } from '../../templates';
import { getSafeImageUrl } from '../wizard/StepPhotos';
import { formatPricingDisplay, calculateEffectiveDeposit, getPropertyAvailabilityLabel } from '../../pricing';
import { AMENITY_REGISTRY } from '../../amenities';
import {
  getPolicyBadgeInfo,
  formatResidentSuitability,
  formatTimingPolicy,
  formatFoodPolicy
} from '../../rules';

interface PropertyQuickViewModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyQuickViewModal({
  property,
  isOpen,
  onClose
}: PropertyQuickViewModalProps) {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !property) return null;

  const template = getPropertyTemplate(property.propertyType);
  const coverPhoto = property.photos?.find((p) => p.isCover) || property.photos?.[0];
  const galleryPhotos = property.photos || [];

  const isDraft = property.status === 'draft';
  const isPublished = property.status === 'published';
  const isUnpublished = property.status === 'unpublished';
  const isArchived = property.status === 'archived';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-[#EDEDED] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-[#EDEDED] flex items-center justify-between gap-4 shrink-0 bg-white">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F]">
                {property.customPropertyType || template.label}
              </span>

              {isDraft && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Draft ({property.completenessScore}% complete)</span>
                </span>
              )}

              {isPublished && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Published Live</span>
                </span>
              )}

              {isUnpublished && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                  <EyeOff className="w-3 h-3 text-zinc-500" />
                  <span>Unpublished (Private)</span>
                </span>
              )}

              {isArchived && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  <Archive className="w-3 h-3 text-slate-500" />
                  <span>Archived</span>
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-[#1D1D1F] truncate">
              {property.title || `New ${template.label} Draft`}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F5F7] hover:bg-[#EDEDED] text-[#86868B] hover:text-[#1D1D1F] flex items-center justify-center transition-colors shrink-0"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* PHOTO SHOWCASE */}
          {coverPhoto ? (
            <div className="space-y-2">
              <div className="h-56 sm:h-64 rounded-2xl bg-[#F5F5F7] overflow-hidden border border-[#EDEDED] relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getSafeImageUrl(coverPhoto.url)}
                  alt="Property Cover"
                  className="w-full h-full object-cover"
                />
              </div>

              {galleryPhotos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {galleryPhotos.slice(0, 6).map((p) => (
                    <div
                      key={p.id}
                      className="w-16 h-12 rounded-xl bg-[#F5F5F7] overflow-hidden border border-[#EDEDED] shrink-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getSafeImageUrl(p.thumbnailUrl || p.url)}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {galleryPhotos.length > 6 && (
                    <div className="w-16 h-12 rounded-xl bg-[#F5F5F7] border border-[#EDEDED] flex items-center justify-center text-xs font-bold text-[#86868B] shrink-0">
                      +{galleryPhotos.length - 6} more
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-40 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] flex flex-col items-center justify-center text-center p-4 text-[#86868B]">
              <Camera className="w-8 h-8 mb-2 opacity-40" />
              <span className="text-xs font-semibold">No photos uploaded yet</span>
            </div>
          )}

          {/* PRICING & AVAILABILITY GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED]">
              <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-1">
                Monthly Rent
              </span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-700">
                {property.pricing?.monthlyRent
                  ? `₹${property.pricing.monthlyRent.toLocaleString('en-IN')}`
                  : 'On Request'}
              </span>
              <span className="text-[11px] text-[#86868B] block mt-0.5">/ month</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED]">
              <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-1">
                Security Deposit
              </span>
              <span className="text-sm sm:text-base font-extrabold text-[#1D1D1F]">
                {property.pricing
                  ? `₹${calculateEffectiveDeposit(
                      property.pricing.monthlyRent || 0,
                      property.pricing.securityDepositConfig,
                      property.pricing.securityDeposit
                    ).toLocaleString('en-IN')}`
                  : '—'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED]">
              <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-1">
                Availability
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#1D1D1F]">
                {getPropertyAvailabilityLabel(property.availability)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED]">
              <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-1">
                Rental Model
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#1D1D1F] capitalize">
                {property.rentalStructure.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* DESCRIPTION */}
          {property.description && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-[#86868B] uppercase tracking-wider">
                Description
              </h4>
              <p className="text-xs sm:text-sm text-[#1D1D1F] leading-relaxed bg-[#F5F5F7] p-4 rounded-2xl border border-[#EDEDED]">
                {property.description}
              </p>
            </div>
          )}

          {/* LOCATION */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-[#86868B] uppercase tracking-wider">
              Location & Address
            </h4>
            <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-[#1D1D1F]">
                <p className="font-semibold">
                  {[property.location?.addressLine1, property.location?.addressLine2]
                    .filter(Boolean)
                    .join(', ') || 'Address not specified'}
                </p>
                <p className="text-xs text-[#86868B] mt-0.5">
                  {[property.location?.locality, property.location?.city, property.location?.state, property.location?.pincode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {property.location?.landmark && (
                  <p className="text-[11px] text-[#86868B] mt-1 italic">
                    Near: {property.location.landmark}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* UNITS SUMMARY (IF APPLICABLE) */}
          {property.units && property.units.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#86868B] uppercase tracking-wider flex items-center justify-between">
                <span>Units & Rooms ({property.units.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {property.units.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 rounded-xl bg-[#F5F5F7] border border-[#EDEDED] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#1D1D1F] block">{u.nameOrNumber}</span>
                      <span className="text-[11px] text-[#86868B] capitalize">
                        {u.unitType?.replace(/_/g, ' ') || 'Room'} • {u.beds?.length || 0} Beds
                      </span>
                    </div>
                    {u.pricing?.monthlyRent && (
                      <span className="font-bold text-emerald-700 text-xs">
                        ₹{u.pricing.monthlyRent.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KEY AMENITIES */}
          {((property.amenities && property.amenities.length > 0) ||
            (property.customAmenities && property.customAmenities.length > 0)) && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#86868B] uppercase tracking-wider">
                Amenities & Features
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {property.amenities?.map((id) => {
                  const item = AMENITY_REGISTRY[id];
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F5F5F7] border border-[#EDEDED] text-xs font-semibold text-[#1D1D1F]"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{item ? item.name : id}</span>
                    </span>
                  );
                })}
                {property.customAmenities?.map((custom) => (
                  <span
                    key={custom}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 border border-purple-100 text-xs font-semibold text-purple-900"
                  >
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span>{custom}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* HOUSE RULES PREVIEW */}
          {property.rules && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#86868B] uppercase tracking-wider">
                Rules & Resident Preferences
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {property.rules.suitableFor && property.rules.suitableFor.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[#EDEDED]">
                    <span className="text-[10px] text-[#86868B] font-bold block mb-0.5">Suitable For</span>
                    <span className="font-semibold text-[#1D1D1F] line-clamp-1">
                      {property.rules.suitableFor.map(formatResidentSuitability).join(', ')}
                    </span>
                  </div>
                )}

                {property.rules.guestPolicy && property.rules.guestPolicy !== 'not_specified' && (
                  <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[#EDEDED]">
                    <span className="text-[10px] text-[#86868B] font-bold block mb-0.5">Guests</span>
                    <span className="font-semibold text-[#1D1D1F] capitalize">
                      {getPolicyBadgeInfo(property.rules.guestPolicy).label}
                    </span>
                  </div>
                )}

                {property.rules.petPolicy && property.rules.petPolicy !== 'not_specified' && (
                  <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[#EDEDED]">
                    <span className="text-[10px] text-[#86868B] font-bold block mb-0.5">Pets</span>
                    <span className="font-semibold text-[#1D1D1F] capitalize">
                      {getPolicyBadgeInfo(property.rules.petPolicy).label}
                    </span>
                  </div>
                )}

                {property.rules.timingType && property.rules.timingType !== 'not_specified' && (
                  <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[#EDEDED]">
                    <span className="text-[10px] text-[#86868B] font-bold block mb-0.5">Gate / Timing</span>
                    <span className="font-semibold text-[#1D1D1F]">
                      {formatTimingPolicy(property.rules.timingType, property.rules.gateClosingTime)}
                    </span>
                  </div>
                )}

                {property.rules.foodPolicy && property.rules.foodPolicy !== 'not_specified' && (
                  <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[#EDEDED]">
                    <span className="text-[10px] text-[#86868B] font-bold block mb-0.5">Meals</span>
                    <span className="font-semibold text-[#1D1D1F]">
                      {formatFoodPolicy(property.rules.foodPolicy)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-[#EDEDED] bg-[#F5F5F7]/60 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#EDEDED] bg-white hover:bg-[#F5F5F7] text-xs font-bold text-[#1D1D1F] transition-all"
          >
            Close Preview
          </button>

          <Link
            href={`/owner/dashboard/properties/new?draftId=${encodeURIComponent(property.id)}&step=10`}
            className="px-5 py-2.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Listing</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
