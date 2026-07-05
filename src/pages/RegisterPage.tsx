import React, { useState } from 'react';
import { UserPlus, Disc, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageRoute } from '../types/index.js';

interface RegisterPageProps {
  setActivePage: (page: PageRoute) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ setActivePage }) => {
  const { register, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
      await register(email, password, name);
      setActivePage('home');
    } catch (err) {
      // error shown in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 shadow-xl shadow-purple-600/30">
            <Disc className="h-8 w-8 text-white animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-white">Create your Music Hub Account</h2>
          <p className="mt-1 text-xs text-slate-400">Unlimited free Creative Commons music streaming forever</p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">Full Name</label>
            <div className="relative mt-1">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full rounded-xl bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white border border-slate-800 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white border border-slate-800 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create strong password"
                className="w-full rounded-xl bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white border border-slate-800 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" /> {loading ? 'Creating Account...' : 'Register Free Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already registered?{' '}
          <button
            onClick={() => setActivePage('login')}
            className="font-bold text-purple-400 hover:underline"
          >
            Sign in instead
          </button>
        </div>

      </div>
    </div>
  );
};
