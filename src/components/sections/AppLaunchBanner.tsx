'use client';

import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Download,
  MapPin,
  Search,
  Heart,
  Home,
  MessageCircle,
  SlidersHorizontal,
  Star,
  ShieldCheck,
  Eye
} from 'lucide-react';

export default function AppLaunchBanner() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="w-full py-20 bg-gradient-to-r from-[#0F131A] via-[#151A24] to-[#0F131A] text-white border-y border-white/10 relative overflow-hidden">
      {/* Subtle Ambient Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E1224D]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Content Column (7 cols) */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E1224D]/20 border border-[#E1224D]/40 text-[#FF4D73] text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Mobile App Coming Soon</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Take OwnStay With You — <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                Launching Soon on Google Play
              </span>
            </h2>

            {/* Description */}
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Experience immersive 60 FPS 3D room walkthroughs, instant owner chat, and our AI Lifestyle Matchmaker right from your pocket. Get notified the moment we go live on the Android Google Play Store.
            </p>

            {/* Feature Tags */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-200 bg-white/5 px-3.5 py-2 rounded-full border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>100% Zero-Brokerage</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-200 bg-white/5 px-3.5 py-2 rounded-full border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Instant Price Drop Alerts</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-200 bg-white/5 px-3.5 py-2 rounded-full border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Pocket 3D Walkthroughs</span>
              </div>
            </div>

            {/* Notify Me Input / Confirmation */}
            <div className="pt-2">
              {isSubscribed ? (
                <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold text-sm animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>You&apos;re on the VIP waitlist! We&apos;ll notify you on Play Store launch day.</span>
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto lg:mx-0">
                  <div className="relative w-full">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email for launch invite..."
                      className="w-full px-5 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-[#E1224D] focus:ring-2 focus:ring-[#E1224D]/30 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#E1224D] hover:bg-[#C71B42] text-white font-bold text-sm shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 shrink-0"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Notify Me</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Google Play Store Badge Section */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-black/80 border border-white/20 hover:border-white/40 transition-all cursor-default shadow-md">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-yellow-400 via-red-500 to-blue-500 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                    Coming Soon On
                  </div>
                  <div className="text-sm font-bold text-white leading-tight">
                    Google Play Store
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 inline" />
                <span>Join 5,000+ tenants already on the waitlist</span>
              </div>
            </div>

          </div>

          {/* Right Column - Premium High-Fidelity Mobile App UI (5 cols) */}
          <div className="lg:col-span-5 flex items-center justify-center relative pt-6 lg:pt-0">
            
            {/* Floating Badge Top-Right */}
            <div className="absolute -top-3 -right-2 sm:right-6 z-20 bg-gray-900/90 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs font-bold text-white">₹0 Brokerage Guaranteed</span>
            </div>

            {/* Floating Badge Bottom-Left */}
            <div className="absolute -bottom-4 -left-2 sm:left-4 z-20 bg-gray-900/90 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#E1224D]" />
              <span className="text-xs font-bold text-white">60 FPS 3D Virtual Tour</span>
            </div>

            {/* Smartphone Chassis Mockup */}
            <div className="w-full max-w-[310px] sm:max-w-[330px] rounded-[3rem] bg-gray-950 border-4 border-gray-800 shadow-2xl p-3 relative overflow-hidden">
              
              {/* Top Notch / Speaker Pill */}
              <div className="w-24 h-5 bg-black rounded-full mx-auto mb-3 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gray-800/80 mr-2" />
                <div className="w-2 h-2 rounded-full bg-blue-500/80 animate-pulse" />
              </div>

              {/* Mobile App UI Screen */}
              <div className="rounded-[2.2rem] bg-[#FAFAFA] text-gray-900 overflow-hidden border border-gray-200/60 shadow-inner flex flex-col justify-between min-h-[500px]">
                
                {/* App Screen Header */}
                <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#E1224D]" />
                    <div className="text-left">
                      <div className="text-[10px] text-gray-400 font-semibold uppercase leading-none">Location</div>
                      <div className="text-xs font-bold text-gray-900">Jaipur • Malviya Nagar</div>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center relative">
                    <Bell className="w-3.5 h-3.5 text-[#E1224D]" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E1224D]" />
                  </div>
                </div>

                {/* App Search Bar */}
                <div className="px-4 pt-3">
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-full bg-gray-100/80 border border-gray-200/60 text-gray-500 text-xs">
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium">Search &quot;2 BHK Zero Brokerage&quot;</span>
                    </div>
                    <SlidersHorizontal className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                </div>

                {/* Category Pills */}
                <div className="px-4 pt-3 flex items-center gap-2 overflow-hidden">
                  <span className="px-3 py-1 rounded-full bg-[#E1224D] text-white text-[11px] font-bold shrink-0">
                    All Homes
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 text-[11px] font-semibold shrink-0">
                    3D Tours
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 text-[11px] font-semibold shrink-0">
                    Co-Living
                  </span>
                </div>

                {/* Featured App Property Card */}
                <div className="p-4 flex-1 flex flex-col justify-center">
                  <div className="bg-white rounded-2xl border border-gray-200/80 p-3 shadow-sm space-y-3">
                    
                    {/* Simulated Image Area */}
                    <div className="h-32 rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative p-2.5 flex flex-col justify-between overflow-hidden">
                      {/* Decorative Background Pattern */}
                      <div className="absolute inset-0 bg-[radial-gradient(#E1224D_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
                      
                      <div className="flex items-center justify-between relative z-10">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-extrabold uppercase tracking-wide">
                          ₹0 Brokerage
                        </span>
                        <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                          <Heart className="w-3 h-3 text-white fill-white" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between relative z-10">
                        <span className="px-2 py-0.5 rounded-md bg-[#E1224D] text-white text-[9px] font-bold flex items-center gap-1">
                          <Eye className="w-2.5 h-2.5" />
                          3D TOUR
                        </span>
                        <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                          ★ 4.9 (128)
                        </span>
                      </div>
                    </div>

                    {/* Card Title & Price */}
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-900">Luxury Studio Apartment</h4>
                        <span className="text-xs font-extrabold text-[#E1224D]">₹14,500<span className="text-[9px] text-gray-500 font-normal">/mo</span></span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">Malviya Nagar, Jaipur • Direct Owner</p>
                    </div>

                    {/* App Action Button */}
                    <div className="pt-1">
                      <div className="w-full py-2 rounded-xl bg-[#E1224D] text-white text-[11px] font-bold text-center shadow-xs">
                        Book Instant Keyless Visit
                      </div>
                    </div>

                  </div>
                </div>

                {/* App Bottom Nav Bar */}
                <div className="bg-white px-6 py-2.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-semibold">
                  <div className="flex flex-col items-center gap-1 text-[#E1224D]">
                    <Home className="w-4 h-4" />
                    <span>Explore</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>Saved</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>3D Tours</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                  </div>
                </div>

              </div>

              {/* Home Bar Indicator */}
              <div className="w-28 h-1 bg-gray-700 rounded-full mx-auto mt-2" />

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
