'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Home,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Phone,
  Mail,
  User,
  Lock
} from 'lucide-react';
import { handleRoleRedirect } from '../lib/auth/session';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get('redirect');
  const { handleLoginSuccess } = useApp();
  const { register } = useAuth();

  // Selected role: 'tenant' or 'property_owner'
  const [role, setRole] = useState<'tenant' | 'property_owner'>('tenant');

  // Registration input fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validate form client-side
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanFirst) {
      errors.firstName = 'First name is required.';
    } else if (cleanFirst.length < 2) {
      errors.firstName = 'First name must be at least 2 characters.';
    } else if (!/^[\p{L}\s\-']+$/u.test(cleanFirst)) {
      errors.firstName = 'First name can only contain letters.';
    }

    if (!cleanLast) {
      errors.lastName = 'Last name is required.';
    } else if (cleanLast.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters.';
    } else if (!/^[\p{L}\s\-']+$/u.test(cleanLast)) {
      errors.lastName = 'Last name can only contain letters.';
    }

    if (!cleanEmail) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (!cleanPhone) {
      errors.phone = 'Phone number is required.';
    } else if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      errors.phone = 'Please enter a valid 10 to 15-digit phone number.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!termsAccepted) {
      errors.terms = 'You must accept the Terms of Service & Privacy Policy.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    // Clear individual field error when user modifies the field
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirm_password: confirmPassword,
        role,
        terms_accepted: termsAccepted
      };

      const res = await register(payload);

      if (!res.success || !res.data) {
        // Map machine-readable backend error code to field-specific or general message
        if (res.code === 'EMAIL_ALREADY_EXISTS') {
          setFieldErrors((prev) => ({ ...prev, email: 'An account with this email already exists.' }));
        } else if (res.code === 'PHONE_ALREADY_EXISTS') {
          setFieldErrors((prev) => ({ ...prev, phone: 'An account with this phone number already exists.' }));
        } else if (res.code === 'WEAK_PASSWORD') {
          setFieldErrors((prev) => ({ ...prev, password: 'Password must be at least 8 characters long.' }));
        } else if (res.code === 'PASSWORD_MISMATCH') {
          setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
        } else if (res.code === 'TERMS_NOT_ACCEPTED') {
          setFieldErrors((prev) => ({ ...prev, terms: 'You must accept the Terms of Service & Privacy Policy.' }));
        }
        setGeneralError(res.error || 'Registration failed. Please check your information and try again.');
        setIsSubmitting(false);
        return;
      }

      // Success: User registered and centrally stored in AuthContext
      const registeredUser = res.data;
      const isOwner = registeredUser.role === 'apnastay_owner' || registeredUser.role === 'owner';
      setSuccessMessage(
        isOwner
          ? 'Account created successfully! Redirecting to your owner dashboard...'
          : 'Account created successfully! Redirecting to properties...'
      );

      if (handleLoginSuccess) {
        handleLoginSuccess(registeredUser, redirectParam, router);
      } else {
        setTimeout(() => {
          handleRoleRedirect(registeredUser, redirectParam, router);
        }, 700);
      }
    } catch (err: any) {
      console.error('[ApnaStay RegisterPage] Error during registration:', err);
      setGeneralError(err?.message || 'A network error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F5F5F7] via-white to-[#F5F5F7] flex flex-col items-center justify-center pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-apple-lg border border-[#EDEDED] p-7 sm:p-10 transition-all my-auto">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D1D1F]/5 border border-[#1D1D1F]/10 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#1D1D1F]" />
            <span className="text-xs font-semibold tracking-wide uppercase text-[#1D1D1F]">
              India’s Zero-Brokerage Network
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
            Create your ApnaStay account
          </h1>
          <p className="text-sm text-[#86868B] mt-2 max-w-md mx-auto">
            Experience verified properties, direct owner leases, and instant NFC self-tours.
          </p>
        </div>

        {/* ERROR / SUCCESS ALERTS */}
        {generalError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{generalError}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-sm text-emerald-800 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {/* ACCOUNT TYPE SELECTION CARDS */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-2.5">
            Select Account Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* FIND A PLACE (TENANT) */}
            <button
              type="button"
              onClick={() => {
                setRole('tenant');
                setGeneralError(null);
              }}
              className={`relative p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                role === 'tenant'
                  ? 'border-[#1D1D1F] bg-[#1D1D1F]/[0.02] shadow-sm'
                  : 'border-[#EDEDED] hover:border-[#CCCCCC] bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    role === 'tenant'
                      ? 'bg-[#1D1D1F] text-white'
                      : 'bg-[#F5F5F7] text-[#1D1D1F]'
                  }`}
                >
                  <Home className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    role === 'tenant'
                      ? 'bg-[#1D1D1F] text-white'
                      : 'bg-[#F5F5F7] text-[#6E6E73]'
                  }`}
                >
                  Tenant
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1D1D1F]">
                  Find a place
                </h3>
                <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                  I&apos;m looking for a place to rent.
                </p>
              </div>
            </button>

            {/* LIST MY PROPERTY (PROPERTY OWNER) */}
            <button
              type="button"
              onClick={() => {
                setRole('property_owner');
                setGeneralError(null);
              }}
              className={`relative p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                role === 'property_owner'
                  ? 'border-[#1D1D1F] bg-[#1D1D1F]/[0.02] shadow-sm'
                  : 'border-[#EDEDED] hover:border-[#CCCCCC] bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    role === 'property_owner'
                      ? 'bg-[#1D1D1F] text-white'
                      : 'bg-[#F5F5F7] text-[#1D1D1F]'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    role === 'property_owner'
                      ? 'bg-[#1D1D1F] text-white'
                      : 'bg-[#F5F5F7] text-[#6E6E73]'
                  }`}
                >
                  Owner
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1D1D1F]">
                  List my property
                </h3>
                <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                  I&apos;m a property owner.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* REGISTRATION FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NAME ROW (FIRST & LAST) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1.5">
                First Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Aman"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    handleInputChange('firstName', e.target.value);
                  }}
                  className={`w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium ${
                    fieldErrors.firstName
                      ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                      : 'border-transparent focus:border-[#1D1D1F] focus:bg-white'
                  }`}
                />
              </div>
              {fieldErrors.firstName && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1.5">
                Last Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Saifi"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    handleInputChange('lastName', e.target.value);
                  }}
                  className={`w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium ${
                    fieldErrors.lastName
                      ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                      : 'border-transparent focus:border-[#1D1D1F] focus:bg-white'
                  }`}
                />
              </div>
              {fieldErrors.lastName && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="aman@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  handleInputChange('email', e.target.value);
                }}
                className={`w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium ${
                  fieldErrors.email
                    ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                    : 'border-transparent focus:border-[#1D1D1F] focus:bg-white'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  handleInputChange('phone', e.target.value);
                }}
                className={`w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium ${
                  fieldErrors.phone
                    ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                    : 'border-transparent focus:border-[#1D1D1F] focus:bg-white'
                }`}
              />
            </div>
            {fieldErrors.phone ? (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.phone}</p>
            ) : (
              <p className="text-[11px] text-[#86868B] mt-1">Include 10-digit Indian mobile number</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  handleInputChange('password', e.target.value);
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  handleInputChange('confirmPassword', e.target.value);
                }}
                className={`w-full pl-4 pr-11 py-3 rounded-xl bg-[#F5F5F7] border text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium ${
                  fieldErrors.confirmPassword
                    ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                    : 'border-transparent focus:border-[#1D1D1F] focus:bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* TERMS & PRIVACY CHECKBOX */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  handleInputChange('terms', String(e.target.checked));
                }}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1D1D1F] focus:ring-[#1D1D1F] cursor-pointer"
              />
              <span className="text-xs text-[#6E6E73] leading-relaxed">
                I agree to ApnaStay&apos;s{' '}
                <span className="text-[#1D1D1F] font-semibold hover:underline">Terms of Service</span>{' '}
                and{' '}
                <span className="text-[#1D1D1F] font-semibold hover:underline">Privacy Policy</span>.
              </span>
            </label>
            {fieldErrors.terms && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.terms}</p>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 py-3.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* SECURITY PROMISE FOOTER */}
        <div className="mt-6 pt-6 border-t border-[#EDEDED] flex items-center justify-center gap-2 text-xs text-[#86868B]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Your data is encrypted and protected under Indian privacy standards.</span>
        </div>

        {/* LINK TO LOGIN */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#86868B]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[#1D1D1F] font-bold hover:underline transition-all"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
