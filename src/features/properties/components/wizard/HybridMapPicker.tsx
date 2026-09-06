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
  Search
} from 'lucide-react';

export interface DetectedAddressComponents {
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  formattedAddress?: string;
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
  // --------------------------------------------------------------------------
  const reverseGeocodeOSM = useCallback(
    async (latitude: number, longitude: number) => {
      setIsGeocoding(true);
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`;
        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};

          const locality =
            addr.suburb ||
            addr.neighbourhood ||
            addr.residential ||
            addr.commercial ||
            addr.quarter ||
            addr.city_district ||
            '';

          const city =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.county ||
            '';

          const state = addr.state || '';
          const pincode = addr.postcode || '';

          if (locality || city || state || pincode) {
            setDetectedAddress({
              locality,
              city,
              state,
              pincode,
              formattedAddress: data.display_name
            });
            setAppliedBadge(false);
          }
        }
      } catch (err) {
        console.warn('[ApnaStay Map] Reverse geocode error:', err);
      } finally {
        setIsGeocoding(false);
      }
    },
    []
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
  const handleDetectLocation = () => {
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

        reverseGeocodeOSM(newLat, newLng);
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
  // --------------------------------------------------------------------------
  const handleSearchPlace = async (e: React.FormEvent) => {
    e.preventDefault();
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

          reverseGeocodeOSM(newLat, newLng);
        }
      }
    } catch (err) {
      console.warn('[ApnaStay Map] Place search error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleApplyAddress = () => {
    if (detectedAddress && onAddressDetected) {
      onAddressDetected(detectedAddress);
      setAppliedBadge(true);
    }
  };

  return (
    <div className="rounded-2xl border border-[#EDEDED] bg-white overflow-hidden shadow-apple-sm transition-all space-y-3 p-4">
      {/* MAP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#1D1D1F] flex items-center gap-1.5">
              <span>Interactive Map & Pin</span>
              {isGoogleProvider ? (
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  Google Maps
                </span>
              ) : (
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  Free OpenStreetMap
                </span>
              )}
            </h4>
            <p className="text-[11px] text-[#86868B]">
              Click anywhere on map or drag the pin to pinpoint your property.
            </p>
          </div>
        </div>

        {/* GPS BUTTON */}
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isLocating}
          className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-[#EDEDED] text-[#1D1D1F] text-xs font-bold inline-flex items-center gap-1.5 transition-all self-start sm:self-center disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
          ) : (
            <Crosshair className="w-3.5 h-3.5 text-blue-600" />
          )}
          <span>{isLocating ? 'Detecting GPS...' : 'Use My Current Location'}</span>
        </button>
      </div>

      {/* SEARCH PLACE SEARCHBAR */}
      <form onSubmit={handleSearchPlace} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search neighbourhood, society, or metro station..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F5F5F7] text-xs text-[#1D1D1F] placeholder:text-[#86868B] border border-transparent focus:border-[#1D1D1F] focus:bg-white focus:outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={isGeocoding || !searchQuery.trim()}
          className="px-3.5 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-40"
        >
          {isGeocoding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Find on Map'}
        </button>
      </form>

      {/* ERROR ALERT */}
      {mapError && (
        <div className="p-3 rounded-xl bg-amber-50 text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{mapError}</span>
        </div>
      )}

      {/* MAP CANVAS CONTAINER */}
      <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-[#EDEDED] bg-[#F5F5F7]">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-xs font-semibold text-[#86868B]">
            <Loader2 className="w-5 h-5 animate-spin text-[#1D1D1F]" />
            <span>Loading interactive map...</span>
          </div>
        )}

        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* COORDINATES DISPLAY & ADDRESS AUTO-FILL BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#EDEDED]">
        <div className="flex items-center gap-2 text-xs text-[#86868B] font-mono">
          <span className="font-semibold text-[#1D1D1F]">Coordinates:</span>
          <span>
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
          {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-blue-600 ml-1" />}
        </div>

        {/* DETECTED ADDRESS PILL */}
        {detectedAddress && (detectedAddress.locality || detectedAddress.city) && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#1D1D1F] font-semibold truncate max-w-[220px]">
              {[detectedAddress.locality, detectedAddress.city].filter(Boolean).join(', ')}
            </span>
            <button
              type="button"
              onClick={handleApplyAddress}
              disabled={appliedBadge}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-all ${
                appliedBadge
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
              }`}
            >
              {appliedBadge ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Applied</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Apply to Form</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
