'use client';

import React from 'react';
import {
  Heart,
  Key,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  Bell,
  User,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
} from 'lucide-react';
import TenantDashboardShell from '../components/dashboard/TenantDashboardShell';

interface TenantSubPagePlaceholderProps {
  title: string;
  description: string;
  activeTab: string;
  badgeText?: string;
  iconType:
    | 'wishlist'
    | 'visits'
    | 'bookings'
    | 'payments'
    | 'agreements'
    | 'messages'
    | 'notifications'
    | 'profile';
}

export default function TenantSubPagePlaceholder({
  title,
  description,
  activeTab,
  badgeText = 'Tenant Feature',
  iconType,
}: TenantSubPagePlaceholderProps) {
  const getIcon = () => {
    switch (iconType) {
      case 'wishlist':
        return <Heart className="w-6 h-6 text-rose-500" />;
      case 'visits':
        return <Key className="w-6 h-6 text-amber-600" />;
      case 'bookings':
        return <Calendar className="w-6 h-6 text-blue-600" />;
      case 'payments':
        return <DollarSign className="w-6 h-6 text-emerald-600" />;
      case 'agreements':
        return <FileText className="w-6 h-6 text-indigo-600" />;
      case 'messages':
        return <MessageSquare className="w-6 h-6 text-purple-600" />;
      case 'notifications':
        return <Bell className="w-6 h-6 text-orange-600" />;
      case 'profile':
        return <User className="w-6 h-6 text-sky-600" />;
      default:
        return <Sparkles className="w-6 h-6 text-[#1D1D1F]" />;
    }
  };

  return (
    <TenantDashboardShell activeTab={activeTab}>
      <div className="space-y-6 animate-fade-in">
        {/* HEADER CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F5F5F7] flex items-center justify-center shrink-0 border border-[#EDEDED]">
              {getIcon()}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-[11px] font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{badgeText}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
                {title}
              </h1>
              <p className="text-xs text-[#86868B] mt-1 max-w-xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT PLACEHOLDER CARD */}
        <div className="bg-white rounded-3xl p-8 border border-[#EDEDED] shadow-apple-sm flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-4 text-[#86868B]">
            {getIcon()}
          </div>
          <h3 className="font-bold text-[#1D1D1F] text-base mb-1">
            {title} — Tenant Module Ready
          </h3>
          <p className="text-xs text-[#86868B] max-w-md mx-auto mb-6 leading-relaxed">
            This module is securely authenticated for <span className="font-bold">ownstay_tenant</span> capabilities. You have full access to manage your zero-brokerage rental journey.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F5F5F7] text-[#6E6E73] text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Role-Based Access Control Active</span>
          </div>
        </div>
      </div>
    </TenantDashboardShell>
  );
}
