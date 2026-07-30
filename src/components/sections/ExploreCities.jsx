import { STATIC_CITIES } from '../../data/staticProperties';
import { MapPin, ArrowUpRight, Flame } from 'lucide-react';

export default function ExploreCities({ selectedCity, onSelectCity }) {
  return (
    <section id="cities" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-3">
              <MapPin className="w-3.5 h-3.5" />
              Indian Tier-2 Hubs
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A]">
              Explore Indian Cities
            </h2>
            <p className="text-[#6B7280] text-base mt-2">
              Curated ₹0 brokerage homes across India&apos;s fastest growing tech and creative centers.
            </p>
          </div>

          <button
            onClick={() => onSelectCity('all')}
            className="self-start md:self-auto px-5 py-2.5 rounded-full border border-[#EDEDED] hover:border-[#1A1A1A] text-xs font-semibold text-[#1A1A1A] transition-colors"
          >
            View All Cities ({STATIC_CITIES.reduce((acc, c) => acc + c.availableRooms, 0)} rooms)
          </button>
        </div>

        {/* CITY CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STATIC_CITIES.map((city) => {
            const isSelected = selectedCity === city.name;
            return (
              <div
                key={city.id}
                onClick={() => onSelectCity(isSelected ? 'all' : city.name)}
                className={`group relative h-80 rounded-3xl overflow-hidden cursor-pointer border transition-all duration-300 ${
                  isSelected
                    ? 'ring-4 ring-[#E1224D] border-[#E1224D] shadow-apple-lg scale-[1.01]'
                    : 'border-[#EDEDED] shadow-sm hover:shadow-apple-hover'
                }`}
              >
                {/* BACKGROUND IMAGE WITH SMOOTH APPLE ZOOM */}
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* GRADIENT OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* TOP BADGES */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  {city.trending ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#E1224D] text-[11px] font-bold uppercase tracking-wider">
                      <Flame className="w-3.5 h-3.5" />
                      Trending Hub
                    </span>
                  ) : (
                    <span />
                  )}

                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#E1224D] transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* BOTTOM CONTENT */}
                <div className="absolute bottom-6 left-6 right-6 z-10 text-white">
                  <p className="text-xs font-semibold text-white/80 uppercase tracking-widest mb-1">
                    {city.country} • Avg ${city.avgPrice}/mo
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
                    {city.name}
                  </h3>
                  <p className="text-xs text-white/90 font-medium mb-3">
                    {city.tagline}
                  </p>

                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span>{city.availableRooms} verified rooms live</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
