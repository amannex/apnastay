'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Building,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import type { PropertyType, RentalStructure } from '../../types';
import { getPropertyTemplate } from '../../templates';
import HybridMapPicker, { DetectedAddressComponents } from './HybridMapPicker';

export interface LocationFormData {
  addressLine1: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  hideExactAddress?: boolean;
}

interface StepLocationProps {
  propertyType: PropertyType;
  customPropertyType?: string;
  rentalStructure: RentalStructure;
  initialValues?: Partial<LocationFormData>;
  onBack: (currentValues: LocationFormData) => void;
  onSave: (data: LocationFormData) => Promise<void> | void;
  isSaving?: boolean;
}

const COMMON_INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

export default function StepLocation({
  propertyType,
  customPropertyType,
  rentalStructure,
  initialValues,
  onBack,
  onSave,
  isSaving = false
}: StepLocationProps) {
  const template = getPropertyTemplate(propertyType);

  // Form State
  const [addressLine1, setAddressLine1] = useState<string>(initialValues?.addressLine1 || '');
  const [locality, setLocality] = useState<string>(initialValues?.locality || '');
  const [city, setCity] = useState<string>(initialValues?.city || '');
  const [state, setState] = useState<string>(initialValues?.state || '');
  const [pincode, setPincode] = useState<string>(initialValues?.pincode || '');
  const [landmark, setLandmark] = useState<string>(initialValues?.landmark || '');
  const [hideExactAddress, setHideExactAddress] = useState<boolean>(
    initialValues?.hideExactAddress ?? false
  );

  // Interactive Map State
  const [showMap, setShowMap] = useState<boolean>(true);

  // Advanced Coordinates (Optional / Future map support)
  const [showCoordinates, setShowCoordinates] = useState<boolean>(
    Boolean(initialValues?.latitude || initialValues?.longitude)
  );
  const [latitude, setLatitude] = useState<string>(
    initialValues?.latitude !== undefined ? String(initialValues.latitude) : ''
  );
  const [longitude, setLongitude] = useState<string>(
    initialValues?.longitude !== undefined ? String(initialValues.longitude) : ''
  );

  // Validation Errors
  const [errors, setErrors] = useState<{
    addressLine1?: string;
    locality?: string;
    city?: string;
    state?: string;
    pincode?: string;
    coordinates?: string;
  }>({});

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const initializedRef = React.useRef(false);

  // Sync state if initialValues arrive asynchronously (e.g. after draft fetch)
  useEffect(() => {
    if (!initializedRef.current && initialValues) {
      if (initialValues.addressLine1) setAddressLine1(initialValues.addressLine1);
      if (initialValues.locality) setLocality(initialValues.locality);
      if (initialValues.city) setCity(initialValues.city);
      if (initialValues.state) setState(initialValues.state);
      if (initialValues.pincode) setPincode(initialValues.pincode);
      if (initialValues.landmark) setLandmark(initialValues.landmark);
      if (initialValues.hideExactAddress !== undefined) {
        setHideExactAddress(initialValues.hideExactAddress);
      }
      if (initialValues.latitude !== undefined) {
        setLatitude(String(initialValues.latitude));
        setShowCoordinates(true);
      }
      if (initialValues.longitude !== undefined) {
        setLongitude(String(initialValues.longitude));
        setShowCoordinates(true);
      }

      if (
        initialValues.addressLine1 ||
        initialValues.locality ||
        initialValues.city ||
        initialValues.pincode
      ) {
        initializedRef.current = true;
      }
    }
  }, [initialValues]);

  const getCurrentFormData = (): LocationFormData => {
    const latNum = latitude.trim() ? parseFloat(latitude.trim()) : undefined;
    const lngNum = longitude.trim() ? parseFloat(longitude.trim()) : undefined;

    return {
      addressLine1: addressLine1.trim(),
      locality: locality.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      landmark: landmark.trim() || undefined,
      latitude: !isNaN(latNum as number) ? latNum : undefined,
      longitude: !isNaN(lngNum as number) ? lngNum : undefined,
      hideExactAddress
    };
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    const trimmedAddress = addressLine1.trim();
    const trimmedLocality = locality.trim();
    const trimmedCity = city.trim();
    const trimmedState = state.trim();
    const trimmedPincode = pincode.trim();

    if (!trimmedAddress) {
      newErrors.addressLine1 = 'Please enter the street address / building details.';
    } else if (trimmedAddress.length < 5) {
      newErrors.addressLine1 = 'Address must be at least 5 characters.';
    }

    if (!trimmedLocality) {
      newErrors.locality = 'Please enter the locality or area (e.g. Sector 62, Koramangala).';
    } else if (trimmedLocality.length < 2) {
      newErrors.locality = 'Locality must be at least 2 characters.';
    }

    if (!trimmedCity) {
      newErrors.city = 'Please enter the city.';
    } else if (trimmedCity.length < 2) {
      newErrors.city = 'City must be at least 2 characters.';
    }

    if (!trimmedState) {
      newErrors.state = 'Please enter or select the state.';
    }

    // Validate 6-digit Indian PIN code (cannot start with 0)
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!trimmedPincode) {
      newErrors.pincode = 'Please enter the 6-digit PIN code.';
    } else if (!pincodeRegex.test(trimmedPincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit Indian PIN code (e.g. 201310).';
    }

    // Validate coordinates if provided
    if (latitude.trim() || longitude.trim()) {
      const latNum = parseFloat(latitude.trim());
      const lngNum = parseFloat(longitude.trim());
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        newErrors.coordinates = 'Latitude must be a valid number between -90 and 90.';
      } else if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        newErrors.coordinates = 'Longitude must be a valid number between -180 and 180.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(getCurrentFormData());
    }
  };

  const handleAddressDetected = (detected: DetectedAddressComponents) => {
    if (detected.locality) {
      setLocality(detected.locality);
      if (errors.locality) setErrors((prev) => ({ ...prev, locality: undefined }));
    }
    if (detected.city) {
      setCity(detected.city);
      if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
    }
    if (detected.state) {
      setState(detected.state);
      if (errors.state) setErrors((prev) => ({ ...prev, state: undefined }));
    }
    if (detected.pincode) {
      const cleaned = detected.pincode.replace(/[^0-9]/g, '');
      if (cleaned.length === 6) {
        setPincode(cleaned);
        if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: undefined }));
      }
    }
  };

  const handleBackClick = () => {
    onBack(getCurrentFormData());
  };

  const formatDisplayAddress = () => {
    const parts = [
      locality.trim(),
      city.trim(),
      state.trim() ? `${state.trim()}` : '',
      pincode.trim() ? `- ${pincode.trim()}` : ''
    ].filter(Boolean);

    if (parts.length === 0) return 'e.g. Knowledge Park 2, Greater Noida, Uttar Pradesh - 201310';
    return parts.join(' ');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in" noValidate>
      {/* SECTION HEADER */}
      <div className="border-b border-[#EDEDED] pb-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
          Property Location
        </h2>
        <p className="text-xs sm:text-sm text-[#86868B] mt-1">
          Add the address and pinpoint your property on the map.
        </p>
      </div>

      <div className="space-y-5">
        {/* 0. INTERACTIVE HYBRID MAP PICKER (OPENSTREETMAP + GOOGLE MAPS) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Map & Pin Location</span>
            </span>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="text-xs font-semibold text-primary hover:underline transition-colors"
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>

          {showMap && (
            <HybridMapPicker
              initialLatitude={latitude ? parseFloat(latitude) : undefined}
              initialLongitude={longitude ? parseFloat(longitude) : undefined}
              onCoordinatesChange={(newLat, newLng) => {
                setLatitude(String(newLat));
                setLongitude(String(newLng));
                setShowCoordinates(true);
                if (errors.coordinates) setErrors((prev) => ({ ...prev, coordinates: undefined }));
              }}
              onAddressDetected={handleAddressDetected}
              cityHint={city}
              localityHint={locality}
            />
          )}
        </div>

        {/* 1. ADDRESS LINE 1 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="address-line1"
              className="text-sm font-bold text-[#1D1D1F] flex items-center gap-1.5"
            >
              <Building className="w-4 h-4 text-[#86868B]" />
              <span>Flat / House No., Building Name & Street</span>
              <span className="text-rose-500">*</span>
            </label>
          </div>

          <input
            id="address-line1"
            type="text"
            value={addressLine1}
            onChange={(e) => {
              setAddressLine1(e.target.value);
              if (errors.addressLine1) setErrors((prev) => ({ ...prev, addressLine1: undefined }));
            }}
            onBlur={() => handleBlur('addressLine1')}
            placeholder="e.g. Flat 402, Tower B, Lotus Greens Boulevard, Sector 100"
            className={`w-full px-4 py-3.5 rounded-2xl bg-[#F5F5F7] border text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:bg-white focus:outline-none transition-all ${
              errors.addressLine1
                ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50'
                : 'border-[#EDEDED] focus:border-[#1D1D1F] focus:ring-4 focus:ring-black/5'
            }`}
          />

          {errors.addressLine1 && (
            <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.addressLine1}</span>
            </p>
          )}
        </div>

        {/* 2. LOCALITY / AREA & LANDMARK (2 COLS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* LOCALITY / AREA */}
          <div className="space-y-2">
            <label
              htmlFor="property-locality"
              className="text-sm font-bold text-[#1D1D1F] flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-[#86868B]" />
              <span>Locality / Area</span>
              <span className="text-rose-500">*</span>
            </label>

            <input
              id="property-locality"
              type="text"
              value={locality}
              onChange={(e) => {
                setLocality(e.target.value);
                if (errors.locality) setErrors((prev) => ({ ...prev, locality: undefined }));
              }}
              onBlur={() => handleBlur('locality')}
              placeholder="e.g. Knowledge Park 2, Sector 62, Koramangala"
              className={`w-full px-4 py-3.5 rounded-2xl bg-[#F5F5F7] border text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:bg-white focus:outline-none transition-all ${
                errors.locality
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50'
                  : 'border-[#EDEDED] focus:border-[#1D1D1F] focus:ring-4 focus:ring-black/5'
              }`}
            />

            <p className="text-xs text-[#86868B]">
              Neighbourhood, sector, or colony name tenants search by.
            </p>

            {errors.locality && (
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.locality}</span>
              </p>
            )}
          </div>

          {/* LANDMARK */}
          <div className="space-y-2">
            <label
              htmlFor="property-landmark"
              className="text-sm font-bold text-[#1D1D1F] flex items-center gap-1.5"
            >
              <Navigation className="w-4 h-4 text-[#86868B]" />
              <span>Landmark (Optional)</span>
            </label>

            <input
              id="property-landmark"
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near Pari Chowk Metro / Opposite Sharda Hospital"
              className="w-full px-4 py-3.5 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:bg-white focus:border-[#1D1D1F] focus:ring-4 focus:ring-black/5 focus:outline-none transition-all"
            />

            <p className="text-xs text-[#86868B]">
              Prominent nearby metro station, hospital, mall, or university.
            </p>
          </div>
        </div>

        {/* 3. CITY, STATE & PINCODE (3 COLS) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* CITY */}
          <div className="space-y-2">
            <label
              htmlFor="property-city"
              className="text-sm font-bold text-[#1D1D1F] flex items-center gap-1.5"
            >
              <span>City</span>
              <span className="text-rose-500">*</span>
            </label>

            <input
              id="property-city"
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
              }}
              onBlur={() => handleBlur('city')}
              placeholder="e.g. Greater Noida"
              className={`w-full px-4 py-3.5 rounded-2xl bg-[#F5F5F7] border text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:bg-white focus:outline-none transition-all ${
                errors.city
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50'
                  : 'border-[#EDEDED] focus:border-[#1D1D1F] focus:ring-4 focus:ring-black/5'
              }`}
            />

            {errors.city && (
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.city}</span>
              </p>
            )}
          </div>

          {/* STATE */}
          <div className="space-y-2">
            <label
              htmlFor="property-state"
              className="text-sm font-bold text-[#1D1D1F] flex items-center gap-1.5"
            >
              <span>State / UT</span>
              <span className="text-rose-500">*</span>
            </label>

            <div className="relative">
              <input
                id="property-state"
                type="text"
                list="indian-states-list"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  if (errors.state) setErrors((prev) => ({ ...prev, state: undefined }));
                }}
                onBlur={() => handleBlur('state')}
                placeholder="e.g. Uttar Pradesh"
                className={`w-full px-4 py-3.5 rounded-2xl bg-[#F5F5F7] border text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:bg-white focus:outline-none transition-all ${
                  errors.state
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50'
                    : 'border-[#EDEDED] focus:border-[#1D1D1F] focus:ring-4 focus:ring-black/5'
                }`}
              />
              <datalist id="indian-states-list">
                {COMMON_INDIAN_STATES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            {errors.state && (
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.state}</span>
              </p>
            )}
          </div>

          {/* PINCODE */}
          <div className="space-y-2">
            <label
              htmlFor="property-pincode"
              className="text-sm font-bold text-[#1D1D1F] flex items-center gap-1.5"
            >
              <span>PIN Code</span>
              <span className="text-rose-500">*</span>
            </label>

            <input
              id="property-pincode"
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => {
                // Keep only numeric characters
                const cleaned = e.target.value.replace(/[^0-9]/g, '');
                setPincode(cleaned);
                if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: undefined }));
              }}
              onBlur={() => handleBlur('pincode')}
              placeholder="e.g. 201310"
              className={`w-full px-4 py-3.5 rounded-2xl bg-[#F5F5F7] border text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:bg-white focus:outline-none transition-all font-mono tracking-wider ${
                errors.pincode
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50'
                  : 'border-[#EDEDED] focus:border-[#1D1D1F] focus:ring-4 focus:ring-black/5'
              }`}
            />

            {errors.pincode && (
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.pincode}</span>
              </p>
            )}
          </div>
        </div>

        {/* 4. PRIVACY TOGGLE BOX */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] transition-all">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hideExactAddress}
              onChange={(e) => setHideExactAddress(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-[#1D1D1F] focus:ring-black/10 border-[#EDEDED]"
            />
            <div className="space-y-1">
              <div className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                {hideExactAddress ? (
                  <EyeOff className="w-4 h-4 text-amber-600" />
                ) : (
                  <Eye className="w-4 h-4 text-emerald-600" />
                )}
                <span>Protect exact street address & flat number</span>
              </div>
              <p className="text-xs text-[#86868B] leading-relaxed">
                {hideExactAddress
                  ? 'Only Locality and City will be shown publicly in search results. Your exact building/flat number will be shared only after a booking is confirmed or inquiry approved.'
                  : 'Full address will be visible to prospective tenants on the property page.'}
              </p>
            </div>
          </label>
        </div>

        {/* 5. FUTURE MAP COORDINATES ACCORDION (OPTIONAL) */}
        <div className="border border-[#EDEDED] rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowCoordinates(!showCoordinates)}
            className="w-full px-4 py-3.5 bg-white hover:bg-[#F5F5F7] flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#86868B]" />
              <span className="text-xs sm:text-sm font-bold text-[#1D1D1F]">
                Map Coordinates & Pin (Optional)
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Future Map Support
              </span>
            </div>
            {showCoordinates ? (
              <ChevronUp className="w-4 h-4 text-[#86868B]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#86868B]" />
            )}
          </button>

          {showCoordinates && (
            <div className="p-4 sm:p-5 bg-[#F9F9FB] border-t border-[#EDEDED] space-y-4 animate-fade-in">
              <p className="text-xs text-[#86868B] flex items-center gap-1.5">
                <Info className="w-4 h-4 shrink-0 text-blue-600" />
                <span>
                  ApnaStay supports GPS coordinates to position your listing precisely on future search maps. You can leave this blank if you do not have exact coordinates.
                </span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="coord-lat" className="text-xs font-bold text-[#1D1D1F]">
                    Latitude
                  </label>
                  <input
                    id="coord-lat"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => {
                      setLatitude(e.target.value);
                      if (errors.coordinates) setErrors((prev) => ({ ...prev, coordinates: undefined }));
                    }}
                    placeholder="e.g. 28.4744"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EDEDED] text-xs text-[#1D1D1F] focus:border-[#1D1D1F] focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="coord-lng" className="text-xs font-bold text-[#1D1D1F]">
                    Longitude
                  </label>
                  <input
                    id="coord-lng"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => {
                      setLongitude(e.target.value);
                      if (errors.coordinates) setErrors((prev) => ({ ...prev, coordinates: undefined }));
                    }}
                    placeholder="e.g. 77.5040"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EDEDED] text-xs text-[#1D1D1F] focus:border-[#1D1D1F] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {errors.coordinates && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.coordinates}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* 6. TENANT SEARCH PREVIEW */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EDEDED] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#86868B]">
            <span className="flex items-center gap-1.5 text-[#1D1D1F]">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Location Preview</span>
            </span>
            <span className="text-[11px] font-semibold text-[#1D1D1F] bg-[#F5F5F7] px-2 py-0.5 rounded-full">
              Search Discoverable
            </span>
          </div>

          <div className="text-sm font-extrabold text-[#1D1D1F]">
            {formatDisplayAddress()}
          </div>

          {landmark.trim() && (
            <p className="text-xs text-[#86868B]">
              <span className="font-semibold text-[#1D1D1F]">Landmark:</span> {landmark.trim()}
            </p>
          )}

          {addressLine1.trim() && (
            <p className="text-xs text-[#86868B] pt-1 border-t border-[#EDEDED]">
              <span className="font-semibold">Full Address:</span> {addressLine1.trim()}
              {hideExactAddress && (
                <span className="text-[#86868B] ml-1 font-semibold">
                  (Private — shown only after booking confirmation)
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* BOTTOM ACTION BUTTONS */}
      <div className="pt-4 border-t border-[#EDEDED] flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBackClick}
          disabled={isSaving}
          className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
    </form>
  );
}
