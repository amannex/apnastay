'use client';

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useApp } from '../../context/AppContext';
import AuthModal from '../auth/AuthModal';
import PropertyModal from '../properties/PropertyModal';
import AiMatchmakerModal from '../ai/AiMatchmakerModal';
import CompareDrawer from '../properties/CompareDrawer';
import RoleDashboardModal from '../dashboard/RoleDashboardModal';
import { STATIC_CITIES, STATIC_PROPERTIES } from '../../data/staticProperties';
import { CheckCircle2, Key, X } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const {
    wishlistIds,
    compareIds,
    activeRole,
    currentUser,
    onRoleChange,
    onOpenCompare,
    onOpenRoleModal,
    onOpenAiMatchmaker,
    onOpenAuthModal,
    authToast,
    isAuthModalOpen,
    onCloseAuthModal,
    handleLoginSuccess,
    selectedPropertyModal,
    onCloseModal,
    onToggleWishlist,
    onBookVisit,
    isAiMatchmakerOpen,
    onCloseAiMatchmaker,
    onOpenModal,
    isCompareOpen,
    onCloseCompare,
    comparePropertiesList,
    onRemoveCompare,
    onClearCompare,
    isRoleModalOpen,
    onCloseRoleModal,
    bookingConfirmation,
    onCloseBookingConfirmation
  } = useApp();

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans">
      <Navbar
        wishlistCount={wishlistIds.length}
        compareCount={compareIds.length}
        activeRole={activeRole}
        currentUser={currentUser}
        onRoleChange={onRoleChange}
        onOpenCompare={onOpenCompare}
        onOpenRoleModal={onOpenRoleModal}
        onOpenAiMatchmaker={onOpenAiMatchmaker}
        onOpenAuthModal={onOpenAuthModal}
      />

      {/* Auth Celebration Toast */}
      {authToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#1A1A1A] text-white px-5 py-3 rounded-2xl shadow-apple-lg border border-white/20 flex items-center gap-3 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-[#E1224D]" />
          <span className="text-sm font-medium">{authToast}</span>
        </div>
      )}

      {/* Main Route Content */}
      <main>{children}</main>

      <Footer onExploreClick={() => {}} />

      {/* Shared Modals & Drawers */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={onCloseAuthModal}
        onLoginSuccess={handleLoginSuccess}
      />

      <PropertyModal
        property={selectedPropertyModal}
        onClose={onCloseModal}
        isWishlisted={selectedPropertyModal ? wishlistIds.includes(selectedPropertyModal.id) : false}
        onToggleWishlist={onToggleWishlist}
        onBookVisit={onBookVisit}
      />

      <AiMatchmakerModal
        isOpen={isAiMatchmakerOpen}
        onClose={onCloseAiMatchmaker}
        cities={STATIC_CITIES}
        properties={STATIC_PROPERTIES}
        onSelectProperty={onOpenModal}
      />

      <CompareDrawer
        isOpen={isCompareOpen}
        onClose={onCloseCompare}
        compareList={comparePropertiesList}
        onRemoveCompare={onRemoveCompare}
        onClearCompare={onClearCompare}
        onSelectProperty={onOpenModal}
      />

      <RoleDashboardModal
        isOpen={isRoleModalOpen}
        onClose={onCloseRoleModal}
        activeRole={activeRole}
        onRoleSelect={onRoleChange}
      />

      {/* Booking Confirmation Dialog */}
      {bookingConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-apple-xl border border-gray-100 text-center relative">
            <button
              onClick={onCloseBookingConfirmation}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-[#E1224D]/10 text-[#E1224D] rounded-full flex items-center justify-center mx-auto mb-5">
              <Key className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
              Visit Requested for {bookingConfirmation.title}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Our Zero-Brokerage concierge will share verified owner details and access codes via WhatsApp within 15 minutes.
            </p>
            <button
              onClick={onCloseBookingConfirmation}
              className="w-full py-3 bg-[#1A1A1A] text-white rounded-xl font-medium hover:bg-black transition-all"
            >
              Done & Continue Exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
