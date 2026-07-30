import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Building,
  DoorOpen,
  Home,
  BedDouble,
  Sun,
  ArrowRight,
  Maximize2,
  Volume2,
  VolumeX,
  Sparkles,
  Video,
  Eye,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';

// 8 Photorealistic 2D Walkthrough Chapters (Building -> Gallery -> Corridor -> Door -> Hall -> Bedroom/WFH -> Kitchen -> Balcony)
const VIDEO_CHAPTERS = [
  {
    id: 'building',
    chapter: 1,
    timeLabel: '00:00',
    durationSec: 5,
    title: '01. Realistic Building Exterior',
    subtitle: 'Architectural residential towers in Indore, Jaipur & Coimbatore tech corridors.',
    location: 'Indore IT SEZ • Tower #IND-804',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1800&q=85',
    icon: Building,
    tag: 'Exterior Facade • Seismic Grade IV',
    badge: '₹0 Brokerage Guaranteed'
  },
  {
    id: 'gallery',
    chapter: 2,
    timeLabel: '00:05',
    durationSec: 5,
    title: '02. Entrance & Glass Gallery',
    subtitle: '24/7 concierge lobby with digital KYC verification and art gallery corridor.',
    location: 'Main Lobby & Reception',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
    icon: ShieldCheck,
    tag: '25-Point Inspection Passed',
    badge: 'Biometric Security'
  },
  {
    id: 'corridor',
    chapter: 3,
    timeLabel: '00:10',
    durationSec: 5,
    title: '03. Naturally Lit Corridor',
    subtitle: 'Warm recessed LED lighting, walnut flooring, and 32dB acoustic soundproofing.',
    location: 'Level 4 Residence Corridor',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1800&q=85',
    icon: Compass,
    tag: '32dB Acoustic Privacy',
    badge: 'Private Floor Access'
  },
  {
    id: 'door',
    chapter: 4,
    timeLabel: '00:15',
    durationSec: 5,
    title: '04. Smart NFC Room Door',
    subtitle: 'Keyless NFC mobile entry—unlock solid walnut doors without a broker key.',
    location: 'Level 4 Executive Doorway',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=85',
    icon: DoorOpen,
    tag: 'Yale NFC Smart-Lock Active',
    badge: 'Instant App Self-Tour'
  },
  {
    id: 'hall',
    chapter: 5,
    timeLabel: '00:20',
    durationSec: 5,
    title: '05. Living Hall & Lounge',
    subtitle: 'Expansive open-plan lounge with custom teak furnishings and 98% natural light.',
    location: '402 Luxury Suite • Hallway',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1800&q=85',
    icon: Home,
    tag: '32dB Acoustic Soundproofing',
    badge: 'Fully Furnished'
  },
  {
    id: 'bedroom',
    chapter: 6,
    timeLabel: '00:25',
    durationSec: 5,
    title: '06. Executive Bedroom & WFH',
    subtitle: 'Herman Miller style desk, orthopedic king bed, and 300 Mbps FTTH fiber Wi-Fi.',
    location: 'Executive Work & Rest Suite',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1800&q=85',
    icon: BedDouble,
    tag: '300 Mbps High-Speed Wi-Fi',
    badge: 'Ergonomic WFH Setup'
  },
  {
    id: 'kitchen',
    chapter: 7,
    timeLabel: '00:30',
    durationSec: 5,
    title: '07. Gourmet Marble Kitchen',
    subtitle: 'Calacatta marble waterfall island, induction cooktop, and RO water purification.',
    location: 'Gourmet Kitchen Island',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1800&q=85',
    icon: Sparkles,
    tag: 'Modular Kitchen + Chimney',
    badge: '100% Refundable Deposit'
  },
  {
    id: 'balcony',
    chapter: 8,
    timeLabel: '00:35',
    durationSec: 5,
    title: '08. Balcony & City View',
    subtitle: 'Private open-air terrace with monstera planters overlooking Indian IT corridors.',
    location: 'Sunset Terrace Deck',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1800&q=85',
    icon: Sun,
    tag: 'South-West Sunset Orientation',
    badge: 'AQI 24 Clean Air'
  }
];

export default function VideoWalkthroughHero2D() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100 per chapter
  const [isMuted, setIsMuted] = useState(true);

  const currentChapter = VIDEO_CHAPTERS[activeIdx];

  // Auto-play 2D Video Walkthrough Timer
  useEffect(() => {
    let timer;
    if (isPlaying) {
      const intervalMs = 50;
      const stepIncrement = 100 / ((currentChapter.durationSec * 1000) / intervalMs);

      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setActiveIdx((idx) => (idx + 1) % VIDEO_CHAPTERS.length);
            return 0;
          }
          return prev + stepIncrement;
        });
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeIdx, currentChapter.durationSec]);

  const handleSelectChapter = (idx) => {
    setActiveIdx(idx);
    setProgress(0);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % VIDEO_CHAPTERS.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + VIDEO_CHAPTERS.length) % VIDEO_CHAPTERS.length);
    setProgress(0);
  };

  // Calculate overall video time (00:00 to 00:40)
  const totalSeconds = activeIdx * 5 + Math.floor((progress / 100) * 5);
  const formattedTime = `00:${totalSeconds < 10 ? '0' + totalSeconds : totalSeconds}`;

  return (
    <section className="relative w-full pt-24 pb-16 bg-[#0A0A0C] text-white overflow-hidden">
      {/* 1. TOP HEADER & HEADLINE */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-6 pt-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#18181D] border border-white/10 text-[#E1224D] text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3">
              <Video className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span>OwnStay 2D Video Walkthrough</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none">
              Experience Indian Tier-2 <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-white via-white to-[#8E8E93] bg-clip-text text-transparent">
                verified zero-brokerage homes.
              </span>
            </h1>
          </div>

          {/* VIDEO CONTROLS: PLAY/PAUSE + AUDIO + STEPPER */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
                isPlaying
                  ? 'bg-[#E1224D] border-[#E1224D] text-white shadow-lg shadow-rose-600/30'
                  : 'bg-[#18181D] border-white/15 text-white hover:bg-white/10'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? '2D Tour Playing' : 'Play Walkthrough'}</span>
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 rounded-full bg-[#18181D] hover:bg-white/10 border border-white/15 flex items-center justify-center text-white transition-colors"
              aria-label="Toggle mute"
              title={isMuted ? 'Unmute narration' : 'Mute narration'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-[#A1A1A6]" /> : <Volume2 className="w-4 h-4 text-[#E1224D]" />}
            </button>

            <div className="flex items-center gap-1.5 bg-[#18181D] p-1 rounded-full border border-white/15">
              <button
                onClick={handlePrev}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"
                aria-label="Previous chapter"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold px-2.5 text-[#A1A1A6]">
                0{activeIdx + 1} / 0{VIDEO_CHAPTERS.length}
              </span>
              <button
                onClick={handleNext}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"
                aria-label="Next chapter"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CINEMATIC 2D VIDEO WALKTHROUGH PLAYER SCREEN */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full h-[500px] sm:h-[620px] lg:h-[700px] rounded-3xl overflow-hidden border border-white/15 bg-black shadow-2xl">
          
          {/* PHOTO LAYER WITH CINEMATIC KEN BURNS MOTION */}
          {VIDEO_CHAPTERS.map((chap, idx) => {
            const active = idx === activeIdx;
            return (
              <div
                key={chap.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={chap.image}
                  alt={chap.title}
                  className="w-full h-full object-cover transform scale-105 animate-ken-burns transition-transform duration-1000"
                />
                {/* CINEMATIC VIDEO VIGNETTE & SHADOW OVERLAYS */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
              </div>
            );
          })}

          {/* TOP VIDEO PLAYER STATUS BAR: REC + CHAPTER TAG */}
          <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E1224D] animate-ping" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-white">
                REC • [4K 60FPS 2D WALKTHROUGH]
              </span>
              <span className="text-[#A1A1A6] text-xs">|</span>
              <span className="text-xs font-semibold text-[#E1224D] hidden sm:inline">
                {currentChapter.tag}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#E1224D]" />
              <span>{currentChapter.badge}</span>
            </div>
          </div>

          {/* CENTER CAPTION / LOCATION OVERLAY */}
          <div className="absolute bottom-20 left-6 right-6 z-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-medium mb-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#E1224D]" />
                <span>{currentChapter.location}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
                {currentChapter.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#D2D2D7] mt-1.5 max-w-xl leading-relaxed">
                {currentChapter.subtitle}
              </p>
            </div>

            {/* ACTION CTAS IN VIDEO OVERLAY */}
            <div className="flex items-center gap-3">
              <Link
                to="/properties"
                className="px-6 py-3.5 rounded-xl bg-[#E1224D] hover:bg-[#C71B42] text-white text-xs font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
              >
                <span>Browse Verified Rooms</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/why-ownstay"
                className="hidden sm:inline-flex px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-xs font-bold transition-all"
              >
                Why ₹0 Brokerage?
              </Link>
            </div>
          </div>

          {/* BOTTOM SCRUBBAR / VIDEO TIMELINE BAR */}
          <div className="absolute bottom-0 left-0 right-0 h-14 bg-black/70 backdrop-blur-md border-t border-white/10 z-30 px-6 flex items-center justify-between gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:text-[#E1224D] transition-colors shrink-0"
              aria-label="Play or Pause"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            {/* SCRUBBING TIMELINE WITH CHAPTER MARKERS */}
            <div className="flex-1 flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#A1A1A6] shrink-0">
                {formattedTime}
              </span>

              <div className="relative flex-1 h-2 bg-white/15 rounded-full overflow-hidden">
                {/* ACTIVE CHAPTER PROGRESS BAR */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-[#E1224D] transition-all duration-75"
                  style={{
                    width: `${((activeIdx + progress / 100) / VIDEO_CHAPTERS.length) * 100}%`
                  }}
                />
              </div>

              <span className="text-xs font-mono font-bold text-[#A1A1A6] shrink-0">
                00:40
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE 8-CHAPTER PILL TABS AT BOTTOM */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {VIDEO_CHAPTERS.map((chap, idx) => {
            const Icon = chap.icon;
            const active = idx === activeIdx;
            return (
              <button
                key={chap.id}
                onClick={() => handleSelectChapter(idx)}
                className={`flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all border ${
                  active
                    ? 'bg-[#18181D] border-[#E1224D] shadow-md shadow-rose-950/20 scale-[1.02]'
                    : 'bg-[#121215] border-white/5 hover:border-white/15 hover:bg-[#18181D]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    active ? 'bg-[#E1224D] text-white' : 'bg-white/10 text-[#A1A1A6]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1A6]">
                      0{chap.chapter} • {chap.timeLabel}
                    </span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E1224D]" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-white truncate mt-0.5">
                    {chap.title.split('.')[1]?.trim() || chap.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
