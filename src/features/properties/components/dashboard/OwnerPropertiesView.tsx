'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Loader2,
  Layers,
  MapPin,
  Camera
} from 'lucide-react';
import type { Property } from '../../types';
import { getOwnerProperties } from '../../api';
import { getPropertyTemplate } from '../../templates';
import { getSafeImageUrl } from '../wizard/StepPhotos';

export default function OwnerPropertiesView() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        const res = await getOwnerProperties();
        if (res.success && res.data) {
          setProperties(res.data);
        } else {
          setError(res.error || 'Failed to load your properties.');
        }
      } catch (err: any) {
        setError(err.message || 'Network error while fetching properties.');
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER WITH "+ ADD PROPERTY" CTA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Property Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            My Properties
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-1 max-w-xl leading-relaxed">
            Manage your houses, flats, PGs, and commercial spaces. Create new drafts and monitor listing completeness.
          </p>
        </div>

        <Link
          href="/owner/dashboard/properties/new"
          className="px-5 py-3.5 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Property</span>
        </Link>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="bg-white rounded-3xl p-12 border border-[#EDEDED] shadow-apple-sm flex flex-col items-center justify-center text-center gap-3">
          <Loader2 className="w-6 h-6 text-[#1D1D1F] animate-spin" />
          <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
            Loading Your Property Portfolio...
          </span>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && properties.length === 0 && (
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-[#EDEDED] shadow-apple-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#F5F5F7] text-[#86868B] flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-[#1D1D1F]">
              No Properties Listed Yet
            </h3>
            <p className="text-xs sm:text-sm text-[#86868B] mt-1 leading-relaxed">
              Start listing your property in minutes. Whether it’s a single flat, a multi-room PG, or an entire house, our simple wizard makes it effortless.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/owner/dashboard/properties/new"
              className="px-6 py-3.5 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Your First Property</span>
            </Link>
          </div>
        </div>
      )}

      {/* PROPERTIES LIST */}
      {!loading && properties.length > 0 && (
        <div className="space-y-3.5">
          {properties.map((prop) => {
            const template = getPropertyTemplate(prop.propertyType);
            const isDraft = prop.status === 'draft';
            const isPublished = prop.status === 'published';
            const coverPhoto = prop.photos?.find((p) => p.isCover) || prop.photos?.[0];

            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl p-5 border border-[#EDEDED] shadow-apple-sm hover:border-[#D1D1D6] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {coverPhoto ? (
                    <div className="w-14 h-14 rounded-xl bg-[#F5F5F7] overflow-hidden shrink-0 border border-[#EDEDED] relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getSafeImageUrl(coverPhoto.thumbnailUrl || coverPhoto.url)}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F] shrink-0 border border-[#EDEDED]">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-sm sm:text-base text-[#1D1D1F]">
                        {prop.title || `New ${template.label} Draft`}
                      </h3>

                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F]">
                        {prop.customPropertyType || template.label}
                      </span>

                      {isDraft && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                          <Clock className="w-3 h-3" />
                          <span>Draft ({prop.completenessScore}% complete)</span>
                        </span>
                      )}

                      {isPublished && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Published</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#86868B] flex items-center gap-2 flex-wrap">
                      <span>Offering: {prop.rentalStructure.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span>Units: {prop.units?.length || 0}</span>
                      {prop.photos && prop.photos.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <Camera className="w-3 h-3" />
                            <span>{prop.photos.length} Photo{prop.photos.length > 1 ? 's' : ''}</span>
                          </span>
                        </>
                      )}
                      {(prop.location?.locality || prop.location?.city) && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-[#1D1D1F] font-medium">
                            <MapPin className="w-3 h-3 text-blue-600" />
                            {[prop.location?.locality, prop.location?.city].filter(Boolean).join(', ')}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    href={`/owner/dashboard/properties/new?draftId=${encodeURIComponent(prop.id)}`}
                    className="px-4 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
                  >
                    <span>{isDraft ? 'Continue Draft' : 'Manage'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
