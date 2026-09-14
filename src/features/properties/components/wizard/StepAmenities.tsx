'use client';

import React, { useState, useMemo } from 'react';
import {
  Wifi,
  Droplets,
  Zap,
  ShieldCheck,
  Video,
  Wind,
  Fan,
  Tv,
  Refrigerator,
  Flame,
  ArrowUpDown,
  Car,
  Bike,
  Maximize,
  Sun,
  Utensils,
  Users,
  Dumbbell,
  Trees,
  Waves,
  Soup,
  Shirt,
  Sparkles,
  Brush,
  Check,
  Plus,
  X,
  Trash2,
  Edit3,
  Search,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  HelpCircle,
  Layers,
  Sparkle
} from 'lucide-react';
import type { PropertyType, AmenityDefinition } from '../../types';
import {
  AMENITY_CATEGORIES,
  AMENITY_REGISTRY,
  getAmenitiesByCategory,
  getSuggestedAmenitiesForProperty,
  validateCustomAmenity,
  sanitizeCustomAmenity
} from '../../amenities';

// Mapping icon strings to Lucide components safely
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi,
  Droplets,
  Zap,
  ShieldCheck,
  Video,
  Wind,
  Fan,
  Tv,
  Refrigerator,
  Flame,
  ArrowUpDown,
  Car,
  Bike,
  Maximize,
  Sun,
  Utensils,
  Users,
  Dumbbell,
  Trees,
  Waves,
  Soup,
  Shirt,
  Sparkles,
  Brush
};

function renderAmenityIcon(iconName?: string, className: string = 'w-5 h-5') {
  if (iconName && ICON_MAP[iconName]) {
    const IconComponent = ICON_MAP[iconName];
    return <IconComponent className={className} />;
  }
  return <Sparkles className={className} />;
}

export interface StepAmenitiesProps {
  propertyType?: PropertyType | null;
  customPropertyType?: string;
  initialAmenities?: string[];
  initialCustomAmenities?: string[];
  onBack: (amenities: string[], customAmenities: string[]) => void;
  onSave: (amenities: string[], customAmenities: string[]) => Promise<void> | void;
  isSaving?: boolean;
}

export default function StepAmenities({
  propertyType,
  customPropertyType,
  initialAmenities = [],
  initialCustomAmenities = [],
  onBack,
  onSave,
  isSaving = false
}: StepAmenitiesProps) {
  // State for selected standard amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialAmenities);

  // State for custom amenities
  const [customAmenities, setCustomAmenities] = useState<string[]>(initialCustomAmenities);

  // Custom amenity input state
  const [newCustomName, setNewCustomName] = useState('');
  const [customInputError, setCustomInputError] = useState<string | null>(null);
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // Editing custom amenity state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editCustomName, setEditCustomName] = useState('');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Suggested amenities for current property type
  const suggestedAmenities = useMemo(() => {
    return getSuggestedAmenitiesForProperty(propertyType);
  }, [propertyType]);

  // Grouped standard amenities
  const groupedAmenities = useMemo(() => {
    return getAmenitiesByCategory();
  }, []);

  // Filtered amenities by search
  const filteredAmenitiesByCategory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return groupedAmenities;

    const filtered: Record<string, AmenityDefinition[]> = {};
    for (const cat of AMENITY_CATEGORIES) {
      filtered[cat.id] = (groupedAmenities[cat.id] || []).filter(
        (amenity) =>
          amenity.name.toLowerCase().includes(q) ||
          amenity.description?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [groupedAmenities, searchQuery]);

  // Toggle standard amenity
  const handleToggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle all amenities in a category
  const handleToggleCategory = (catId: string) => {
    const catItems = groupedAmenities[catId as keyof typeof groupedAmenities] || [];
    const catItemIds = catItems.map((a) => a.id);
    const allSelected = catItemIds.every((id) => selectedAmenities.includes(id));

    if (allSelected) {
      // Deselect all in category
      setSelectedAmenities((prev) => prev.filter((id) => !catItemIds.includes(id)));
    } else {
      // Select all in category
      const toAdd = catItemIds.filter((id) => !selectedAmenities.includes(id));
      setSelectedAmenities((prev) => [...prev, ...toAdd]);
    }
  };

  // Add custom amenity
  const handleAddCustom = () => {
    setCustomInputError(null);
    const validation = validateCustomAmenity(
      newCustomName,
      selectedAmenities,
      customAmenities
    );

    if (!validation.valid) {
      setCustomInputError(validation.error || 'Invalid amenity name');
      return;
    }

    setCustomAmenities((prev) => [...prev, validation.sanitized]);
    setNewCustomName('');
    setIsAddingCustom(false);
  };

  // Start editing custom amenity
  const handleStartEditCustom = (index: number) => {
    setEditingIndex(index);
    setEditCustomName(customAmenities[index]);
  };

  // Save edited custom amenity
  const handleSaveEditCustom = () => {
    if (editingIndex === null) return;
    const sanitized = sanitizeCustomAmenity(editCustomName);
    if (!sanitized || sanitized.length < 2) {
      return;
    }

    // Check if duplicate of another custom item
    const otherCustom = customAmenities.filter((_, idx) => idx !== editingIndex);
    const validation = validateCustomAmenity(sanitized, selectedAmenities, otherCustom);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setCustomAmenities((prev) => {
      const updated = [...prev];
      updated[editingIndex] = validation.sanitized;
      return updated;
    });
    setEditingIndex(null);
    setEditCustomName('');
  };

  // Remove custom amenity
  const handleRemoveCustom = (index: number) => {
    setCustomAmenities((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handle Save
  const handleSave = () => {
    onSave(selectedAmenities, customAmenities);
  };

  const totalSelectedCount = selectedAmenities.length + customAmenities.length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="border-b border-[#EDEDED] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
              Amenities & Facilities
            </h2>
            <p className="text-xs sm:text-sm text-[#86868B] mt-1">
              Select all features available for your tenants.
            </p>
          </div>

          {/* TOTAL SELECTED COUNTER BADGE */}
          <div className="self-start sm:self-auto shrink-0 flex items-center gap-2 bg-[#F5F5F7] px-3.5 py-1.5 rounded-xl border border-[#EDEDED]">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-[#1D1D1F]">
              <span className="text-primary font-extrabold">{totalSelectedCount}</span> selected
            </span>
          </div>
        </div>
      </div>

      {/* SUGGESTED FOR YOUR PROPERTY (SMART SUGGESTIONS PILL ROW) */}
      {suggestedAmenities.length > 0 && (
        <div className="bg-[#FAFAFA] p-4 sm:p-5 rounded-2xl border border-[#EDEDED] space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider">
              Popular for {customPropertyType || propertyType?.toUpperCase() || 'Your Property'}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 pt-0.5">
            {suggestedAmenities.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity.id);
              return (
                <button
                  key={`suggested-${amenity.id}`}
                  type="button"
                  onClick={() => handleToggleAmenity(amenity.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm hover:bg-primary-hover'
                      : 'bg-white text-[#1D1D1F] border border-[#EDEDED] hover:border-[#D1D1D6]'
                  }`}
                >
                  <span className={isSelected ? 'text-white' : 'text-primary'}>
                    {renderAmenityIcon(amenity.iconName, 'w-3.5 h-3.5')}
                  </span>
                  <span>{amenity.name}</span>
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-[#86868B]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#86868B] absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search amenities (e.g., WiFi, AC, Lift, Parking, Food...)"
          className="w-full pl-11 pr-4 py-3 bg-white border border-[#EDEDED] rounded-xl text-xs sm:text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] p-1 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* CATEGORIZED AMENITIES GRID */}
      <div className="space-y-8">
        {AMENITY_CATEGORIES.map((cat) => {
          const amenitiesInCat = filteredAmenitiesByCategory[cat.id] || [];
          if (amenitiesInCat.length === 0 && searchQuery) {
            return null;
          }

          const catItemIds = (groupedAmenities[cat.id] || []).map((a) => a.id);
          const allSelectedInCat =
            catItemIds.length > 0 && catItemIds.every((id) => selectedAmenities.includes(id));

          return (
            <div
              key={cat.id}
              className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EDEDED] shadow-apple-sm space-y-4"
            >
              {/* CATEGORY HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F5F5F7]">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#1D1D1F]">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-[#86868B] mt-0.5">{cat.description}</p>
                </div>

                {/* SELECT ALL / DESELECT ALL ACTION */}
                <button
                  type="button"
                  onClick={() => handleToggleCategory(cat.id)}
                  className="self-start sm:self-auto text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors px-2.5 py-1 rounded-lg hover:bg-emerald-50"
                >
                  {allSelectedInCat ? 'Deselect all' : 'Select all'}
                </button>
              </div>

              {/* AMENITY ITEMS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {amenitiesInCat.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity.id);
                  return (
                    <div
                      key={amenity.id}
                      onClick={() => handleToggleAmenity(amenity.id)}
                      className={`relative flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-primary/[0.03] border-primary shadow-sm ring-1 ring-primary'
                          : 'bg-white border-[#EDEDED] hover:border-[#D1D1D6] hover:bg-[#FAFAFA]'
                      }`}
                    >
                      {/* ICON BOX */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-[#F5F5F7] text-[#1D1D1F]'
                        }`}
                      >
                        {renderAmenityIcon(amenity.iconName, 'w-5 h-5')}
                      </div>

                      {/* TEXT CONTENT */}
                      <div className="flex-1 min-w-0 pr-6">
                        <p className="text-xs sm:text-sm font-bold truncate leading-tight text-[#1D1D1F]">
                          {amenity.name}
                        </p>
                        {amenity.description && (
                          <p className="text-[11px] text-[#86868B] mt-1 line-clamp-2 leading-relaxed">
                            {amenity.description}
                          </p>
                        )}
                      </div>

                      {/* CHECKBOX INDICATOR */}
                      <div
                        className={`absolute top-4 right-4 w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-primary text-white'
                            : 'border border-[#D1D1D6] bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* CUSTOM AMENITIES SECTION */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EDEDED] shadow-apple-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F5F5F7]">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#1D1D1F]">
              Custom & Special Features
            </h3>
            <p className="text-xs text-[#86868B] mt-0.5">
              Have unique amenities like rooftop cafe, pool table, or library? Add them here.
            </p>
          </div>

          {!isAddingCustom && (
            <button
              type="button"
              onClick={() => {
                setIsAddingCustom(true);
                setCustomInputError(null);
              }}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1D1D1F] text-white text-xs font-bold hover:bg-[#333336] transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add another amenity</span>
            </button>
          )}
        </div>

        {/* INLINE ADD FORM */}
        {isAddingCustom && (
          <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1D1D1F]">
                Amenity or Feature Name:
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCustom(false);
                  setNewCustomName('');
                  setCustomInputError(null);
                }}
                className="text-xs text-[#86868B] hover:text-[#1D1D1F]"
              >
                Cancel
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={newCustomName}
                onChange={(e) => {
                  setNewCustomName(e.target.value);
                  setCustomInputError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
                placeholder="e.g., Rooftop Cafe, EV Charging, Table Tennis..."
                className="flex-1 px-4 py-2.5 bg-white border border-[#EDEDED] rounded-xl text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddCustom}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm shrink-0"
              >
                Save Amenity
              </button>
            </div>

            {customInputError && (
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{customInputError}</span>
              </p>
            )}
          </div>
        )}

        {/* CUSTOM AMENITIES CHIP LIST */}
        {customAmenities.length > 0 ? (
          <div className="flex flex-wrap gap-2.5 pt-2">
            {customAmenities.map((item, index) => {
              const isEditing = editingIndex === index;

              if (isEditing) {
                return (
                  <div
                    key={`edit-${index}`}
                    className="inline-flex items-center gap-1.5 bg-white border border-emerald-500 p-1 rounded-xl shadow-sm"
                  >
                    <input
                      type="text"
                      value={editCustomName}
                      onChange={(e) => setEditCustomName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveEditCustom();
                        }
                      }}
                      className="px-2 py-1 text-xs text-[#1D1D1F] focus:outline-none w-36"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveEditCustom}
                      className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      title="Save"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingIndex(null)}
                      className="p-1 rounded-lg text-[#86868B] hover:text-[#1D1D1F]"
                      title="Cancel"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={`custom-${index}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs font-bold text-[#1D1D1F] group hover:bg-emerald-100/70 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{item}</span>
                  <div className="flex items-center gap-1 ml-1 text-[#86868B]">
                    <button
                      type="button"
                      onClick={() => handleStartEditCustom(index)}
                      className="p-0.5 hover:text-[#1D1D1F] transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustom(index)}
                      className="p-0.5 hover:text-rose-600 transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !isAddingCustom && (
            <p className="text-xs text-[#86868B] italic pt-1">
              No custom amenities added yet. Click &quot;Add another amenity&quot; to include special features.
            </p>
          )
        )}
      </div>

      {/* FOOTER ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#EDEDED]">
        <button
          type="button"
          onClick={() => onBack(selectedAmenities, customAmenities)}
          disabled={isSaving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-[#EDEDED] bg-white text-xs sm:text-sm font-bold text-[#1D1D1F] hover:bg-[#F5F5F7] transition-all disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
