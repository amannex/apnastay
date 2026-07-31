'use client';

import React, { useState } from 'react';
import { X, Sparkles, MapPin, DollarSign, Briefcase, Sun, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AiMatchmakerModal({
  isOpen,
  onClose,
  cities = [] as any[],
  properties = [] as any[],
  onSelectProperty
}: any) {
  const [step, setStep] = useState(1);
  const [targetCity, setTargetCity] = useState(cities[0]?.name || 'Indore');
  const [budget, setBudget] = useState(25000);
  const [commuteTarget, setCommuteTarget] = useState('Tech Hub');
  const [lifestyle, setLifestyle] = useState('Quiet WFH & Acoustics');
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  if (!isOpen) return null;

  const lifestyleOptions = [
    { id: 'Quiet WFH & Acoustics', label: 'Quiet WFH & Acoustics', icon: '🔇', desc: 'Soundproofed double-glazing & fiber' },
    { id: 'Natural Light & Balconies', label: 'Natural Light & Balconies', icon: '☀️', desc: 'Floor-to-ceiling glass & sunsets' },
    { id: 'Transit & Gym Proximity', label: 'Transit & Gym Proximity', icon: '🚇', desc: 'Under 5 min walk to Metro & fitness' }
  ];

  const handleRunAiMatch = () => {
    setIsCalculating(true);
    setTimeout(() => {
      // Score properties based on city and budget
      const scored = properties
        .map((p) => {
          let score = p.aiAttributes?.matchScore || 90;
          if (p.city === targetCity) score += 4;
          if (p.price <= budget) score += 3;
          return { ...p, calculatedScore: Math.min(score, 99) };
        })
        .sort((a, b) => b.calculatedScore - a.calculatedScore)
        .slice(0, 3);

      setResults(scored);
      setIsCalculating(false);
      setStep(4); // Show Results Step
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-slide-up">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-apple-lg border border-[#EDEDED] overflow-hidden p-6 sm:p-8">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-6 border-b border-[#EDEDED]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center text-[#E1224D]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A]">
                OwnStay AI Matchmaker
              </h2>
              <p className="text-xs text-[#6B7280]">
                Algorithmically matched to your commute, acoustics & lifestyle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-[#FAFAFA] hover:bg-[#EDEDED] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP PROGRESS BAR */}
        {step < 4 && (
          <div className="my-6">
            <div className="flex items-center justify-between text-xs font-bold text-[#6B7280] mb-2">
              <span>Step {step} of 3</span>
              <span className="text-[#E1224D]">
                {step === 1 ? 'City & Budget' : step === 2 ? 'Commute Target' : 'Lifestyle Priority'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#FAFAFA] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E1224D] transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* WIZARD STEP 1: CITY & BUDGET */}
        {step === 1 && (
          <div className="space-y-6 my-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2">
                1. Which City Are You Moving To?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cities.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setTargetCity(c.name)}
                    className={`p-3.5 rounded-2xl border text-left text-sm font-semibold transition-all ${
                      targetCity === c.name
                        ? 'border-[#E1224D] bg-rose-50 text-[#E1224D] shadow-sm'
                        : 'border-[#EDEDED] bg-[#FAFAFA] text-[#1A1A1A] hover:border-[#1A1A1A]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Max Monthly Budget ($0 brokerage)
                </label>
                <span className="text-sm font-bold text-[#E1224D]">${budget}/mo</span>
              </div>
              <input
                type="range"
                min="1300"
                max="3000"
                step="100"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-[#EDEDED] rounded-lg appearance-none cursor-pointer accent-[#E1224D]"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-full bg-[#E1224D] text-white font-semibold text-sm shadow-apple hover:bg-[#C71B42] transition-all flex items-center justify-center gap-2"
            >
              Next: Commute Preferences →
            </button>
          </div>
        )}

        {/* WIZARD STEP 2: COMMUTE TARGET */}
        {step === 2 && (
          <div className="space-y-6 my-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-3">
                2. Where is your office or primary destination?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Tech Hub / SOMA', 'Financial District / City', 'Midtown / Downtown', '100% Remote / WFH'].map(
                  (loc) => (
                    <button
                      key={loc}
                      onClick={() => setCommuteTarget(loc)}
                      className={`p-4 rounded-2xl border text-left font-semibold transition-all ${
                        commuteTarget === loc
                          ? 'border-[#E1224D] bg-rose-50 text-[#E1224D] shadow-sm'
                          : 'border-[#EDEDED] bg-[#FAFAFA] text-[#1A1A1A] hover:border-[#1A1A1A]'
                      }`}
                    >
                      {loc}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="py-3.5 px-6 rounded-full bg-[#FAFAFA] text-[#1A1A1A] font-semibold text-sm hover:bg-[#EDEDED] transition-all"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 rounded-full bg-[#E1224D] text-white font-semibold text-sm shadow-apple hover:bg-[#C71B42] transition-all"
              >
                Next: Lifestyle Priority →
              </button>
            </div>
          </div>
        )}

        {/* WIZARD STEP 3: LIFESTYLE PRIORITY */}
        {step === 3 && (
          <div className="space-y-6 my-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-3">
                3. What matters most to your daily happiness?
              </label>
              <div className="space-y-3">
                {lifestyleOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setLifestyle(opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                      lifestyle === opt.id
                        ? 'border-[#E1224D] bg-rose-50 text-[#E1224D] shadow-sm'
                        : 'border-[#EDEDED] bg-[#FAFAFA] text-[#1A1A1A] hover:border-[#1A1A1A]'
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className="font-bold">{opt.label}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(2)}
                className="py-3.5 px-6 rounded-full bg-[#FAFAFA] text-[#1A1A1A] font-semibold text-sm hover:bg-[#EDEDED] transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleRunAiMatch}
                disabled={isCalculating}
                className="flex-1 py-3.5 rounded-full bg-[#E1224D] text-white font-semibold text-sm shadow-apple hover:bg-[#C71B42] transition-all flex items-center justify-center gap-2"
              >
                {isCalculating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Calculating Acoustics & Commute AI Score...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Calculate My AI Room Match
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: AI MATCH RESULTS */}
        {step === 4 && (
          <div className="space-y-6 my-4">
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E1224D]">
                  OwnStay AI Recommendation Report
                </span>
                <p className="text-xs font-semibold text-[#1A1A1A] mt-0.5">
                  Targeting {targetCity} • Budget ₹{budget}/mo • {commuteTarget} • {lifestyle}
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs font-bold text-[#E1224D] hover:underline"
              >
                Change filters
              </button>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {results.map((prop, idx) => (
                <div
                  key={prop.id}
                  onClick={() => {
                    onClose();
                    onSelectProperty(prop);
                  }}
                  className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#EDEDED] hover:border-[#E1224D] transition-all cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={prop.images[0]}
                      alt={prop.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-[#E1224D] text-white text-[10px] font-bold">
                          #{idx + 1} • {prop.calculatedScore}% Match
                        </span>
                        <span className="text-xs text-[#6B7280]">{prop.neighborhood}</span>
                      </div>
                      <h4 className="text-base font-bold text-[#1A1A1A] mt-1 group-hover:text-[#E1224D] transition-colors">
                        {prop.title}
                      </h4>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        ${prop.price}/mo • $0 brokerage
                      </p>
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-white group-hover:bg-[#E1224D] group-hover:text-white text-[#1A1A1A] flex items-center justify-center transition-colors border">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-full bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-black transition-colors"
            >
              Close & Explore Listings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
