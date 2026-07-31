'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState('tenant');
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const roles = [
    { id: 'tenant', label: 'Renter', title: 'Tenant / Renter' },
    { id: 'owner', label: 'Landlord', title: 'Property Owner' },
    { id: 'admin', label: 'Engineer', title: 'Field Engineer' }
  ];

  const handleAuthSubmit = (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    const roleObj = roles.find((r) => r.id === selectedRole);
    const userName = name.trim() || 'Aman Saifi';

    setTimeout(() => {
      onLoginSuccess({
        name: userName,
        email: emailOrPhone || 'aman@ownstay.in',
        role: selectedRole,
        roleTitle: roleObj?.title || 'Tenant / Renter',
        avatar: userName[0].toUpperCase()
      });
      setIsSubmitting(false);
      onClose();
    }, 450);
  };

  const handleOAuthLogin = (provider) => {
    setIsSubmitting(true);
    const roleObj = roles.find((r) => r.id === selectedRole);

    setTimeout(() => {
      onLoginSuccess({
        name: `Aman (${provider})`,
        email: `aman.${provider.toLowerCase()}@ownstay.in`,
        role: selectedRole,
        roleTitle: roleObj?.title || 'Tenant / Renter',
        avatar: 'A'
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[400px] bg-white rounded-3xl shadow-apple-lg border border-[#EDEDED] overflow-hidden p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR: CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F5F5F7] hover:bg-[#EAEAEA] text-[#1D1D1F] flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* MODAL TITLE */}
        <div className="mb-5">
          <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
            {isRegister ? 'Create an account' : 'Log in or sign up'}
          </h2>
          <p className="text-xs text-[#86868B] mt-1">
            {isRegister
              ? 'Join India’s zero-brokerage housing network.'
              : 'Welcome back. Select your role to continue.'}
          </p>
        </div>

        {/* APPLE-STYLE SEGMENTED ROLE SWITCHER (0 CLUTTER) */}
        <div className="grid grid-cols-3 p-1 rounded-xl bg-[#F5F5F7] mb-5">
          {roles.map((r) => {
            const active = selectedRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id)}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  active
                    ? 'bg-white text-[#1D1D1F] shadow-sm font-bold'
                    : 'text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* OAUTH SOCIAL LOGIN BUTTONS */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => handleOAuthLogin('Google')}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-[#D2D2D7] hover:border-[#1D1D1F] bg-white text-xs font-semibold text-[#1D1D1F] transition-all hover:bg-[#FAFAFA]"
          >
            {/* OFFICIAL GOOGLE G SVG */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.12C3.26 21.3 7.35 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.61H1.24C.45 8.19 0 10.04 0 12c0 1.96.45 3.81 1.24 5.39l4.04-3.12Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.7 1.24 6.61l4.04 3.12c.95-2.83 3.6-4.98 6.72-4.98Z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuthLogin('Apple')}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold transition-all"
          >
            {/* CLEAN APPLE LOGO SVG */}
            <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 18 18">
              <path d="M14.95 13.91c-.37.89-.78 1.77-1.74 1.79-.95.02-1.25-.56-2.33-.56-1.09 0-1.42.54-2.34.58-.96.03-1.44-.92-1.81-1.79-1.39-3.23-1.12-6.94.97-8.15 1.03-.59 2.1-.47 2.8-.02.66.42 1.07.44 1.76.01.78-.49 1.95-.65 3.01-.25 1.07.41 1.87 1.17 2.22 1.87-1.95 1.18-1.63 4.19.33 5.36-.26.68-.58 1.34-1.03 2.16zM11.96 4.76C12.48 4.13 12.83 3.2 12.72 2.3c-.76.03-1.71.51-2.24 1.13-.47.53-.87 1.45-.75 2.34.85.07 1.73-.42 2.23-1.01z" />
            </svg>
            <span>Continue with Apple</span>
          </button>
        </div>

        {/* CLEAN DIVIDER */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#EDEDED]" />
          <span className="text-[11px] font-medium text-[#86868B] uppercase tracking-wider">
            or
          </span>
          <div className="flex-1 h-px bg-[#EDEDED]" />
        </div>

        {/* MINIMAL INPUT FORM */}
        <form onSubmit={handleAuthSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] bg-[#FAFAFA] text-xs font-medium text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#1D1D1F] focus:bg-white transition-all"
              />
            </div>
          )}

          <div>
            <input
              type="text"
              required
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="Email or +91 mobile number"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] bg-[#FAFAFA] text-xs font-medium text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#1D1D1F] focus:bg-white transition-all"
            />
          </div>

          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] bg-[#FAFAFA] text-xs font-medium text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#1D1D1F] focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-[#E1224D] hover:bg-[#C71B42] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-70"
          >
            <span>{isRegister ? 'Agree and continue' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* TOGGLE LOGIN / REGISTER */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs font-semibold text-[#1D1D1F] hover:underline"
          >
            {isRegister
              ? 'Already have an account? Log in'
              : 'Don’t have an account? Sign up'}
          </button>
        </div>

        {/* ULTRA-MINIMAL TERMS TEXT AT BOTTOM */}
        <p className="mt-4 text-[10px] text-center text-[#86868B] leading-relaxed">
          By continuing, you agree to OwnStay’s Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
