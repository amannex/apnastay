'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, MapPin, X, Check } from 'lucide-react';
import type { PropertyType, RentalStructure } from '../../types';
import HybridMapPicker, { DetectedAddressComponents } from './HybridMapPicker';

export interface LocationFormData {
  addressLine1: string;
  address?: string; // Private exact address alias
  locality: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  hideExactAddress?: boolean;
  publicLocation?: string; // Public approximate location e.g. "Sector 62, Noida"
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

export const INDIAN_STATES_AND_CITIES: Record<string, string[]> = {
  'Andaman and Nicobar Islands': ['Port Blair'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Rajahmundry', 'Kakinada', 'Kadapa', 'Anantapur'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tezpur', 'Tinsukia'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif'],
  'Chandigarh': ['Chandigarh'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'Dwarka', 'Rohini', 'Saket', 'Connaught Place'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Manali'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Udhampur'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad', 'Belagavi', 'Shivamogga', 'Tumakuru', 'Manipal', 'Udupi'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam'],
  'Ladakh': ['Leh', 'Kargil'],
  'Lakshadweep': ['Kavaratti'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Navi Mumbai', 'Chhatrapati Sambhajinagar', 'Solapur', 'Kolhapur'],
  'Manipur': ['Imphal', 'Churachandpur', 'Thoubal'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore'],
  'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Sikar'],
  'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Vellore', 'Erode'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Secunderabad'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar'],
  'Uttar Pradesh': ['Noida', 'Greater Noida', 'Ghaziabad', 'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh', 'Moradabad', 'Gorakhpur', 'Mathura'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Nainital'],
  'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol', 'Bidhannagar', 'Kharagpur']
};

export const STATE_ALIASES: Record<string, string> = {
  'nct of delhi': 'Delhi',
  'national capital territory of delhi': 'Delhi',
  'delhi': 'Delhi',
  'new delhi': 'Delhi',
  'up': 'Uttar Pradesh',
  'uttar pradesh': 'Uttar Pradesh',
  'mp': 'Madhya Pradesh',
  'madhya pradesh': 'Madhya Pradesh',
  'ap': 'Andhra Pradesh',
  'andhra pradesh': 'Andhra Pradesh',
  'tn': 'Tamil Nadu',
  'tamil nadu': 'Tamil Nadu',
  'tamilnadu': 'Tamil Nadu',
  'ka': 'Karnataka',
  'karnataka': 'Karnataka',
  'mh': 'Maharashtra',
  'maharashtra': 'Maharashtra',
  'wb': 'West Bengal',
  'west bengal': 'West Bengal',
  'orissa': 'Odisha',
  'odisha': 'Odisha',
  'uttaranchal': 'Uttarakhand',
  'uttarakhand': 'Uttarakhand',
  'pondicherry': 'Puducherry',
  'puducherry': 'Puducherry',
  'telengana': 'Telangana',
  'telangana': 'Telangana',
  'jammu & kashmir': 'Jammu and Kashmir',
  'j&k': 'Jammu and Kashmir',
  'andaman and nicobar islands': 'Andaman and Nicobar Islands',
  'andaman and nicobar': 'Andaman and Nicobar Islands',
  'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'dadra and nagar haveli and daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'lakshadweep': 'Lakshadweep'
};

export default function StepLocation({
  initialValues,
  onBack,
  onSave,
  isSaving = false
}: StepLocationProps) {
  // Form State
  const [addressLine1, setAddressLine1] = useState<string>(
    initialValues?.addressLine1 || initialValues?.address || ''
  );
  const [locality, setLocality] = useState<string>(initialValues?.locality || '');
  const [state, setState] = useState<string>(initialValues?.state || '');
  const [city, setCity] = useState<string>(initialValues?.city || '');
  const [customCity, setCustomCity] = useState<string>('');
  const [isCustomCity, setIsCustomCity] = useState<boolean>(false);
  const [pincode, setPincode] = useState<string>(initialValues?.pincode || '');
  const [hideExactAddress, setHideExactAddress] = useState<boolean>(
    initialValues?.hideExactAddress ?? true
  );

  // Map state
  const [latitude, setLatitude] = useState<string>(
    initialValues?.latitude !== undefined
      ? String(initialValues.latitude)
      : initialValues?.coordinates?.latitude !== undefined
      ? String(initialValues.coordinates.latitude)
      : ''
  );
  const [longitude, setLongitude] = useState<string>(
    initialValues?.longitude !== undefined
      ? String(initialValues.longitude)
      : initialValues?.coordinates?.longitude !== undefined
      ? String(initialValues.coordinates.longitude)
      : ''
  );

  // Popup confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [addressFilledBadge, setAddressFilledBadge] = useState<boolean>(false);

  // Validation Errors
  const [errors, setErrors] = useState<{
    addressLine1?: string;
    locality?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }>({});

  const initializedRef = useRef(false);

  // Available cities for selected state
  const availableCities = state && INDIAN_STATES_AND_CITIES[state] ? INDIAN_STATES_AND_CITIES[state] : [];

  // Sync state if initialValues arrive asynchronously (e.g. after draft fetch)
  useEffect(() => {
    if (!initializedRef.current && initialValues) {
      if (initialValues.addressLine1 || initialValues.address) {
        setAddressLine1(initialValues.addressLine1 || initialValues.address || '');
      }
      if (initialValues.locality) setLocality(initialValues.locality);
      if (initialValues.state) setState(initialValues.state);
      if (initialValues.city) {
        const initCity = initialValues.city;
        setCity(initCity);
        if (initialValues.state && INDIAN_STATES_AND_CITIES[initialValues.state]) {
          const list = INDIAN_STATES_AND_CITIES[initialValues.state];
          if (!list.includes(initCity)) {
            setIsCustomCity(true);
            setCustomCity(initCity);
          }
        }
      }
      if (initialValues.pincode) setPincode(initialValues.pincode);
      if (initialValues.hideExactAddress !== undefined) {
        setHideExactAddress(initialValues.hideExactAddress);
      }
      if (initialValues.latitude !== undefined) {
        setLatitude(String(initialValues.latitude));
      } else if (initialValues.coordinates?.latitude !== undefined) {
        setLatitude(String(initialValues.coordinates.latitude));
      }
      if (initialValues.longitude !== undefined) {
        setLongitude(String(initialValues.longitude));
      } else if (initialValues.coordinates?.longitude !== undefined) {
        setLongitude(String(initialValues.coordinates.longitude));
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

  const handleStateChange = (newState: string) => {
    setState(newState);
    if (errors.state) setErrors((prev) => ({ ...prev, state: undefined }));

    const citiesInNewState = INDIAN_STATES_AND_CITIES[newState] || [];
    // If current city is in the new state, keep it, otherwise reset or keep custom
    if (city && !citiesInNewState.includes(city) && !isCustomCity) {
      setCity('');
    }
  };

  const handleCitySelectChange = (value: string) => {
    if (value === '__other__') {
      setIsCustomCity(true);
      setCity(customCity);
    } else {
      setIsCustomCity(false);
      setCity(value);
      if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
    }
  };

  const handleCustomCityChange = (val: string) => {
    setCustomCity(val);
    setCity(val);
    if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
  };

  const getCurrentFormData = (): LocationFormData => {
    const latNum = latitude ? parseFloat(latitude) : undefined;
    const lngNum = longitude ? parseFloat(longitude) : undefined;
    const coords =
      latNum !== undefined && lngNum !== undefined && !isNaN(latNum) && !isNaN(lngNum)
        ? { latitude: latNum, longitude: lngNum }
        : undefined;

    const finalCity = isCustomCity ? customCity.trim() : city.trim();
    const computedPublicLoc = [locality.trim(), finalCity].filter(Boolean).join(', ');

    return {
      addressLine1: addressLine1.trim(),
      address: addressLine1.trim(),
      locality: locality.trim(),
      city: finalCity,
      state: state.trim(),
      pincode: pincode.trim(),
      latitude: latNum,
      longitude: lngNum,
      coordinates: coords,
      hideExactAddress,
      publicLocation: computedPublicLoc || undefined
    };
  };

  const validate = (): boolean => {
    const newErrors: {
      addressLine1?: string;
      locality?: string;
      city?: string;
      state?: string;
      pincode?: string;
    } = {};

    const trimmedAddress = addressLine1.trim();
    const trimmedLocality = locality.trim();
    const finalCity = isCustomCity ? customCity.trim() : city.trim();
    const trimmedState = state.trim();
    const trimmedPincode = pincode.trim();

    if (!trimmedAddress) {
      newErrors.addressLine1 = 'Please enter your street address.';
    } else if (trimmedAddress.length < 5) {
      newErrors.addressLine1 = 'Address must be at least 5 characters.';
    }

    if (!trimmedLocality) {
      newErrors.locality = 'Please enter the locality or sector.';
    } else if (trimmedLocality.length < 2) {
      newErrors.locality = 'Locality must be at least 2 characters.';
    }

    if (!trimmedState) {
      newErrors.state = 'Please select a state.';
    }

    if (!finalCity) {
      newErrors.city = 'Please select or enter a city.';
    } else if (finalCity.length < 2) {
      newErrors.city = 'City must be at least 2 characters.';
    }

    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!trimmedPincode) {
      newErrors.pincode = 'Please enter the 6-digit PIN code.';
    } else if (!pincodeRegex.test(trimmedPincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit PIN code.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Called when form is submitted by clicking Next
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setShowConfirmModal(true);
    }
  };

  // Called when user confirms location in popup modal
  const handleConfirmLocationModal = () => {
    setShowConfirmModal(false);
    onSave(getCurrentFormData());
  };

  const handleAddressDetected = (detected: DetectedAddressComponents) => {
    // 1. Street Address
    if (detected.streetAddress) {
      setAddressLine1(detected.streetAddress);
      if (errors.addressLine1) setErrors((prev) => ({ ...prev, addressLine1: undefined }));
    } else if (detected.formattedAddress && !addressLine1.trim()) {
      setAddressLine1(detected.formattedAddress);
      if (errors.addressLine1) setErrors((prev) => ({ ...prev, addressLine1: undefined }));
    }

    // 2. Locality
    if (detected.locality) {
      setLocality(detected.locality);
      if (errors.locality) setErrors((prev) => ({ ...prev, locality: undefined }));
    }

    // 3. State
    let matchedState = '';
    if (detected.state) {
      const stateTrimmed = detected.state.trim();
      const stateLower = stateTrimmed.toLowerCase();
      matchedState = STATE_ALIASES[stateLower] || '';
      if (!matchedState) {
        const allStates = Object.keys(INDIAN_STATES_AND_CITIES);
        const found = allStates.find(
          (s) =>
            s.toLowerCase() === stateLower ||
            stateLower.includes(s.toLowerCase()) ||
            s.toLowerCase().includes(stateLower)
        );
        if (found) matchedState = found;
      }

      if (matchedState) {
        setState(matchedState);
        if (errors.state) setErrors((prev) => ({ ...prev, state: undefined }));
      } else {
        setState(stateTrimmed);
      }
    }

    // 4. City
    const stateToUse = matchedState || state;
    const citiesInState =
      stateToUse && INDIAN_STATES_AND_CITIES[stateToUse]
        ? INDIAN_STATES_AND_CITIES[stateToUse]
        : [];

    if (detected.city) {
      const detectedCityTrimmed = detected.city.trim();
      const foundCity = citiesInState.find(
        (c) =>
          c.toLowerCase() === detectedCityTrimmed.toLowerCase() ||
          detectedCityTrimmed.toLowerCase().includes(c.toLowerCase()) ||
          c.toLowerCase().includes(detectedCityTrimmed.toLowerCase())
      );

      if (foundCity) {
        setCity(foundCity);
        setIsCustomCity(false);
        setCustomCity('');
      } else {
        setCity(detectedCityTrimmed);
        setCustomCity(detectedCityTrimmed);
        setIsCustomCity(true);
      }
      if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
    } else if (detected.locality) {
      const foundFromLocality = citiesInState.find(
        (c) => c.toLowerCase() === detected.locality!.trim().toLowerCase()
      );
      if (foundFromLocality) {
        setCity(foundFromLocality);
        setIsCustomCity(false);
        setCustomCity('');
        if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
      }
    }

    // 5. PIN code
    if (detected.pincode) {
      const cleaned = detected.pincode.replace(/[^0-9]/g, '');
      if (cleaned.length === 6) {
        setPincode(cleaned);
        if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: undefined }));
      }
    }

    setAddressFilledBadge(true);
    setTimeout(() => {
      setAddressFilledBadge(false);
    }, 4500);
  };

  const finalCityDisplay = isCustomCity ? customCity : city;

  return (
    <>
      <form
        id="location-form"
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mx-auto animate-fade-in py-2 space-y-6"
        noValidate
      >
        {/* TITLE OF STEP CENTERED */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="font-outfit text-2xl sm:text-[32px] font-semibold text-[#222222] tracking-tight leading-tight">
            Where is your property located?
          </h1>
          <p className="font-inter text-sm sm:text-base text-[#717171] leading-relaxed">
            Add your property&apos;s location so tenants can find accommodation in the right area.
          </p>
        </div>

        {/* FEEDBACK BADGE WHEN LOCATION IS FILLED FROM MAP */}
        {addressFilledBadge && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-medium animate-fade-in font-inter">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Location details detected from map and populated below.</span>
          </div>
        )}

        {/* CLEAN INPUT FIELDS */}
        <div className="space-y-4">
          {/* Street Address */}
          <div>
            <label htmlFor="address-line1" className="block text-xs font-semibold text-[#222222] mb-1.5 font-inter">
              Street address
            </label>
            <input
              id="address-line1"
              type="text"
              value={addressLine1}
              onChange={(e) => {
                setAddressLine1(e.target.value);
                if (errors.addressLine1) setErrors((prev) => ({ ...prev, addressLine1: undefined }));
              }}
              placeholder="House / Flat No., Building, Street"
              className="w-full px-4 py-3 rounded-xl border border-[#B0B0B0] text-sm sm:text-base text-[#222222] placeholder:font-inter placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-[#9E9E9E] focus:border-[#222222] focus:outline-none transition-colors bg-white font-inter"
            />
            {errors.addressLine1 && (
              <p className="text-xs text-[#222222] mt-1 font-inter">{errors.addressLine1}</p>
            )}
          </div>

          {/* Locality / Sector */}
          <div>
            <label htmlFor="property-locality" className="block text-xs font-semibold text-[#222222] mb-1.5 font-inter">
              Locality / Sector
            </label>
            <input
              id="property-locality"
              type="text"
              value={locality}
              onChange={(e) => {
                setLocality(e.target.value);
                if (errors.locality) setErrors((prev) => ({ ...prev, locality: undefined }));
              }}
              placeholder="e.g. Sector 62, Koramangala, Indirapuram"
              className="w-full px-4 py-3 rounded-xl border border-[#B0B0B0] text-sm sm:text-base text-[#222222] placeholder:font-inter placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-[#9E9E9E] focus:border-[#222222] focus:outline-none transition-colors bg-white font-inter"
            />
            {errors.locality && (
              <p className="text-xs text-[#222222] mt-1 font-inter">{errors.locality}</p>
            )}
          </div>

          {/* State & City Dropdowns (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* State Dropdown */}
            <div>
              <label htmlFor="property-state" className="block text-xs font-semibold text-[#222222] mb-1.5 font-inter">
                State / UT
              </label>
              <div className="relative">
                <select
                  id="property-state"
                  value={state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className={`w-full px-4 py-3 pr-10 rounded-xl border border-[#B0B0B0] bg-white focus:border-[#222222] focus:outline-none transition-colors appearance-none cursor-pointer font-inter ${
                    !state
                      ? 'text-xs sm:text-[13px] text-[#9E9E9E]'
                      : 'text-sm sm:text-base text-[#222222]'
                  }`}
                >
                  <option value="" disabled className="text-xs sm:text-[13px] text-[#9E9E9E]">
                    Select State / UT
                  </option>
                  {Object.keys(INDIAN_STATES_AND_CITIES).map((s) => (
                    <option key={s} value={s} className="text-sm text-[#222222]">
                      {s}
                    </option>
                  ))}
                  {state && !Object.keys(INDIAN_STATES_AND_CITIES).includes(state) && (
                    <option value={state} className="text-sm text-[#222222]">{state}</option>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-[#717171] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.state && (
                <p className="text-xs text-[#222222] mt-1 font-inter">{errors.state}</p>
              )}
            </div>

            {/* City Dropdown */}
            <div>
              <label htmlFor="property-city" className="block text-xs font-semibold text-[#222222] mb-1.5 font-inter">
                City
              </label>
              <div className="relative">
                <select
                  id="property-city"
                  value={isCustomCity ? '__other__' : city}
                  disabled={!state}
                  onChange={(e) => handleCitySelectChange(e.target.value)}
                  className={`w-full px-4 py-3 pr-10 rounded-xl border border-[#B0B0B0] bg-white disabled:bg-[#F7F7F7] disabled:text-[#9E9E9E] disabled:cursor-not-allowed focus:border-[#222222] focus:outline-none transition-colors appearance-none cursor-pointer font-inter ${
                    !city && !isCustomCity
                      ? 'text-xs sm:text-[13px] text-[#9E9E9E]'
                      : 'text-sm sm:text-base text-[#222222]'
                  }`}
                >
                  <option value="" disabled className="text-xs sm:text-[13px] text-[#9E9E9E]">
                    {state ? 'Select City' : 'Select State first'}
                  </option>
                  {availableCities.map((c) => (
                    <option key={c} value={c} className="text-sm text-[#222222]">
                      {c}
                    </option>
                  ))}
                  <option value="__other__" className="text-sm text-[#222222]">Other (Enter city name)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#717171] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Custom City text input when "Other" is chosen */}
              {isCustomCity && (
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => handleCustomCityChange(e.target.value)}
                  placeholder="Enter city name"
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-[#B0B0B0] text-sm sm:text-base text-[#222222] placeholder:font-inter placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-[#9E9E9E] focus:border-[#222222] focus:outline-none transition-colors bg-white font-inter"
                />
              )}

              {errors.city && (
                <p className="text-xs text-[#222222] mt-1 font-inter">{errors.city}</p>
              )}
            </div>
          </div>

          {/* PIN code */}
          <div>
            <label htmlFor="property-pincode" className="block text-xs font-semibold text-[#222222] mb-1.5 font-inter">
              PIN code
            </label>
            <input
              id="property-pincode"
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9]/g, '');
                setPincode(cleaned);
                if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: undefined }));
              }}
              placeholder="6-digit PIN"
              className="w-full px-4 py-3 rounded-xl border border-[#B0B0B0] text-sm sm:text-base text-[#222222] placeholder:font-inter placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-[#9E9E9E] focus:border-[#222222] focus:outline-none transition-colors font-mono bg-white"
            />
            {errors.pincode && (
              <p className="text-xs text-[#222222] mt-1 font-inter">{errors.pincode}</p>
            )}
          </div>
        </div>

        {/* BORDERLESS MAP WITH ISOLATED STACKING CONTEXT */}
        <div className="pt-2 relative z-0" style={{ isolation: 'isolate' }}>
          <HybridMapPicker
            initialLatitude={latitude ? parseFloat(latitude) : undefined}
            initialLongitude={longitude ? parseFloat(longitude) : undefined}
            onCoordinatesChange={(newLat, newLng) => {
              setLatitude(String(newLat));
              setLongitude(String(newLng));
            }}
            onAddressDetected={handleAddressDetected}
            cityHint={finalCityDisplay}
            localityHint={locality}
          />
        </div>
      </form>

      {/* LOCATION CONFIRMATION POPUP MODAL */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-location-title"
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative animate-scale-in">
            {/* Close icon */}
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="absolute right-5 top-5 p-2 text-[#717171] hover:text-[#222222] rounded-full hover:bg-[#F7F7F7] transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1.5 pr-8">
              <div className="w-10 h-10 rounded-2xl bg-[#F7F7F7] flex items-center justify-center text-[#222222] mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 id="confirm-location-title" className="font-outfit text-xl sm:text-2xl font-semibold text-[#222222] tracking-tight">
                Confirm property location
              </h2>
              <p className="font-inter text-xs sm:text-sm text-[#717171] leading-relaxed">
                Please verify that the address details below are accurate before proceeding to the next step.
              </p>
            </div>

            {/* Location Details Card */}
            <div className="bg-[#F7F7F7] rounded-2xl p-4 sm:p-5 space-y-3 font-inter text-xs sm:text-sm">
              <div>
                <span className="text-[#717171] text-xs block">Street address</span>
                <p className="font-medium text-[#222222] mt-0.5">{addressLine1}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#EBEBEB]">
                <div>
                  <span className="text-[#717171] text-xs block">Locality / Sector</span>
                  <p className="font-medium text-[#222222] mt-0.5">{locality}</p>
                </div>
                <div>
                  <span className="text-[#717171] text-xs block">City</span>
                  <p className="font-medium text-[#222222] mt-0.5">{finalCityDisplay}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#EBEBEB]">
                <div>
                  <span className="text-[#717171] text-xs block">State / UT</span>
                  <p className="font-medium text-[#222222] mt-0.5">{state}</p>
                </div>
                <div>
                  <span className="text-[#717171] text-xs block">PIN code</span>
                  <p className="font-medium text-[#222222] mt-0.5 font-mono">{pincode}</p>
                </div>
              </div>

              {latitude && longitude && (
                <div className="pt-1 border-t border-[#EBEBEB]">
                  <span className="text-[#717171] text-xs block">Map Coordinates</span>
                  <p className="font-mono text-xs text-[#222222] mt-0.5">
                    {parseFloat(latitude).toFixed(5)}, {parseFloat(longitude).toFixed(5)}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-3 rounded-xl border border-[#B0B0B0] hover:border-[#222222] text-[#222222] text-xs sm:text-sm font-semibold transition-colors"
              >
                Edit details
              </button>
              <button
                type="button"
                onClick={handleConfirmLocationModal}
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-[#222222] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shadow-apple-xs"
              >
                <span>Confirm & Continue</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
