'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Copy,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  BedDouble,
  Layers,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Hash,
  Home,
  IndianRupee,
  X,
  SkipForward,
  Building2,
  Users,
  Sparkles,
} from 'lucide-react';
import type {
  PropertyType,
  RentalStructure,
  PropertyUnit,
  PropertyBed,
  CreateUnitPayload,
  BulkCreateUnitsPayload,
} from '../../types';
import {
  getUnitTerminology,
  calculateUnitAvailability,
  getNextUnitNumber,
  generateInitialBeds,
} from '../../units';
import {
  createUnit,
  bulkCreateUnits,
  duplicateUnit,
  updateUnit,
  deleteUnit,
  createBed,
  deleteBed,
  updateBed,
  getProperty,
} from '../../api';

// ============================================================================
// PROPS
// ============================================================================

export interface StepUnitsProps {
  propertyId: string;
  propertyType?: PropertyType | null;
  rentalStructure?: RentalStructure | null;
  initialUnits?: PropertyUnit[];
  onBack: (units: PropertyUnit[]) => void;
  onSave: (units: PropertyUnit[]) => Promise<void> | void;
  onSkip?: () => void;
  isSaving?: boolean;
}

// ============================================================================
// AVAILABILITY BADGE STYLES
// ============================================================================

function availabilityBadge(status: string) {
  switch (status) {
    case 'available':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Available' };
    case 'partially_occupied':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Partially Occupied' };
    case 'occupied':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Full' };
    case 'under_maintenance':
      return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: 'Maintenance' };
    default:
      return { bg: 'bg-[#F5F5F7]', text: 'text-[#86868B]', border: 'border-[#EDEDED]', label: status };
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function StepUnits({
  propertyId,
  propertyType,
  rentalStructure,
  initialUnits = [],
  onBack,
  onSave,
  onSkip,
  isSaving = false,
}: StepUnitsProps) {
  const terminology = useMemo(
    () => getUnitTerminology(propertyType, rentalStructure),
    [propertyType, rentalStructure]
  );

  const [units, setUnits] = useState<PropertyUnit[]>(initialUnits);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  // Accordion: expanded unit cards
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  const toggleExpand = (unitId: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  };

  // --------------------------------------------------------------------------
  // Memoized Totals & Incomplete Unit Tracking
  // --------------------------------------------------------------------------
  const { totalUnits, totalBeds, totalCapacity, incompleteCount } = useMemo(() => {
    let beds = 0;
    let cap = 0;
    let inc = 0;
    for (const u of units) {
      beds += u.beds?.length || 0;
      cap += u.capacity || 1;
      const rent = u.pricing?.monthlyRent || 0;
      const hasBeds = Boolean(u.beds && u.beds.length > 0);
      const bedsConfigured = !hasBeds || (u.beds?.some((b) => (b.pricing?.monthlyRent || 0) > 0) ?? false);
      if (!u.nameOrNumber || (rent === 0 && !bedsConfigured)) {
        inc++;
      }
    }
    return {
      totalUnits: units.length,
      totalBeds: beds,
      totalCapacity: cap,
      incompleteCount: inc
    };
  }, [units]);

  // --------------------------------------------------------------------------
  // Refresh units from backend
  // --------------------------------------------------------------------------
  const refreshUnits = useCallback(async () => {
    try {
      const res = await getProperty(propertyId);
      if (res.success && res.data) {
        setUnits(res.data.units || []);
      }
    } catch {}
  }, [propertyId]);

  // --------------------------------------------------------------------------
  // ADD SINGLE UNIT
  // --------------------------------------------------------------------------
  const [addForm, setAddForm] = useState({
    nameOrNumber: '',
    unitType: '',
    capacity: 1,
    floor: '',
    monthlyRent: 0,
    securityDeposit: 0,
    bedsCount: 0,
  });

  const resetAddForm = () => {
    setAddForm({
      nameOrNumber: getNextUnitNumber(units, terminology.singular),
      unitType: terminology.defaultUnitTypes[0] || '',
      capacity: terminology.hasBeds ? 2 : 1,
      floor: '',
      monthlyRent: 0,
      securityDeposit: 0,
      bedsCount: terminology.hasBeds ? 2 : 0,
    });
  };

  const handleOpenAddModal = () => {
    resetAddForm();
    setShowAddModal(true);
    setError(null);
  };

  const handleAddUnit = async () => {
    if (!addForm.nameOrNumber.trim()) {
      setError(`Please enter a ${terminology.singular.toLowerCase()} name or number.`);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const payload: CreateUnitPayload = {
        nameOrNumber: addForm.nameOrNumber.trim(),
        unitType: addForm.unitType || undefined,
        capacity: addForm.capacity,
        floor: addForm.floor || undefined,
        pricing: {
          monthlyRent: addForm.monthlyRent,
          securityDeposit: addForm.securityDeposit,
        },
        initialBedsCount: terminology.hasBeds ? addForm.bedsCount : 0,
      };
      const res = await createUnit(propertyId, payload);
      if (res.success && res.data) {
        setUnits((prev) => [...prev, res.data!]);
        setShowAddModal(false);
      } else {
        // Optimistic local creation if simulation returns error
        const now = new Date().toISOString();
        const fallbackId = `unit_${Date.now().toString(36)}`;
        const fallbackUnit: PropertyUnit = {
          id: fallbackId,
          propertyId,
          nameOrNumber: payload.nameOrNumber,
          unitType: payload.unitType,
          capacity: payload.capacity || 1,
          floor: payload.floor,
          pricing: payload.pricing,
          availability: 'available',
          status: 'available',
          beds: terminology.hasBeds ? generateInitialBeds(payload.initialBedsCount || 2, fallbackId, payload.pricing.monthlyRent, payload.pricing.securityDeposit) : [],
          createdAt: now,
          updatedAt: now,
        };
        setUnits((prev) => [...prev, fallbackUnit]);
        setShowAddModal(false);
      }
    } catch (err: any) {
      // Local fallback on catch
      const now = new Date().toISOString();
      const fallbackId = `unit_${Date.now().toString(36)}`;
      const fallbackUnit: PropertyUnit = {
        id: fallbackId,
        propertyId,
        nameOrNumber: addForm.nameOrNumber.trim(),
        unitType: addForm.unitType || undefined,
        capacity: addForm.capacity || 1,
        floor: addForm.floor || undefined,
        pricing: {
          monthlyRent: addForm.monthlyRent,
          securityDeposit: addForm.securityDeposit,
        },
        availability: 'available',
        status: 'available',
        beds: terminology.hasBeds ? generateInitialBeds(addForm.bedsCount || 2, fallbackId, addForm.monthlyRent, addForm.securityDeposit) : [],
        createdAt: now,
        updatedAt: now,
      };
      setUnits((prev) => [...prev, fallbackUnit]);
      setShowAddModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // BULK CREATE UNITS
  // --------------------------------------------------------------------------
  const [bulkForm, setBulkForm] = useState({
    count: 5,
    prefix: '',
    startingNumber: 101,
    unitType: '',
    capacityPerUnit: 2,
    monthlyRent: 0,
    securityDeposit: 0,
    bedsPerUnit: 0,
  });

  const handleOpenBulkModal = () => {
    setBulkForm({
      count: 5,
      prefix: terminology.singular,
      startingNumber: 101,
      unitType: terminology.defaultUnitTypes[0] || '',
      capacityPerUnit: terminology.hasBeds ? 2 : 1,
      monthlyRent: 0,
      securityDeposit: 0,
      bedsPerUnit: terminology.hasBeds ? 2 : 0,
    });
    setShowBulkModal(true);
    setError(null);
  };

  const handleBulkCreate = async () => {
    if (bulkForm.count < 1 || bulkForm.count > 100) {
      setError('Count must be between 1 and 100.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const payload: BulkCreateUnitsPayload = {
        count: bulkForm.count,
        prefix: bulkForm.prefix || terminology.singular,
        startingNumber: bulkForm.startingNumber,
        unitType: bulkForm.unitType || undefined,
        capacityPerUnit: bulkForm.capacityPerUnit,
        pricing: {
          monthlyRent: bulkForm.monthlyRent,
          securityDeposit: bulkForm.securityDeposit,
        },
        bedsPerUnit: terminology.hasBeds ? bulkForm.bedsPerUnit : 0,
      };
      const res = await bulkCreateUnits(propertyId, payload);
      if (res.success && res.data) {
        setUnits((prev) => [...prev, ...res.data!]);
        setShowBulkModal(false);
      } else {
        const now = new Date().toISOString();
        const prefix = payload.prefix || terminology.singular;
        const startNum = payload.startingNumber || 101;
        const fallbackUnits: PropertyUnit[] = [];
        for (let i = 0; i < payload.count; i++) {
          const uId = `unit_${Date.now().toString(36)}_${i}`;
          fallbackUnits.push({
            id: uId,
            propertyId,
            nameOrNumber: `${prefix} ${startNum + i}`,
            unitType: payload.unitType,
            capacity: payload.capacityPerUnit || 2,
            pricing: payload.pricing,
            availability: 'available',
            status: 'available',
            beds: terminology.hasBeds ? generateInitialBeds(payload.bedsPerUnit || 2, uId, payload.pricing.monthlyRent, payload.pricing.securityDeposit) : [],
            createdAt: now,
            updatedAt: now,
          });
        }
        setUnits((prev) => [...prev, ...fallbackUnits]);
        setShowBulkModal(false);
      }
    } catch (err: any) {
      const now = new Date().toISOString();
      const prefix = bulkForm.prefix || terminology.singular;
      const startNum = bulkForm.startingNumber || 101;
      const fallbackUnits: PropertyUnit[] = [];
      for (let i = 0; i < bulkForm.count; i++) {
        const uId = `unit_${Date.now().toString(36)}_${i}`;
        fallbackUnits.push({
          id: uId,
          propertyId,
          nameOrNumber: `${prefix} ${startNum + i}`,
          unitType: bulkForm.unitType || undefined,
          capacity: bulkForm.capacityPerUnit || 2,
          pricing: {
            monthlyRent: bulkForm.monthlyRent,
            securityDeposit: bulkForm.securityDeposit,
          },
          availability: 'available',
          status: 'available',
          beds: terminology.hasBeds ? generateInitialBeds(bulkForm.bedsPerUnit || 2, uId, bulkForm.monthlyRent, bulkForm.securityDeposit) : [],
          createdAt: now,
          updatedAt: now,
        });
      }
      setUnits((prev) => [...prev, ...fallbackUnits]);
      setShowBulkModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // DUPLICATE UNIT
  // --------------------------------------------------------------------------
  const handleDuplicate = async (unit: PropertyUnit) => {
    setIsLoading(true);
    setError(null);
    try {
      const newName = getNextUnitNumber(units, terminology.singular);
      const res = await duplicateUnit(propertyId, unit.id, newName);
      if (res.success && res.data) {
        setUnits((prev) => [...prev, res.data!]);
      } else {
        const now = new Date().toISOString();
        const newUnitId = `unit_${Date.now().toString(36)}`;
        const cloned: PropertyUnit = {
          ...unit,
          id: newUnitId,
          nameOrNumber: newName,
          beds: unit.beds.map((b) => ({ ...b, id: `bed_${Date.now().toString(36)}_${b.label}`, unitId: newUnitId })),
          createdAt: now,
          updatedAt: now,
        };
        setUnits((prev) => [...prev, cloned]);
      }
    } catch (err: any) {
      const now = new Date().toISOString();
      const newUnitId = `unit_${Date.now().toString(36)}`;
      const newName = getNextUnitNumber(units, terminology.singular);
      const cloned: PropertyUnit = {
        ...unit,
        id: newUnitId,
        nameOrNumber: newName,
        beds: unit.beds.map((b) => ({ ...b, id: `bed_${Date.now().toString(36)}_${b.label}`, unitId: newUnitId })),
        createdAt: now,
        updatedAt: now,
      };
      setUnits((prev) => [...prev, cloned]);
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // DELETE UNIT
  // --------------------------------------------------------------------------
  const handleDelete = async (unitId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await deleteUnit(propertyId, unitId);
      if (res.success) {
        setUnits((prev) => prev.filter((u) => u.id !== unitId));
        setExpandedUnits((prev) => {
          const next = new Set(prev);
          next.delete(unitId);
          return next;
        });
      } else {
        setError(res.error || 'Failed to delete unit.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // EDIT UNIT (inline)
  // --------------------------------------------------------------------------
  const [editForm, setEditForm] = useState<Partial<PropertyUnit>>({});

  const startEditUnit = (unit: PropertyUnit) => {
    setEditingUnitId(unit.id);
    setEditForm({
      nameOrNumber: unit.nameOrNumber,
      unitType: unit.unitType,
      capacity: unit.capacity,
      floor: unit.floor,
      pricing: { ...unit.pricing },
      availability: unit.availability,
    });
    setError(null);
  };

  const handleSaveEdit = async (unitId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await updateUnit(propertyId, unitId, editForm);
      if (res.success && res.data) {
        setUnits((prev) => prev.map((u) => (u.id === unitId ? res.data! : u)));
        setEditingUnitId(null);
      } else {
        setError(res.error || 'Failed to update unit.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // BED MANAGEMENT
  // --------------------------------------------------------------------------
  const handleAddBed = async (unit: PropertyUnit) => {
    setIsLoading(true);
    setError(null);
    try {
      const label =
        unit.beds.length < 26
          ? `Bed ${String.fromCharCode(65 + unit.beds.length)}`
          : `Bed ${unit.beds.length + 1}`;

      const res = await createBed(propertyId, unit.id, {
        label,
        pricing: {
          monthlyRent: unit.pricing.monthlyRent,
          securityDeposit: unit.pricing.securityDeposit,
        },
      });
      if (res.success && res.data) {
        setUnits((prev) =>
          prev.map((u) =>
            u.id === unit.id ? { ...u, beds: [...u.beds, res.data!] } : u
          )
        );
      } else {
        setError(res.error || 'Failed to add bed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBedStatus = async (
    unit: PropertyUnit,
    bed: PropertyBed
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const nextAvailability = bed.availability === 'available' ? 'occupied' : 'available';
      const res = await updateBed(propertyId, unit.id, bed.id, {
        availability: nextAvailability,
      });
      if (res.success && res.data) {
        setUnits((prev) =>
          prev.map((u) =>
            u.id === unit.id
              ? {
                  ...u,
                  beds: u.beds.map((b) =>
                    b.id === bed.id ? res.data! : b
                  ),
                }
              : u
          )
        );
      } else {
        setError(res.error || 'Failed to toggle bed status.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBed = async (unit: PropertyUnit, bedId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await deleteBed(propertyId, unit.id, bedId);
      if (res.success) {
        setUnits((prev) =>
          prev.map((u) =>
            u.id === unit.id
              ? { ...u, beds: u.beds.filter((b) => b.id !== bedId) }
              : u
          )
        );
      } else {
        setError(res.error || 'Failed to delete bed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1D1D1F] tracking-tight">
              {terminology.hasBeds
                ? `Add ${terminology.plural.toLowerCase()} & beds`
                : `Add ${terminology.plural.toLowerCase()}`}
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#86868B] mt-1.5 leading-relaxed">
          {terminology.hasBeds
            ? `Manage ${terminology.plural.toLowerCase()} and bed-level availability for your tenants.`
            : `Configure each rentable ${terminology.singular.toLowerCase()} with pricing and availability.`}
        </p>
      </div>

      {/* SKIP BANNER (for entire property rentals) */}
      {terminology.isSkippable && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <SkipForward className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-800">
                This property is rented as a whole
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                {terminology.singular === 'Property'
                  ? 'You can skip to the review summary. No need to create separate units.'
                  : `You can skip adding separate ${terminology.plural.toLowerCase()} unless you want to describe individual sections.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSkip ? onSkip() : onSave(units)}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Skip to Review</span>
          </button>
        </div>
      )}

      {/* SUMMARY BAR */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F5F7] border border-[#EDEDED] text-xs font-bold text-[#1D1D1F]">
          <Building2 className="w-3.5 h-3.5 text-[#1D1D1F]" />
          <span>
            {totalUnits} {totalUnits === 1 ? terminology.singular : terminology.plural}
          </span>
        </div>
        {terminology.hasBeds && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F5F7] border border-[#EDEDED] text-xs font-bold text-[#1D1D1F]">
            <BedDouble className="w-3.5 h-3.5 text-[#1D1D1F]" />
            <span>{totalBeds} Beds</span>
          </div>
        )}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F5F7] border border-[#EDEDED] text-xs font-bold text-[#1D1D1F]">
          <Users className="w-3.5 h-3.5 text-[#1D1D1F]" />
          <span>Capacity: {totalCapacity}</span>
        </div>
        {incompleteCount > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>{incompleteCount} incomplete</span>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleOpenAddModal}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{terminology.addLabel}</span>
        </button>
        <button
          type="button"
          onClick={handleOpenBulkModal}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-bold inline-flex items-center gap-1.5 transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{terminology.bulkLabel}</span>
        </button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* UNIT CARDS LIST */}
      {units.length === 0 ? (
        <div className="p-8 rounded-2xl border-2 border-dashed border-[#EDEDED] text-center">
          <Layers className="w-10 h-10 text-[#EDEDED] mx-auto mb-3" />
          <p className="text-sm font-bold text-[#86868B]">
            No {terminology.plural.toLowerCase()} added yet
          </p>
          <p className="text-xs text-[#AEAEB2] mt-1">
            Use the buttons above to add {terminology.plural.toLowerCase()} to your property.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {units.map((unit) => {
            const avail = calculateUnitAvailability(unit);
            const badge = availabilityBadge(avail);
            const isExpanded = expandedUnits.has(unit.id);
            const isEditing = editingUnitId === unit.id;
            const rent = unit.pricing?.monthlyRent || 0;
            const hasBeds = Boolean(unit.beds && unit.beds.length > 0);
            const bedsConfigured = !hasBeds || (unit.beds?.some((b) => (b.pricing?.monthlyRent || 0) > 0) ?? false);
            const isUnitIncomplete = !unit.nameOrNumber || (rent === 0 && !bedsConfigured);

            return (
              <div
                key={unit.id}
                className="rounded-2xl border border-[#EDEDED] bg-white shadow-apple-sm overflow-hidden transition-all"
              >
                {/* UNIT CARD HEADER */}
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center shrink-0">
                      <Home className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.nameOrNumber || ''}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, nameOrNumber: e.target.value }))
                          }
                          className="text-sm font-extrabold text-[#1D1D1F] border-b border-primary bg-transparent outline-none w-full"
                        />
                      ) : (
                        <p className="text-sm font-extrabold text-[#1D1D1F] truncate">
                          {unit.nameOrNumber}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#86868B] font-semibold">
                        {unit.unitType && <span>{unit.unitType}</span>}
                        {unit.unitType && unit.floor != null && <span>·</span>}
                        {unit.floor != null && <span>Floor {unit.floor}</span>}
                        {(unit.unitType || unit.floor != null) && <span>·</span>}
                        <span>Capacity {unit.capacity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* INCOMPLETE WARNING PILL */}
                    {isUnitIncomplete && (
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1"
                        title="Rent or unit details missing"
                      >
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>Needs Rent</span>
                      </span>
                    )}

                    {/* AVAILABILITY BADGE */}
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border} hidden sm:inline-flex`}
                    >
                      {badge.label}
                    </span>

                    {/* RENT */}
                    <span className="text-xs font-extrabold text-emerald-600 hidden sm:inline">
                      ₹{unit.pricing.monthlyRent.toLocaleString('en-IN')}/mo
                    </span>

                    {/* ACTIONS */}
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSaveEdit(unit.id)}
                          disabled={isLoading}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all"
                          title="Save"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingUnitId(null)}
                          className="p-1.5 rounded-lg bg-[#F5F5F7] text-[#86868B] hover:bg-[#EDEDED] transition-all"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditUnit(unit)}
                          className="p-1.5 rounded-lg text-[#86868B] hover:bg-[#F5F5F7] transition-all"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(unit)}
                          disabled={isLoading}
                          className="p-1.5 rounded-lg text-[#86868B] hover:bg-[#F5F5F7] transition-all"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(unit.id)}
                          disabled={isLoading}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {terminology.hasBeds && (
                          <button
                            onClick={() => toggleExpand(unit.id)}
                            className="p-1.5 rounded-lg text-[#86868B] hover:bg-[#F5F5F7] transition-all"
                            title={isExpanded ? 'Collapse beds' : 'Show beds'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* EDIT FORM INLINE (pricing + availability) */}
                {isEditing && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#EDEDED] grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#86868B] mb-1">Type</label>
                      <select
                        value={editForm.unitType || ''}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, unitType: e.target.value }))
                        }
                        className="w-full px-2.5 py-2 rounded-lg border border-[#EDEDED] bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">None</option>
                        {terminology.defaultUnitTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#86868B] mb-1">Capacity</label>
                      <input
                        type="number"
                        min={1}
                        value={editForm.capacity || 1}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            capacity: Math.max(1, parseInt(e.target.value, 10) || 1),
                          }))
                        }
                        className="w-full px-2.5 py-2 rounded-lg border border-[#EDEDED] bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#86868B] mb-1">Rent (₹/mo)</label>
                      <input
                        type="number"
                        min={0}
                        value={editForm.pricing?.monthlyRent || 0}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            pricing: {
                              monthlyRent: Math.max(0, parseInt(e.target.value, 10) || 0),
                              securityDeposit: f.pricing?.securityDeposit || 0,
                            },
                          }))
                        }
                        className="w-full px-2.5 py-2 rounded-lg border border-[#EDEDED] bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#86868B] mb-1">Availability</label>
                      <select
                        value={editForm.availability || 'available'}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            availability: e.target.value as any,
                          }))
                        }
                        className="w-full px-2.5 py-2 rounded-lg border border-[#EDEDED] bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="reserved">Reserved</option>
                        <option value="under_maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* BED MANAGEMENT ACCORDION */}
                {terminology.hasBeds && isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#EDEDED] space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                        Beds ({unit.beds.length})
                      </p>
                      <button
                        type="button"
                        onClick={() => handleAddBed(unit)}
                        disabled={isLoading}
                        className="text-[11px] font-bold text-primary hover:text-primary-hover inline-flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Bed</span>
                      </button>
                    </div>

                    {unit.beds.length === 0 ? (
                      <p className="text-[11px] text-[#AEAEB2] italic py-2">
                        No beds configured. Add beds to track individual bed availability.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {unit.beds.map((bed) => {
                          const bedBadge = availabilityBadge(bed.availability);
                          return (
                            <div
                              key={bed.id}
                              className={`p-2.5 rounded-xl border ${bedBadge.border} ${bedBadge.bg} flex items-center justify-between gap-2 transition-all`}
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#1D1D1F] truncate">
                                  {bed.label}
                                </p>
                                <p className={`text-[10px] font-semibold ${bedBadge.text}`}>
                                  {bed.availability === 'available' ? 'Available' : 'Occupied'}
                                </p>
                              </div>
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  onClick={() => handleToggleBedStatus(unit, bed)}
                                  disabled={isLoading}
                                  className={`p-1 rounded-md transition-all ${
                                    bed.availability === 'available'
                                      ? 'text-emerald-600 hover:bg-emerald-100'
                                      : 'text-rose-500 hover:bg-rose-100'
                                  }`}
                                  title={
                                    bed.availability === 'available'
                                      ? 'Mark as occupied'
                                      : 'Mark as available'
                                  }
                                >
                                  <BedDouble className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBed(unit, bed.id)}
                                  disabled={isLoading}
                                  className="p-1 rounded-md text-rose-400 hover:bg-rose-100 transition-all"
                                  title="Remove bed"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#EDEDED]">
        <button
          type="button"
          onClick={() => onBack(units)}
          className="px-5 py-3 rounded-2xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={() => onSave(units)}
          disabled={isSaving || isLoading}
          className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>Save & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* ================================================================== */}
      {/* ADD SINGLE UNIT MODAL */}
      {/* ================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EDEDED] overflow-hidden">
            <div className="p-5 border-b border-[#EDEDED] flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#1D1D1F]">
                {terminology.addLabel.replace('+ ', '')}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-[#86868B] hover:bg-[#F5F5F7] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold text-[#86868B] mb-1">
                  {terminology.singular} Name / Number
                </label>
                <input
                  type="text"
                  value={addForm.nameOrNumber}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, nameOrNumber: e.target.value }))
                  }
                  placeholder={terminology.placeholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-[#F5F5F7] text-sm font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-[#AEAEB2]"
                />
              </div>

              {/* Type */}
              {terminology.defaultUnitTypes.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-[#86868B] mb-1">
                    {terminology.singular} Type
                  </label>
                  <select
                    value={addForm.unitType}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, unitType: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-[#F5F5F7] text-sm font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Select type</option>
                    {terminology.defaultUnitTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Capacity */}
                <div>
                  <label className="block text-[11px] font-bold text-[#86868B] mb-1">
                    Capacity (persons)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={addForm.capacity}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        capacity: Math.max(1, parseInt(e.target.value, 10) || 1),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-[#F5F5F7] text-sm font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                {/* Floor */}
                <div>
                  <label className="block text-[11px] font-bold text-[#86868B] mb-1">
                    Floor (optional)
                  </label>
                  <input
                    type="text"
                    value={addForm.floor}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, floor: e.target.value }))
                    }
                    placeholder="e.g. 1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-[#F5F5F7] text-sm font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-[#AEAEB2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Rent */}
                <div>
                  <label className="block text-[11px] font-bold text-[#86868B] mb-1">
                    Monthly Rent (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={addForm.monthlyRent}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        monthlyRent: Math.max(0, parseInt(e.target.value, 10) || 0),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-[#F5F5F7] text-sm font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                {/* Deposit */}
                <div>
                  <label className="block text-[11px] font-bold text-[#86868B] mb-1">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={addForm.securityDeposit}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        securityDeposit: Math.max(0, parseInt(e.target.value, 10) || 0),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-[#F5F5F7] text-sm font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Beds per unit (if bed-level model) */}
              {terminology.hasBeds && (
                <div>
                  <label className="block text-[11px] font-bold text-[#86868B] mb-1">
                    Number of Beds
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={addForm.bedsCount}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        bedsCount: Math.max(0, Math.min(20, parseInt(e.target.value, 10) || 0)),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-[#F5F5F7] text-sm font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <p className="text-[10px] text-[#AEAEB2] mt-1">
                    Beds will be labeled A, B, C... automatically.
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-[#EDEDED] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#EDEDED] text-xs font-bold text-[#86868B] hover:bg-[#F5F5F7] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddUnit}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>Add {terminology.singular}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* BULK CREATE MODAL */}
      {/* ================================================================== */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EDEDED] overflow-hidden">
            <div className="p-5 border-b border-[#EDEDED] flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#1D1D1F]">
                {terminology.bulkLabel}
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-1.5 rounded-lg text-[#86868B] hover:bg-[#F5F5F7] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {/* Count */}
                <div>
                  <label className="block text-[11px] font-bold text-[#86868B] mb-1">
                    How many?
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={bulkForm.count}
                    onChange={(e) =>
                      setBulkForm((f) => ({
                        ...f,
                        count: Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1)),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-[#F5F5F7] text-sm font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                {/* Prefix */}
                <div>
                  <label className="block text-[11px] font-bold text-[#86868B] mb-1">
                    Name Prefix
                  </label>
                  <input
                    type="text"
                    value={bulkForm.prefix}
                    onChange={(e) =>
                      setBulkForm((f) => ({ ...f, prefix: e.target.value }))
                    }
                    placeholder={terminology.singular}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-[#F5F5F7] text-sm font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-[#AEAEB2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Starting number */}
                <div>
                  <label className="block text-[11px] font-bold text-[#86868B] mb-1">
                    Starting Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={bulkForm.startingNumber}
                    onChange={(e) =>
                      setBulkForm((f) => ({
                        ...f,
                        startingNumber: Math.max(1, parseInt(e.target.value, 10) || 1),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-[#F5F5F7] text-sm font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-[11px] font-bold text-[#86868B] mb-1">
                    {terminology.singular} Type
                  </label>
                  <select
                    value={bulkForm.unitType}
                    onChange={(e) =>
                      setBulkForm((f) => ({ ...f, unitType: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-[#F5F5F7] text-sm font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Select type</option>
                    {terminology.defaultUnitTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Capacity per unit */}
                <div>
                  <label className="block text-[11px] font-bold text-[#86868B] mb-1">
                    Capacity / Unit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={bulkForm.capacityPerUnit}
                    onChange={(e) =>
                      setBulkForm((f) => ({
                        ...f,
                        capacityPerUnit: Math.max(1, parseInt(e.target.value, 10) || 1),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-[#F5F5F7] text-sm font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                {/* Beds per unit */}
                {terminology.hasBeds && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#86868B] mb-1">
                      Beds / Unit
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={bulkForm.bedsPerUnit}
                      onChange={(e) =>
                        setBulkForm((f) => ({
                          ...f,
                          bedsPerUnit: Math.max(0, Math.min(20, parseInt(e.target.value, 10) || 0)),
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-[#F5F5F7] text-sm font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Rent */}
                <div>
                  <label className="block text-[11px] font-bold text-[#86868B] mb-1">
                    Rent (₹/mo each)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bulkForm.monthlyRent}
                    onChange={(e) =>
                      setBulkForm((f) => ({
                        ...f,
                        monthlyRent: Math.max(0, parseInt(e.target.value, 10) || 0),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-[#F5F5F7] text-sm font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                {/* Deposit */}
                <div>
                  <label className="block text-[11px] font-bold text-[#86868B] mb-1">
                    Deposit (₹ each)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bulkForm.securityDeposit}
                    onChange={(e) =>
                      setBulkForm((f) => ({
                        ...f,
                        securityDeposit: Math.max(0, parseInt(e.target.value, 10) || 0),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-[#F5F5F7] text-sm font-semibold text-[#1D1D1F] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="p-3 rounded-xl bg-primary/[0.04] border border-primary/20 text-xs text-[#1D1D1F] font-semibold">
                <Sparkles className="w-3.5 h-3.5 inline mr-1 text-primary" />
                Preview: Will create{' '}
                <strong>
                  {bulkForm.count} {bulkForm.count === 1 ? terminology.singular : terminology.plural}
                </strong>{' '}
                ({bulkForm.prefix || terminology.singular} {bulkForm.startingNumber} –{' '}
                {bulkForm.startingNumber + bulkForm.count - 1})
                {terminology.hasBeds && bulkForm.bedsPerUnit > 0 && (
                  <span>
                    {' '}with <strong>{bulkForm.bedsPerUnit} beds each</strong> (
                    {bulkForm.count * bulkForm.bedsPerUnit} total beds)
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-[#EDEDED] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#EDEDED] text-xs font-bold text-[#86868B] hover:bg-[#F5F5F7] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkCreate}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Layers className="w-3.5 h-3.5" />
                )}
                <span>Generate {bulkForm.count} {terminology.plural}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
