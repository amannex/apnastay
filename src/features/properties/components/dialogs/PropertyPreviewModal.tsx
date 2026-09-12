'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, Edit3, ExternalLink } from 'lucide-react';
import type { Property } from '../../types';
import PropertyTenantPreview from '../preview/PropertyTenantPreview';

interface PropertyPreviewModalProps {
  isOpen: boolean;
  property: Property | null;
  onClose: () => void;
}

export default function PropertyPreviewModal({
  isOpen,
  property,
  onClose
}: PropertyPreviewModalProps) {
  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !property) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-[#EDEDED] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDEDED] bg-[#F5F5F7]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5 truncate mr-3">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">
              Tenant View Preview
            </span>
            <span className="text-[#86868B]">•</span>
            <h2
              id="preview-modal-title"
              className="text-sm sm:text-base font-extrabold text-[#1D1D1F] truncate"
            >
              {property.title || 'Untitled Property'}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/owner/dashboard/properties/new?draftId=${encodeURIComponent(property.id)}&step=10`}
              className="px-3.5 py-1.5 rounded-xl border border-[#EDEDED] bg-white hover:bg-[#F5F5F7] text-xs font-bold text-[#1D1D1F] inline-flex items-center gap-1.5 transition-all shadow-apple-xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#86868B]" />
              <span className="hidden sm:inline">Edit in Wizard</span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#EDEDED] transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE PREVIEW VIEWPORT */}
        <div className="p-4 sm:p-8 overflow-y-auto max-h-[calc(90vh-70px)] scrollbar-none bg-[#FAFAFA]">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm">
            <PropertyTenantPreview property={property} />
          </div>
        </div>
      </div>
    </div>
  );
}
