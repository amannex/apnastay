'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
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

  // Client-side validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const trimmedId = identifier.trim();

    if (!trimmedId) {
      errors.identifier = 'Email or phone number is required.';
    } else {
      const isEmail = trimmedId.includes('@') && trimmedId.includes('.');
      const digitsOnly = trimmedId.replace(/\D/g, '');
      const isPhone = digitsOnly.length >= 10 && digitsOnly.length <= 15;

      if (!isEmail && !isPhone) {
        errors.identifier = 'Please enter a valid email address or 10-digit phone number.';
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
    setAlertError(null);
    setSuccessMessage(null);

    // Validation error handling
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login({
        identifier: identifier.trim(),
        password
      });

      // Handle failed login
      if (!res.success || !res.data) {
        setIsSubmitting(false);

        // Server error vs Invalid credentials vs Inactive account
        if (res.status && res.status >= 500) {
          setAlertError('The server encountered an error processing your request. Please try again shortly.');
        } else if (res.code === 'ACCOUNT_INACTIVE') {
          setAlertError('Your account is inactive or suspended. Please contact ApnaStay support.');
        } else if (res.code === 'UNAUTHORIZED_ROLE') {
          setAlertError('This portal is restricted to Tenants and Property Owners.');
        } else {
          // Safe generic message — never leaks whether email/phone exists or password was wrong
          setAlertError(res.error || 'Invalid email/phone or password.');
        }
        return;
      }

      // Successful login: User state is already stored centrally in AuthContext
      const authenticatedUser = res.data;
      const isOwner = authenticatedUser.role === 'apnastay_owner' || authenticatedUser.role === 'owner';
      setSuccessMessage(
        isOwner
          ? 'Login successful! Redirecting to your owner dashboard...'
          : 'Login successful! Redirecting to properties...'
      );

      // Update AppContext and route based on backend role
      if (handleLoginSuccess) {
        handleLoginSuccess(authenticatedUser, redirectParam, router);
      } else {
        setTimeout(() => {
          handleRoleRedirect(authenticatedUser, redirectParam, router);
        }, 500);
      }
    } catch (err: any) {
      // Network error handling
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
    <main className="min-h-screen bg-gradient-to-b from-[#F5F5F7] via-white to-[#F5F5F7] flex flex-col items-center justify-center pt-20 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-apple-lg border border-[#EDEDED] p-8 sm:p-10 transition-all my-auto">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D1D1F]/5 border border-[#1D1D1F]/10 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#1D1D1F]" />
            <span className="text-xs font-semibold tracking-wide uppercase text-[#1D1D1F]">
              Welcome Back
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
            Log in to ApnaStay
          </h1>
          <p className="text-sm text-[#86868B] mt-2">
            Sign in to access your verified rentals, agreements, and tours.
          </p>
        </div>

        {/* TOP ALERT: ERROR OR SUCCESS */}
        {alertError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{alertError}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-sm text-emerald-800 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL OR PHONE INPUT */}
          <div>
            <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1.5">
              Email or phone number
            </label>
            <div className="relative">
              <input
                type="text"
                autoComplete="username"
                placeholder="name@example.com or 10-digit phone"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  handleInputChange('identifier');
                }}
                className={`w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium ${
                  fieldErrors.identifier
                    ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                    : 'border-transparent focus:border-[#1D1D1F] focus:bg-white'
                }`}
              />
            </div>
            {fieldErrors.identifier && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.identifier}</p>
            )}
          </div>

          {/* PASSWORD INPUT */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#86868B] hover:text-[#1D1D1F] font-medium transition-colors cursor-pointer"
              >
                Forgot password?
              </Link>
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
                className={`w-full pl-4 pr-11 py-3 rounded-xl bg-[#F5F5F7] border text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium ${
                  fieldErrors.password
                    ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                    : 'border-transparent focus:border-[#1D1D1F] focus:bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          {/* LOGIN SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* SECURITY PROMISE FOOTER */}
        <div className="mt-6 pt-6 border-t border-[#EDEDED] flex items-center justify-center gap-2 text-xs text-[#86868B]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected by 256-bit encryption & HttpOnly secure cookies.</span>
        </div>

        {/* LINK TO CREATE ACCOUNT */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#86868B]">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-[#1D1D1F] font-bold hover:underline transition-all"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-apple-lg border border-[#EDEDED] p-6 text-center animate-slide-up">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-[#E1224D] flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F]">Reset Your Password</h3>
            <p className="text-xs text-[#86868B] mt-2 leading-relaxed">
              For security, password resets are processed securely by our support team.
              Please reach out with your registered email or phone:
            </p>
            <div className="my-4 p-3 rounded-xl bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F]">
              support@apnastay.in
            </div>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#1D1D1F] text-white text-xs font-bold hover:bg-black transition-all cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
