import React from 'react';
import { SubhaMusicLogo } from './SubhaMusicLogo.js';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950 p-6 sm:p-10 overflow-hidden select-none">
      {/* Background Ambient Glows & Water Droplet Simulation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#FF007F]/25 via-[#9B51E0]/20 to-[#00F2FE]/25 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-10 left-10 h-[300px] w-[300px] rounded-full bg-[#9B51E0]/20 blur-[100px]" />
        <div className="absolute top-1/3 right-10 h-[350px] w-[350px] rounded-full bg-[#00F2FE]/15 blur-[100px]" />
        
        {/* Subtle decorative floating particles / droplets */}
        <div className="absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-[#00F2FE]/60 blur-[1px] animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/4 h-3 w-3 rounded-full bg-[#FF007F]/60 blur-[1px] animate-bounce" style={{ animationDuration: '4.5s' }} />
        <div className="absolute bottom-1/3 left-1/3 h-1.5 w-1.5 rounded-full bg-white/50 blur-[1px]" />
      </div>

      {/* Top Section with Custom SUBHA MUSIC Logo */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-6">
        <SubhaMusicLogo variant="splash" />
      </div>

      {/* Bottom Glassmorphic Card (Matching Mockup Screen 1) */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-2xl p-8 text-center shadow-2xl shadow-black/80 ring-1 ring-white/5 transition duration-500 hover:border-white/20">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
          Feel the beat, own the moment
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
          Immerse yourself into the vibrant world of music today
        </p>

        <button
          onClick={onContinue}
          className="mt-8 w-full rounded-2xl bg-gradient-to-r from-[#9B51E0] via-[#8A2BE2] to-[#4B0082] py-4 text-base font-bold text-white shadow-xl shadow-purple-600/40 transition duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-95 border border-purple-400/30"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
