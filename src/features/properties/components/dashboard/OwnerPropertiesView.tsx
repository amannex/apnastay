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
  Eye,
  ArrowUpDown,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
  MoreVertical
} from 'lucide-react';
import type { Property, PropertyStatus, PropertyType, PropertySortOption } from '../../types';
import {
  getOwnerProperties,
  publishProperty,
  unpublishProperty,
  archiveProperty,
  restoreProperty,
  deleteProperty
} from '../../api';
import { getPropertyTemplate } from '../../templates';
import { getSafeImageUrl } from '../wizard/StepPhotos';
import { formatPricingDisplay } from '../../pricing';
import { normalizePropertyError } from '../../errorMessages';
import LifecycleConfirmationModal, { LifecycleActionType } from '../dialogs/LifecycleConfirmationModal';
import PropertyPreviewModal from '../dialogs/PropertyPreviewModal';

type FilterTabKey = 'active' | 'published' | 'unlisted' | 'archived';

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

const PAGE_SIZE = 12;

export default function OwnerPropertiesView() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // 3-dot action menu active ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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

  // Close 3-dot menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeMenuId && !(e.target as Element).closest('[data-property-menu]')) {
        setActiveMenuId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuId(null);
      }
    };
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMenuId]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all properties (including archived) so tab counts are accurate
      const res = await getOwnerProperties('all');
      if (res.success && res.data) {
        setProperties(res.data);
      } else {
        const norm = normalizePropertyError(res.status, res, 'Failed to load your properties.');
        setError(norm.message + (norm.hint ? ` (${norm.hint})` : ''));
      }
    } catch (err: any) {
      const norm = normalizePropertyError(null, err, 'Network error while fetching properties.');
      setError(norm.message + (norm.hint ? ` (${norm.hint})` : ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    if (typeof window !== 'undefined') {
      const flash = window.sessionStorage?.getItem('apnastay_flash_toast');
      if (flash) {
        setSuccessToast(flash);
        window.sessionStorage?.removeItem('apnastay_flash_toast');
        setTimeout(() => setSuccessToast(null), 5000);
      }
    }
  }, []);

  // Reset pagination when filter criteria change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setActiveMenuId(null);
  }, [activeTab, searchQuery, selectedType, sortOption]);

  // Compute tab counts
  const counts = useMemo(() => {
    let active = 0;
    let published = 0;
    let unlisted = 0;
    let archived = 0;

    properties.forEach((p) => {
      if (p.status === 'archived') {
        archived++;
      } else {
        active++;
        if (p.status === 'published') published++;
        if (p.status === 'draft' || p.status === 'unpublished') unlisted++;
      }
    });

    return { active, published, unlisted, archived, total: properties.length };
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
        case 'unlisted':
          return p.status === 'draft' || p.status === 'unpublished';
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
    setActiveMenuId(null);
    setModalProperty(prop);
    setModalAction(action);
    setModalError(null);
  };

  // Open preview modal
  const handleOpenPreview = (prop: Property) => {
    setActiveMenuId(null);
    setPreviewProperty(prop);
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
      let res: any;
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
        case 'delete':
          res = await deleteProperty(modalProperty.id);
          break;
      }

      if (res.success) {
        if (modalAction === 'delete') {
          // Permanently remove from local property list
          setProperties((prev) => prev.filter((p) => p.id !== modalProperty.id));
          setSuccessToast(`"${modalProperty.title}" was permanently deleted.`);
        } else if (res.data) {
          // Update local property list
          const updated = res.data;
          setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

          const actionPastTense =
            modalAction === 'unpublish'
              ? 'unlisted'
              : modalAction === 'archive'
              ? 'archived'
              : modalAction === 'restore'
              ? 'restored to active listings'
              : 'published live';

          setSuccessToast(`"${modalProperty.title}" was successfully ${actionPastTense}.`);
        }
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
            Manage your houses, flats, PGs, and commercial spaces. Monitor listing completeness, manage drafts, and organize your portfolio.
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
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-fade-in"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchProperties}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shrink-0 focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:outline-none"
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
          <div
            role="tablist"
            aria-label="Filter properties by status"
            className="flex items-center gap-1 sm:gap-2 p-1.5 bg-[#F5F5F7] rounded-2xl overflow-x-auto border border-[#EDEDED] scrollbar-none"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'active'}
              onClick={() => setActiveTab('active')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:outline-none ${
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
              role="tab"
              aria-selected={activeTab === 'published'}
              onClick={() => setActiveTab('published')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:outline-none ${
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
              role="tab"
              aria-selected={activeTab === 'unlisted'}
              onClick={() => setActiveTab('unlisted')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:outline-none ${
                activeTab === 'unlisted'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              <span>Unlisted</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-50 text-[10px] font-extrabold text-amber-800">
                {counts.unlisted}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'archived'}
              onClick={() => setActiveTab('archived')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:outline-none ${
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

      {/* EMPTY TAB STATE: NO UNLISTED / NO PUBLISHED / NO ARCHIVED */}
      {!loading && properties.length > 0 && filteredAndSortedProperties.length === 0 && !isFiltered && (
        <div className="bg-white rounded-3xl p-10 border border-[#EDEDED] shadow-apple-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] text-[#86868B] flex items-center justify-center mx-auto">
            {activeTab === 'unlisted' ? (
              <Clock className="w-6 h-6 text-amber-600" />
            ) : activeTab === 'published' ? (
              <Sparkles className="w-6 h-6 text-emerald-600" />
            ) : (
              <Archive className="w-6 h-6 text-slate-500" />
            )}
          </div>
          <h4 className="text-sm font-bold text-[#1D1D1F]">
            {activeTab === 'unlisted'
              ? 'No Unlisted Properties'
              : activeTab === 'published'
              ? 'No Published Properties'
              : 'No Archived Properties'}
          </h4>
          <p className="text-xs text-[#86868B] max-w-sm mx-auto">
            {activeTab === 'unlisted'
              ? 'You have no unlisted properties. Drafts and paused listings will appear here.'
              : activeTab === 'published'
              ? 'None of your properties are currently published live to tenants.'
              : 'Archived properties are safely preserved here and can be restored anytime.'}
          </p>
          {activeTab === 'unlisted' && (
            <div className="pt-2">
              <Link
                href="/owner/dashboard/properties/new"
                className="px-4 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Start a New Listing</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* PROPERTIES GRID & CARDS */}
      {!loading && paginatedProperties.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 sm:gap-6">
          {paginatedProperties.map((prop) => {
            const template = getPropertyTemplate(prop.propertyType);
            const isDraft = prop.status === 'draft';
            const isPublished = prop.status === 'published';
            const isUnpublished = prop.status === 'unpublished';
            const isArchived = prop.status === 'archived';
            const coverPhoto = prop.photos?.find((p) => p.isCover) || prop.photos?.[0];
            const isMenuOpen = activeMenuId === prop.id;

            return (
              <div
                key={prop.id}
                className="bg-white rounded-3xl p-4 border border-[#EDEDED] shadow-apple-sm hover:shadow-apple-md hover:border-[#D1D1D6] transition-all duration-300 flex flex-col justify-between group relative"
              >
                {/* TOP: SQUARE FEATURED PHOTO THUMBNAIL */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F5F5F7] border border-[#EDEDED]/80 mb-3.5 select-none">
                  {coverPhoto ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={getSafeImageUrl(coverPhoto.thumbnailUrl || coverPhoto.url)}
                      alt={prop.title || 'Property photo'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                      onClick={() => handleOpenPreview(prop)}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center text-[#86868B] p-4 text-center cursor-pointer"
                      onClick={() => handleOpenPreview(prop)}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-apple-xs mb-2 border border-[#EDEDED]">
                        <Building2 className="w-6 h-6 text-[#1D1D1F]" />
                      </div>
                      <span className="text-xs font-semibold text-[#86868B]">No Photos Yet</span>
                    </div>
                  )}

                  {/* FLOATING STATUS BADGE (TOP-LEFT) */}
                  <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    {isDraft && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-500/90 text-white backdrop-blur-md shadow-sm">
                        <Clock className="w-3 h-3" />
                        <span>Draft ({prop.completenessScore}%)</span>
                      </span>
                    )}
                    {isPublished && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-600/90 text-white backdrop-blur-md shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>Published</span>
                      </span>
                    )}
                    {isUnpublished && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-zinc-800/80 text-white backdrop-blur-md shadow-sm">
                        <EyeOff className="w-3 h-3 text-zinc-300" />
                        <span>Unlisted</span>
                      </span>
                    )}
                    {isArchived && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-700/85 text-white backdrop-blur-md shadow-sm">
                        <Archive className="w-3 h-3 text-slate-300" />
                        <span>Archived</span>
                      </span>
                    )}
                  </div>

                  {/* FLOATING 3-DOT MENU BUTTON & DROPDOWN (TOP-RIGHT) */}
                  <div className="absolute top-3 right-3 z-20" data-property-menu>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : prop.id);
                      }}
                      aria-label="Property options"
                      aria-expanded={isMenuOpen}
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1D1D1F] backdrop-blur-md shadow-sm hover:shadow-md flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:outline-none"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* DROPDOWN MENU */}
                    {isMenuOpen && (
                      <div
                        className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-[#EDEDED] shadow-apple-lg p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* DRAFT ACTIONS */}
                        {isDraft && (
                          <div className="space-y-0.5">
                            <Link
                              href={`/owner/dashboard/properties/${prop.id}/edit`}
                              onClick={() => setActiveMenuId(null)}
                              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center gap-2 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#86868B]" />
                              <span>Continue Setup</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleOpenPreview(prop)}
                              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center gap-2 transition-colors text-left"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#86868B]" />
                              <span>Quick Preview</span>
                            </button>

                            {prop.completenessScore >= 80 && (
                              <button
                                type="button"
                                onClick={() => handleOpenActionModal(prop, 'publish')}
                                className="w-full px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition-colors text-left"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Publish Live</span>
                              </button>
                            )}

                            <div className="my-1 border-t border-[#EDEDED]" />

                            <button
                              type="button"
                              onClick={() => handleOpenActionModal(prop, 'archive')}
                              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center gap-2 transition-colors text-left"
                            >
                              <Archive className="w-3.5 h-3.5 text-[#86868B]" />
                              <span>Archive Draft</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenActionModal(prop, 'delete')}
                              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Delete Permanently</span>
                            </button>
                          </div>
                        )}

                        {/* PUBLISHED ACTIONS */}
                        {isPublished && (
                          <div className="space-y-0.5">
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(prop)}
                              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center gap-2 transition-colors text-left"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#86868B]" />
                              <span>Quick Preview</span>
                            </button>

                            <Link
                              href={`/owner/dashboard/properties/${prop.id}/edit`}
                              onClick={() => setActiveMenuId(null)}
                              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center gap-2 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#86868B]" />
                              <span>Manage / Edit</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleOpenActionModal(prop, 'unpublish')}
                              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2 transition-colors text-left"
                            >
                              <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                              <span>Unlist (Pause)</span>
                            </button>

                            <div className="my-1 border-t border-[#EDEDED]" />

                            <button
                              type="button"
                              onClick={() => handleOpenActionModal(prop, 'archive')}
                              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center gap-2 transition-colors text-left"
                            >
                              <Archive className="w-3.5 h-3.5 text-[#86868B]" />
                              <span>Archive Listing</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenActionModal(prop, 'delete')}
                              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Delete Permanently</span>
                            </button>
                          </div>
                        )}

                        {/* UNPUBLISHED ACTIONS */}
                        {isUnpublished && (
                          <div className="space-y-0.5">
                            <button
                              type="button"
                              onClick={() => handleOpenActionModal(prop, 'publish')}
                              className="w-full px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition-colors text-left"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Publish Live</span>
                            </button>

                            <Link
                              href={`/owner/dashboard/properties/${prop.id}/edit`}
                              onClick={() => setActiveMenuId(null)}
                              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center gap-2 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#86868B]" />
                              <span>Edit Listing</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleOpenPreview(prop)}
                              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center gap-2 transition-colors text-left"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#86868B]" />
                              <span>Quick Preview</span>
                            </button>

                            <div className="my-1 border-t border-[#EDEDED]" />

                            <button
                              type="button"
                              onClick={() => handleOpenActionModal(prop, 'archive')}
                              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center gap-2 transition-colors text-left"
                            >
                              <Archive className="w-3.5 h-3.5 text-[#86868B]" />
                              <span>Archive Listing</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenActionModal(prop, 'delete')}
                              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Delete Permanently</span>
                            </button>
                          </div>
                        )}

                        {/* ARCHIVED ACTIONS */}
                        {isArchived && (
                          <div className="space-y-0.5">
                            <button
                              type="button"
                              onClick={() => handleOpenActionModal(prop, 'restore')}
                              className="w-full px-3 py-2 rounded-xl text-xs font-bold text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center gap-2 transition-colors text-left"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-[#1D1D1F]" />
                              <span>Restore Listing</span>
                            </button>

                            <div className="my-1 border-t border-[#EDEDED]" />

                            <button
                              type="button"
                              onClick={() => handleOpenActionModal(prop, 'delete')}
                              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Delete Permanently</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* FLOATING PHOTO COUNT (BOTTOM-LEFT) */}
                  {prop.photos && prop.photos.length > 0 && (
                    <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md shadow-sm">
                        <Camera className="w-3 h-3" />
                        <span>{prop.photos.length}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* DETAILS BELOW THUMBNAIL */}
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    {/* TITLE */}
                    <h3
                      onClick={() => handleOpenPreview(prop)}
                      className="font-bold text-sm sm:text-base text-[#1D1D1F] line-clamp-1 hover:text-[#FF385C] cursor-pointer transition-colors"
                      title={prop.title || `New ${template.label} Draft`}
                    >
                      {prop.title || `New ${template.label} Draft`}
                    </h3>

                    {/* LOCATION */}
                    <div className="flex items-center gap-1 text-xs text-[#86868B] mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      <span className="truncate">
                        {[prop.location?.locality, prop.location?.city].filter(Boolean).join(', ') || 'Location Pending'}
                      </span>
                    </div>

                    {/* STRUCTURE & UNITS BADGES */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#86868B] mt-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-[#F5F5F7] text-[#1D1D1F] font-bold text-[10px] uppercase">
                        {prop.customPropertyType || template.label}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{prop.rentalStructure.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span>{prop.units?.length || 0} Unit{prop.units?.length === 1 ? '' : 's'}</span>
                    </div>
                  </div>

                  {/* DRAFT COMPLETENESS PROGRESS BAR */}
                  {isDraft && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] mb-1">
                        <span>Completeness</span>
                        <span>{prop.completenessScore}%</span>
                      </div>
                      <div className="h-1.5 bg-[#EDEDED] rounded-full overflow-hidden">
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
                    </div>
                  )}

                  {/* PRICE & PREVIEW FOOTER */}
                  <div className="pt-2.5 mt-2 border-t border-[#EDEDED] flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase text-[#86868B] font-bold block">
                        Rent
                      </span>
                      <span className="font-extrabold text-sm sm:text-base text-[#1D1D1F]">
                        {prop.pricing
                          ? formatPricingDisplay(prop.pricing, prop.pricing.monthlyRent || 0)
                          : 'Price Pending'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenPreview(prop)}
                      className="text-xs font-bold text-[#86868B] hover:text-[#1D1D1F] px-2.5 py-1.5 rounded-xl hover:bg-[#F5F5F7] transition-all inline-flex items-center gap-1 border border-transparent hover:border-[#EDEDED]"
                      title="Quick Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

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
      </>
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
