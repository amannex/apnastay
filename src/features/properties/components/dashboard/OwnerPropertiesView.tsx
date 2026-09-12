'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Camera,
  Archive,
  EyeOff,
  RotateCcw,
  IndianRupee,
  Edit3,
  Calendar,
  Check
} from 'lucide-react';
import type { Property, PropertyStatus } from '../../types';
import {
  getOwnerProperties,
  publishProperty,
  unpublishProperty,
  archiveProperty,
  restoreProperty
} from '../../api';
import { getPropertyTemplate } from '../../templates';
import { getSafeImageUrl } from '../wizard/StepPhotos';
import { formatPricingDisplay } from '../../pricing';
import LifecycleConfirmationModal, { LifecycleActionType } from '../dialogs/LifecycleConfirmationModal';

type FilterTabKey = 'active' | 'published' | 'draft' | 'unpublished' | 'archived';

export default function OwnerPropertiesView() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Active filter tab
  const [activeTab, setActiveTab] = useState<FilterTabKey>('active');

  // Confirmation modal state
  const [modalProperty, setModalProperty] = useState<Property | null>(null);
  const [modalAction, setModalAction] = useState<LifecycleActionType | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all properties (including archived) so tab counts are accurate
      const res = await getOwnerProperties('all');
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
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Compute tab counts
  const counts = useMemo(() => {
    let active = 0;
    let published = 0;
    let draft = 0;
    let unpublished = 0;
    let archived = 0;

    properties.forEach((p) => {
      if (p.status === 'archived') {
        archived++;
      } else {
        active++;
        if (p.status === 'published') published++;
        if (p.status === 'draft') draft++;
        if (p.status === 'unpublished') unpublished++;
      }
    });

    return { active, published, draft, unpublished, archived, total: properties.length };
  }, [properties]);

  // Filtered properties for the active tab
  const filteredProperties = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return properties.filter((p) => p.status !== 'archived');
      case 'published':
        return properties.filter((p) => p.status === 'published');
      case 'draft':
        return properties.filter((p) => p.status === 'draft');
      case 'unpublished':
        return properties.filter((p) => p.status === 'unpublished');
      case 'archived':
        return properties.filter((p) => p.status === 'archived');
      default:
        return properties.filter((p) => p.status !== 'archived');
    }
  }, [properties, activeTab]);

  // Open confirmation modal for an action
  const handleOpenActionModal = (prop: Property, action: LifecycleActionType) => {
    setModalProperty(prop);
    setModalAction(action);
    setModalError(null);
  };

  // Close confirmation modal
  const handleCloseModal = () => {
    if (isProcessingAction) return;
    setModalProperty(null);
    setModalAction(null);
    setModalError(null);
  };

  // Execute confirmed action
  const handleExecuteModalAction = async () => {
    if (!modalProperty || !modalAction) return;

    setIsProcessingAction(true);
    setModalError(null);

    try {
      let res;
      switch (modalAction) {
        case 'unpublish':
          res = await unpublishProperty(modalProperty.id);
          break;
        case 'archive':
          res = await archiveProperty(modalProperty.id);
          break;
        case 'restore':
          res = await restoreProperty(modalProperty.id);
          break;
        case 'publish':
          res = await publishProperty(modalProperty.id, { strict: true });
          break;
      }

      if (res.success && res.data) {
        // Update local property list
        const updated = res.data;
        setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

        const actionPastTense =
          modalAction === 'unpublish'
            ? 'unpublished'
            : modalAction === 'archive'
            ? 'archived'
            : modalAction === 'restore'
            ? 'restored to active listings'
            : 'published live';

        setSuccessToast(`"${modalProperty.title}" was successfully ${actionPastTense}.`);
        setTimeout(() => setSuccessToast(null), 4000);
        handleCloseModal();
      } else {
        setModalError(res.error || `Failed to ${modalAction} property.`);
      }
    } catch (err: any) {
      setModalError(err.message || `An unexpected error occurred while performing ${modalAction}.`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Format relative or friendly date
  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER WITH PORTFOLIO SUMMARY & CTA */}
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
            Manage your houses, flats, PGs, and commercial spaces. Monitor listing completeness, publish live, or manage drafts.
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

      {/* TOAST SUCCESS BANNER */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FILTER TABS */}
      {!loading && properties.length > 0 && (
        <div className="flex items-center gap-1 sm:gap-2 p-1.5 bg-[#F5F5F7] rounded-2xl overflow-x-auto border border-[#EDEDED] scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 ${
              activeTab === 'active'
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <span>All Active</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#EDEDED] text-[10px] font-extrabold text-[#1D1D1F]">
              {counts.active}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('published')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 ${
              activeTab === 'published'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <span>Published</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-50 text-[10px] font-extrabold text-emerald-700">
              {counts.published}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('draft')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 ${
              activeTab === 'draft'
                ? 'bg-white text-amber-800 shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <span>Drafts</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-50 text-[10px] font-extrabold text-amber-800">
              {counts.draft}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('unpublished')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 ${
              activeTab === 'unpublished'
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <span>Unpublished</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#EDEDED] text-[10px] font-extrabold text-[#1D1D1F]">
              {counts.unpublished}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('archived')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 ${
              activeTab === 'archived'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archived</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] font-extrabold text-slate-700">
              {counts.archived}
            </span>
          </button>
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

      {/* EMPTY PORTFOLIO STATE */}
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

      {/* EMPTY TAB STATE */}
      {!loading && properties.length > 0 && filteredProperties.length === 0 && (
        <div className="bg-white rounded-3xl p-10 border border-[#EDEDED] shadow-apple-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] text-[#86868B] flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[#1D1D1F]">
            No {activeTab === 'archived' ? 'archived' : activeTab} properties
          </h4>
          <p className="text-xs text-[#86868B]">
            {activeTab === 'archived'
              ? 'Archived listings will appear here when you choose to archive them.'
              : `You have no properties currently marked as ${activeTab}.`}
          </p>
        </div>
      )}

      {/* PROPERTIES LIST */}
      {!loading && filteredProperties.length > 0 && (
        <div className="space-y-3.5">
          {filteredProperties.map((prop) => {
            const template = getPropertyTemplate(prop.propertyType);
            const isDraft = prop.status === 'draft';
            const isPublished = prop.status === 'published';
            const isUnpublished = prop.status === 'unpublished';
            const isArchived = prop.status === 'archived';
            const coverPhoto = prop.photos?.find((p) => p.isCover) || prop.photos?.[0];

            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl p-5 border border-[#EDEDED] shadow-apple-sm hover:border-[#D1D1D6] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* LEFT: PHOTO + DETAILS */}
                <div className="flex items-start gap-4">
                  {coverPhoto ? (
                    <div className="w-16 h-16 rounded-xl bg-[#F5F5F7] overflow-hidden shrink-0 border border-[#EDEDED] relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getSafeImageUrl(coverPhoto.thumbnailUrl || coverPhoto.url)}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F] shrink-0 border border-[#EDEDED]">
                      <Building2 className="w-7 h-7 text-[#86868B]" />
                    </div>
                  )}

                  <div className="space-y-1">
                    {/* TITLE & BADGES */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-[#1D1D1F]">
                        {prop.title || `New ${template.label} Draft`}
                      </h3>

                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F]">
                        {prop.customPropertyType || template.label}
                      </span>

                      {/* STATUS BADGES */}
                      {isDraft && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Draft ({prop.completenessScore}% complete)</span>
                        </span>
                      )}

                      {isPublished && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span>Published Live</span>
                        </span>
                      )}

                      {isUnpublished && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                          <EyeOff className="w-3 h-3 text-zinc-500" />
                          <span>Unpublished (Private)</span>
                        </span>
                      )}

                      {isArchived && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          <Archive className="w-3 h-3 text-slate-500" />
                          <span>Archived</span>
                        </span>
                      )}
                    </div>

                    {/* METADATA LINE */}
                    <div className="text-xs text-[#86868B] flex items-center gap-2 flex-wrap">
                      <span className="capitalize">{prop.rentalStructure.replace(/_/g, ' ')}</span>

                      <span>•</span>
                      <span>{prop.units?.length || 0} Unit{prop.units?.length === 1 ? '' : 's'}</span>

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
                            <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>{[prop.location?.locality, prop.location?.city].filter(Boolean).join(', ')}</span>
                          </span>
                        </>
                      )}

                      {/* BASIC PRICE */}
                      {prop.pricing && (
                        <>
                          <span>•</span>
                          <span className="font-extrabold text-emerald-700">
                            {formatPricingDisplay(prop.pricing, prop.pricing.monthlyRent || 0)}
                          </span>
                        </>
                      )}

                      {prop.updatedAt && (
                        <>
                          <span>•</span>
                          <span className="text-[11px] text-[#86868B]">
                            Updated {formatTimestamp(prop.updatedAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: ACTION BUTTONS */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-wrap shrink-0">
                  {/* DRAFT ACTIONS */}
                  {isDraft && (
                    <>
                      <Link
                        href={`/owner/dashboard/properties/new?draftId=${encodeURIComponent(prop.id)}`}
                        className="px-4 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <span>Continue Draft</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(prop, 'archive')}
                        className="px-3 py-2 rounded-xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#86868B] hover:text-rose-600 text-xs font-semibold transition-all"
                        title="Archive draft"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* PUBLISHED ACTIONS */}
                  {isPublished && (
                    <>
                      <Link
                        href={`/owner/dashboard/properties/new?draftId=${encodeURIComponent(prop.id)}&step=10`}
                        className="px-3.5 py-2 rounded-xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-bold transition-all inline-flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#86868B]" />
                        <span>Manage</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(prop, 'unpublish')}
                        className="px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/60 text-amber-800 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Unpublish</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(prop, 'archive')}
                        className="px-3 py-2 rounded-xl border border-[#EDEDED] hover:bg-rose-50 hover:border-rose-200 text-[#86868B] hover:text-rose-600 text-xs font-semibold transition-all"
                        title="Archive listing"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* UNPUBLISHED ACTIONS */}
                  {isUnpublished && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(prop, 'publish')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Publish</span>
                      </button>

                      <Link
                        href={`/owner/dashboard/properties/new?draftId=${encodeURIComponent(prop.id)}&step=10`}
                        className="px-3.5 py-2 rounded-xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-bold transition-all inline-flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#86868B]" />
                        <span>Edit</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(prop, 'archive')}
                        className="px-3 py-2 rounded-xl border border-[#EDEDED] hover:bg-rose-50 hover:border-rose-200 text-[#86868B] hover:text-rose-600 text-xs font-semibold transition-all"
                        title="Archive listing"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* ARCHIVED ACTIONS */}
                  {isArchived && (
                    <button
                      type="button"
                      onClick={() => handleOpenActionModal(prop, 'restore')}
                      className="px-4 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Listing</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONFIRMATION DIALOG MODAL */}
      <LifecycleConfirmationModal
        isOpen={Boolean(modalProperty && modalAction)}
        actionType={modalAction}
        propertyTitle={modalProperty?.title || 'Property'}
        onConfirm={handleExecuteModalAction}
        onCancel={handleCloseModal}
        isProcessing={isProcessingAction}
        errorMessage={modalError}
      />
    </div>
  );
}
