'use client';

import React, { useState } from 'react';
import {
  X,
  PhoneCall,
  MessageCircle,
  ShieldCheck,
  Clock,
  Send,
  User,
  CheckCircle2
} from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface ContactOwnerModalProps {
  property: NormalizedProperty;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactOwnerModal({
  property,
  isOpen,
  onClose
}: ContactOwnerModalProps) {
  const [message, setMessage] = useState(
    `Hi ${property.owner.name}, I'm interested in renting "${property.title}" in ${property.location.displayLocation} (₹${property.pricing.monthlyRent.toLocaleString()}/mo). Is it still available?`
  );
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Listen for Escape key to close modal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      // Keep confirmation visible briefly
    }, 2000);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919876543210?text=${encoded}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = 'tel:+919876543210';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Contact owner of ${property.title}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full shadow-apple-xl border border-gray-100 overflow-hidden relative animate-scale-up"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ED3258]">
              Direct Owner Lease
            </span>
            <h3 className="text-xl font-extrabold text-[#1A1A1A] mt-0.5">
              Contact Property Owner
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200/60 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="Close contact modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Owner Profile Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAFAFA] border border-gray-100">
            {property.owner.avatar ? (
              <img
                src={property.owner.avatar}
                alt={property.owner.name}
                className="w-13 h-13 rounded-2xl object-cover border border-gray-200"
              />
            ) : (
              <div className="w-13 h-13 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-[#ED3258]">
                <User className="w-6 h-6" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-[#1A1A1A] truncate">
                  {property.owner.name}
                </h4>
                {property.owner.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280] flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#ED3258]" />
                <span>Response time: {property.owner.responseTime}</span>
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">
                Inquiry Sent to {property.owner.name}!
              </h4>
              <p className="text-xs sm:text-sm text-[#6B7280] max-w-sm mx-auto">
                The owner has received your request. You will also receive an SMS/WhatsApp confirmation shortly.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold hover:bg-black transition-colors"
              >
                Close Window
              </button>
            </div>
          ) : (
            <>
              {/* Direct Actions: WhatsApp & Call */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCall}
                  className="py-3 px-4 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Owner</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider absolute">
                  or send message
                </span>
              </div>

              {/* Inquiry Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#ED3258] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#ED3258] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#ED3258] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#ED3258] hover:bg-[#C71B42] text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message to Owner</span>
                </button>
              </form>
            </>
          )}
        </div>

        {/* Security / Privacy Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>₹0 Brokerage direct owner connection • Spam-free guarantee</span>
          </p>
        </div>
      </div>
    </div>
  );
}
