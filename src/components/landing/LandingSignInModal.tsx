import React, { useState } from 'react';
import { X, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { PaperPlaneLogo } from './OrigamiIcons';

interface LandingSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export const LandingSignInModal: React.FC<LandingSignInModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onSuccess(email || 'traveler@world.com');
      onClose();
      setSubmitted(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 text-center bg-gradient-to-b from-blue-50/60 to-white">
          <div className="flex justify-center mb-3">
            <PaperPlaneLogo className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            {tab === 'signin' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Access exclusive member discounts and personalized trips.</p>

          <div className="flex bg-slate-100 p-1 rounded-xl mt-6">
            <button
              onClick={() => setTab('signin')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                tab === 'signin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >Sign In</button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                tab === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >Register</button>
          </div>
        </div>

        {submitted ? (
          <div className="p-8 text-center flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-800">Successfully Signed In!</h3>
            <p className="text-xs text-slate-500 mt-1">Welcome back to Travel Around The World.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <div className="relative">
                <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:outline-none" />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <div className="relative">
                <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:outline-none" />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-blue-500/25 active:scale-95">
              {tab === 'signin' ? 'Sign In to Your Account' : 'Create Free Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
