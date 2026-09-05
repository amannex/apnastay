'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { UserProfile, LoginPayload, RegisterPayload, AuthResponse } from '../features/auth/types';
import { getCurrentUser, loginUser, registerUser } from '../features/auth/api';
import { clearClientSession, setCachedSession, fetchSession, getSessionRole } from '../lib/auth/session';

export interface AuthContextType {
  user: UserProfile | null;
  authenticated: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse<UserProfile>>;
  register: (payload: RegisterPayload) => Promise<AuthResponse<UserProfile>>;
  logout: () => Promise<void>;
  refreshUser: (force?: boolean) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Derive authenticated state strictly from active user profile
  const authenticated = Boolean(user && user.id);

  /**
   * Authoritative user refresh: queries /auth/me endpoint.
   * Handles valid sessions as well as expired/invalid tokens.
   */
  const refreshUser = useCallback(async (force: boolean = true): Promise<UserProfile | null> => {
    try {
      const profile = await fetchSession(force);
      if (profile && profile.id) {
        setUser(profile);
        setCachedSession(profile);
        return profile;
      } else {
        // Expired or invalid session (or user deleted from DB)
        setUser(null);
        setCachedSession(null);
        await clearClientSession();
        return null;
      }
    } catch (error) {
      console.error('[ApnaStay AuthContext] Error refreshing user:', error);
      setUser(null);
      setCachedSession(null);
      await clearClientSession();
      return null;
    }
  }, []);

  /**
   * Application initialization:
   * 1. Determine whether the user is authenticated via /auth/me
   * 2. Store the current user
   * 3. Handle loading state
   * 4. Handle expired/invalid authentication
   */
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const profile = await fetchSession(true);
        if (isMounted) {
          if (profile && profile.id) {
            setUser(profile);
            setCachedSession(profile);
          } else {
            setUser(null);
            setCachedSession(null);
            await clearClientSession();
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[ApnaStay AuthContext] Initialization check failed:', err);
          setUser(null);
          setCachedSession(null);
          await clearClientSession();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Centrally handle user login:
   * Calls WordPress login API, sets state, updates session cache.
   */
  const login = useCallback(async (payload: LoginPayload): Promise<AuthResponse<UserProfile>> => {
    try {
      const res = await loginUser(payload);
      if (res.success && res.data) {
        setUser(res.data);
        setCachedSession(res.data);
      }
      return res;
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Login failed.'
      };
    }
  }, []);

  /**
   * Centrally handle user registration:
   * Calls WordPress register API, establishes session state if auto-authenticated.
   */
  const register = useCallback(async (payload: RegisterPayload): Promise<AuthResponse<UserProfile>> => {
    try {
      const res = await registerUser(payload);
      if (res.success && res.data) {
        setUser(res.data);
        setCachedSession(res.data);
      }
      return res;
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Registration failed.'
      };
    }
  }, []);

  /**
   * Centrally handle user logout:
   * Terminates backend session, clears client cookies/cache, redirects if on protected routes.
   */
  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await clearClientSession();
    } catch (err) {
      console.warn('[ApnaStay AuthContext] Logout error:', err);
    } finally {
      setUser(null);
      setCachedSession(null);
      setLoading(false);

      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        const isProtected =
          pathname.startsWith('/dashboard') ||
          pathname.startsWith('/owner') ||
          pathname === '/favorites' ||
          pathname === '/my-visits' ||
          pathname === '/profile';

        if (isProtected) {
          window.location.href = '/login?logged_out=1';
        } else {
          window.location.reload();
        }
      }
    }
  }, []);

  const value: AuthContextType = {
    user,
    authenticated,
    loading,
    login,
    register,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
