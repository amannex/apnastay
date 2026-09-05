'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  Lock,
  ArrowLeft,
  Database
} from 'lucide-react';
import { fetchPermissionMatrix } from '../features/auth/api';
import type { PermissionMatrixResponse } from '../features/auth/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function PermissionMatrixPage() {
  const router = useRouter();
  const [data, setData] = useState<PermissionMatrixResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadMatrix = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPermissionMatrix();
      if (res.success) {
        setData(res);
      } else {
        setError(res.error || 'Failed to fetch matrix from WordPress REST API');
      }
    } catch (err) {
      setError('Network exception connecting to REST API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatrix();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Phase 24 — Security Verification
              </span>
              <span className="text-xs font-bold text-[#6E6E73]">
                Authoritative WP REST & RBAC Test Suite
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F]">
              Permission Matrix & API Assertions
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6E73] mt-1 max-w-2xl">
              Real-time programmatic verification of ApnaStay roles (Tenant, Property Owner, Administrator) across the RBAC Capability Matrix and REST API security boundaries.
            </p>
          </div>

          <button
            onClick={loadMatrix}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-[#1D1D1F] hover:bg-black disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-2 transition-all shadow-sm shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-run Test Suite</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>Error running Phase 24 matrix suite: {error}</span>
          </div>
        )}

        {data && (
          <div className="space-y-8 animate-fade-in">
            {/* OVERALL STATUS BANNER */}
            <div className={`p-6 rounded-3xl border shadow-apple-sm flex items-center justify-between ${
              data.all_passed
                ? 'bg-gradient-to-r from-emerald-50 to-white border-emerald-200 text-emerald-900'
                : 'bg-gradient-to-r from-rose-50 to-white border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-4">
                {data.all_passed ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-10 h-10 text-rose-600 shrink-0" />
                )}
                <div>
                  <h2 className="text-lg font-extrabold">
                    {data.all_passed
                      ? '🎉 All 20 RBAC Capability Tests & 10 REST API Security Assertions PASSED'
                      : '⚠️ Some Permission Tests or Assertions Failed'}
                  </h2>
                  <p className="text-xs mt-0.5 opacity-80 font-medium">
                    Verified directly against authoritative WordPress MySQL user roles and REST permission_callbacks.
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                  Last Verified
                </div>
                <div className="text-xs font-bold font-mono">
                  {data.timestamp || 'Just now'}
                </div>
              </div>
            </div>

            {/* TABLE 1: CAPABILITY MATRIX TABLE */}
            <div className="bg-white rounded-3xl border border-[#EDEDED] shadow-apple-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#EDEDED] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-extrabold text-[#1D1D1F]">
                    Phase 24 — Capability Matrix Table (Guest, Tenant, Owner, Admin)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#86868B]">
                  GET /wp-json/apnastay/v1/permissions/matrix
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5F5F7]/70 border-b border-[#EDEDED] text-[11px] font-extrabold uppercase tracking-wider text-[#6E6E73]">
                      <th className="py-3.5 px-6">Action / Capability</th>
                      <th className="py-3.5 px-6 text-center">Guest</th>
                      <th className="py-3.5 px-6 text-center">Tenant</th>
                      <th className="py-3.5 px-6 text-center">Owner</th>
                      <th className="py-3.5 px-6 text-center">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDEDED] text-xs font-semibold text-[#1D1D1F]">
                    {data.matrix?.map((row) => (
                      <tr key={row.action} className="hover:bg-[#F9F9FB] transition-colors">
                        <td className="py-4 px-6 font-extrabold text-[#1D1D1F]">
                          {row.action}
                        </td>
                        {(['Guest', 'Tenant', 'Owner', 'Admin'] as const).map((role) => {
                          const cell = row.roles[role];
                          return (
                            <td key={role} className="py-4 px-6 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-extrabold shadow-sm ${
                                  cell.actual
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-gray-100 text-[#86868B]'
                                }`}
                              >
                                {cell.actual ? '✓' : '✗'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABLE 2: DIRECT REST API & BUSINESS RULE ASSERTIONS */}
            <div className="bg-white rounded-3xl border border-[#EDEDED] shadow-apple-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#EDEDED] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-extrabold text-[#1D1D1F]">
                    Direct REST API & Business Rule Security Assertions
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#86868B]">
                  10 Authoritative Backend Assertions
                </span>
              </div>

              <div className="divide-y divide-[#EDEDED]">
                {data.api_assertions?.map((item, idx) => (
                  <div key={idx} className="p-4 sm:px-6 flex items-center justify-between hover:bg-[#F9F9FB] transition-colors">
                    <div className="flex items-center gap-3">
                      {item.pass ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-[#1D1D1F]">
                          {item.test}
                        </div>
                        <div className="text-[11px] text-[#86868B]">
                          Authoritative PHP REST permission_callback assertion
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                        item.pass
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
