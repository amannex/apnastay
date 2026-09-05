'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  AlertCircle,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  Home,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { handleRoleRedirect } from '../../../lib/auth/session';
import type { RegisterPayload } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login'
}: AuthModalProps) {
  const router = useRouter();
  const { login, register } = useAuth();

  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'property_owner'>('tenant');

  // Registration form fields (strictly matching backend API)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Login form fields (strictly matching backend API)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Clear errors when field changes
  const handleFieldChange = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  // Validate Registration Form
  const validateRegisterForm = (): boolean => {
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

  // Validate Login Form
  const validateLoginForm = (): boolean => {
    const errors: Record<string, string> = {};
    const trimmedId = loginIdentifier.trim();

    if (!trimmedId) {
      errors.loginIdentifier = 'Email or phone number is required.';
    }

    if (!loginPassword) {
      errors.loginPassword = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (isRegister) {
      if (!validateRegisterForm()) return;
      setIsSubmitting(true);

      try {
        const payload: RegisterPayload = {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          confirm_password: confirmPassword,
          role: selectedRole,
          terms_accepted: termsAccepted
        };

        const res = await register(payload);

        if (!res.success || !res.data) {
          if (res.code === 'EMAIL_ALREADY_EXISTS') {
            setFieldErrors((prev) => ({ ...prev, email: 'An account with this email already exists.' }));
          } else if (res.code === 'PHONE_ALREADY_EXISTS') {
            setFieldErrors((prev) => ({ ...prev, phone: 'An account with this phone number already exists.' }));
          } else if (res.code === 'WEAK_PASSWORD') {
            setFieldErrors((prev) => ({ ...prev, password: 'Password must be at least 8 characters long.' }));
          } else if (res.code === 'PASSWORD_MISMATCH') {
            setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
          } else if (res.code === 'TERMS_NOT_ACCEPTED') {
            setFieldErrors((prev) => ({ ...prev, terms: 'You must accept the Terms & Privacy Policy.' }));
          }

          setGeneralError(res.error || 'Registration failed. Please try again.');
          setIsSubmitting(false);
          return;
        }

        onLoginSuccess(res.data);
        setIsSubmitting(false);
        onClose();
        handleRoleRedirect(res.data, undefined, router);
      } catch (err: any) {
        console.error('[ApnaStay AuthModal] Register error:', err);
        setGeneralError(err?.message || 'An unexpected error occurred during registration.');
        setIsSubmitting(false);
      }
    } else {
      if (!validateLoginForm()) return;
      setIsSubmitting(true);

      try {
        const res = await login({
          identifier: loginIdentifier.trim(),
          password: loginPassword
        });

        if (!res.success || !res.data) {
          if (res.code === 'ACCOUNT_INACTIVE') {
            setGeneralError('Your account is inactive or suspended. Please contact support.');
          } else if (res.code === 'UNAUTHORIZED_ROLE') {
            setGeneralError('This portal is restricted to Tenants and Property Owners.');
          } else {
            setGeneralError(res.error || 'Invalid email/phone or password.');
          }
          setIsSubmitting(false);
          return;
        }

        onLoginSuccess(res.data);
        setIsSubmitting(false);
        onClose();
        handleRoleRedirect(res.data, undefined, router);
      } catch (err: any) {
        console.error('[ApnaStay AuthModal] Login error:', err);
        setGeneralError(err?.message || 'An unexpected error occurred during login.');
        setIsSubmitting(false);
      }
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setFieldErrors({});
    setGeneralError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[480px] bg-white rounded-3xl shadow-apple-lg border border-[#EDEDED] overflow-hidden p-6 sm:p-8 max-h-[90vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR: CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F5F5F7] hover:bg-[#EAEAEA] text-[#1D1D1F] flex items-center justify-center transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* MODAL TITLE */}
        <div className="mb-5 pr-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F]">
            {isRegister ? 'Create an account' : 'Log in to ApnaStay'}
          </h2>
          <p className="text-xs text-[#86868B] mt-1">
            {isRegister
              ? 'Join India’s zero-brokerage housing network with verified agreements.'
              : 'Sign in to access your verified rentals, agreements, and tours.'}
          </p>
        </div>

        {/* TOP ALERT ERROR */}
        {generalError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        {/* SCROLLABLE FORM BODY */}
        <div className="overflow-y-auto pr-1 -mr-1 flex-1">
          {/* REGISTRATION ROLE SELECTOR (ONLY TENANT & PROPERTY OWNER) */}
          {isRegister && (
            <div className="mb-5">
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-2">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-2.5 p-1 rounded-2xl bg-[#F5F5F7]">
                <button
                  type="button"
                  onClick={() => setSelectedRole('tenant')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                    selectedRole === 'tenant'
                      ? 'bg-white text-[#1D1D1F] shadow-sm font-bold border border-[#EDEDED]'
                      : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                >
                  <Home className="w-3.5 h-3.5 text-[#E1224D]" />
                  <span>Find a Place</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('property_owner')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                    selectedRole === 'property_owner'
                      ? 'bg-white text-[#1D1D1F] shadow-sm font-bold border border-[#EDEDED]'
                      : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-[#E1224D]" />
                  <span>List Property</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {isRegister ? (
              <>
                {/* FIRST NAME & LAST NAME */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Aman"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          handleFieldChange('firstName');
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border ${
                          fieldErrors.firstName ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-[#1D1D1F]'
                        } focus:bg-white text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium`}
                      />
                    </div>
                    {fieldErrors.firstName && (
                      <p className="text-[11px] text-red-500 mt-1">{fieldErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Saifi"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          handleFieldChange('lastName');
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border ${
                          fieldErrors.lastName ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-[#1D1D1F]'
                        } focus:bg-white text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium`}
                      />
                    </div>
                    {fieldErrors.lastName && (
                      <p className="text-[11px] text-red-500 mt-1">{fieldErrors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* EMAIL ADDRESS */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="aman@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        handleFieldChange('email');
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border ${
                        fieldErrors.email ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-[#1D1D1F]'
                      } focus:bg-white text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                {/* PHONE NUMBER */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        handleFieldChange('phone');
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border ${
                        fieldErrors.phone ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-[#1D1D1F]'
                      } focus:bg-white text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium`}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.phone}</p>
                  )}
                </div>

                {/* PASSWORD & CONFIRM PASSWORD */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
                      Password (min 8)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          handleFieldChange('password');
                        }}
                        className={`w-full px-3.5 py-2.5 pr-9 rounded-xl bg-[#F5F5F7] border ${
                          fieldErrors.password ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-[#1D1D1F]'
                        } focus:bg-white text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-[11px] text-red-500 mt-1">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          handleFieldChange('confirmPassword');
                        }}
                        className={`w-full px-3.5 py-2.5 pr-9 rounded-xl bg-[#F5F5F7] border ${
                          fieldErrors.confirmPassword ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-[#1D1D1F]'
                        } focus:bg-white text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F]"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-[11px] text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* TERMS AND PRIVACY CHECKBOX */}
                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked);
                        handleFieldChange('terms');
                      }}
                      className="mt-0.5 w-4 h-4 rounded text-[#E1224D] focus:ring-[#E1224D] border-gray-300"
                    />
                    <span className="text-xs text-[#6B7280]">
                      I agree to ApnaStay's{' '}
                      <span className="text-[#1D1D1F] font-semibold">Terms of Service</span> and{' '}
                      <span className="text-[#1D1D1F] font-semibold">Privacy Policy</span>.
                    </span>
                  </label>
                  {fieldErrors.terms && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.terms}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* LOGIN IDENTIFIER: EMAIL OR PHONE */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
                    Email or Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="aman@example.com or 9876543210"
                      value={loginIdentifier}
                      onChange={(e) => {
                        setLoginIdentifier(e.target.value);
                        handleFieldChange('loginIdentifier');
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border ${
                        fieldErrors.loginIdentifier ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-[#1D1D1F]'
                      } focus:bg-white text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium`}
                    />
                  </div>
                  {fieldErrors.loginIdentifier && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.loginIdentifier}</p>
                  )}
                </div>

                {/* LOGIN PASSWORD */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      onClick={onClose}
                      className="text-xs font-semibold text-[#E1224D] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        handleFieldChange('loginPassword');
                      }}
                      className={`w-full px-3.5 py-2.5 pr-9 rounded-xl bg-[#F5F5F7] border ${
                        fieldErrors.loginPassword ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-[#1D1D1F]'
                      } focus:bg-white text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.loginPassword && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.loginPassword}</p>
                  )}
                </div>
              </>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-3 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRegister ? 'Creating Account...' : 'Logging in...'}</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Log In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* TOGGLE LOGIN / REGISTER */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-xs text-[#86868B] hover:text-[#1D1D1F] font-medium transition-colors"
            >
              {isRegister ? (
                <>
                  Already have an account? <span className="font-bold text-[#E1224D]">Log In</span>
                </>
              ) : (
                <>
                  Don’t have an account? <span className="font-bold text-[#E1224D]">Create Account</span>
                </>
              )}
            </button>
          </div>

          {/* DEDICATED FULL-PAGE LINKS */}
          <div className="mt-4 pt-4 border-t border-[#EDEDED] flex items-center justify-center gap-4 text-[11px] text-[#86868B]">
            <Link
              href={isRegister ? '/register' : '/login'}
              onClick={onClose}
              className="hover:text-[#1D1D1F] underline transition-colors"
            >
              Open {isRegister ? 'Register' : 'Login'} Page
            </Link>
            <span>•</span>
            <Link
              href="/forgot-password"
              onClick={onClose}
              className="hover:text-[#1D1D1F] underline transition-colors"
            >
              Reset Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
