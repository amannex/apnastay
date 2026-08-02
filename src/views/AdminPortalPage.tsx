'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  ExternalLink,
  Users,
  Building2,
  DollarSign,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { fetchSession, getSessionRole } from '../lib/auth/session';
import type { UserProfile } from '../features/auth/types';
import { STATIC_ADMIN_ANALYTICS } from '../services/wordpressCms';

export default function AdminPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const wpAdminUrl =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WP_ADMIN_URL) ||
    'http://localhost:8888/wp-admin/';

  useEffect(() => {
    fetchSession().then((profile) => {
      const role = getSessionRole(profile);
      if (!profile || role === 'guest') {
        router.replace('/login?redirect=/admin');
      } else if (role !== 'administrator' && role !== 'admin') {
        // Redirect non-admin users to their role dashboard
        router.replace(role === 'owner' ? '/owner/dashboard' : '/dashboard');
      } else {
        setUser(profile);
        setLoadingAuth(false);
      }
    });
  }, [router]);

  if (loadingAuth) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-[#FAFAFA] gap-3">
        <Loader2 className="w-7 h-7 text-[#1D1D1F] animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">
          Verifying Administrator Capabilities...
        </span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* ADMIN HERO BANNER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E1224D] text-white flex items-center justify-center text-xl font-black shadow-md">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-[#E1224D] text-[11px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                <span>WordPress Headless Administrator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
                OwnStay Platform Command Center
              </h1>
              <p className="text-xs text-[#86868B] mt-1">
                Authoritative RBAC oversight for Indian zero-brokerage rentals & engineering KYC.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={wpAdminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold inline-flex items-center gap-2 transition-all shadow-sm"
            >
              <span>Launch WordPress /wp-admin/ CMS</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* ADMIN ANALYTICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATIC_ADMIN_ANALYTICS.kpiCards.map((kpi, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-[#EDEDED] shadow-apple-sm">
              <div className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1">
                {kpi.label}
              </div>
              <div className="text-2xl font-extrabold text-[#1D1D1F]">
                {kpi.value}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-2">
                {kpi.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
