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
  Check,
  Search,
  Copy,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Eye
} from 'lucide-react';
import type { Property, PropertyStatus, PropertyType } from '../../types';
import {
  getOwnerProperties,
  publishProperty,
  unpublishProperty,
  archiveProperty,
  restoreProperty,
  duplicateProperty
} from '../../api';
import { getPropertyTemplate, PROPERTY_TEMPLATES } from '../../templates';
import { getSafeImageUrl } from '../wizard/StepPhotos';
import { formatPricingDisplay } from '../../pricing';
import { determineNextIncompleteStep } from '../../completeness';
import LifecycleConfirmationModal, { LifecycleActionType } from '../dialogs/LifecycleConfirmationModal';
import PropertyQuickViewModal from '../dialogs/PropertyQuickViewModal';

type FilterTabKey = 'active' | 'published' | 'draft' | 'unpublished' | 'archived';

const ITEMS_PER_PAGE = 6;

export default function OwnerPropertiesView() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter and search state
  const [activeTab, setActiveTab] = useState<FilterTabKey>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Quick view modal state
  const [quickViewProperty, setQuickViewProperty] = useState<Property | null>(null);

  // Duplicating state tracker
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  // Lifecycle confirmation modal state
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

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, typeFilter]);

  // Compute status tab counts across the entire portfolio
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

  // Filtered properties based on active tab, property type, and search query
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // 1. Status Tab filter
      if (activeTab === 'active' && p.status === 'archived') return false;
      if (activeTab === 'published' && p.status !== 'published') return false;
      if (activeTab === 'draft' && p.status !== 'draft') return false;
      if (activeTab === 'unpublished' && p.status !== 'unpublished') return false;
      if (activeTab === 'archived' && p.status !== 'archived') return false;

      // 2. Property Type filter
      if (typeFilter !== 'all' && p.propertyType !== typeFilter) return false;

      // 3. Search query filter (title, city, locality, pincode)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const title = (p.title || '').toLowerCase();
        const city = (p.location?.city || '').toLowerCase();
        const locality = (p.location?.locality || '').toLowerCase();
        const pincode = (p.location?.pincode || '').toLowerCase();
        const matches =
          title.includes(query) ||
          city.includes(query) ||
          locality.includes(query) ||
          pincode.includes(query);
        if (!matches) return false;
      }

      return true;
    });
  }, [properties, activeTab, typeFilter, searchQuery]);

  // Paginated subset of filtered properties
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE) || 1;
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  // Handle Property Duplication
  const handleDuplicate = async (prop: Property) => {
    if (duplicatingId) return;
    try {
      setDuplicatingId(prop.id);
      const res = await duplicateProperty(prop.id);
      if (res.success && res.data) {
        const cloned = res.data;
        // Insert cloned draft at top of list
        setProperties((prev) => [cloned, ...prev]);
        setSuccessToast(`"${cloned.title}" was duplicated successfully as a new draft.`);
        setTimeout(() => setSuccessToast(null), 5000);
      } else {
        setError(res.error || 'Failed to duplicate property.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while duplicating property.');
    } finally {
      setDuplicatingId(null);
    }
  };

  // Open confirmation modal for lifecycle action
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

  // Execute confirmed lifecycle action
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

  // Clear all search and filter conditions
  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setActiveTab('active');
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
          className="px-5 py-3.5 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all shadow-sm shrink-0 active:scale-[0.98]"
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

      {/* ERROR STATE BANNER WITH RETRY */}
      {error && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchProperties}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shrink-0 active:scale-[0.98]"
          >
            Retry
          </button>
        </div>
      )}

      {/* FILTER CONTROLS BAR (SEARCH + TYPE + STATUS TABS) */}
      {!loading && properties.length > 0 && (
        <div className="space-y-3">
          {/* SEARCH & TYPE SELECTOR ROW */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* SEARCH INPUT */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, city, locality, pincode..."
                className="w-full pl-9.5 pr-8 py-2.5 rounded-2xl border border-[#EDEDED] bg-white text-xs sm:text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#1D1D1F] focus:ring-1 focus:ring-[#1D1D1F] transition-all shadow-apple-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-5 h-5 rounded-full bg-[#EDEDED] text-[#86868B] hover:text-[#1D1D1F] flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* PROPERTY TYPE DROPDOWN */}
            <div className="relative shrink-0 sm:w-52">
              <Filter className="w-3.5 h-3.5 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-2xl border border-[#EDEDED] bg-white text-xs sm:text-sm font-semibold text-[#1D1D1F] focus:outline-none focus:border-[#1D1D1F] focus:ring-1 focus:ring-[#1D1D1F] transition-all shadow-apple-xs cursor-pointer appearance-none"
              >
                <option value="all">All Property Types</option>
                {Object.values(PROPERTY_TEMPLATES).map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B]">
                ▼
              </div>
            </div>
          </div>

          {/* STATUS TABS */}
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
        </div>
      )}

      {/* SKELETON LOADING STATE */}
      {loading && (
        <div className="space-y-3.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-[#EDEDED] shadow-apple-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 rounded-xl bg-[#F5F5F7] shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-[#F5F5F7] rounded-md w-1/3" />
                  <div className="h-3 bg-[#F5F5F7] rounded-md w-1/2" />
                  <div className="h-3 bg-[#F5F5F7] rounded-md w-1/4" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-24 bg-[#F5F5F7] rounded-xl" />
                <div className="h-8 w-8 bg-[#F5F5F7] rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY PORTFOLIO STATE (GLOBAL) */}
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
              className="px-6 py-3.5 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all shadow-sm active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Your First Property</span>
            </Link>
          </div>
        </div>
      )}

      {/* EMPTY SEARCH / FILTER RESULTS */}
      {!loading && properties.length > 0 && filteredProperties.length === 0 && (
        <div className="bg-white rounded-3xl p-10 border border-[#EDEDED] shadow-apple-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] text-[#86868B] flex items-center justify-center mx-auto">
            {searchQuery ? <Search className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
          </div>
          <h4 className="text-sm font-bold text-[#1D1D1F]">
            {searchQuery
              ? 'No Matching Properties Found'
              : activeTab === 'draft'
              ? 'No Saved Drafts'
              : activeTab === 'published'
              ? 'No Published Properties'
              : activeTab === 'unpublished'
              ? 'No Unpublished Properties'
              : activeTab === 'archived'
              ? 'No Archived Properties'
              : 'No Properties Found'}
          </h4>
          <p className="text-xs text-[#86868B] max-w-sm mx-auto leading-relaxed">
            {searchQuery
              ? `No properties match "${searchQuery}"${typeFilter !== 'all' ? ` in ${typeFilter}` : ''}. Try adjusting your keywords or clearing filters.`
              : activeTab === 'draft'
              ? 'All your properties are either published, unpublished, or archived. Create a new draft anytime.'
              : activeTab === 'published'
              ? 'You have no live listings active for tenant searches. Complete and publish an active draft to get started.'
              : activeTab === 'unpublished'
              ? 'No properties are currently paused. Unpublished listings will appear here.'
              : activeTab === 'archived'
              ? 'Archived properties you have retired will be safely stored here for future restoration.'
              : 'No properties found for the selected criteria.'}
          </p>
          {(searchQuery || typeFilter !== 'all' || activeTab !== 'active') && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-xs font-bold text-[#1D1D1F] transition-all"
              >
                Clear Search & Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* PROPERTIES LIST (PAGINATED) */}
      {!loading && filteredProperties.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-3.5">
            {paginatedProperties.map((prop) => {
              const template = getPropertyTemplate(prop.propertyType);
              const isDraft = prop.status === 'draft';
              const isPublished = prop.status === 'published';
              const isUnpublished = prop.status === 'unpublished';
              const isArchived = prop.status === 'archived';
              const coverPhoto = prop.photos?.find((p) => p.isCover) || prop.photos?.[0];
              const nextStep = determineNextIncompleteStep(prop);

              return (
                <div
                  key={prop.id}
                  className="bg-white rounded-2xl p-5 border border-[#EDEDED] shadow-apple-sm hover:border-[#D1D1D6] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* LEFT: PHOTO + DETAILS */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {coverPhoto ? (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#F5F5F7] overflow-hidden shrink-0 border border-[#EDEDED] relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getSafeImageUrl(coverPhoto.thumbnailUrl || coverPhoto.url)}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F] shrink-0 border border-[#EDEDED]">
                        <Building2 className="w-7 h-7 text-[#86868B]" />
                      </div>
                    )}

                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* TITLE & BADGES */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-[#1D1D1F] truncate max-w-sm">
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

                      {/* DRAFT PROGRESS BAR (IF DRAFT) */}
                      {isDraft && (
                        <div className="flex items-center gap-2 max-w-xs pt-0.5">
                          <div className="flex-1 h-1.5 rounded-full bg-[#EDEDED] overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${prop.completenessScore}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-amber-800">
                            {prop.completenessScore}%
                          </span>
                        </div>
                      )}

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

                  {/* RIGHT: QUICK ACTIONS */}
                  <div className="flex items-center gap-1.5 self-end md:self-center flex-wrap shrink-0">
                    {/* QUICK VIEW (ALL STATUSES) */}
                    <button
                      type="button"
                      onClick={() => setQuickViewProperty(prop)}
                      className="p-2 rounded-xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] transition-all"
                      title="Quick Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* DUPLICATE ACTION (ALL STATUSES) */}
                    <button
                      type="button"
                      onClick={() => handleDuplicate(prop)}
                      disabled={duplicatingId === prop.id}
                      className="p-2 rounded-xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] transition-all disabled:opacity-50"
                      title="Duplicate Listing"
                    >
                      {duplicatingId === prop.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#1D1D1F]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* DRAFT ACTIONS */}
                    {isDraft && (
                      <>
                        <Link
                          href={`/owner/dashboard/properties/new?draftId=${encodeURIComponent(prop.id)}&step=${nextStep}`}
                          className="px-3.5 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                        >
                          <span>Continue Setup</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(prop, 'archive')}
                          className="p-2 rounded-xl border border-[#EDEDED] hover:bg-rose-50 hover:border-rose-200 text-[#86868B] hover:text-rose-600 transition-all"
                          title="Archive draft"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* PUBLISHED ACTIONS */}
                    {isPublished && (
                      <>
                        <Link
                          href={`/owner/dashboard/properties/new?draftId=${encodeURIComponent(prop.id)}&step=10`}
                          className="px-3 py-2 rounded-xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-bold transition-all inline-flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#86868B]" />
                          <span>Manage</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(prop, 'unpublish')}
                          className="px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/60 text-amber-800 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Unpublish</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(prop, 'archive')}
                          className="p-2 rounded-xl border border-[#EDEDED] hover:bg-rose-50 hover:border-rose-200 text-[#86868B] hover:text-rose-600 transition-all"
                          title="Archive listing"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* UNPUBLISHED ACTIONS */}
                    {isUnpublished && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(prop, 'publish')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Publish</span>
                        </button>

                        <Link
                          href={`/owner/dashboard/properties/new?draftId=${encodeURIComponent(prop.id)}&step=10`}
                          className="px-3 py-2 rounded-xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-bold transition-all inline-flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#86868B]" />
                          <span>Edit</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(prop, 'archive')}
                          className="p-2 rounded-xl border border-[#EDEDED] hover:bg-rose-50 hover:border-rose-200 text-[#86868B] hover:text-rose-600 transition-all"
                          title="Archive listing"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* ARCHIVED ACTIONS */}
                    {isArchived && (
                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(prop, 'restore')}
                        className="px-3.5 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="bg-white rounded-2xl p-4 border border-[#EDEDED] shadow-apple-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-[#86868B] font-semibold">
                Showing{' '}
                <span className="text-[#1D1D1F] font-bold">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredProperties.length)}
                </span>{' '}
                of <span className="text-[#1D1D1F] font-bold">{filteredProperties.length}</span> properties
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-[#EDEDED] hover:bg-[#F5F5F7] disabled:opacity-40 disabled:hover:bg-white text-xs font-bold text-[#1D1D1F] inline-flex items-center gap-1 transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-xl text-xs font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-[#1D1D1F] text-white shadow-apple-xs'
                          : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-[#EDEDED] hover:bg-[#F5F5F7] disabled:opacity-40 disabled:hover:bg-white text-xs font-bold text-[#1D1D1F] inline-flex items-center gap-1 transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUICK PREVIEW MODAL */}
      <PropertyQuickViewModal
        property={quickViewProperty}
        isOpen={Boolean(quickViewProperty)}
        onClose={() => setQuickViewProperty(null)}
      />

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
