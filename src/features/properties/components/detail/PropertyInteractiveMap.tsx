'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ExternalLink, Search } from 'lucide-react';

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
  const [placeholderText, setPlaceholderText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Typewriter animation for placeholder: "Search nearby places, etc.."
  useEffect(() => {
    const fullText = 'Search nearby places, etc..';
    let currentIndex = 0;
    let isDeleting = false;
    let timer: NodeJS.Timeout;

    const animateText = () => {
      if (!isDeleting) {
        currentIndex++;
        setPlaceholderText(fullText.slice(0, currentIndex));
        if (currentIndex === fullText.length) {
          timer = setTimeout(() => {
            isDeleting = true;
            animateText();
          }, 2400);
          return;
        }
        timer = setTimeout(animateText, 85);
      } else {
        currentIndex--;
        setPlaceholderText(fullText.slice(0, currentIndex));
        if (currentIndex === 0) {
          isDeleting = false;
          timer = setTimeout(animateText, 500);
          return;
        }
        timer = setTimeout(animateText, 45);
      }
    };

    timer = setTimeout(animateText, 600);

    return () => clearTimeout(timer);
  }, []);

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
          zoom: 14,
          zoomControl: false,
          scrollWheelZoom: false, // Prevents scroll hijacking on mobile/desktop
          attributionControl: true
        });

        // Add zoom control at top-right matching Airbnb interface
        L.control.zoom({ position: 'topright' }).addTo(map);

        // OpenStreetMap clean tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Airbnb style black circular pin with house icon in the center
        const homePinIcon = L.divIcon({
          className: 'apnastay-home-pin',
          html: `
            <div style="width: 44px; height: 44px; border-radius: 50%; background: #18181b; box-shadow: 0 4px 16px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; cursor: pointer;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });

        const marker = L.marker([latitude!, longitude!], {
          icon: homePinIcon,
          interactive: true
        }).addTo(map);

        marker.bindPopup(
          `<div style="font-family: inherit; padding: 4px;">
             <strong style="font-size: 13px; color: #111827; display: block; margin-bottom: 2px;">${displayLocation}</strong>
             <span style="font-size: 11px; color: #4B5563;">Exact location will be provided after booking.</span>
           </div>`
        );

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim() || 'nearby places';
    const url = hasCoords
      ? `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${latitude},${longitude},15z`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query} in ${displayLocation}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Missing location coordinates fallback
  if (!hasCoords || mapError) {
    return (
      <div className="space-y-3">
        <div className="relative h-[420px] sm:h-[500px] lg:h-[540px] rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-center p-6 space-y-3">
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
        <p className="text-sm text-gray-700 font-normal">
          Exact location will be provided after booking.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
            <div className="w-10 h-10 rounded-full bg-white/80 shadow-xs flex items-center justify-center text-gray-800 animate-pulse">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-500">
              Loading interactive location map...
            </span>
          </div>
        )}

        {/* Map container DOM: increased height */}
        <div
          ref={mapContainerRef}
          aria-label={`Interactive map showing ${displayLocation}`}
          className="h-[420px] sm:h-[500px] lg:h-[540px] w-full z-0 bg-gray-100"
        />

        {/* Top-Left: Wider Search Bar overlay with typewriter animation */}
        <form
          onSubmit={handleSearchSubmit}
          className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 flex items-center gap-2.5 w-72 sm:w-80 md:w-96 max-w-[calc(100%-4.5rem)] px-4 py-2.5 sm:py-3 bg-white/95 backdrop-blur-xs rounded-full shadow-md hover:shadow-lg border border-gray-200/90 text-sm text-gray-800 transition-all focus-within:ring-2 focus-within:ring-black/10 focus-within:border-gray-400 pointer-events-auto"
        >
          <Search className="w-4 h-4 text-gray-500 shrink-0" />
          <div className="relative flex-1 flex items-center overflow-hidden min-w-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-gray-800 font-normal focus:outline-none focus:ring-0 p-0 z-10"
              aria-label="Search nearby places"
            />
            {!searchQuery && !isFocused && (
              <div className="absolute inset-0 flex items-center pointer-events-none select-none text-gray-500 text-xs sm:text-sm font-normal truncate">
                <span>{placeholderText}</span>
                <span className="inline-block w-0.5 h-3.5 bg-gray-500 animate-pulse ml-0.5" />
              </div>
            )}
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-gray-400 hover:text-gray-700 p-0.5"
              aria-label="Clear search query"
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Bottom info below the map */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-sm text-gray-700">
        <p className="font-normal">
          Exact location will be provided after booking.
        </p>
        <a
          href={mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-gray-600 hover:text-black hover:underline text-xs sm:text-sm"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
