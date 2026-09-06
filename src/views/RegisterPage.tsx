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
  ArrowLeft,
  Eye,
  EyeOff,
  Phone,
  Mail,
  User,
  Lock,
  Check
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

  // Multi-step state: Step 1 (Role) -> Step 2 (Details) -> Step 3 (Security)
  const [step, setStep] = useState<1 | 2 | 3>(1);

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

  // Step 2 Validation (Personal details)
  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanFirst) {
      errors.firstName = 'First name is required.';
    } else if (cleanFirst.length < 2) {
      errors.firstName = 'Must be at least 2 characters.';
    } else if (!/^[\p{L}\s\-']+$/u.test(cleanFirst)) {
      errors.firstName = 'First name can only contain letters.';
    }

    if (!cleanLast) {
      errors.lastName = 'Last name is required.';
    } else if (cleanLast.length < 2) {
      errors.lastName = 'Must be at least 2 characters.';
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
      errors.phone = 'Please enter a valid 10-digit phone number.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 3 Validation (Password & Terms)
  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Must be at least 8 characters long.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!termsAccepted) {
      errors.terms = 'You must agree to the Terms of Service & Privacy Policy.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string) => {
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

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      setFieldErrors({});
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
        setFieldErrors({});
      }
    } else if (step === 3) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) {
      return;
    }

    setGeneralError(null);
    setSuccessMessage(null);
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
        if (res.code === 'EMAIL_ALREADY_EXISTS') {
          setFieldErrors((prev) => ({ ...prev, email: 'An account with this email already exists.' }));
          setStep(2);
        } else if (res.code === 'PHONE_ALREADY_EXISTS') {
          setFieldErrors((prev) => ({ ...prev, phone: 'An account with this phone already exists.' }));
          setStep(2);
        } else if (res.code === 'WEAK_PASSWORD') {
          setFieldErrors((prev) => ({ ...prev, password: 'Password must be at least 8 characters.' }));
        } else if (res.code === 'PASSWORD_MISMATCH') {
          setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
        } else if (res.code === 'TERMS_NOT_ACCEPTED') {
          setFieldErrors((prev) => ({ ...prev, terms: 'You must accept the terms to continue.' }));
        }
        setGeneralError(res.error || 'Registration failed. Please check your details.');
        setIsSubmitting(false);
        return;
      }

      const registeredUser = res.data;
      const isOwner = registeredUser.role === 'apnastay_owner' || registeredUser.role === 'owner';
      setSuccessMessage(
        isOwner
          ? 'Account created! Redirecting to owner dashboard...'
          : 'Account created! Redirecting...'
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
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col justify-between selection:bg-[#E1224D]/15 selection:text-[#E1224D]">
      
      {/* ========================================================================= */}
      {/* TOP HEADER: BRAND LOGO AT TOP-LEFT, SIGN IN LINK AT TOP-RIGHT            */}
      {/* ========================================================================= */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 sm:py-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5 group transition-transform">
          <img
            src="/logo-icon.png"
            alt="ApnaStay Logo"
            className="h-9 w-auto group-hover:scale-105 transition-transform object-contain"
          />
          <span className="font-gotham-black text-2xl tracking-tighter text-[#1A1A1A]">
            ApnaStay<span className="text-[#E1224D]">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="text-gray-500 hidden sm:inline">Already registered?</span>
          <Link
            href="/login"
            className="font-bold text-[#E1224D] hover:text-[#C71B42] hover:underline transition-colors cursor-pointer"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* CENTERED MULTI-STEP CONTENT (NO CARD BOX, NO SCREEN SPLIT, NO IMAGE)      */}
      {/* ========================================================================= */}
      <main className="w-full max-w-md mx-auto px-6 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        
        {/* ----------------------------------------------------------------------- */}
        {/* TIMELINE PROGRESS STEPPER ABOVE THE FORM                                */}
        {/* ----------------------------------------------------------------------- */}
        <div className="w-full mb-8">
          <div className="flex items-center justify-between max-w-xs mx-auto relative">
            
            {/* Connecting Line between Step 1 & 2 */}
            <div
              className={`absolute top-4 left-6 right-6 h-0.5 -translate-y-1/2 transition-all duration-300 z-0 ${
                step > 1 ? 'bg-[#E1224D]' : 'bg-gray-200'
              }`}
            />
            {/* Connecting Line between Step 2 & 3 */}
            <div
              className={`absolute top-4 left-1/2 right-6 h-0.5 -translate-y-1/2 transition-all duration-300 z-0 ${
                step > 2 ? 'bg-[#E1224D]' : 'bg-gray-200'
              }`}
            />

            {/* Step 1 Node */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 1
                    ? 'bg-[#E1224D] text-white ring-4 ring-[#E1224D]/15'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > 1 ? <Check className="w-4 h-4 stroke-[2.5]" /> : '1'}
              </div>
              <span className={`text-[11px] font-semibold mt-1.5 ${step === 1 ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>
                Role
              </span>
            </div>

            {/* Step 2 Node */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 2
                    ? 'bg-[#E1224D] text-white ring-4 ring-[#E1224D]/15'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > 2 ? <Check className="w-4 h-4 stroke-[2.5]" /> : '2'}
              </div>
              <span className={`text-[11px] font-semibold mt-1.5 ${step === 2 ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>
                Details
              </span>
            </div>

            {/* Step 3 Node */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 3
                    ? 'bg-[#E1224D] text-white ring-4 ring-[#E1224D]/15'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                3
              </div>
              <span className={`text-[11px] font-semibold mt-1.5 ${step === 3 ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>
                Security
              </span>
            </div>

          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* HEADER TEXT (MINIMAL & SIMPLE)                                         */}
        {/* ----------------------------------------------------------------------- */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            {step === 1 && 'Choose your account type'}
            {step === 2 && 'Personal details'}
            {step === 3 && 'Set your password'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
            {step === 1 && 'Select how you want to use ApnaStay.'}
            {step === 2 && 'Please enter your name and contact details.'}
            {step === 3 && 'Create a secure password to protect your account.'}
          </p>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* ALERTS & FEEDBACK                                                      */}
        {/* ----------------------------------------------------------------------- */}
        {generalError && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{generalError}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* FORM CONTENT BY STEP (DIRECTLY ON CANVAS, NO CARD WRAPPER)             */}
        {/* ----------------------------------------------------------------------- */}
        <form onSubmit={handleNext} className="space-y-4">
          
          {/* =================================================================== */}
          {/* STEP 1: ROLE SELECTION                                              */}
          {/* =================================================================== */}
          {step === 1 && (
            <div className="space-y-3 animate-fade-in">
              {/* Tenant Option */}
              <button
                type="button"
                onClick={() => setRole('tenant')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  role === 'tenant'
                    ? 'border-[#E1224D] bg-rose-50/40 ring-2 ring-[#E1224D]/15'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      role === 'tenant' ? 'bg-[#E1224D] text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1A1A1A]">Tenant</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Looking for verified stays with ₹0 brokerage
                    </div>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    role === 'tenant'
                      ? 'border-[#E1224D] bg-[#E1224D] text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {role === 'tenant' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>

              {/* Property Owner Option */}
              <button
                type="button"
                onClick={() => setRole('property_owner')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  role === 'property_owner'
                    ? 'border-[#E1224D] bg-rose-50/40 ring-2 ring-[#E1224D]/15'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      role === 'property_owner' ? 'bg-[#E1224D] text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1A1A1A]">Property Owner</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      List properties & manage tenant bookings
                    </div>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    role === 'property_owner'
                      ? 'border-[#E1224D] bg-[#E1224D] text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {role === 'property_owner' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>

              {/* Continue Button */}
              <button
                type="submit"
                className="w-full mt-5 py-3.5 px-6 rounded-xl bg-[#E1224D] hover:bg-[#C71B42] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#E1224D]/20 active:scale-[0.99] cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* =================================================================== */}
          {/* STEP 2: PERSONAL & CONTACT DETAILS                                  */}
          {/* =================================================================== */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              {/* Name Fields (First & Last) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    First name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Aman"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        handleInputChange('firstName');
                      }}
                      className={`w-full pl-9 pr-3 py-3 rounded-xl bg-gray-50/80 hover:bg-gray-50 focus:bg-white border text-sm text-[#1D1D1F] placeholder-gray-400 outline-none transition-all font-medium ${
                        fieldErrors.firstName
                          ? 'border-rose-400 bg-rose-50/20 focus:border-[#E1224D]'
                          : 'border-gray-200 focus:border-[#E1224D] focus:ring-4 focus:ring-[#E1224D]/15'
                      }`}
                    />
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {fieldErrors.firstName && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Last name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Saifi"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        handleInputChange('lastName');
                      }}
                      className={`w-full pl-9 pr-3 py-3 rounded-xl bg-gray-50/80 hover:bg-gray-50 focus:bg-white border text-sm text-[#1D1D1F] placeholder-gray-400 outline-none transition-all font-medium ${
                        fieldErrors.lastName
                          ? 'border-rose-400 bg-rose-50/20 focus:border-[#E1224D]'
                          : 'border-gray-200 focus:border-[#E1224D] focus:ring-4 focus:ring-[#E1224D]/15'
                      }`}
                    />
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {fieldErrors.lastName && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      handleInputChange('email');
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50/80 hover:bg-gray-50 focus:bg-white border text-sm text-[#1D1D1F] placeholder-gray-400 outline-none transition-all font-medium ${
                      fieldErrors.email
                        ? 'border-rose-400 bg-rose-50/20 focus:border-[#E1224D]'
                        : 'border-gray-200 focus:border-[#E1224D] focus:ring-4 focus:ring-[#E1224D]/15'
                    }`}
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Phone number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      handleInputChange('phone');
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50/80 hover:bg-gray-50 focus:bg-white border text-sm text-[#1D1D1F] placeholder-gray-400 outline-none transition-all font-medium ${
                      fieldErrors.phone
                        ? 'border-rose-400 bg-rose-50/20 focus:border-[#E1224D]'
                        : 'border-gray-200 focus:border-[#E1224D] focus:ring-4 focus:ring-[#E1224D]/15'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {fieldErrors.phone && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              {/* Continue to Step 3 */}
              <button
                type="submit"
                className="w-full mt-4 py-3.5 px-6 rounded-xl bg-[#E1224D] hover:bg-[#C71B42] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#E1224D]/20 active:scale-[0.99] cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Back to Step 1 */}
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setFieldErrors({});
                }}
                className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          )}

          {/* =================================================================== */}
          {/* STEP 3: SECURITY & PASSWORD                                         */}
          {/* =================================================================== */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoFocus
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
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
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      handleInputChange('confirmPassword');
                    }}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50/80 hover:bg-gray-50 focus:bg-white border text-sm text-[#1D1D1F] placeholder-gray-400 outline-none transition-all font-medium ${
                      fieldErrors.confirmPassword
                        ? 'border-rose-400 bg-rose-50/20 focus:border-[#E1224D]'
                        : 'border-gray-200 focus:border-[#E1224D] focus:ring-4 focus:ring-[#E1224D]/15'
                    }`}
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      handleInputChange('terms');
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#E1224D] focus:ring-[#E1224D]/20 cursor-pointer"
                  />
                  <span>
                    I agree to the{' '}
                    <span className="text-[#E1224D] font-medium hover:underline">
                      Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="text-[#E1224D] font-medium hover:underline">
                      Privacy Policy
                    </span>
                  </span>
                </label>
                {fieldErrors.terms && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">
                    {fieldErrors.terms}
                  </p>
                )}
              </div>

              {/* Submit Registration Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-3.5 px-6 rounded-xl bg-[#E1224D] hover:bg-[#C71B42] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#E1224D]/20 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Complete registration</span>
                )}
              </button>

              {/* Back to Step 2 */}
              <button
                type="button"
                onClick={() => {
                  setStep(2);
                  setFieldErrors({});
                }}
                className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          )}

        </form>

      </main>

      {/* ========================================================================= */}
      {/* BOTTOM FOOTER                                                             */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-gray-400">
        © ApnaStay · Zero-Brokerage Living
      </footer>

    </div>
  );
}
