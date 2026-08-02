'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { loginUser, registerUser } from '../api';
import { setCachedSession } from '../../../lib/auth/session';
import type { AccountType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'owner' | 'admin'>('tenant');
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const roles = [
    { id: 'tenant' as const, label: 'Renter', title: 'Tenant / Renter' },
    { id: 'owner' as const, label: 'Landlord', title: 'Property Owner' },
    { id: 'admin' as const, label: 'Engineer', title: 'Field Engineer' }
  ];

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e?.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const email = emailOrPhone.trim() || 'aman@ownstay.in';
    const userName = name.trim() || 'Aman Saifi';
    const userPass = password || 'ownstay123';

    try {
      if (isRegister) {
        // Prevent registration of administrator account type
        const accountType: AccountType = selectedRole === 'owner' ? 'owner' : 'tenant';
        const res = await registerUser({
          name: userName,
          email,
          password: userPass,
          account_type: accountType
        });

        if (!res.success || !res.data) {
          setErrorMessage(res.error || 'Registration failed. Please try again.');
          setIsSubmitting(false);
          return;
        }

        setCachedSession(res.data);
        onLoginSuccess(res.data);
      } else {
        const res = await loginUser({
          email,
          password: userPass
        });

        if (!res.success || !res.data) {
          setErrorMessage(res.error || 'Invalid credentials. Please verify your email and password.');
          setIsSubmitting(false);
          return;
        }

        setCachedSession(res.data);
        onLoginSuccess(res.data);
      }

      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      console.error('[OwnStay AuthModal] Auth error:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    setIsSubmitting(true);
    const roleObj = roles.find((r) => r.id === selectedRole);

    setTimeout(() => {
      const mockUser = {
        id: 24,
        name: `Aman (${provider})`,
        email: `aman.${provider.toLowerCase()}@ownstay.in`,
        role: selectedRole === 'owner' ? 'ownstay_owner' : 'ownstay_tenant',
        roleTitle: roleObj?.title || 'Tenant / Renter',
        avatar: 'A',
        capabilities: [
          'read',
          'ownstay_manage_wishlist',
          'ownstay_book_visit',
          'ownstay_request_booking',
          'ownstay_make_payment'
        ],
        verification_status: 'VERIFIED' as const,
        profile: {
          avatar: null,
          phone: null,
          first_name: 'Aman',
          last_name: `(${provider})`,
          verification_status: 'VERIFIED' as const
        }
      };
      setCachedSession(mockUser);
      onLoginSuccess(mockUser);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[400px] bg-white rounded-3xl shadow-apple-lg border border-[#EDEDED] overflow-hidden p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR: CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F5F5F7] hover:bg-[#EAEAEA] text-[#1D1D1F] flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* MODAL TITLE */}
        <div className="mb-5">
          <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
            {isRegister ? 'Create an account' : 'Log in or sign up'}
          </h2>
          <p className="text-xs text-[#86868B] mt-1">
            {isRegister
              ? 'Join India’s zero-brokerage housing network.'
              : 'Welcome back. Select your role to continue.'}
          </p>
        </div>

        {/* ERROR MESSAGE ALERT */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* APPLE-STYLE SEGMENTED ROLE SWITCHER */}
        <div className="grid grid-cols-3 p-1 rounded-xl bg-[#F5F5F7] mb-5">
          {roles.map((r) => {
            const active = selectedRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id)}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  active
                    ? 'bg-white text-[#1D1D1F] shadow-sm font-bold'
                    : 'text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* FORM FIELDS */}
        <form onSubmit={handleAuthSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Aman Saifi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F5F7] border border-transparent focus:border-[#1D1D1F] focus:bg-white text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
              Email or Phone
            </label>
            <input
              type="text"
              placeholder="aman@ownstay.in"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F5F5F7] border border-transparent focus:border-[#1D1D1F] focus:bg-white text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F5F5F7] border border-transparent focus:border-[#1D1D1F] focus:bg-white text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isRegister ? 'Creating account...' : 'Logging in...'}</span>
              </>
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* TOGGLE LOGIN / REGISTER */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage(null);
            }}
            className="text-xs text-[#86868B] hover:text-[#1D1D1F] font-medium transition-colors"
          >
            {isRegister
              ? 'Already have an account? Log in'
              : 'Don’t have an account? Sign up'}
          </button>
        </div>

        {/* SEPARATOR */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-[1px] flex-1 bg-[#EDEDED]" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">
            OR
          </span>
          <div className="h-[1px] flex-1 bg-[#EDEDED]" />
        </div>

        {/* OAUTH BUTTONS */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleOAuthLogin('Google')}
            className="w-full py-2.5 px-3 rounded-xl bg-[#F5F5F7] hover:bg-[#EAEAEA] text-xs font-semibold text-[#1D1D1F] flex items-center justify-center gap-2 transition-colors"
          >
            <span className="text-sm font-bold text-red-500">G</span>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuthLogin('Apple')}
            className="w-full py-2.5 px-3 rounded-xl bg-[#F5F5F7] hover:bg-[#EAEAEA] text-xs font-semibold text-[#1D1D1F] flex items-center justify-center gap-2 transition-colors"
          >
            <span className="text-sm font-bold"></span>
            <span>Apple</span>
          </button>
        </div>
      </div>
    </div>
  );
}
