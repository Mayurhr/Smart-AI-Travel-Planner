import React from 'react';
import { Shield, Tag, Headphones, Star } from 'lucide-react';

export const FeatureBadges: React.FC = () => {
  const features = [
    {
      icon: Tag,
      title: 'Best Price Guarantee',
      desc: 'We match any lower price you find, guaranteed.',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Shield,
      title: 'Secure Booking',
      desc: '256-bit SSL encryption on all transactions.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      desc: 'Round-the-clock travel assistance worldwide.',
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      icon: Star,
      title: 'Custom Packages',
      desc: 'Tailored itineraries built around your preferences.',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="flex items-start gap-4 p-5 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className={`${f.bg} ${f.color} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-0.5">{f.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
