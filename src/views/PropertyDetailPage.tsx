'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Star,
  ShieldCheck,
  Key,
  CheckCircle2,
  Share2,
  Heart,
  DollarSign,
  Calendar,
  Sparkles,
  Wifi,
  Laptop,
  Lock,
  Sun,
  Wind,
  Shirt,
  Coffee
import { useApp } from '../context/AppContext';
import type { Property } from '../types';

interface PropertyDetailPageProps {
  property: Property;
}

export default function PropertyDetailPage({ property }: PropertyDetailPageProps) {
  const { wishlistIds, onToggleWishlist } = useApp();
  const defaultImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
  const images = property.images && property.images.length > 0 ? property.images : [property.image || defaultImage];
  const [activeImage, setActiveImage] = useState(images[0]);
  const isWishlisted = wishlistIds.includes(property.id);
  const [isBooked, setIsBooked] = useState(false);

  const title = property.title || 'OwnStay Verified Residence';
  const neighborhood = property.neighborhood || property.location || 'Indore';
  const city = property.city || 'Indore';
  const price = Number(property.price || 16500);
  const roomType = property.roomType || property.type || '1BHK Suite';
  const rating = property.rating || 4.96;
  const reviewsCount = property.reviewsCount || 42;
  const monthlyRent = property.costBreakdown?.monthlyRent || price;
  const maintenance = property.costBreakdown?.maintenance || 1200;
  const securityDeposit = property.costBreakdown?.securityDeposit || price * 2;

  const amenitiesList = [
    { name: '100 Mbps Gigabit Fiber', icon: Wifi },
    { name: 'Ergonomic Desk & Chair', icon: Laptop },
    { name: 'NFC Smart-Lock Keyless Entry', icon: Lock },
    { name: 'South-East Balcony Sunlight', icon: Sun },
    { name: 'Daikin Inverter AC', icon: Wind },
    { name: 'In-unit Bosch Laundry', icon: Shirt },
    { name: 'Artisan Espresso Station', icon: Coffee },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#E1224D] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/properties" className="hover:text-[#E1224D] transition-colors">
            Properties
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-xs">{title}</span>
        </nav>

        {/* Back Link & Title Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#E1224D] transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Properties
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
              {title}
            </h1>
            <p className="flex items-center gap-2 text-gray-600 mt-2">
              <MapPin className="w-4 h-4 text-[#E1224D]" />
              {neighborhood}, {city}
              <span className="inline-flex items-center gap-1 ml-3 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" /> Zero-Brokerage Verified
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleWishlist(property.id)}
              className={`p-3 rounded-full border transition-colors ${
                isWishlisted
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
              aria-label="Save to Wishlist"
              title="Save to Wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: title,
                    text: `Check out ${title} on OwnStay — India's Zero-Brokerage Platform!`,
                    url: window.location.href,
                  });
                }
              }}
              className="p-3 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Share Property"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-3 rounded-2xl overflow-hidden shadow-sm h-80 sm:h-96 md:h-[450px] relative bg-gray-200">
            <img
              src={activeImage}
              alt={`${title} main presentation`}
              className="w-full h-full object-cover"
            />
            {property.nfcSelfTour && (
              <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" /> NFC Smart-Lock Solo Tour Available
              </div>
            )}
          </div>
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`relative rounded-xl overflow-hidden h-20 md:h-28 flex-1 md:flex-none border-2 transition-all ${
                  activeImage === img ? 'border-[#E1224D] shadow-md scale-95' : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`${title} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Details & Amenities */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E1224D]">
                    {roomType}
                  </span>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mt-1">
                    Verified Zero-Brokerage Residence
                  </h2>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-lg font-bold text-gray-900">{rating}</span>
                  <span className="text-sm text-gray-500">({reviewsCount} verified reviews)</span>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Experience premium co-living in {neighborhood}. Carefully audited by our engineering team for superior acoustic isolation, ergonomic workspace lighting, and guaranteed fiber Wi-Fi reliability.
                </p>
                <p>
                  100% Zero-Brokerage direct owner lease with digital KYC, instant token receipt, and NFC smart-lock keyless entry.
                </p>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E1224D]" /> What this residence offers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {amenitiesList.map((amenity, i) => {
                  const Icon = amenity.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                      <Icon className="w-5 h-5 text-[#E1224D]" />
                      <span className="text-sm font-medium text-gray-800">{amenity.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Col: Price Breakdown & Instant Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 sticky top-24">
              <div className="flex items-baseline justify-between pb-4 border-b border-gray-100">
                <div>
                  <span className="text-3xl font-extrabold text-[#1A1A1A]">
                    ₹{price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 font-medium"> /month</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  ₹0 Brokerage
                </span>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Monthly Rent</span>
                  <span className="font-semibold text-gray-900">₹{monthlyRent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Society Maintenance</span>
                  <span className="font-semibold text-gray-900">₹{maintenance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Traditional Brokerage (Saved)</span>
                  <span className="line-through text-gray-400">₹{price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 pt-3 border-t border-gray-100">
                  <span>Refundable Security Deposit</span>
                  <span className="font-semibold text-gray-900">₹{securityDeposit.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setIsBooked(true)}
                  disabled={isBooked}
                  className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-sm ${
                    isBooked
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-[#E1224D] hover:bg-[#c91d43] text-white shadow-[#E1224D]/20'
                  }`}
                >
                  {isBooked ? '✓ Visit Scheduled!' : 'Schedule 15-Min NFC Solo Tour'}
                </button>
                <Link
                  href="/properties"
                  className="block w-full text-center py-3 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Explore More Residences
                </Link>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>100% Verified ownership • Instant token receipt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
