'use client';

import React from 'react';
import {
  Heart,
  X,
  Trash2,
  MapPin,
  Star,
  ShieldCheck,
  Key,
  ArrowRight,
  Sparkles,
  Scale,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import type { Property } from '../../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  properties?: Property[];
  onToggleWishlist: (id: string) => void;
  onClearWishlist: () => void;
  onOpenModal: (property: Property) => void;
  onOpenCompare?: () => void;
  onSelectForCompare?: (ids: string[]) => void;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  properties = [],
  onToggleWishlist,
  onClearWishlist,
  onOpenModal,
  onOpenCompare,
  onSelectForCompare
}: WishlistDrawerProps) {
  if (!isOpen) return null;

  const defaultImage =
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

  const handleCompareSaved = () => {
    if (properties.length === 0) return;
    if (onSelectForCompare) {
      const top3 = properties.slice(0, 3).map((p) => p.id);
      onSelectForCompare(top3);
    }
    if (onOpenCompare) {
      onClose();
      onOpenCompare();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex justify-end animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Wishlist Drawer"
    >
      <div
        className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-[#EDEDED] flex flex-col z-10 overflow-hidden transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-[#EDEDED] flex items-center justify-between bg-white/95 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E1224D] shadow-sm">
              <Heart className="w-5 h-5 fill-[#E1224D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-[#1A1A1A] tracking-tight">
                  Saved Residences
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#FAFAFA] border border-[#EDEDED] text-xs font-bold text-[#6B7280]">
                  {properties.length}
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Zero-brokerage verified homes you loved
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {properties.length > 0 && (
              <button
                onClick={onClearWishlist}
                className="px-2.5 py-1.5 rounded-full hover:bg-rose-50 text-xs font-semibold text-[#6B7280] hover:text-[#E1224D] transition-colors flex items-center gap-1"
                title="Clear all saved residences"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#FAFAFA] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
              aria-label="Close Wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 space-y-5">
              <div className="w-20 h-20 rounded-full bg-rose-50/70 border border-rose-100 flex items-center justify-center">
                <Heart className="w-10 h-10 text-rose-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#1A1A1A]">
                  Your Wishlist is Empty
                </h3>
                <p className="text-sm text-[#6B7280] max-w-xs leading-relaxed">
                  Click the heart icon on any verified property card to save your favorites here for quick comparison and tour scheduling.
                </p>
              </div>
              <Link
                href="/properties"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#E1224D] hover:bg-[#c91d43] text-white text-sm font-bold shadow-md shadow-[#E1224D]/20 transition-all"
              >
                <span>Explore Verified Residences</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            properties.map((property) => {
              const imageSrc =
                property.images?.[0] || (property as any).image || defaultImage;
              const price = Number(property.price || 16500);
              const roomType =
                property.roomType || (property as any).type || '1BHK Suite';
              const neighborhood =
                property.neighborhood || property.location || 'Indore';
              const city = property.city || 'Indore';

              return (
                <div
                  key={property.id}
                  className="group relative bg-white rounded-2xl border border-[#EDEDED] hover:border-gray-300 transition-all p-3.5 shadow-sm hover:shadow-md flex flex-col sm:flex-row gap-3.5"
                >
                  {/* Thumbnail Image */}
                  <div className="relative w-full sm:w-28 h-40 sm:h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={imageSrc}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-emerald-600/95 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-bold">
                      ₹0 Brokerage
                    </div>
                    {property.nfcSelfTour && (
                      <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm text-amber-300 p-1 rounded-md" title="NFC Smart-Lock Solo Tour Available">
                        <Key className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Details Column */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#E1224D]">
                          {roomType}
                        </span>
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-bold text-gray-900">
                            {property.rating || 4.9}
                          </span>
                        </div>
                      </div>

                      <h3
                        className="text-sm font-bold text-[#1A1A1A] mt-1 truncate group-hover:text-[#E1224D] transition-colors cursor-pointer"
                        onClick={() => {
                          onOpenModal(property);
                          onClose();
                        }}
                      >
                        {property.title}
                      </h3>

                      <p className="flex items-center gap-1 text-xs text-[#6B7280] mt-1 truncate">
                        <MapPin className="w-3 h-3 text-[#E1224D] shrink-0" />
                        <span className="truncate">{neighborhood}, {city}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100">
                      <div>
                        <span className="text-base font-extrabold text-[#1A1A1A]">
                          ₹{price.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-[#6B7280] font-medium"> /mo</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onToggleWishlist(property.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            onOpenModal(property);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#E1224D] hover:bg-[#c91d43] text-white text-xs font-bold shadow-sm transition-all"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER BAR (Sticky at Bottom) */}
        {properties.length > 0 && (
          <div className="p-5 border-t border-[#EDEDED] bg-white/95 backdrop-blur-md space-y-3 sticky bottom-0 z-20">
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Zero-Brokerage Verified</span>
              </span>
              <span className="font-semibold text-[#1A1A1A]">
                {properties.length} {properties.length === 1 ? 'home' : 'homes'} saved
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/properties"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-[#EDEDED] hover:bg-[#FAFAFA] text-xs font-bold text-[#1A1A1A] text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <Building2 className="w-4 h-4 text-[#6B7280]" />
                <span>Browse More</span>
              </Link>
              <button
                onClick={handleCompareSaved}
                className="w-full py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-gray-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Scale className="w-4 h-4 text-[#E1224D]" />
                <span>Compare Saved</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
