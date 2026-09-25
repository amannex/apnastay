'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Copy, MessageCircle, Share2, ExternalLink } from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface PropertyShareModalProps {
  property: NormalizedProperty;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyShareModal({
  property,
  isOpen,
  onClose
}: PropertyShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shareText = `Check out "${property.title}" in ${property.location.displayLocation} (₹${property.pricing.monthlyRent.toLocaleString()}/mo) on ApnaStay — India's Zero-Brokerage Platform: ${shareUrl}`;

  const handleCopy = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out ${property.title} in ${property.location.displayLocation} on ApnaStay!`,
          url: shareUrl
        });
        onClose();
      } catch (err) {
        // User cancelled or share failed
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-[#E1224D]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="share-modal-title" className="text-lg font-bold text-gray-900">
                Share this Property
              </h2>
              <p className="text-xs text-gray-500">
                Send to friends, roommates, or family
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            aria-label="Close share dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Property Preview Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
          <img
            src={property.coverImage}
            alt={property.title}
            className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-gray-900 truncate">
              {property.title}
            </h3>
            <p className="text-[11px] text-gray-500 truncate mt-0.5">
              {property.location.displayLocation}
            </p>
            <p className="text-xs font-extrabold text-[#E1224D] mt-0.5">
              ₹{property.pricing.monthlyRent.toLocaleString()}{' '}
              <span className="text-[10px] text-gray-500 font-normal">/ month</span>
            </p>
          </div>
        </div>

        {/* Sharing Actions */}
        <div className="space-y-3">
          {/* WhatsApp Direct Share */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Share via WhatsApp</span>
          </button>

          {/* Native Device Share (when supported) */}
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>More Share Options</span>
            </button>
          )}

          {/* Copy Link Section */}
          <div className="pt-2">
            <label htmlFor="share-link-input" className="block text-xs font-bold text-gray-700 mb-1.5">
              Copy Direct Link
            </label>
            <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-gray-200 bg-gray-50/80 focus-within:border-gray-900 transition-colors">
              <input
                id="share-link-input"
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent px-2.5 text-xs text-gray-700 focus:outline-hidden truncate"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`py-2 px-3.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#1A1A1A] hover:bg-black text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-[11px] font-semibold text-emerald-700 mt-1.5 flex items-center gap-1 animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                Link copied to clipboard!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
