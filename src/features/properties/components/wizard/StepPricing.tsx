'use client';

import React, { useState, useMemo } from 'react';
import {
  IndianRupee,
  Calendar,
  ShieldCheck,
  Zap,
  Wrench,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
  Building2,
  BedDouble,
  Tag,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
  Trash2,
  Info
} from 'lucide-react';
import type {
  Property,
  PropertyType,
  RentalStructure,
  PropertyPricing,
  UnitPricing,
  BedPricing,
  GenericRentablePricing,
  PropertyAvailability,
  PropertyAvailabilityType,
  PricingMode,
  BillingPeriod,
  SecurityDepositType,
  MaintenanceChargesType,
  ElectricityChargesType,
  OtherRecurringCharge,
  PropertyUnit,
  PropertyBed,
  BulkPricingPayload
} from '../../types';
import { getPropertyTemplate } from '../../templates';
import { getUnitTerminology } from '../../units';
import {
  formatCurrency,
  formatPricingDisplay,
  calculateEffectiveDeposit,
  getPropertyAvailabilityLabel,
  getUnitAvailabilityLabel,
  validatePricingPayload,
  createDefaultPricing
} from '../../pricing';

interface StepPricingProps {
  property: Property;
  onBack: () => void;
  onSave: (pricingData: {
    propertyPricing: PropertyPricing;
    propertyAvailability: PropertyAvailability;
    units?: PropertyUnit[];
  }) => Promise<void> | void;
  isSaving?: boolean;
}

export default function StepPricing({
  property,
  onBack,
  onSave,
  isSaving = false
}: StepPricingProps) {
  const propertyType = property.propertyType;
  const rentalStructure = property.rentalStructure || 'entire_property';
  const template = getPropertyTemplate(propertyType);
  const term = getUnitTerminology(propertyType, rentalStructure);

  const isEntireProperty = rentalStructure === 'entire_property';
  const isIndividualBed = rentalStructure === 'individual_bed';
  const isMultiUnitOrRoom = !isEntireProperty && !isIndividualBed;

  // Today's date for availability date picker
  const todayStr = new Date().toISOString().split('T')[0];

  // ==========================================================================
  // 1. PROPERTY-LEVEL / DEFAULT FORM STATE
  // ==========================================================================
  const initialBasePricing = useMemo(() => {
    const defaultVal = createDefaultPricing(propertyType, rentalStructure);
    if (property.pricing) {
      return {
        ...defaultVal,
        ...property.pricing,
        monthlyRent: property.pricing.monthlyRent || defaultVal.monthlyRent,
        amount: property.pricing.monthlyRent || defaultVal.monthlyRent
      };
    }
    return defaultVal;
  }, [property.pricing, propertyType, rentalStructure]);

  const [pricingMode, setPricingMode] = useState<PricingMode>(
    initialBasePricing.pricingMode || 'fixed'
  );
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(
    initialBasePricing.billingPeriod || 'monthly'
  );
  const [rentAmount, setRentAmount] = useState<string>(
    initialBasePricing.monthlyRent ? String(initialBasePricing.monthlyRent) : '15000'
  );

  // Security Deposit
  const [depositType, setDepositType] = useState<SecurityDepositType>(
    initialBasePricing.securityDepositConfig?.type || 'months'
  );
  const [depositMonths, setDepositMonths] = useState<number>(
    initialBasePricing.securityDepositConfig?.monthsCount || 2
  );
  const [depositFixedAmount, setDepositFixedAmount] = useState<string>(
    initialBasePricing.securityDepositConfig?.amount
      ? String(initialBasePricing.securityDepositConfig.amount)
      : initialBasePricing.securityDeposit
      ? String(initialBasePricing.securityDeposit)
      : '30000'
  );

  // Maintenance Charges
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceChargesType>(
    initialBasePricing.maintenanceChargesConfig?.type || 'included'
  );
  const [maintenanceAmount, setMaintenanceAmount] = useState<string>(
    initialBasePricing.maintenanceChargesConfig?.amount
      ? String(initialBasePricing.maintenanceChargesConfig.amount)
      : initialBasePricing.maintenance
      ? String(initialBasePricing.maintenance)
      : '1000'
  );

  // Electricity Charges
  const [electricityType, setElectricityType] = useState<ElectricityChargesType>(
    initialBasePricing.electricityChargesConfig?.type || 'meter_based'
  );
  const [electricityAmount, setElectricityAmount] = useState<string>(
    initialBasePricing.electricityChargesConfig?.amount
      ? String(initialBasePricing.electricityChargesConfig.amount)
      : '500'
  );

  // Property Availability State
  const [availType, setAvailType] = useState<PropertyAvailabilityType>(
    property.availability?.type || 'immediate'
  );
  const [availDate, setAvailDate] = useState<string>(
    property.availability?.availableFrom || todayStr
  );

  // Other Recurring Charges (Optional)
  const [otherCharges, setOtherCharges] = useState<OtherRecurringCharge[]>(
    initialBasePricing.otherCharges || []
  );
  const [newChargeName, setNewChargeName] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState('');

  // ==========================================================================
  // 2. UNITS & BEDS STATE (for Unit / Room / Bed Rental Structures)
  // ==========================================================================
  const [unitsState, setUnitsState] = useState<PropertyUnit[]>(() => {
    return (property.units || []).map((u) => ({
      ...u,
      pricing: {
        ...initialBasePricing,
        ...u.pricing,
        monthlyRent: u.pricing?.monthlyRent || initialBasePricing.monthlyRent,
        amount: u.pricing?.monthlyRent || initialBasePricing.monthlyRent
      },
      availability: u.availability || 'available',
      beds: (u.beds || []).map((b) => ({
        ...b,
        pricing: {
          ...initialBasePricing,
          ...b.pricing,
          monthlyRent: b.pricing?.monthlyRent || Math.round(initialBasePricing.monthlyRent / (u.beds?.length || 2)),
          amount: b.pricing?.monthlyRent || Math.round(initialBasePricing.monthlyRent / (u.beds?.length || 2))
        },
        availability: b.availability || 'available'
      }))
    }));
  });

  // Track which units or beds have custom overrides
  const [activeUnitAccordion, setActiveUnitAccordion] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --------------------------------------------------------------------------
  // Real-time Calculations
  // --------------------------------------------------------------------------
  const parsedRent = Number(rentAmount.replace(/[^0-9]/g, '')) || 0;
  const parsedMaintenance = Number(maintenanceAmount.replace(/[^0-9]/g, '')) || 0;
  const parsedElectricity = Number(electricityAmount.replace(/[^0-9]/g, '')) || 0;

  const effectiveDepositAmount = useMemo(() => {
    return calculateEffectiveDeposit(
      parsedRent,
      {
        type: depositType,
        monthsCount: depositMonths,
        amount: Number(depositFixedAmount.replace(/[^0-9]/g, '')) || 0
      },
      0
    );
  }, [parsedRent, depositType, depositMonths, depositFixedAmount]);

  // Handle Add Other Charge
  const handleAddOtherCharge = () => {
    const trimmed = newChargeName.trim();
    const amt = Number(newChargeAmount.replace(/[^0-9]/g, ''));
    if (!trimmed || isNaN(amt) || amt <= 0) return;

    setOtherCharges((prev) => [
      ...prev,
      {
        id: `chg_${Date.now()}`,
        name: trimmed,
        amount: amt,
        period: billingPeriod
      }
    ]);
    setNewChargeName('');
    setNewChargeAmount('');
  };

  const handleRemoveOtherCharge = (id: string) => {
    setOtherCharges((prev) => prev.filter((c) => c.id !== id));
  };

  // --------------------------------------------------------------------------
  // Bulk Default Application to Units or Beds
  // --------------------------------------------------------------------------
  const handleApplyDefaultsToAllUnits = () => {
    const baseConfig: GenericRentablePricing = {
      pricingMode,
      amount: parsedRent,
      currency: 'INR',
      billingPeriod,
      monthlyRent: parsedRent,
      securityDeposit: effectiveDepositAmount,
      securityDepositConfig: {
        type: depositType,
        monthsCount: depositMonths,
        amount: effectiveDepositAmount
      },
      maintenanceChargesConfig: {
        type: maintenanceType,
        amount: maintenanceType === 'fixed' ? parsedMaintenance : undefined
      },
      maintenance: maintenanceType === 'fixed' ? parsedMaintenance : 0,
      electricityChargesConfig: {
        type: electricityType,
        amount: electricityType === 'fixed' ? parsedElectricity : undefined
      },
      otherCharges
    };

    setUnitsState((prev) =>
      prev.map((u) => ({
        ...u,
        pricing: {
          ...u.pricing,
          ...baseConfig
        },
        availability: u.availability || 'available'
      }))
    );
  };

  const handleApplyDefaultsToAllBeds = () => {
    const baseConfig: GenericRentablePricing = {
      pricingMode,
      amount: parsedRent,
      currency: 'INR',
      billingPeriod,
      monthlyRent: parsedRent,
      securityDeposit: effectiveDepositAmount,
      securityDepositConfig: {
        type: depositType,
        monthsCount: depositMonths,
        amount: effectiveDepositAmount
      },
      otherCharges
    };

    setUnitsState((prev) =>
      prev.map((u) => ({
        ...u,
        beds: (u.beds || []).map((b) => ({
          ...b,
          pricing: {
            ...b.pricing,
            ...baseConfig
          },
          availability: b.availability || 'available'
        }))
      }))
    );
  };

  // --------------------------------------------------------------------------
  // Unit & Bed Individual Overrides
  // --------------------------------------------------------------------------
  const handleUpdateUnitRent = (unitId: string, newRent: number) => {
    setUnitsState((prev) =>
      prev.map((u) => {
        if (u.id !== unitId) return u;
        const newDeposit = calculateEffectiveDeposit(newRent, u.pricing?.securityDepositConfig || {
          type: depositType,
          monthsCount: depositMonths
        });
        return {
          ...u,
          pricing: {
            ...u.pricing,
            monthlyRent: newRent,
            amount: newRent,
            securityDeposit: newDeposit
          }
        };
      })
    );
  };

  const handleUpdateUnitAvailability = (unitId: string, avail: string) => {
    setUnitsState((prev) =>
      prev.map((u) => {
        if (u.id !== unitId) return u;
        return {
          ...u,
          availability: avail as any,
          status: avail as any
        };
      })
    );
  };

  const handleUpdateBedRent = (unitId: string, bedId: string, newRent: number) => {
    setUnitsState((prev) =>
      prev.map((u) => {
        if (u.id !== unitId) return u;
        return {
          ...u,
          beds: (u.beds || []).map((b) => {
            if (b.id !== bedId) return b;
            const newDeposit = calculateEffectiveDeposit(newRent, b.pricing?.securityDepositConfig || {
              type: depositType,
              monthsCount: depositMonths
            });
            return {
              ...b,
              pricing: {
                ...b.pricing,
                monthlyRent: newRent,
                amount: newRent,
                securityDeposit: newDeposit
              }
            };
          })
        };
      })
    );
  };

  const handleUpdateBedAvailability = (unitId: string, bedId: string, avail: string) => {
    setUnitsState((prev) =>
      prev.map((u) => {
        if (u.id !== unitId) return u;
        return {
          ...u,
          beds: (u.beds || []).map((b) => {
            if (b.id !== bedId) return b;
            return {
              ...b,
              availability: avail as any,
              status: avail as any
            };
          })
        };
      })
    );
  };

  // --------------------------------------------------------------------------
  // Form Submission Validation & Handler
  // --------------------------------------------------------------------------
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (pricingMode !== 'on_request') {
      if (!parsedRent || parsedRent <= 0) {
        errs.rent = 'Please enter a valid monthly rent amount.';
      }
    }

    if (depositType === 'fixed' || depositType === 'custom') {
      const dep = Number(depositFixedAmount.replace(/[^0-9]/g, ''));
      if (isNaN(dep) || dep < 0) {
        errs.deposit = 'Please enter a valid security deposit amount.';
      }
    }

    if (maintenanceType === 'fixed') {
      if (isNaN(parsedMaintenance) || parsedMaintenance < 0) {
        errs.maintenance = 'Please enter a valid fixed maintenance amount.';
      }
    }

    if (electricityType === 'fixed') {
      if (isNaN(parsedElectricity) || parsedElectricity < 0) {
        errs.electricity = 'Please enter a valid fixed electricity amount.';
      }
    }

    if (availType === 'specific_date') {
      if (!availDate) {
        errs.availDate = 'Please select an availability date.';
      } else if (availDate < todayStr) {
        errs.availDate = 'Availability date cannot be in the past.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAndContinue = async () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const compiledPropertyPricing: PropertyPricing = {
      pricingMode,
      amount: parsedRent,
      currency: 'INR',
      billingPeriod,
      monthlyRent: parsedRent,
      securityDeposit: effectiveDepositAmount,
      securityDepositConfig: {
        type: depositType,
        monthsCount: depositMonths,
        amount: effectiveDepositAmount
      },
      maintenanceChargesConfig: {
        type: maintenanceType,
        amount: maintenanceType === 'fixed' ? parsedMaintenance : undefined
      },
      maintenance: maintenanceType === 'fixed' ? parsedMaintenance : 0,
      electricityChargesConfig: {
        type: electricityType,
        amount: electricityType === 'fixed' ? parsedElectricity : undefined
      },
      otherCharges
    };

    const compiledPropertyAvailability: PropertyAvailability = {
      type: availType,
      availableFrom: availType === 'specific_date' ? availDate : undefined
    };

    await onSave({
      propertyPricing: compiledPropertyPricing,
      propertyAvailability: compiledPropertyAvailability,
      units: isEntireProperty ? undefined : unitsState
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="border-b border-[#EDEDED] pb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1D1D1F] tracking-tight">
              {isEntireProperty
                ? `Pricing & Availability`
                : isIndividualBed
                ? `Bed Pricing & Availability`
                : `${term.plural} Pricing & Availability`}
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#86868B] mt-1.5 leading-relaxed max-w-2xl">
          {isEntireProperty
            ? 'Enter your monthly rent, security deposit terms, maintenance, and move-in availability for the entire property.'
            : isIndividualBed
            ? 'Set standard bed rates or customize individual bed prices across your rooms.'
            : `Set default rates for all ${term.plural.toLowerCase()} with the option to customize each individual ${term.singular.toLowerCase()} price.`}
        </p>
      </div>

      {/* ERROR BANNER */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>Please correct the highlighted fields below before continuing.</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 1: MASTER / DEFAULT PRICING CONFIGURATION */}
      {/* ==================================================================== */}
      <div className="bg-[#FBFBFD] border border-[#EDEDED] rounded-3xl p-6 sm:p-7 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#1D1D1F] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#1D1D1F]" />
              <span>
                {isEntireProperty
                  ? 'Property Rent & Terms'
                  : `Default ${isIndividualBed ? 'Bed' : term.singular} Pricing`}
              </span>
            </h3>
            <p className="text-xs text-[#86868B] mt-0.5">
              {isEntireProperty
                ? 'Standard pricing applied to this property listing.'
                : `Base rate you can quickly apply to all ${isIndividualBed ? 'beds' : term.plural.toLowerCase()}.`}
            </p>
          </div>

          {/* QUICK SUMMARY BADGE */}
          <div className="text-right">
            <span className="text-xs font-semibold text-[#86868B] block">Effective Rent</span>
            <span className="text-base sm:text-lg font-extrabold text-primary">
              {pricingMode === 'on_request'
                ? 'On Request'
                : `${formatCurrency(parsedRent)} / mo`}
            </span>
          </div>
        </div>

        {/* PRICING MODE RADIO PILLS */}
        <div>
          <label className="block text-xs font-bold text-[#1D1D1F] mb-2">
            Pricing Mode
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { id: 'fixed', label: 'Fixed Price', desc: 'Exact rent amount' },
              { id: 'starting_from', label: 'Starting From', desc: 'Base starting rate' },
              { id: 'on_request', label: 'Price on Request', desc: 'Discuss with tenants' }
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setPricingMode(mode.id as PricingMode)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  pricingMode === mode.id
                    ? 'border-primary bg-primary/[0.03] ring-1 ring-primary shadow-sm'
                    : 'border-[#EDEDED] bg-white hover:border-[#D1D1D6]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#1D1D1F]">{mode.label}</span>
                  {pricingMode === mode.id && <Check className="w-3.5 h-3.5 text-primary" />}
                </div>
                <span className="text-[11px] text-[#86868B] block leading-tight">
                  {mode.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* MONTHLY RENT & BILLING PERIOD */}
        {pricingMode !== 'on_request' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1D1D1F] mb-1.5">
                {isIndividualBed ? 'Bed Rent (₹)' : `${term.singular} Rent (₹)`} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B] font-bold">
                  ₹
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={rentAmount ? Number(rentAmount.replace(/[^0-9]/g, '')).toLocaleString('en-IN') : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setRentAmount(raw);
                  }}
                  placeholder="e.g. 15,000"
                  className={`w-full pl-8 pr-4 py-3 rounded-2xl border bg-white text-sm font-extrabold text-[#1D1D1F] outline-none transition-all ${
                    errors.rent
                      ? 'border-rose-300 ring-2 ring-rose-100'
                      : 'border-[#EDEDED] focus:border-[#1D1D1F] focus:ring-1 focus:ring-[#1D1D1F]'
                  }`}
                />
              </div>
              {errors.rent && <p className="text-[11px] font-semibold text-rose-600 mt-1">{errors.rent}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1D1D1F] mb-1.5">
                Billing Period
              </label>
              <select
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value as BillingPeriod)}
                className="w-full px-3.5 py-3 rounded-2xl border border-[#EDEDED] bg-white text-xs sm:text-sm font-bold text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
              >
                <option value="monthly">Monthly (Most Popular)</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily / Per Night</option>
                <option value="one_time">One-time</option>
              </select>
            </div>
          </div>
        )}

        {/* SECURITY DEPOSIT TERMS */}
        {pricingMode !== 'on_request' && (
          <div className="pt-4 border-t border-[#EDEDED] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1D1D1F]" />
                <span>Security Deposit</span>
              </label>
              <span className="text-xs font-extrabold text-[#1D1D1F] bg-[#F5F5F7] px-2.5 py-0.5 rounded-full">
                Deposit: {formatCurrency(effectiveDepositAmount)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'months', label: 'Months of Rent' },
                { id: 'fixed', label: 'Fixed Amount' },
                { id: 'none', label: 'No Deposit' },
                { id: 'custom', label: 'Custom Amount' }
              ].map((dep) => (
                <button
                  key={dep.id}
                  type="button"
                  onClick={() => setDepositType(dep.id as SecurityDepositType)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    depositType === dep.id
                      ? 'border-primary bg-primary/[0.04] text-primary shadow-sm ring-1 ring-primary'
                      : 'border-[#EDEDED] bg-white text-[#1D1D1F] hover:bg-[#F5F5F7]'
                  }`}
                >
                  {dep.label}
                </button>
              ))}
            </div>

            {depositType === 'months' && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-semibold text-[#86868B]">Number of Months:</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 6].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDepositMonths(m)}
                      className={`w-8 h-8 rounded-lg text-xs font-extrabold border transition-all ${
                        depositMonths === m
                          ? 'border-primary bg-primary text-white'
                          : 'border-[#EDEDED] bg-white text-[#86868B] hover:border-[#1D1D1F]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-[#86868B]">({depositMonths} × {formatCurrency(parsedRent)})</span>
              </div>
            )}

            {(depositType === 'fixed' || depositType === 'custom') && (
              <div className="pt-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={depositFixedAmount ? Number(depositFixedAmount.replace(/[^0-9]/g, '')).toLocaleString('en-IN') : ''}
                  onChange={(e) => setDepositFixedAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter deposit amount in ₹"
                  className="w-full max-w-xs px-3.5 py-2 rounded-xl border border-[#EDEDED] bg-white text-xs font-bold text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
                />
              </div>
            )}
          </div>
        )}

        {/* MAINTENANCE & ELECTRICITY CHARGES */}
        {pricingMode !== 'on_request' && (
          <div className="pt-4 border-t border-[#EDEDED] grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Maintenance */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#86868B]" />
                <span>Maintenance Charges</span>
              </label>
              <select
                value={maintenanceType}
                onChange={(e) => setMaintenanceType(e.target.value as MaintenanceChargesType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-bold text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
              >
                <option value="included">Included in Rent</option>
                <option value="fixed">Fixed Monthly Amount</option>
                <option value="excluded">Extra / Excluded</option>
                <option value="variable">Variable / As per Actuals</option>
                <option value="not_applicable">Not Applicable</option>
              </select>

              {maintenanceType === 'fixed' && (
                <div className="relative pt-1">
                  <span className="absolute inset-y-0 left-3 flex items-center text-xs font-bold text-[#86868B] pt-1">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={maintenanceAmount ? Number(maintenanceAmount.replace(/[^0-9]/g, '')).toLocaleString('en-IN') : ''}
                    onChange={(e) => setMaintenanceAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Monthly maintenance amount"
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#EDEDED] bg-white text-xs font-bold text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
                  />
                </div>
              )}
            </div>

            {/* Electricity */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Electricity Charges</span>
              </label>
              <select
                value={electricityType}
                onChange={(e) => setElectricityType(e.target.value as ElectricityChargesType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-bold text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
              >
                <option value="meter_based">As per Sub-Meter / Actuals</option>
                <option value="included">Included in Rent</option>
                <option value="fixed">Fixed Monthly Amount</option>
                <option value="excluded">Excluded / Extra</option>
                <option value="not_applicable">Not Applicable</option>
              </select>

              {electricityType === 'fixed' && (
                <div className="relative pt-1">
                  <span className="absolute inset-y-0 left-3 flex items-center text-xs font-bold text-[#86868B] pt-1">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={electricityAmount ? Number(electricityAmount.replace(/[^0-9]/g, '')).toLocaleString('en-IN') : ''}
                    onChange={(e) => setElectricityAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Monthly electricity amount"
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#EDEDED] bg-white text-xs font-bold text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* OTHER RECURRING CHARGES (Optional) */}
        {pricingMode !== 'on_request' && (
          <div className="pt-4 border-t border-[#EDEDED] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1D1D1F]">
                Other Recurring Charges (Optional)
              </span>
              <span className="text-[11px] text-[#86868B]">e.g. Water, Cleaning, Parking</span>
            </div>

            {otherCharges.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {otherCharges.map((chg) => (
                  <span
                    key={chg.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#EDEDED] text-xs font-bold text-[#1D1D1F]"
                  >
                    <span>{chg.name}: {formatCurrency(chg.amount)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOtherCharge(chg.id)}
                      className="text-[#86868B] hover:text-rose-600 transition-colors ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newChargeName}
                onChange={(e) => setNewChargeName(e.target.value)}
                placeholder="Charge name (e.g. Water)"
                className="flex-1 px-3 py-2 rounded-xl border border-[#EDEDED] bg-white text-xs font-medium text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
              />
              <div className="relative w-32">
                <span className="absolute inset-y-0 left-2.5 flex items-center text-xs font-bold text-[#86868B]">₹</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newChargeAmount}
                  onChange={(e) => setNewChargeAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Amount"
                  className="w-full pl-6 pr-2.5 py-2 rounded-xl border border-[#EDEDED] bg-white text-xs font-bold text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
                />
              </div>
              <button
                type="button"
                onClick={handleAddOtherCharge}
                className="px-3 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        )}

        {/* BULK APPLY BUTTON FOR UNITS / BEDS */}
        {!isEntireProperty && unitsState.length > 0 && (
          <div className="pt-4 border-t border-[#EDEDED] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[#86868B] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                {isIndividualBed
                  ? `Apply this ₹${parsedRent.toLocaleString('en-IN')} rate across all ${unitsState.reduce((sum, u) => sum + (u.beds?.length || 0), 0)} beds?`
                  : `Apply this ₹${parsedRent.toLocaleString('en-IN')} rate across all ${unitsState.length} ${term.plural.toLowerCase()}?`}
              </span>
            </div>
            <button
              type="button"
              onClick={isIndividualBed ? handleApplyDefaultsToAllBeds : handleApplyDefaultsToAllUnits}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>
                {isIndividualBed
                  ? 'Apply Default to All Beds'
                  : `Apply Default to All ${term.plural}`}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* SECTION 2: INDIVIDUAL UNIT / ROOM OVERRIDES (WHEN APPLICABLE) */}
      {/* ==================================================================== */}
      {isMultiUnitOrRoom && unitsState.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#1D1D1F] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#1D1D1F]" />
                <span>Individual {term.plural} Pricing & Availability</span>
              </h3>
              <p className="text-xs text-[#86868B] mt-0.5">
                Customize rent or availability status for specific {term.plural.toLowerCase()}.
              </p>
            </div>
            <span className="text-xs font-bold text-[#1D1D1F] bg-[#F5F5F7] px-3 py-1 rounded-full">
              {unitsState.length} {unitsState.length === 1 ? term.singular : term.plural}
            </span>
          </div>

          <div className="border border-[#EDEDED] rounded-3xl overflow-hidden divide-y divide-[#EDEDED] bg-white">
            {unitsState.map((unit) => {
              const isCustom = (unit.pricing?.monthlyRent || 0) !== parsedRent;
              return (
                <div key={unit.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FBFBFD] transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center font-black text-sm shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#1D1D1F]">
                          {unit.nameOrNumber}
                        </span>
                        {unit.unitType && (
                          <span className="text-[11px] font-semibold text-[#86868B] px-2 py-0.5 rounded-md bg-[#EDEDED]">
                            {unit.unitType}
                          </span>
                        )}
                        {isCustom ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Custom Price
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#1D1D1F] bg-[#F5F5F7] px-2 py-0.5 rounded-full">
                            Default Applied
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#86868B] mt-0.5">
                        Capacity: {unit.capacity || 1} • {unit.furnishing?.replace('_', ' ') || 'unfurnished'}
                      </p>
                    </div>
                  </div>

                  {/* CONTROLS: RENT INPUT & AVAILABILITY TOGGLE */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="relative w-32 sm:w-36">
                      <span className="absolute inset-y-0 left-3 flex items-center text-xs font-bold text-[#86868B]">₹</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={unit.pricing?.monthlyRent ? Number(unit.pricing.monthlyRent).toLocaleString('en-IN') : ''}
                        onChange={(e) => {
                          const val = Number(e.target.value.replace(/[^0-9]/g, '')) || 0;
                          handleUpdateUnitRent(unit.id, val);
                        }}
                        className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#EDEDED] bg-white text-xs font-extrabold text-[#1D1D1F] outline-none focus:border-primary"
                      />
                    </div>

                    <select
                      value={unit.availability || 'available'}
                      onChange={(e) => handleUpdateUnitAvailability(unit.id, e.target.value)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors outline-none ${
                        unit.availability === 'occupied' || unit.availability === 'fully_occupied'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : unit.availability === 'partially_occupied'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : unit.availability === 'unavailable'
                          ? 'bg-gray-100 text-gray-700 border-gray-200'
                          : 'bg-primary/[0.04] text-primary border-primary/20'
                      }`}
                    >
                      <option value="available">Available</option>
                      <option value="partially_occupied">Partially Occupied</option>
                      <option value="occupied">Fully Occupied</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 3: INDIVIDUAL BED OVERRIDES (WHEN APPLICABLE) */}
      {/* ==================================================================== */}
      {isIndividualBed && unitsState.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#1D1D1F] flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-[#1D1D1F]" />
                <span>Bed-by-Bed Pricing & Availability</span>
              </h3>
              <p className="text-xs text-[#86868B] mt-0.5">
                Set individual pricing for beds (e.g. window beds, lower bunks).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {unitsState.map((unit) => (
              <div key={unit.id} className="border border-[#EDEDED] rounded-3xl bg-white overflow-hidden p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#EDEDED] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#1D1D1F]">{unit.nameOrNumber}</span>
                    <span className="text-xs text-[#86868B]">({unit.beds?.length || 0} Beds)</span>
                  </div>
                  <span className="text-xs font-semibold text-[#86868B]">
                    Room Total: {formatCurrency((unit.beds || []).reduce((sum, b) => sum + (b.pricing?.monthlyRent || 0), 0))} / mo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {(unit.beds || []).map((bed) => {
                    const isCustom = (bed.pricing?.monthlyRent || 0) !== parsedRent;
                    return (
                      <div
                        key={bed.id}
                        className="p-3.5 rounded-2xl bg-[#FBFBFD] border border-[#EDEDED] flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-[#1D1D1F]">{bed.label}</span>
                            {isCustom && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                Custom
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#86868B] capitalize">{bed.bedType?.replace('_', ' ') || 'Single'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="relative w-24">
                            <span className="absolute inset-y-0 left-2 flex items-center text-xs font-bold text-[#86868B]">₹</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={bed.pricing?.monthlyRent ? Number(bed.pricing.monthlyRent).toLocaleString('en-IN') : ''}
                              onChange={(e) => {
                                const val = Number(e.target.value.replace(/[^0-9]/g, '')) || 0;
                                handleUpdateBedRent(unit.id, bed.id, val);
                              }}
                              className="w-full pl-5 pr-2 py-1.5 rounded-lg border border-[#EDEDED] bg-white text-xs font-extrabold text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
                            />
                          </div>

                          <select
                            value={bed.availability || 'available'}
                            onChange={(e) => handleUpdateBedAvailability(unit.id, bed.id, e.target.value)}
                            className="px-2 py-1.5 rounded-lg text-xs font-bold border border-[#EDEDED] bg-white outline-none"
                          >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="unavailable">Unavailable</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 4: MOVE-IN AVAILABILITY CALENDAR */}
      {/* ==================================================================== */}
      <div className="bg-white border border-[#EDEDED] rounded-3xl p-6 sm:p-7 space-y-4 shadow-apple-sm">
        <h3 className="text-sm sm:text-base font-extrabold text-[#1D1D1F] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#1D1D1F]" />
          <span>Move-in Availability</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'immediate', label: 'Available Now' },
            { id: 'specific_date', label: 'Available from Date' },
            { id: 'currently_unavailable', label: 'Currently Unavailable' },
            { id: 'temporarily_unavailable', label: 'Temporarily Unavailable' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setAvailType(item.id as PropertyAvailabilityType)}
              className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all ${
                availType === item.id
                  ? 'border-primary bg-primary/[0.04] text-primary ring-1 ring-primary shadow-sm'
                  : 'border-[#EDEDED] bg-[#FBFBFD] text-[#1D1D1F] hover:bg-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {availType === 'specific_date' && (
          <div className="pt-2 max-w-xs">
            <label className="block text-xs font-bold text-[#1D1D1F] mb-1.5">
              Select Availability Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              min={todayStr}
              value={availDate}
              onChange={(e) => setAvailDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-bold text-[#1D1D1F] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.availDate && (
              <p className="text-[11px] font-semibold text-rose-600 mt-1">{errors.availDate}</p>
            )}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* NAVIGATION ACTION CONTROLS */}
      {/* ==================================================================== */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#EDEDED]">
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={isSaving}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2 transition-all shadow-apple-sm disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving Pricing...</span>
            </>
          ) : (
            <>
              <span>Save & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
