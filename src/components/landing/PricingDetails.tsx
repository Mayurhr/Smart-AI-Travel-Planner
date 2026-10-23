import React from 'react';
import { Check } from 'lucide-react';
import { PricingPlan } from '../../types/landingTypes';

interface PricingDetailsProps {
  onSelectPlan: (plan: PricingPlan) => void;
}

export const pricingPlansData: PricingPlan[] = [
  {
    id: 'economy',
    name: 'Economy',
    tagline: 'Great value for smart travelers',
    price: 499,
    period: 'Per Person',
    features: ['Economy Class Flights', '20kg Baggage', 'Standard Hotels', 'Airport Transfers'],
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Comfort and convenience',
    price: 899,
    period: 'Per Person',
    isPopular: true,
    features: ['Premium Economy Flights', '25kg Baggage', '4-Star Hotels', 'Airport Transfers', 'City Tours'],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Luxury and flexibility',
    price: 1499,
    period: 'Per Person',
    features: ['Business Class Flights', '30kg Baggage', '5-Star Hotels', 'Airport Transfers', 'City Tours', 'Lounge Access'],
  },
  {
    id: 'luxury',
    name: 'Luxury',
    tagline: 'The ultimate travel experience',
    price: 2499,
    period: 'Per Person',
    features: ['First Class Flights', '35kg Baggage', 'Premium Hotels/Villas', 'Private Transfers', 'Exclusive Experiences', '24/7 Concierge'],
  },
];

export const PricingDetails: React.FC<PricingDetailsProps> = ({ onSelectPlan }) => {
  return (
    <section id="pricing-section" className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
      <div className="relative rounded-3xl bg-gradient-to-r from-[#177fe7] via-[#208ef1] to-[#2597f8] p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl shadow-blue-500/20">

        {/* Origami plane background decoration */}
        <div className="absolute left-2 bottom-4 pointer-events-none opacity-20 sm:opacity-30 lg:opacity-40">
          <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-64 sm:h-64 fill-none">
            <polygon points="10,120 180,30 110,170 90,125" fill="#FFFFFF" />
            <polygon points="180,30 110,170 90,125" fill="#93C5FD" />
            <polygon points="90,125 70,160 100,150" fill="#38BDF8" />
            <polygon points="90,125 110,170 95,150" fill="#60A5FA" />
          </svg>
        </div>

        <div className="relative z-10 mb-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wider uppercase">PRICING DETAILS</h2>
          <div className="w-12 h-0.5 bg-white/70 rounded-full mt-2" />
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          {pricingPlansData.map((plan) => {
            const isPopular = plan.isPopular;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl bg-white p-6 shadow-xl transition-all duration-300 ${
                  isPopular ? 'ring-4 ring-blue-400/40 lg:-translate-y-2 shadow-2xl' : 'hover:-translate-y-1'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#0b5ec4] text-white text-[10px] font-bold tracking-wider uppercase px-4 py-1 rounded-full shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center pt-2">
                  <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px] flex items-center justify-center">{plan.tagline}</p>
                  <div className="mt-4 pb-4 border-b border-slate-100">
                    <div className="text-3xl sm:text-4xl font-extrabold text-[#0284c7]">${plan.price.toLocaleString()}</div>
                    <div className="text-xs text-slate-400 mt-0.5 font-medium">{plan.period}</div>
                  </div>
                </div>

                <ul className="py-6 space-y-3 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 stroke-[2.5]" />
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                      isPopular
                        ? 'bg-[#0070e0] hover:bg-[#005bb5] text-white shadow-md shadow-blue-500/25 active:scale-95'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 active:scale-95'
                    }`}
                  >
                    Select Plan
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
