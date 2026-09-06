'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  HelpCircle
} from 'lucide-react';
import { handleRoleRedirect } from '../lib/auth/session';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get('redirect');
  const isJustRegistered = searchParams?.get('registered') === '1';
  const isPasswordReset = searchParams?.get('reset') === 'success';
  const isLoggedOut = searchParams?.get('logged_out') === '1';
  const prefilledEmail = searchParams?.get('email') || '';

  const { handleLoginSuccess } = useApp();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Errors & Feedback states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [alertError, setAlertError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    isJustRegistered
      ? 'Account created successfully! Please log in.'
      : isPasswordReset
      ? 'Password reset successfully! Please log in.'
      : isLoggedOut
      ? 'You have been logged out.'
      : null
  );
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    if (prefilledEmail) {
      setIdentifier(prev => prev || prefilledEmail);
    }
  }, [prefilledEmail]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    const trimmedId = identifier.trim();

    if (!trimmedId) {
      errors.identifier = 'Email or phone number is required.';
    } else {
      const isEmail = trimmedId.includes('@') && trimmedId.includes('.');
      const digitsOnly = trimmedId.replace(/\D/g, '');
      const isPhone = digitsOnly.length >= 10 && digitsOnly.length <= 15;
      if (!isEmail && !isPhone) {
        errors.identifier = 'Enter a valid email or 10-digit phone.';
      }
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (alertError) {
      setAlertError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setAlertError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await login({
        identifier: identifier.trim(),
        password
      });

      if (!res.success || !res.data) {
        setIsSubmitting(false);

        if (res.status && res.status >= 500) {
          setAlertError('Server error. Please try again shortly.');
        } else if (res.code === 'ACCOUNT_INACTIVE') {
          setAlertError('Account inactive. Please contact support.');
        } else if (res.code === 'UNAUTHORIZED_ROLE') {
          setAlertError('Portal restricted to Tenants and Property Owners.');
        } else {
          setAlertError(res.error || 'Invalid email/phone or password.');
        }
        return;
      }

      const authenticatedUser = res.data;
      const isOwner = authenticatedUser.role === 'apnastay_owner' || authenticatedUser.role === 'owner';
      setSuccessMessage(
        isOwner
          ? 'Login successful! Redirecting to dashboard...'
          : 'Login successful! Redirecting...'
      );

      if (handleLoginSuccess) {
        handleLoginSuccess(authenticatedUser, redirectParam, router);
      } else {
        setTimeout(() => {
          handleRoleRedirect(authenticatedUser, redirectParam, router);
        }, 500);
      }
    } catch (err: any) {
      console.error('[ApnaStay LoginPage] Login error:', err);
      setIsSubmitting(false);

      if (!navigator.onLine || err?.message?.includes('fetch') || err?.message?.includes('NetworkError')) {
        setAlertError('Unable to connect. Check your internet connection.');
      } else {
        setAlertError(err?.message || 'An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col lg:flex-row selection:bg-[#E1224D]/15 selection:text-[#E1224D]">
      
      {/* ========================================================================= */}
      {/* LEFT 60%: CONTENT CENTER-ALIGNED WITH LOGO ON TOP-LEFT                   */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[60%] min-h-screen relative flex items-center justify-center p-6 sm:p-10 z-10">
        
        {/* Top-Left: Logo */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-10 lg:top-10 lg:left-12 z-20">
          <Link href="/" className="inline-flex items-center gap-2.5 group w-fit transition-transform">
            <img
              src="/logo-icon.png"
              alt="ApnaStay Logo"
              className="h-9 w-auto group-hover:scale-105 transition-transform object-contain"
            />
            <span className="font-gotham-black text-2xl tracking-tighter text-[#1A1A1A]">
              ApnaStay<span className="text-[#E1224D]">.</span>
            </span>
          </Link>
        </div>

        {/* Center: Simple Minimal Form (Center-Aligned in 60% Screen) */}
        <div className="w-full max-w-sm mx-auto py-12">
          
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
            Sign in
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Welcome back! Please enter your details.
          </p>

          {/* Alert Notifications */}
          {alertError && (
            <div className="my-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{alertError}</div>
            </div>
          )}

          {successMessage && (
            <div className="my-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Single-Page Simple Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email or Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email or phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  autoComplete="username"
                  placeholder="Enter your email or phone"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    handleInputChange('identifier');
                  }}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50/80 hover:bg-gray-50 focus:bg-white border text-sm text-[#1D1D1F] placeholder-gray-400 outline-none transition-all font-medium ${
                    fieldErrors.identifier
                      ? 'border-rose-400 bg-rose-50/20 focus:border-[#E1224D]'
                      : 'border-gray-200 focus:border-[#E1224D] focus:ring-4 focus:ring-[#E1224D]/15'
                  }`}
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {fieldErrors.identifier && (
                <p className="text-xs text-rose-600 mt-1 font-medium">
                  {fieldErrors.identifier}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-[#E1224D] hover:text-[#C71B42] font-semibold transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    handleInputChange('password');
                  }}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50/80 hover:bg-gray-50 focus:bg-white border text-sm text-[#1D1D1F] placeholder-gray-400 outline-none transition-all font-medium ${
                    fieldErrors.password
                      ? 'border-rose-400 bg-rose-50/20 focus:border-[#E1224D]'
                      : 'border-gray-200 focus:border-[#E1224D] focus:ring-4 focus:ring-[#E1224D]/15'
                  }`}
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-rose-600 mt-1 font-medium">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl bg-[#E1224D] hover:bg-[#C71B42] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#E1224D]/25 active:scale-[0.99] disabled:opacity-70 cursor-pointer pt-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Account Creation Link */}
          <p className="text-sm text-gray-500 mt-6 text-center lg:text-left">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-[#E1224D] font-bold hover:underline transition-all"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Bottom-Left: Copyright */}
        <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-10 lg:bottom-10 lg:left-12 text-xs text-gray-400">
          © ApnaStay
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT 40%: FULL-BLEED BACKGROUND (DIRECTLY ON BG, NO CARD FRAMING)       */}
      {/* ========================================================================= */}
      <div className="hidden lg:block lg:w-[40%] min-h-screen relative overflow-hidden bg-[#F5F2ED]">
        <img
          src="/auth-vector-art.jpg"
          alt="Person entering modern room illustration"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* FORGOT PASSWORD MODAL                                                     */}
      {/* ========================================================================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-apple-xl border border-gray-100 p-6 text-center animate-slide-up">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-[#E1224D] flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F]">Reset Password</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Please contact our support concierge with your registered email or phone:
            </p>
            <div className="my-4 p-3 rounded-xl bg-gray-50 text-xs font-semibold text-[#1D1D1F] border border-gray-200">
              support@apnastay.in
            </div>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#E1224D] hover:bg-[#C71B42] text-white text-xs font-bold transition-all cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
