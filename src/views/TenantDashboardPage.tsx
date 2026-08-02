'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  Key,
  FileText,
  DollarSign,
  Clock,
  Sparkles,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Heart,
  Loader2,
  Calendar
} from 'lucide-react';
import { fetchSession, getSessionRole } from '../lib/auth/session';
import { can } from '../features/auth';
import type { UserProfile } from '../features/auth/types';
import TenantDashboardShell from '../components/dashboard/TenantDashboardShell';

export default function TenantDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchSession().then((profile) => {
      setUser(profile);
    });
  }, []);

  return (
    <TenantDashboardShell activeTab="overview">
      <div className="space-y-8 animate-fade-in">
        {/* DASHBOARD HERO BANNER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1D1D1F] text-white flex items-center justify-center text-xl font-black">
              {user?.name?.[0]?.toUpperCase() || 'T'}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Tenant</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
                Welcome, {user?.name || 'Renter'}
              </h1>
              <p className="text-xs text-[#86868B] mt-1">
                Manage your NFC smart-lock tours, e-agreements, and zero-brokerage rentals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
                Brokerage Saved
              </div>
              <div className="text-lg font-extrabold text-[#1D1D1F] mt-0.5">
                ₹32,500
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-[#EDEDED] shadow-apple-sm">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E1224D] flex items-center justify-center mb-4">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#1D1D1F] text-base">
              NFC Self-Tour Keys
            </h3>
            <p className="text-xs text-[#86868B] mt-1 mb-4 leading-relaxed">
              1 active smart-lock key for scheduled visit at Vijay Nagar, Indore.
            </p>
            {can(user, 'ownstay_book_visit') && (
              <button className="text-xs font-bold text-[#E1224D] hover:underline inline-flex items-center gap-1">
                <span>View Access Token</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#EDEDED] shadow-apple-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#1D1D1F] text-base">
              Digital E-Agreements
            </h3>
            <p className="text-xs text-[#86868B] mt-1 mb-4 leading-relaxed">
              Aadhaar & PAN e-signed rental deed legally stamped under Registration Act.
            </p>
            {can(user, 'ownstay_view_agreement') && (
              <button className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                <span>Download PDF Deed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#EDEDED] shadow-apple-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#1D1D1F] text-base">
              Zero-Brokerage Rent
            </h3>
            <p className="text-xs text-[#86868B] mt-1 mb-4 leading-relaxed">
              Next automated rent transfer: ₹24,000 due on Aug 5 (0% platform fees).
            </p>
            {can(user, 'ownstay_make_payment') && (
              <button className="text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1">
                <span>Pay via UPI / Autopay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ACTIVE TOUR SCHEDULE LIST */}
        <div className="bg-white rounded-3xl border border-[#EDEDED] shadow-apple-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#1D1D1F]">
                Scheduled Visits & Verified Rooms
              </h2>
              <p className="text-xs text-[#86868B]">
                Your upcoming self-tours in Tier-2 Indian cities
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F5F5F7] text-[#1D1D1F]">
              1 Upcoming Tour
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#E1224D] shadow-sm shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#1D1D1F]">
                    3 BHK Pinnacle Residenza — Vijay Nagar
                  </h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-[#6E6E73] mt-0.5">
                  Indore, Madhya Pradesh • ₹24,000 / month • ₹0 Brokerage
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-[#86868B]">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#1D1D1F]" />
                    <span>Tomorrow, 4:00 PM - 4:30 PM</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert('NFC Key Activated for 3 BHK Pinnacle Residenza.')}
              className="px-4 py-2.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all shrink-0"
            >
              Unlock Smart-Lock
            </button>
          </div>
        </div>
      </div>
    </TenantDashboardShell>
  );
}
