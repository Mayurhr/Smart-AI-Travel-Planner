import React from 'react';
import { OrigamiPinIcon, OrigamiBoxIcon, OrigamiCardIcon, OrigamiPlaneIconSmall } from './OrigamiIcons';

export const HowToBook: React.FC = () => {
  const steps = [
    { number: 1, title: '1. Choose Destination', description: 'Pick your dream destination.', icon: <OrigamiPinIcon className="w-14 h-14" /> },
    { number: 2, title: '2. Select Package', description: 'Choose the best package for you.', icon: <OrigamiBoxIcon className="w-14 h-14" /> },
    { number: 3, title: '3. Make Payment', description: 'Secure your booking with easy payment.', icon: <OrigamiCardIcon className="w-14 h-14" /> },
    { number: 4, title: '4. Enjoy Your Trip', description: 'Pack your bags and make memories!', icon: <OrigamiPlaneIconSmall className="w-14 h-14" /> },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-16">
      <div className="text-center mb-10">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wider uppercase drop-shadow-md">HOW TO BOOK</h2>
        <div className="w-14 h-1 bg-blue-500 mx-auto rounded-full mt-2" />
      </div>

      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-[0_4px_30px_rgba(15,23,42,0.1)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 items-center">
          {steps.map((step, idx) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col sm:flex-row md:flex-col items-center text-center sm:text-left md:text-center gap-4 group">
                <div className="transform group-hover:scale-110 transition-transform duration-300 shrink-0">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">{step.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[200px] sm:max-w-none">{step.description}</p>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:flex justify-center -mx-6 pointer-events-none">
                  <svg width="40" height="12" viewBox="0 0 40 12" fill="none">
                    <line x1="0" y1="6" x2="32" y2="6" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
                    <polyline points="30,2 36,6 30,10" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
