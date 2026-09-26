'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Star,
  ShieldCheck,
  Key,
  MapPin,
  Heart,
  Share2,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Send,
  Wifi,
  Laptop,
  Lock,
  Sun,
  Wind,
  Shirt,
  Coffee,
  ArrowRight
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';
import { slugify } from '@/features/properties/adapter';

// Mini 3D Room Viewer component inside the modal
function MiniRoomModel() {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Wooden Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[7, 5]} />
        <meshStandardMaterial color="#E6D2B5" roughness={0.4} />
      </mesh>
      {/* Bed */}
      <group position={[-1.6, 0.4, -0.8]}>
        <RoundedBox args={[2.4, 0.4, 3]} radius={0.06}>
          <meshStandardMaterial color="#4A3B32" />
        </RoundedBox>
        <RoundedBox args={[2.2, 0.35, 2.7]} radius={0.1} position={[0, 0.3, 0]}>
          <meshStandardMaterial color="#FFFFFF" />
        </RoundedBox>
        <mesh position={[0, 0.46, 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.1, 1.2]} />
          <meshStandardMaterial color="#E1224D" />
        </mesh>
      </group>
      {/* Desk & Computer */}
      <group position={[1.8, 0, -1.2]}>
        <RoundedBox args={[2, 0.1, 1]} radius={0.02} position={[0, 1.2, 0]}>
          <meshStandardMaterial color="#FFFFFF" />
        </RoundedBox>
        <mesh position={[0, 1.8, -0.3]}>
          <boxGeometry args={[1.4, 0.7, 0.05]} />
          <meshStandardMaterial color="#1A1A1A" />
        </mesh>
        <mesh position={[0, 1.8, -0.26]}>
          <planeGeometry args={[1.35, 0.65]} />
          <meshBasicMaterial color="#FFE4EA" />
        </mesh>
      </group>
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 10, 5]} intensity={2} />
    </group>
  );
}

export default function PropertyModal({
  property,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onBookVisit
}: any) {
  const [activeTab, setActiveTab] = useState('gallery');
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState([
    {
      sender: 'owner',
      text: `Hi! I'm ${property?.owner?.name || 'the owner'}. Let me know if you have any questions about the acoustics or Wi-Fi speeds!`
    }
  ]);

  if (!property) return null;

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatLog((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatMessage('');

    setTimeout(() => {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'owner',
          text: `Thanks for asking! Yes, the 25-point ApnaStay audit verified ${property.amenities[0]?.name || 'gigabit fiber'} and a soundproof rating of 32 dB. Feel free to book an instant NFC smart-lock tour anytime!`
        }
      ]);
    }, 1000);
  };

  const TABS = [
    { id: 'gallery', label: 'Gallery & 3D View' },
    { id: 'cost', label: 'Cost Breakdown' },
    { id: 'amenities', label: 'Amenities & Nearby' },
    { id: 'timeline', label: 'Audit Timeline' },
    { id: 'owner', label: 'Owner & Chat' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-slide-up">
      <div
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-apple-lg border border-[#EDEDED] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER NAVBAR */}
        <div className="px-6 py-4 border-b border-[#EDEDED] flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </span>
              <span className="text-sm font-bold text-[#1A1A1A]">{property.neighborhood}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A] tracking-tight mt-0.5">
              {property.title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleWishlist(property.id)}
              className={`p-2.5 rounded-full border transition-colors ${
                isWishlisted
                  ? 'bg-[#E1224D] text-white border-[#E1224D]'
                  : 'bg-[#FAFAFA] text-[#6B7280] hover:text-[#1A1A1A] border-[#EDEDED]'
              }`}
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-[#FAFAFA] hover:bg-[#EDEDED] text-[#6B7280] hover:text-[#1A1A1A] transition-colors border border-[#EDEDED]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TABS HEADER */}
        <div className="px-6 border-b border-[#EDEDED] flex items-center gap-6 overflow-x-auto bg-[#FAFAFA]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#E1224D] text-[#E1224D]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {/* TAB 1: GALLERY & 3D ROOM VIEWER */}
          {activeTab === 'gallery' && (
            <div className="space-y-8">
              {/* Image Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative h-80 rounded-2xl overflow-hidden bg-[#FAFAFA] border border-[#EDEDED]">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold">
                      Main Suite View
                    </span>
                  </div>
                </div>

                {/* 3D Interactive Room Canvas Preview */}
                <div className="relative h-80 rounded-2xl overflow-hidden bg-[#FAFAFA] border border-[#EDEDED] flex flex-col">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full bg-[#E1224D] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                      3D Interactive Room Model
                    </span>
                  </div>
                  <Canvas
                    shadows
                    camera={{ position: [0, 4, 6], fov: 45 }}
                    className="w-full h-full"
                  >
                    <MiniRoomModel />
                    <OrbitControls
                      enableZoom={true}
                      minDistance={3}
                      maxDistance={12}
                      maxPolarAngle={Math.PI / 2}
                    />
                  </Canvas>
                  <div className="absolute bottom-3 right-3 text-[11px] font-semibold text-[#6B7280] bg-white/80 px-2.5 py-1 rounded-full border">
                    Drag to Orbit • Scroll to Zoom
                  </div>
                </div>
              </div>

              {/* AI Match Reason Banner */}
              {property.aiAttributes && (
                <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E1224D] uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4" />
                    ApnaStay AI Match Report ({property.aiAttributes.matchScore}% Match)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-[#1A1A1A]">
                    {property.aiAttributes.reasons?.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 bg-white p-3 rounded-xl border border-rose-100">
                        <CheckCircle2 className="w-4 h-4 text-[#E1224D] shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COST BREAKDOWN CALCULATOR */}
          {activeTab === 'cost' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#1A1A1A]">
                  Transparent Cost Breakdown (INR)
                </h3>
                <p className="text-sm text-[#6B7280] mt-1">
                  Zero brokerage commissions across India. Keep 100% of your security deposit.
                </p>
              </div>

              <div className="bg-[#FAFAFA] rounded-3xl border border-[#EDEDED] p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-[#EDEDED]">
                  <span className="text-sm font-semibold text-[#1A1A1A]">Monthly Rent</span>
                  <span className="text-sm font-bold text-[#1A1A1A]">₹{property.costBreakdown?.monthlyRent || property.price}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-[#EDEDED]">
                  <span className="text-sm font-semibold text-[#1A1A1A]">Building Maintenance & Wi-Fi</span>
                  <span className="text-sm font-bold text-[#1A1A1A]">₹{property.costBreakdown?.maintenance || 1200}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-[#EDEDED]">
                  <div>
                    <span className="text-sm font-semibold text-[#1A1A1A]">Refundable Security Deposit</span>
                    <p className="text-xs text-[#6B7280]">100% refunded within 48 hours of move-out</p>
                  </div>
                  <span className="text-sm font-bold text-[#1A1A1A]">₹{property.costBreakdown?.securityDeposit || 30000}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-[#EDEDED]">
                  <div>
                    <span className="text-sm font-bold text-emerald-600">Brokerage Fee</span>
                    <p className="text-xs text-emerald-600">Saved instantly with ApnaStay Direct</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">₹0</span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-[#1A1A1A]">Total Initial Move-In Cost</span>
                    <p className="text-xs text-[#6B7280]">Includes first month rent + refundable deposit</p>
                  </div>
                  <span className="text-2xl font-extrabold text-[#E1224D]">
                    ₹{property.costBreakdown?.totalMoveIn || property.price + 30000}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AMENITIES & NEARBY METRO / HOSPITALS */}
          {activeTab === 'amenities' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">
                  Verified Executive Amenities
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {property.amenities.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-[#EDEDED] flex items-center gap-3 text-xs font-semibold text-[#1A1A1A]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#E1224D]" />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">
                  Nearby Transit, Hospitals & Essentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.nearby.map((place, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#EDEDED] flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#E1224D] block mb-0.5">
                          {place.tag}
                        </span>
                        <p className="text-sm font-bold text-[#1A1A1A]">{place.name}</p>
                        <p className="text-xs text-[#6B7280]">{place.type}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white border border-[#EDEDED] text-xs font-bold text-[#1A1A1A]">
                        {place.distance}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROPERTY TIMELINE & INSPECTION AUDIT */}
          {activeTab === 'timeline' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                ApnaStay 25-Point Verification Audit
              </h3>
              <div className="space-y-4">
                {property.timeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAFAFA] border border-[#EDEDED]"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1A1A1A]">{item.step}</h4>
                      <p className="text-xs text-[#6B7280] mt-0.5">Completed: {item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OWNER PROFILE & LIVE CHAT DEMO */}
          {activeTab === 'owner' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Owner Info Card */}
              <div className="p-6 rounded-3xl bg-[#FAFAFA] border border-[#EDEDED] flex flex-col sm:flex-row items-center gap-6">
                <img
                  src={property.owner.avatar}
                  alt={property.owner.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#E1224D]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#1A1A1A]">{property.owner.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-[#E1224D] text-[11px] font-bold">
                      Verified Owner
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#6B7280] mt-1">
                    Response time: {property.owner.responseTime} • {property.owner.propertiesCount} verified listings
                  </p>
                  <p className="text-sm text-[#1A1A1A] mt-2">{property.owner.bio}</p>
                </div>
              </div>

              {/* Instant Chat Demo Box */}
              <div className="border border-[#EDEDED] rounded-3xl p-4 bg-white flex flex-col h-72">
                <div className="pb-3 border-b border-[#EDEDED] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#E1224D]" />
                    Direct Message (Zero Broker Middlemen)
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">● Online Now</span>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  {chatLog.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm ${
                          msg.sender === 'user'
                            ? 'bg-[#E1224D] text-white rounded-br-none'
                            : 'bg-[#FAFAFA] text-[#1A1A1A] border border-[#EDEDED] rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2 border-t border-[#EDEDED]">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask owner about soundproofing, Wi-Fi speed, or instant tours..."
                    className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-full bg-[#FAFAFA] border border-[#EDEDED] focus:outline-none focus:border-[#E1224D]"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-full bg-[#E1224D] text-white hover:bg-[#C71B42] transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER - INSTANT BOOKING BAR */}
        <div className="p-6 border-t border-[#EDEDED] bg-[#FAFAFA] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xl font-bold text-[#1A1A1A]">
              ₹{property.price?.toLocaleString?.() || property.price}
              <span className="text-xs font-normal text-[#6B7280]"> / month</span>
            </p>
            <p className="text-xs font-semibold text-emerald-600">
              ₹0 brokerage • Instant NFC Smart-Lock Tour Ready
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href={`/${(property.city || 'indore').toLowerCase()}/${slugify(property.title || property.id)}`}
              onClick={onClose}
              className="px-5 py-3 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>View Full Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => {
                onClose();
                onBookVisit(property);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#E1224D] text-white text-xs sm:text-sm font-semibold shadow-apple hover:bg-[#C71B42] transition-all flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              Book Instant NFC Visit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
