'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import { forgotPassword } from '@/features/auth/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setFieldError('Email address is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setFieldError('Please enter a valid email address.');
      return false;
    }
    setFieldError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertError(null);

    if (!validateEmail(email)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setIsSubmitted(true);
      setSubmittedEmail(email.trim());
    } catch (err: any) {
      setAlertError('Unable to process your request. Please check your internet connection and try again.');
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
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-[#1D1D1F] flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-6 h-6 text-[#1D1D1F]" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
                  Forgot password?
                </h1>
                <p className="text-sm text-[#86868B] mt-2">
                  Enter your registered email address and we'll send you a secure link to reset your password.
                </p>
              </div>

              {/* Alert Error */}
              {alertError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <div className="leading-relaxed">{alertError}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldError) validateEmail(e.target.value);
                      }}
                      placeholder="name@example.com"
                      className={`w-full px-4 py-3.5 pl-11 rounded-2xl border ${
                        fieldError ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5E5EA] bg-[#F5F5F7]'
                      } focus:border-[#1D1D1F] focus:bg-white focus:outline-none transition-all text-sm text-[#1D1D1F] placeholder:text-[#86868B]/60`}
                    />
                    <Mail className="w-4 h-4 text-[#86868B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {fieldError && (
                    <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {fieldError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-[#1D1D1F] text-white text-sm font-semibold hover:bg-black transition-all shadow-apple-sm hover:shadow-apple-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send reset link</span>
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
          ) : (
            /* Submitted confirmation state */
            <div className="text-center py-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
                Check your email
              </h2>
              <p className="text-sm text-[#86868B] mt-2 leading-relaxed">
                If an account exists for <span className="font-semibold text-[#1D1D1F]">{submittedEmail}</span>, we have sent instructions to reset your password.
              </p>

              <div className="my-6 p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs text-[#86868B] text-left leading-relaxed space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>The reset link is valid for 24 hours and can only be used once.</span>
                </div>
                <div className="pl-6">
                  Didn't receive an email? Be sure to check your spam or junk folder.
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full py-3.5 rounded-2xl bg-[#1D1D1F] text-white text-sm font-semibold hover:bg-black transition-all shadow-apple-sm flex items-center justify-center gap-2"
                >
                  <span>Return to Log In</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full py-3 rounded-2xl text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Send to a different email
                </button>
              </div>
            </div>
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
