import React from 'react';
import { Heart, Star, ShieldCheck, Scale, Key, ArrowRight, Sparkles, MapPin } from 'lucide-react';

export default function FeaturedProperties({
  properties = [],
  wishlistIds = [],
  compareIds = [],
  onToggleWishlist,
  onToggleCompare,
  onSelectProperty,
  showHeader = true
}) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-[#EDEDED]">
        <p className="text-lg font-semibold text-[#1A1A1A]">No verified rooms match your current filters.</p>
        <p className="text-sm text-[#6B7280] mt-1">Try resetting the city tab or selecting &apos;All Verified Rooms&apos;.</p>
      </div>
    );
  }

  const gridContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {properties.map((prop) => {
            const isWishlisted = wishlistIds.includes(prop.id);
            const isCompared = compareIds.includes(prop.id);

            return (
              <div
                key={prop.id}
                onClick={() => onSelectProperty(prop)}
                className="group bg-white rounded-3xl border border-[#EDEDED] shadow-sm hover:shadow-apple-hover transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                {/* IMAGE CAROUSEL / WRAPPER */}
                <div className="relative h-64 overflow-hidden bg-[#FAFAFA]">
                  <img
                    src={prop.images[0]}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* TOP BADGES: VERIFIED + ZERO BROKERAGE */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#E1224D] text-[11px] font-bold shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      100% Verified
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-sm">
                      ₹0 Brokerage
                    </span>
                  </div>

                  {/* TOP RIGHT ACTION BUTTONS (WISHLIST + COMPARE CHECKBOX) */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 z-10" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleCompare(prop.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                        isCompared
                          ? 'bg-[#1A1A1A] text-white shadow-sm'
                          : 'bg-white/90 backdrop-blur-md text-[#6B7280] hover:text-[#1A1A1A]'
                      }`}
                      title="Compare property"
                    >
                      <Scale className="w-3.5 h-3.5 inline mr-1" />
                      {isCompared ? 'Compared' : '+ Compare'}
                    </button>

                    <button
                      onClick={() => onToggleWishlist(prop.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isWishlisted
                          ? 'bg-[#E1224D] text-white shadow-md'
                          : 'bg-white/90 backdrop-blur-md text-[#6B7280] hover:text-[#E1224D]'
                      }`}
                      title="Save to Wishlist"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* BOTTOM OVERLAY TAG: INSTANT VISIT */}
                  <div className="absolute bottom-3 left-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium">
                      <Key className="w-3 h-3 text-yellow-400" />
                      NFC Self-Tour Ready
                    </span>
                  </div>
                </div>

                {/* CARD CONTENT */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#6B7280] font-semibold mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#E1224D]" />
                        {prop.neighborhood}
                      </span>
                      <span className="flex items-center gap-1 text-[#1A1A1A] font-bold">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        {prop.rating} ({prop.reviewCount})
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#E1224D] transition-colors line-clamp-1">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">
                      {prop.tagline}
                    </p>

                    {/* AMENITIES PILLS */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-4">
                      {prop.amenities.slice(0, 3).map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-[#FAFAFA] border border-[#EDEDED] text-[11px] font-medium text-[#6B7280]"
                        >
                          {item.name}
                        </span>
                      ))}
                      {prop.amenities.length > 3 && (
                        <span className="px-2 py-1 rounded-lg bg-[#FAFAFA] text-[10px] font-semibold text-[#6B7280]">
                          +{prop.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* PRICE & ACTION FOOTER */}
                  <div className="mt-6 pt-4 border-t border-[#FAFAFA] flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-[#1A1A1A]">
                        ₹{prop.price}
                        <span className="text-xs font-normal text-[#6B7280]"> / month</span>
                      </p>
                      <p className="text-[10px] text-emerald-600 font-semibold">
                        ₹0 brokerage • 100% refundable deposit
                      </p>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-[#FAFAFA] group-hover:bg-[#E1224D] group-hover:text-white text-[#1A1A1A] flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
    </div>
  );

  if (!showHeader) {
    return gridContent;
  }

  return (
    <section id="properties" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Verified & Zero Brokerage
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A]">
              Featured Properties
            </h2>
            <p className="text-[#6B7280] text-base mt-2">
              Physically audited apartments ready for instant NFC smart-lock self-touring.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
            <span>Showing {properties.length} verified listings</span>
          </div>
        </div>

        {gridContent}
      </div>
    </section>
  );
}
