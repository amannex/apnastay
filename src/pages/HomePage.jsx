import VideoWalkthroughHero2D from '../components/hero3d/VideoWalkthroughHero2D';
// Note: All 3D hero variations preserved in src/components/hero3d/ (FosterCinematicHero.jsx, UnsplashWalkthroughHero.jsx, HeroScrollStory.jsx)
import SearchBar from '../components/search/SearchBar';
import CitiesCarousel from '../components/sections/CitiesCarousel';
import WhyOwnStayGrid from '../components/sections/WhyOwnStayGrid';
import PropertiesSection from '../components/properties/PropertiesSection';
import BlogSection from '../components/sections/BlogSection';
import FAQSection from '../components/sections/FaqSection';
import RentalCategoriesShowcase from '../components/sections/RentalCategoriesShowcase';
import ManagedServicesShowcase from '../components/sections/ManagedServicesShowcase';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AppLaunchBanner from '../components/sections/AppLaunchBanner';

export default function HomePage({
  searchFilters,
  onSearchChange,
  onReset,
  onCitySelect,
  activeTab,
  onTabChange,
  onOpenModal,
  onOpenCompare,
  compareIds = [],
  wishlistIds = [],
  onToggleCompare,
  onToggleWishlist,
  onOpenAiMatchmaker
}) {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      {/* 1. 2D PHOTOREALISTIC CINEMATIC VIDEO WALKTHROUGH HERO */}
      <VideoWalkthroughHero2D />

      {/* 2. SEARCH & FILTER SECTION */}
      <div className="relative z-30 pt-6 pb-4">
        <SearchBar filters={searchFilters} onChange={onSearchChange} onReset={onReset} />
      </div>

      {/* 3. INDIAN TIER-2 CITIES CAROUSEL */}
      <div className="pt-8">
        <CitiesCarousel onCityClick={onCitySelect} />
      </div>

      {/* 3.5. INDIAN RENTAL STAY CATEGORIES (Inspired by RoomRentJaipur, LetsRentz, ZoloStays & Nestaway) */}
      <RentalCategoriesShowcase />

      {/* 4. WHY OWNSTAY ZERO-BROKERAGE PROMISE (bg-[#FAFAFA]) */}
      <WhyOwnStayGrid />

      {/* 5. FEATURED VERIFIED ROOMS WITH LINK TO MULTI-PAGE EXPLORER (bg-white) */}
      <section className="pt-16 pb-12 bg-white border-y border-gray-200/80">
        <PropertiesSection
          activeTab={activeTab}
          onTabChange={onTabChange}
          onOpenModal={onOpenModal}
          onOpenCompare={onOpenCompare}
          compareIds={compareIds}
          wishlistIds={wishlistIds}
          onToggleCompare={onToggleCompare || onOpenCompare}
          onToggleWishlist={onToggleWishlist}
          searchFilters={searchFilters}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 text-center">
          <Link
            to="/properties"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#E1224D] text-white font-bold text-xs sm:text-sm shadow-apple hover:bg-[#C71B42] transition-all hover:scale-105 whitespace-nowrap max-w-full"
          >
            <span className="sm:hidden">Browse All 1,200+ Verified Homes</span>
            <span className="hidden sm:inline">Browse All 1,200+ Verified Homes Across India</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>
      </section>

      {/* 5.5. MANAGED LIVING SERVICES & TRUST (bg-[#FAFAFA]) */}
      <ManagedServicesShowcase />

      {/* 5.8. GOOGLE PLAY STORE MOBILE APP COMING SOON BANNER */}
      <AppLaunchBanner />

      {/* 6. OWNSTAY JOURNAL & URBAN LIVING GUIDE */}
      <BlogSection />

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <FAQSection />
    </main>
  );
}
