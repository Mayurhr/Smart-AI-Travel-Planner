import React from 'react';
import { Plane, Users, Package, Headphones, Star, Quote } from 'lucide-react';
import { OrigamiHeart } from './OrigamiIcons';

export const StatsAndTestimonial: React.FC = () => {
  const stats = [
    { icon: Plane, value: '150+', label: 'Destinations' },
    { icon: Users, value: '10K+', label: 'Happy Travelers' },
    { icon: Package, value: '500+', label: 'Travel Packages' },
    { icon: Headphones, value: '24/7', label: 'Support' },
  ];

  return (
    <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 pb-14">
      <div className="rounded-3xl bg-gradient-to-r from-[#177fe7] via-[#208ef1] to-[#289cfc] text-white p-6 sm:p-8 lg:p-10 shadow-2xl shadow-blue-500/20 overflow-hidden relative">

        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.10), transparent)' }} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

          {/* Left Stats Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex flex-col items-center sm:items-start group">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">{stat.value}</div>
                  <div className="text-xs text-blue-100/90 font-medium mt-0.5">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Right Testimonial Card */}
          <div className="lg:col-span-5 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-5 sm:p-6 flex items-center justify-between gap-4">
            <div className="flex-1">
              <Quote className="w-5 h-5 text-blue-200 fill-blue-200 mb-2 opacity-80" />
              <p className="text-xs sm:text-sm font-medium text-white/95 leading-relaxed italic">
                "The best travel experience we've ever had! Everything was perfectly organized."
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-white">— Sarah J.</div>
                  <div className="text-[11px] text-blue-200">New York, USA</div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  ))}
                </div>
              </div>
            </div>

            <div className="shrink-0 transform hover:scale-105 transition-transform">
              <OrigamiHeart className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md" />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-100/80 gap-3">
          <p>© 2025 Travel Around The World. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-white transition">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition">Terms of Service</a>
            <a href="#support" className="hover:text-white transition">Customer Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
