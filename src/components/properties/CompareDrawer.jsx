import React from 'react';
import { X, Scale, ShieldCheck, Wifi, MapPin, Key, DollarSign, ArrowRight } from 'lucide-react';

export default function CompareDrawer({
  isOpen,
  onClose,
  compareList = [],
  onRemoveCompare,
  onSelectProperty
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-end justify-center p-4 sm:p-6 animate-slide-up">
      <div
        className="relative w-full max-w-6xl bg-white rounded-3xl shadow-apple-lg border border-[#EDEDED] overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#EDEDED] flex items-center justify-between bg-white/95 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#E1224D]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A]">
                Side-by-Side Property Comparison ({compareList.length} / 3)
              </h2>
              <p className="text-xs text-[#6B7280]">
                Comparing zero-brokerage pricing, acoustics & transit access
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {compareList.length > 0 && (
              <button
                onClick={onClearCompare}
                className="px-3.5 py-1.5 rounded-full bg-[#FAFAFA] hover:bg-[#EDEDED] text-xs font-semibold text-[#1A1A1A] transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#FAFAFA] hover:bg-[#EDEDED] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MATRIX BODY */}
        {compareList.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-[#E1224D] mb-4">
              <Scale className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
              No Properties Added for Comparison
            </h3>
            <p className="text-sm text-[#6B7280] max-w-md mb-6">
              Click the "+ Compare" button on any property card to compare up to 3 verified Indian homes side-by-side!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#E1224D] text-white font-bold text-xs hover:bg-[#C71B42] transition-colors shadow-apple"
            >
              Browse Homes
            </button>
          </div>
        ) : (
          <div className="p-6 overflow-x-auto">
            <div className="min-w-[700px] grid grid-cols-4 gap-4">
              {/* COLUMN 1: LABEL HEADER */}
            <div className="space-y-6 pt-16 font-semibold text-xs text-[#6B7280]">
              <div className="h-10 flex items-center">Monthly Rent ($0 Brokerage)</div>
              <div className="h-10 flex items-center">Security Deposit</div>
              <div className="h-10 flex items-center">OwnStay Audit Score</div>
              <div className="h-10 flex items-center">Primary Transit</div>
              <div className="h-10 flex items-center">Wi-Fi & Desk Setup</div>
              <div className="h-10 flex items-center">Self-Tour Status</div>
            </div>

            {/* COLUMNS 2-4: PROPERTIES */}
            {compareList.map((prop) => (
              <div
                key={prop.id}
                className="bg-[#FAFAFA] rounded-2xl border border-[#EDEDED] p-4 flex flex-col justify-between relative group"
              >
                <button
                  onClick={() => onRemoveCompare(prop.id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-[#EDEDED] flex items-center justify-center text-[#6B7280] hover:text-[#E1224D] transition-colors"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* PROPERTY HEADER CARD */}
                <div
                  onClick={() => {
                    onClose();
                    onSelectProperty(prop);
                  }}
                  className="cursor-pointer mb-4"
                >
                  <img
                    src={prop.images[0]}
                    alt={prop.title}
                    className="w-full h-24 rounded-xl object-cover mb-2"
                  />
                  <h4 className="text-sm font-bold text-[#1A1A1A] line-clamp-1 group-hover:text-[#E1224D] transition-colors">
                    {prop.title}
                  </h4>
                  <p className="text-xs text-[#6B7280]">{prop.neighborhood}</p>
                </div>

                {/* VALUES LIST */}
                <div className="space-y-6 text-xs font-bold text-[#1A1A1A]">
                  <div className="h-10 flex items-center text-sm text-[#E1224D]">
                    ${prop.price}/mo
                  </div>
                  <div className="h-10 flex items-center text-emerald-600">
                    ${prop.costBreakdown.securityDeposit} (100% Refundable)
                  </div>
                  <div className="h-10 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-[#E1224D]" />
                    <span>25-Point Pass ({prop.aiAttributes?.matchScore || 95}% score)</span>
                  </div>
                  <div className="h-10 flex items-center text-xs text-[#6B7280] font-medium">
                    {prop.nearby[0]?.name || 'Metro station nearby'}
                  </div>
                  <div className="h-10 flex items-center text-xs text-[#6B7280] font-medium">
                    {prop.amenities[0]?.name || 'High-speed Fiber'}
                  </div>
                  <div className="h-10 flex items-center gap-1.5 text-xs text-yellow-600 font-semibold">
                    <Key className="w-3.5 h-3.5" />
                    <span>NFC Instant Tour</span>
                  </div>
                </div>

                {/* SELECT BUTTON */}
                <button
                  onClick={() => {
                    onClose();
                    onSelectProperty(prop);
                  }}
                  className="w-full mt-6 py-2.5 rounded-full bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-[#E1224D] transition-colors"
                >
                  Inspect Room →
                </button>
              </div>
            ))}

            {/* EMPTY SLOT PLACEHOLDERS */}
            {Array.from({ length: 3 - compareList.length }).map((_, i) => (
              <div
                key={i}
                className="border-2 border-dashed border-[#EDEDED] rounded-2xl p-6 flex flex-col items-center justify-center text-center text-[#6B7280]"
              >
                <div className="w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center mb-2">
                  <Scale className="w-5 h-5 text-[#EDEDED]" />
                </div>
                <p className="text-xs font-semibold">Add another room</p>
                <p className="text-[11px] text-[#6B7280]">
                  Click '+ Compare' on any property card
                </p>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
