import React from 'react';
import { X, Scale, ShieldCheck, Wifi, MapPin, Key, DollarSign, ArrowRight } from 'lucide-react';

export default function CompareDrawer({
  isOpen,
  onClose,
  compareList = [],
  onRemoveCompare,
  onClearCompare,
  onSelectProperty
}) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-sm flex items-end justify-center p-4 sm:p-6 animate-slide-up"
    >
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
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="p-4 w-[220px] align-bottom pb-6">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                      Property Features
                    </div>
                    <div className="text-sm font-extrabold text-[#1A1A1A] mt-1">
                      Comparing {compareList.length} Homes
                    </div>
                  </th>
                  {compareList.map((prop) => (
                    <th key={prop.id} className="p-3 w-[220px] align-top">
                      <div className="bg-[#FAFAFA] rounded-2xl border border-[#EDEDED] p-3 relative group">
                        <button
                          onClick={() => onRemoveCompare(prop.id)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-[#EDEDED] flex items-center justify-center text-[#6B7280] hover:text-[#E1224D] transition-colors z-10"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div
                          onClick={() => {
                            onClose();
                            onSelectProperty(prop);
                          }}
                          className="cursor-pointer"
                        >
                          <img
                            src={prop.images[0]}
                            alt={prop.title}
                            className="w-full h-28 rounded-xl object-cover mb-2.5"
                          />
                          <h4 className="text-sm font-bold text-[#1A1A1A] line-clamp-1 group-hover:text-[#E1224D] transition-colors">
                            {prop.title}
                          </h4>
                          <p className="text-xs text-[#6B7280] line-clamp-1">{prop.neighborhood}</p>
                        </div>
                      </div>
                    </th>
                  ))}
                  {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                    <th key={`empty-header-${idx}`} className="p-3 w-[220px] align-top">
                      <div className="h-full min-h-[160px] rounded-2xl border-2 border-dashed border-[#EDEDED] flex flex-col items-center justify-center p-4 text-center bg-[#FAFAFA]/50">
                        <div className="w-9 h-9 rounded-full bg-white border border-[#EDEDED] flex items-center justify-center text-[#6B7280] mb-2 shadow-sm">
                          +
                        </div>
                        <span className="text-xs font-bold text-[#1A1A1A]">Add Home</span>
                        <span className="text-[10px] text-[#6B7280] mt-0.5">Click + Compare on card</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDEDED] text-xs">
                {/* ROW 1: Monthly Rent */}
                <tr className="hover:bg-[#FAFAFA]/60 transition-colors">
                  <td className="p-4 font-bold text-[#6B7280]">Monthly Rent (₹0 Brokerage)</td>
                  {compareList.map((prop) => (
                    <td key={prop.id} className="p-4 font-extrabold text-sm text-[#E1224D]">
                      ₹{prop.price.toLocaleString('en-IN')}/mo
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                    <td key={`empty-rent-${idx}`} className="p-4 text-[#6B7280] text-center">—</td>
                  ))}
                </tr>

                {/* ROW 2: Security Deposit */}
                <tr className="hover:bg-[#FAFAFA]/60 transition-colors">
                  <td className="p-4 font-bold text-[#6B7280]">Security Deposit</td>
                  {compareList.map((prop) => (
                    <td key={prop.id} className="p-4 font-bold text-emerald-600">
                      ₹{prop.costBreakdown.securityDeposit.toLocaleString('en-IN')} (100% Refundable)
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                    <td key={`empty-dep-${idx}`} className="p-4 text-[#6B7280] text-center">—</td>
                  ))}
                </tr>

                {/* ROW 3: OwnStay Audit Score */}
                <tr className="hover:bg-[#FAFAFA]/60 transition-colors">
                  <td className="p-4 font-bold text-[#6B7280]">OwnStay Audit Score</td>
                  {compareList.map((prop) => (
                    <td key={prop.id} className="p-4 font-bold text-[#1A1A1A]">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-[#E1224D]">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>25-Point Pass ({prop.aiAttributes?.matchScore || 95}%)</span>
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                    <td key={`empty-audit-${idx}`} className="p-4 text-[#6B7280] text-center">—</td>
                  ))}
                </tr>

                {/* ROW 4: Primary Transit */}
                <tr className="hover:bg-[#FAFAFA]/60 transition-colors">
                  <td className="p-4 font-bold text-[#6B7280]">Primary Transit</td>
                  {compareList.map((prop) => (
                    <td key={prop.id} className="p-4 font-medium text-[#1A1A1A]">
                      {prop.nearby[0]?.name || 'Metro station nearby'}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                    <td key={`empty-transit-${idx}`} className="p-4 text-[#6B7280] text-center">—</td>
                  ))}
                </tr>

                {/* ROW 5: Wi-Fi & Desk Setup */}
                <tr className="hover:bg-[#FAFAFA]/60 transition-colors">
                  <td className="p-4 font-bold text-[#6B7280]">Wi-Fi & Desk Setup</td>
                  {compareList.map((prop) => (
                    <td key={prop.id} className="p-4 font-medium text-[#1A1A1A]">
                      {prop.amenities[0]?.name || 'High-speed Fiber'}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                    <td key={`empty-wifi-${idx}`} className="p-4 text-[#6B7280] text-center">—</td>
                  ))}
                </tr>

                {/* ROW 6: Self-Tour Status */}
                <tr className="hover:bg-[#FAFAFA]/60 transition-colors">
                  <td className="p-4 font-bold text-[#6B7280]">Self-Tour Status</td>
                  {compareList.map((prop) => (
                    <td key={prop.id} className="p-4 font-bold text-yellow-700">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 border border-yellow-200/60">
                        <Key className="w-3.5 h-3.5 shrink-0 text-yellow-600" />
                        <span>NFC Instant Tour</span>
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                    <td key={`empty-tour-${idx}`} className="p-4 text-[#6B7280] text-center">—</td>
                  ))}
                </tr>

                {/* ROW 7: Action Button */}
                <tr>
                  <td className="p-4"></td>
                  {compareList.map((prop) => (
                    <td key={prop.id} className="p-4">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectProperty(prop);
                        }}
                        className="w-full py-2.5 rounded-full bg-[#1A1A1A] text-white text-xs font-bold hover:bg-[#E1224D] transition-colors shadow-sm"
                      >
                        Inspect Room →
                      </button>
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                    <td key={`empty-btn-${idx}`} className="p-4"></td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
