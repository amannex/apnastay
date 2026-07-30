import React, { useState } from 'react';
import { Smartphone, Bell, CheckCircle2, Sparkles, ArrowRight, Download } from 'lucide-react';

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
    <section className="py-16 bg-gradient-to-b from-[#FAFAFA] to-white border-t border-gray-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#1A1A1A] via-[#222222] to-[#1A1A1A] text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-white/10 overflow-hidden">
          
          {/* Subtle Ambient Glow Behind Card */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#E1224D]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E1224D]/20 border border-[#E1224D]/40 text-[#FF4D73] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Mobile App Coming Soon</span>
              </div>

              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Take OwnStay With You — <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                  Launching Soon on Google Play
                </span>
              </h2>

              {/* Description */}
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Experience immersive 3D virtual room walkthroughs, instant owner chat, and our AI Lifestyle Matchmaker right from your pocket. Get notified the moment we go live on the Android Google Play Store.
              </p>

              {/* Feature Tags */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-200 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>100% Zero-Brokerage</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-200 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Instant Price Drop Alerts</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-200 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Pocket 3D Walkthroughs</span>
                </div>
              </div>

              {/* Notify Me Input / Confirmation */}
              <div className="pt-3">
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

            </div>

            {/* Right Column - Google Play Badge & Visual Card (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-white/10 to-white/5 p-6 border border-white/15 backdrop-blur-xl shadow-2xl text-center space-y-5">
                
                {/* Phone Icon Graphic */}
                <div className="w-16 h-16 rounded-2xl bg-[#E1224D] flex items-center justify-center mx-auto shadow-apple">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-[#FF4D73] uppercase tracking-wider">
                    Android Release • Q3 2026
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    OwnStay App for Android
                  </h3>
                  <p className="text-xs text-gray-300">
                    Optimized for India&apos;s fastest mobile networks. 60 FPS 3D room walkthroughs on Android.
                  </p>
                </div>

                {/* Google Play Badge Graphic */}
                <div className="pt-2">
                  <div className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-black/60 border border-white/20 hover:border-white/40 transition-all cursor-default shadow-md w-full">
                    {/* Play Store Triangle Symbol */}
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-yellow-400 via-red-500 to-blue-500 flex items-center justify-center shrink-0">
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
                </div>

                <div className="text-[11px] text-gray-400 pt-1">
                  ⭐ Join 5,000+ tenants already on the VIP waitlist
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
