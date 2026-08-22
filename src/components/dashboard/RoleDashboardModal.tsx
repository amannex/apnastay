'use client';

import React from 'react';
import {
  X,
  UserCheck,
  Shield,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Key,
  FileText,
  DollarSign,
  PlusCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { STATIC_ADMIN_ANALYTICS } from '../../services/wordpressCms';

export default function RoleDashboardModal({
  isOpen,
  onClose,
  activeRole,
  onRoleChange,
  onRoleSelect
}: any) {
  const handleRoleChange = onRoleChange || onRoleSelect || (() => {});
  if (!isOpen) return null;

  const roles = [
    { id: 'tenant', label: 'Tenant View', icon: UserCheck, badge: 'Renter Experience' },
    { id: 'owner', label: 'Owner Portal', icon: Shield, badge: 'Zero Comm.' },
    { id: 'admin', label: 'Admin Analytics', icon: BarChart3, badge: 'CMS & Growth' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-slide-up">
      <div
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-apple-lg border border-[#EDEDED] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#EDEDED] flex items-center justify-between bg-white/95 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center text-[#E1224D]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A]">
                ApnaStay India SaaS Dashboard Showcase
              </h2>
              <p className="text-xs text-[#6B7280]">
                User Type Showcase — Test how ApnaStay serves Indian Tenants, Property Owners, and Field Auditors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = r.id === activeRole;
              return (
                <button
                  key={r.id}
                  onClick={() => handleRoleChange(r.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E1224D] text-white shadow-sm'
                      : 'bg-[#FAFAFA] text-[#6B7280] hover:text-[#1A1A1A]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{r.label}</span>
                </button>
              );
            })}
            <button
              onClick={onClose}
              className="p-2 ml-2 rounded-full bg-[#FAFAFA] hover:bg-[#EDEDED] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ROLE BODY VIEW */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-[#FAFAFA]">
          {/* ===================== 1. TENANT VIEW ===================== */}
          {activeRole === 'tenant' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[#1A1A1A]">
                    Welcome back, Marcus
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Your active digital agreements, NFC tour keys, and zero-brokerage savings
                  </p>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
                  $0 Brokerage Paid • $2,340 Saved
                </div>
              </div>

              {/* Tenant Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-[#EDEDED] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                      Upcoming NFC Self-Tour
                    </span>
                    <Key className="w-4 h-4 text-yellow-500" />
                  </div>
                  <h4 className="text-lg font-bold text-[#1A1A1A]">
                    The Glass Horizon Suite
                  </h4>
                  <p className="text-xs text-[#6B7280] mt-1">SoHo, Manhattan • Tomorrow 10:00 AM</p>
                  <div className="mt-4 pt-4 border-t border-[#FAFAFA] flex items-center justify-between text-xs font-bold text-[#E1224D]">
                    <span>NFC Pass Active</span>
                    <span>Tap smart-lock →</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#EDEDED] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                      Digital Agreement
                    </span>
                    <FileText className="w-4 h-4 text-blue-500" />
                  </div>
                  <h4 className="text-lg font-bold text-[#1A1A1A]">
                    SOMA Zen Residence
                  </h4>
                  <p className="text-xs text-[#6B7280] mt-1">E-Signed • Move-in Sat Aug 1</p>
                  <div className="mt-4 pt-4 border-t border-[#FAFAFA] flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>100% Legally Binding</span>
                    <span>Download PDF</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#EDEDED] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                      Wishlist & AI Matches
                    </span>
                    <Sparkles className="w-4 h-4 text-[#E1224D]" />
                  </div>
                  <h4 className="text-lg font-bold text-[#1A1A1A]">
                    3 Homes Saved
                  </h4>
                  <p className="text-xs text-[#6B7280] mt-1">98% Avg Acoustics Match Score</p>
                  <div
                    onClick={onClose}
                    className="mt-4 pt-4 border-t border-[#FAFAFA] flex items-center justify-between text-xs font-bold text-[#1A1A1A] cursor-pointer hover:text-[#E1224D]"
                  >
                    <span>View Wishlist</span>
                    <span>Explore rooms →</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== 2. OWNER PORTAL VIEW ===================== */}
          {activeRole === 'owner' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#1A1A1A]">
                    Owner Partner Portal
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Zero realtor middlemen — 100% direct bookings with verified tenants
                  </p>
                </div>
                <button
                  onClick={() => alert('New Property Listing Wizard — In ApnaStay, every listing is inspected by our Indian field engineers within 48 hours!')}
                  className="px-5 py-2.5 rounded-full bg-[#E1224D] text-white text-xs font-semibold shadow-apple hover:bg-[#C71B42] transition-all flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Property Listing
                </button>
              </div>

              {/* Owner Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-[#EDEDED] shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                    Active Verified Units
                  </p>
                  <p className="text-3xl font-extrabold text-[#1A1A1A] mt-2">4</p>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    100% Occupancy Rate
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#EDEDED] shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                    NFC Tour Visits (This Week)
                  </p>
                  <p className="text-3xl font-extrabold text-[#1A1A1A] mt-2">14</p>
                  <p className="text-xs text-yellow-600 font-semibold mt-1">
                    0 Realtor overhead hours required
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#EDEDED] shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                    Monthly Net Rental Revenue
                  </p>
                  <p className="text-3xl font-extrabold text-emerald-600 mt-2">$7,800</p>
                  <p className="text-xs text-[#6B7280] mt-1">0% Commission deducted</p>
                </div>
              </div>
            </div>
          )}

          {/* ===================== 3. ADMIN ANALYTICS VIEW ===================== */}
          {activeRole === 'admin' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A1A]">
                  ApnaStay India Admin & Growth Analytics
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Real-time KPI telemetry across Indore, Jaipur, Coimbatore, Kochi, Chandigarh, and Pune
                </p>
              </div>

              {/* KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {STATIC_ADMIN_ANALYTICS.kpiCards.map((kpi, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-6 rounded-3xl border border-[#EDEDED] shadow-sm flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                      {kpi.label}
                    </span>
                    <p className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] my-2">
                      {kpi.value}
                    </p>
                    <span className="text-xs font-semibold text-emerald-600">
                      {kpi.change}
                    </span>
                  </div>
                ))}
              </div>

              {/* CITY REVENUE DISTRIBUTION CHART BARS */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EDEDED] shadow-sm">
                <h4 className="text-base font-bold text-[#1A1A1A] mb-4">
                  Active Verified Listings by City Hub
                </h4>
                <div className="space-y-4">
                  {STATIC_ADMIN_ANALYTICS.cityDistribution.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A] mb-1">
                        <span>{item.city}</span>
                        <span>
                          {item.count} rooms ({item.percentage}%) • {item.revenue}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-[#FAFAFA] rounded-full overflow-hidden border">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 border-t border-[#EDEDED] bg-white flex items-center justify-between text-xs text-[#6B7280]">
          <span>ApnaStay India Multi-Role SaaS Engine v2.4</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#1A1A1A] text-white font-semibold hover:bg-black transition-colors"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
