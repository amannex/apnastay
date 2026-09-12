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
  X,
  Copy,
  Eye,
  ArrowUpDown,
  Filter,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import type { Property, PropertyStatus, PropertyType, PropertySortOption } from '../../types';
import {
  getOwnerProperties,
  publishProperty,
  unpublishProperty,
  archiveProperty,
  restoreProperty,
  duplicateProperty
} from '../../api';
import { getPropertyTemplate } from '../../templates';
import { getSafeImageUrl } from '../wizard/StepPhotos';
import { formatPricingDisplay } from '../../pricing';
import LifecycleConfirmationModal, { LifecycleActionType } from '../dialogs/LifecycleConfirmationModal';
import PropertyPreviewModal from '../dialogs/PropertyPreviewModal';

type FilterTabKey = 'active' | 'published' | 'draft' | 'unpublished' | 'archived';

const PROPERTY_TYPES: { value: string; label: string }[] = [
  { value: 'all', label: 'All Property Types' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'Independent House' },
  { value: 'villa', label: 'Luxury Villa' },
  { value: 'pg', label: 'Paying Guest (PG)' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'coliving', label: 'Co-Living' },
  { value: 'building', label: 'Full Building' },
  { value: 'independent_floor', label: 'Independent Floor' },
  { value: 'room', label: 'Single Room' },
  { value: 'commercial', label: 'Commercial Space' },
  { value: 'other', label: 'Other' }
];

const SORT_OPTIONS: { value: PropertySortOption; label: string }[] = [
  { value: 'updated_desc', label: 'Recently Updated' },
  { value: 'title_asc', label: 'Title: A to Z' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'completeness_desc', label: 'Highest Completeness' }
];

const PAGE_SIZE = 8;

export default function OwnerPropertiesView() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<FilterTabKey>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortOption, setSortOption] = useState<PropertySortOption>('updated_desc');

  // Pagination (Load More)
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Confirmation modal state
  const [modalProperty, setModalProperty] = useState<Property | null>(null);
  const [modalAction, setModalAction] = useState<LifecycleActionType | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Quick Preview modal state
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);

  // Duplicating state
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

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

  // Reset pagination when filter criteria change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab, searchQuery, selectedType, sortOption]);

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

  // Filtered & Sorted properties
  const filteredAndSortedProperties = useMemo(() => {
    // 1. Filter by status tab
    let result = properties.filter((p) => {
      switch (activeTab) {
        case 'active':
          return p.status !== 'archived';
        case 'published':
          return p.status === 'published';
        case 'draft':
          return p.status === 'draft';
        case 'unpublished':
          return p.status === 'unpublished';
        case 'archived':
          return p.status === 'archived';
        default:
          return p.status !== 'archived';
      }
    });

    // 2. Filter by property type
    if (selectedType !== 'all') {
      result = result.filter((p) => p.propertyType === selectedType);
    }

    // 3. Search query filter (title, city, locality, street)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const cityMatch = (p.location?.city || '').toLowerCase().includes(q);
        const localityMatch = (p.location?.locality || '').toLowerCase().includes(q);
        const streetMatch = (p.location?.addressLine1 || '').toLowerCase().includes(q);
        const typeMatch = (p.propertyType || '').toLowerCase().includes(q);
        return titleMatch || cityMatch || localityMatch || streetMatch || typeMatch;
      });
    }

    // 4. Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'updated_desc':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'price_asc': {
          const priceA = a.pricing?.monthlyRent || 0;
          const priceB = b.pricing?.monthlyRent || 0;
          return priceA - priceB;
        }
        case 'price_desc': {
          const priceA = a.pricing?.monthlyRent || 0;
          const priceB = b.pricing?.monthlyRent || 0;
          return priceB - priceA;
        }
        case 'completeness_desc':
          return (b.completenessScore || 0) - (a.completenessScore || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [properties, activeTab, selectedType, searchQuery, sortOption]);

  // Paginated slice
  const paginatedProperties = useMemo(() => {
    return filteredAndSortedProperties.slice(0, visibleCount);
  }, [filteredAndSortedProperties, visibleCount]);

  const hasMoreToLoad = visibleCount < filteredAndSortedProperties.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

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

  // Duplicate property action
  const handleDuplicateProperty = async (prop: Property) => {
    try {
      setDuplicatingId(prop.id);
      const res = await duplicateProperty(prop.id);
      if (res.success && res.data) {
        const newDraft = res.data;
        setProperties((prev) => [newDraft, ...prev]);
        setSuccessToast(`Successfully duplicated "${prop.title}". Saved as a new draft.`);
        setTimeout(() => setSuccessToast(null), 4000);
        // Switch tab to draft if not currently on drafts or active
        if (activeTab === 'archived' || activeTab === 'published') {
          setActiveTab('draft');
        }
      } else {
        setError(res.error || 'Failed to duplicate property.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while duplicating property.');
    } finally {
      setDuplicatingId(null);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSortOption('updated_desc');
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

  const isFiltered = searchQuery.trim() !== '' || selectedType !== 'all';

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* HEADER WITH PORTFOLIO SUMMARY & CTA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Owner Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            My Properties
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-1 max-w-xl leading-relaxed">
            Manage your houses, flats, PGs, and commercial spaces. Monitor listing completeness, duplicate properties, or manage drafts.
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

      {/* ERROR STATE WITH RETRY */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchProperties}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* FILTER CONTROLS & TABS */}
      {!loading && properties.length > 0 && (
        <div className="space-y-4">
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

          {/* SEARCH, PROPERTY TYPE & SORT ROW */}
          <div className="bg-white rounded-2xl p-3 border border-[#EDEDED] shadow-apple-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* SEARCH INPUT */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search properties by title, city, locality..."
                className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#F5F5F7] border border-transparent focus:border-[#1D1D1F] focus:bg-white text-xs text-[#1D1D1F] placeholder:text-[#86868B] outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* PROPERTY TYPE SELECTOR */}
            <div className="flex items-center gap-2">
              <div className="relative min-w-[150px]">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 rounded-xl bg-[#F5F5F7] border border-transparent focus:border-[#1D1D1F] focus:bg-white text-xs font-semibold text-[#1D1D1F] outline-none cursor-pointer transition-all appearance-none"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <Filter className="w-3.5 h-3.5 text-[#86868B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* SORT SELECTOR */}
              <div className="relative min-w-[160px]">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as PropertySortOption)}
                  className="w-full pl-3 pr-8 py-2 rounded-xl bg-[#F5F5F7] border border-transparent focus:border-[#1D1D1F] focus:bg-white text-xs font-semibold text-[#1D1D1F] outline-none cursor-pointer transition-all appearance-none"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-[#86868B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* CLEAR BUTTON IF ACTIVE */}
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-2.5 py-2 rounded-xl text-xs font-semibold text-[#86868B] hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                  title="Reset filters"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SKELETON LOADING STATE */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl p-5 border border-[#EDEDED] shadow-apple-sm animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 rounded-xl bg-[#F5F5F7] shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-[#F5F5F7] rounded w-1/3" />
                  <div className="h-3 bg-[#F5F5F7] rounded w-2/3" />
                  <div className="h-3 bg-[#F5F5F7] rounded w-1/4" />
                </div>
              </div>
              <div className="w-28 h-8 bg-[#F5F5F7] rounded-xl self-end sm:self-center" />
            </div>
          ))}
        </div>
      )}

      {/* EMPTY PORTFOLIO STATE (NO PROPERTIES AT ALL) */}
      {!loading && properties.length === 0 && (
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-[#EDEDED] shadow-apple-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#F5F5F7] text-[#86868B] flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8 text-[#1D1D1F]" />
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

      {/* EMPTY STATE: NO SEARCH/FILTER RESULTS */}
      {!loading && properties.length > 0 && filteredAndSortedProperties.length === 0 && isFiltered && (
        <div className="bg-white rounded-3xl p-10 border border-[#EDEDED] shadow-apple-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] text-[#86868B] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[#1D1D1F]">
            No Properties Match Your Search
          </h4>
          <p className="text-xs text-[#86868B] max-w-sm mx-auto">
            We couldn’t find any properties matching your current search query or type filters.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-xl bg-[#F5F5F7] hover:bg-[#EDEDED] text-[#1D1D1F] text-xs font-bold transition-all inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Search & Filters</span>
            </button>
          </div>
        </div>
      )}

      {/* EMPTY TAB STATE: NO DRAFTS / NO PUBLISHED / NO ARCHIVED */}
      {!loading && properties.length > 0 && filteredAndSortedProperties.length === 0 && !isFiltered && (
        <div className="bg-white rounded-3xl p-10 border border-[#EDEDED] shadow-apple-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] text-[#86868B] flex items-center justify-center mx-auto">
            {activeTab === 'draft' ? (
              <Clock className="w-6 h-6 text-amber-600" />
            ) : activeTab === 'published' ? (
              <Sparkles className="w-6 h-6 text-emerald-600" />
            ) : (
              <Archive className="w-6 h-6 text-slate-500" />
            )}
          </div>
          <h4 className="text-sm font-bold text-[#1D1D1F]">
            {activeTab === 'draft'
              ? 'No Saved Drafts'
              : activeTab === 'published'
              ? 'No Published Properties'
              : activeTab === 'archived'
              ? 'No Archived Properties'
              : 'No Unpublished Properties'}
          </h4>
          <p className="text-xs text-[#86868B] max-w-sm mx-auto">
            {activeTab === 'draft'
              ? 'You have no incomplete drafts. In-progress properties will appear here.'
              : activeTab === 'published'
              ? 'None of your properties are currently published live to tenants.'
              : activeTab === 'archived'
              ? 'Archived properties are safely preserved here and can be restored anytime.'
              : 'You have no listings in unpublished private status.'}
          </p>
          {activeTab === 'draft' && (
            <div className="pt-2">
              <Link
                href="/owner/dashboard/properties/new"
                className="px-4 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Start a New Draft</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* PROPERTIES LIST & CARDS */}
      {!loading && paginatedProperties.length > 0 && (
        <div className="space-y-3.5">
          {paginatedProperties.map((prop) => {
            const template = getPropertyTemplate(prop.propertyType);
            const isDraft = prop.status === 'draft';
            const isPublished = prop.status === 'published';
            const isUnpublished = prop.status === 'unpublished';
            const isArchived = prop.status === 'archived';
            const coverPhoto = prop.photos?.find((p) => p.isCover) || prop.photos?.[0];
            const isDuplicating = duplicatingId === prop.id;

            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl p-5 border border-[#EDEDED] shadow-apple-sm hover:border-[#D1D1D6] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* LEFT: PHOTO + DETAILS */}
                <div className="flex items-start gap-4 flex-1">
                  {coverPhoto ? (
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#F5F5F7] overflow-hidden shrink-0 border border-[#EDEDED] relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getSafeImageUrl(coverPhoto.thumbnailUrl || coverPhoto.url)}
                        alt="Cover"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F] shrink-0 border border-[#EDEDED]">
                      <Building2 className="w-8 h-8 text-[#86868B]" />
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* TITLE & BADGES */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-[#1D1D1F] truncate max-w-md">
                        {prop.title || `New ${template.label} Draft`}
                      </h3>

                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] shrink-0">
                        {prop.customPropertyType || template.label}
                      </span>

                      {/* STATUS BADGES */}
                      {isDraft && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Draft ({prop.completenessScore}% complete)</span>
                        </span>
                      )}

                      {isPublished && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span>Published Live</span>
                        </span>
                      )}

                      {isUnpublished && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
                          <EyeOff className="w-3 h-3 text-zinc-500" />
                          <span>Unpublished</span>
                        </span>
                      )}

                      {isArchived && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
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

                    {/* COMPLETENESS PROGRESS BAR (FOR DRAFTS) */}
                    {isDraft && (
                      <div className="pt-1 max-w-xs flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#EDEDED] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              (prop.completenessScore || 0) >= 80
                                ? 'bg-emerald-600'
                                : (prop.completenessScore || 0) >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.max(10, prop.completenessScore || 15)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#86868B] shrink-0">
                          {prop.completenessScore}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: ACTION TOOLBAR */}
                <div className="flex items-center gap-2 self-end md:self-center flex-wrap shrink-0">
                  {/* PREVIEW BUTTON (AVAILABLE FOR DRAFT, PUBLISHED, UNPUBLISHED) */}
                  {!isArchived && (
                    <button
                      type="button"
                      onClick={() => setPreviewProperty(prop)}
                      className="px-3 py-2 rounded-xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-bold transition-all inline-flex items-center gap-1.5"
                      title="Quick Preview"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#86868B]" />
                      <span className="hidden sm:inline">Preview</span>
                    </button>
                  )}

                  {/* DUPLICATE BUTTON */}
                  {!isArchived && (
                    <button
                      type="button"
                      onClick={() => handleDuplicateProperty(prop)}
                      disabled={isDuplicating}
                      className="px-3 py-2 rounded-xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-bold transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                      title="Duplicate Listing"
                    >
                      {isDuplicating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#86868B]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#86868B]" />
                      )}
                      <span className="hidden sm:inline">Duplicate</span>
                    </button>
                  )}

                  {/* DRAFT ACTIONS */}
                  {isDraft && (
                    <>
                      <Link
                        href={`/owner/dashboard/properties/${prop.id}/edit`}
                        className="px-4 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                      >
                        <span>Continue Setup</span>
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
                        href={`/owner/dashboard/properties/${prop.id}/edit`}
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
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Publish</span>
                      </button>

                      <Link
                        href={`/owner/dashboard/properties/${prop.id}/edit`}
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
                      className="px-4 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Listing</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* PAGINATION / LOAD MORE */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#86868B]">
            <div>
              Showing <span className="font-bold text-[#1D1D1F]">{paginatedProperties.length}</span> of{' '}
              <span className="font-bold text-[#1D1D1F]">{filteredAndSortedProperties.length}</span> properties
            </div>

            {hasMoreToLoad && (
              <button
                type="button"
                onClick={handleLoadMore}
                className="px-5 py-2.5 rounded-xl border border-[#EDEDED] bg-white hover:bg-[#F5F5F7] text-xs font-bold text-[#1D1D1F] transition-all shadow-apple-xs active:scale-[0.98]"
              >
                Load More Properties
              </button>
            )}
          </div>
        </div>
      )}

      {/* QUICK PREVIEW MODAL */}
      <PropertyPreviewModal
        isOpen={Boolean(previewProperty)}
        property={previewProperty}
        onClose={() => setPreviewProperty(null)}
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
