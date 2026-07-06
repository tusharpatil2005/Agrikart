import React, { useState } from 'react';
import { X, Mail, Lock, User, Sprout, AlertTriangle } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserType, token: string) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'buyer' | 'farmer'>('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin
      ? { email, password }
      : { name, email, password, role };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      onSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal */}
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative z-10 border border-stone-200/50 animate-in zoom-in-95 duration-150">
        
        {/* Header decoration */}
        <div className="bg-emerald-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-emerald-100 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="bg-white/10 p-2 rounded-xl">
              <Sprout className="h-6 w-6 text-emerald-200" />
            </div>
            <h2 className="text-2xl font-bold font-display tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join Agrikart'}
            </h2>
          </div>
          <p className="text-xs text-emerald-100 font-medium">
            {isLogin
              ? 'Access your farm-fresh marketplace dashboard'
              : 'Sign up to shop or start selling fresh agricultural goods'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-100 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-700 text-xs font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Toggle Tab */}
          <div className="flex bg-stone-100 rounded-xl p-1 mb-6 border border-stone-200/45">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg font-display transition-all ${
                isLogin
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg font-display transition-all ${
                !isLogin
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Input - Only for Register */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                  Full Name / Business Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-stone-400" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50/50 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50/50 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50/50 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Role Selection Tabs - Only for Register */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                  I want to
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={`py-2.5 px-4 text-xs font-semibold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      role === 'buyer'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/10'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50/80'
                    }`}
                  >
                    <span className="font-display block">Buy farm goods</span>
                    <span className="text-[9px] text-stone-400 font-normal">Fresh produce & supplies</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('farmer')}
                    className={`py-2.5 px-4 text-xs font-semibold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      role === 'farmer'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/10'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50/80'
                    }`}
                  >
                    <span className="font-display block">Sell farm goods</span>
                    <span className="text-[9px] text-stone-400 font-normal">Farmer/Supplier account</span>
                  </button>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl text-sm tracking-tight hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Quick Demo Credentials Help */}
          {isLogin && (
            <div className="mt-6 p-3 bg-stone-50 border border-stone-200/60 rounded-2xl text-[11px] text-stone-500 space-y-1">
              <span className="font-semibold text-stone-700 uppercase tracking-wide block text-[9px] mb-1">
                DEMO LOGIN DETAILS (Instant Access)
              </span>
              <div className="flex justify-between">
                <span>Buyer Account:</span>
                <span className="font-mono text-stone-700">buyer@agri.com / password123</span>
              </div>
              <div className="flex justify-between">
                <span>Farmer Account:</span>
                <span className="font-mono text-stone-700">farmer1@agri.com / password123</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
