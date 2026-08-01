'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Wifi,
  Wrench,
  HeartHandshake,
  FileText,
  PhoneCall,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const MANAGED_PILLARS = [
  {
    icon: ShieldCheck,
    title: '1-Month Security Deposit',
    description: 'Pay just 1 month deposit with a 100% online money-back guarantee within 48 hours of move-out.'
  },
  {
    icon: Sparkles,
    title: 'Weekly Housekeeping',
    description: 'Professional room cleaning, linen replacement, and washroom sanitization included at no extra cost.'
  },
  {
    icon: Wrench,
    title: '4-Hour Maintenance SLA',
    description: 'Electrical, plumbing, AC, or carpentry repairs resolved in under 4 business hours via our in-app tickets.'
  },
  {
    icon: Wifi,
    title: '300 Mbps FTTH Wi-Fi',
    description: 'High-speed optical fiber Wi-Fi pre-installed and activated before you walk into your room.'
  },
  {
    icon: HeartHandshake,
    title: 'Direct Owner • ₹0 Brokerage',
    description: 'Chat directly with verified Indian landlords and save ₹15,000 to ₹30,000 in brokerage fees.'
  },
  {
    icon: FileText,
    title: 'Free Aadhaar E-Sign Agreement',
    description: 'Instant legally binding digital rental agreement valid for passport address proof and HRA tax claims.'
  }
];

export default function ManagedServicesShowcase() {
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Jaipur');
  const [submitted, setSubmitted] = useState(false);

  const handleCallbackSubmit = (e) => {
    e.preventDefault();
    if (phone.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section className="py-20 bg-[#FAFAFA] border-t border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* CLEAN MINIMAL HEADER */}
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold text-[#E1224D] uppercase tracking-wider">
            The OwnStay Advantage
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-1">
            Managed living comfort with zero brokerage.
          </h2>
        </div>

        {/* MINIMALIST 3-COLUMN GRID (MAX-W-7XL) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-28">
          {MANAGED_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-200/80 hover:border-gray-300 transition-all duration-300 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-rose-50 text-[#E1224D] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-bold text-gray-900 tracking-tight mb-1.5">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULL WIDTH INSPIRED CTA FORM BANNER (100% Edge-to-Edge, No Divider) */}
      <div className="w-full bg-[#0F131A] text-white py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E1224D]/20 border border-[#E1224D]/40 text-[#FF4D73] text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
              <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
              <span>Free Instant Tenant Callback • Zero Brokerage</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Looking for a verified home in Jaipur, Indore or Chandigarh?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-2">
              Enter your mobile number to get a free callback from our local city manager within 15 minutes. We arrange keyless self-tours and zero-brokerage visits.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>₹0 Commission</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>25-Point Engineering Check</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Refundable Deposit</span>
              </span>
            </div>
          </div>

          {/* INSTANT CALLBACK CTA FORM */}
          <div className="w-full lg:w-auto shrink-0">
            {submitted ? (
              <div className="bg-white/10 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-6 text-center min-w-[320px]">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-base font-bold text-white">Callback Requested!</h4>
                <p className="text-xs text-gray-300 mt-1">
                  Our {city} city manager will call you at <strong>+91 {phone}</strong> shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs font-bold text-[#E1224D] hover:underline"
                >
                  Enter another number
                </button>
              </div>
            ) : (
              <form onSubmit={handleCallbackSubmit} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl">
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                      Select Your City
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#E1224D]"
                    >
                      <option value="Jaipur">Jaipur (Malviya Nagar, Mansarovar)</option>
                      <option value="Indore">Indore (Vijay Nagar, IT Park)</option>
                      <option value="Chandigarh">Chandigarh (Sector 17, 35, Mohali)</option>
                      <option value="Coimbatore">Coimbatore (RS Puram, Saravanampatti)</option>
                      <option value="Kochi">Kochi (Kakkanad, Infopark)</option>
                      <option value="Pune">Pune (Koregaon Park, Kharadi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                      Your WhatsApp / Mobile Number
                    </label>
                    <div className="flex items-center rounded-xl bg-gray-800 border border-white/10 overflow-hidden">
                      <span className="px-3 py-2.5 bg-gray-700/50 text-gray-400 text-xs font-bold border-r border-white/10">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-transparent text-white text-xs font-semibold placeholder-gray-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-1 py-3 px-6 rounded-xl bg-[#E1224D] hover:bg-[#C71B42] text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Get Free Callback in 15 Mins</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
