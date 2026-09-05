'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { validateResetToken, resetPassword } from '@/features/auth/api';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const key = searchParams.get('key') || '';
  const login = searchParams.get('login') || searchParams.get('email') || '';

  // Validation & token state
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Form states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [alertError, setAlertError] = useState<string | null>(null);

  // Validate reset token on mount
  useEffect(() => {
    let active = true;

    async function checkToken() {
      if (!key || !login) {
        if (active) {
          setTokenValid(false);
          setTokenError('The password reset link is incomplete or missing required parameters.');
          setIsValidating(false);
        }
        return;
      }

      try {
        const res = await validateResetToken(key, login);
        if (active) {
          setTokenValid(res.valid);
          if (!res.valid) {
            setTokenError(res.message || 'This password reset link is invalid or has expired.');
          }
          setIsValidating(false);
        }
      } catch (err) {
        if (active) {
          // Allow in case of offline dev mode
          setTokenValid(true);
          setIsValidating(false);
        }
      }
    }

    checkToken();

    return () => {
      active = false;
    };
  }, [key, login]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!password) {
      errors.password = 'New password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword({
        key,
        login,
        password,
        confirm_password: confirmPassword
      });

      if (!res.success) {
        setAlertError(res.error || 'Failed to reset password. The link may have expired.');
        if (res.code === 'INVALID_RESET_TOKEN' || res.status === 400) {
          setTokenValid(false);
          setTokenError(res.error || 'This reset link has expired or has already been used.');
        }
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setAlertError('Network connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
      <div className="w-full sm:max-w-md my-auto">
        {/* Brand Icon Header */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-[#1D1D1F] flex items-center justify-center shadow-apple-sm group-hover:scale-105 transition-transform overflow-hidden">
              <Image
                src="/icon.png"
                alt="ApnaStay Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1D1D1F]">
              Apna<span className="text-[#E1224D]">Stay</span>
            </span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-apple-sm border border-[#E5E5EA] transition-all">
          {isValidating ? (
            /* Loading token verification */
            <div className="py-12 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#1D1D1F] border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-sm text-[#86868B]">Verifying password reset link...</p>
            </div>
          ) : !tokenValid ? (
            /* Invalid or Expired Token State */
            <div className="text-center py-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
                Reset Link Expired
              </h2>
              <p className="text-sm text-[#86868B] mt-2 leading-relaxed">
                {tokenError || 'This password reset link is invalid, incomplete, or has already been used.'}
              </p>

              <div className="my-6 p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs text-[#86868B] text-left leading-relaxed space-y-1.5">
                <div className="font-semibold text-[#1D1D1F]">Security Note:</div>
                <p>For your account protection, password reset links expire after 24 hours and can only be used once.</p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/forgot-password"
                  className="w-full py-3.5 rounded-2xl bg-[#1D1D1F] text-white text-sm font-semibold hover:bg-black transition-all shadow-apple-sm flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Request New Reset Link</span>
                </Link>
                <Link
                  href="/login"
                  className="w-full py-3 rounded-2xl text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Log In</span>
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            /* Password Reset Success State */
            <div className="text-center py-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
                Password updated!
              </h2>
              <p className="text-sm text-[#86868B] mt-2 leading-relaxed">
                Your password has been successfully updated. You can now log in to your ApnaStay account with your new password.
              </p>

              <div className="mt-8 space-y-3">
                <Link
                  href="/login?reset=success"
                  className="w-full py-4 rounded-2xl bg-[#1D1D1F] text-white text-sm font-semibold hover:bg-black transition-all shadow-apple-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Log in now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* Reset Password Form */
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-[#1D1D1F] flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6 text-[#1D1D1F]" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
                  Set new password
                </h1>
                <p className="text-sm text-[#86868B] mt-2">
                  Create a new password of at least 8 characters for your account.
                </p>
              </div>

              {/* Alert Error */}
              {alertError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <div className="leading-relaxed">{alertError}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* New Password */}
                <div>
                  <label htmlFor="new-password" className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) {
                          setFieldErrors((prev) => ({ ...prev, password: '' }));
                        }
                      }}
                      placeholder="At least 8 characters"
                      className={`w-full px-4 py-3.5 pr-11 rounded-2xl border ${
                        fieldErrors.password ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5E5EA] bg-[#F5F5F7]'
                      } focus:border-[#1D1D1F] focus:bg-white focus:outline-none transition-all text-sm text-[#1D1D1F] placeholder:text-[#86868B]/60`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                        }
                      }}
                      placeholder="Re-enter your new password"
                      className={`w-full px-4 py-3.5 pr-11 rounded-2xl border ${
                        fieldErrors.confirmPassword ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5E5EA] bg-[#F5F5F7]'
                      } focus:border-[#1D1D1F] focus:bg-white focus:outline-none transition-all text-sm text-[#1D1D1F] placeholder:text-[#86868B]/60`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] transition-colors cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-[#1D1D1F] text-white text-sm font-semibold hover:bg-black transition-all shadow-apple-sm hover:shadow-apple-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <span>Update password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-[#EDEDED] text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Log In</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Security assurance */}
        <p className="text-center text-xs text-[#86868B] mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Protected by ApnaStay Secure Authentication</span>
        </p>
      </div>
    </div>
  );
}
