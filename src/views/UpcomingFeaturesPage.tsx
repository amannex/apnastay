'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Smartphone,
  Bot,
  Volume2,
  ShieldCheck,
  SplitSquareVertical,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Bell,
  Clock,
  Zap,
  Layers,
  Send
} from 'lucide-react';

interface FeatureItem {
  id: string;
  title: string;
  category: string;
  status: 'Beta Testing' | 'In Development' | 'Coming Soon';
  statusColor: string;
  icon: any;
  summary: string;
  highlights: string[];
  eta: string;
}

export default function UpcomingFeaturesPage() {
  const [filter, setFilter] = useState<string>('All');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const features: FeatureItem[] = [
    {
      id: 'mobile-app',
      title: 'Native Mobile App (Android & iOS)',
      category: 'Smart Mobility',
      status: 'Beta Testing',
      statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      icon: Smartphone,
      summary: 'Take your home key everywhere. Turn your phone into an encrypted NFC smart-lock keycard, receive instant visit notifications, and pay rent in one tap.',
      highlights: [
        'NFC & Bluetooth Smart-Lock Instant Unlocking',
        'Real-time rent payment ledger & autopay alerts',
        'Direct encrypted chat with verified owners',
        'Offline fallback emergency passkeys'
      ],
      eta: 'Q2 2026'
    },
    {
      id: 'ai-matchmaker',
      title: 'AI Roommate & Lifestyle Matchmaker 2.0',
      category: 'Artificial Intelligence',
      status: 'In Development',
      statusColor: 'bg-blue-50 text-blue-600 border-blue-200',
      icon: Bot,
      summary: 'Speak your living preferences in natural English or Hindi. Find flatmates with matching dietary habits, work shifts, and commute routes to Tier-2 IT corridors.',
      highlights: [
        'Conversational natural language search',
        'Commute distance optimizer for Indian tech hubs',
        'Lifestyle compatibility scoring (85%+ accuracy)',
        'Verified corporate and college badges'
      ],
      eta: 'Q3 2026'
    },
    {
      id: 'spatial-noise',
      title: '360° LiDAR Scans & Acoustic Decibel Heatmaps',
      category: 'Engineering Verification',
      status: 'Beta Testing',
      statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      icon: Volume2,
      summary: 'Experience the quietness of your bedroom before stepping foot inside. Every audited home features verified decibel (dB) noise meters and 3D spatial models.',
      highlights: [
        'Day and night decibel (dB) ambient audio metrics',
        'Sunlight and natural ventilation trajectory simulation',
        'High-resolution spatial LiDAR floor plans',
        'Acoustic wall insulation certification'
      ],
      eta: 'Piloting in Indore & Pune'
    },
    {
      id: 'smart-escrow',
      title: 'RBI-Compliant Digital Security Deposit Escrow',
      category: 'Fintech & Trust',
      status: 'In Development',
      statusColor: 'bg-blue-50 text-blue-600 border-blue-200',
      icon: ShieldCheck,
      summary: 'Never worry about security deposit deductions again. Your deposit is safeguarded in a regulated escrow account with a guaranteed 24-hour move-out clearance.',
      highlights: [
        'Direct RBI-regulated digital escrow protection',
        'Automated photographic move-in vs move-out inspection',
        'Guaranteed refund turnaround within 24 hours',
        'Zero unfair landlord deductions'
      ],
      eta: 'Q3 2026'
    },
    {
      id: 'split-rent',
      title: 'Flatmate Split-Rent & Shared Expense Autopay',
      category: 'Billing & Utilities',
      status: 'Coming Soon',
      statusColor: 'bg-purple-50 text-purple-600 border-purple-200',
      icon: SplitSquareVertical,
      summary: 'Share a 2BHK or 3BHK flat without chasing flatmates for their rent share. Automated multi-tenant split payments deposited directly to the landlord.',
      highlights: [
        'Individual UPI Autopay mandates per roommate',
        'Automated split utility and Wi-Fi bills',
        'Individual HRA rent receipts for tax claims',
        'Transparent ledger for all household expenses'
      ],
      eta: 'Q4 2026'
    },
    {
      id: 'iot-owner-hub',
      title: 'Owner Smart IoT & Preventative Maintenance Hub',
      category: 'Property Management',
      status: 'Coming Soon',
      statusColor: 'bg-purple-50 text-purple-600 border-purple-200',
      icon: Cpu,
      summary: 'Smart diagnostics for property owners. Monitor power backup health, sub-meter water flow, and resolve maintenance tickets before they turn into complaints.',
      highlights: [
        'Smart sub-meter consumption telemetrics',
        'Instant leak detection & water pressure alerts',
        'One-click local maintenance technician dispatch',
        'Predictive maintenance cost analytics'
      ],
      eta: 'Late 2026'
    }
  ];

  const filteredFeatures =
    filter === 'All' ? features : features.filter((f) => f.status === filter);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HERO SECTION */}
        <div className="py-12 border-b border-[#EDEDED] mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-4 border border-rose-100">
            <Sparkles className="w-3.5 h-3.5" />
            Product Roadmap 2026
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1A1A1A] mb-4">
            Upcoming Features on ApnaStay.
          </h1>
          <p className="text-[#6B7280] text-base sm:text-lg leading-relaxed">
            We are engineering the modern standard for residential living in India. Take a look at the groundbreaking technologies and smart tools rolling out to our users next.
          </p>

          {/* FILTER BUTTONS */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {['All', 'Beta Testing', 'In Development', 'Coming Soon'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  filter === cat
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm'
                    : 'bg-white text-[#6B7280] border-[#EDEDED] hover:border-[#D1D5DB] hover:text-[#1A1A1A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FEATURE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {filteredFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="bg-white rounded-3xl p-7 border border-[#EDEDED] shadow-apple-sm hover:shadow-apple-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  {/* Top Bar with Category & Status */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      {feature.category}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${feature.statusColor}`}
                    >
                      {feature.status}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#E1224D] flex items-center justify-center mb-4 group-hover:bg-[#E1224D] group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed mb-6">
                    {feature.summary}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-2 mb-6">
                    {feature.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-[#374151]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer with ETA */}
                <div className="pt-4 border-t border-[#F3F4F6] flex items-center justify-between text-xs text-[#6B7280]">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#E1224D]" />
                    <span>Target: {feature.eta}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#E1224D] uppercase tracking-wider">
                    Roadmap
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* EARLY ACCESS BETA REGISTRATION */}
        <div className="bg-gradient-to-br from-[#1A1A1A] via-[#242A35] to-[#1A1A1A] rounded-3xl p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-apple-lg max-w-4xl mx-auto mb-16">
          <div className="max-w-2xl mx-auto relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
              <Zap className="w-3.5 h-3.5 text-[#E1224D]" />
              Join the Beta Program
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              Be the first to test upcoming features.
            </h2>
            <p className="text-white/80 text-xs sm:text-sm mb-8 leading-relaxed">
              Sign up for priority invites to test the ApnaStay Android & iOS apps, AI Matchmaker 2.0, and instant digital escrow refunds before general release.
            </p>

            {submitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>You're on the priority invite list! We'll notify you soon.</span>
              </div>
            ) : (
              <form onSubmit={handleNotify} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 text-xs sm:text-sm focus:outline-none focus:border-[#E1224D] focus:bg-white/15 transition-all"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#E1224D] hover:bg-[#C71B42] text-white font-bold text-xs sm:text-sm shadow-apple transition-all shrink-0 flex items-center justify-center gap-2 hover:scale-105"
                >
                  <span>Notify Me</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* QUICK NAVIGATION BANNER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-[#EDEDED] shadow-apple-sm">
          <div>
            <h4 className="text-sm font-bold text-[#1A1A1A]">Looking for a verified home right now?</h4>
            <p className="text-xs text-[#6B7280]">Browse 1,200+ engineering-audited rooms in Tier-2 Indian hubs.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/properties"
              className="px-5 py-2.5 rounded-full bg-[#E1224D] text-white text-xs font-bold hover:bg-[#C71B42] transition-colors shadow-sm"
            >
              Find ApnaStay
            </Link>
            <Link
              href="/owner/dashboard/properties/new"
              className="px-5 py-2.5 rounded-full bg-[#FAFAFA] border border-[#EDEDED] text-[#1A1A1A] text-xs font-bold hover:bg-[#EDEDED] transition-colors"
            >
              List ApnaStay
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
