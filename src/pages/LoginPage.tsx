import React, { useState } from 'react';
import { LogIn, Disc, Sparkles, ShieldCheck, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageRoute } from '../types/index.js';
import { api } from '../services/api.js';
import { supabase } from '../lib/supabaseClient.js';

interface LoginPageProps {
  setActivePage: (page: PageRoute) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setActivePage }) => {
  const { login, loginAsDemo, loginAsAdmin, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
      await login(email, password);
      setActivePage('home');
    } catch (err) {
      // error set in context
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter your email address above');
      return;
    }
    try {
      const { error: supaErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (!supaErr) {
        setForgotMsg(`Supabase password reset email dispatched to ${email}! Check your inbox.`);
        return;
      }
      const msg = await api.forgotPassword(email);
      setForgotMsg(msg);
    } catch (err: any) {
      setForgotMsg(err.message || 'Reset failed');
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-xl shadow-indigo-600/30">
            <Disc className="h-8 w-8 text-white animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-white">Welcome back to Music Hub</h2>
          <p className="mt-1 text-xs text-slate-400">Sign in to sync your favorites, playlists & listening queue</p>
        </div>

        {/* Instant Shortcuts */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={async () => { await loginAsDemo(); setActivePage('home'); }}
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Demo User
          </button>

          <button
            onClick={async () => { await loginAsAdmin(); setActivePage('home'); }}
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> Admin Access
          </button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Or sign in with email</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-medium">
            {error}
          </div>
        )}

        {forgotMsg && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 font-medium">
            {forgotMsg}
          </div>
        )}

        {forgotMode ? (
          <form onSubmit={handleForgot} className="space-y-4">
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
                  className="w-full rounded-xl bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white border border-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
            >
              Send Password Reset Link
            </button>
            <button
              type="button"
              onClick={() => setForgotMode(false)}
              className="w-full text-center text-xs text-slate-400 hover:text-white mt-2 block"
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full rounded-xl bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white border border-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white border border-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" /> {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={() => setActivePage('register')}
            className="font-bold text-indigo-400 hover:underline"
          >
            Create free account
          </button>
        </div>

      </div>
    </div>
  );
};
