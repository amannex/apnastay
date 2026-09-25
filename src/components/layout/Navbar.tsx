'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Scale, UserCheck, Shield, BarChart3, ChevronDown, Sparkles, LogIn, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar({
  wishlistCount = 0,
  compareCount = 0,
  activeRole = 'tenant',
  currentUser = null as any,
  onOpenCompare,
  onOpenWishlist,
  onOpenAiMatchmaker,
  onOpenAuthModal,
  onLogout
}: any) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const userDisplayName = currentUser
    ? (currentUser.name || [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || currentUser.email?.split('@')[0] || 'User')
    : 'Account';
  const userFirstName = userDisplayName.split(' ')[0] || 'User';
  const roleLabel = currentUser?.role?.includes('owner')
    ? 'Owner'
    : currentUser?.role?.includes('admin')
    ? 'Admin'
    : 'Tenant';
  const avatarUrl = currentUser?.avatar || currentUser?.metadata?.avatar;

  const isActiveRoute = (path) => pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-[#EDEDED] shadow-xs py-3 sm:py-3.5'
          : 'bg-transparent py-4 sm:py-6'
      }`}
    >
      {/* 10% REDUCED HEADER WIDTH (1600px -> 1440px) FOR OPTIMAL VISUAL BALANCE */}
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between gap-3 sm:gap-6">

          {/* BRAND LOGO (NEVER WRAPS) */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0 whitespace-nowrap">
            <img
              src="/logo-icon.png"
              alt="ApnaStay Logo"
              className="h-9 w-auto group-hover:scale-105 transition-transform object-contain"
            />
            <span className="font-gotham-black text-lg sm:text-xl tracking-tighter text-[#1A1A1A]">
              ApnaStay<span className="text-[#E1224D]">.</span>
            </span>
          </Link>

          {/* MAIN MULTI-PAGE DESKTOP NAVIGATION (PROPER GAP & REFINED FONT SIZE) */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-semibold tracking-tight text-[#374151]">
            <Link
              href="/about"
              className={`whitespace-nowrap transition-colors duration-200 ${
                isActiveRoute('/about') || isActiveRoute('/who-we-are')
                  ? 'text-[#E1224D] font-bold'
                  : 'hover:text-[#E1224D]'
              }`}
            >
              Who We Are
            </Link>
            <Link
              href="/cities"
              className={`whitespace-nowrap transition-colors duration-200 ${
                isActiveRoute('/cities') ? 'text-[#E1224D] font-bold' : 'hover:text-[#E1224D]'
              }`}
            >
              Cities
            </Link>
            <Link
              href="/how-it-works"
              className={`whitespace-nowrap transition-colors duration-200 ${
                isActiveRoute('/how-it-works') || isActiveRoute('/why-apnastay')
                  ? 'text-[#E1224D] font-bold'
                  : 'hover:text-[#E1224D]'
              }`}
            >
              How It Works
            </Link>
            <Link
              href="/upcoming-features"
              className={`whitespace-nowrap transition-colors duration-200 ${
                isActiveRoute('/upcoming-features')
                  ? 'text-[#E1224D] font-bold'
                  : 'hover:text-[#E1224D]'
              }`}
            >
              Coming soon
            </Link>
          </div>

          {/* RIGHT ACTION BUTTONS: FIND APNA STAY (BUTTON) → LIST APNA STAY (BUTTON) → COMPARE → ACCOUNT (ICON ONLY) */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 whitespace-nowrap">
            {/* Find Apna Stay Button */}
            <Link
              href="/properties"
              className={`hidden md:inline-flex items-center justify-center px-4 py-2 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 shadow-2xs whitespace-nowrap shrink-0 hover:scale-[1.02] active:scale-95 border ${
                isActiveRoute('/properties')
                  ? 'bg-rose-50 text-[#E1224D] border-[#E1224D]/40 font-bold'
                  : 'bg-white hover:bg-rose-50/60 text-[#1A1A1A] hover:text-[#E1224D] border-[#EDEDED] hover:border-[#E1224D]/30'
              }`}
            >
              Find Apna Stay
            </Link>

            {/* List Apna Stay Button */}
            <Link
              href="/owner/dashboard/properties/new"
              className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#E1224D] hover:bg-[#C71B42] text-white text-xs xl:text-sm font-semibold transition-all duration-200 shadow-2xs hover:shadow-apple-xs whitespace-nowrap shrink-0 hover:scale-[1.02] active:scale-95"
            >
              List Apna Stay
            </Link>

            {/* Compare Button with Counter */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCompare?.();
              }}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-black/5 text-[#374151] hover:text-[#E1224D] transition-colors border border-transparent hover:border-[#EDEDED] text-xs xl:text-sm font-semibold shrink-0 cursor-pointer"
              title="Compare Properties"
              aria-label="Compare Properties"
            >
              <Scale className="w-4 h-4 shrink-0 text-[#374151]" />
              <span className="hidden sm:inline">Compare</span>
              {compareCount > 0 && (
                <span
                  suppressHydrationWarning={true}
                  className="px-1.5 py-0.2 rounded-full bg-[#E1224D] text-white text-[10px] font-bold flex items-center justify-center shadow-xs"
                >
                  {compareCount}
                </span>
              )}
            </button>

            {/* UNIFIED USER PROFILE / ACCOUNT BUTTON (ICON ONLY - NO TEXT WRITTEN) */}
            {currentUser ? (
              <div ref={profileMenuRef} className="relative block shrink-0">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer border ${
                    profileMenuOpen
                      ? 'border-[#E1224D] ring-2 ring-[#E1224D]/20 bg-rose-50'
                      : 'border-[#EDEDED] hover:border-[#D1D5DB] bg-white/90 hover:bg-white'
                  }`}
                  title={`${userDisplayName} (${roleLabel})`}
                  aria-label="Account Menu"
                  aria-expanded={profileMenuOpen}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={userDisplayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-rose-50 flex items-center justify-center text-[#E1224D]">
                      <User className="w-4 h-4 text-[#E1224D]" />
                    </div>
                  )}
                  {/* Role status badge dot */}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      currentUser?.role?.includes('owner')
                        ? 'bg-[#E1224D]'
                        : currentUser?.role?.includes('admin')
                        ? 'bg-purple-600'
                        : 'bg-emerald-500'
                    }`}
                    title={roleLabel}
                  />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-apple-lg border border-[#EDEDED] p-2 z-50 animate-slide-up">
                    {/* Account Header */}
                    <div className="px-3 py-2.5 border-b border-[#EDEDED] mb-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-[#1A1A1A] truncate">{userDisplayName}</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 text-[#E1224D] uppercase font-bold tracking-wide shrink-0">
                          {roleLabel}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#6B7280] truncate">{currentUser.email}</p>
                    </div>

                    {/* Navigation Links based on role */}
                    <div className="py-1 space-y-0.5">
                      {currentUser?.role?.includes('owner') ? (
                        <>
                          <Link
                            href="/owner/dashboard"
                            onClick={() => setProfileMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#6B7280]" />
                            <span>Owner Dashboard</span>
                          </Link>
                          <Link
                            href="/owner/dashboard/properties"
                            onClick={() => setProfileMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors"
                          >
                            <Shield className="w-4 h-4 text-[#6B7280]" />
                            <span>My Properties</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setProfileMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#6B7280]" />
                            <span>Tenant Dashboard</span>
                          </Link>
                          <Link
                            href="/my-visits"
                            onClick={() => setProfileMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors"
                          >
                            <UserCheck className="w-4 h-4 text-[#6B7280]" />
                            <span>Scheduled Visits</span>
                          </Link>
                        </>
                      )}

                      {/* WISHLIST INSIDE ACCOUNT DROPDOWN (ACCESSIBLE TO ALL USERS) */}
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onOpenWishlist?.();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Heart className="w-4 h-4 text-[#E1224D]" />
                          <span>Saved Wishlist</span>
                        </div>
                        {wishlistCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#E1224D] text-white text-[10px] font-bold">
                            {wishlistCount}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Logout Action */}
                    <div className="pt-1 mt-1 border-t border-[#EDEDED]">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onLogout?.();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#E1224D] hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-[#E1224D]" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="w-9 h-9 rounded-full bg-rose-50 hover:bg-rose-100 text-[#E1224D] border border-rose-200/80 flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95 shrink-0"
                title="Account / Sign In"
                aria-label="Account"
              >
                <User className="w-4 h-4 text-[#E1224D]" />
              </Link>
            )}

            {/* MOBILE HAMBURGER MENU ICON (lg:hidden) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full bg-[#FAFAFA] hover:bg-[#F0F2F5] border border-[#EDEDED] text-[#1A1A1A] transition-all flex items-center justify-center shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#E1224D]" /> : <Menu className="w-5 h-5 text-[#1A1A1A]" />}
            </button>
          </div>
        </nav>

        {/* MOBILE NAVIGATION MENU DRAWER (lg:hidden) */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 animate-slide-up">
            <div className="bg-white rounded-3xl p-4 shadow-2xl border border-[#EDEDED] flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#EDEDED] px-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  ApnaStay Navigation
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-semibold text-[#E1224D]"
                >
                  Close
                </button>
              </div>

              {/* Mobile Account Profile or Login */}
              <div className="px-2 py-3 border-b border-[#EDEDED]">
                {currentUser ? (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#E1224D]">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1A1A1A]">{userDisplayName}</p>
                          <p className="text-[10px] text-[#6B7280]">{currentUser.email}</p>
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 text-[#E1224D] uppercase font-bold shrink-0">
                        {roleLabel}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Link
                        href={currentUser?.role?.includes('owner') ? '/owner/dashboard' : '/dashboard'}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 text-center py-2 rounded-xl bg-gray-100 text-xs font-semibold text-[#1A1A1A] hover:bg-gray-200 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onLogout?.();
                        }}
                        className="px-3 py-2 rounded-xl bg-rose-50 text-xs font-semibold text-[#E1224D] hover:bg-rose-100 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#E1224D] text-white text-xs font-bold shadow-sm hover:bg-[#C71B42] transition-colors text-center"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Sign In / Register</span>
                  </Link>
                )}
              </div>

              {/* NAVIGATION LINKS */}
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActiveRoute('/about') || isActiveRoute('/who-we-are')
                    ? 'bg-rose-50 text-[#E1224D]'
                    : 'hover:bg-[#FAFAFA] text-[#1A1A1A]'
                }`}
              >
                <span>Who We Are</span>
              </Link>

              <Link
                href="/cities"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActiveRoute('/cities') ? 'bg-rose-50 text-[#E1224D]' : 'hover:bg-[#FAFAFA] text-[#1A1A1A]'
                }`}
              >
                <span>Cities</span>
              </Link>

              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActiveRoute('/how-it-works') || isActiveRoute('/why-apnastay')
                    ? 'bg-rose-50 text-[#E1224D]'
                    : 'hover:bg-[#FAFAFA] text-[#1A1A1A]'
                }`}
              >
                <span>How It Works</span>
              </Link>

              <Link
                href="/upcoming-features"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActiveRoute('/upcoming-features')
                    ? 'bg-rose-50 text-[#E1224D]'
                    : 'hover:bg-[#FAFAFA] text-[#1A1A1A]'
                }`}
              >
                <span>Coming soon</span>
              </Link>

              {/* BUTTON MENUS IN MOBILE DRAWER */}
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/properties"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#EDEDED] text-center text-xs font-bold text-[#1A1A1A] hover:bg-rose-50 hover:text-[#E1224D] hover:border-[#E1224D]/30 transition-colors"
                >
                  Find Apna Stay
                </Link>

                <Link
                  href="/owner/dashboard/properties/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#E1224D] text-white text-center text-xs font-bold shadow-sm hover:bg-[#C71B42] transition-colors"
                >
                  List Apna Stay
                </Link>
              </div>

              {/* ACTION UTILITIES: COMPARE & WISHLIST */}
              <div className="pt-2 mt-1 border-t border-[#EDEDED] flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCompare?.();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#FAFAFA] border border-[#EDEDED] text-xs font-semibold text-[#1A1A1A] hover:bg-[#F0F2F5] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#E1224D]" />
                    <span>Compare Properties</span>
                  </div>
                  {compareCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#E1224D] text-white text-[10px] font-bold flex items-center justify-center">
                      {compareCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenWishlist?.();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#FAFAFA] border border-[#EDEDED] text-xs font-semibold text-[#1A1A1A] hover:bg-[#F0F2F5] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#E1224D]" />
                    <span>Saved Residences (Wishlist)</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#E1224D] text-white text-[10px] font-bold flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAiMatchmaker?.();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-rose-50 text-[#E1224D] text-xs font-bold hover:bg-rose-100 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Matchmaker</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

