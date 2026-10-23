import React, { useState } from 'react';
import { X, Check, Calendar, Users, MapPin, ShieldCheck } from 'lucide-react';
import { TravelPackage, PricingPlan } from '../../types/landingTypes';

interface LandingBookingModalProps {
  packageItem: TravelPackage | null;
  pricingPlan: PricingPlan | null;
  onClose: () => void;
  /** Optional: bridge to the main app's trip planner */
  onStartPlanning?: (destination: string) => void;
}

export const LandingBookingModal: React.FC<LandingBookingModalProps> = ({
  packageItem,
  pricingPlan,
  onClose,
  onStartPlanning,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('2025-06-15');
  const [travelers, setTravelers] = useState(2);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!packageItem && !pricingPlan) return null;

  const title = packageItem ? packageItem.title : `${pricingPlan?.name} Package Plan`;
  const price = packageItem ? packageItem.price : (pricingPlan?.price || 0);
  const destination = packageItem?.location || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#177fe7] to-[#2597f8] p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
            {packageItem ? 'Destination Booking' : 'Plan Subscription'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white">{title}</h2>
          <div className="text-2xl font-extrabold text-blue-100 mt-2">
            ${price.toLocaleString()} <span className="text-xs font-normal text-blue-100/80">/ person</span>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Booking Confirmed!</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-xs">
              Thank you, {name || 'Traveler'}! A detailed itinerary has been sent to {email || 'your email'}.
            </p>
            {onStartPlanning && destination && (
              <button
                onClick={() => { onClose(); onStartPlanning(destination); }}
                className="mt-4 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm transition"
              >
                Open AI Trip Planner →
              </button>
            )}
            <button
              onClick={onClose}
              className="mt-3 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm"
            >
              Back to Explore
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {packageItem && (
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 mb-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>{packageItem.location}</span>
                </div>
                <div>•</div>
                <div>{packageItem.duration}</div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
              <input type="text" required placeholder="Sarah Jenkins" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:outline-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
                <input type="email" required placeholder="sarah@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
                <input type="tel" placeholder="+1 (555) 019-2834" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Preferred Date
                </label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-400" /> Travelers
                </label>
                <select value={travelers} onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:outline-none">
                  <option value={1}>1 Traveler</option>
                  <option value={2}>2 Travelers</option>
                  <option value={3}>3 Travelers</option>
                  <option value={4}>4 Travelers</option>
                  <option value={5}>5+ Travelers</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Zero cancellation fee within 48 hours</span>
              </div>
              <div className="font-bold text-slate-800 text-sm">Total: ${(price * travelers).toLocaleString()}</div>
            </div>

            <button type="submit"
              className="w-full py-3 bg-[#0070e0] hover:bg-[#005bb5] text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/25 transition active:scale-95">
              Complete Reservation
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
