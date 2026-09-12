'use client';

import React, { useEffect } from 'react';
import {
  AlertTriangle,
  Archive,
  EyeOff,
  RotateCcw,
  Sparkles,
  X,
  Loader2
} from 'lucide-react';

export type LifecycleActionType = 'unpublish' | 'archive' | 'restore' | 'publish';

interface LifecycleConfirmationModalProps {
  isOpen: boolean;
  actionType: LifecycleActionType | null;
  propertyTitle: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isProcessing?: boolean;
  errorMessage?: string | null;
}

export default function LifecycleConfirmationModal({
  isOpen,
  actionType,
  propertyTitle,
  onConfirm,
  onCancel,
  isProcessing = false,
  errorMessage = null
}: LifecycleConfirmationModalProps) {
  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onCancel]);

  if (!isOpen || !actionType) return null;

  const getModalContent = () => {
    switch (actionType) {
      case 'unpublish':
        return {
          icon: <EyeOff className="w-6 h-6 text-amber-600" />,
          iconBg: 'bg-amber-50',
          title: 'Unpublish Listing?',
          description: `Are you sure you want to unpublish "${propertyTitle}"? It will no longer be visible to prospective tenants on ApnaStay, but all your units, photos, and configurations will be safely preserved. You can publish it again at any time.`,
          confirmText: 'Unpublish Listing',
          confirmButtonClass: 'bg-amber-600 hover:bg-amber-700 text-white'
        };
      case 'archive':
        return {
          icon: <Archive className="w-6 h-6 text-rose-600" />,
          iconBg: 'bg-rose-50',
          title: 'Archive Listing?',
          description: `Archive "${propertyTitle}"? This listing will be moved to your Archived tab and taken off the marketplace. All historical data and room structures will be preserved, and you can restore it anytime.`,
          confirmText: 'Archive Listing',
          confirmButtonClass: 'bg-rose-600 hover:bg-rose-700 text-white'
        };
      case 'restore':
        return {
          icon: <RotateCcw className="w-6 h-6 text-indigo-600" />,
          iconBg: 'bg-indigo-50',
          title: 'Restore Archived Listing?',
          description: `Restore "${propertyTitle}"? It will be returned to your active listings as an unpublished listing so you can review details before publishing it live.`,
          confirmText: 'Restore to Active',
          confirmButtonClass: 'bg-indigo-600 hover:bg-indigo-700 text-white'
        };
      case 'publish':
        return {
          icon: <Sparkles className="w-6 h-6 text-emerald-600" />,
          iconBg: 'bg-emerald-50',
          title: 'Publish Listing Live?',
          description: `Publish "${propertyTitle}"? It will become publicly visible and ready to receive inquiries from tenants on ApnaStay.`,
          confirmText: 'Publish Live',
          confirmButtonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white'
        };
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-[#86868B]" />,
          iconBg: 'bg-[#F5F5F7]',
          title: 'Confirm Action',
          description: 'Are you sure you want to proceed with this listing action?',
          confirmText: 'Confirm',
          confirmButtonClass: 'bg-[#1D1D1F] hover:bg-black text-white'
        };
    }
  };

  const content = getModalContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      {/* MODAL CARD */}
      <div
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#EDEDED] space-y-5 animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lifecycle-modal-title"
      >
        {/* HEADER WITH ICON & DISMISS */}
        <div className="flex items-start justify-between gap-4">
          <div className={`w-12 h-12 rounded-2xl ${content.iconBg} flex items-center justify-center shrink-0`}>
            {content.icon}
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-all disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TEXT CONTENT */}
        <div className="space-y-2 text-left">
          <h3 id="lifecycle-modal-title" className="text-lg sm:text-xl font-extrabold text-[#1D1D1F] tracking-tight">
            {content.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* ERROR DISPLAY */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-bold transition-all disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl ${content.confirmButtonClass} text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-60`}
          >
            {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{content.confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
