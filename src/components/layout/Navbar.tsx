'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Scale, UserCheck, Shield, BarChart3, ChevronDown, Sparkles, LogIn, User, Menu, X } from 'lucide-react';

export default function Navbar({
  wishlistCount = 0,
  compareCount = 0,
  activeRole = 'tenant',
  currentUser = null as any,
  onRoleChange,
  onOpenCompare,
  onOpenWishlist,
  onOpenRoleModal,
  onOpenAiMatchmaker,
  onOpenAuthModal
}: any) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const roles = [
    { id: 'tenant', label: 'Tenant View', icon: UserCheck, badge: 'Book & E-Sign' },
    { id: 'owner', label: 'Owner Portal', icon: Shield, badge: 'Zero Brokerage' },
    { id: 'admin', label: 'Field Auditor / Admin', icon: BarChart3, badge: '25-Point Inspections' }
  ];

  const currentRoleObj = roles.find((r) => r.id === activeRole) || roles[0];
  const CurrentRoleIcon = currentRoleObj.icon;

  const isActiveRoute = (path) => pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* EXPANDED CONTAINER WIDTH FOR CLEAN, UNCLUTTERED SINGLE-LINE SPARE ROOM */}
      <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <nav className="glass-panel rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 shadow-apple border border-white/90">

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

          {/* MAIN MULTI-PAGE DESKTOP NAVIGATION (SINGLE LINE, CLEAN SPACING, NEVER WRAPS) */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 text-xs xl:text-sm font-medium text-[#6B7280]">
            <Link
              href="/"
              className={`whitespace-nowrap transition-colors ${isActiveRoute('/') ? 'text-[#E1224D] font-semibold' : 'hover:text-[#1A1A1A]'
                }`}
            >
              Home
            </Link>
            <Link
              href="/properties"
              className={`whitespace-nowrap transition-colors ${isActiveRoute('/properties') ? 'text-[#E1224D] font-semibold' : 'hover:text-[#1A1A1A]'
                }`}
            >
              Verified Rooms
            </Link>
            <Link
              href="/cities"
              className={`whitespace-nowrap transition-colors ${isActiveRoute('/cities') ? 'text-[#E1224D] font-semibold' : 'hover:text-[#1A1A1A]'
                }`}
            >
              Tier-2 Cities
            </Link>
            <Link
              href="/why-apnastay"
              className={`whitespace-nowrap transition-colors ${isActiveRoute('/why-apnastay') ? 'text-[#E1224D] font-semibold' : 'hover:text-[#1A1A1A]'
                }`}
            >
              Why ₹0 Brokerage
            </Link>
            <Link
              href="/journal"
              className={`whitespace-nowrap transition-colors ${isActiveRoute('/journal') ? 'text-[#E1224D] font-semibold' : 'hover:text-[#1A1A1A]'
                }`}
            >
              ApnaStay Journal
            </Link>
          </div>

          {/* RIGHT ACTION BUTTONS: SINGLE LINE, NO WRAPPING, PROPER SPACE */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 whitespace-nowrap">
            {/* AI Matchmaker Trigger (Single-line pill) */}
            <button
              onClick={onOpenAiMatchmaker}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-[#E1224D] text-xs font-semibold hover:bg-rose-100 transition-colors border border-rose-100 whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>AI Matchmaker</span>
            </button>

            {/* Compare Counter Button (Symmetrical with Wishlist icon button) */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCompare?.();
              }}
              className="relative hidden md:inline-flex p-2 rounded-full hover:bg-[#FAFAFA] text-[#6B7280] hover:text-[#E1224D] transition-colors border border-transparent hover:border-[#EDEDED] shrink-0"
              title="Compare Properties"
              aria-label="Compare Properties"
            >
              <Scale className="w-4 h-4" />
              {compareCount > 0 && (
                <span suppressHydrationWarning={true} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E1224D] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {compareCount}
                </span>
              )}
            </button>

            {/* Wishlist Counter Button */}
            <button
              onClick={onOpenWishlist}
              className="relative hidden md:inline-flex p-2 rounded-full hover:bg-[#FAFAFA] text-[#6B7280] hover:text-[#E1224D] transition-colors border border-transparent hover:border-[#EDEDED] shrink-0"
              title="Saved Residences"
              aria-label="View Saved Residences"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span suppressHydrationWarning={true} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E1224D] text-white text-[10px] font-bold flex items-center justify-center shadow-sm animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* UNIFIED USER PROFILE & ROLE SWITCHER DROPDOWN */}
            <div className="relative hidden md:block shrink-0">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAFAFA] hover:bg-[#F0F2F5] border border-[#EDEDED] text-xs font-semibold text-[#1A1A1A] transition-all whitespace-nowrap"
              >
                {currentUser ? (
                  <>
                    <User className="w-3.5 h-3.5 text-[#E1224D] shrink-0" />
                    <span>{currentUser.name.split(' ')[0]}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-[#E1224D] uppercase font-bold">
                      {currentRoleObj.label.split(' ')[0]}
                    </span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                    <span>Account</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase font-medium">
                      {currentRoleObj.label.split(' ')[0]}
                    </span>
                  </>
                )}
                <ChevronDown className={`w-3 h-3 text-[#6B7280] transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-apple-lg border border-[#EDEDED] p-2 z-50 animate-slide-up">
                  {/* Account Header */}
                  <div className="px-3 py-2 border-b border-[#EDEDED] mb-1">
                    {currentUser ? (
                      <>
                        <p className="text-xs font-bold text-[#1A1A1A]">{currentUser.name}</p>
                        <p className="text-[10px] text-[#6B7280] mt-0.5">{currentUser.email}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-[#1A1A1A]">Welcome Guest</p>
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            onOpenAuthModal?.();
                          }}
                          className="mt-2 w-full text-center py-1.5 rounded-lg bg-[#E1224D] text-white text-[11px] font-bold shadow-sm hover:bg-[#C71B42] transition-colors"
                        >
                          Sign In / Register
                        </button>
                      </>
                    )}
                  </div>

                  {/* Role Switcher Section */}
                  <div className="px-3 py-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                      Choose View / Role
                    </p>
                  </div>

                  {roles.map((role) => {
                    const Icon = role.icon;
                    const isActive = role.id === activeRole;
                    return (
                      <button
                        key={role.id}
                        onClick={() => {
                          onRoleChange(role.id);
                          setProfileMenuOpen(false);
                          onOpenRoleModal(role.id);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors ${isActive
                            ? 'bg-rose-50 text-[#E1224D] font-semibold'
                            : 'hover:bg-[#FAFAFA] text-[#1A1A1A]'
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#E1224D]' : 'text-[#6B7280]'}`} />
                          <div>
                            <p className="font-semibold">{role.label}</p>
                            <p className="text-[10px] text-[#6B7280]">{role.badge}</p>
                          </div>
                        </div>
                        {isActive && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white border border-[#EDEDED] text-[#E1224D] font-medium">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* MOBILE HAMBURGER MENU ICON (md:hidden) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-[#FAFAFA] hover:bg-[#F0F2F5] border border-[#EDEDED] text-[#1A1A1A] transition-all flex items-center justify-center shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#E1224D]" /> : <Menu className="w-5 h-5 text-[#1A1A1A]" />}
            </button>
          </div>
        </nav>

        {/* MOBILE NAVIGATION MENU DRAWER (md:hidden) */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 animate-slide-up">
            <div className="glass-panel rounded-3xl p-4 shadow-apple-lg border border-white/90 flex flex-col gap-1.5">
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#E1224D]">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1A1A1A]">{currentUser.name}</p>
                        <p className="text-[10px] text-[#6B7280]">{currentUser.email}</p>
                      </div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 text-[#E1224D] uppercase font-bold shrink-0">
                      {currentRoleObj.label.split(' ')[0]}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuthModal?.();
                    }}
                    className="w-full py-2 rounded-xl bg-[#E1224D] text-white text-xs font-bold shadow-sm hover:bg-[#C71B42] transition-colors"
                  >
                    Sign In / Register
                  </button>
                )}
              </div>

              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${isActiveRoute('/') ? 'bg-rose-50 text-[#E1224D]' : 'hover:bg-[#FAFAFA] text-[#1A1A1A]'
                  }`}
              >
                <span>Home</span>
              </Link>

              <Link
                href="/properties"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${isActiveRoute('/properties') ? 'bg-rose-50 text-[#E1224D]' : 'hover:bg-[#FAFAFA] text-[#1A1A1A]'
                  }`}
              >
                <span>Verified Rooms</span>
              </Link>

              <Link
                href="/cities"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${isActiveRoute('/cities') ? 'bg-rose-50 text-[#E1224D]' : 'hover:bg-[#FAFAFA] text-[#1A1A1A]'
                  }`}
              >
                <span>Tier-2 Cities</span>
              </Link>

              <Link
                href="/why-apnastay"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${isActiveRoute('/why-apnastay') ? 'bg-rose-50 text-[#E1224D]' : 'hover:bg-[#FAFAFA] text-[#1A1A1A]'
                  }`}
              >
                <span>Why ₹0 Brokerage</span>
              </Link>

              <Link
                href="/journal"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${isActiveRoute('/journal') ? 'bg-rose-50 text-[#E1224D]' : 'hover:bg-[#FAFAFA] text-[#1A1A1A]'
                  }`}
              >
                <span>ApnaStay Journal</span>
              </Link>

              <div className="pt-2 mt-1 border-t border-[#EDEDED] flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenWishlist?.();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#FAFAFA] border border-[#EDEDED] text-xs font-semibold text-[#1A1A1A] hover:bg-[#F0F2F5] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#E1224D]" />
                    <span>Saved Residences</span>
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
                    onOpenAiMatchmaker();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-rose-50 text-[#E1224D] text-xs font-bold hover:bg-rose-100 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Matchmaker</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenRoleModal(activeRole);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#FAFAFA] border border-[#EDEDED] text-xs font-semibold text-[#1A1A1A]"
                >
                  <div className="flex items-center gap-2">
                    <CurrentRoleIcon className="w-4 h-4 text-[#E1224D]" />
                    <span>View: {currentRoleObj.label}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
