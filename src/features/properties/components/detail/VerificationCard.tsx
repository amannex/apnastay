'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, ShieldAlert, Calendar, AlertCircle } from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface VerificationCardProps {
  property: NormalizedProperty;
}

export default function VerificationCard({ property }: VerificationCardProps) {
  const { verification } = property;
  const { isVerified, confirmedChecks = [], lastVerified, levelLabel } = verification;

  // Unverified / Missing Verification State
  if (!isVerified || confirmedChecks.length === 0) {
    return (
      <section
        aria-label="Verification and trust information"
        className="py-6 sm:py-8 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-sm shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                ApnaStay Verification Pending
              </h2>
              <p className="text-xs text-amber-800">
                This property has not yet completed our field engineer audit.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center self-start sm:self-auto text-[11px] font-bold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200">
            Unverified Listing
          </span>
        </div>

        <div className="bg-white/80 rounded-2xl p-4 border border-amber-200/60 text-xs text-gray-700 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Tenant Safety Advisory</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            ApnaStay field auditors have not yet inspected this property on-site. We strongly advise prospective tenants to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 pl-1">
            <li>Schedule an in-person physical visit before finalizing the lease</li>
            <li>Verify the owner&apos;s identity proof and title documents directly</li>
            <li>Never transfer security deposits or advance rent outside verified banking channels</li>
          </ul>
        </div>
      </section>
    );
  }

  // Verified State (Strictly data-driven, confirmed checks only)
  return (
    <section
      aria-label="Verification and trust"
      className="py-6 sm:py-8 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-sm shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              ApnaStay Verification
            </h2>
            <p className="text-xs text-emerald-800">
              {levelLabel || 'Authenticity verified & confirmed by ApnaStay'}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center self-start sm:self-auto text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-200">
          ✓ Verified Listing
        </span>
      </div>

      {/* Confirmed Verification Checklist */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {confirmedChecks.map((check) => (
          <li
            key={check.id}
            className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-800 bg-white/70 px-3.5 py-2.5 rounded-xl border border-emerald-100/80"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{check.label}</span>
          </li>
        ))}
      </ul>

      {/* Timestamp Disclosure */}
      {lastVerified && (
        <div className="pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-900">
          <span className="text-gray-500 font-medium">Last verified:</span>
          <span className="font-bold text-gray-900 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            {lastVerified}
          </span>
        </div>
      )}
    </section>
  );
}
