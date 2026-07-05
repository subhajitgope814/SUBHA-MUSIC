import React from 'react';

interface SubhaMusicLogoProps {
  variant?: 'full' | 'compact' | 'badge' | 'splash';
  className?: string;
}

export const SubhaMusicLogo: React.FC<SubhaMusicLogoProps> = ({ variant = 'full', className = '' }) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        {/* Glowing Headphone Circular Ring */}
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF007F] via-[#9B51E0] to-[#00F2FE] p-[2px] shadow-[0_0_15px_rgba(255,0,127,0.5)]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950">
            {/* Mini Headphone & Note SVG */}
            <svg viewBox="0 0 40 40" className="h-6 w-6">
              <defs>
                <linearGradient id="gradLogoCompact" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF007F" />
                  <stop offset="50%" stopColor="#9B51E0" />
                  <stop offset="100%" stopColor="#00F2FE" />
                </linearGradient>
              </defs>
              {/* Headphone arch */}
              <path d="M 8 22 A 12 12 0 0 1 32 22" fill="none" stroke="url(#gradLogoCompact)" strokeWidth="2.5" strokeLinecap="round" />
              {/* Left Earcup */}
              <rect x="5" y="20" width="5" height="9" rx="2.5" fill="#FF007F" />
              {/* Right Earcup */}
              <rect x="30" y="20" width="5" height="9" rx="2.5" fill="#00F2FE" />
              {/* Note inside */}
              <path d="M 18 25 L 18 13 L 26 15 L 26 23 M 18 13 L 26 15" fill="none" stroke="url(#gradLogoCompact)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="16.5" cy="25" r="2.5" fill="#FF007F" />
              <circle cx="24.5" cy="23" r="2.5" fill="#00F2FE" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-widest text-white uppercase font-sans flex items-center gap-1">
            SUBHA<span className="inline-block h-2 w-2 rotate-45 bg-[#FF007F] rounded-[1px]"></span>
          </span>
          <span className="text-[9px] font-bold tracking-[0.25em] bg-gradient-to-r from-[#FF007F] to-[#00F2FE] bg-clip-text text-transparent uppercase">
            Feel The Music
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'splash') {
    return (
      <div className={`flex flex-col items-center justify-center text-center ${className}`}>
        {/* Large Circular Glowing Ring */}
        <div className="relative flex h-48 w-48 sm:h-56 sm:w-56 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF007F] via-[#9B51E0] to-[#00F2FE] p-[3px] shadow-[0_0_50px_rgba(255,0,127,0.6)] animate-pulse" style={{ animationDuration: '4s' }}>
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-950 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#FF007F]/10 to-[#00F2FE]/10 rounded-full pointer-events-none" />
            
            {/* Detailed Headphone & Waveform Graphic */}
            <svg viewBox="0 0 100 100" className="h-28 w-28 drop-shadow-[0_0_10px_rgba(0,242,254,0.5)]">
              <defs>
                <linearGradient id="gradLogoSplash" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF007F" />
                  <stop offset="50%" stopColor="#9B51E0" />
                  <stop offset="100%" stopColor="#00F2FE" />
                </linearGradient>
              </defs>
              {/* Headphone Arch */}
              <path d="M 20 52 A 30 30 0 0 1 80 52" fill="none" stroke="url(#gradLogoSplash)" strokeWidth="6" strokeLinecap="round" />
              {/* Left Earcup */}
              <rect x="14" y="46" width="11" height="22" rx="5.5" fill="#FF007F" className="drop-shadow-[0_0_8px_#FF007F]" />
              {/* Right Earcup */}
              <rect x="75" y="46" width="11" height="22" rx="5.5" fill="#00F2FE" className="drop-shadow-[0_0_8px_#00F2FE]" />
              {/* Musical Note */}
              <path d="M 44 58 L 44 32 L 64 36 L 64 54 M 44 32 L 64 36" fill="none" stroke="url(#gradLogoSplash)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="40" cy="58" r="6" fill="#FF007F" />
              <circle cx="60" cy="54" r="6" fill="#00F2FE" />
              
              {/* Equalizer Waveform */}
              <g className="opacity-90">
                <rect x="28" y="72" width="3" height="8" rx="1.5" fill="#FF007F" />
                <rect x="34" y="68" width="3" height="14" rx="1.5" fill="#FF007F" />
                <rect x="40" y="65" width="3.5" height="19" rx="1.75" fill="url(#gradLogoSplash)" />
                <rect x="46" y="62" width="3.5" height="24" rx="1.75" fill="url(#gradLogoSplash)" />
                <rect x="52" y="65" width="3.5" height="19" rx="1.75" fill="url(#gradLogoSplash)" />
                <rect x="58" y="68" width="3" height="14" rx="1.5" fill="#00F2FE" />
                <rect x="64" y="72" width="3" height="8" rx="1.5" fill="#00F2FE" />
              </g>
            </svg>
          </div>
        </div>

        {/* Text Wordmark */}
        <div className="mt-6 flex flex-col items-center">
          <div className="text-4xl sm:text-5xl font-black tracking-widest text-white uppercase flex items-center gap-1.5 drop-shadow-md">
            SUBHA<span className="inline-block h-3.5 w-3.5 rotate-45 bg-[#FF007F] rounded-[2px] shadow-[0_0_10px_#FF007F]"></span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm sm:text-base font-extrabold tracking-[0.35em] bg-gradient-to-r from-[#FF007F] via-[#9B51E0] to-[#00F2FE] bg-clip-text text-transparent uppercase">
            <span>—</span> MUSIC <span>—</span>
          </div>
          <p className="mt-2 text-xs sm:text-sm font-bold tracking-[0.25em] text-slate-300 uppercase">
            • Feel The Music •
          </p>
        </div>
      </div>
    );
  }

  // Default 'full' variant
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF007F] via-[#9B51E0] to-[#00F2FE] p-[2px] shadow-[0_0_20px_rgba(255,0,127,0.4)]">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 p-2">
          <svg viewBox="0 0 100 100" className="h-16 w-16">
            <defs>
              <linearGradient id="gradLogoFull" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF007F" />
                <stop offset="50%" stopColor="#9B51E0" />
                <stop offset="100%" stopColor="#00F2FE" />
              </linearGradient>
            </defs>
            <path d="M 20 52 A 30 30 0 0 1 80 52" fill="none" stroke="url(#gradLogoFull)" strokeWidth="6" strokeLinecap="round" />
            <rect x="14" y="46" width="11" height="22" rx="5.5" fill="#FF007F" />
            <rect x="75" y="46" width="11" height="22" rx="5.5" fill="#00F2FE" />
            <path d="M 44 58 L 44 32 L 64 36 L 64 54 M 44 32 L 64 36" fill="none" stroke="url(#gradLogoFull)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="40" cy="58" r="6" fill="#FF007F" />
            <circle cx="60" cy="54" r="6" fill="#00F2FE" />
            <g>
              <rect x="34" y="68" width="3" height="12" rx="1.5" fill="#FF007F" />
              <rect x="40" y="64" width="3.5" height="18" rx="1.75" fill="url(#gradLogoFull)" />
              <rect x="46" y="61" width="3.5" height="22" rx="1.75" fill="url(#gradLogoFull)" />
              <rect x="52" y="64" width="3.5" height="18" rx="1.75" fill="url(#gradLogoFull)" />
              <rect x="58" y="68" width="3" height="12" rx="1.5" fill="#00F2FE" />
            </g>
          </svg>
        </div>
      </div>
      <div className="mt-2 flex flex-col items-center">
        <span className="text-xl font-black tracking-widest text-white uppercase flex items-center gap-1">
          SUBHA<span className="inline-block h-2 w-2 rotate-45 bg-[#FF007F] rounded-[1px]"></span>
        </span>
        <span className="text-[10px] font-extrabold tracking-[0.2em] bg-gradient-to-r from-[#FF007F] to-[#00F2FE] bg-clip-text text-transparent uppercase">
          — MUSIC —
        </span>
      </div>
    </div>
  );
};
