'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Home,
  Heart,
  Key,
  Calendar,
  DollarSign,
  FileText,
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
  ArrowLeft,
} from 'lucide-react';
import { getSessionRole } from '../../lib/auth/session';
import { useAuth } from '../../context/AuthContext';
import type { UserProfile } from '../../features/auth/types';

export interface TenantDashboardShellProps {
  children: React.ReactNode;
  activeTab?: string;
}

function TenantDashboardShellInner({
  children,
  activeTab = 'overview',
}: TenantDashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rbacBlocked = searchParams.get('rbac_blocked') === 'owner_portal';
  const wpAdminBlocked = searchParams.get('wp_admin_blocked') === '1';

  const { user, loading: loadingAuth, logout, authenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOwnerBlocked, setIsOwnerBlocked] = useState(false);

  useEffect(() => {
    if (loadingAuth) return;
    const role = getSessionRole(user);
    if (!user || !authenticated || role === 'guest') {
      router.replace('/login?redirect=' + encodeURIComponent(pathname || '/dashboard'));
    } else if (role === 'owner') {
      setIsOwnerBlocked(true);
      router.replace('/owner/dashboard');
    }
  }, [user, authenticated, loadingAuth, router, pathname]);

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: Home, slug: 'overview' },
    { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart, slug: 'wishlist' },
    { name: 'Visits', href: '/dashboard/visits', icon: Key, slug: 'visits' },
    { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar, slug: 'bookings' },
    { name: 'Payments', href: '/dashboard/payments', icon: DollarSign, slug: 'payments' },
    { name: 'Agreements', href: '/dashboard/agreements', icon: FileText, slug: 'agreements' },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare, slug: 'messages' },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, slug: 'notifications' },
    { name: 'Profile', href: '/dashboard/profile', icon: User, slug: 'profile' },
  ];

  if (loadingAuth || isOwnerBlocked) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-[#FAFAFA] gap-3">
        <Loader2 className="w-7 h-7 text-[#1D1D1F] animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">
          {isOwnerBlocked ? 'Redirecting to Owner Dashboard...' : 'Verifying Tenant Session & RBAC...'}
        </span>
      </div>
    );
  }

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
            Tenant Dashboard
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] transition-all"
            title="Return to Home without logging out"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 uppercase">
            Tenant RBAC
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
        className={`fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#EDEDED] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 overflow-y-auto">
          {/* BRAND HEADER & RETURN TO HOME */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#EDEDED]">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-transform"
              title="Return to ApnaStay Home"
            >
              <img
                src="/logo-icon.png"
                alt="ApnaStay Logo"
                className="h-7 w-auto group-hover:scale-105 transition-transform object-contain"
              />
              <span className="font-bold text-sm tracking-tight text-[#1D1D1F]">
                ApnaStay<span className="text-[#E1224D]">.</span>
              </span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#86868B] hover:text-[#1D1D1F] px-2 py-1 rounded-lg hover:bg-[#F5F5F7] transition-all"
              title="Return to Home without logging out"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Home</span>
            </Link>
          </div>

          {/* USER IDENTITY CARD */}
          <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1D1D1F] text-white flex items-center justify-center font-black text-sm shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'T'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs text-[#1D1D1F] truncate">
                    {user?.name || 'Tenant Account'}
                  </h3>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                <p className="text-[10px] text-[#86868B] font-medium truncate">
                  {user?.role || 'apnastay_tenant'}
                </p>
              </div>
            </div>
          </div>

          {/* SIDEBAR LINKS */}
          <nav className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] px-3 mb-2">
              Tenant Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.slug === 'overview'
                  ? pathname === '/dashboard'
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
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="p-4 border-t border-[#EDEDED] space-y-2">
          <Link
            href="/"
            className="w-full py-2.5 px-3 rounded-xl hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-bold inline-flex items-center justify-center gap-2 transition-all border border-[#EDEDED]"
          >
            <ArrowLeft className="w-4 h-4 text-[#86868B]" />
            <span>Back to Home</span>
          </Link>
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
          <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4 sm:p-5 mb-6 flex items-start gap-3.5 shadow-sm animate-fade-in">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm">
                  RBAC Access Control Enforced — Owner Route Forbidden
                </h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-200 text-rose-800 uppercase">
                  403 Intercepted
                </span>
              </div>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                Your attempt to access the Owner Portal (<code className="font-mono bg-rose-100 px-1 py-0.5 rounded text-rose-800">/owner/dashboard</code>) was intercepted and blocked. Your account role is <span className="font-bold underline">apnastay_tenant</span>, which cannot view owner resources.
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
                Your attempt to access the WordPress backend (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-800">/wp-admin/</code>) was intercepted. Tenant accounts interact exclusively through the ApnaStay Next.js application.
              </p>
            </div>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}

export default function TenantDashboardShell(props: TenantDashboardShellProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <Loader2 className="w-6 h-6 text-[#1D1D1F] animate-spin" />
        </div>
      }
    >
      <TenantDashboardShellInner {...props} />
    </Suspense>
  );
}
