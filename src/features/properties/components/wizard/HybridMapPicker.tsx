'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapPin,
  Crosshair,
  Navigation,
  Compass,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Search,
  X
} from 'lucide-react';

export interface DetectedAddressComponents {
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  formattedAddress?: string;
  streetAddress?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

interface HybridMapPickerProps {
  initialLatitude?: number;
  initialLongitude?: number;
  onCoordinatesChange: (lat: number, lng: number) => void;
  onAddressDetected?: (components: DetectedAddressComponents) => void;
  cityHint?: string;
  localityHint?: string;
}

// Default fallback coordinates: Greater Noida / NCR
const DEFAULT_LAT = 28.4744;
const DEFAULT_LNG = 77.5040;

export default function HybridMapPicker({
  initialLatitude,
  initialLongitude,
  onCoordinatesChange,
  onAddressDetected,
  cityHint,
  localityHint
}: HybridMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || '';
  const isGoogleProvider = Boolean(googleApiKey);

  const [lat, setLat] = useState<number>(initialLatitude || DEFAULT_LAT);
  const [lng, setLng] = useState<number>(initialLongitude || DEFAULT_LNG);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [detectedAddress, setDetectedAddress] = useState<DetectedAddressComponents | null>(null);
  const [appliedBadge, setAppliedBadge] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Reverse Geocoding (OpenStreetMap Nominatim)
  // Uses format=json (which supports CORS access-control-allow-origin: *)
  // --------------------------------------------------------------------------
  const reverseGeocodeOSM = useCallback(
    async (latitude: number, longitude: number, autoApply = false) => {
      setIsGeocoding(true);
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};

          // In India, locality can be suburb, neighbourhood, residential area, village, or quarter
          const locality =
            addr.suburb ||
            addr.neighbourhood ||
            addr.residential ||
            addr.quarter ||
            addr.village ||
            addr.subdivision ||
            addr.city_district ||
            addr.commercial ||
            addr.hamlet ||
            '';

          // City can be city, town, municipality, or district
          const city =
            addr.city ||
            addr.town ||
            addr.municipality ||
            addr.city_district ||
            addr.county ||
            addr.state_district ||
            addr.district ||
            '';

          const state = addr.state || addr.province || '';
          const pincode = (addr.postcode || '').replace(/\D/g, '');
          const streetAddress =
            [addr.house_number || addr.building || addr.amenity, addr.road]
              .filter(Boolean)
              .join(', ') || addr.road || '';

          if (locality || city || state || pincode || streetAddress) {
            const components: DetectedAddressComponents = {
              locality,
              city,
              state,
              pincode,
              formattedAddress: data.display_name,
              streetAddress
            };
            setDetectedAddress(components);

            if (autoApply && onAddressDetected) {
              onAddressDetected(components);
              setAppliedBadge(true);
            } else {
              setAppliedBadge(false);
            }
          }
        }
      } catch (err) {
        console.warn('[ApnaStay Map] Reverse geocode error:', err);
      } finally {
        setIsGeocoding(false);
      }
    },
    [onAddressDetected]
  );

  // --------------------------------------------------------------------------
  // Provider 1: OpenStreetMap + Leaflet (100% Free / Default)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (isGoogleProvider) return; // Will initialize Google Maps instead
    let isCancelled = false;

    async function initLeaflet() {
      try {
        setIsLoading(true);

        // Inject Leaflet CSS dynamically if missing
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Dynamically import leaflet
        const L = (await import('leaflet')).default;

        if (isCancelled || !mapContainerRef.current) return;

        // Clean up previous instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const centerLat = initialLatitude || DEFAULT_LAT;
        const centerLng = initialLongitude || DEFAULT_LNG;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 14,
          zoomControl: false,
          scrollWheelZoom: false
        });

        // Add smooth zoom controls top-right
        L.control.zoom({ position: 'topright' }).addTo(map);

        // OpenStreetMap clean tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Custom ApnaStay styled SVG marker icon
        const customIcon = L.divIcon({
          className: 'apnastay-map-pin',
          html: `
            <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(37, 99, 235, 0.2); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; width: 26px; height: 26px; border-radius: 50%; background: #1D1D1F; border: 3px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: #22C55E;"></div>
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker([centerLat, centerLng], {
          draggable: true,
          icon: customIcon
        }).addTo(map);

        marker.bindTooltip('Drag me to exact property location', {
          permanent: false,
          direction: 'top'
        });

        const handlePositionUpdate = (newLat: number, newLng: number) => {
          setLat(newLat);
          setLng(newLng);
          onCoordinatesChange(newLat, newLng);
          reverseGeocodeOSM(newLat, newLng);
        };

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          handlePositionUpdate(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
        });

        map.on('click', (e: any) => {
          const pos = e.latlng;
          marker.setLatLng(pos);
          handlePositionUpdate(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        // Invalidate size once rendered
        setTimeout(() => {
          map.invalidateSize();
          setIsLoading(false);
        }, 200);
      } catch (err: any) {
        console.error('[ApnaStay Map] Leaflet init error:', err);
        setMapError('Unable to render map. You can still enter your address manually below.');
        setIsLoading(false);
      }
    }

    initLeaflet();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isGoogleProvider, initialLatitude, initialLongitude, onCoordinatesChange, reverseGeocodeOSM]);

  // --------------------------------------------------------------------------
  // Provider 2: Google Maps (When NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is Provided)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isGoogleProvider) return;
    let isCancelled = false;

    function initGoogleMaps() {
      if (!window.google || !window.google.maps) {
        // Load Google Maps Script
        const scriptId = 'google-maps-script';
        if (!document.getElementById(scriptId)) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = () => {
            if (!isCancelled) setupGoogleMap();
          };
          script.onerror = () => {
            if (!isCancelled) {
              setMapError('Failed to load Google Maps. Please check your API key.');
              setIsLoading(false);
            }
          };
          document.head.appendChild(script);
        } else {
          setupGoogleMap();
        }
      } else {
        setupGoogleMap();
      }
    }

    function setupGoogleMap() {
      if (!mapContainerRef.current || !window.google) return;

      try {
        const center = {
          lat: initialLatitude || DEFAULT_LAT,
          lng: initialLongitude || DEFAULT_LNG
        };

        const map = new window.google.maps.Map(mapContainerRef.current, {
          center,
          zoom: 14,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false
        });

        const marker = new window.google.maps.Marker({
          position: center,
          map,
          draggable: true,
          title: 'Property Location'
        });

        const geocoder = new window.google.maps.Geocoder();

        const handleGooglePosition = (newLat: number, newLng: number) => {
          setLat(newLat);
          setLng(newLng);
          onCoordinatesChange(newLat, newLng);

          setIsGeocoding(true);
          geocoder.geocode(
            { location: { lat: newLat, lng: newLng } },
            (results: any, status: any) => {
              setIsGeocoding(false);
              if (status === 'OK' && results && results[0]) {
                const components = results[0].address_components || [];
                let locality = '';
                let city = '';
                let state = '';
                let pincode = '';

                for (const c of components) {
                  const types = c.types || [];
                  if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
                    locality = c.long_name;
                  }
                  if (types.includes('locality')) {
                    city = c.long_name;
                  }
                  if (types.includes('administrative_area_level_1')) {
                    state = c.long_name;
                  }
                  if (types.includes('postal_code')) {
                    pincode = c.long_name;
                  }
                }

                setDetectedAddress({
                  locality,
                  city,
                  state,
                  pincode,
                  formattedAddress: results[0].formatted_address
                });
                setAppliedBadge(false);
              }
            }
          );
        };

        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          if (pos) {
            handleGooglePosition(Number(pos.lat().toFixed(6)), Number(pos.lng().toFixed(6)));
          }
        });

        map.addListener('click', (e: any) => {
          if (e.latLng) {
            marker.setPosition(e.latLng);
            handleGooglePosition(Number(e.latLng.lat().toFixed(6)), Number(e.latLng.lng().toFixed(6)));
          }
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        setIsLoading(false);
      } catch (err: any) {
        console.error('[ApnaStay Map] Google Maps setup error:', err);
        setMapError('Error initializing Google Maps.');
        setIsLoading(false);
      }
    }

    initGoogleMaps();

    return () => {
      isCancelled = true;
    };
  }, [isGoogleProvider, googleApiKey, initialLatitude, initialLongitude, onCoordinatesChange]);

  // --------------------------------------------------------------------------
  // GPS Device Geolocation ("Detect My Location")
  // --------------------------------------------------------------------------
  const handleDetectLocation = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = Number(position.coords.latitude.toFixed(6));
        const newLng = Number(position.coords.longitude.toFixed(6));

        setLat(newLat);
        setLng(newLng);
        onCoordinatesChange(newLat, newLng);

        if (mapInstanceRef.current) {
          if (isGoogleProvider) {
            mapInstanceRef.current.setCenter({ lat: newLat, lng: newLng });
            mapInstanceRef.current.setZoom(16);
            if (markerRef.current) {
              markerRef.current.setPosition({ lat: newLat, lng: newLng });
            }
          } else {
            mapInstanceRef.current.setView([newLat, newLng], 16);
            if (markerRef.current) {
              markerRef.current.setLatLng([newLat, newLng]);
            }
          }
        }

        // Auto-apply address so clicking "Use current location" reflects immediately in the fields
        reverseGeocodeOSM(newLat, newLng, true);
        setIsLocating(false);
      },
      (error) => {
        console.warn('[ApnaStay Map] Geolocation permission denied or failed:', error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // --------------------------------------------------------------------------
  // Search City / Area (OSM Nominatim Search)
  // Non-form implementation prevents outer form submission & page refresh
  // --------------------------------------------------------------------------
  const handleSearchPlace = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!searchQuery.trim()) return;

    try {
      setIsGeocoding(true);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery.trim()
      )}&countrycodes=in&limit=1`;
      const res = await fetch(url);
      if (res.ok) {
        const results = await res.json();
        if (results && results[0]) {
          const newLat = Number(parseFloat(results[0].lat).toFixed(6));
          const newLng = Number(parseFloat(results[0].lon).toFixed(6));

          setLat(newLat);
          setLng(newLng);
          onCoordinatesChange(newLat, newLng);

          if (mapInstanceRef.current) {
            if (isGoogleProvider) {
              mapInstanceRef.current.setCenter({ lat: newLat, lng: newLng });
              mapInstanceRef.current.setZoom(15);
              if (markerRef.current) markerRef.current.setPosition({ lat: newLat, lng: newLng });
            } else {
              mapInstanceRef.current.setView([newLat, newLng], 15);
              if (markerRef.current) markerRef.current.setLatLng([newLat, newLng]);
            }
          }

          // Auto-apply so the searched address reflects directly in the fields
          reverseGeocodeOSM(newLat, newLng, true);
        }
      }
    } catch (err) {
      console.warn('[ApnaStay Map] Place search error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleApplyAddress = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (detectedAddress && onAddressDetected) {
      onAddressDetected(detectedAddress);
      setAppliedBadge(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* SEARCH PLACE SEARCHBAR & CURRENT LOCATION BUTTON (No <form> to avoid nested form submission) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleSearchPlace();
              }
            }}
            placeholder="Search neighbourhood, society, or landmark..."
            className="w-full pl-5 pr-14 py-3 rounded-full border border-[#B0B0B0] hover:border-[#222222] focus:border-[#222222] focus:outline-none text-xs sm:text-sm text-[#222222] placeholder:font-inter placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-[#9E9E9E] bg-white transition-colors"
          />
          <div className="absolute right-1.5 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSearchQuery('');
                }}
                className="p-1.5 text-[#717171] hover:text-[#222222] rounded-full transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSearchPlace();
              }}
              disabled={isGeocoding || !searchQuery.trim()}
              title="Search location"
              className="w-9 h-9 rounded-full bg-[#222222] hover:bg-black text-white flex items-center justify-center transition-all disabled:opacity-40 active:scale-95 shrink-0"
            >
              {isGeocoding ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Search className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isLocating}
          className="px-4 py-3 rounded-full border border-[#B0B0B0] hover:border-[#222222] text-[#222222] text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shrink-0 bg-white"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#222222]" />
          ) : (
            <Crosshair className="w-3.5 h-3.5 text-[#222222]" />
          )}
          <span>{isLocating ? 'Locating...' : 'Use current location'}</span>
        </button>
      </div>

      {/* CONFIRM ADDRESS BANNER WHEN DETECTED FROM MAP */}
      {detectedAddress && (detectedAddress.locality || detectedAddress.city || detectedAddress.state) && (
        <div className="bg-[#F7F7F7] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-[#717171] uppercase tracking-wider block">
              Location detected on map
            </span>
            <p className="text-xs sm:text-sm font-medium text-[#222222] truncate">
              {detectedAddress.formattedAddress ||
                [detectedAddress.locality, detectedAddress.city, detectedAddress.state, detectedAddress.pincode]
                  .filter(Boolean)
                  .join(', ')}
            </p>
          </div>
          <button
            type="button"
            onClick={handleApplyAddress}
            className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              appliedBadge
                ? 'bg-[#222222] text-white opacity-90'
                : 'bg-[#222222] hover:bg-black text-white active:scale-95'
            }`}
          >
            {appliedBadge ? '✓ Details filled into form' : 'Confirm & fill address'}
          </button>
        </div>
      )}

      {/* ERROR ALERT */}
      {mapError && (
        <div className="p-3 rounded-xl bg-[#F7F7F7] text-[#717171] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#717171] shrink-0" />
          <span>{mapError}</span>
        </div>
      )}

      {/* BORDERLESS MAP CANVAS CONTAINER WITH ISOLATION */}
      <div
        className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-[#F7F7F7] z-0"
        style={{ isolation: 'isolate' }}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-xs font-medium text-[#717171]">
            <Loader2 className="w-5 h-5 animate-spin text-[#222222]" />
            <span>Loading map...</span>
          </div>
        )}

        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* COORDINATES DISPLAY & PIN INSTRUCTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-[#717171]">
        <p className="text-[11px] sm:text-xs">
          Drag the pin or map to fine-tune the exact location.
        </p>
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span>Coordinates:</span>
          <span>
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
          {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-[#222222] ml-1" />}
        </div>
      </div>
    </div>
  );
}
