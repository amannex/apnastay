import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import CitiesPage from './pages/CitiesPage';
import WhyOwnStayPage from './pages/WhyOwnStayPage';
import JournalPage from './pages/JournalPage';

import PropertyModal from './components/properties/PropertyModal';
import AiMatchmakerModal from './components/ai/AiMatchmakerModal';
import CompareDrawer from './components/properties/CompareDrawer';
import RoleDashboardModal from './components/dashboard/RoleDashboardModal';
import AuthModal from './components/auth/AuthModal';

import { STATIC_PROPERTIES, STATIC_CITIES } from './data/staticProperties';
import { Key, X, CheckCircle2 } from 'lucide-react';

export default function App() {
  // --- FILTERS STATE (with Indian INR Pricing) ---
  const [selectedCity, setSelectedCity] = useState('all');
  const [maxPrice, setMaxPrice] = useState(50000);
  const [roomType, setRoomType] = useState('all');

  // --- SaaS USER ROLE & WISHLIST STATE ---
  const [wishlistIds, setWishlistIds] = useState(['prop-101']);
  const [compareIds, setCompareIds] = useState(['prop-101', 'prop-102']);
  const [activeRole, setActiveRole] = useState('tenant');
  const [currentUser, setCurrentUser] = useState(null);

  // --- MODALS STATE ---
  const [selectedPropertyModal, setSelectedPropertyModal] = useState(null);
  const [isAiMatchmakerOpen, setIsAiMatchmakerOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [authToast, setAuthToast] = useState(null);

  // --- FILTER PROPERTIES ---
  const filteredProperties = useMemo(() => {
    return STATIC_PROPERTIES.filter((p) => {
      if (selectedCity !== 'all' && p.city !== selectedCity) return false;
      if (p.price > maxPrice) return false;
      if (roomType !== 'all' && !p.roomType.toLowerCase().includes(roomType.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [selectedCity, maxPrice, roomType]);

  // --- HANDLERS ---
  const handleToggleWishlist = (id) => {
    setWishlistIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 3) {
        alert('You can compare up to 3 verified Indian properties at a time.');
        return prev;
      }
      return [...prev, id];
    });
    setIsCompareOpen(true);
  };

  const handleRemoveCompare = (id) => {
    setCompareIds((prev) => prev.filter((i) => i !== id));
  };

  const handleClearCompare = () => {
    setCompareIds([]);
    setIsCompareOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedCity('all');
    setMaxPrice(50000);
    setRoomType('all');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    setAuthToast(`Logged in as ${user.name} (${user.roleTitle})`);
    setTimeout(() => setAuthToast(null), 4000);
  };

  const comparePropertiesList = useMemo(() => {
    return STATIC_PROPERTIES.filter((p) => compareIds.includes(p.id));
  }, [compareIds]);

  const searchFilters = {
    cities: STATIC_CITIES,
    selectedCity,
    maxPrice,
    roomType,
    totalResults: filteredProperties.length
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-[#1A1A1A] font-sans">
        {/* 1. SHARED MULTI-PAGE NAVBAR WITH LOGIN/REGISTER USER TYPE STATE */}
        <Navbar
          wishlistCount={wishlistIds.length}
          compareCount={compareIds.length}
          activeRole={activeRole}
          currentUser={currentUser}
          onRoleChange={setActiveRole}
          onOpenCompare={() => setIsCompareOpen(true)}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
          onOpenAiMatchmaker={() => setIsAiMatchmakerOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* 2. AUTH CELEBRATION TOAST */}
        {authToast && (
          <div className="fixed top-20 right-4 z-50 bg-[#1A1A1A] text-white px-5 py-3 rounded-2xl shadow-apple-lg border border-white/20 flex items-center gap-3 animate-slide-up">
            <CheckCircle2 className="w-5 h-5 text-[#E1224D]" />
            <span className="text-xs font-bold">{authToast}</span>
          </div>
        )}

        {/* 3. MULTI-PAGE ROUTE DEFINITIONS */}
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                searchFilters={searchFilters}
                onSearchChange={(type, val) => {
                  if (type === 'city') setSelectedCity(val);
                  if (type === 'price') setMaxPrice(Number(val));
                  if (type === 'roomType') setRoomType(val);
                }}
                onReset={handleResetFilters}
                onCitySelect={(city) => setSelectedCity(city)}
                onOpenModal={(prop) => setSelectedPropertyModal(prop)}
                compareIds={compareIds}
                wishlistIds={wishlistIds}
                onToggleCompare={handleToggleCompare}
                onToggleWishlist={handleToggleWishlist}
                onOpenCompare={handleToggleCompare}
                onOpenAiMatchmaker={() => setIsAiMatchmakerOpen(true)}
              />
            }
          />
          <Route
            path="/properties"
            element={
              <PropertiesPage
                activeTab="All"
                compareIds={compareIds}
                wishlistIds={wishlistIds}
                onToggleCompare={handleToggleCompare}
                onToggleWishlist={handleToggleWishlist}
                onOpenModal={(prop) => setSelectedPropertyModal(prop)}
                onOpenCompare={handleToggleCompare}
              />
            }
          />
          <Route path="/cities" element={<CitiesPage />} />
          <Route path="/why-ownstay" element={<WhyOwnStayPage />} />
          <Route path="/journal" element={<JournalPage />} />
        </Routes>

        {/* 4. SHARED MULTI-PAGE FOOTER */}
        <Footer />

        {/* --- SHARED MODALS & DRAWERS --- */}

        {/* User Login & Register by Role Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />

        {/* Property Inspection Modal (with 3D Room Viewer & INR Cost Breakdown) */}
        <PropertyModal
          property={selectedPropertyModal}
          onClose={() => setSelectedPropertyModal(null)}
          isWishlisted={selectedPropertyModal ? wishlistIds.includes(selectedPropertyModal.id) : false}
          onToggleWishlist={handleToggleWishlist}
          onBookVisit={(prop) => setBookingConfirmation(prop)}
        />

        {/* AI Matchmaker 3-Step Wizard */}
        <AiMatchmakerModal
          isOpen={isAiMatchmakerOpen}
          onClose={() => setIsAiMatchmakerOpen(false)}
          cities={STATIC_CITIES}
          properties={STATIC_PROPERTIES}
          onSelectProperty={(prop) => setSelectedPropertyModal(prop)}
        />

        {/* Side-by-Side Property Comparison Matrix */}
        <CompareDrawer
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          compareList={comparePropertiesList}
          onRemoveCompare={handleRemoveCompare}
          onClearCompare={handleClearCompare}
          onSelectProperty={(prop) => setSelectedPropertyModal(prop)}
        />

        {/* User Role SaaS Showcase Modal */}
        <RoleDashboardModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          activeRole={activeRole}
          onRoleChange={setActiveRole}
        />

        {/* NFC Instant Visit Booking Confirmation Modal */}
        {bookingConfirmation && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-slide-up">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-[#EDEDED] shadow-apple-lg relative">
              <button
                onClick={() => setBookingConfirmation(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#FAFAFA] text-[#6B7280] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A]">
                NFC Tour Pass Issued!
              </h3>
              <p className="text-sm text-[#6B7280] mt-2">
                Your ephemeral encrypted NFC key for <strong>{bookingConfirmation.title}</strong> is active. Tap your phone on the apartment smart-lock anytime tomorrow between 9 AM – 8 PM.
              </p>
              <div className="mt-6 p-4 rounded-2xl bg-[#FAFAFA] border border-[#EDEDED] text-xs font-bold text-emerald-600">
                ₹0 Brokerage Fee • 100% Refundable Security Deposit
              </div>
              <button
                onClick={() => setBookingConfirmation(null)}
                className="w-full mt-6 py-3.5 rounded-full bg-[#E1224D] text-white font-semibold text-sm shadow-apple hover:bg-[#C71B42] transition-all"
              >
                Add to Apple Wallet & Done
              </button>
            </div>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}
