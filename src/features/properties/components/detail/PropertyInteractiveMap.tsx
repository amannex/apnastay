'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface PropertyInteractiveMapProps {
  latitude?: number;
  longitude?: number;
  displayLocation: string;
  isApproximate?: boolean;
}

export default function PropertyInteractiveMap({
  latitude,
  longitude,
  displayLocation,
  isApproximate = true
}: PropertyInteractiveMapProps) {
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude);

  // Lazy-load map only when it scrolls within 300px of viewport
  useEffect(() => {
    if (!hasCoords || !mapWrapperRef.current) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(mapWrapperRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasCoords]);

  useEffect(() => {
    if (!hasCoords || !isVisible || !mapContainerRef.current) return;

    let isCancelled = false;

    async function initMap() {
      try {
        // Dynamically inject Leaflet CSS if not already present
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Dynamically import Leaflet library (client-side only)
        const L = (await import('leaflet')).default;

        if (isCancelled || !mapContainerRef.current) return;

        // Clean up any existing map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [latitude!, longitude!],
          zoom: isApproximate ? 14 : 15,
          zoomControl: false,
          scrollWheelZoom: false, // Prevents scroll hijacking on mobile/desktop
          attributionControl: true
        });

        // Add zoom control at bottom-right so it doesn't collide with top-right location badge
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // OpenStreetMap clean tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        if (isApproximate) {
          // 1. Draw approximate circular boundary (350m radius)
          L.circle([latitude!, longitude!], {
            radius: 400,
            color: '#E1224D',
            fillColor: '#E1224D',
            fillOpacity: 0.12,
            weight: 1.5,
            dashArray: '5, 5'
          }).addTo(map);

          // 2. Soft pulsating center pin
          const approxIcon = L.divIcon({
            className: 'apnastay-approx-pin',
            html: `
              <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
                <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(225, 34, 77, 0.25); animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="position: relative; width: 26px; height: 26px; border-radius: 50%; background: #E1224D; border: 3px solid #FFFFFF; box-shadow: 0 4px 12px rgba(225,34,77,0.4); display: flex; align-items: center; justify-content: center;">
                  <div style="width: 7px; height: 7px; border-radius: 50%; background: #FFFFFF;"></div>
                </div>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          });

          const marker = L.marker([latitude!, longitude!], {
            icon: approxIcon,
            interactive: true
          }).addTo(map);

          marker.bindPopup(
            `<strong>Approximate Area</strong><br/><span style="font-size: 12px; color: #4B5563;">${displayLocation}</span><br/><span style="font-size: 11px; color: #E1224D;">Exact address provided on visit schedule</span>`
          );
        } else {
          // Direct pinpoint marker
          const directIcon = L.divIcon({
            className: 'apnastay-direct-pin',
            html: `
              <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
                <div style="position: relative; width: 28px; height: 28px; border-radius: 50%; background: #E1224D; border: 3px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
              </div>
            `,
            iconSize: [34, 34],
            iconAnchor: [17, 34]
          });

          const marker = L.marker([latitude!, longitude!], {
            icon: directIcon,
            interactive: true
          }).addTo(map);

          marker.bindPopup(`<strong>${displayLocation}</strong>`);
        }

        mapInstanceRef.current = map;
        setMapLoaded(true);
      } catch (err) {
        console.warn('[PropertyInteractiveMap] Map initialization error:', err);
        setMapError(true);
      }
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, displayLocation, isApproximate, hasCoords, isVisible]);

  const mapsSearchUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayLocation)}`;

  // Missing location coordinates fallback
  if (!hasCoords || mapError) {
    return (
      <div className="relative h-[285px] sm:h-[352px] rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-center p-6 space-y-3">
        <div className="p-3.5 rounded-full bg-white text-[#E1224D] shadow-sm">
          <Navigation className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{displayLocation || 'Location unavailable'}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Exact geographic map coordinates are being verified by ApnaStay field engineers.
          </p>
        </div>
        <a
          href={mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E1224D] hover:underline pt-1"
        >
          <span>Search on Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div
      ref={mapWrapperRef}
      role="region"
      aria-label={`Interactive map of ${displayLocation}`}
      className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-2xs group"
    >
      {/* Loading Placeholder / Skeleton while waiting for intersection / Leaflet */}
      {(!isVisible || !mapLoaded) && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-1 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2.5 pointer-events-none"
        >
          <div className="w-10 h-10 rounded-full bg-white/80 shadow-xs flex items-center justify-center text-[#E1224D] animate-pulse">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-gray-500">
            Loading interactive location map...
          </span>
        </div>
      )}

      {/* Map container DOM: increased height by 10% (from 256px/320px to 285px/352px) */}
      <div
        ref={mapContainerRef}
        aria-label={`Interactive map showing ${displayLocation}`}
        className="h-[285px] sm:h-[352px] w-full z-0 bg-gray-100"
      />

      {/* Top right corner: Location badge (Vijay Nagar, Indore) */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-xs rounded-xl shadow-sm border border-gray-200/80 text-xs sm:text-sm font-semibold text-gray-900">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E1224D] shrink-0" />
          <span>{displayLocation}</span>
        </div>
      </div>

      {/* Left bottom overlays: Notice + Google Maps link */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-2 max-w-[calc(100%-5rem)] sm:max-w-none">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-xs text-xs font-normal text-gray-700 rounded-xl shadow-sm border border-gray-200/80">
          <span>Exact location will be provided after booking.</span>
        </div>
        <a
          href={mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-xs text-xs font-semibold text-gray-700 hover:text-[#E1224D] rounded-xl shadow-sm border border-gray-200/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258]"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
