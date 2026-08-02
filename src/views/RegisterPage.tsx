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
  Sparkles
} from 'lucide-react';
import { registerUser } from '../features/auth/api';
import { setCachedSession, handleRoleRedirect } from '../lib/auth/session';
import type { AccountType } from '../features/auth/types';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get('redirect');

  const [accountType, setAccountType] = useState<AccountType>('tenant');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser({
        name: trimmedName,
        email: trimmedEmail,
        password,
        account_type: accountType
      });

      if (!res.success || !res.data) {
        setErrorMessage(res.error || 'Registration failed. Please verify your details.');
        setIsSubmitting(false);
        return;
      }

      setCachedSession(res.data);
      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        handleRoleRedirect(res.data, redirectParam, router);
      }, 600);
    } catch (err: any) {
      console.error('[OwnStay RegisterPage] Error:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-[#F5F5F7] via-white to-[#F5F5F7] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-apple-lg border border-[#EDEDED] p-8 sm:p-10 transition-all">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D1D1F]/5 border border-[#1D1D1F]/10 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#1D1D1F]" />
            <span className="text-xs font-semibold tracking-wide uppercase text-[#1D1D1F]">
              India’s Zero-Brokerage Network
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
            Create your OwnStay account
          </h1>
          <p className="text-sm text-[#86868B] mt-2 max-w-sm mx-auto">
            Choose your role and start your zero-brokerage rental journey today.
          </p>
        </div>

        {/* ERROR / SUCCESS ALERTS */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-sm text-emerald-800 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {/* ROLE SELECTION CARDS (TENANT & PROPERTY OWNER ONLY - NO ADMIN EXPOSED) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-7">
          {/* TENANT CARD */}
          <button
            type="button"
            onClick={() => {
              setAccountType('tenant');
              setErrorMessage(null);
            }}
            className={`relative p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
              accountType === 'tenant'
                ? 'border-[#1D1D1F] bg-[#1D1D1F]/[0.02] shadow-sm'
                : 'border-[#EDEDED] hover:border-[#CCCCCC] bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  accountType === 'tenant'
                    ? 'bg-[#1D1D1F] text-white'
                    : 'bg-[#F5F5F7] text-[#1D1D1F]'
                }`}
              >
                <Home className="w-5 h-5" />
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  accountType === 'tenant'
                    ? 'bg-[#1D1D1F] text-white'
                    : 'bg-[#F5F5F7] text-[#6E6E73]'
                }`}
              >
                Tenant
              </span>
            </div>
            <div>
              <div className="font-bold text-sm text-[#1D1D1F]">
                I&apos;m looking for a place
              </div>
              <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                Explore zero-brokerage apartments & book instant NFC self-tours.
              </p>
            </div>
          </button>

          {/* PROPERTY OWNER CARD */}
          <button
            type="button"
            onClick={() => {
              setAccountType('owner');
              setErrorMessage(null);
            }}
            className={`relative p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
              accountType === 'owner'
                ? 'border-[#1D1D1F] bg-[#1D1D1F]/[0.02] shadow-sm'
                : 'border-[#EDEDED] hover:border-[#CCCCCC] bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  accountType === 'owner'
                    ? 'bg-[#1D1D1F] text-white'
                    : 'bg-[#F5F5F7] text-[#1D1D1F]'
                }`}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  accountType === 'owner'
                    ? 'bg-[#1D1D1F] text-white'
                    : 'bg-[#F5F5F7] text-[#6E6E73]'
                }`}
              >
                Property Owner
              </span>
            </div>
            <div>
              <div className="font-bold text-sm text-[#1D1D1F]">
                I want to list my property
              </div>
              <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                List homes, verify tenants & save 100% on brokerage fees.
              </p>
            </div>
          </button>
        </div>

        {/* REGISTRATION FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1.5">
              Name
            </label>
            <input
              type="text"
              required
              placeholder="Aman Saifi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border border-transparent focus:border-[#1D1D1F] focus:bg-white text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="aman@ownstay.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border border-transparent focus:border-[#1D1D1F] focus:bg-white text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#F5F5F7] border border-transparent focus:border-[#1D1D1F] focus:bg-white text-sm text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-70"
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
