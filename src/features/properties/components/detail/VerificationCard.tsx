'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, FileText, Camera } from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface VerificationCardProps {
  property: NormalizedProperty;
}

export default function VerificationCard({ property }: VerificationCardProps) {
  const { verification } = property;

  return (
    <section aria-label="Verification and trust" className="bg-emerald-50/60 rounded-3xl p-6 sm:p-7 border border-emerald-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              ApnaStay Verified Listing
            </h2>
            <p className="text-xs text-emerald-800">
              Physically audited and authenticated by our field team.
            </p>
          </div>
        </div>

        {verification.lastVerified && (
          <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-200">
            Verified: {verification.lastVerified}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Property specifications & dimensions verified</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Owner title & identity authenticated</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Real, unedited photos confirmed on-site</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>100% Zero-Brokerage direct owner lease</span>
        </div>
      </div>
    </section>
  );
}
