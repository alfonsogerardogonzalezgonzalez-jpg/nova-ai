import React from 'react';

interface NovaIconMarkProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
}

export const NovaIconMark: React.FC<NovaIconMarkProps> = ({
  className = '',
  size = 'md',
  showGlow = true,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`relative shrink-0 flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Dynamic ambient backlight */}
      {showGlow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600/40 via-indigo-600/30 to-violet-600/40 blur-md pointer-events-none transition-all group-hover:blur-lg" />
      )}

      {/* Deep Dark Blue Squircle Vessel */}
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#070B19] to-[#040711] p-[1.5px] border border-blue-500/30 shadow-lg shadow-black/60 flex items-center justify-center overflow-hidden">
        {/* Subtle radial ambient reflection */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(56,189,248,0.18),transparent_70%)]" />

        {/* Minimalist Stylized 'N' SVG */}
        <svg
          viewBox="0 0 512 512"
          className="w-[82%] h-[82%] relative z-10 transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="markElectricBlue" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1D4ED8" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#00D2FF" />
            </linearGradient>

            <linearGradient id="markDiagonal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="30%" stopColor="#3B82F6" />
              <stop offset="70%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>

            <linearGradient id="markElectricViolet" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6D28D9" />
              <stop offset="50%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
          </defs>

          {/* Left Pillar (Electric Blue) */}
          <path
            d="M 126 390 L 126 142 C 126 124, 140 110, 158 110 L 178 110 C 196 110, 210 124, 210 142 L 210 390 C 210 408, 196 422, 178 422 L 158 422 C 140 422, 126 408, 126 390 Z"
            fill="url(#markElectricBlue)"
          />
          {/* Specular line */}
          <path d="M 142 142 L 142 390" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" opacity="0.45" />

          {/* Right Pillar (Electric Violet) */}
          <path
            d="M 302 370 L 302 122 C 302 104, 316 90, 334 90 L 354 90 C 372 90, 386 104, 386 122 L 386 370 C 386 388, 372 402, 354 402 L 334 402 C 316 402, 302 388, 302 370 Z"
            fill="url(#markElectricViolet)"
          />
          {/* Specular line */}
          <path d="M 370 122 L 370 370" stroke="#E879F9" strokeWidth="4" strokeLinecap="round" opacity="0.45" />

          {/* Dynamic Diagonal Ribbon */}
          <path
            d="M 142 114 C 160 114, 186 124, 204 146 L 350 364 C 362 380, 370 392, 386 400 C 370 410, 342 410, 324 394 L 168 166 C 152 144, 144 130, 142 114 Z"
            fill="url(#markDiagonal)"
          />

          {/* Vertex accent dots */}
          <circle cx="176" cy="148" r="9" fill="#38BDF8" />
          <circle cx="340" cy="368" r="9" fill="#C084FC" />
          <path d="M 186 160 L 334 358" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
};

interface NovaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const NovaLogo: React.FC<NovaLogoProps> = ({ size = 'md', showSubtitle = false }) => {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3.5xl',
  };

  const markSize = size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg';

  return (
    <div className="flex items-center gap-2.5 select-none group">
      {/* Stylized 'N' Minimalist Emblem */}
      <NovaIconMark size={markSize} />

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent font-['Plus_Jakarta_Sans'] ${textSizes[size]}`}
          >
            NOVA
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-sm shadow-blue-500/30 border border-blue-400/30">
            AI
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] font-medium text-slate-400 tracking-wide mt-0.5">
            Inteligencia verificable para jóvenes y adultos
          </span>
        )}
      </div>
    </div>
  );
};
