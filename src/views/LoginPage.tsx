'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Mail,
  Lock,
  User,
  Key,
  HelpCircle,
  ExternalLink,
  Check,
  Building,
  Home,
  Star,
  Wifi,
  VolumeX,
  Zap
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

  // Role tab: Tenant or Property Owner (inspired by reference design)
  const [activeTab, setActiveTab] = useState<'tenant' | 'owner'>('tenant');

  // Progressive flow: Step 1 (Identifier) -> Step 2 (Password)
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Input refs for auto-focusing on step transition
  const identifierInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Errors & Feedback states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [alertError, setAlertError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    isJustRegistered
      ? 'Account created successfully! Please log in.'
      : isPasswordReset
      ? 'Password reset successfully! Please log in with your new password.'
      : isLoggedOut
      ? 'You have been logged out successfully.'
      : null
  );
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Update prefilled email if provided via URL
  useEffect(() => {
    if (prefilledEmail) {
      setIdentifier(prev => prev || prefilledEmail);
    }
  }, [prefilledEmail]);

  // Auto focus input on step change
  useEffect(() => {
    if (step === 1) {
      identifierInputRef.current?.focus();
    } else if (step === 2) {
      passwordInputRef.current?.focus();
    }
  }, [step]);

  // Client-side validations
  const validateIdentifier = (): boolean => {
    const trimmedId = identifier.trim();
    if (!trimmedId) {
      setFieldErrors({ identifier: 'Email or phone number is required.' });
      return false;
    }
    const isEmail = trimmedId.includes('@') && trimmedId.includes('.');
    const digitsOnly = trimmedId.replace(/\D/g, '');
    const isPhone = digitsOnly.length >= 10 && digitsOnly.length <= 15;

    if (!isEmail && !isPhone) {
      setFieldErrors({ identifier: 'Please enter a valid email address or 10-digit phone number.' });
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const validatePassword = (): boolean => {
    if (!password) {
      setFieldErrors({ password: 'Password is required.' });
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleNextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validateIdentifier()) {
      setStep(2);
      setFieldErrors({});
      setAlertError(null);
    }
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

    if (step === 1) {
      handleNextStep();
      return;
    }

    if (!validatePassword()) {
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

      // Handle failed login
      if (!res.success || !res.data) {
        setIsSubmitting(false);

        if (res.status && res.status >= 500) {
          setAlertError('The server encountered an error processing your request. Please try again shortly.');
        } else if (res.code === 'ACCOUNT_INACTIVE') {
          setAlertError('Your account is inactive or suspended. Please contact ApnaStay support.');
        } else if (res.code === 'UNAUTHORIZED_ROLE') {
          setAlertError('This portal is restricted to Tenants and Property Owners.');
        } else {
          setAlertError(res.error || 'Invalid email/phone or password.');
        }
        return;
      }

      // Successful login
      const authenticatedUser = res.data;
      const isOwner = authenticatedUser.role === 'apnastay_owner' || authenticatedUser.role === 'owner';
      setSuccessMessage(
        isOwner
          ? 'Login successful! Redirecting to your owner dashboard...'
          : 'Login successful! Redirecting to verified stays...'
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
        setAlertError('Unable to connect to the authentication server. Please check your internet connection and try again.');
      } else {
        setAlertError(err?.message || 'An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-[#1A1A1A] flex flex-col selection:bg-[#E1224D]/15 selection:text-[#E1224D]">
      
      {/* ========================================================================= */}
      {/* TOP NAVIGATION BAR WITH BRAND LOGO, STEPPER TIMELINE & HELPFUL ACTION   */}
      {/* ========================================================================= */}
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo at Top-Left */}
          <Link href="/" className="inline-flex items-center gap-2.5 group transition-transform">
            <img
              src="/logo-icon.png"
              alt="ApnaStay Logo"
              className="h-9 w-auto group-hover:scale-105 transition-transform object-contain"
            />
            <span className="font-gotham-black text-xl tracking-tighter text-[#1A1A1A]">
              ApnaStay<span className="text-[#E1224D]">.</span>
            </span>
          </Link>

          {/* Stepper Timeline (Visible on md+ screens) */}
          <nav aria-label="Progress" className="hidden md:flex items-center">
            <ol className="flex items-center gap-4 sm:gap-6">
              
              {/* Step 1: Identifier / Welcome */}
              <li className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                    step >= 1
                      ? 'bg-[#E1224D] text-white ring-4 ring-[#E1224D]/15'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step > 1 ? <Check className="w-4 h-4 stroke-[2.5]" /> : '1'}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-semibold ${
                      step >= 1 ? 'text-[#1A1A1A]' : 'text-gray-400'
                    }`}
                  >
                    Welcome
                  </span>
                  <span className="text-[10px] text-gray-400">Account ID</span>
                </div>
              </li>

              {/* Connecting Line 1 -> 2 */}
              <div
                className={`w-10 sm:w-16 h-0.5 transition-colors duration-300 ${
                  step >= 2 ? 'bg-[#E1224D]' : 'bg-gray-200'
                }`}
              />

              {/* Step 2: Password / Security */}
              <li className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                    step === 2
                      ? 'bg-[#E1224D] text-white ring-4 ring-[#E1224D]/15'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  2
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-semibold ${
                      step === 2 ? 'text-[#1A1A1A]' : 'text-gray-400'
                    }`}
                  >
                    Security
                  </span>
                  <span className="text-[10px] text-gray-400">Password</span>
                </div>
              </li>

              {/* Connecting Line 2 -> 3 */}
              <div className="w-10 sm:w-16 h-0.5 bg-gray-200" />

              {/* Step 3: Verified Access */}
              <li className="flex items-center gap-2.5 opacity-60">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-400">Access</span>
                  <span className="text-[10px] text-gray-400">Verified Stay</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Top-Right Action Link */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-gray-500">Need an account?</span>
            <Link
              href="/register"
              className="text-xs sm:text-sm font-semibold text-[#E1224D] hover:text-[#C71B42] hover:bg-rose-50/60 px-3.5 py-1.5 rounded-full border border-rose-100 transition-all cursor-pointer"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN OPEN LAYOUT: SPLIT SCREEN (NO BOXED CARD WRAPPER)                    */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* --------------------------------------------------------------------- */}
          {/* LEFT COLUMN: CLEAN, SPACIOUS FORM AREA                                */}
          {/* --------------------------------------------------------------------- */}
          <section className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center pt-2 sm:pt-4">
            
            {/* ROLE TABS (Inspired by "Participant | Support worker") */}
            <div className="flex items-center gap-8 border-b border-gray-200 mb-8">
              <button
                type="button"
                onClick={() => setActiveTab('tenant')}
                className={`pb-3 text-sm sm:text-base font-semibold transition-all relative cursor-pointer ${
                  activeTab === 'tenant'
                    ? 'text-[#1A1A1A]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Tenant
                {activeTab === 'tenant' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E1224D] rounded-full" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('owner')}
                className={`pb-3 text-sm sm:text-base font-semibold transition-all relative cursor-pointer ${
                  activeTab === 'owner'
                    ? 'text-[#1A1A1A]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Property owner
                {activeTab === 'owner' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E1224D] rounded-full" />
                )}
              </button>
            </div>

            {/* HEADLINE & DESCRIPTIVE SUBTITLE */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 mb-3.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E1224D]" />
                <span className="text-xs font-bold tracking-wide uppercase text-[#E1224D]">
                  {step === 1 ? 'Step 1 of 2 · Identity' : 'Step 2 of 2 · Security'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1A1A1A] leading-tight">
                Let&apos;s get started
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-2.5 leading-relaxed">
                {activeTab === 'tenant'
                  ? 'Access verified stays, schedule self-tours, unlock keyless NFC entry, and manage zero-brokerage rentals.'
                  : 'Manage your verified properties, view live tenant inquiries, monitor visits, and track rental payouts.'}
              </p>
            </div>

            {/* STEP 2 USER IDENTIFIER BADGE */}
            {step === 2 && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs sm:text-sm mb-6 animate-fade-in">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#E1224D] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-semibold tracking-wider text-rose-800">
                      Signing in as
                    </div>
                    <span className="font-bold text-[#1A1A1A] truncate block">{identifier}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setAlertError(null);
                    setFieldErrors({});
                  }}
                  className="text-[#E1224D] hover:text-[#C71B42] font-bold text-xs hover:underline shrink-0 ml-3 cursor-pointer"
                >
                  Change
                </button>
              </div>
            )}

            {/* ALERT NOTIFICATIONS */}
            {alertError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-sm text-rose-700 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{alertError}</div>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-sm text-emerald-800 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="flex-1 font-medium">{successMessage}</div>
              </div>
            )}

            {/* PROGRESSIVE FORM: SHOWS EXACTLY ONE FIELD AT A TIME */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 ? (
                /* STEP 1: ONLY EMAIL OR PHONE INPUT */
                <div className="animate-fade-in space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Email or Phone number <span className="text-[#E1224D]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={identifierInputRef}
                        type="text"
                        autoComplete="username"
                        placeholder="name@example.com or 10-digit phone"
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          handleInputChange('identifier');
                        }}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border text-sm text-[#1D1D1F] placeholder-gray-400 outline-none transition-all font-medium shadow-sm ${
                          fieldErrors.identifier
                            ? 'border-rose-400 bg-rose-50/10 focus:border-[#E1224D]'
                            : 'border-gray-300 focus:border-[#E1224D] focus:ring-4 focus:ring-[#E1224D]/15'
                        }`}
                      />
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {fieldErrors.identifier && (
                      <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {fieldErrors.identifier}
                      </p>
                    )}
                  </div>

                  {/* PRIMARY NEXT BUTTON */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-[#E1224D] hover:bg-[#C71B42] text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#E1224D]/25 active:scale-[0.99] cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* STEP 2: ONLY PASSWORD INPUT */
                <div className="animate-fade-in space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Password <span className="text-[#E1224D]">*</span>
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
                        ref={passwordInputRef}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          handleInputChange('password');
                        }}
                        className={`w-full pl-11 pr-11 py-3.5 rounded-xl bg-white border text-sm text-[#1D1D1F] placeholder-gray-400 outline-none transition-all font-medium shadow-sm ${
                          fieldErrors.password
                            ? 'border-rose-400 bg-rose-50/10 focus:border-[#E1224D]'
                            : 'border-gray-300 focus:border-[#E1224D] focus:ring-4 focus:ring-[#E1224D]/15'
                        }`}
                      />
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  {/* SHOW PASSWORD CHECKBOX (Matching reference design) */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      id="show-password-checkbox"
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#E1224D] focus:ring-[#E1224D]/25 cursor-pointer"
                    />
                    <label
                      htmlFor="show-password-checkbox"
                      className="text-xs sm:text-sm text-gray-600 select-none cursor-pointer"
                    >
                      Show password
                    </label>
                  </div>

                  {/* PRIMARY LOGIN BUTTON */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#E1224D] hover:bg-[#C71B42] text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#E1224D]/25 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Next</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* BACK BUTTON */}
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setAlertError(null);
                      setFieldErrors({});
                    }}
                    className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to previous step</span>
                  </button>
                </div>
              )}
            </form>

            {/* TRUST & ENCRYPTION GUARANTEE */}
            <div className="mt-8 pt-6 border-t border-gray-200/80 flex items-center gap-3 text-xs text-gray-500">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                256-bit bank-grade encryption · 100% verified zero-brokerage properties across India.
              </span>
            </div>

            {/* CREATE ACCOUNT LINK */}
            <div className="mt-6 text-sm text-gray-600">
              Don&apos;t have an account yet?{' '}
              <Link
                href="/register"
                className="text-[#E1224D] font-bold hover:underline transition-all"
              >
                Create an account
              </Link>
            </div>
          </section>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: RICH VISUAL SHOWCASE (Inspired by akin.home preview)   */}
          {/* --------------------------------------------------------------------- */}
          <section className="hidden lg:block lg:col-span-6 xl:col-span-7">
            <div className="relative rounded-3xl bg-gradient-to-br from-rose-50/60 via-[#FDFDFD] to-amber-50/30 border border-rose-100/70 p-8 xl:p-10 shadow-apple-sm overflow-hidden min-h-[580px] flex flex-col justify-between">
              
              {/* Background Glow Blobs */}
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

              {/* FLOATING CARD 1: SMART NFC ACCESS PASS (Inspired by the top floating MEALS card) */}
              <div className="absolute top-6 right-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-apple-xl border border-rose-100/80 max-w-[280px] transition-all hover:scale-[1.02]">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-1.5 text-gray-700">
                    <Key className="w-3.5 h-3.5 text-[#E1224D]" />
                    SMART NFC KEY
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=200&q=80"
                    alt="Suite preview"
                    className="w-12 h-12 rounded-xl object-cover shadow-sm shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#1A1A1A] truncate">
                      The Glass Panorama
                    </h4>
                    <p className="text-[11px] text-gray-500">Suite 604 · Cyber Hub</p>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Monday, 24 Feb</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    LIVE UNLOCKED
                  </span>
                </div>
              </div>

              {/* CENTER DISPLAY: LUXURY ROOM & ZERO-BROKERAGE SUITE PREVIEW */}
              <div className="relative z-10 my-auto pt-10 pb-6">
                <div className="bg-white rounded-3xl p-5 shadow-apple-lg border border-gray-200/70 max-w-md mx-auto">
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-4 group">
                    <img
                      src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
                      alt="Verified Stay in Indore"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#1A1A1A]/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      4.96 (42 reviews)
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Rent with Zero Brokerage
                        </div>
                        <div className="text-sm font-extrabold text-[#1A1A1A]">
                          ₹16,500 <span className="text-xs font-normal text-gray-500">/ month</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-[#E1224D] text-xs font-bold border border-rose-100">
                        ₹0 Brokerage
                      </span>
                    </div>
                  </div>

                  {/* Highlights row */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-gray-600">
                    <div className="p-2 rounded-xl bg-gray-50 flex items-center justify-center gap-1">
                      <Wifi className="w-3.5 h-3.5 text-[#E1224D]" />
                      <span>300 Mbps</span>
                    </div>
                    <div className="p-2 rounded-xl bg-gray-50 flex items-center justify-center gap-1">
                      <VolumeX className="w-3.5 h-3.5 text-[#E1224D]" />
                      <span>Soundproof</span>
                    </div>
                    <div className="p-2 rounded-xl bg-gray-50 flex items-center justify-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-[#E1224D]" />
                      <span>100% Backup</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FLOATING CARD 2: AI CONCIERGE CHAT PILL (Inspired by "Hey pixi what's for lunch?") */}
              <div className="relative z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-rose-100/80 shadow-apple-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E1224D] to-orange-400 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    ✨
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1A1A1A]">
                      &ldquo;Hey ApnaStay, show me verified private suites near IT Park&rdquo;
                    </div>
                    <div className="text-[11px] text-gray-500">
                      12 zero-brokerage stays available for instant self-tour
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-rose-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-rose-800">
                      AS
                    </div>
                    <div className="w-6 h-6 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-amber-800">
                      RK
                    </div>
                    <div className="w-6 h-6 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-emerald-800">
                      PS
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-gray-700">50,000+ happy tenants</span>
                </div>
              </div>

            </div>
          </section>

        </div>
      </main>

      {/* ========================================================================= */}
      {/* FORGOT PASSWORD MODAL                                                     */}
      {/* ========================================================================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-apple-lg border border-[#EDEDED] p-6 text-center animate-slide-up">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-[#E1224D] flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F]">Reset Your Password</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              For security, password resets are processed securely by our support concierge.
              Please reach out with your registered email or phone:
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
