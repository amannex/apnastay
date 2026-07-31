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
  onOpenRoleModal,
  onOpenAiMatchmaker,
  onOpenAuthModal
}: any) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
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
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0 whitespace-nowrap">
            <div className="w-8 h-8 rounded-full bg-[#E1224D] flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
              O
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-[#1A1A1A]">
              OwnStay<span className="text-[#E1224D]">.</span>
            </span>
          </Link>

          {/* MAIN MULTI-PAGE DESKTOP NAVIGATION (SINGLE LINE, CLEAN SPACING, NEVER WRAPS) */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 text-xs xl:text-sm font-medium text-[#6B7280]">
            <Link
              href="/"
              className={`whitespace-nowrap transition-colors ${
                isActiveRoute('/') ? 'text-[#E1224D] font-semibold' : 'hover:text-[#1A1A1A]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/properties"
              className={`whitespace-nowrap transition-colors ${
                isActiveRoute('/properties') ? 'text-[#E1224D] font-semibold' : 'hover:text-[#1A1A1A]'
              }`}
            >
              Verified Rooms
            </Link>
            <Link
              href="/cities"
              className={`whitespace-nowrap transition-colors ${
                isActiveRoute('/cities') ? 'text-[#E1224D] font-semibold' : 'hover:text-[#1A1A1A]'
              }`}
            >
              Tier-2 Cities
            </Link>
            <Link
              href="/why-ownstay"
              className={`whitespace-nowrap transition-colors ${
                isActiveRoute('/why-ownstay') ? 'text-[#E1224D] font-semibold' : 'hover:text-[#1A1A1A]'
              }`}
            >
              Why ₹0 Brokerage
            </Link>
            <Link
              href="/journal"
              className={`whitespace-nowrap transition-colors ${
                isActiveRoute('/journal') ? 'text-[#E1224D] font-semibold' : 'hover:text-[#1A1A1A]'
              }`}
            >
              OwnStay Journal
            </Link>
          </div>

          {/* RIGHT ACTION BUTTONS: SINGLE LINE, NO WRAPPING, PROPER SPACE */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 whitespace-nowrap">
            {/* AI Matchmaker Trigger (Single-line pill) */}
            <button
              onClick={onOpenAiMatchmaker}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-[#E1224D] text-xs font-semibold hover:bg-rose-100 transition-colors border border-rose-100 whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>AI Matchmaker</span>
            </button>

            {/* Compare Counter Button (hidden on mobile header, available in mobile hamburger menu) */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCompare?.();
              }}
              className="relative hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAFAFA] hover:bg-[#F0F2F5] border border-[#EDEDED] text-xs font-semibold text-[#1A1A1A] transition-colors shrink-0"
              title="Compare Properties"
            >
              <Scale className="w-3.5 h-3.5 text-[#E1224D]" />
              <span className="hidden sm:inline">Compare</span>
              {compareCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#E1224D] text-white text-[10px] font-bold flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </button>

            {/* Wishlist Counter Button */}
            <button
              className="relative p-2 rounded-full hover:bg-[#FAFAFA] text-[#6B7280] hover:text-[#E1224D] transition-colors border border-transparent hover:border-[#EDEDED] shrink-0"
              title="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E1224D] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* LOGIN / REGISTER USER TYPE BUTTON (Single line, no wrapping) */}
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#FAFAFA] hover:bg-[#F0F2F5] border border-[#EDEDED] text-xs font-semibold text-[#1A1A1A] transition-all whitespace-nowrap shrink-0"
            >
              {currentUser ? (
                <>
                  <User className="w-3.5 h-3.5 text-[#E1224D] shrink-0" />
                  <span>{currentUser.name.split(' ')[0]}</span>
                  <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-[#E1224D] uppercase font-bold">
                    {currentUser.role}
                  </span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 text-[#E1224D] shrink-0" />
                  <span className="sm:hidden">Login</span>
                  <span className="hidden sm:inline">Login / Register</span>
                </>
              )}
            </button>

            {/* MOBILE HAMBURGER MENU ICON (md:hidden) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-[#FAFAFA] hover:bg-[#F0F2F5] border border-[#EDEDED] text-[#1A1A1A] transition-all flex items-center justify-center shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#E1224D]" /> : <Menu className="w-5 h-5 text-[#1A1A1A]" />}
            </button>

            {/* USER ROLE SWITCHER DROPDOWN (Single line, no wrapping) */}
            <div className="relative hidden lg:block shrink-0">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAFAFA] hover:bg-[#F5F5F7] border border-[#EDEDED] text-xs font-semibold text-[#1A1A1A] transition-all whitespace-nowrap"
              >
                <CurrentRoleIcon className="w-3.5 h-3.5 text-[#E1224D] shrink-0" />
                <span>{currentRoleObj.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#6B7280] shrink-0 transition-transform ${roleMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-apple-lg border border-[#EDEDED] p-2 z-50 animate-slide-up">
                  <div className="px-3 py-2 border-b border-[#EDEDED] mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      OwnStay User Type Switcher
                    </p>
                    <p className="text-xs text-[#1A1A1A] mt-0.5">
                      Switch views to test Tenant, Owner & Field Engineer tools.
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
                          setRoleMenuOpen(false);
                          onOpenRoleModal(role.id);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-colors ${
                          isActive
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
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#EDEDED] text-[#6B7280]">
                          Active
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* MOBILE NAVIGATION MENU DRAWER (md:hidden) */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 animate-slide-up">
            <div className="glass-panel rounded-3xl p-4 shadow-apple-lg border border-white/90 flex flex-col gap-1.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#EDEDED] px-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  OwnStay Navigation
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-semibold text-[#E1224D]"
                >
                  Close
                </button>
              </div>

              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActiveRoute('/') ? 'bg-rose-50 text-[#E1224D]' : 'hover:bg-[#FAFAFA] text-[#1A1A1A]'
                }`}
              >
                <span>Home</span>
              </Link>

              <Link
                href="/properties"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActiveRoute('/properties') ? 'bg-rose-50 text-[#E1224D]' : 'hover:bg-[#FAFAFA] text-[#1A1A1A]'
                }`}
              >
                <span>Verified Rooms</span>
              </Link>

              <Link
                href="/cities"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActiveRoute('/cities') ? 'bg-rose-50 text-[#E1224D]' : 'hover:bg-[#FAFAFA] text-[#1A1A1A]'
                }`}
              >
                <span>Tier-2 Cities</span>
              </Link>

              <Link
                href="/why-ownstay"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActiveRoute('/why-ownstay') ? 'bg-rose-50 text-[#E1224D]' : 'hover:bg-[#FAFAFA] text-[#1A1A1A]'
                }`}
              >
                <span>Why ₹0 Brokerage</span>
              </Link>

              <Link
                href="/journal"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActiveRoute('/journal') ? 'bg-rose-50 text-[#E1224D]' : 'hover:bg-[#FAFAFA] text-[#1A1A1A]'
                }`}
              >
                <span>OwnStay Journal</span>
              </Link>

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
