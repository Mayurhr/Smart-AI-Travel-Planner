import React from 'react';
import { Send } from 'lucide-react';
import { LargeOrigamiAirplane } from './OrigamiIcons';
import { LandingSearchWidget } from './LandingSearchWidget';
import { LandingSearchState } from '../../types/landingTypes';

interface LandingHeroProps {
  onPlanTrip: () => void;
  onSearch: (criteria: LandingSearchState) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onPlanTrip, onSearch }) => {
  return (
    <section className="relative w-full pt-10 pb-20 sm:pb-28 text-white overflow-hidden">
      {/* Dashed flight loop trail SVG */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <svg className="w-full h-full" viewBox="0 0 1200 600" fill="none">
          <path
            d="M 150,260 C 350,220 520,380 620,240 C 720,100 580,80 570,160 C 560,240 680,240 820,140 C 920,70 1020,40 1100,50"
            stroke="white"
            strokeWidth="2.5"
            strokeDasharray="6 8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Hero Content Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center min-h-[380px] lg:min-h-[440px]">

          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start pt-4 lg:pt-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.95] text-white uppercase drop-shadow-sm">
              TRAVEL
            </h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white/95 uppercase mt-1 mb-3">
              AROUND THE WORLD
            </h2>

            {/* Cursive Tagline */}
            <div className="font-script text-3xl sm:text-4xl lg:text-5xl text-blue-50 font-normal tracking-wide transform -rotate-1 mb-4 select-none">
              Explore. Dream. Discover.
            </div>

            <p className="text-blue-50/90 text-sm sm:text-base max-w-lg mb-8 leading-relaxed font-normal">
              Autonomous AI travel synthesis for the world's most breathtaking journeys.
            </p>

            <button
              onClick={onPlanTrip}
              className="bg-white hover:bg-blue-50 active:scale-95 text-blue-600 font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-blue-900/15 flex items-center gap-2.5 transition-all duration-200 cursor-pointer group"
            >
              <span>Plan Trip</span>
              <Send className="w-4 h-4 text-blue-600 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Right Origami Paper Airplane Graphic */}
          <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
            <div className="relative group">
              <div className="transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                <LargeOrigamiAirplane className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 drop-shadow-2xl" />
              </div>

              {/* Polygonal origami monument silhouette hints */}
              <div className="absolute -bottom-8 right-0 flex items-end gap-3 opacity-30 pointer-events-none">
                {/* Eiffel Tower */}
                <svg viewBox="0 0 60 120" className="w-16 h-32 fill-white">
                  <polygon points="30,5 34,40 40,80 50,115 36,115 30,95 24,115 10,115 20,80 26,40" />
                </svg>
                {/* Big Ben */}
                <svg viewBox="0 0 50 140" className="w-14 h-36 fill-white">
                  <polygon points="25,4 32,25 36,45 36,135 14,135 14,45 18,25" />
                  <circle cx="25" cy="55" r="5" fill="#208ef1" />
                </svg>
                {/* Burj Al Arab */}
                <svg viewBox="0 0 60 130" className="w-16 fill-white">
                  <path d="M10,125 Q45,110 50,60 Q55,10 20,5 L20,125 Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Search Widget */}
      <div className="mt-6 sm:mt-10">
        <LandingSearchWidget onSearch={onSearch} />
      </div>
    </section>
  );
};
