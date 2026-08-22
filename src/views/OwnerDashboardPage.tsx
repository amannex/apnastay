'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  Key,
  DollarSign,
  ShieldCheck,
  PlusCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Sparkles,
  MapPin,
  Clock,
  AlertCircle
} from 'lucide-react';
import { fetchSession, getSessionRole } from '../lib/auth/session';
import { can, getOwnerVerificationStatus, canPublishProperty, submitOwnerVerification } from '../features/auth';
import type { UserProfile } from '../features/auth/types';
import OwnerDashboardShell from '../components/dashboard/OwnerDashboardShell';

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const [kycSuccessMsg, setKycSuccessMsg] = useState<string | null>(null);
  const [kycErrorMsg, setKycErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSession().then((profile) => {
      setUser(profile);
    });
  }, []);

  const verificationStatus = getOwnerVerificationStatus(user);

  const handleSubmitKyc = async () => {
    setSubmittingKyc(true);
    setKycSuccessMsg(null);
    setKycErrorMsg(null);
    try {
      const res = await submitOwnerVerification();
      if (res.success && res.data) {
        setUser(res.data);
        setKycSuccessMsg('KYC Verification submitted successfully! Status transitions to Pending for ApnaStay Admin review.');
      } else {
        setKycErrorMsg(res.error || 'Failed to submit KYC verification.');
      }
    } catch (err) {
      setKycErrorMsg('Network error submitting KYC verification.');
    } finally {
      setSubmittingKyc(false);
    }
  };

  return (
    <OwnerDashboardShell activeTab="overview">
      <div className="space-y-8 animate-fade-in">
        {/* OWNER DASHBOARD HERO BANNER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1D1D1F] text-white flex items-center justify-center text-xl font-black">
              {user?.name?.[0]?.toUpperCase() || 'O'}
            </div>
            <div>
              {(() => {
                const verificationStatus = getOwnerVerificationStatus(user);
                if (verificationStatus === 'verified') {
                  return (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Property Owner</span>
                    </div>
                  );
                }
                if (verificationStatus === 'pending') {
                  return (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-wider mb-1">
                      <Clock className="w-3 h-3" />
                      <span>Verification Pending (Review in Progress)</span>
                    </div>
                  );
                }
                return (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold uppercase tracking-wider mb-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{verificationStatus === 'rejected' ? 'Verification Rejected' : verificationStatus === 'suspended' ? 'Account Suspended' : 'Unverified Owner (KYC Required)'}</span>
                  </div>
                );
              })()}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
                Owner Portal — {user?.name || 'Landlord'}
              </h1>
              <p className="text-xs text-[#86868B] mt-1">
                List verified apartments, screen tenants, and enjoy 100% zero-brokerage earnings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {can(user, 'apnastay_create_property') && (
              <button
                onClick={() => {
                  const check = canPublishProperty(user);
                  if (!check.allowed) {
                    alert(`Business Rule Violation: ${check.reason}\n\nNote: You possess the RBAC capability (apnastay_create_property), but publication requires fulfilling domain business rules.`);
                    return;
                  }
                  alert('Opening Property Lister Wizard...');
                }}
                className="px-4 py-3 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold inline-flex items-center gap-2 transition-all shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List New Property</span>
              </button>
            )}
          </div>
        </div>

        {/* INTERACTIVE KYC VERIFICATION SUBMISSION BANNER (PHASE 23 WORKFLOW) */}
        {verificationStatus !== 'verified' && (
          <div className="bg-gradient-to-br from-[#F5F5F7] to-white border border-[#EDEDED] rounded-3xl p-6 sm:p-7 shadow-apple-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
                    Phase 23 Vertical Slice
                  </span>
                  <span className="text-xs font-bold text-[#1D1D1F]">
                    Authoritative KYC Review Workflow
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-[#1D1D1F]">
                  {verificationStatus === 'pending'
                    ? 'KYC Verification Under Admin Review'
                    : 'Submit Aadhaar & PAN KYC to Unlock Listing Capabilities'}
                </h3>
                <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
                  {verificationStatus === 'pending'
                    ? 'Your verification documents have been submitted and are currently in Pending state. An ApnaStay Administrator can review and approve your account in WP Admin → ApnaStay → Owner Verification.'
                    : 'Even with RBAC capability (apnastay_create_property), business rules require verified KYC status before publishing properties. Click below to submit your verification to WordPress Admin.'}
                </p>

                {kycSuccessMsg && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    ✅ {kycSuccessMsg}
                  </div>
                )}
                {kycErrorMsg && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                    ❌ {kycErrorMsg}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                {verificationStatus !== 'pending' ? (
                  <button
                    onClick={handleSubmitKyc}
                    disabled={submittingKyc}
                    className="px-5 py-3.5 rounded-2xl bg-[#1D1D1F] hover:bg-black disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    {submittingKyc ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting to WP Admin...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit KYC Verification</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>Pending WP Admin Approval</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* OWNER KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-[#EDEDED] shadow-apple-sm">
            <div className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1">
              Active Verified Properties
            </div>
            <div className="text-2xl font-extrabold text-[#1D1D1F]">
              4 Listings
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-2">
              100% 25-Point Engineering Verified
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#EDEDED] shadow-apple-sm">
            <div className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1">
              Monthly Rental Revenue
            </div>
            <div className="text-2xl font-extrabold text-[#1D1D1F]">
              ₹1,18,000
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-2">
              ₹0 Brokerage Paid to Middlemen
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#EDEDED] shadow-apple-sm">
            <div className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1">
              Pending NFC Self-Tours
            </div>
            <div className="text-2xl font-extrabold text-[#1D1D1F]">
              3 Visits
            </div>
            <div className="text-[11px] text-blue-600 font-bold mt-2">
              Smart-Lock Self-Tour Mode
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#EDEDED] shadow-apple-sm">
            <div className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1">
              Screened Tenants
            </div>
            <div className="text-2xl font-extrabold text-[#1D1D1F]">
              12 Screened
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-2">
              Aadhaar & PAN E-Signed
            </div>
          </div>
        </div>

        {/* LISTINGS TABLE / SECTION */}
        <div className="bg-white rounded-3xl border border-[#EDEDED] shadow-apple-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#1D1D1F]">
                Your Verified Properties in Tier-2 Hubs
              </h2>
              <p className="text-xs text-[#86868B]">
                Indore, Pune, Jaipur, Coimbatore & Chandigarh residences
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
              Zero Brokerage Enforced
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#E1224D] shadow-sm shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#1D1D1F]">
                      3 BHK Pinnacle Residenza — Vijay Nagar
                    </h4>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                      25-Point Verified
                    </span>
                  </div>
                  <p className="text-xs text-[#6E6E73] mt-0.5">
                    Indore • ₹24,000 / month • Acoustic dB & Wi-Fi Certified
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {can(user, 'apnastay_manage_visits') && (
                  <button
                    onClick={() => alert('Viewing 3 BHK Pinnacle Residenza visits...')}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-[#EDEDED] text-[#1D1D1F] text-xs font-bold transition-all border border-[#EDEDED]"
                  >
                    Manage Tours (3)
                  </button>
                )}
                {can(user, 'apnastay_edit_own_property') && (
                  <button
                    onClick={() => alert('Opening Property Editor...')}
                    className="px-4 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all"
                  >
                    Edit Property
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#E1224D] shadow-sm shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#1D1D1F]">
                      2 BHK Koregaon Park Heights
                    </h4>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                      25-Point Verified
                    </span>
                  </div>
                  <p className="text-xs text-[#6E6E73] mt-0.5">
                    Pune • ₹32,000 / month • Inverter Backup & Solar Certified
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {can(user, 'apnastay_manage_visits') && (
                  <button
                    onClick={() => alert('Viewing 2 BHK Koregaon Park visits...')}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-[#EDEDED] text-[#1D1D1F] text-xs font-bold transition-all border border-[#EDEDED]"
                  >
                    Manage Tours (0)
                  </button>
                )}
                {can(user, 'apnastay_edit_own_property') && (
                  <button
                    onClick={() => alert('Opening Property Editor...')}
                    className="px-4 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all"
                  >
                    Edit Property
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </OwnerDashboardShell>
  );
}
