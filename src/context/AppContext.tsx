'use client';
/* eslint-disable */

import React, { createContext, useContext, useState, useMemo, useEffect, useRef, ReactNode } from 'react';
import { STATIC_PROPERTIES, STATIC_CITIES } from '../data/staticProperties';
import type { Property, City } from '../types';
import { handleRoleRedirect } from '../lib/auth/session';

export interface SearchFilters {
  cities: City[];
  selectedCity: string;
  maxPrice: number;
  roomType: string;
  totalResults: number;
}

export interface AppContextType {
  searchFilters: SearchFilters;
  onSearchChange: (type: string, val: string | number) => void;
  onReset: () => void;
  onCitySelect: (city: string) => void;
  wishlistIds: string[];
  compareIds: string[];
  activeRole: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  currentUser: any;
  [key: string]: any;
  onRoleChange: (role: string) => void;
  onToggleWishlist: (id: string) => void;
  onClearWishlist: () => void;
  onToggleCompare: (id: string) => void;
  onRemoveCompare: (id: string) => void;
  onClearCompare: () => void;
  onSelectForCompare: (ids: string[]) => void;
  onOpenCompare: () => void;
  onOpenWishlist: () => void;
  onOpenModal: (prop: Property | null) => void;
  onOpenAiMatchmaker: () => void;
  onOpenRoleModal: () => void;
  onOpenAuthModal: () => void;
  comparePropertiesList: Property[];
  wishlistPropertiesList: Property[];
  selectedPropertyModal: Property | null;
  isAiMatchmakerOpen: boolean;
  isCompareOpen: boolean;
  isWishlistOpen: boolean;
  isRoleModalOpen: boolean;
  isAuthModalOpen: boolean;
  bookingConfirmation: Property | null;
  authToast: string | null;
  onCloseModal: () => void;
  onCloseAiMatchmaker: () => void;
  onCloseCompare: () => void;
  onCloseWishlist: () => void;
  onCloseRoleModal: () => void;
  onCloseAuthModal: () => void;
  onBookVisit: (prop: Property | null) => void;
  onCloseBookingConfirmation: () => void;
  handleLoginSuccess: (user: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCity] = useState('all');
  const [maxPrice, setMaxPrice] = useState(50000);
  const [roomType, setRoomType] = useState('all');

  const [wishlistIds, setWishlistIds] = useState<string[]>(['prop-101']);
  const isWishlistLoaded = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ownstay_wishlist');
      if (saved) {
        setWishlistIds(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load wishlist from localStorage', e);
    } finally {
      isWishlistLoaded.current = true;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && isWishlistLoaded.current) {
      try {
        localStorage.setItem('ownstay_wishlist', JSON.stringify(wishlistIds));
      } catch (e) {
        console.error('Failed to save wishlist to localStorage', e);
      }
    }
  }, [wishlistIds]);

  const [compareIds, setCompareIds] = useState<string[]>(['prop-101', 'prop-102']);
  const [activeRole, setActiveRole] = useState('tenant');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [selectedPropertyModal, setSelectedPropertyModal] = useState<Property | null>(null);
  const [isAiMatchmakerOpen, setIsAiMatchmakerOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<Property | null>(null);
  const [authToast, setAuthToast] = useState<string | null>(null);

  const filteredProperties = useMemo(() => {
    return STATIC_PROPERTIES.filter((p) => {
      if (selectedCity !== 'all' && p.city !== selectedCity) return false;
      if (typeof p.price === 'number' && p.price > maxPrice) return false;
      if (roomType !== 'all' && (p as any).roomType && !(p as any).roomType.toLowerCase().includes(roomType.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [selectedCity, maxPrice, roomType]);

  const handleToggleWishlist = (id: string) => {
    setWishlistIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleCompare = (id: string) => {
    if (!id || typeof id !== 'string') {
      setIsCompareOpen(true);
      return;
    }
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

  const handleRemoveCompare = (id: string) => {
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

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setActiveRole(user.role || 'tenant');
    setAuthToast(`Logged in as ${user.name} (${user.roleTitle || user.role})`);
    setTimeout(() => setAuthToast(null), 4000);
    handleRoleRedirect(user);
  };

  const comparePropertiesList = useMemo(() => {
    return STATIC_PROPERTIES.filter((p) => compareIds.includes(p.id));
  }, [compareIds]);

  const wishlistPropertiesList = useMemo(() => {
    return STATIC_PROPERTIES.filter((p) => wishlistIds.includes(p.id));
  }, [wishlistIds]);

  const handleClearWishlist = () => {
    setWishlistIds([]);
  };

  const searchFilters: SearchFilters = {
    cities: STATIC_CITIES,
    selectedCity,
    maxPrice,
    roomType,
    totalResults: filteredProperties.length
  };

  const value: AppContextType = {
    searchFilters,
    onSearchChange: (type, val) => {
      if (type === 'city') setSelectedCity(String(val));
      if (type === 'price') setMaxPrice(Number(val));
      if (type === 'roomType') setRoomType(String(val));
    },
    onReset: handleResetFilters,
    onCitySelect: (city) => setSelectedCity(city),
    wishlistIds,
    compareIds,
    activeRole,
    currentUser,
    onRoleChange: setActiveRole,
    onToggleWishlist: handleToggleWishlist,
    onClearWishlist: handleClearWishlist,
    onToggleCompare: handleToggleCompare,
    onRemoveCompare: handleRemoveCompare,
    onClearCompare: handleClearCompare,
    onSelectForCompare: (ids) => setCompareIds(ids),
    onOpenCompare: () => setIsCompareOpen(true),
    onOpenWishlist: () => setIsWishlistOpen(true),
    onOpenModal: (prop) => setSelectedPropertyModal(prop),
    onOpenAiMatchmaker: () => setIsAiMatchmakerOpen(true),
    onOpenRoleModal: () => setIsRoleModalOpen(true),
    onOpenAuthModal: () => setIsAuthModalOpen(true),
    comparePropertiesList,
    wishlistPropertiesList,
    selectedPropertyModal,
    isAiMatchmakerOpen,
    isCompareOpen,
    isWishlistOpen,
    isRoleModalOpen,
    isAuthModalOpen,
    bookingConfirmation,
    authToast,
    onCloseModal: () => setSelectedPropertyModal(null),
    onCloseAiMatchmaker: () => setIsAiMatchmakerOpen(false),
    onCloseCompare: () => setIsCompareOpen(false),
    onCloseWishlist: () => setIsWishlistOpen(false),
    onCloseRoleModal: () => setIsRoleModalOpen(false),
    onCloseAuthModal: () => setIsAuthModalOpen(false),
    onBookVisit: (prop) => setBookingConfirmation(prop),
    onCloseBookingConfirmation: () => setBookingConfirmation(null),
    handleLoginSuccess
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
