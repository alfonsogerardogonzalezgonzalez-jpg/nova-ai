import React from 'react';
import { AppMode } from '../types';

export type MascotState = 'happy' | 'thinking' | 'investigating' | 'eco' | 'curious';

interface MascotRobotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  state?: MascotState;
  mode?: AppMode;
  ecoMode?: boolean;
  speechText?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Modern NOVA AI Holographic Core Visualizer
 * Professional, elegant visual identity: Stylized 'N' in electric blue & violet on dark blue.
 * Zero robots, zero cartoon mascots, zero childish smileys.
 */
export const MascotRobot: React.FC<MascotRobotProps> = ({
  size = 'md',
  state = 'happy',
  mode = 'nino',
  ecoMode = false,
  speechText,
  onClick,
  className = '',
}) => {
  const resolvedState = ecoMode ? 'eco' : state;

  const sizeDimensions = {
    sm: 'w-9 h-9',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
  };

  // Modern state accent colors
  let accentColor = '#38BDF8'; // Electric blue default
  let glowColor = 'rgba(56, 189, 248, 0.35)';
  let stateLabel = mode === 'nino' ? 'Modo Joven' : 'Modo Adulto';
  let badgeBg = 'bg-blue-950/80 text-sky-300 border-blue-500/40';

  if (resolvedState === 'eco') {
    accentColor = '#34D399';
    glowColor = 'rgba(52, 211, 153, 0.35)';
    stateLabel = 'Modo Eco Activo';
    badgeBg = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
  } else if (resolvedState === 'investigating') {
    accentColor = '#A78BFA';
    glowColor = 'rgba(167, 139, 250, 0.4)';
    stateLabel = 'Investigación';
    badgeBg = 'bg-violet-950/80 text-purple-300 border-violet-500/40';
  } else if (resolvedState === 'thinking') {
    accentColor = '#60A5FA';
    glowColor = 'rgba(96, 165, 250, 0.4)';
    stateLabel = 'Procesando...';
    badgeBg = 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40';
  }

  // Small avatar version for chat bubbles
  if (size === 'sm') {
    return (
      <div className={`relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#0B132B] via-[#070B19] to-[#040711] p-[1px] border border-blue-500/40 shadow-md shadow-black/50 flex items-center justify-center shrink-0 ${className}`}>
        <div className="absolute inset-0 rounded-xl bg-blue-500/10" />
        <svg viewBox="0 0 512 512" className="w-[78%] h-[78%] relative z-10" fill="none">
          <defs>
            <linearGradient id="smBlue" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#00D2FF" />
            </linearGradient>
            <linearGradient id="smDiag" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <linearGradient id="smViolet" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
          </defs>
          <path d="M 126 390 L 126 142 C 126 124, 140 110, 158 110 L 178 110 C 196 110, 210 124, 210 142 L 210 390 C 210 408, 196 422, 178 422 L 158 422 C 140 422, 126 408, 126 390 Z" fill="url(#smBlue)" />
          <path d="M 302 370 L 302 122 C 302 104, 316 90, 334 90 L 354 90 C 372 90, 386 104, 386 122 L 386 370 C 386 388, 372 402, 354 402 L 334 402 C 316 402, 302 388, 302 370 Z" fill="url(#smViolet)" />
          <path d="M 142 114 C 160 114, 186 124, 204 146 L 350 364 C 362 380, 370 392, 386 400 C 370 410, 342 410, 324 394 L 168 166 C 152 144, 144 130, 142 114 Z" fill="url(#smDiag)" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Speech / Status Callout */}
      {speechText && (
        <div className="relative mb-3 max-w-sm px-4 py-2.5 rounded-2xl bg-gradient-to-br from-[#0F172A]/95 via-[#1E1B4B]/80 to-[#0A0F1D]/95 border border-blue-500/30 text-slate-100 shadow-xl shadow-blue-950/40 backdrop-blur-md text-xs sm:text-sm">
          <p className="leading-snug text-slate-200">{speechText}</p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-indigo-950" />
        </div>
      )}

      {/* Modern Holographic 'N' Core Container */}
      <div
        onClick={onClick}
        className={`relative ${sizeDimensions[size]} cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group flex items-center justify-center`}
        title="NOVA AI - Identidad Inteligente"
      >
        {/* Ambient atmospheric aura */}
        <div
          className="absolute inset-0 rounded-3xl blur-2xl transition-all duration-500 opacity-60 group-hover:opacity-90"
          style={{ backgroundColor: glowColor }}
        />

        {/* Outer Orbital Rings (Futuristic & Minimalist) */}
        <div className="absolute inset-[-6px] rounded-3xl border border-blue-500/20 animate-spin-slow pointer-events-none" />
        <div className="absolute inset-[-14px] rounded-full border border-violet-500/10 pointer-events-none" />

        {/* Deep Dark Blue Core Vessel */}
        <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#070B19] to-[#040711] p-[2px] border border-blue-500/40 shadow-2xl shadow-black/80 flex items-center justify-center overflow-hidden">
          {/* Subtle geometric grid backdrop */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:8px_8px]" />

          {/* Central Stylized 'N' Minimalist Glyph */}
          <svg viewBox="0 0 512 512" className="w-[74%] h-[74%] relative z-10" fill="none">
            <defs>
              <linearGradient id="coreBlue" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1D4ED8" />
                <stop offset="50%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#00D2FF" />
              </linearGradient>

              <linearGradient id="coreDiag" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="30%" stopColor="#3B82F6" />
                <stop offset="70%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>

              <linearGradient id="coreViolet" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6D28D9" />
                <stop offset="50%" stopColor="#9333EA" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>
            </defs>

            {/* Left Pillar */}
            <path
              d="M 126 390 L 126 142 C 126 124, 140 110, 158 110 L 178 110 C 196 110, 210 124, 210 142 L 210 390 C 210 408, 196 422, 178 422 L 158 422 C 140 422, 126 408, 126 390 Z"
              fill="url(#coreBlue)"
            />
            <path d="M 142 142 L 142 390" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" opacity="0.45" />

            {/* Right Pillar */}
            <path
              d="M 302 370 L 302 122 C 302 104, 316 90, 334 90 L 354 90 C 372 90, 386 104, 386 122 L 386 370 C 386 388, 372 402, 354 402 L 334 402 C 316 402, 302 388, 302 370 Z"
              fill="url(#coreViolet)"
            />
            <path d="M 370 122 L 370 370" stroke="#E879F9" strokeWidth="4" strokeLinecap="round" opacity="0.45" />

            {/* Dynamic Diagonal Ribbon */}
            <path
              d="M 142 114 C 160 114, 186 124, 204 146 L 350 364 C 362 380, 370 392, 386 400 C 370 410, 342 410, 324 394 L 168 166 C 152 144, 144 130, 142 114 Z"
              fill="url(#coreDiag)"
            />

            {/* Vertex Nodes */}
            <circle cx="176" cy="148" r="9" fill="#38BDF8" />
            <circle cx="340" cy="368" r="9" fill="#C084FC" />
            <path d="M 186 160 L 334 358" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
          </svg>
        </div>

        {/* Elegant status tag at bottom */}
        <div className="absolute -bottom-2.5 z-20 flex items-center justify-center">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-md ${badgeBg}`}>
            {stateLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
