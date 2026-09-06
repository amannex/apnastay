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
  Check,
  Fingerprint
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
    <div className="relative min-h-screen bg-[#FAFAFC] text-[#1A1A1A] flex flex-col justify-center overflow-hidden selection:bg-[#E1224D]/15 selection:text-[#E1224D]">
      
      {/* ========================================================================= */}
      {/* AMBIENT GLOWING ORBS FOR GLASSMORPHISM ILLUMINATION                       */}
      {/* ========================================================================= */}
      <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-[#E1224D]/15 via-rose-200/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-amber-200/20 via-rose-100/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] right-[35%] w-[320px] h-[320px] rounded-full bg-gradient-to-r from-pink-200/15 to-purple-200/10 blur-3xl pointer-events-none" />

      {/* TOP-RIGHT HELPER ACTION */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20 flex items-center gap-2 text-xs sm:text-sm">
        <span className="text-gray-500 hidden sm:inline">Don&apos;t have an account?</span>
        <Link
          href="/register"
          className="font-bold text-[#E1224D] hover:text-[#C71B42] backdrop-blur-md bg-white/70 hover:bg-white/90 px-4 py-2 rounded-full border border-white/80 shadow-sm transition-all cursor-pointer"
        >
          Create account
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* MAIN OPEN SPLIT-SCREEN LAYOUT WITH GLASSMORPHIC PANELS                    */}
      {/* ========================================================================= */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* --------------------------------------------------------------------- */}
          {/* LEFT COLUMN: SLEEK GLASSMORPHIC FORM PANEL (UNIFIED LOGIN)             */}
          {/* --------------------------------------------------------------------- */}
          <section className="lg:col-span-6 xl:col-span-5">
            <div className="relative rounded-3xl backdrop-blur-2xl bg-white/75 border border-white/80 shadow-[0_20px_60px_-15px_rgba(225,34,77,0.06),0_0_1px_1px_rgba(255,255,255,0.9)] p-8 sm:p-10 lg:p-12 transition-all">
              
              {/* STEP STATUS PILL */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50/80 border border-rose-100 mb-6 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#E1224D]" />
                <span className="text-xs font-bold tracking-wider uppercase text-[#E1224D]">
                  {step === 1 ? 'Step 1 · Identity' : 'Step 2 · Security'}
                </span>
              </div>

              {/* CLEAN TYPOGRAPHIC HEADER */}
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1A1A1A] leading-tight">
                Welcome back
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-2.5 leading-relaxed">
                Enter your details to access your verified bookings, smart keyless pass, and dashboard.
              </p>

              {/* STEP 2 USER IDENTIFIER PILL */}
              {step === 2 && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/80 border border-rose-100 shadow-sm text-xs sm:text-sm my-6 animate-fade-in backdrop-blur-md">
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
                <div className="my-6 p-4 rounded-2xl bg-rose-50/90 border border-rose-200 flex items-start gap-3 text-sm text-rose-700 animate-fade-in backdrop-blur-sm">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">{alertError}</div>
                </div>
              )}

              {successMessage && (
                <div className="my-6 p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex items-center gap-3 text-sm text-emerald-800 animate-fade-in backdrop-blur-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="flex-1 font-medium">{successMessage}</div>
                </div>
              )}

              {/* PROGRESSIVE FORM: SHOWS EXACTLY ONE FIELD AT A TIME */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                          className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/70 backdrop-blur-md border text-sm text-[#1D1D1F] placeholder-gray-400 outline-none transition-all font-medium shadow-sm ${
                            fieldErrors.identifier
                              ? 'border-rose-400 bg-rose-50/20 focus:border-[#E1224D]'
                              : 'border-gray-200 focus:border-[#E1224D] focus:ring-4 focus:ring-[#E1224D]/15 focus:bg-white'
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
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#E1224D] hover:bg-[#C71B42] text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E1224D]/25 active:scale-[0.99] cursor-pointer"
                    >
                      <span>Continue</span>
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
                          className={`w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white/70 backdrop-blur-md border text-sm text-[#1D1D1F] placeholder-gray-400 outline-none transition-all font-medium shadow-sm ${
                            fieldErrors.password
                              ? 'border-rose-400 bg-rose-50/20 focus:border-[#E1224D]'
                              : 'border-gray-200 focus:border-[#E1224D] focus:ring-4 focus:ring-[#E1224D]/15 focus:bg-white'
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

                    {/* SHOW PASSWORD CHECKBOX */}
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

                    {/* PRIMARY SIGN IN BUTTON */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#E1224D] hover:bg-[#C71B42] text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E1224D]/25 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign in</span>
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

              {/* SECURITY ASSURANCE */}
              <div className="mt-8 pt-6 border-t border-gray-200/60 flex items-center gap-3 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>256-bit bank-grade encryption · 100% verified zero-brokerage living.</span>
              </div>
            </div>
          </section>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: VECTOR ART VISUAL SHOWCASE WITH GLASSMORPHISM           */}
          {/* --------------------------------------------------------------------- */}
          <section className="hidden lg:block lg:col-span-6 xl:col-span-7">
            <div className="relative rounded-3xl backdrop-blur-2xl bg-white/60 border border-white/80 p-8 xl:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05),0_0_1px_1px_rgba(255,255,255,0.8)] overflow-hidden min-h-[580px] flex flex-col items-center justify-between">
              
              {/* Subtle ambient light gradient within container */}
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#E1224D]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

              {/* FLOATING GLASS CHIP 1: ENCRYPTION / SECURITY */}
              <div className="self-start relative z-20 backdrop-blur-xl bg-white/85 border border-white/90 shadow-apple-lg px-4 py-2.5 rounded-2xl flex items-center gap-2.5 transition-transform hover:scale-105">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <ShieldCheck className="w-4 h-4 text-[#E1224D]" />
                <span className="text-xs font-bold text-gray-800">
                  Bank-Grade Encryption · 256-Bit
                </span>
              </div>

              {/* CENTER DISPLAY: 3D ISOMETRIC VECTOR ART ILLUSTRATION */}
              <div className="relative z-10 my-auto py-6 flex flex-col items-center">
                <div className="relative w-72 h-72 xl:w-84 xl:h-84 group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#E1224D]/10 to-amber-200/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                  <img
                    src="/auth-vector-art.jpg"
                    alt="Digital Security & Smart Keyless Vector Art"
                    className="relative w-full h-full object-contain rounded-3xl drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>

                <div className="mt-6 text-center max-w-sm">
                  <h3 className="text-lg font-bold text-[#1A1A1A]">
                    Keyless Smart Living
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Zero brokerage, instant NFC door access, and verified stays across India.
                  </p>
                </div>
              </div>

              {/* FLOATING GLASS CHIP 2: BIOMETRIC NFC PASS */}
              <div className="self-end relative z-20 backdrop-blur-xl bg-white/85 border border-white/90 shadow-apple-lg px-4 py-3 rounded-2xl flex items-center gap-3 transition-transform hover:scale-105">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E1224D]">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">
                    Smart NFC Authentication
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Instant verified digital check-in
                  </div>
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm backdrop-blur-2xl bg-white/90 rounded-3xl shadow-apple-xl border border-white/80 p-6 text-center animate-slide-up">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-[#E1224D] flex items-center justify-center mx-auto mb-4 border border-rose-100">
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
              className="w-full py-2.5 rounded-xl bg-[#E1224D] hover:bg-[#C71B42] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#E1224D]/20"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
