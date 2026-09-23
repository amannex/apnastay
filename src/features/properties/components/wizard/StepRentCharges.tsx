'use client';

import React, { useState, useMemo } from 'react';
import {
  IndianRupee,
  ShieldCheck,
  Wrench,
  Zap,
  Receipt,
  Plus,
  Minus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import type {
  Property,
  PropertyPricing,
  PropertyAvailability,
  PropertyUnit,
  SecurityDepositType,
  MaintenanceChargesType,
  ElectricityChargesType,
  OtherRecurringCharge
} from '../../types';
import { formatCurrency, calculateEffectiveDeposit, createDefaultPricing } from '../../pricing';

export interface StepRentChargesProps {
  property: Property;
  onBack: () => void;
  onSave: (pricingData: {
    propertyPricing: PropertyPricing;
    propertyAvailability: PropertyAvailability;
    units?: PropertyUnit[];
  }) => Promise<void> | void;
  isSaving?: boolean;
}

export default function StepRentCharges({
  property,
  onSave
}: StepRentChargesProps) {
  const propertyType = property.propertyType;
  const rentalStructure = property.rentalStructure || 'entire_property';
  const isEntireProperty = rentalStructure === 'entire_property';

  // Sensible default fallback
  const initialPricing = useMemo(() => {
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

  // 1. Monthly Rent
  const [rentAmount, setRentAmount] = useState<string>(() => {
    return initialPricing.monthlyRent ? String(initialPricing.monthlyRent) : '15000';
  });

  // 2. Security Deposit
  const [depositType, setDepositType] = useState<SecurityDepositType>(() => {
    return initialPricing.securityDepositConfig?.type || 'months';
  });
  const [depositMonths, setDepositMonths] = useState<number>(() => {
    return initialPricing.securityDepositConfig?.monthsCount || 2;
  });
  const [depositFixedAmount, setDepositFixedAmount] = useState<string>(() => {
    if (initialPricing.securityDepositConfig?.amount) {
      return String(initialPricing.securityDepositConfig.amount);
    }
    if (initialPricing.securityDeposit) {
      return String(initialPricing.securityDeposit);
    }
    return '30000';
  });

  // 3. Maintenance Charges
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceChargesType>(() => {
    return initialPricing.maintenanceChargesConfig?.type || 'included';
  });
  const [maintenanceAmount, setMaintenanceAmount] = useState<string>(() => {
    if (initialPricing.maintenanceChargesConfig?.amount) {
      return String(initialPricing.maintenanceChargesConfig.amount);
    }
    if (initialPricing.maintenance) {
      return String(initialPricing.maintenance);
    }
    return '1500';
  });

  // 4. Electricity Charges
  const [electricityType, setElectricityType] = useState<ElectricityChargesType>(() => {
    return initialPricing.electricityChargesConfig?.type || 'meter_based';
  });
  const [electricityAmount, setElectricityAmount] = useState<string>(() => {
    if (initialPricing.electricityChargesConfig?.amount) {
      return String(initialPricing.electricityChargesConfig.amount);
    }
    return '500';
  });

  // 5. Additional / Other Recurring Charges
  const [otherCharges, setOtherCharges] = useState<OtherRecurringCharge[]>(() => {
    return initialPricing.otherCharges || [];
  });
  const [newChargeName, setNewChargeName] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState('');
  const [showAddChargeInput, setShowAddChargeInput] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parsed numerical calculations
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

  const handleAdjustRent = (delta: number) => {
    const nextVal = Math.max(0, parsedRent + delta);
    setRentAmount(String(nextVal));
    if (errors.rent) setErrors((prev) => ({ ...prev, rent: '' }));
  };

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
        period: 'monthly'
      }
    ]);
    setNewChargeName('');
    setNewChargeAmount('');
    setShowAddChargeInput(false);
  };

  const handleRemoveOtherCharge = (id: string) => {
    setOtherCharges((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!parsedRent || parsedRent <= 0) {
      errs.rent = 'Please enter a valid monthly rent amount.';
    }

    if (depositType === 'fixed' || depositType === 'custom') {
      const dep = Number(depositFixedAmount.replace(/[^0-9]/g, ''));
      if (isNaN(dep) || dep < 0) {
        errs.deposit = 'Please enter a valid security deposit amount.';
      }
    }

    if (maintenanceType === 'fixed') {
      if (isNaN(parsedMaintenance) || parsedMaintenance < 0) {
        errs.maintenance = 'Please enter a valid maintenance amount.';
      }
    }

    if (electricityType === 'fixed') {
      if (isNaN(parsedElectricity) || parsedElectricity < 0) {
        errs.electricity = 'Please enter a valid electricity amount.';
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setErrorMsg(Object.values(errs)[0]);
      return;
    }

    setErrors({});
    setErrorMsg(null);

    const compiledPropertyPricing: PropertyPricing = {
      ...(property.pricing || {}),
      pricingMode: 'fixed',
      amount: parsedRent,
      currency: 'INR',
      billingPeriod: 'monthly',
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

    // Keep existing availability or set default immediate
    const compiledPropertyAvailability: PropertyAvailability = {
      type: property.availability?.type || 'immediate',
      availableFrom: property.availability?.availableFrom
    };

    // Keep units synchronized if present
    const updatedUnits = isEntireProperty
      ? undefined
      : (property.units || []).map((u) => ({
          ...u,
          pricing: {
            ...u.pricing,
            ...compiledPropertyPricing,
            monthlyRent: u.pricing?.monthlyRent || parsedRent,
            amount: u.pricing?.monthlyRent || parsedRent
          }
        }));

    onSave({
      propertyPricing: compiledPropertyPricing,
      propertyAvailability: compiledPropertyAvailability,
      units: updatedUnits
    });
  };

  return (
    <form
      id="rent-charges-form"
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto py-2 space-y-9 animate-fade-in"
      noValidate
    >
      {/* SECTION HEADING (Airbnb Style) */}
      <div className="space-y-1">
        <h1 className="font-outfit text-2xl sm:text-[30px] font-semibold text-[#222222] tracking-tight">
          Rent & charges
        </h1>
        <p className="font-inter text-sm sm:text-base text-[#717171] leading-normal">
          Set your monthly rent, security deposit, and utility charges.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-primary flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-primary" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. MONTHLY RENT HERO INPUT */}
      <div className="py-6 sm:py-8 flex flex-col items-center justify-center bg-[#F7F7F7] rounded-3xl border border-[#EBEBEB] text-center space-y-3 px-4">
        <span className="font-inter text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#717171]">
          Monthly Rent
        </span>

        <div className="flex items-center justify-center gap-1">
          <span className="text-3xl sm:text-5xl font-extrabold text-[#222222]">₹</span>
          <input
            type="text"
            inputMode="numeric"
            value={rentAmount ? Number(rentAmount.replace(/[^0-9]/g, '')).toLocaleString('en-IN') : ''}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '');
              setRentAmount(raw);
              if (errors.rent) setErrors((prev) => ({ ...prev, rent: '' }));
            }}
            placeholder="0"
            className="max-w-[280px] sm:max-w-[360px] text-3xl sm:text-5xl font-extrabold text-[#222222] bg-transparent text-center outline-none border-b-2 border-transparent focus:border-[#222222] transition-colors tracking-tight placeholder:text-[#C4C4C4]"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleAdjustRent(-1000)}
            className="w-8 h-8 rounded-full border border-[#D1D1D6] hover:border-[#717171] bg-white flex items-center justify-center text-sm font-bold text-[#222222] active:scale-95 transition-all shadow-xs"
            title="Decrease ₹1,000"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-inter text-xs font-medium text-[#717171]">
            / month
          </span>
          <button
            type="button"
            onClick={() => handleAdjustRent(1000)}
            className="w-8 h-8 rounded-full border border-[#D1D1D6] hover:border-[#717171] bg-white flex items-center justify-center text-sm font-bold text-[#222222] active:scale-95 transition-all shadow-xs"
            title="Increase ₹1,000"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {errors.rent && (
          <p className="font-inter text-xs font-semibold text-primary pt-1">
            {errors.rent}
          </p>
        )}
      </div>

      {/* 2. CHARGES BREAKDOWN SECTION */}
      <div className="space-y-4">
        <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
          Deposits & utilities
        </h2>

        <div className="space-y-3 sm:space-y-4 divide-y divide-[#F2F2F2]">
          {/* Security deposit */}
          <div className="pt-2 sm:pt-2.5 pb-2 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:pt-1">
              <div className="w-9 h-9 rounded-xl bg-[#F7F7F7] flex items-center justify-center text-[#222222] shrink-0">
                <ShieldCheck className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div>
                <span className="font-inter text-sm sm:text-base font-medium text-[#222222] block">
                  Security deposit
                </span>
                <span className="font-inter text-xs text-[#717171]">
                  {depositType === 'months'
                    ? `${depositMonths} month${depositMonths > 1 ? 's' : ''} rent (${formatCurrency(parsedRent * depositMonths)})`
                    : depositType === 'none'
                    ? 'No deposit required'
                    : `Deposit: ${formatCurrency(Number(depositFixedAmount.replace(/[^0-9]/g, '')) || 0)}`}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-start sm:justify-end">
                {[
                  { id: '1_month', label: '1 month', type: 'months', months: 1 },
                  { id: '2_months', label: '2 months', type: 'months', months: 2 },
                  { id: 'fixed', label: 'Fixed amount', type: 'fixed' },
                  { id: 'none', label: 'No deposit', type: 'none' }
                ].map((opt) => {
                  const isSelected =
                    opt.type === 'none'
                      ? depositType === 'none'
                      : opt.type === 'fixed'
                      ? depositType === 'fixed' || depositType === 'custom'
                      : depositType === 'months' && depositMonths === opt.months;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        if (opt.type === 'none') {
                          setDepositType('none');
                        } else if (opt.type === 'fixed') {
                          setDepositType('fixed');
                        } else {
                          setDepositType('months');
                          if (opt.months) {
                            setDepositMonths(opt.months);
                          }
                        }
                      }}
                      className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
                        isSelected
                          ? 'border border-[#717171] bg-[#F7F7F7] font-semibold text-[#222222]'
                          : 'border border-[#E0E0E0] bg-white font-medium text-[#222222] hover:border-[#717171]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {(depositType === 'fixed' || depositType === 'custom') && (
                <div className="relative w-full sm:w-48 mt-1">
                  <span className="absolute inset-y-0 left-3 flex items-center text-xs sm:text-sm font-semibold text-[#717171]">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={depositFixedAmount ? Number(depositFixedAmount.replace(/[^0-9]/g, '')).toLocaleString('en-IN') : ''}
                    onChange={(e) => setDepositFixedAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 25,000"
                    className="w-full pl-7 pr-3 py-1.5 sm:py-2 rounded-xl border border-[#E0E0E0] focus:border-[#717171] focus:outline-none text-xs sm:text-sm text-[#222222] font-semibold transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Maintenance charges */}
          <div className="pt-3 pb-2 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:pt-1">
              <div className="w-9 h-9 rounded-xl bg-[#F7F7F7] flex items-center justify-center text-[#222222] shrink-0">
                <Wrench className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div>
                <span className="font-inter text-sm sm:text-base font-medium text-[#222222] block">
                  Maintenance
                </span>
                <span className="font-inter text-xs text-[#717171]">
                  {maintenanceType === 'included'
                    ? 'Included in monthly rent'
                    : maintenanceType === 'fixed'
                    ? `Fixed ₹${(Number(maintenanceAmount.replace(/[^0-9]/g, '')) || 0).toLocaleString('en-IN')} / month`
                    : 'Not applicable'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-start sm:justify-end">
                {[
                  { id: 'included', label: 'Included in rent' },
                  { id: 'fixed', label: 'Fixed amount' },
                  { id: 'not_applicable', label: 'Not applicable' }
                ].map((opt) => {
                  const isSelected = maintenanceType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMaintenanceType(opt.id as MaintenanceChargesType)}
                      className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
                        isSelected
                          ? 'border border-[#717171] bg-[#F7F7F7] font-semibold text-[#222222]'
                          : 'border border-[#E0E0E0] bg-white font-medium text-[#222222] hover:border-[#717171]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {maintenanceType === 'fixed' && (
                <div className="relative w-full sm:w-48 mt-1">
                  <span className="absolute inset-y-0 left-3 flex items-center text-xs sm:text-sm font-semibold text-[#717171]">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={maintenanceAmount ? Number(maintenanceAmount.replace(/[^0-9]/g, '')).toLocaleString('en-IN') : ''}
                    onChange={(e) => setMaintenanceAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 1,500 / month"
                    className="w-full pl-7 pr-3 py-1.5 sm:py-2 rounded-xl border border-[#E0E0E0] focus:border-[#717171] focus:outline-none text-xs sm:text-sm text-[#222222] font-semibold transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Electricity charges */}
          <div className="pt-3 pb-2 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:pt-1">
              <div className="w-9 h-9 rounded-xl bg-[#F7F7F7] flex items-center justify-center text-[#222222] shrink-0">
                <Zap className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div>
                <span className="font-inter text-sm sm:text-base font-medium text-[#222222] block">
                  Electricity
                </span>
                <span className="font-inter text-xs text-[#717171]">
                  {electricityType === 'meter_based'
                    ? 'As per meter / actual units'
                    : electricityType === 'included'
                    ? 'Included in monthly rent'
                    : electricityType === 'fixed'
                    ? `Fixed ₹${(Number(electricityAmount.replace(/[^0-9]/g, '')) || 0).toLocaleString('en-IN')} / month`
                    : 'Excluded'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-start sm:justify-end">
                {[
                  { id: 'meter_based', label: 'As per meter' },
                  { id: 'included', label: 'Included in rent' },
                  { id: 'fixed', label: 'Fixed amount' },
                  { id: 'excluded', label: 'Excluded' }
                ].map((opt) => {
                  const isSelected = electricityType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setElectricityType(opt.id as ElectricityChargesType)}
                      className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
                        isSelected
                          ? 'border border-[#717171] bg-[#F7F7F7] font-semibold text-[#222222]'
                          : 'border border-[#E0E0E0] bg-white font-medium text-[#222222] hover:border-[#717171]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {electricityType === 'fixed' && (
                <div className="relative w-full sm:w-48 mt-1">
                  <span className="absolute inset-y-0 left-3 flex items-center text-xs sm:text-sm font-semibold text-[#717171]">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={electricityAmount ? Number(electricityAmount.replace(/[^0-9]/g, '')).toLocaleString('en-IN') : ''}
                    onChange={(e) => setElectricityAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 500 / month"
                    className="w-full pl-7 pr-3 py-1.5 sm:py-2 rounded-xl border border-[#E0E0E0] focus:border-[#717171] focus:outline-none text-xs sm:text-sm text-[#222222] font-semibold transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional / Other Recurring Charges */}
          <div className="pt-3 pb-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F7F7F7] flex items-center justify-center text-[#222222] shrink-0">
                  <Receipt className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div>
                  <span className="font-inter text-sm sm:text-base font-medium text-[#222222] block">
                    Additional charges <span className="text-xs font-normal text-[#717171]">(Optional)</span>
                  </span>
                  <span className="font-inter text-xs text-[#717171]">
                    Water, parking, cleaning, or other recurring fees
                  </span>
                </div>
              </div>

              {!showAddChargeInput && (
                <button
                  type="button"
                  onClick={() => setShowAddChargeInput(true)}
                  className="px-3.5 py-1.5 rounded-full border border-[#E0E0E0] hover:border-[#717171] bg-white text-xs font-semibold text-[#222222] transition-colors inline-flex items-center gap-1 cursor-pointer select-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add charge</span>
                </button>
              )}
            </div>

            {/* List of existing other charges */}
            {otherCharges.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1 pl-12">
                {otherCharges.map((chg) => (
                  <span
                    key={chg.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E0E0E0] bg-[#F7F7F7] text-xs font-medium text-[#222222]"
                  >
                    <span>{chg.name}: {formatCurrency(chg.amount)} / mo</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOtherCharge(chg.id)}
                      className="text-[#86868B] hover:text-primary transition-colors cursor-pointer"
                      title="Remove charge"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add charge inline input */}
            {showAddChargeInput && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 pl-0 sm:pl-12">
                <input
                  type="text"
                  value={newChargeName}
                  onChange={(e) => setNewChargeName(e.target.value)}
                  placeholder="Charge name (e.g. Water, Parking)"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#E0E0E0] focus:border-[#717171] focus:outline-none text-xs sm:text-sm text-[#222222]"
                />
                <div className="relative w-full sm:w-36">
                  <span className="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-[#717171]">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newChargeAmount}
                    onChange={(e) => setNewChargeAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Amount"
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#E0E0E0] focus:border-[#717171] focus:outline-none text-xs sm:text-sm text-[#222222] font-semibold"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddOtherCharge}
                    disabled={!newChargeName.trim() || !newChargeAmount}
                    className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-black text-white text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddChargeInput(false);
                      setNewChargeName('');
                      setNewChargeAmount('');
                    }}
                    className="px-3 py-2 rounded-xl text-xs text-[#717171] hover:text-[#222222] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
