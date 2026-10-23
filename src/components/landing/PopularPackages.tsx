import React from 'react';
import { MapPin, Clock, Star, ArrowRight, ArrowUpRight } from 'lucide-react';
import { TravelPackage } from '../../types/landingTypes';

interface PopularPackagesProps {
  onSelectPackage: (pkg: TravelPackage) => void;
  onViewAll: () => void;
}

export const packagesData: TravelPackage[] = [
  {
    id: 'greece',
    title: 'Greek Islands Escape',
    location: 'Greece',
    country: 'Greece',
    duration: '6 Days / 5 Nights',
    price: 1299,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
    description: 'Immerse yourself in whitewashed villages, iconic blue-domed churches, breathtaking Aegean sunsets, and authentic Mediterranean cuisine.',
    highlights: ['Santorini Sunset Cruise', 'Mykonos Old Town Tour', 'Wine Tasting & Local Taverns', 'Luxury Ferry Transfers'],
  },
  {
    id: 'maldives',
    title: 'Maldives Paradise',
    location: 'Maldives',
    country: 'Maldives',
    duration: '5 Days / 4 Nights',
    price: 1599,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80',
    description: 'Unwind in idyllic overwater villas suspended above crystal turquoise lagoons with pristine white sand beaches and coral reefs.',
    highlights: ['Overwater Bungalow Stay', 'All-Inclusive Gourmet Dining', 'Coral Reef Snorkeling Safari', 'Seaplane Scenic Transfers'],
  },
  {
    id: 'canada',
    title: 'Canadian Rockies',
    location: 'Canada',
    country: 'Canada',
    duration: '7 Days / 6 Nights',
    price: 1799,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80',
    description: 'Discover emerald glacial lakes, soaring alpine peaks of Banff and Jasper, wildlife spotting, and majestic pine forests.',
    highlights: ['Lake Louise Canoeing', 'Columbia Icefield Glacier Walk', 'Banff Gondola Ride', 'Scenic Icefields Parkway Drive'],
  },
  {
    id: 'japan',
    title: 'Japan Discovery',
    location: 'Japan',
    country: 'Japan',
    duration: '8 Days / 7 Nights',
    price: 2199,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    description: 'Experience ancient Kyoto shrines, Mount Fuji vistas framed by cherry blossoms, tea ceremonies, and futuristic Tokyo neon streets.',
    highlights: ['Shinkansen Bullet Train Pass', 'Kyoto Geisha District Tour', 'Mt. Fuji 5th Station & Lake Kawaguchi', 'Michelin-Starred Dining Options'],
  },
];

export const PopularPackages: React.FC<PopularPackagesProps> = ({ onSelectPackage, onViewAll }) => {
  return (
    <section id="packages-section" className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 sm:mb-10">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wider uppercase drop-shadow-md">
            POPULAR PACKAGES
          </h2>
          <div className="w-12 h-1 bg-blue-500 rounded-full mt-1.5" />
        </div>
        <button
          onClick={onViewAll}
          className="group flex items-center gap-2 text-xs sm:text-sm font-semibold text-sky-400 hover:text-sky-300 transition cursor-pointer"
        >
          <span>View All Packages</span>
          <div className="w-6 h-6 rounded-full border border-sky-400/40 group-hover:border-sky-300 group-hover:bg-sky-400/10 flex items-center justify-center transition">
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packagesData.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => onSelectPackage(pkg)}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-100/90 shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_36px_rgba(14,165,233,0.18)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer"
          >
            {/* Card Image */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-100">
              <img
                src={pkg.image}
                alt={pkg.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
              <button
                onClick={(e) => { e.stopPropagation(); onSelectPackage(pkg); }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-blue-600 shadow-md transition"
                title="Quick View"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base sm:text-lg group-hover:text-blue-600 transition-colors">
                  {pkg.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium mt-2 mb-4">
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{pkg.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{pkg.duration}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#0284c7]">
                    ${pkg.price.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium -mt-1">Per Person</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-amber-50/80 px-2 py-1 rounded-md border border-amber-200/60">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{pkg.rating}</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-sky-100 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm group-hover:bg-blue-600 group-hover:text-white">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
