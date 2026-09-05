'use client';
/* eslint-disable */

import React, { createContext, useContext, useState, useMemo, useEffect, useRef, ReactNode } from 'react';
import { STATIC_PROPERTIES, STATIC_CITIES } from '../data/staticProperties';
import type { Property, City } from '../types';
import { handleRoleRedirect } from '../lib/auth/session';
import { useAuth } from './AuthContext';
import type { UserProfile, LoginPayload, RegisterPayload, AuthResponse } from '../features/auth/types';

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
  user: UserProfile | null;
  authenticated: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse<UserProfile>>;
  register: (payload: RegisterPayload) => Promise<AuthResponse<UserProfile>>;
  logout: () => Promise<void>;
  refreshUser: (force?: boolean) => Promise<UserProfile | null>;
  currentUser: UserProfile | null;
  isAuthLoading: boolean;
  handleLogout: () => Promise<void>;
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
  onOpenAuthModal: () => void;
  comparePropertiesList: Property[];
  wishlistPropertiesList: Property[];
  selectedPropertyModal: Property | null;
  isAiMatchmakerOpen: boolean;
  isCompareOpen: boolean;
  isWishlistOpen: boolean;
  isAuthModalOpen: boolean;
  bookingConfirmation: Property | null;
  authToast: string | null;
  onCloseModal: () => void;
  onCloseAiMatchmaker: () => void;
  onCloseCompare: () => void;
  onCloseWishlist: () => void;
  onCloseAuthModal: () => void;
  onBookVisit: (prop: Property | null) => void;
  onCloseBookingConfirmation: () => void;
  handleLoginSuccess: (user: any, customRedirect?: string | null, router?: any) => void;
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
      const saved = localStorage.getItem('apnastay_wishlist');
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
        localStorage.setItem('apnastay_wishlist', JSON.stringify(wishlistIds));
      } catch (e) {
        console.error('Failed to save wishlist to localStorage', e);
      }
    }
  }, [wishlistIds]);

  const [compareIds, setCompareIds] = useState<string[]>(['prop-101', 'prop-102']);
  const [activeRole, setActiveRole] = useState('tenant');

  // Consume centralized authentication state from AuthContext
  const {
    user,
    authenticated,
    loading: isAuthLoading,
    login,
    register,
    logout,
    refreshUser
  } = useAuth();

  // Synchronize active role whenever centralized user profile updates
  useEffect(() => {
    if (user && user.role) {
      const cleanRole = user.role.toLowerCase().replace(/^apnastay_/, '');
      setActiveRole(cleanRole);
    } else {
      setActiveRole('tenant');
    }
  }, [user]);

  const [selectedPropertyModal, setSelectedPropertyModal] = useState<Property | null>(null);
  const [isAiMatchmakerOpen, setIsAiMatchmakerOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
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

  const handleLoginSuccess = (loggedInUser: any, customRedirect?: string | null, router?: any) => {
    setActiveRole(loggedInUser.role || 'tenant');
    setAuthToast(`Logged in as ${loggedInUser.name} (${loggedInUser.roleTitle || loggedInUser.role})`);
    setTimeout(() => setAuthToast(null), 4000);
    handleRoleRedirect(loggedInUser, customRedirect, router);
  };

  const handleLogout = async () => {
    await logout();
    setAuthToast('Logged out successfully.');
    setTimeout(() => setAuthToast(null), 3000);
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
    user,
    authenticated,
    loading: isAuthLoading,
    login,
    register,
    logout: handleLogout,
    refreshUser,
    currentUser: user,
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
    onOpenAuthModal: () => setIsAuthModalOpen(true),
    comparePropertiesList,
    wishlistPropertiesList,
    selectedPropertyModal,
    isAiMatchmakerOpen,
    isCompareOpen,
    isWishlistOpen,
    isAuthModalOpen,
    bookingConfirmation,
    authToast,
    onCloseModal: () => setSelectedPropertyModal(null),
    onCloseAiMatchmaker: () => setIsAiMatchmakerOpen(false),
    onCloseCompare: () => setIsCompareOpen(false),
    onCloseWishlist: () => setIsWishlistOpen(false),
    onCloseAuthModal: () => setIsAuthModalOpen(false),
    onBookVisit: (prop) => setBookingConfirmation(prop),
    onCloseBookingConfirmation: () => setBookingConfirmation(null),
    handleLoginSuccess,
    isAuthLoading,
    handleLogout
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
