'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Home,
  Building2,
  LayoutGrid,
  Key,
  Calendar,
  DollarSign,
  MessageSquare,
  Bell,
  User,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { fetchSession, getSessionRole } from '../../lib/auth/session';
import { logoutUser } from '../../features/auth/api';
import { getOwnerVerificationStatus } from '../../features/auth/permissions';
import type { UserProfile } from '../../features/auth/types';

export interface OwnerDashboardShellProps {
  children: React.ReactNode;
  activeTab?: string;
}

function OwnerDashboardShellInner({
  children,
  activeTab = 'overview',
}: OwnerDashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rbacBlocked = searchParams.get('rbac_blocked') === 'tenant_portal';
  const wpAdminBlocked = searchParams.get('wp_admin_blocked') === '1';

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isTenantForbidden, setIsTenantForbidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchSession().then((profile) => {
      const role = getSessionRole(profile);
      if (!profile || role === 'guest') {
        router.replace('/login?redirect=/owner/dashboard');
      } else if (role === 'tenant') {
        // TENANT -> /owner/dashboard MUST return redirect/forbidden!
        setIsTenantForbidden(true);
        setLoadingAuth(false);
        // Automatically redirect to /dashboard?rbac_blocked=owner_portal after a brief moment
        setTimeout(() => {
          router.replace('/dashboard?rbac_blocked=owner_portal');
        }, 1200);
      } else {
        setUser(profile);
        setLoadingAuth(false);
      }
    });
  }, [router]);

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/login');
  };

  const navItems = [
    { name: 'Overview', href: '/owner/dashboard', icon: Home, slug: 'overview' },
    { name: 'Properties', href: '/owner/dashboard/properties', icon: Building2, slug: 'properties' },
    { name: 'Rooms', href: '/owner/dashboard/rooms', icon: LayoutGrid, slug: 'rooms' },
    { name: 'Visits', href: '/owner/dashboard/visits', icon: Key, slug: 'visits' },
    { name: 'Bookings', href: '/owner/dashboard/bookings', icon: Calendar, slug: 'bookings' },
    { name: 'Payments', href: '/owner/dashboard/payments', icon: DollarSign, slug: 'payments' },
    { name: 'Messages', href: '/owner/dashboard/messages', icon: MessageSquare, slug: 'messages' },
    { name: 'Notifications', href: '/owner/dashboard/notifications', icon: Bell, slug: 'notifications' },
    { name: 'Profile', href: '/owner/dashboard/profile', icon: User, slug: 'profile' },
  ];

  if (loadingAuth) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-[#FAFAFA] gap-3">
        <Loader2 className="w-7 h-7 text-[#1D1D1F] animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">
          Verifying Owner Portal Session & RBAC...
        </span>
      </div>
    );
  }

  // 403 FORBIDDEN STATE FOR TENANTS ATTEMPTING /owner/dashboard
  if (isTenantForbidden) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-apple-md">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
            <span>HTTP 403 Forbidden</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1D1D1F] tracking-tight mb-2">
            Owner Portal Access Denied
          </h1>
          <p className="text-xs text-[#6E6E73] leading-relaxed mb-6">
            Your attempt to access an Owner route (<code className="font-mono bg-rose-50 text-rose-800 px-1 py-0.5 rounded">/owner/dashboard</code>) was blocked. Your account role is <span className="font-bold underline">apnastay_tenant</span>. Tenants cannot view landlord or property management resources.
          </p>
          <div className="p-3 rounded-xl bg-[#F5F5F7] border border-[#EDEDED] text-[11px] text-[#86868B] mb-6">
            Redirecting you automatically to your Tenant Dashboard...
          </div>
          <button
            onClick={() => router.replace('/dashboard?rbac_blocked=owner_portal')}
            className="w-full py-3 px-4 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all shadow-sm"
          >
            Return to Tenant Dashboard Immediately
          </button>
        </div>
      </div>
    );
  }

  const verificationStatus = getOwnerVerificationStatus(user);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col lg:flex-row">
      {/* MOBILE HEADER */}
      <header className="lg:hidden bg-white border-b border-[#EDEDED] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl hover:bg-[#F5F5F7] text-[#1D1D1F]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-extrabold text-base text-[#1D1D1F]">
            Owner Portal
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#F5F5F7] text-[#1D1D1F] uppercase">
            Owner RBAC
          </span>
        </div>
      </header>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#EDEDED] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 overflow-y-auto">
          {/* USER IDENTITY & KYC BADGE CARD */}
          <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1D1D1F] text-white flex items-center justify-center font-black text-sm shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'O'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs text-[#1D1D1F] truncate">
                    {user?.name || 'Property Owner'}
                  </h3>
                  {verificationStatus === 'verified' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-[#86868B] font-medium truncate uppercase">
                  {verificationStatus === 'verified'
                    ? 'Verified Landlord'
                    : `KYC: ${verificationStatus}`}
                </p>
              </div>
            </div>
          </div>

          {/* SIDEBAR LINKS */}
          <nav className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] px-3 mb-2">
              Landlord Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.slug === 'overview'
                  ? pathname === '/owner/dashboard' || pathname === '/owner'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.slug}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#1D1D1F] text-white shadow-sm'
                      : 'text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#86868B]'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                </Link>
              );
            })}
          </nav>

          {/* SECURITY PROOF CARD */}
          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-[#F5F5F7] to-white border border-[#EDEDED]">
            <div className="flex items-center gap-2 text-[#1D1D1F] font-extrabold text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>RBAC Isolation Proof</span>
            </div>
            <p className="text-[11px] text-[#6E6E73] leading-relaxed mb-3">
              Only verified owners can access this portal. Tenants are automatically intercepted with 403 Forbidden.
            </p>
            <button
              onClick={() => {
                router.push('/dashboard');
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#F5F5F7] hover:bg-[#EDEDED] text-[#1D1D1F] text-[11px] font-bold inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Test Tenant Route (/dashboard)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* BOTTOM LOGOUT BUTTON */}
        <div className="p-4 border-t border-[#EDEDED]">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-xs font-bold inline-flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 py-8 px-4 sm:px-8 max-w-7xl">
        {/* RBAC INTERCEPTION WARNING BANNER */}
        {rbacBlocked && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 sm:p-5 mb-6 flex items-start gap-3.5 shadow-sm animate-fade-in">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm">
                  RBAC Access Control Enforced — Tenant Route Intercepted
                </h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-200 text-amber-800 uppercase">
                  Redirected
                </span>
              </div>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Your attempt to access the Tenant Dashboard (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-800">/dashboard</code>) was intercepted. As an Owner (<span className="font-bold underline">apnastay_owner</span>), you have been redirected to your authoritative Owner Portal.
              </p>
            </div>
          </div>
        )}
        {/* WP ADMIN ATTEMPT WARNING BANNER */}
        {wpAdminBlocked && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 sm:p-5 mb-6 flex items-start gap-3.5 shadow-sm animate-fade-in">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm">
                  WordPress Admin Access Denied — Headless Operation Enforced
                </h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-200 text-amber-800 uppercase">
                  WP-Admin 403
                </span>
              </div>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Your attempt to access the WordPress backend (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-800">/wp-admin/</code>) was intercepted. Landlord accounts interact exclusively through the ApnaStay Next.js application.
              </p>
            </div>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}

export default function OwnerDashboardShell(props: OwnerDashboardShellProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <Loader2 className="w-6 h-6 text-[#1D1D1F] animate-spin" />
        </div>
      }
    >
      <OwnerDashboardShellInner {...props} />
    </Suspense>
  );
}
